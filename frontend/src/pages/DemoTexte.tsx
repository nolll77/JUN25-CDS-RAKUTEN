import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { GlowCard } from "@/components/GlowCard";
import { Play, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";

const SIMULATED_PREDICTIONS = [
  { code: 2583, label: "Meubles d'intérieur", proba: 0.72 },
  { code: 2585, label: "Décoration", proba: 0.15 },
  { code: 1920, label: "Linge de maison", proba: 0.08 },
  { code: 2060, label: "Décoration murale", proba: 0.03 },
  { code: 1140, label: "Figurines", proba: 0.02 },
];

export default function DemoTexte() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<typeof SIMULATED_PREDICTIONS | null>(null);

  const handlePredict = () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      const seed = text.length % 5;
      const shifted = [...SIMULATED_PREDICTIONS];
      if (seed > 0) {
        const first = shifted.splice(seed, 1);
        shifted.unshift(...first);
        const probas = [0.68, 0.14, 0.09, 0.05, 0.04];
        shifted.forEach((s, i) => (s.proba = probas[i]));
      }
      setResult(shifted);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <PageHeader
        icon={Play}
        title="Classification Texte"
        subtitle="Entrez une description de produit pour prédire sa catégorie."
        step="Démo interactive"
      />

      <GlowCard delay={0.1} className="mb-6">
        <label className="block font-mono text-xs text-muted-foreground mb-2 uppercase tracking-wider">
          Description du produit
        </label>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ex: Table basse en chêne massif, style scandinave, dimensions 120x60cm..."
          className="bg-secondary/50 border-border font-mono text-sm min-h-[100px] focus:border-primary/50 focus:ring-primary/20"
        />
        <div className="flex items-center gap-3 mt-4">
          <Button
            onClick={handlePredict}
            disabled={!text.trim() || loading}
            className="font-mono bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? (
              <>
                <Zap className="h-4 w-4 mr-2 animate-spin" />
                Inference...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Prédire (texte)
              </>
            )}
          </Button>
        </div>
      </GlowCard>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <GlowCard className="neon-border">
              <h3 className="font-mono text-sm font-semibold text-foreground mb-4">Prédictions texte (Top 5)</h3>
              <div className="space-y-3">
                {result.map((pred, i) => (
                  <div key={pred.code} className="flex items-center gap-3">
                    <span className={`font-mono text-xs w-6 ${i === 0 ? "text-primary font-bold" : "text-muted-foreground"}`}>
                      #{i + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-mono text-xs ${i === 0 ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                          {pred.code} – {pred.label}
                        </span>
                        <span className={`font-mono text-xs ${i === 0 ? "text-primary" : "text-muted-foreground"}`}>
                          {(pred.proba * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pred.proba * 100}%` }}
                          transition={{ delay: i * 0.1, duration: 0.5 }}
                          className={`h-full rounded-full ${i === 0 ? "bg-primary" : "bg-muted-foreground/30"}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlowCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
