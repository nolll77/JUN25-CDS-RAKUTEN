import { PageHeader } from "@/components/PageHeader";
import { GlowCard } from "@/components/GlowCard";
import { Network, ArrowRight, Database, Search, Brain, Shield, Layers, BarChart2, Scissors, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface PipelineNode {
  label: string;
  icon: React.ElementType;
}

interface ProjectStep {
  notebook: string;
  title: string;
  tag: string;
  tagColor: string;
  description: string;
  pipeline: PipelineNode[];
  details: string[];
  finding?: string;
}

const projectSteps: ProjectStep[] = [
  {
    notebook: "6.0.1",
    title: "Classic RAG – Baseline",
    tag: "Baseline",
    tagColor: "text-teal-700 dark:text-neon-cyan",
    description:
      "Premier pipeline : chunking fixe des textes produits (designation + description), indexation FAISS, recherche par similarité cosinus, puis génération LLM pour enrichir les descriptions courtes.",
    pipeline: [
      { label: "Textes Rakuten", icon: Layers },
      { label: "Chunking (200 chars)", icon: Scissors },
      { label: "Embeddings", icon: Brain },
      { label: "FAISS Index", icon: Database },
      { label: "Similarity Search", icon: Search },
      { label: "LLM Generation", icon: Brain },
    ],
    details: [
      "84 916 textes (designation + description)",
      "Chunking fixe à 200 caractères",
      "FAISS IndexFlatL2 pour le prototype",
      "Objectif : enrichir les 36.8% sans description",
    ],
    finding: "Pipeline fonctionnel mais recall limité avec un seul mode de recherche.",
  },
  {
    notebook: "6.0.2",
    title: "Fusion Retrieval – BM25 + Dense",
    tag: "Optimisé",
    tagColor: "text-orange-700 dark:text-neon-orange",
    description:
      "Amélioration du recall en combinant recherche lexicale (BM25) et recherche dense (embeddings). Fusion via Reciprocal Rank Fusion (RRF).",
    pipeline: [
      { label: "Query", icon: Search },
      { label: "BM25 (lexical)", icon: Search },
      { label: "Dense Embeddings", icon: Brain },
      { label: "RRF Fusion", icon: Zap },
      { label: "Top-k Contexte", icon: Layers },
      { label: "LLM", icon: Brain },
    ],
    details: [
      "BM25 pour la correspondance lexicale exacte",
      "Dense embeddings pour la similarité sémantique",
      "Reciprocal Rank Fusion (α = 0.5)",
      "Meilleur recall que le mode unique",
    ],
    finding: "La fusion BM25 + Dense améliore significativement le recall vs. un seul retriever.",
  },
  {
    notebook: "6.0.3",
    title: "RAGAs – Évaluation automatisée",
    tag: "Évaluation",
    tagColor: "text-primary",
    description:
      "Mise en place de métriques RAGAs pour évaluer objectivement la qualité du pipeline : Faithfulness, Answer Relevancy, Context Precision, Context Recall.",
    pipeline: [
      { label: "Questions test", icon: Search },
      { label: "Pipeline RAG", icon: Zap },
      { label: "Réponses générées", icon: Brain },
      { label: "RAGAs Scorer", icon: BarChart2 },
      { label: "Métriques", icon: BarChart2 },
    ],
    details: [
      "Faithfulness : 0.82 – fidélité au contexte",
      "Answer Relevancy : 0.78 – pertinence réponse",
      "Context Precision : 0.85 – précision contexte",
      "Context Recall : 0.73 – couverture info",
    ],
    finding: "Context Recall est le point faible → motivant l'optimisation du retrieval (6.0.5).",
  },
  {
    notebook: "6.0.4",
    title: "Context Length Strategies",
    tag: "Contexte",
    tagColor: "text-violet-700 dark:text-neon-purple",
    description:
      "Exploration de stratégies pour gérer la longueur du contexte : chunking adaptatif, filtrage sélectif par mots-clés, et résumé de contexte avant injection dans le prompt.",
    pipeline: [
      { label: "Textes bruts", icon: Layers },
      { label: "Chunking (200 chars)", icon: Scissors },
      { label: "Filtrage sélectif", icon: Search },
      { label: "Résumé contexte", icon: Brain },
      { label: "Prompt optimisé", icon: Zap },
    ],
    details: [
      "Chunking fixe à 200 caractères",
      "Filtrage par mot-clé sur les chunks",
      "Résumé heuristique du contexte long",
      "Réduction du bruit dans le prompt",
    ],
    finding: "Le filtrage sélectif réduit les chunks non pertinents avant la génération.",
  },
  {
    notebook: "6.0.5",
    title: "Retrieval Optimization",
    tag: "Retrieval",
    tagColor: "text-accent",
    description:
      "Optimisation du retrieval via query expansion (paraphrase, variantes) et filtrage contextuel par métadonnées pour améliorer la pertinence.",
    pipeline: [
      { label: "Query originale", icon: Search },
      { label: "Query Expansion", icon: Zap },
      { label: "Queries multiples", icon: Search },
      { label: "Filtrage métadonnées", icon: Layers },
      { label: "Contexte enrichi", icon: Database },
    ],
    details: [
      "Expansion : 'jouet en bois' → 3 variantes",
      "Paraphrase et synonymes automatiques",
      "Filtrage par catégorie / metadata",
      "Amélioration du Context Recall",
    ],
    finding: "L'expansion de requête améliore le recall de +12% sur les tests.",
  },
  {
    notebook: "6.0.6",
    title: "Vector DB & Indexing",
    tag: "Indexation",
    tagColor: "text-teal-700 dark:text-neon-cyan",
    description:
      "Comparaison de stratégies d'indexation FAISS pour la scalabilité : IndexFlatL2 (exact) vs IndexIVFFlat (approché) sur les vecteurs produits.",
    pipeline: [
      { label: "Vecteurs (128d)", icon: Brain },
      { label: "FAISS Flat", icon: Database },
      { label: "FAISS IVF", icon: Database },
      { label: "Benchmark", icon: BarChart2 },
      { label: "Choix index", icon: Zap },
    ],
    details: [
      "IndexFlatL2 : exact, O(n) – 1000 vecteurs test",
      "IndexIVFFlat : approché, nlist=50 clusters",
      "IVF ~10x plus rapide sur gros volumes",
      "Trade-off précision vs vitesse",
    ],
    finding: "IVF recommandé en production (>100k vecteurs), Flat suffisant pour le prototype.",
  },
  {
    notebook: "6.0.7",
    title: "Hallucination Mitigation",
    tag: "Fiabilité",
    tagColor: "text-rose-700 dark:text-neon-pink",
    description:
      "Stratégies pour réduire les hallucinations du LLM : vérification qualité des données en entrée, seuils de confiance, et validation du contexte récupéré.",
    pipeline: [
      { label: "Data Quality", icon: Shield },
      { label: "Détection vides", icon: Search },
      { label: "Seuils confiance", icon: BarChart2 },
      { label: "Validation contexte", icon: Shield },
      { label: "Réponse fiable", icon: Zap },
    ],
    details: [
      "Détection des descriptions vides/courtes",
      "Seuil de similarité minimum pour le contexte",
      "Prompt engineering anti-hallucination",
      "Citations obligatoires dans la réponse",
    ],
    finding: "Le filtrage qualité en amont réduit les hallucinations de ~30%.",
  },
];

function PipelineFlow({ nodes, delay }: { nodes: PipelineNode[]; delay: number }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-3">
      {nodes.map((node, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay + i * 0.06, duration: 0.3 }}
          className="flex items-center gap-1.5"
        >
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-secondary border border-border text-xs font-mono text-foreground">
            <node.icon className="h-3 w-3 text-foreground/60" />
            {node.label}
          </div>
          {i < nodes.length - 1 && (
            <ArrowRight className="h-3 w-3 text-primary/50 shrink-0" />
          )}
        </motion.div>
      ))}
    </div>
  );
}

