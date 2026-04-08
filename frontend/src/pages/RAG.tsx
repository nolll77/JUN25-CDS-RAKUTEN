import { PageHeader } from "@/components/PageHeader";
import { GlowCard } from "@/components/GlowCard";
import { Database, Search, Layers, Shield, BarChart2 } from "lucide-react";

const ragPipeline = [
  {
    icon: Search,
    title: "Classic RAG",
    desc: "Chunking → FAISS index → Similarity search → LLM generation",
    notebook: "6.0.1",
  },
  {
    icon: Layers,
    title: "Fusion Retrieval",
    desc: "BM25 + Dense embeddings → Reciprocal Rank Fusion → Meilleur recall",
    notebook: "6.0.2",
  },
  {
    icon: BarChart2,
    title: "RAGAs Evaluation",
    desc: "Faithfulness, Answer Relevancy, Context Precision – métriques automatisées",
    notebook: "6.0.3",
  },
  {
    icon: Database,
    title: "Vector DB & Indexing",
    desc: "FAISS IVF vs Flat, HNSW, stratégies d'indexation pour la scalabilité",
    notebook: "6.0.6",
  },
  {
    icon: Shield,
    title: "Hallucination Mitigation",
    desc: "Data quality checks, prompt engineering, confidence thresholds",
    notebook: "6.0.7",
  },
];

const ragMetrics = [
  { metric: "Faithfulness", value: "0.82", desc: "Réponse fidèle au contexte" },
  { metric: "Answer Relevancy", value: "0.78", desc: "Pertinence de la réponse" },
  { metric: "Context Precision", value: "0.85", desc: "Précision du contexte récupéré" },
  { metric: "Context Recall", value: "0.73", desc: "Couverture des infos nécessaires" },
];

export default function RAG() {
  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <PageHeader
        icon={Database}
        title="RAG"
        subtitle="Retrieval-Augmented Generation appliqué au catalogue Rakuten : enrichir les descriptions courtes avec du contexte pour améliorer la classification."
        step="Ouverture"
      />

      <GlowCard delay={0.1} className="mb-8">
        <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent/10 text-accent mb-3">
          ÉBAUCHE – Piste exploratoire
        </span>
        <p className="text-sm text-muted-foreground">
          Ces notebooks explorent l'utilisation du RAG pour enrichir automatiquement les produits ayant des descriptions
          manquantes ou trop courtes (36.8% du dataset). L'idée : récupérer du contexte similaire pour améliorer
          les embeddings et la classification.
        </p>
      </GlowCard>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {ragPipeline.map((step, i) => (
          <GlowCard key={step.title} delay={0.15 + i * 0.08}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <step.icon className="h-4 w-4 text-accent" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-mono text-sm font-semibold text-foreground">{step.title}</h4>
                </div>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
                <span className="text-[10px] font-mono text-accent/60 mt-2 inline-block">
                  Notebook {step.notebook}
                </span>
              </div>
            </div>
          </GlowCard>
        ))}
      </div>

      <GlowCard delay={0.5}>
        <h3 className="font-mono text-sm font-semibold text-foreground mb-4">RAGAs Metrics (Simulées)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ragMetrics.map((m) => (
            <div key={m.metric} className="text-center p-3 rounded-lg bg-secondary/50">
              <span className="block font-mono text-xl font-bold text-accent">{m.value}</span>
              <span className="block font-mono text-xs text-foreground mt-1">{m.metric}</span>
              <span className="block text-[10px] text-muted-foreground mt-0.5">{m.desc}</span>
            </div>
          ))}
        </div>
      </GlowCard>
    </div>
  );
}
