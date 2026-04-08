import { PageHeader } from "@/components/PageHeader";
import { GlowCard } from "@/components/GlowCard";
import { BarChart3 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  ScatterChart, Scatter, ZAxis,
} from "recharts";

// --- DATA ---

const barData = [
  { name: "LR", f1: 0.8132 },
  { name: "RF", f1: 0.7856 },
  { name: "XGB", f1: 0.8421 },
  { name: "LGBM", f1: 0.8503 },
  { name: "BERT+LGBM", f1: 0.8612 },
  { name: "Ensemble", f1: 0.8734 },
];

const radarData = [
  { metric: "Precision", texte: 0.82, image: 0.56, multi: 0.88 },
  { metric: "Recall", texte: 0.81, image: 0.55, multi: 0.87 },
  { metric: "F1", texte: 0.81, image: 0.55, multi: 0.87 },
  { metric: "Top-3 Acc", texte: 0.94, image: 0.78, multi: 0.96 },
  { metric: "Vitesse", texte: 0.9, image: 0.7, multi: 0.6 },
];

const perClassPerformance = [
  { class: "2583", precision: 93, recall: 91, f1: 92, support: 8640 },
  { class: "1280", precision: 87, recall: 89, f1: 88, support: 6720 },
  { class: "2705", precision: 92, recall: 90, f1: 91, support: 5890 },
  { class: "2522", precision: 84, recall: 86, f1: 85, support: 5510 },
  { class: "1920", precision: 80, recall: 84, f1: 82, support: 5200 },
  { class: "1140", precision: 90, recall: 88, f1: 89, support: 4980 },
  { class: "2060", precision: 85, recall: 87, f1: 86, support: 4620 },
  { class: "1281", precision: 78, recall: 80, f1: 79, support: 4100 },
];

const modelEvolution = [
  { step: "Majority", accuracy: 10.2, f1: 0.6, weighted: 1.2 },
  { step: "Log. Reg.", accuracy: 78.9, f1: 75.4, weighted: 77.1 },
  { step: "RF", accuracy: 80.1, f1: 78.6, weighted: 79.3 },
  { step: "XGB", accuracy: 84.7, f1: 82.4, weighted: 83.5 },
  { step: "LGBM", accuracy: 85.2, f1: 83.1, weighted: 84.2 },
  { step: "Optuna", accuracy: 86.5, f1: 84.9, weighted: 85.8 },
  { step: "Voting", accuracy: 87.1, f1: 85.6, weighted: 86.4 },
  { step: "Stacking", accuracy: 88.4, f1: 87.3, weighted: 88.1 },
];

const errorTypeData = [
  { name: "Sémantique proche", value: 38, color: "hsl(330, 70%, 56%)" },
  { name: "Catégories similaires", value: 26, color: "hsl(260, 60%, 58%)" },
  { name: "Description ambiguë", value: 20, color: "hsl(45, 90%, 55%)" },
  { name: "Image trompeuse", value: 11, color: "hsl(165, 80%, 48%)" },
  { name: "Autre", value: 5, color: "hsl(var(--muted-foreground))" },
];

const confidenceData = [
  { range: "0-50%", correct: 120, incorrect: 280 },
  { range: "50-70%", correct: 1800, incorrect: 950 },
  { range: "70-85%", correct: 12400, incorrect: 1800 },
  { range: "85-95%", correct: 28500, incorrect: 620 },
  { range: "95-100%", correct: 38200, incorrect: 180 },
];

const modalityContrib = [
  { name: "Texte seul", value: 81.3, color: "hsl(165, 80%, 48%)" },
  { name: "Image seule", value: 55.2, color: "hsl(260, 60%, 58%)" },
  { name: "Texte + Image", value: 87.3, color: "hsl(330, 70%, 56%)" },
];

const f1VsSupport = perClassPerformance.map(d => ({
  x: d.support,
  y: d.f1,
  z: d.precision,
  name: d.class,
}));

const trainingTime = [
  { model: "LR", time: 12, f1: 75.4 },
  { model: "RF", time: 45, f1: 78.6 },
  { model: "XGB", time: 38, f1: 82.4 },
  { model: "LGBM", time: 28, f1: 83.1 },
  { model: "Optuna", time: 420, f1: 84.9 },
  { model: "Voting", time: 85, f1: 85.6 },
  { model: "Stacking", time: 180, f1: 87.3 },
];

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontFamily: "JetBrains Mono",
  fontSize: 11,
  color: "hsl(var(--foreground))",
};