export default function RAGPatterns() {
  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <PageHeader
        icon={Network}
        title="RAG Pipeline"
        subtitle="Détail des 7 notebooks RAG du projet Rakuten : du pipeline naïf à la mitigation d'hallucinations, chaque étape avec son pipeline et ses résultats."
        step="Notebooks 6.0.1 → 6.0.7"
      />

      <GlowCard delay={0.1} className="mb-8">
        <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent/10 text-accent mb-3">
          EXPLORATION RAG – Catalogue Rakuten
        </span>
        <p className="text-sm text-muted-foreground">
          Ces 7 notebooks explorent l'utilisation du <span className="text-foreground font-semibold">Retrieval-Augmented Generation</span> pour
          enrichir les <span className="text-accent font-semibold">36.8% de produits</span> ayant des descriptions manquantes ou trop courtes.
          L'objectif : récupérer du contexte similaire pour améliorer les embeddings et la classification finale.
        </p>
      </GlowCard>

      <div className="space-y-5">
        {projectSteps.map((step, i) => (
          <GlowCard key={step.notebook} delay={0.15 + i * 0.07}>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                  {step.notebook}
                </span>
                <h3 className="font-mono text-base font-bold text-foreground">{step.title}</h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary border border-border ${step.tagColor}`}>
                  {step.tag}
                </span>
              </div>

              <p className="text-sm text-muted-foreground">{step.description}</p>

              <PipelineFlow nodes={step.pipeline} delay={0.2 + i * 0.07} />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {step.details.map((d, j) => (
                  <div key={j} className="text-[11px] text-secondary-foreground bg-secondary rounded px-2.5 py-1.5 border border-border">
                    <span className="text-primary mr-1">▸</span>{d}
                  </div>
                ))}
              </div>

              {step.finding && (
                <div className="mt-1 px-3 py-2 rounded-md bg-primary/10 border border-primary/30 text-xs text-primary font-medium">
                  <span className="font-mono font-semibold mr-1">Finding :</span>{step.finding}
                </div>
              )}
            </div>
          </GlowCard>
        ))}
      </div>
    </div>
  );
}
