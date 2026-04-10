# Rakuten ML – API FastAPI (Backend)

Ce dossier contient le code de l'API permettant d'interroger le modèle prédictif depuis le frontend via requêtes HTTP. L'API est conçue pour être déployée au sein d'un conteneur Docker (ex: Hugging Face Spaces).

## État de l'Architecture (V2 Opérationnelle)

Contrairement aux versions précédentes, cette instance utilise désormais le pipeline complet de **Meta-Stacking** :
1.  **Modèles de base** : XGBoost, LightGBM (5-folds), Régression Logistique et un MLP (Deep Learning).
2.  **Meta-Learner** : Une couche de fusion qui agrège les prédictions des modèles de base pour une précision optimale.
3.  **Inférence Multimodale** : Utilisation conjointe de CamemBERT (Texte) et EfficientNet-B3 (Image).

### Lancement Local
Pour lancer l'API en mode développement :
```bash
uvicorn api.app:app --host 0.0.0.0 --port 8000 --reload
```

Le frontend React (port 8081) se connectera automatiquement à cette API pour les prédictions.

