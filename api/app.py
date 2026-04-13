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

# ══════════════════════════════════════════
# PERSONNALISATION LOGS : VERT PÉTARD 🚀
# ══════════════════════════════════════════
class HighVisibilityFilter(logging.Filter):
    def filter(self, record):
        msg = record.getMessage()
        if "Application startup complete" in msg:
            # Vert "pétard" : Bold + Bright Green + 3 checkmarks pour le signal de départ
            record.msg = f"\033[92;1m{msg} ✅✅✅\033[0m"
        return True

# On applique le filtre sur uvicorn.error (source du message de startup)
logging.getLogger("uvicorn.error").addFilter(HighVisibilityFilter())

@app.on_event("startup")
def startup_event():
    url_base = get_frontend_url()
    # Couleurs pour le banner
    CYAN = "\033[96m"
    YELLOW = "\033[93m"
    RESET = "\033[0m"
    BOLD = "\033[1m"

    logger.info(f"{CYAN}{BOLD}------------------------------------------------{RESET}")
    logger.info(f"{CYAN}{BOLD}   🚀 RAKUTEN PROJECT - RACCOURCIS LOCAUX{RESET}")
    logger.info(f"   Homepage      : {YELLOW}{url_base}/{RESET}")
    logger.info(f"   Multimodal    : {YELLOW}{url_base}/demo/multimodal{RESET}")
    logger.info(f"   Swagger Docs  : {YELLOW}http://localhost:8000/docs{RESET}")
    logger.info(f"{CYAN}{BOLD}------------------------------------------------{RESET}")
    logger.info(f"{CYAN}{BOLD}   🌐 LIENS DE PRODUCTION{RESET}")
    logger.info(f"   Vercel        : {YELLOW}https://jun-25-cds-rakuten.vercel.app/{RESET}")
    logger.info(f"   HF Spaces     : {YELLOW}https://huggingface.co/spaces/nolll77/rakuten-multimodal-api{RESET}")
    logger.info(f"{CYAN}{BOLD}------------------------------------------------{RESET}")

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
