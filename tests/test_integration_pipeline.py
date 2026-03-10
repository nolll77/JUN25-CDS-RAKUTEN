"""
Test d'intégration — pipeline bout en bout.
Simule l'enchaînement complet : texte brut → features → modèle → évaluation.
Aucune dépendance aux fichiers réels Rakuten (données synthétiques).
"""

import pytest
import numpy as np
import pandas as pd
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.preprocessing import PreprocesseurTexte, NormalisateurNumerique, GestionnaireValeursManquantes
from src.feature_engineering import ExtracteurFeaturesTexte, ReducteurDimensionnalite, CombineurFeatures
from src.modeling import EntraineurModele, EvaluateurModele
from src.utils import ValidateurDonnees, ProfileurPerformance

try:
    import xgboost  # noqa
    XGBOOST_DISPONIBLE = True
except Exception:
    XGBOOST_DISPONIBLE = False

try:
    import lightgbm  # noqa
    LIGHTGBM_DISPONIBLE = True
except Exception:
    LIGHTGBM_DISPONIBLE = False


def generer_jeu_de_donnees_synthetique(nb_exemples: int = 150, nb_classes: int = 5):
    """Génère un jeu de données multimodal synthétique pour les tests d'intégration."""
    np.random.seed(42)

    mots = ["chaussure", "livre", "telephone", "jeu", "vetement",
            "sport", "enfant", "cuisine", "portable", "electronique"]
    classes = list(range(nb_classes))

    descriptions = []
    for i in range(nb_exemples):
        nb_mots = np.random.randint(3, 8)
        desc = " ".join(np.random.choice(mots, nb_mots))
        descriptions.append(desc)

    labels = np.random.choice(classes, nb_exemples)

    features_numeriques = pd.DataFrame({
        "prix": np.random.uniform(1, 1000, nb_exemples),
        "poids": np.random.uniform(0.1, 50, nb_exemples),
    })

    features_images = np.random.randn(nb_exemples, 2048)

    return descriptions, labels, features_numeriques, features_images


