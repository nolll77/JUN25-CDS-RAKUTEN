import { PageHeader } from "@/components/PageHeader";
import { GlowCard } from "@/components/GlowCard";
import { MetricCard } from "@/components/MetricCard";
import { Trophy, TrendingUp, TrendingDown } from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";

const confusionHighlights = [
  { from: "2583 (Meubles)", to: "2585 (Décoration)", confRate: "8.2%", reason: "Sémantique proche" },
  { from: "1280 (Jouets)", to: "1281 (Jeux société)", confRate: "6.5%", reason: "Catégories similaires" },
  { from: "2705 (Livres)", to: "2462 (Magazines)", confRate: "5.1%", reason: "Support papier" },
  { from: "1920 (Linge)", to: "1940 (Alimentaire)", confRate: "3.8%", reason: "Descriptions ambiguës" },
];

const perClassF1 = [
  { class: "2583", f1: 92 },
  { class: "1280", f1: 88 },
  { class: "2705", f1: 91 },
  { class: "2522", f1: 85 },
  { class: "1920", f1: 82 },
  { class: "1140", f1: 89 },
  { class: "2060", f1: 86 },
  { class: "1281", f1: 79 },
];

const precisionRecallData = [
  { class: "2583", precision: 93, recall: 91 },
  { class: "1280", precision: 87, recall: 89 },
  { class: "2705", precision: 92, recall: 90 },
  { class: "2522", precision: 84, recall: 86 },
  { class: "1920", precision: 80, recall: 84 },
  { class: "1140", precision: 90, recall: 88 },
  { class: "2060", precision: 85, recall: 87 },
  { class: "1281", precision: 78, recall: 80 },
];

const errorTypeData = [
  { name: "Sémantique proche", value: 38, color: "hsl(330, 70%, 56%)" },
  { name: "Catégories similaires", value: 26, color: "hsl(260, 60%, 58%)" },
  { name: "Description ambiguë", value: 20, color: "hsl(45, 90%, 55%)" },
  { name: "Image trompeuse", value: 11, color: "hsl(165, 80%, 48%)" },
  { name: "Autre", value: 5, color: "hsl(var(--muted-foreground))" },
];

const confidenceDistribution = [
  { range: "0-50%", correct: 120, incorrect: 280 },
  { range: "50-70%", correct: 1800, incorrect: 950 },
  { range: "70-85%", correct: 12400, incorrect: 1800 },
  { range: "85-95%", correct: 28500, incorrect: 620 },
  { range: "95-100%", correct: 38200, incorrect: 180 },
];

const modelComparisonTimeline = [
  { step: "Baseline", accuracy: 10.2, f1: 0.6 },
  { step: "Log. Reg.", accuracy: 78.9, f1: 75.4 },
  { step: "LightGBM", accuracy: 85.2, f1: 83.1 },
  { step: "Optuna", accuracy: 86.5, f1: 84.9 },
  { step: "Voting", accuracy: 87.1, f1: 85.6 },
  { step: "Stacking", accuracy: 88.4, f1: 87.3 },
];

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontFamily: "JetBrains Mono",
  fontSize: 11,
  color: "hsl(var(--foreground))",
};

