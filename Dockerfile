FROM python:3.10-slim

# Créer un dossier de travail
WORKDIR /app

# Installer les dépendances
COPY requirements_hf.txt .
RUN pip install --no-cache-dir -r requirements_hf.txt
RUN python -m spacy download fr_core_news_md

# Copier le code (API, dossiers src et modèles)
COPY ./api /app/api
COPY ./src /app/src
COPY ./models /app/models

# Exposer le port par défaut pour Hugging Face Spaces
EXPOSE 7860

# Démarrer le serveur FastAPI sur le port 7860
CMD ["uvicorn", "api.app:app", "--host", "0.0.0.0", "--port", "7860"]
