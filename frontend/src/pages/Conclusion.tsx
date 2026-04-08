import { PageHeader } from "@/components/PageHeader";
import { GlowCard } from "@/components/GlowCard";
import { FileText, CheckCircle, Lightbulb, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const conclusions = [
  "L'approche multimodale (texte + image) surpasse les approches unimodales",
  "CamemBERT + EfficientNet offrent les meilleures features",
  "Le Stacking Ensemble atteint 87.3% F1 macro sur 27 classes",
  "L'optimisation Optuna améliore la robustesse (+2% F1)",
  "Les confusions résiduelles sont entre catégories sémantiquement proches",
];

const businessInsights = [
  "Applicable en production pour le tri automatique de catalogues",
  "Les classes sensibles (sécurité, alimentaire) ont des F1 > 85%",
  "Le pipeline de preprocessing est reproductible et cache-friendly",
  "Temps d'inférence compatible avec du temps réel (< 100ms)",
];

const ouvertures = [
  { title: "Fine-tuning CamemBERT", desc: "Adapter le modèle de langue sur le corpus Rakuten spécifique", link: null },
  { title: "Modèles deep multimodaux", desc: "Attention cross-modale entre texte et image (CLIP-like)", link: null },
  { title: "RAG pour enrichissement", desc: "Retrieval-Augmented Generation pour les descriptions courtes", link: "/rag" },
  { title: "AI Agents", desc: "Orchestration intelligente avec LangGraph", link: "/agents" },
];

export default function Conclusion() {
  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <PageHeader
        icon={FileText}
        title="Conclusion"
        subtitle="Bilan du projet, conclusions scientifiques et métier, et perspectives d'amélioration."
        step="Étape 05"
      />

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <GlowCard delay={0.1}>
          <h3 className="font-mono text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-primary" />
            Conclusions scientifiques
          </h3>
          <ul className="space-y-3">
            {conclusions.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary font-mono text-xs mt-0.5">✓</span>
                {c}
              </li>
            ))}
          </ul>
        </GlowCard>

        <GlowCard delay={0.2}>
          <h3 className="font-mono text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-neon-orange" />
            Conclusions métier
          </h3>
          <ul className="space-y-3">
            {businessInsights.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-neon-orange font-mono text-xs mt-0.5">▸</span>
                {c}
              </li>
            ))}
          </ul>
        </GlowCard>
      </div>

      <GlowCard delay={0.3}>
        <h3 className="font-mono text-sm font-semibold text-foreground mb-4">Ouvertures & Perspectives</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {ouvertures.map((o, i) => (
            <div key={i} className="p-4 rounded-lg bg-secondary/50 border border-border hover:border-accent/30 transition-colors group">
              <h4 className="font-mono text-sm font-semibold text-foreground mb-1">{o.title}</h4>
              <p className="text-xs text-muted-foreground mb-2">{o.desc}</p>
              {o.link && (
                <Link to={o.link} className="inline-flex items-center gap-1 text-xs font-mono text-accent hover:underline">
                  Explorer <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </GlowCard>
    </div>
  );
}
