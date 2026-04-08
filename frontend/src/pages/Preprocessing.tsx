import { PageHeader } from "@/components/PageHeader";
import { GlowCard } from "@/components/GlowCard";
import { Settings2, ArrowRight } from "lucide-react";

const pipelineSteps = [
  {
    title: "Nettoyage Texte",
    tech: "spaCy fr_core_news_md",
    details: [
      "Lowercasing + suppression HTML/URLs",
      "Lemmatisation française",
      "Suppression stopwords (NLTK + custom)",
      "Normalisation unicode & accents",
    ],
  },
  {
    title: "Features Texte – TF-IDF",
    tech: "scikit-learn TfidfVectorizer + TruncatedSVD",
    details: [
      "TF-IDF sur texte nettoyé (max_features=50000)",
      "Réduction SVD → 300 dimensions",
      "Capture les patterns de fréquence de mots",
    ],
  },
  {
    title: "Features Texte – CamemBERT",
    tech: "HuggingFace transformers",
    details: [
      "camembert-base (110M params)",
      "Mean pooling sur les hidden states",
      "Embeddings 768 dimensions",
      "Batch processing avec cache disque",
    ],
  },
  {
    title: "Features Image – EfficientNet",
    tech: "timm / PyTorch",
    details: [
      "EfficientNet-B0 pré-entraîné ImageNet",
      "Feature extraction (couche avant le head)",
      "SVD → 300 dimensions",
      "Batch de 64 images avec disk swap",
    ],
  },
  {
    title: "Fusion Multimodale",
    tech: "numpy concatenation",
    details: [
      "Concaténation : TF-IDF(300d) + CamemBERT(768d) + Image(300d)",
      "Vecteur final : 1368 dimensions",
      "Sauvegarde .npy avec memmap",
    ],
  },
];

export default function Preprocessing() {
  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <PageHeader
        icon={Settings2}
        title="Preprocessing"
        subtitle="Pipeline de feature engineering multimodale : nettoyage texte, extraction d'embeddings, compression et fusion."
        step="Étape 02"
      />

      <div className="space-y-4">
        {pipelineSteps.map((step, i) => (
          <GlowCard key={step.title} delay={0.1 + i * 0.1}>
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center shrink-0">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="font-mono text-xs font-bold text-primary">{i + 1}</span>
                </div>
                {i < pipelineSteps.length - 1 && (
                  <div className="w-px h-8 bg-border mt-2" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-mono font-semibold text-foreground text-sm">{step.title}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {step.tech}
                  </span>
                </div>
                <ul className="space-y-1 mt-2">
                  {step.details.map((d, j) => (
                    <li key={j} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ArrowRight className="h-3 w-3 text-primary/40 shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </GlowCard>
        ))}
      </div>

      <GlowCard delay={0.7} className="mt-8">
        <h3 className="font-mono text-sm font-semibold text-foreground mb-3">Récapitulatif Features</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "TF-IDF + SVD", dim: "300d", color: "bg-primary/20 text-primary" },
            { label: "CamemBERT", dim: "768d", color: "bg-accent/20 text-accent" },
            { label: "EfficientNet + SVD", dim: "300d", color: "bg-neon-pink/20 text-neon-pink" },
          ].map((f) => (
            <div key={f.label} className="text-center p-3 rounded-lg bg-secondary/50">
              <span className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded-full ${f.color} mb-2`}>
                {f.dim}
              </span>
              <p className="font-mono text-xs text-foreground">{f.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <span className="font-mono text-lg font-bold text-gradient">= 1,368 dimensions</span>
          <p className="text-xs text-muted-foreground mt-1">Vecteur final par produit</p>
        </div>
      </GlowCard>
    </div>
  );
}