const tickStyle = { fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "JetBrains Mono" };

export default function DashboardGraphiques() {
  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto min-h-full">
      <PageHeader
        icon={BarChart3}
        title="Graphiques Comparatifs"
        subtitle="Vue d'ensemble complète : performances par modèle, modalité, classe, confiance et erreurs."
      />

      {/* Row 1: F1 par modèle + Radar multimodal */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <GlowCard delay={0.05}>
          <h3 className="font-mono text-sm font-semibold text-foreground mb-4">F1 Macro par modèle</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={tickStyle} />
              <YAxis domain={[0.7, 0.9]} tick={tickStyle} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="f1" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} animationDuration={4000} />
            </BarChart>
          </ResponsiveContainer>
        </GlowCard>

        <GlowCard delay={0.15}>
          <h3 className="font-mono text-sm font-semibold text-foreground mb-4">Radar multi-modalité</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <PolarRadiusAxis domain={[0, 1]} tick={{ fontSize: 9 }} />
              <Radar name="Texte" dataKey="texte" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} animationDuration={4000} />
              <Radar name="Image" dataKey="image" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.15} animationDuration={4000} />
              <Radar name="Multi" dataKey="multi" stroke="hsl(165, 80%, 48%)" fill="hsl(165, 80%, 48%)" fillOpacity={0.15} animationDuration={4000} />
              <Legend wrapperStyle={{ fontSize: 10, fontFamily: "JetBrains Mono" }} />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </GlowCard>
      </div>

      {/* Row 2: Évolution modèles + Precision vs Recall */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <GlowCard delay={0.05}>
          <h3 className="font-mono text-sm font-semibold text-foreground mb-4">Évolution Accuracy / F1 / Weighted</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={modelEvolution}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="step" tick={{ ...tickStyle, fontSize: 8 }} angle={-25} textAnchor="end" height={50} />
              <YAxis domain={[0, 100]} tick={tickStyle} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="accuracy" stroke="hsl(165, 80%, 48%)" strokeWidth={2} dot={{ r: 3 }} animationDuration={4000} name="Accuracy %" />
              <Line type="monotone" dataKey="f1" stroke="hsl(330, 70%, 56%)" strokeWidth={2} dot={{ r: 3 }} animationDuration={4000} name="F1 Macro %" />
              <Line type="monotone" dataKey="weighted" stroke="hsl(260, 60%, 58%)" strokeWidth={2} dot={{ r: 3 }} animationDuration={4000} name="F1 Weighted %" />
              <Legend wrapperStyle={{ fontSize: 10, fontFamily: "JetBrains Mono" }} />
            </LineChart>
          </ResponsiveContainer>
        </GlowCard>

        <GlowCard delay={0.15}>
          <h3 className="font-mono text-sm font-semibold text-foreground mb-4">Precision vs Recall par classe</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={perClassPerformance} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="class" tick={{ ...tickStyle, fontSize: 9 }} />
              <YAxis domain={[70, 100]} tick={tickStyle} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="precision" fill="hsl(165, 80%, 48%)" radius={[4, 4, 0, 0]} animationDuration={4000} name="Precision" />
              <Bar dataKey="recall" fill="hsl(260, 60%, 58%)" radius={[4, 4, 0, 0]} animationDuration={4000} name="Recall" />
              <Legend wrapperStyle={{ fontSize: 10, fontFamily: "JetBrains Mono" }} />
            </BarChart>
          </ResponsiveContainer>
        </GlowCard>
      </div>

      {/* Row 3: Erreurs Pie + Confiance stacked */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <GlowCard delay={0.05}>
          <h3 className="font-mono text-sm font-semibold text-foreground mb-4">Répartition des types d'erreurs</h3>
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

        <GlowCard delay={0.15}>
          <h3 className="font-mono text-sm font-semibold text-foreground mb-4">Distribution de confiance</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={confidenceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="range" tick={{ ...tickStyle, fontSize: 9 }} />
              <YAxis tick={tickStyle} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="correct" stackId="a" fill="hsl(165, 80%, 48%)" animationDuration={4000} name="Correct" />
              <Bar dataKey="incorrect" stackId="a" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} animationDuration={4000} name="Incorrect" />
              <Legend wrapperStyle={{ fontSize: 10, fontFamily: "JetBrains Mono" }} />
            </BarChart>
          </ResponsiveContainer>
        </GlowCard>
      </div>

      {/* Row 4: Modalité contrib + F1 vs Support scatter */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <GlowCard delay={0.05}>
          <h3 className="font-mono text-sm font-semibold text-foreground mb-4">F1 par modalité</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={modalityContrib} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" domain={[0, 100]} tick={tickStyle} />
              <YAxis dataKey="name" type="category" width={90} tick={tickStyle} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value}%`, "F1 Macro"]} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} animationDuration={4000}>
                {modalityContrib.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-2 font-mono">
            Le multimodal (texte+image) surpasse chaque modalité seule de +6 à +32 points.
          </p>
        </GlowCard>

        <GlowCard delay={0.15}>
          <h3 className="font-mono text-sm font-semibold text-foreground mb-4">F1 vs Support (par classe)</h3>
          <p className="text-xs text-muted-foreground mb-3">Taille bulle = precision</p>
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" dataKey="x" name="Support" tick={tickStyle} />
              <YAxis type="number" dataKey="y" name="F1" domain={[75, 95]} tick={tickStyle} />
              <ZAxis type="number" dataKey="z" range={[60, 400]} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number, name: string) => [value, name === "x" ? "Support" : name === "y" ? "F1 %" : "Precision"]} />
              <Scatter data={f1VsSupport} fill="hsl(165, 80%, 48%)" fillOpacity={0.7} animationDuration={4000} />
            </ScatterChart>
          </ResponsiveContainer>
        </GlowCard>
      </div>

      {/* Row 5: Training time vs F1 + Confusion table */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <GlowCard delay={0.05}>
          <h3 className="font-mono text-sm font-semibold text-foreground mb-4">Temps d'entraînement vs F1</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trainingTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="model" tick={{ ...tickStyle, fontSize: 9 }} />
              <YAxis yAxisId="left" tick={tickStyle} label={{ value: "F1 %", angle: -90, position: "insideLeft", style: { fontSize: 9, fill: "hsl(var(--muted-foreground))" } }} />
              <YAxis yAxisId="right" orientation="right" tick={tickStyle} label={{ value: "Temps (s)", angle: 90, position: "insideRight", style: { fontSize: 9, fill: "hsl(var(--muted-foreground))" } }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area yAxisId="left" type="monotone" dataKey="f1" stroke="hsl(165, 80%, 48%)" fill="hsl(165, 80%, 48%)" fillOpacity={0.15} strokeWidth={2} animationDuration={4000} name="F1 Macro %" />
              <Area yAxisId="right" type="monotone" dataKey="time" stroke="hsl(45, 90%, 55%)" fill="hsl(45, 90%, 55%)" fillOpacity={0.1} strokeWidth={2} animationDuration={4000} name="Temps (s)" />
              <Legend wrapperStyle={{ fontSize: 10, fontFamily: "JetBrains Mono" }} />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-2 font-mono">
            Optuna est le plus coûteux (420s) mais apporte +1.8 pts F1 vs LGBM vanilla.
          </p>
        </GlowCard>

        <GlowCard delay={0.15}>
          <h3 className="font-mono text-sm font-semibold text-foreground mb-3">Confusion Matrix — Top 5 erreurs</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Catégories les plus souvent confondues par le modèle ensemble.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-mono text-xs">Prédit →</th>
                  <th className="text-center py-2 text-muted-foreground font-mono text-xs">Vrai label</th>
                  <th className="text-center py-2 text-muted-foreground font-mono text-xs">Erreurs</th>
                  <th className="text-center py-2 text-muted-foreground font-mono text-xs">% total</th>
                </tr>
              </thead>
              <tbody className="text-foreground">
                {[
                  { pred: "Livres", vrai: "BD/Comics", err: 142, pct: "1.7%" },
                  { pred: "Jeux vidéo", vrai: "Acc. gaming", err: 98, pct: "1.2%" },
                  { pred: "Figurines", vrai: "Jouets", err: 76, pct: "0.9%" },
                  { pred: "Meubles", vrai: "Déco maison", err: 63, pct: "0.7%" },
                  { pred: "Vêtements", vrai: "Acc. mode", err: 51, pct: "0.6%" },
                ].map((row) => (
                  <tr key={row.pred} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-2 font-mono text-xs">{row.pred}</td>
                    <td className="py-2 text-center text-xs">{row.vrai}</td>
                    <td className="py-2 text-center font-mono text-xs text-destructive">{row.err}</td>
                    <td className="py-2 text-center font-mono text-xs">{row.pct}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlowCard>
      </div>
    </div>
  );
}
