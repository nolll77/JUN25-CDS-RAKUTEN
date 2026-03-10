"""
Utilitaires de visualisation.
Graphiques, courbes et matrices de confusion.
"""

import logging
from typing import List, Dict, Tuple

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

try:
    import plotly.express as px
    import plotly.graph_objects as go
    PLOTLY_DISPONIBLE = True
except ImportError:
    PLOTLY_DISPONIBLE = False

from sklearn.metrics import confusion_matrix, roc_curve, auc

journal = logging.getLogger(__name__)

sns.set_style("whitegrid")
plt.rcParams["figure.figsize"] = (12, 6)


class TraceurMatriceConfusion:
    """Affichage de la matrice de confusion."""

    @staticmethod
    def tracer(y_reel: np.ndarray,
               y_predit: np.ndarray,
               titre: str = "Matrice de confusion",
               taille: Tuple[int, int] = (10, 8)) -> plt.Figure:
        """
        Trace la heatmap de la matrice de confusion.

        Args:
            y_reel: labels réels
            y_predit: labels prédits
            titre: titre du graphique
            taille: dimensions de la figure

        Returns:
            Figure matplotlib
        """
        # nolll's matrice de confusion normalisée
        mc = confusion_matrix(y_reel, y_predit)

        fig, ax = plt.subplots(figsize=taille)
        sns.heatmap(mc, annot=True, fmt="d", cmap="Blues", ax=ax, cbar=True)
        ax.set_title(titre, fontsize=14, fontweight="bold")
        ax.set_xlabel("Prédit")
        ax.set_ylabel("Réel")

        plt.tight_layout()
        return fig


class TraceurMetriques:
    """Affichage des métriques de modèles."""

    @staticmethod
    def tracer_comparaison(df_resultats: pd.DataFrame,
                           colonne_metrique: str = "f1_macro") -> plt.Figure:
        """
        Trace la comparaison des métriques entre modèles.

        Args:
            df_resultats: dataframe avec les métriques par modèle
            colonne_metrique: colonne à utiliser comme métrique principale

        Returns:
            Figure matplotlib
        """
        if df_resultats.empty:
            journal.warning("Dataframe de résultats vide")
            return None

        fig, ax = plt.subplots(figsize=(12, 6))
        df_trie = df_resultats.sort_values(colonne_metrique, ascending=False)
        ax.barh(df_trie["modele"], df_trie[colonne_metrique])
        ax.set_xlabel(colonne_metrique, fontsize=12)
        ax.set_title(f"Comparaison des modèles — {colonne_metrique}", fontsize=14, fontweight="bold")

        plt.tight_layout()
        return fig

    @staticmethod
    def tracer_toutes_metriques(df_resultats: pd.DataFrame) -> plt.Figure:
        """Trace toutes les métriques pour tous les modèles."""
        if df_resultats.empty:
            return None

        colonnes_metriques = [col for col in df_resultats.columns if col != "modele"]

        fig, axes = plt.subplots(2, 4, figsize=(16, 8))
        axes = axes.flatten()

        for idx, metrique in enumerate(colonnes_metriques):
            axes[idx].bar(df_resultats["modele"], df_resultats[metrique])
            axes[idx].set_title(metrique, fontweight="bold")
            axes[idx].set_ylim([0, 1])
            axes[idx].tick_params(axis="x", rotation=45)

        for idx in range(len(colonnes_metriques), len(axes)):
            axes[idx].axis("off")

        plt.tight_layout()
        return fig


class TraceurROC:
    """Affichage de la courbe ROC."""

    @staticmethod
    def tracer(y_reel: np.ndarray,
               y_proba: np.ndarray,
               titre: str = "Courbe ROC") -> plt.Figure:
        """
        Trace la courbe ROC pour une classification binaire.

        Args:
            y_reel: labels réels
            y_proba: probabilités de prédiction
            titre: titre du graphique

        Returns:
            Figure matplotlib
        """
        # nolll's courbe ROC avec calcul de l'AUC
        taux_fp, taux_vp, _ = roc_curve(y_reel, y_proba[:, 1])
        roc_auc = auc(taux_fp, taux_vp)

        fig, ax = plt.subplots(figsize=(8, 6))
        ax.plot(taux_fp, taux_vp, label=f"Courbe ROC (AUC = {roc_auc:.3f})")
        ax.plot([0, 1], [0, 1], "k--", label="Classifieur aléatoire")
        ax.set_xlabel("Taux faux positifs")
        ax.set_ylabel("Taux vrais positifs")
        ax.set_title(titre, fontsize=14, fontweight="bold")
        ax.legend()
        ax.grid(True, alpha=0.3)

        plt.tight_layout()
        return fig


