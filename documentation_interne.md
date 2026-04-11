# Documentation Techniques et Décisions de Conception

Ce document regroupe les informations techniques essentielles sur le projet Rakuten, consolidées à partir des différents rapports d'implémentation. Il est destiné à un usage interne pour comprendre les choix effectués lors du développement du pipeline.

---

## 1. Principes de Développement

Le projet suit des directives de "code pur" :
*   **Langue** : Français intégral pour le code (fonctions, variables, classes), les commentaires et la documentation.
*   **Qualité** : Suppression des artefacts générés par IA (emojis excessifs, séparateurs de type "===" ou "___").
*   **Modularité** : Séparation claire entre les modules source (src/), les scripts d'exécution (scripts/) et les notebooks d'expérimentation.
*   **Traçabilité** : Utilisation des tags #nolll's et #ediz's pour identifier les techniques et concepts spécifiques.

---

## 2. Inventions et Intégrations (Phase EDIZ)

Plusieurs innovations techniques ont été évaluées et intégrées au pipeline principal :

### Hybridation TF-IDF + SVD
Pour compléter les embeddings sémantiques de CamemBERT, une couche de caractéristiques lexicales a été ajoutée :
*   **Méthode** : Vectorisation TF-IDF (5000 features sur la description, 1000 sur la désignation).
*   **Réduction** : Application d'une SVD pour ramener ces vecteurs à 70 dimensions (50+20).
*   **Gain attendu** : Une amélioration de 2 à 5% de la précision globale grâce à la complémentarité des approches lexicale et sémantique.

### Extraction de Métadonnées d'Images
En plus des features extraites par réseaux de neurones (EfficientNet/ResNet), des caractéristiques physiques des images sont collectées :
*   Dimensions (largeur, hauteur).
*   Taille du fichier.
*   Format.
*   Note : Cette technique apporte un gain marginal de 0.5% mais renforce le contexte.

### Architecture Multimodale
Le pipeline fusionne trois sources de données :
1.  **Texte (Sémantique)** : CamemBERT (768d).
2.  **Texte (Lexical)** : TF-IDF + SVD (70d).
3.  **Image (Visuel)** : EfficientNet-B3 (SVD-300d).
*   **Total** : Environ 1138 dimensions finales après fusion.

---

## 3. Stratégies de Modélisation

Le projet évalue une hiérarchie de modèles :
*   **Niveau 1** : Baselines rapides (Régression Logistique, Forêt Aléatoire).
*   **Niveau 2** : Optimisation par Gradient Boosting (XGBoost, LightGBM, CatBoost).
*   **Niveau 3** : Ensemble par vote (Voting Classifier) combinant les prédictions pour une meilleure robustesse.

---

## 4. Guide d'Exécution du Pipeline

L'ordre d'exécution recommandé pour reproduire les résultats est :
1.  1.0_exploration_eda.ipynb : Analyse et statistiques.
2.  2.0_preprocessing_pipeline.ipynb : Génération des features et sauvegarde des préprocesseurs.
3.  3.3_final_models.ipynb : Entraînement final et évaluation.
4.  FastAPI : api/app.py pour le service d'inférence.

---

## 5. Déploiement et Maintenance

Le pipeline est déployé sur une architecture distribuée pour garantir performance et scalabilité.

### Infrastructure Cloud
*   **Backend : Hugging Face Spaces**
    Déploiement via Docker de l'API FastAPI. Les fichiers modèles volumineux sont gérés par Git LFS.
*   **Frontend : Vercel**
    Interface utilisateur en React/Vite. La configuration est optimisée pour un monorepo via vercel.json et un point d'entrée Vite forcé sur ./.

### Gestion des Ressources et Optimisation
*   **Mémoire vive (Vite Build)** : Utilisation de NODE_OPTIONS=--max-old-space-size=4096 pour éviter les erreurs de débordement mémoire (OOM) lors de la minification sur Vercel.
*   **Git LFS** : Migration complète des fichiers binaires (.joblib, .cbm, .pt) pour contourner les limitations de taille de GitHub et HF Spaces.
*   **Communication Inter-services** : Configuration via VITE_API_URL pointant vers l'espace Hugging Face.

### Logo Liora et Challenge ENS
Ce projet s'inscrit dans le cadre du cursus Liora. Il répond aux problématiques de classification multimodale (texte et image) exposées dans le challenge Rakuten / Challenge Data ENS : https://challengedata.ens.fr/challenges/35.

---

Ce document est une version consolidée des rapports d'intégration et remplace les multiples fichiers de statut.
