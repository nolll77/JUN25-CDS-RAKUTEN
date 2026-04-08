import { PageHeader } from "@/components/PageHeader";
import { MetricCard } from "@/components/MetricCard";
import { GlowCard } from "@/components/GlowCard";
import { Gauge, TrendingUp } from "lucide-react";

const topKPIs = [
  { label: "F1 Macro (Best)", value: "0.8734", delta: "Ensemble final", deltaType: "positive" as const, colorAccent: "primary" as const },
  { label: "Accuracy", value: "87.5%", delta: "Sur test set", deltaType: "positive" as const, colorAccent: "primary" as const },
  { label: "Produits classés", value: "84,916", delta: "Dataset complet", colorAccent: "accent" as const },
  { label: "Catégories", value: "27", delta: "Multi-classe", colorAccent: "accent" as const },
];

const dataKPIs = [
  { label: "Samples Train", value: "67,932", delta: "80% split" },
  { label: "Samples Test", value: "16,984", delta: "20% split" },
  { label: "Descriptions vides", value: "36.8%", delta: "31,249 produits", deltaType: "negative" as const },
  { label: "Langues détectées", value: "3", delta: "FR / EN / DE" },
  { label: "Longueur moy. texte", value: "142 chars", delta: "Après nettoyage" },
  { label: "Images disponibles", value: "84,916", delta: "500×500 px" },
  { label: "Taille dataset", value: "~12 GB", delta: "Images + textes" },
  { label: "Features TF-IDF", value: "50,000", delta: "Max features" },
];

const modelComparison = [
  { name: "Logistic Regression (TF-IDF)", f1: 0.8132, accuracy: 0.814, precision: 0.821, recall: 0.814 },
  { name: "Random Forest", f1: 0.7856, accuracy: 0.790, precision: 0.798, recall: 0.790 },
  { name: "SVM (Linear)", f1: 0.8210, accuracy: 0.823, precision: 0.830, recall: 0.823 },
  { name: "XGBoost", f1: 0.8421, accuracy: 0.845, precision: 0.850, recall: 0.845 },
  { name: "LightGBM", f1: 0.8503, accuracy: 0.853, precision: 0.858, recall: 0.853 },
  { name: "CamemBERT + LightGBM", f1: 0.8612, accuracy: 0.864, precision: 0.869, recall: 0.864 },
  { name: "Ensemble Final", f1: 0.8734, accuracy: 0.875, precision: 0.880, recall: 0.875 },
];

const imageKPIs = [
  { label: "EfficientNet-B0", value: "0.5547", delta: "F1 Macro", deltaType: "neutral" as const },
  { label: "ResNet-50", value: "0.5231", delta: "F1 Macro" },
  { label: "VGG-16", value: "0.4892", delta: "F1 Macro" },
  { label: "Image + Texte Fusion", value: "0.8734", delta: "+32% vs image seule", deltaType: "positive" as const },
];

const ragKPIs = [
  { label: "Faithfulness", value: "0.82", delta: "RAGAs score" },
  { label: "Answer Relevancy", value: "0.78", delta: "RAGAs score" },
  { label: "Context Precision", value: "0.85", delta: "RAGAs score", deltaType: "positive" as const },
  { label: "Context Recall", value: "0.73", delta: "Point faible", deltaType: "negative" as const },
];

const preprocessingKPIs = [
  { label: "Stopwords supprimés", value: "~23%", delta: "Du corpus" },
  { label: "Doublons retirés", value: "1,247", delta: "1.5% du total" },
  { label: "HTML nettoyé", value: "8,412", delta: "Descriptions" },
  { label: "Temps preprocessing", value: "~4 min", delta: "Pipeline complet" },
];

const topCategories = [
  { name: "Livres", count: 12_845, pct: 15.1 },
  { name: "Jeux vidéo", count: 8_932, pct: 10.5 },
  { name: "Jouets", count: 7_621, pct: 9.0 },
  { name: "Mode", count: 6_543, pct: 7.7 },
  { name: "High-tech", count: 5_987, pct: 7.1 },
  { name: "Maison & Jardin", count: 5_234, pct: 6.2 },
  { name: "Sport", count: 4_876, pct: 5.7 },
  { name: "Beauté", count: 4_321, pct: 5.1 },
];