class TraceurImportanceFeatures:
    """Affichage de l'importance des features."""

    @staticmethod
    def tracer(modele,
               noms_features: List[str] = None,
               top_n: int = 20,
               taille: Tuple[int, int] = (12, 6)) -> plt.Figure:
        """
        Trace les N features les plus importantes.

        Args:
            modele: modèle entraîné avec attribut feature_importances_
            noms_features: liste des noms de features
            top_n: nombre de features à afficher
            taille: dimensions de la figure

        Returns:
            Figure matplotlib
        """
        if not hasattr(modele, "feature_importances_"):
            journal.error("Le modèle n'a pas d'attribut feature_importances_")
            return None

        importances = modele.feature_importances_
        indices = np.argsort(importances)[-top_n:]

        if noms_features is None:
            noms_features = [f"Feature {i}" for i in range(len(importances))]

        fig, ax = plt.subplots(figsize=taille)
        ax.barh(range(len(indices)), importances[indices])
        ax.set_yticks(range(len(indices)))
        ax.set_yticklabels([noms_features[i] for i in indices])
        ax.set_xlabel("Importance")
        ax.set_title(f"Top {top_n} features les plus importantes", fontsize=14, fontweight="bold")

        plt.tight_layout()
        return fig


class TraceurDistribution:
    """Affichage des distributions de données."""

    @staticmethod
    def tracer_distribution_classes(y: np.ndarray,
                                    titre: str = "Distribution des classes") -> plt.Figure:
        """Trace la distribution des classes."""
        valeurs, comptages = np.unique(y, return_counts=True)

        fig, ax = plt.subplots(figsize=(8, 6))
        ax.bar(valeurs, comptages)
        ax.set_xlabel("Classe")
        ax.set_ylabel("Nombre d'exemples")
        ax.set_title(titre, fontsize=14, fontweight="bold")

        for i, v in enumerate(comptages):
            ax.text(valeurs[i], v + 50, str(v), ha="center", fontweight="bold")

        plt.tight_layout()
        return fig

    @staticmethod
    def tracer_distribution_feature(X: pd.DataFrame,
                                    colonne: str,
                                    nb_intervalles: int = 30) -> plt.Figure:
        """Trace la distribution d'une feature."""
        fig, ax = plt.subplots(figsize=(10, 6))
        ax.hist(X[colonne].dropna(), bins=nb_intervalles, edgecolor="black")
        ax.set_xlabel(colonne)
        ax.set_ylabel("Fréquence")
        ax.set_title(f"Distribution de {colonne}", fontsize=14, fontweight="bold")

        plt.tight_layout()
        return fig


class TraceurInteractif:
    """Graphiques interactifs avec Plotly."""

    @staticmethod
    def tracer_metriques_interactif(df_resultats: pd.DataFrame):
        """Trace une comparaison interactive des métriques."""
        if not PLOTLY_DISPONIBLE:
            journal.warning("Plotly n'est pas installé. Installation : pip install plotly")
            return None

        colonnes_metriques = [col for col in df_resultats.columns if col != "modele"]

        fig = go.Figure()

        for metrique in colonnes_metriques:
            fig.add_trace(go.Bar(
                x=df_resultats["modele"],
                y=df_resultats[metrique],
                name=metrique
            ))

        fig.update_layout(
            title="Comparaison des métriques par modèle",
            xaxis_title="Modèle",
            yaxis_title="Score",
            barmode="group",
            hovermode="x unified"
        )

        return fig

    @staticmethod
    def tracer_matrice_confusion_interactif(y_reel: np.ndarray,
                                            y_predit: np.ndarray):
        """Trace une matrice de confusion interactive."""
        if not PLOTLY_DISPONIBLE:
            journal.warning("Plotly n'est pas installé. Installation : pip install plotly")
            return None

        # nolll's matrice de confusion interactive (Plotly)
        mc = confusion_matrix(y_reel, y_predit)

        fig = go.Figure(data=go.Heatmap(
            z=mc,
            colorscale="Blues",
            hovertemplate="Prédit: %{x}<br>Réel: %{y}<br>Nombre: %{z}<extra></extra>"
        ))

        fig.update_layout(
            title="Matrice de confusion",
            xaxis_title="Prédit",
            yaxis_title="Réel"
        )

        return fig
