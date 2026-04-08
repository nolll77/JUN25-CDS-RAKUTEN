import { PageHeader } from "@/components/PageHeader";
import { GlowCard } from "@/components/GlowCard";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";

const milestones = [
  { phase: "Phase 1", title: "Exploration des données", desc: "Analyse de 84k+ produits, distribution des catégories, qualité des images et du texte.", status: "done" },
  { phase: "Phase 2", title: "Preprocessing", desc: "Nettoyage spaCy, TF-IDF + SVD, extraction features EfficientNet-B0.", status: "done" },
  { phase: "Phase 3", title: "Baselines", desc: "Logistic Regression, Random Forest, SVM — F1 macro ~0.81.", status: "done" },
  { phase: "Phase 4", title: "Boosting", desc: "XGBoost, LightGBM avec tuning Optuna — F1 macro ~0.85.", status: "done" },
  { phase: "Phase 5", title: "Embeddings BERT", desc: "CamemBERT fine-tuning + fusion features — F1 macro ~0.86.", status: "done" },
  { phase: "Phase 6", title: "Ensemble final", desc: "Stacking + vote pondéré — F1 macro 0.8734.", status: "done" },
  { phase: "Phase 7", title: "Déploiement & Démo", desc: "API de prédiction, interface de démonstration interactive.", status: "done" },
  { phase: "Ouverture", title: "RAG & Agents", desc: "Exploration de RAG, pipelines avancés et agents IA.", status: "current" },
];

export default function DashboardTimeline() {
  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto min-h-full">
      <PageHeader
        icon={Clock}
        title="Timeline du Projet"
        subtitle="Chronologie des étapes et jalons du pipeline de classification."
      />

      <div className="relative">
        <div className="absolute left-4 md:left-6 top-0 bottom-0 w-px bg-border" />

        <div className="space-y-6">
          {milestones.map((m, i) => (
            <motion.div
              key={m.phase}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative pl-12 md:pl-16"
            >
              <div className={`absolute left-2.5 md:left-4.5 top-2 w-3 h-3 rounded-full border-2 ${
                m.status === "current"
                  ? "bg-accent border-accent animate-pulse"
                  : "bg-primary border-primary"
              }`} />

              <GlowCard delay={0.1 + i * 0.05} className="!p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">{m.phase}</span>
                    <h3 className="font-mono font-semibold text-foreground text-sm mt-0.5">{m.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{m.desc}</p>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 ${
                    m.status === "current"
                      ? "bg-accent/10 text-accent"
                      : "bg-primary/10 text-primary"
                  }`}>
                    {m.status === "current" ? "En cours" : "Terminé"}
                  </span>
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