export default function Resultats() {
  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <PageHeader
        icon={Trophy}
        title="Résultats"
        subtitle="Analyse détaillée des performances du meilleur modèle (Stacking Ensemble) : métriques globales, analyse par classe, et matrice de confusion."
        step="Étape 04"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Accuracy" value="88.4%" delta="Stacking" deltaType="positive" delay={0.1} />
        <MetricCard label="F1 Macro" value="87.3%" delta="Moyenne 27 classes" deltaType="positive" delay={0.15} />
        <MetricCard label="F1 Weighted" value="88.1%" delta="Pondéré par support" deltaType="positive" delay={0.2} />
        <MetricCard label="Balanced Acc" value="85.7%" delta="Équilibré" deltaType="positive" delay={0.25} />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <GlowCard delay={0.3}>
          <h3 className="font-mono text-sm font-semibold text-foreground mb-4">F1-Score par classe (Top 8)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={perClassF1}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="class" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "JetBrains Mono" }} />
              <Radar name="F1" dataKey="f1" stroke="hsl(165, 80%, 48%)" fill="hsl(165, 80%, 48%)" fillOpacity={0.2} animationDuration={4000} />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </GlowCard>

        <GlowCard delay={0.35}>
          <h3 className="font-mono text-sm font-semibold text-foreground mb-4">Precision vs Recall par classe</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={precisionRecallData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="class" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9, fontFamily: "JetBrains Mono" }} />
              <YAxis domain={[70, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "JetBrains Mono" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="precision" fill="hsl(165, 80%, 48%)" radius={[4, 4, 0, 0]} animationDuration={4000} name="Precision" />
              <Bar dataKey="recall" fill="hsl(260, 60%, 58%)" radius={[4, 4, 0, 0]} animationDuration={4000} name="Recall" />
              <Legend wrapperStyle={{ fontSize: 10, fontFamily: "JetBrains Mono" }} />
            </BarChart>
          </ResponsiveContainer>
        </GlowCard>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <GlowCard delay={0.4}>
          <h3 className="font-mono text-sm font-semibold text-foreground mb-4">Types d'erreurs</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={errorTypeData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} dataKey="value" animationDuration={4000} label={({ name, value }) => `${value}%`}>
                {errorTypeData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 10, fontFamily: "JetBrains Mono" }} />
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </GlowCard>

        <GlowCard delay={0.45}>
          <h3 className="font-mono text-sm font-semibold text-foreground mb-4">Distribution de confiance</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={confidenceDistribution} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="range" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9, fontFamily: "JetBrains Mono" }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "JetBrains Mono" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="correct" stackId="a" fill="hsl(165, 80%, 48%)" animationDuration={4000} name="Correct" />
              <Bar dataKey="incorrect" stackId="a" fill="hsl(0, 72%, 51%)" animationDuration={4000} name="Incorrect" radius={[4, 4, 0, 0]} />
              <Legend wrapperStyle={{ fontSize: 10, fontFamily: "JetBrains Mono" }} />
            </BarChart>
          </ResponsiveContainer>
        </GlowCard>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <GlowCard delay={0.5}>
          <h3 className="font-mono text-sm font-semibold text-foreground mb-4">
            <span className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Évolution Accuracy & F1
            </span>
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={modelComparisonTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="step" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9, fontFamily: "JetBrains Mono" }} angle={-20} textAnchor="end" height={50} />
              <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "JetBrains Mono" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="accuracy" stroke="hsl(165, 80%, 48%)" strokeWidth={2} dot={{ fill: "hsl(165, 80%, 48%)", r: 4 }} animationDuration={4000} name="Accuracy %" />
              <Line type="monotone" dataKey="f1" stroke="hsl(330, 70%, 56%)" strokeWidth={2} dot={{ fill: "hsl(330, 70%, 56%)", r: 4 }} animationDuration={4000} name="F1 Macro %" />
              <Legend wrapperStyle={{ fontSize: 10, fontFamily: "JetBrains Mono" }} />
            </LineChart>
          </ResponsiveContainer>
        </GlowCard>

        <GlowCard delay={0.55}>
          <h3 className="font-mono text-sm font-semibold text-foreground mb-4">Confusions fréquentes</h3>
          <div className="space-y-3">
            {confusionHighlights.map((c, i) => (
              <div key={i} className="p-3 rounded-lg bg-secondary/50 border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-foreground">{c.from}</span>
                  <TrendingDown className="h-3 w-3 text-destructive" />
                  <span className="font-mono text-xs text-foreground">{c.to}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{c.reason}</span>
                  <span className="font-mono text-xs text-neon-orange">{c.confRate}</span>
                </div>
              </div>
            ))}
          </div>
        </GlowCard>
      </div>

      <GlowCard delay={0.6}>
        <h3 className="font-mono text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Progression des performances
        </h3>
        <div className="space-y-2">
          {[
            { label: "Majority Baseline", f1: 0.6, color: "bg-muted-foreground" },
            { label: "Logistic Regression", f1: 75.4, color: "bg-neon-blue" },
            { label: "LightGBM", f1: 83.1, color: "bg-primary/70" },
            { label: "LGBM + Optuna", f1: 84.9, color: "bg-neon-orange" },
            { label: "Stacking Ensemble", f1: 87.3, color: "bg-primary" },
          ].map((m) => (
            <div key={m.label} className="flex items-center gap-3">
              <span className="font-mono text-xs text-muted-foreground w-36 shrink-0">{m.label}</span>
              <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                <div className={`h-full ${m.color} rounded-full transition-all`} style={{ width: `${m.f1}%` }} />
              </div>
              <span className="font-mono text-xs text-foreground w-14 text-right">{m.f1}%</span>
            </div>
          ))}
        </div>
      </GlowCard>
    </div>
  );
}
