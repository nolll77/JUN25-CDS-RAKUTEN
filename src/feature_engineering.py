"""
Ingénierie des caractéristiques.
Vectorisation de texte, réduction de dimensionnalité, combinaison de features.
"""

import logging
from typing import Tuple, Union, List

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.decomposition import TruncatedSVD, PCA
from scipy.sparse import csr_matrix, hstack

journal = logging.getLogger(__name__)


class ExtracteurFeaturesTexte:
    """Extraction de caractéristiques textuelles via TF-IDF ou comptage."""

    def __init__(self, methode: str = "tfidf", nb_features: int = 1000,
                 plage_ngram: Tuple[int, int] = (1, 2),
                 min_df: Union[int, float] = 2,
                 max_df: Union[int, float] = 0.8):
        """
        Initialise l'extracteur de features textuelles.

        Args:
            methode: 'tfidf' ou 'count'
            nb_features: nombre maximum de features à extraire
            plage_ngram: (n_min, n_max) pour les n-grammes
            min_df: fréquence minimale des documents (pour filtrer les mots rares)
            max_df: fréquence maximale des documents (pour filtrer les mots trop fréquents)
        """
        self.methode = methode
        self.nb_features = nb_features
        self.plage_ngram = plage_ngram

        if methode == "tfidf":
            # ediz's vectorisation TF-IDF : pondération terme/document
            self.vectoriseur = TfidfVectorizer(
                max_features=nb_features,
                ngram_range=plage_ngram,
                min_df=min_df,
                max_df=max_df
            )
        elif methode == "count":
            # ediz's vectorisation par comptage brut des occurrences
            self.vectoriseur = CountVectorizer(
                max_features=nb_features,
                ngram_range=plage_ngram,
                min_df=min_df,
                max_df=max_df
            )
        else:
            raise ValueError(f"Méthode {methode} non supportée")

    def adapter_transformer(self, textes: List[str]) -> csr_matrix:
        """Ajuste et transforme les textes en matrice de features."""
        return self.vectoriseur.fit_transform(textes)

    def transformer(self, textes: List[str]) -> csr_matrix:
        """Transforme les textes avec le vectoriseur ajusté."""
        return self.vectoriseur.transform(textes)

    def obtenir_noms_features(self) -> List[str]:
        """Retourne les noms des features extraites."""
        return self.vectoriseur.get_feature_names_out()


class ReducteurDimensionnalite:
    """Réduction de dimensionnalité des matrices de features."""

    def __init__(self, methode: str = "svd", nb_composantes: int = 200):
        """
        Initialise le réducteur.

        Args:
            methode: 'svd', 'pca', ou 'aucune'
            nb_composantes: nombre de composantes à conserver
        """
        self.methode = methode
        self.nb_composantes = nb_composantes

        if methode == "svd":
            # nolll's SVD tronquée : adapté aux matrices creuses (sparse)
            self.reducteur = TruncatedSVD(n_components=nb_composantes, random_state=42)
        elif methode == "pca":
            # nolll's ACP : adapté aux matrices denses
            self.reducteur = PCA(n_components=nb_composantes, random_state=42)
        elif methode == "aucune":
            self.reducteur = None
        else:
            raise ValueError(f"Méthode {methode} non supportée")

    def adapter_transformer(self, X: Union[np.ndarray, csr_matrix]) -> np.ndarray:
        """Ajuste et transforme les features."""
        if self.reducteur is None:
            return X
        return self.reducteur.fit_transform(X)

    def transformer(self, X: Union[np.ndarray, csr_matrix]) -> np.ndarray:
        """Transforme les features avec le réducteur ajusté."""
        if self.reducteur is None:
            return X
        return self.reducteur.transform(X)

    def obtenir_variance_expliquee(self) -> np.ndarray:
        """Retourne le ratio de variance expliquée (SVD/PCA)."""
        if hasattr(self.reducteur, "explained_variance_ratio_"):
            return self.reducteur.explained_variance_ratio_
        return None


class CombineurFeatures:
    """Combinaison de plusieurs matrices de features."""

    @staticmethod
    def combiner(liste_features: List[Union[np.ndarray, csr_matrix]],
                 methode: str = "concatener") -> Union[np.ndarray, csr_matrix]:
        """
        Combine plusieurs matrices de features.

        Args:
            liste_features: liste de matrices de features
            methode: 'concatener' (axe colonnes) ou 'empiler' (axe lignes)

        Returns:
            Matrice combinée
        """
        if methode == "concatener":
            if any(isinstance(f, csr_matrix) for f in liste_features):
                return hstack(liste_features).tocsr()
            else:
                return np.hstack(liste_features)
        elif methode == "empiler":
            return np.vstack(liste_features)
        else:
            raise ValueError(f"Méthode {methode} non supportée")

    @staticmethod
    def concatener_dense_sparse(dense: np.ndarray, sparse: csr_matrix) -> csr_matrix:
        """Concatène une matrice dense et une matrice creuse."""
        from scipy.sparse import csr_matrix as sp_csr
        dense_sparse = sp_csr(dense)
        return hstack([dense_sparse, sparse]).tocsr()


class PipelineFeatures:
    """Pipeline complet d'ingénierie des caractéristiques."""

    def __init__(self, methode_texte: str = "tfidf",
                 nb_features_texte: int = 1000,
                 methode_reduction: str = "svd",
                 nb_composantes: int = 200,
                 min_df: int = 2):
        """Initialise le pipeline de features."""
        self.extracteur_texte = ExtracteurFeaturesTexte(
            methode=methode_texte,
            nb_features=nb_features_texte,
            min_df=min_df
        )
        self.reducteur = ReducteurDimensionnalite(
            methode=methode_reduction,
            nb_composantes=nb_composantes
        )

    def adapter_transformer(self,
                            textes: List[str],
                            features_images: np.ndarray = None,
                            features_numeriques: pd.DataFrame = None) -> np.ndarray:
        """
        Pipeline complet : ajuste et transforme toutes les features.

        Args:
            textes: liste de textes
            features_images: matrice (n, nb_features_image)
            features_numeriques: dataframe de colonnes numériques

        Returns:
            Matrice de features combinée
        """
        # Extraction et réduction des features textuelles
        features_texte = self.extracteur_texte.adapter_transformer(textes)
        journal.info(f"Features texte : {features_texte.shape}")

        features_texte_reduites = self.reducteur.adapter_transformer(features_texte)
        journal.info(f"Features texte réduites : {features_texte_reduites.shape}")

        toutes_features = features_texte_reduites

        if features_images is not None:
            toutes_features = np.hstack([toutes_features, features_images])
            journal.info(f"Après ajout images : {toutes_features.shape}")

        if features_numeriques is not None:
            toutes_features = np.hstack([toutes_features, features_numeriques.values])
            journal.info(f"Matrice finale : {toutes_features.shape}")

        return toutes_features

    def transformer(self,
                    textes: List[str],
                    features_images: np.ndarray = None,
                    features_numeriques: pd.DataFrame = None) -> np.ndarray:
        """Transforme avec le pipeline ajusté."""
        features_texte = self.extracteur_texte.transformer(textes)
        features_texte_reduites = self.reducteur.transformer(features_texte)

        toutes_features = features_texte_reduites

        if features_images is not None:
            toutes_features = np.hstack([toutes_features, features_images])

        if features_numeriques is not None:
            toutes_features = np.hstack([toutes_features, features_numeriques.values])

        return toutes_features
