FROM python:3.10-slim

# Créer un dossier de travail
WORKDIR /app

# Installer les dépendances
COPY requirements_hf.txt .
RUN pip install --no-cache-dir -r requirements_hf.txt
RUN python -m spacy download fr_core_news_md

# Prétéléchargement des modèles Hugging Face et Timm pour éviter les erreurs de connexion au runtime
RUN python -c "from transformers import AutoTokenizer, AutoModel; AutoTokenizer.from_pretrained('camembert-base'); AutoModel.from_pretrained('camembert-base')"
RUN python -c "import timm; timm.create_model('efficientnet_b3', pretrained=True, num_classes=0)"

# Copier le code (API, dossiers src et modèles)
COPY ./api /app/api
COPY ./src /app/src
COPY ./models /app/models

# Exposer le port par défaut pour Hugging Face Spaces
EXPOSE 7860

# Démarrer le serveur FastAPI sur le port 7860
CMD ["uvicorn", "api.app:app", "--host", "0.0.0.0", "--port", "7860"]