export default function DashboardKPIs() {
  const bestF1 = Math.max(...modelComparison.map((m) => m.f1));

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto min-h-full space-y-12">
      <PageHeader
        icon={Gauge}
        title="KPIs Globaux"
        subtitle="Vue d'ensemble exhaustive des métriques clés du projet de classification multimodale Rakuten."
      />

      {/* ── Top-level KPIs ── */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {topKPIs.map((kpi, i) => (
            <MetricCard key={kpi.label} {...kpi} delay={0.1 + i * 0.05} />
          ))}
        </div>
      </section>

      <hr className="border-border/50" />

      {/* ── Dataset KPIs ── */}
      <section>
        <h2 className="font-mono text-base font-semibold text-foreground mb-5 flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-neon-blue" />
          Dataset & Preprocessing
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {dataKPIs.map((kpi, i) => (
            <MetricCard key={kpi.label} {...kpi} colorAccent="neon-blue" delay={0.2 + i * 0.04} />
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {preprocessingKPIs.map((kpi, i) => (
            <MetricCard key={kpi.label} {...kpi} colorAccent="neon-blue" delay={0.3 + i * 0.04} />
          ))}
        </div>
      </section>

      <hr className="border-border/50" />

      {/* ── Model Comparison Table ── */}
      <section>
        <h2 className="font-mono text-base font-semibold text-foreground mb-5 flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary" />
          Comparaison des modèles
        </h2>
        <GlowCard delay={0.35} className="border-l-[3px] border-l-primary">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 text-muted-foreground font-mono text-xs">Modèle</th>
                  <th className="text-right py-3 text-muted-foreground font-mono text-xs">F1 Macro</th>
                  <th className="text-right py-3 text-muted-foreground font-mono text-xs">Accuracy</th>
                  <th className="text-right py-3 text-muted-foreground font-mono text-xs">Precision</th>
                  <th className="text-right py-3 text-muted-foreground font-mono text-xs">Recall</th>
                </tr>
              </thead>
              <tbody>
                {modelComparison.map((m) => (
                  <tr key={m.name} className={`border-b border-border/50 ${m.f1 === bestF1 ? "bg-primary/10" : ""}`}>
                    <td className="py-3 text-foreground font-medium flex items-center gap-2">
                      {m.f1 === bestF1 && <TrendingUp className="h-3 w-3 text-primary" />}
                      {m.name}
                    </td>
                    <td className={`text-right py-3 font-mono ${m.f1 === bestF1 ? "text-primary font-bold" : "text-foreground"}`}>
                      {m.f1.toFixed(4)}
                    </td>
                    <td className="text-right py-3 font-mono text-muted-foreground">{(m.accuracy * 100).toFixed(1)}%</td>
                    <td className="text-right py-3 font-mono text-muted-foreground">{m.precision.toFixed(3)}</td>
                    <td className="text-right py-3 font-mono text-muted-foreground">{m.recall.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlowCard>
      </section>

      <hr className="border-border/50" />

      {/* ── Gains progressifs bar chart ── */}
      <section>
        <h2 className="font-mono text-base font-semibold text-foreground mb-5 flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-accent" />
          Gains progressifs – F1 Macro
        </h2>
        <GlowCard delay={0.6} className="border-l-[3px] border-l-accent">
          <p className="text-sm text-muted-foreground mb-6">
            Amélioration du F1 macro à chaque étape du pipeline.
          </p>
          <div className="flex items-end gap-3 h-48">
            {[
              { label: "Baseline", value: 0.61, color: "bg-muted-foreground/30" },
              { label: "TF-IDF + LR", value: 0.81, color: "bg-neon-blue/50" },
              { label: "SVM", value: 0.82, color: "bg-neon-blue/60" },
              { label: "XGBoost", value: 0.84, color: "bg-primary/60" },
              { label: "LightGBM", value: 0.85, color: "bg-primary/70" },
              { label: "BERT", value: 0.86, color: "bg-neon-purple/80" },
              { label: "Ensemble", value: 0.87, color: "bg-accent" },
            ].map((bar) => (
              <div key={bar.label} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[11px] font-mono font-semibold text-muted-foreground">{bar.value.toFixed(2)}</span>
                <div
                  className={`w-full rounded-t ${bar.color} transition-all`}
                  style={{ height: `${(bar.value / 0.9) * 100}%` }}
                />
                <span className="text-[10px] text-muted-foreground text-center leading-tight">{bar.label}</span>
              </div>
            ))}
          </div>
        </GlowCard>
      </section>

      <hr className="border-border/50" />

      {/* ── Image & RAG KPIs ── */}
      <section>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="font-mono text-base font-semibold text-foreground mb-5 flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-neon-orange" />
              Classification Image
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {imageKPIs.map((kpi, i) => (
                <MetricCard key={kpi.label} {...kpi} colorAccent="neon-orange" delay={0.4 + i * 0.04} />
              ))}
            </div>
          </div>
          <div>
            <h2 className="font-mono text-base font-semibold text-foreground mb-5 flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-neon-purple" />
              RAG – RAGAs Scores
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {ragKPIs.map((kpi, i) => (
                <MetricCard key={kpi.label} {...kpi} colorAccent="neon-purple" delay={0.45 + i * 0.04} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <hr className="border-border/50" />

      {/* ── Performance by modality + Top categories ── */}
      <section>
        <div className="grid md:grid-cols-2 gap-8">
          <GlowCard delay={0.5} className="border-l-[3px] border-l-primary">
            <h3 className="font-mono font-semibold text-foreground mb-4">Performance par modalité</h3>
            <div className="space-y-4">
              {[
                { label: "Texte seul (TF-IDF + SVM)", value: "0.8132", best: false },
                { label: "Image seule (EfficientNet)", value: "0.5547", best: false },
                { label: "Multimodal (Ensemble)", value: "0.8734", best: true },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className={`font-mono text-sm font-semibold ${item.best ? "text-accent" : "text-primary"}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </GlowCard>

          <GlowCard delay={0.55} className="border-l-[3px] border-l-accent">
            <h3 className="font-mono font-semibold text-foreground mb-4">Top 8 catégories</h3>
            <div className="space-y-2.5">
              {topCategories.map((cat, i) => {
                const colors = ["bg-primary", "bg-accent", "bg-neon-blue", "bg-neon-purple", "bg-neon-orange", "bg-neon-pink", "bg-primary/70", "bg-accent/70"];
                return (
                  <div key={cat.name} className="flex items-center gap-3">
                    <span className="text-sm text-foreground w-28 shrink-0">{cat.name}</span>
                    <div className="flex-1 h-4 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors[i]} rounded-full`}
                        style={{ width: `${(cat.pct / 16) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground w-14 text-right">{cat.pct}%</span>
                  </div>
                );
              })}
            </div>
          </GlowCard>
        </div>
      </section>

      <hr className="border-border/50" />

      {/* ── Training KPIs ── */}
      <section>
        <h2 className="font-mono text-base font-semibold text-foreground mb-5 flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-neon-pink" />
          Entraînement & Infrastructure
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="Temps total training" value="~2h30" delta="GPU T4" colorAccent="neon-pink" delay={0.65} />
          <MetricCard label="Epochs CamemBERT" value="3" delta="Fine-tuning" colorAccent="neon-pink" delay={0.7} />
          <MetricCard label="Batch size" value="32" delta="Optimal GPU" colorAccent="neon-pink" delay={0.75} />
          <MetricCard label="Learning rate" value="2e-5" delta="CamemBERT" colorAccent="neon-pink" delay={0.8} />
          <MetricCard label="Embeddings dim" value="768" delta="CamemBERT" colorAccent="neon-pink" delay={0.85} />
          <MetricCard label="FAISS vectors" value="84,916" delta="IndexFlatL2" colorAccent="neon-pink" delay={0.9} />
          <MetricCard label="Chunks RAG" value="~420k" delta="200 chars/chunk" colorAccent="neon-pink" delay={0.95} />
          <MetricCard label="Hallucination ↓" value="~30%" delta="Post-filtrage" deltaType="positive" colorAccent="neon-pink" delay={1.0} />
        </div>
      </section>
    </div>
  );
}
