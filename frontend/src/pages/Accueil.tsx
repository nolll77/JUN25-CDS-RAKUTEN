import { motion } from "framer-motion";
import { PageHeader } from "@/components/PageHeader";
import { GlowCard } from "@/components/GlowCard";
import { MetricCard } from "@/components/MetricCard";
import { Home, ArrowRight, Layers, Brain, Image, Type } from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  { num: "01", title: "Exploration", desc: "Analyse exploratoire des 84k+ produits", link: "/exploration", color: "text-primary" },
  { num: "02", title: "Preprocessing", desc: "Nettoyage texte + extraction features image", link: "/preprocessing", color: "text-neon-purple" },
  { num: "03", title: "Modélisation", desc: "Baselines → Boosting → Ensembles", link: "/modeles", color: "text-neon-pink" },
  { num: "04", title: "Résultats", desc: "Métriques finales et analyse d'erreurs", link: "/resultats", color: "text-neon-orange" },
];

export default function Accueil() {
  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto grid-bg min-h-full">
      <PageHeader
        icon={Home}
        title="Projet Rakuten"
        subtitle="Classification multimodale de produits e-commerce : texte + images → 27 catégories. Pipeline complète de Data Science, du preprocessing au déploiement."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <MetricCard label="Produits" value="84,916" delta="Dataset Rakuten" delay={0.1} />
        <MetricCard label="Catégories" value="27" delta="Classification multi-classe" delay={0.15} />
        <MetricCard label="Best F1 Macro" value="0.8734" delta="+42% vs baseline" deltaType="positive" delay={0.2} />
        <MetricCard label="Modèles testés" value="8+" delta="Baselines → Ensembles" delay={0.25} />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-10">
        <GlowCard delay={0.3} className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Type className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-mono font-semibold text-foreground mb-1">Texte</h3>
            <p className="text-sm text-muted-foreground">
              Designation + Description → Nettoyage spaCy → TF-IDF + SVD (300d) + CamemBERT embeddings (768d)
            </p>
          </div>
        </GlowCard>
        <GlowCard delay={0.35} className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
            <Image className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h3 className="font-mono font-semibold text-foreground mb-1">Images</h3>
            <p className="text-sm text-muted-foreground">
              EfficientNet-B0 feature extraction → SVD compression (300d) → Fusion multimodale
            </p>
          </div>
        </GlowCard>
      </div>

      <GlowCard delay={0.4} className="mb-10">
        <h3 className="font-mono font-semibold text-foreground mb-1 flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          Pipeline Overview
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Chaque étape du projet est documentée et reproductible. Cliquez pour explorer.
        </p>
        <div className="grid md:grid-cols-4 gap-3">
          {steps.map((step, i) => (
            <Link key={step.num} to={step.link}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="group p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/30 transition-all cursor-pointer"
              >
                <span className={`font-mono text-xs ${step.color} opacity-60`}>STEP {step.num}</span>
                <h4 className="font-mono font-semibold text-foreground text-sm mt-1">{step.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{step.desc}</p>
                <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-primary mt-2 transition-colors" />
              </motion.div>
            </Link>
          ))}
        </div>
      </GlowCard>

      <GlowCard delay={0.6}>
        <div className="flex items-center gap-3">
          <Brain className="h-5 w-5 text-accent" />
          <div>
            <h3 className="font-mono font-semibold text-foreground text-sm">Ouvertures</h3>
            <p className="text-xs text-muted-foreground">RAG, AI Agents, Fine-tuning CamemBERT, Modèles deep multimodaux</p>
          </div>
          <Link to="/rag" className="ml-auto text-xs font-mono text-accent hover:underline">
            Explorer →
          </Link>
        </div>
      </GlowCard>
    </div>
  );
}
