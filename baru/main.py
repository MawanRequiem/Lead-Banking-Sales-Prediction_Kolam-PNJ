import os
import logging
import secrets
import joblib
import pandas as pd
import datetime as dt
from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import ORJSONResponse
from pydantic import BaseModel, Field

# ==============================
# ENV & LOGGER
# ==============================
load_dotenv()

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)
logger = logging.getLogger("ai-api")

API_SECRET = os.getenv("AI_SERVICE_SECRET", "default_secret")

BUNDLE_PATH = "bank_deposit_recommender_bundle.pkl"
PREPROCESSOR_PATH = "preprocessor.pkl"
MODEL_PATH = "model.pkl"

preprocessor = None
model = None

# ==============================
# COMMON: LOAD ARTIFACTS
# ==============================
def load_artifacts():
    """
    Load preprocessor & model ke global variable.
    Support 2 mode:
    1) Bundle pkl: {'preprocessor': ..., 'model_cat': ...} atau {'preprocessor': ..., 'model': ...}
    2) File terpisah: preprocessor.pkl + model.pkl
    """
    global preprocessor, model

    if os.path.exists(BUNDLE_PATH):
        try:
            logger.info(f"Loading bundle from {BUNDLE_PATH}...")
            bundle = joblib.load(BUNDLE_PATH)

            if isinstance(bundle, dict):
                preprocessor = bundle.get("preprocessor", None)
                model = bundle.get("model_cat") or bundle.get("model")
            else:
                model = bundle
                preprocessor = joblib.load(PREPROCESSOR_PATH) if os.path.exists(PREPROCESSOR_PATH) else None

            logger.info("Bundle loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load bundle: {e}")

    if preprocessor is None and os.path.exists(PREPROCESSOR_PATH):
        logger.info(f"Loading preprocessor from {PREPROCESSOR_PATH}...")
        preprocessor = joblib.load(PREPROCESSOR_PATH)

    if model is None and os.path.exists(MODEL_PATH):
        logger.info(f"Loading model from {MODEL_PATH}...")
        model = joblib.load(MODEL_PATH)

    if preprocessor is None or model is None:
        logger.critical("Failed to initialize preprocessor/model. Check your .pkl files!")
    else:
        logger.info("Artifacts initialized successfully")


# ==============================
# IMPORT FEATURE ENGINEERING
# ==============================
from prediction_feature_engineering import apply_feature_engineering


# ==============================
# FASTAPI APP + LIFESPAN
# ==============================
async def lifespan(app: FastAPI):
    load_artifacts()
    yield

app = FastAPI(default_response_class=ORJSONResponse, lifespan=lifespan)


# ==============================
# PAYLOAD & SECURITY
# ==============================
class NasabahPayload(BaseModel):
    umur: int = Field(..., gt=0, lt=120)
    pekerjaan: str = "unknown"
    gaji: float = 0.0
    status_pernikahan: str = "single"


@app.middleware("http")
async def security_middleware(request: Request, call_next):
    if request.url.path == "/health":
        return await call_next(request)

    token = request.headers.get("x-token") or ""

    if not secrets.compare_digest(token, API_SECRET):
        return ORJSONResponse(status_code=401, content={"error": "Unauthorized"})

    return await call_next(request)


# ==============================
# PREPARE FEATURES UNTUK 1 NASABAH
# ==============================
def prepare_features(payload: NasabahPayload) -> pd.DataFrame:
    job_map = {
        "PNS": "admin.", "Wiraswasta": "entrepreneur", "Ibu Rumah Tangga": "housemaid",
        "Manager": "management", "Pensiunan": "retired", "Mahasiswa": "student",
        "Buruh": "blue-collar", "Tidak Bekerja": "unemployed"
    }
    marital_map = {
        "Menikah": "married",
        "Belum Menikah": "single",
        "Cerai": "divorced"
    }

    df_raw = pd.DataFrame([{
        "age": payload.umur,
        "job": job_map.get(payload.pekerjaan, "unknown"),
        "marital": marital_map.get(payload.status_pernikahan, "single"),
        "balance": payload.gaji * 5, 
        "education": "secondary",
        "default": "no",
        "housing": "yes",
        "loan": "no",
        "contact": "cellular",
        "day": 15,
        "month": "may",
        "duration": 0,
        "campaign": 1,
        "pdays": -1,
        "previous": 0,
        "poutcome": "unknown"
    }])

    df_fe = apply_feature_engineering(df_raw)
    return df_fe


# ==============================
# API ENDPOINT: PREDICT SATU NASABAH
# ==============================
@app.post("/predict")
def predict(payload: NasabahPayload):
    if model is None or preprocessor is None:
        raise HTTPException(status_code=503, detail="Model not initialized")

    try:
        features = prepare_features(payload)
        X_prepared = preprocessor.transform(features)
        probability = model.predict_proba(X_prepared)[0, 1]

        # score ala batch: 1–10
        score = (1 + probability * 9)

        return {
            "status": "success",
            "prob_subscription": float(round(probability, 3)),
            "score": float(round(score, 3))
        }
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail="Prediction failed")


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": (model is not None),
        "preprocessor_loaded": (preprocessor is not None)
    }


