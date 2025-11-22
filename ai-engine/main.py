import os
import logging
import secrets
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import ORJSONResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup Logger
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)
logger = logging.getLogger("ai-api")

API_SECRET = os.getenv("AI_SERVICE_SECRET", "default_secret")
MODEL_PATH = "bank_deposit_recommender_bundle.pkl"

model = None

# Lifecycle: Load model saat startup
async def lifespan(app: FastAPI):
    global model
    try:
        if os.path.exists(MODEL_PATH):
            logger.info(f"Loading model from {MODEL_PATH}...")
            bundle = joblib.load(MODEL_PATH)
            # Asumsi struktur pickle Anda adalah dictionary {'model_cat': model_obj}
            # Jika pickle Anda langsung model object, ganti baris bawah jadi: model = bundle
            model = bundle.get('model_cat') if isinstance(bundle, dict) and 'model_cat' in bundle else bundle
            logger.info("Model loaded successfully")
        else:
            logger.critical(f"Model file not found at {MODEL_PATH}")
    except Exception as e:
        logger.critical(f"Failed to load model: {e}")
    yield
    model = None

app = FastAPI(default_response_class=ORJSONResponse, lifespan=lifespan)

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

    # Security: Constant-time comparison untuk mencegah Timing Attack
    if not secrets.compare_digest(token, API_SECRET):
        return ORJSONResponse(status_code=401, content={"error": "Unauthorized"})

    return await call_next(request)

def prepare_features(data: NasabahPayload):
    # Mapping input user ke format training model
    job_map = {
        "PNS": "admin.", "Wiraswasta": "entrepreneur", "Ibu Rumah Tangga": "housemaid",
        "Manager": "management", "Pensiunan": "retired", "Mahasiswa": "student",
        "Buruh": "blue-collar", "Tidak Bekerja": "unemployed"
    }
    marital_map = { "Menikah": "married", "Belum Menikah": "single", "Cerai": "divorced" }

    return pd.DataFrame([{
        "age": data.umur,
        "job": job_map.get(data.pekerjaan, "unknown"),
        "marital": marital_map.get(data.status_pernikahan, "single"),
        "balance": data.gaji * 5, # Estimasi balance dari gaji
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

@app.post("/predict")
def predict(payload: NasabahPayload):
    # Catatan: Jangan gunakan 'async def' untuk CPU-bound task seperti model ML
    if not model:
        raise HTTPException(status_code=503, detail="Model not initialized")

    try:
        features = prepare_features(payload)
        # Ambil probabilitas kelas 1 (Deposit)
        probability = model.predict_proba(features)[0][1]

        return {
            "status": "success",
            "score": float(probability)
        }
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail="Prediction failed")

@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": model is not None}
