# Walkthrough: Rakuten Pipeline Stabilization & Deployment

This project involved a complete overhaul of the multimodal inference pipeline to ensure production stability and accurate classification for the Rakuten Challenge.

## 1. Inference Pipeline Stabilization
- **Category Mapping**: Restored `RAKUTEN_MAPPING` to match training labels (e.g., **2582** properly maps to **"Mobilier de jardin"**).
- **Feature Engineering**: Standardized metadata features to `[len(text), word_count, img_w]` to eliminate classification drift.
- **Numerical Stability**: Implemented `np.clip(X_scaled, -3.0, 3.0)` to prevent base-model saturation and ensure meta-learner reliability.
- **Text Cleaning**: Re-implemented the robust `spaCy` cleaning pipeline to match the training distribution.

## 2. Deployment & Automation
- **Docker Optimization**: Updated `Dockerfile` to pre-cache `CamemBERT` and `EfficientNet` weights, resolving runtime OSError issues on Hugging Face Spaces.
- **'Follow Push' Automation**: Created a GitHub Action (`sync_to_hf.yml`) that automatically synchronizes the project from GitHub to Hugging Face Hub using secret tokens.
- **Multi-Branch Sync**: Synchronized the stabilized feature branch with the `main` branch to trigger the production deployment on Vercel.

## 3. UI/UX Refinements
- **Terminology**: Replaced "roue de secours" (spare wheel) with **"Mode Rapide (MLP)"** for a more professional interface.
- **Documentation**: Finalized the `README.md` with direct links to Kaggle research notebooks and updated production status.

## Verification
- **Test Case**: "chaise jardin" -> Predicted Class **2582 [Mobilier de jardin]** with >98% confidence.
- **Logs**: Real-time diagnostic logs now provide full visibility into modality norms and base-model predictions.

---
**Status**: DEPLOYED & STABLE 🚀
**Backend**: Hugging Face Spaces (Docker)
**Frontend**: Vercel (React)
