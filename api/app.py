import sys
import os
from pathlib import Path

import socket
import logging
import warnings

# Suppression des alertes persistantes (scikit-learn et LightGBM)
warnings.filterwarnings("ignore", category=UserWarning, module="sklearn")
warnings.filterwarnings("ignore", category=UserWarning, module="lightgbm")

sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from pydantic import BaseModel
from api.inference import get_top_predictions, set_mode, get_current_mode

def get_frontend_url():
    """Détecte si le frontend tourne sur 8080 ou 8081."""
    for port in [8081, 8080, 5173]:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(('localhost', port)) == 0:
                return f"http://localhost:{port}"
    return "http://localhost:8081" # Valeur par défaut si non détecté

app = FastAPI(
    title="Rakuten Inference API",
    description="API de classification multimodale (Texte + Image) pour les produits Rakuten.",
    version="2.0.0"
)

logger = logging.getLogger("uvicorn")

@app.on_event("startup")
def startup_event():
    url_base = get_frontend_url()
    logger.info("------------------------------------------------")
    logger.info("   RAKUTEN PROJECT - RACCOURCIS LOCAUX")
    logger.info(f"   Homepage      : {url_base}/")
    logger.info(f"   Multimodal    : {url_base}/demo/multimodal")
    logger.info(f"   Swagger Docs  : http://localhost:8000/docs")
    logger.info("------------------------------------------------")
    logger.info("   LIENS DE PRODUCTION")
    logger.info("   Vercel        : https://jun25-cds-rakuten.vercel.app/")
    logger.info("   HF Spaces     : https://huggingface.co/spaces/nolll77/JUN25-CDS-RAKUTEN")
    logger.info("------------------------------------------------")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {
        "status": "ok",
        "message": "Rakuten ML API is running!",
        "model_mode": get_current_mode()
    }


@app.post("/predict")
async def predict_product(
    text: Optional[str] = Form(""),
    image: Optional[UploadFile] = File(None)
):
    """Endpoint principal : reçoit un texte et/ou une image."""
    if not text.strip() and not image:
        raise HTTPException(status_code=400, detail="Veuillez fournir au moins un texte ou une image.")

    image_path = None
    if image:
        image_path = f"/tmp/{image.filename}"
        with open(image_path, "wb") as f:
            f.write(await image.read())

    try:
        predictions, mode_used = get_top_predictions(text=text, image_path=image_path)

        if image_path and os.path.exists(image_path):
            os.remove(image_path)

        return {
            "status": "success",
            "model_mode": mode_used,
            "predictions": predictions
        }

    except Exception as e:
        if image_path and os.path.exists(image_path):
            os.remove(image_path)
        raise HTTPException(status_code=500, detail=str(e))


class ModelSwitch(BaseModel):
    mode: str  # "stacking" ou "mlp"


@app.post("/set-model")
def switch_model(body: ModelSwitch):
    """Switch manuel entre Stacking et MLP."""
    try:
        set_mode(body.mode)
        return {
            "status": "ok",
            "model_mode": get_current_mode(),
            "message": f"Mode changé vers '{body.mode}'"
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/model-status")
def model_status():
    """Retourne le mode actif et les modèles chargés."""
    return {
        "current_mode": get_current_mode(),
        "available_modes": ["stacking", "mlp"],
        "description": {
            "stacking": "Ensemble complet (LightGBM + CatBoost + LR + MLP → Meta Learner)",
            "mlp": "Deep Learning MLP seul (roue de secours, plus rapide)"
        }
    }