class TestPipelineComplet:
    """Test du pipeline bout en bout avec données synthétiques."""

    def test_pipeline_texte_uniquement(self):
        """Preprocessing texte + TF-IDF + SVD + classification."""
        descriptions, labels, _, _ = generer_jeu_de_donnees_synthetique(100, 3)

        prep = PreprocesseurTexte()
        textes_nettoyes = prep.adapter_transformer(descriptions)
        assert len(textes_nettoyes) == 100

        extracteur = ExtracteurFeaturesTexte(methode="tfidf", nb_features=50)
        features = extracteur.adapter_transformer(textes_nettoyes)
        assert features.shape[0] == 100

        reducteur = ReducteurDimensionnalite(methode="svd", nb_composantes=20)
        features_reduites = reducteur.adapter_transformer(features)
        assert features_reduites.shape == (100, 20)

        from sklearn.model_selection import train_test_split
        X_train, X_test, y_train, y_test = train_test_split(
            features_reduites, labels, test_size=0.2, random_state=42
        )

        entraineur = EntraineurModele(graine=42)
        modele = entraineur.entrainer_regression_logistique(X_train, y_train)
        y_predit = modele.predict(X_test)

        evaluateur = EvaluateurModele()
        metriques = evaluateur.calculer_metriques(y_test, y_predit)
        assert "accuracy" in metriques
        assert "f1_macro" in metriques

    def test_pipeline_texte_et_numerique(self):
        """Pipeline multimodal texte + features numériques."""
        descriptions, labels, features_num, _ = generer_jeu_de_donnees_synthetique(100, 3)

        prep = PreprocesseurTexte()
        textes_nettoyes = prep.adapter_transformer(descriptions)

        extracteur = ExtracteurFeaturesTexte(methode="tfidf", nb_features=50)
        features_texte = extracteur.adapter_transformer(textes_nettoyes)

        reducteur = ReducteurDimensionnalite(methode="svd", nb_composantes=10)
        features_texte_reduites = reducteur.adapter_transformer(features_texte)

        normalisateur = NormalisateurNumerique(methode="standard")
        features_num_norm = normalisateur.adapter_transformer(features_num)

        features_finales = np.hstack([features_texte_reduites, features_num_norm.values])
        assert features_finales.shape == (100, 12)

        from sklearn.model_selection import train_test_split
        X_train, X_test, y_train, y_test = train_test_split(
            features_finales, labels, test_size=0.2, random_state=42
        )

        entraineur = EntraineurModele(graine=42)
        modele = entraineur.entrainer_foret_aleatoire(X_train, y_train)
        y_predit = modele.predict(X_test)

        evaluateur = EvaluateurModele()
        metriques = evaluateur.calculer_metriques(y_test, y_predit)
        assert 0.0 <= metriques["accuracy"] <= 1.0

    def test_pipeline_avec_valeurs_manquantes(self):
        """Pipeline avec gestion des valeurs manquantes."""
        descriptions, labels, features_num, _ = generer_jeu_de_donnees_synthetique(100, 3)

        features_num_avec_na = features_num.copy()
        indices_na = np.random.choice(100, 10, replace=False)
        features_num_avec_na.loc[indices_na, "prix"] = np.nan

        assert features_num_avec_na["prix"].isnull().sum() == 10

        gestionnaire = GestionnaireValeursManquantes(strategie="moyenne")
        features_num_complet = gestionnaire.adapter_transformer(features_num_avec_na)
        assert features_num_complet["prix"].isnull().sum() == 0

    def test_validation_donnees_en_pipeline(self):
        """Vérifie que le validateur de données s'intègre correctement."""
        _, _, features_num, _ = generer_jeu_de_donnees_synthetique(50, 3)

        validateur = ValidateurDonnees()

        doublons = validateur.verifier_doublons(features_num)
        assert isinstance(doublons, (int, np.integer))

        types = validateur.verifier_types_colonnes(features_num)
        assert "prix" in types
        assert "poids" in types

        valide = validateur.valider_colonnes(features_num, ["prix", "poids"])
        assert valide is True

        invalide = validateur.valider_colonnes(features_num, ["prix", "inexistant"])
        assert invalide is False

    def test_profilage_performance_en_pipeline(self):
        """Vérifie l'intégration du profileur de performance."""
        descriptions, labels, _, _ = generer_jeu_de_donnees_synthetique(50, 3)

        profiler = ProfileurPerformance()

        profiler.demarrer()
        prep = PreprocesseurTexte()
        prep.adapter_transformer(descriptions)
        profiler.arreter("preprocessing_texte")

        profiler.demarrer()
        extracteur = ExtracteurFeaturesTexte(methode="tfidf", nb_features=30)
        extracteur.adapter_transformer(descriptions)
        profiler.arreter("extraction_features")

        rapport = profiler.rapport()
        assert isinstance(rapport, pd.DataFrame)
        assert len(rapport) == 2
        assert "preprocessing_texte" in rapport["Étape"].values
        assert "extraction_features" in rapport["Étape"].values
        assert (rapport["Durée (s)"] >= 0).all()

    def test_pipeline_reproductible(self):
        """Vérifie que deux exécutions avec la même graine donnent les mêmes résultats."""
        from sklearn.model_selection import train_test_split
        descriptions, labels, _, _ = generer_jeu_de_donnees_synthetique(80, 3)

        def executer_pipeline():
            prep = PreprocesseurTexte()
            textes = prep.adapter_transformer(descriptions)
            extracteur = ExtracteurFeaturesTexte(methode="tfidf", nb_features=30)
            features = extracteur.adapter_transformer(textes)
            reducteur = ReducteurDimensionnalite(methode="svd", nb_composantes=10)
            features_red = reducteur.adapter_transformer(features)
            X_train, X_test, y_train, y_test = train_test_split(
                features_red, labels, test_size=0.2, random_state=42
            )
            entraineur = EntraineurModele(graine=42)
            modele = entraineur.entrainer_regression_logistique(X_train, y_train)
            return modele.predict(X_test)

        pred1 = executer_pipeline()
        pred2 = executer_pipeline()

        np.testing.assert_array_equal(pred1, pred2)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
