import { PageHeader } from "@/components/PageHeader";
import { GlowCard } from "@/components/GlowCard";
import { MetricCard } from "@/components/MetricCard";
import { FileText, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const sections = [
  { title: "Exploration", desc: "Analyse exploratoire de 84k+ produits", link: "/exploration", status: "Complet" },
  { title: "Preprocessing", desc: "Pipeline texte + image", link: "/preprocessing", status: "Complet" },
  { title: "Modèles", desc: "8+ architectures évaluées", link: "/modeles", status: "Complet" },
  { title: "Résultats", desc: "F1 0.87, accuracy 87.5%", link: "/resultats", status: "Complet" },
  { title: "Démo", desc: "Interface de prédiction live", link: "/demo", status: "Actif" },
  { title: "RAG & Agents", desc: "Extensions avancées", link: "/rag", status: "Exploration" },
];

export default function DashboardResume() {
  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto min-h-full">
      <PageHeader
        icon={FileText}
        title="Résumé"
        subtitle="Synthèse du projet avec liens rapides vers chaque section."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard label="F1 Macro" value="0.8734" delta="Best score" deltaType="positive" delay={0.1} />
        <MetricCard label="Gain vs baseline" value="+42%" delta="0.61 → 0.87" deltaType="positive" delay={0.15} />
        <MetricCard label="Modalités" value="2" delta="Texte + Image" delay={0.2} />
        <MetricCard label="Pipeline" value="E2E" delta="Exploration → Démo" delay={0.25} />
      </div>

      <GlowCard delay={0.3} className="mb-8">
        <h3 className="font-mono font-semibold text-foreground mb-2">Résumé</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Ce projet réalise la classification automatique de produits e-commerce Rakuten en 27 catégories,
          en combinant des features textuelles (TF-IDF, CamemBERT) et visuelles (EfficientNet-B0).
          L'approche ensemble (stacking + vote pondéré) atteint un F1 macro de <strong className="text-foreground">0.8734</strong>,
          soit une amélioration de +42% par rapport à la baseline. Le pipeline est entièrement reproductible
          et inclut une interface de démonstration interactive.
        </p>
      </GlowCard>

      <GlowCard delay={0.4}>
        <h3 className="font-mono font-semibold text-foreground mb-4">Accès rapide</h3>
        <div className="grid md:grid-cols-3 gap-3">
          {sections.map((s, i) => (
            <Link key={s.title} to={s.link}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
                className="group p-3 rounded-lg bg-secondary/50 border border-border hover:border-primary/30 transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-mono font-semibold text-foreground text-sm">{s.title}</h4>
                  <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{s.status}</span>
                </div>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
                <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-primary mt-2 transition-colors" />
              </motion.div>
            </Link>
          ))}
        </div>
      </GlowCard>
    </div>
  );
}