# ==============================
# BATCH PIPELINE (PY 1) SEBAGAI FUNGSI
# ==============================
def get_priority_level(p):
    if p >= 0.7:
        return "HIGH"
    elif p >= 0.4:
        return "MEDIUM"
    else:
        return "LOW"


def build_recommendation(df_raw: pd.DataFrame) -> pd.DataFrame:
    """
    Replikasi logika py 1: FE → preprocess → predict → ranking.
    """
    if model is None or preprocessor is None:
        raise RuntimeError("Model/preprocessor belum diload. Panggil load_artifacts() dulu.")

    logger.info("Applying feature engineering (batch)...")
    df_fe = apply_feature_engineering(df_raw)

    X = df_fe.copy()
    logger.info("Transforming (batch)...")
    X_prepared = preprocessor.transform(X)

    logger.info("Predicting (batch)...")
    proba = model.predict_proba(X_prepared)[:, 1]

    df_rekom = df_raw.copy()
    df_rekom["prob_subscription"] = proba.round(3)
    df_rekom["score"] = (1 + proba * 9).round(3)
    df_rekom = df_rekom.sort_values("prob_subscription", ascending=False).reset_index(drop=True)
    df_rekom["global_rank"] = df_rekom.index + 1
    df_rekom["priority_level"] = df_rekom["prob_subscription"].apply(get_priority_level)

    return df_rekom


def get_daily_recommendation(df_sorted: pd.DataFrame, date_str: str, calls_per_day: int = 200) -> pd.DataFrame:
    n = len(df_sorted)
    base_date = dt.date(2025, 1, 1)
    target_date = pd.to_datetime(date_str).date()

    day_offset = (target_date - base_date).days
    start_idx = (day_offset * calls_per_day) % n
    end_idx = start_idx + calls_per_day

    if end_idx <= n:
        df_day = df_sorted.iloc[start_idx:end_idx].copy()
    else:
        part1 = df_sorted.iloc[start_idx:]
        part2 = df_sorted.iloc[:end_idx - n]
        df_day = pd.concat([part1, part2]).copy()

    df_day = df_day.reset_index(drop=True)
    df_day["daily_rank"] = df_day.index + 1
    return df_day


# ==============================
# OPTIONAL: ENDPOINT UNTUK BATCH HARIAN
# ==============================
@app.get("/daily_recommendation")
def daily_recommendation(date: str = "2025-01-01", calls_per_day: int = 200):
    """
    Contoh endpoint: generate rekomendasi harian dari file bank-full.csv
    dan return top N dalam JSON (tidak tulis CSV).
    """
    if model is None or preprocessor is None:
        raise HTTPException(status_code=503, detail="Model not initialized")

    if not os.path.exists("bank-full.csv"):
        raise HTTPException(status_code=500, detail="bank-full.csv not found")

    try:
        df_raw = pd.read_csv("bank-full.csv", sep=";")
        df_rekom = build_recommendation(df_raw)
        df_day = get_daily_recommendation(df_rekom, date_str=date, calls_per_day=calls_per_day)

        top_n = df_day.head(50).to_dict(orient="records")
        return {
            "status": "success",
            "date": date,
            "calls_per_day": calls_per_day,
            "count": len(top_n),
            "data": top_n
        }
    except Exception as e:
        logger.error(f"Daily recommendation error: {e}")
        raise HTTPException(status_code=500, detail="Daily recommendation failed")


# ==============================
# CLI MODE (JALANKAN SEPERTI PY 1)
# ==============================
if __name__ == "__main__":
    # Mode: script biasa → bikin CSV rekomendasi + harian
    logging.getLogger("uvicorn").setLevel(logging.WARNING)

    print("Loading artifacts for CLI...")
    load_artifacts()
    if preprocessor is None or model is None:
        raise SystemExit("Gagal load model/preprocessor. Cek file .pkl.")

    print("Loading new data (bank-full.csv)...")
    df_raw = pd.read_csv("bank-full.csv", sep=";")

    print("Building full recommendation...")
    df_rekom = build_recommendation(df_raw)

    os.makedirs("output", exist_ok=True)
    df_rekom.to_csv("output/customer_recommendations.csv", index=False)
    print("✓ Saved: output/customer_recommendations.csv")

    target_date = "2025-01-01"
    print(f"Building daily recommendation for {target_date}...")
    df_day = get_daily_recommendation(df_rekom, target_date)
    df_day.to_csv(f"output/recommendations_{target_date}.csv", index=False)
    print(f"✓ Saved: output/recommendations_{target_date}.csv")
