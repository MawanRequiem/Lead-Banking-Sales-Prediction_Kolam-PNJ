import os
import logging
import secrets
import joblib
import pandas as pd
import datetime as dt
import re
from decimal import Decimal
from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import ORJSONResponse
from pydantic import BaseModel, Field
from typing import Optional

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

# Import Feature Engineering
from prediction_feature_engineering import apply_feature_engineering

# ==============================
# FASTAPI APP
# ==============================
async def lifespan(app: FastAPI):
    load_artifacts()
    yield

app = FastAPI(default_response_class=ORJSONResponse, lifespan=lifespan)

# ==============================
# PAYLOAD & LOGIC (UPDATED)
# ==============================
class NasabahPayload(BaseModel):
    umur: int = Field(..., gt=0, lt=120)
    pekerjaan: str = "unknown"
    pendidikan: str = "unknown"
    status_pernikahan: str = "single"
    saldo: float = 0.0

    has_kpr: bool = False
    has_pinjaman: bool = False
    has_defaulted: bool = False

    last_call_date: Optional[dt.datetime] = None
    campaign: int = 0
    previous: int = 0
    pdays: int = -1
    poutcome: str = "unknown"

    nomor_telepon: Optional[str] = None

def detect_contact_type(nomor: str | None) -> str:
    if not nomor:
        return "unknown"

    nomor = nomor.replace(" ", "").replace("-", "")

    # Mobile phone (HP) - dimulai 08 atau +628
    if re.match(r"^(?:\+?628|08)\d+$", nomor):
        return "cellular"

    # Landline (Telepon rumah/kantor) - dimulai 02 sampai 09
    if re.match(r"^0[2-9]\d{7,11}$", nomor):
        return "telephone"

    return "unknown"

def prepare_features(data: NasabahPayload) -> pd.DataFrame:
    # Mapping input user ke format training model
    job_map = {
        "PNS": "admin.", "Wiraswasta": "entrepreneur", "Ibu Rumah Tangga": "housemaid",
        "Manager": "management", "Pensiunan": "retired", "Mahasiswa": "student",
        "Buruh": "blue-collar", "Tidak Bekerja": "unemployed"
    }
    marital_map = {
        "MENIKAH": "married", "BELUM MENIKAH": "single",
        "CERAI-HIDUP": "divorced", "CERAI-MATI": "divorced",
        "Menikah": "married", "Belum Menikah": "single", "Cerai": "divorced" # Fallback
    }
    education_map = {
        "SD": "primary", "SMP": "secondary", "SMA": "secondary",
        "S1": "tertiary", "S2": "tertiary", "S3": "tertiary",
    }
    poutcome_map = {
        "TERTARIK": "success", "TIDAK TERTARIK": "failure",
    }

    contact_type = detect_contact_type(data.nomor_telepon)

    # Date handling
    day = 15
    month = "may"
    if data.last_call_date:
        day = data.last_call_date.day
        month = data.last_call_date.strftime("%b").lower()

    IDR_TO_EUR_RATE = 14000  # fixed, era 2008–2010

    saldo_idr = float(data.saldo) if isinstance(data.saldo, (int, float, Decimal)) else 0.0
    saldo_eur = saldo_idr / IDR_TO_EUR_RATE # Menyesuaikan ke data training asli dalam Euro

    df_raw = pd.DataFrame([{
        "age": data.umur,
        "job": job_map.get(data.pekerjaan, "unknown"),
        "marital": marital_map.get(data.status_pernikahan, "single"),
        "balance": saldo_eur,
        "education": education_map.get(data.pendidikan, "unknown"),
        "default": "yes" if data.has_defaulted else "no",
        "housing": "yes" if data.has_kpr else "no",
        "loan": "yes" if data.has_pinjaman else "no",
        "contact": contact_type,
        "day": day,
        "month": month,
        "campaign": data.campaign,
        "pdays": data.pdays,
        "previous": data.previous,
        "poutcome": poutcome_map.get(data.poutcome, "unknown")
    }])

    # Apply FE from external file
    df_fe = apply_feature_engineering(df_raw)
    return df_fe

# ==============================
# API ENDPOINT
# ==============================
@app.middleware("http")
async def security_middleware(request: Request, call_next):
    if request.url.path == "/health":
        return await call_next(request)
    token = request.headers.get("x-token") or ""
    if not secrets.compare_digest(token, API_SECRET):
        return ORJSONResponse(status_code=401, content={"error": "Unauthorized"})
    return await call_next(request)

@app.post("/predict")
def predict(payload: NasabahPayload):
    if model is None or preprocessor is None:
        raise HTTPException(status_code=503, detail="Model not initialized")

    try:
        features = prepare_features(payload)
        X_prepared = preprocessor.transform(features)
        probability = model.predict_proba(X_prepared)[0, 1]

        # Skor 0.0 - 1.0 (sesuai request database schema baru)
        # Jika masih ingin range 1-10 untuk display UI, silakan sesuaikan di FE

        return {
            "status": "success",
            "prob_subscription": float(round(probability, 4)),
            "score_prediksi": float(probability) # Sesuai kolom DB skor_prediksi (0-1)
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
