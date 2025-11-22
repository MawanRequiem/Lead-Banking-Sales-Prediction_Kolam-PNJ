import os
import joblib
import pandas as pd
import logging
from fastapi import FastAPI, HTTPException, Header, Request
from fastapi.responses import ORJSONResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai-engine")

API_SECRET = os.getenv("AI_SERVICE_SECRET", "default_secret")
MODEL_PATH = "bank_deposit_recommender_bundle.pkl"

model = None

# Load model on startup
try:
    if os.path.exists(MODEL_PATH):
        bundle = joblib.load(MODEL_PATH)
        model = bundle.get('model_cat')
        logger.info("Model loaded successfully")
    else:
        logger.warning(f"Model file not found at {MODEL_PATH}")
except Exception as e:
    logger.critical(f"Failed to load model: {e}")

class NasabahPayload(BaseModel):
    umur: int = Field(..., gt=0, lt=120)
    pekerjaan: str = "unknown"
    gaji: float = 0.0
    status_pernikahan: str = "single"

app = FastAPI(default_response_class=ORJSONResponse)

@app.middleware("http")
async def security_middleware(request: Request, call_next):
    if request.url.path == "/health":
        return await call_next(request)

    token = request.headers.get("x-token")
    if token != API_SECRET:
        return ORJSONResponse(status_code=401, content={"error": "Unauthorized"})

    return await call_next(request)

def mock_features(data: NasabahPayload) -> pd.DataFrame:
    # Map jobs to model categories
    job_map = {
        "PNS": "admin.", "Wiraswasta": "entrepreneur", "Ibu Rumah Tangga": "housemaid",
        "Manager": "management", "Pensiunan": "retired", "Mahasiswa": "student",
        "Buruh": "blue-collar", "Tidak Bekerja": "unemployed"
    }

    marital_map = { "Menikah": "married", "Belum Menikah": "single", "Cerai": "divorced" }

    input_data = {
        "age": data.umur,
        "job": job_map.get(data.pekerjaan, "unknown"),
        "marital": marital_map.get(data.status_pernikahan, "single"),
        "balance": data.gaji * 5, # Estimate balance based on salary
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
    }

    return pd.DataFrame([input_data])

@app.post("/predict")
async def predict(payload: NasabahPayload):
    if not model:
        raise HTTPException(status_code=503, detail="Model not initialized")

    try:
        features = mock_features(payload)
        # Predict probability of class 1 (Yes)
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
