# Leçons Apprises : Observabilité & Diagnostic

Ce document répertorie les principes fondamentaux établis lors de la phase de stabilisation finale du moteur de classification multimodale Rakuten (Avril 2026).

## 1. Le Principe d'Observabilité d'Abord 🏛️

> **"Ne jamais débuguer une intuition sans preuve diagnostique."**

Lors du développement, nous avons passé 48h à traquer une prétendue "dérive de classes" qui s'est avérée être un comportement statistique normal du modèle face aux biais du dataset.

**Règle d'or :**
Avant de modifier le pipeline de preprocessing ou les hyperparamètres d'un modèle pour corriger une "erreur" apparente, activez les logs de diagnostic :
- Vérifiez les **Normes (L2)** des modalités.
- Vérifiez le **Scaling** (min/max des features clippées).
- Vérifiez les **Probabilités individuelles** de chaque modèle de base du Stacking.

## 2. Comprendre les Biais du Dataset 📊

Le modèle Rakuten est un miroir des habitudes des vendeurs :
- **Le mot "neuf"** : Sur Rakuten, ce mot est statistiquement corrélé à la catégorie **2403 (Livres Jeunesse)**. Ajouter "neuf" peut donc faire basculer une prédiction du code 10 (Occasion) vers le code 2403.
- **Ambiguïté de l'image** : Dans un cadre multimodal, si le texte est générique ("livre"), l'image devient le signal dominant, même si elle est floue ou peu contrastée.

## 3. Stabilité vs Précision ⚖️

L'ajout du **Clipping à `[-3.0, 3.0]`** sur les features scalées (`np.clip`) est vital. Il sacrifie parfois un peu de précision sur les cas extrêmes pour garantir que l'API ne crash pas ou ne dérive pas de manière absurde en production face à des entrées imprévues.

---
*Ce document sert de guide pour toute future IA ou équipe de Data Science travaillant sur ce projet.*
