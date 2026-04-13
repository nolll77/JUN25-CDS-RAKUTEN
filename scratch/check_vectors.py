import joblib
import numpy as np
import os
import torch

# Chemins
ARTIFACT_DIR = "models/trained_models"

def diagnostic():
    print("--- DIAGNOSTIC DES ARTEFACTS ---")
    try:
        tfidf_name = joblib.load(os.path.join(ARTIFACT_DIR, "tfidf_designation_vectorizer.joblib"))
        svd_name = joblib.load(os.path.join(ARTIFACT_DIR, "svd_designation.joblib"))
        scaler_features = joblib.load(os.path.join(ARTIFACT_DIR, "preprocessing_scaler_features.joblib"))
        print("Artefacts chargés.")
        
        # Test Texte
        text = "chaise de jardin"
        vec_tfidf = tfidf_name.transform([text])
        vec_svd = svd_name.transform(vec_tfidf)
        print(f"\nTexte: '{text}'")
        print(f"SVD Designation (non-zero ?): {np.count_nonzero(vec_svd)}")
        print(f"SVD Designation (5 premiers): {vec_svd[0][:5]}")
        
        # Test Global Scaler
        print(f"\nScaler Global Stats:")
        print(f"Mean (5 premiers): {scaler_features.mean_[:5]}")
        print(f"Scale (5 premiers): {scaler_features.scale_[:5]}")
        
    except Exception as e:
        print(f"Erreur: {e}")

if __name__ == "__main__":
    diagnostic()
