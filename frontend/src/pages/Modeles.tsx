import { PageHeader } from "@/components/PageHeader";
import { GlowCard } from "@/components/GlowCard";
import { MetricCard } from "@/components/MetricCard";
import { Brain } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  ScatterChart, Scatter, ZAxis,
} from "recharts";

// --- DATA ---

const models = [
  { name: "Majority", accuracy: 0.102, f1_macro: 0.006, type: "Baseline" },
  { name: "Log. Reg.", accuracy: 0.789, f1_macro: 0.754, type: "Baseline" },
  { name: "LightGBM", accuracy: 0.852, f1_macro: 0.831, type: "Boosting" },
  { name: "XGBoost", accuracy: 0.847, f1_macro: 0.824, type: "Boosting" },
  { name: "CatBoost", accuracy: 0.844, f1_macro: 0.821, type: "Boosting" },
  { name: "LGBM Optuna", accuracy: 0.865, f1_macro: 0.849, type: "Optimisé" },
  { name: "Voting", accuracy: 0.871, f1_macro: 0.856, type: "Ensemble" },
  { name: "Stacking", accuracy: 0.884, f1_macro: 0.873, type: "Ensemble" },
];

const chartData = models.filter(m => m.name !== "Majority").map(m => ({
  name: m.name,
  F1: +(m.f1_macro * 100).toFixed(1),
  Accuracy: +(m.accuracy * 100).toFixed(1),
}));

const radarData = [
  { metric: "Precision", "Log. Reg.": 75, LightGBM: 84, Stacking: 88 },
  { metric: "Recall", "Log. Reg.": 74, LightGBM: 82, Stacking: 87 },
  { metric: "F1 Macro", "Log. Reg.": 75, LightGBM: 83, Stacking: 87 },
  { metric: "Top-3 Acc", "Log. Reg.": 89, LightGBM: 95, Stacking: 97 },
  { metric: "Vitesse (inv.)", "Log. Reg.": 95, LightGBM: 80, Stacking: 55 },
];

const optunaTrials = [
  { trial: 1, f1: 82.4 }, { trial: 2, f1: 83.1 }, { trial: 3, f1: 82.8 },
  { trial: 4, f1: 83.6 }, { trial: 5, f1: 84.0 }, { trial: 6, f1: 83.5 },
  { trial: 7, f1: 84.2 }, { trial: 8, f1: 84.1 }, { trial: 9, f1: 84.5 },
  { trial: 10, f1: 84.3 }, { trial: 11, f1: 84.7 }, { trial: 12, f1: 84.6 },
  { trial: 13, f1: 84.8 }, { trial: 14, f1: 84.9 }, { trial: 15, f1: 84.9 },
];

const trainingCurve = [
  { epoch: 1, train: 62, val: 58 }, { epoch: 2, train: 71, val: 67 },
  { epoch: 3, train: 78, val: 74 }, { epoch: 4, train: 82, val: 79 },
  { epoch: 5, train: 85, val: 82 }, { epoch: 6, train: 87, val: 84 },
  { epoch: 7, train: 89, val: 85 }, { epoch: 8, train: 90, val: 86 },
  { epoch: 9, train: 91, val: 86.5 }, { epoch: 10, train: 92, val: 86.8 },
];

const featureImportance = [
  { feature: "TF-IDF (texte)", importance: 42 },
  { feature: "BERT embed.", importance: 28 },
  { feature: "CNN features", importance: 15 },
  { feature: "Longueur texte", importance: 6 },
  { feature: "Prix", importance: 4 },
  { feature: "Résolution img", importance: 3 },
  { feature: "Nb mots", importance: 2 },
];

const crossValScores = [
  { fold: "Fold 1", lgbm: 84.2, xgb: 82.8, catboost: 82.1, stacking: 87.0 },
  { fold: "Fold 2", lgbm: 83.8, xgb: 81.9, catboost: 82.5, stacking: 86.8 },
  { fold: "Fold 3", lgbm: 83.5, xgb: 82.4, catboost: 81.8, stacking: 87.1 },
];

const trainingTimeData = [
  { model: "Log. Reg.", time: 12, f1: 75.4 },
  { model: "LightGBM", time: 28, f1: 83.1 },
  { model: "XGBoost", time: 38, f1: 82.4 },
  { model: "CatBoost", time: 52, f1: 82.1 },
  { model: "Optuna", time: 420, f1: 84.9 },
  { model: "Voting", time: 85, f1: 85.6 },
  { model: "Stacking", time: 180, f1: 87.3 },
];

const hyperparamImpact = [
  { param: "n_estimators", low: 79.2, medium: 83.1, high: 84.5 },
  { param: "max_depth", low: 80.8, medium: 83.1, high: 82.4 },
  { param: "learning_rate", low: 81.5, medium: 83.1, high: 78.9 },
  { param: "num_leaves", low: 80.1, medium: 83.1, high: 83.8 },
  { param: "min_child", low: 82.6, medium: 83.1, high: 81.2 },
];

const modalityAblation = [
  { name: "Texte seul", value: 81.3, color: "hsl(165, 80%, 48%)" },
  { name: "Image seule", value: 55.2, color: "hsl(260, 60%, 58%)" },
  { name: "Texte + Image", value: 87.3, color: "hsl(330, 70%, 56%)" },
];

const stackingWeights = [
  { name: "LightGBM", value: 35, color: "hsl(165, 80%, 48%)" },
  { name: "XGBoost", value: 25, color: "hsl(260, 60%, 58%)" },
  { name: "CatBoost", value: 20, color: "hsl(45, 90%, 55%)" },
  { name: "Log. Reg.", value: 12, color: "hsl(330, 70%, 56%)" },
  { name: "Meta-learner", value: 8, color: "hsl(var(--muted-foreground))" },
];

const biasVariance = [
  { complexity: "LR", bias: 18, variance: 3 },
  { complexity: "LGBM", bias: 8, variance: 9 },
  { complexity: "XGB", bias: 9, variance: 10 },
  { complexity: "Optuna", bias: 6, variance: 11 },
  { complexity: "Voting", bias: 5, variance: 8 },
  { complexity: "Stacking", bias: 4, variance: 7 },
];

const typeColors: Record<string, string> = {
  Baseline: "text-muted-foreground",
  Boosting: "text-primary",
  Optimisé: "text-neon-orange",
  Ensemble: "text-neon-pink",
};

const typeBg: Record<string, string> = {
  Baseline: "bg-muted/30",
  Boosting: "bg-primary/10",
  Optimisé: "bg-neon-orange/10",
  Ensemble: "bg-neon-pink/10",
};

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontFamily: "JetBrains Mono",
  fontSize: 11,
  color: "hsl(var(--foreground))",
};

const tickStyle = { fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "JetBrains Mono" };

export default function Modeles() {
  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <PageHeader
        icon={Brain}
        title="Modélisation"
        subtitle="Progression des baselines vers les ensembles optimisés. Tous les modèles utilisent le vecteur multimodal de 1368 dimensions."
        step="Étape 03"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Modèles testés" value="8" delay={0.1} />
        <MetricCard label="Best Accuracy" value="88.4%" delta="Stacking" deltaType="positive" delay={0.15} />
        <MetricCard label="Best F1 Macro" value="87.3%" delta="Stacking" deltaType="positive" delay={0.2} />
        <MetricCard label="Optuna trials" value="15" delta="3-fold CV" delay={0.25} />
      </div>

      {/* Row 1: Comparatif F1/Accuracy */}
      <GlowCard delay={0.3} className="mb-8">
        <h3 className="font-mono text-sm font-semibold text-foreground mb-4">Comparatif F1 Macro & Accuracy</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ ...tickStyle, fontSize: 9 }} angle={-20} textAnchor="end" height={60} />
            <YAxis domain={[60, 100]} tick={tickStyle} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="F1" fill="hsl(165, 80%, 48%)" radius={[4, 4, 0, 0]} animationDuration={4000} />
            <Bar dataKey="Accuracy" fill="hsl(260, 60%, 58%)" radius={[4, 4, 0, 0]} animationDuration={4000} />
            <Legend wrapperStyle={{ fontSize: 11, fontFamily: "JetBrains Mono" }} />
          </BarChart>
        </ResponsiveContainer>
      </GlowCard>

      {/* Row 2: Radar + Optuna */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <GlowCard delay={0.35}>
          <h3 className="font-mono text-sm font-semibold text-foreground mb-4">Radar — Baseline vs Boosting vs Ensemble</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
              <PolarRadiusAxis domain={[50, 100]} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
              <Radar name="Log. Reg." dataKey="Log. Reg." stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground))" fillOpacity={0.1} animationDuration={4000} />
              <Radar name="LightGBM" dataKey="LightGBM" stroke="hsl(165, 80%, 48%)" fill="hsl(165, 80%, 48%)" fillOpacity={0.15} animationDuration={4000} />
              <Radar name="Stacking" dataKey="Stacking" stroke="hsl(330, 70%, 56%)" fill="hsl(330, 70%, 56%)" fillOpacity={0.15} animationDuration={4000} />
              <Legend wrapperStyle={{ fontSize: 10, fontFamily: "JetBrains Mono" }} />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </GlowCard>

        <GlowCard delay={0.4}>
          <h3 className="font-mono text-sm font-semibold text-foreground mb-4">Optuna — Convergence F1</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={optunaTrials}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="trial" tick={tickStyle} label={{ value: "Trial", position: "insideBottom", offset: -5, style: { fontSize: 10, fill: "hsl(var(--muted-foreground))" } }} />
              <YAxis domain={[82, 85.5]} tick={tickStyle} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="f1" stroke="hsl(45, 90%, 55%)" strokeWidth={2} dot={{ fill: "hsl(45, 90%, 55%)", r: 3 }} animationDuration={4000} name="F1 Macro %" />
            </LineChart>
          </ResponsiveContainer>
        </GlowCard>
      </div>

      {/* Row 3: Feature importance + Cross-validation */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <GlowCard delay={0.45}>
          <h3 className="font-mono text-sm font-semibold text-foreground mb-4">Importance des features (Stacking)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={featureImportance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={tickStyle} unit="%" />
              <YAxis dataKey="feature" type="category" width={100} tick={{ ...tickStyle, fontSize: 9 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value}%`, "Importance"]} />
              <Bar dataKey="importance" fill="hsl(165, 80%, 48%)" radius={[0, 4, 4, 0]} animationDuration={4000} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-2 font-mono">
            TF-IDF + BERT représentent 70% de l'importance → le texte domine.
          </p>
        </GlowCard>

        <GlowCard delay={0.5}>
          <h3 className="font-mono text-sm font-semibold text-foreground mb-4">Cross-validation (3 folds)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={crossValScores} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="fold" tick={tickStyle} />
              <YAxis domain={[80, 88]} tick={tickStyle} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="lgbm" fill="hsl(165, 80%, 48%)" radius={[4, 4, 0, 0]} animationDuration={4000} name="LGBM" />
              <Bar dataKey="xgb" fill="hsl(260, 60%, 58%)" radius={[4, 4, 0, 0]} animationDuration={4000} name="XGB" />
              <Bar dataKey="catboost" fill="hsl(45, 90%, 55%)" radius={[4, 4, 0, 0]} animationDuration={4000} name="CatBoost" />
              <Bar dataKey="stacking" fill="hsl(330, 70%, 56%)" radius={[4, 4, 0, 0]} animationDuration={4000} name="Stacking" />
              <Legend wrapperStyle={{ fontSize: 10, fontFamily: "JetBrains Mono" }} />
            </BarChart>
          </ResponsiveContainer>
        </GlowCard>
      </div>

      {/* Row 4: Training curves + Training time scatter */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <GlowCard delay={0.55}>
          <h3 className="font-mono text-sm font-semibold text-foreground mb-4">Courbes d'apprentissage (Stacking)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trainingCurve}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="epoch" tick={tickStyle} />
              <YAxis domain={[50, 95]} tick={tickStyle} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="train" stroke="hsl(165, 80%, 48%)" fill="hsl(165, 80%, 48%)" fillOpacity={0.15} strokeWidth={2} animationDuration={4000} name="Train" />
              <Area type="monotone" dataKey="val" stroke="hsl(260, 60%, 58%)" fill="hsl(260, 60%, 58%)" fillOpacity={0.15} strokeWidth={2} animationDuration={4000} name="Validation" />
              <Legend wrapperStyle={{ fontSize: 10, fontFamily: "JetBrains Mono" }} />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-2 font-mono">
            L'écart train/val se stabilise → pas de surapprentissage significatif.
          </p>
        </GlowCard>

        <GlowCard delay={0.6}>
          <h3 className="font-mono text-sm font-semibold text-foreground mb-4">Temps d'entraînement vs F1</h3>
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" dataKey="time" name="Temps (s)" tick={tickStyle} />
              <YAxis type="number" dataKey="f1" name="F1 %" domain={[74, 88]} tick={tickStyle} />
              <ZAxis range={[80, 80]} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number, name: string) => [name === "time" ? `${value}s` : `${value}%`, name === "time" ? "Temps" : "F1"]} />
              <Scatter data={trainingTimeData} fill="hsl(330, 70%, 56%)" fillOpacity={0.8} animationDuration={4000} />
            </ScatterChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-2 font-mono">
            Optuna (420s) est le plus coûteux — Stacking offre le meilleur ratio perf/temps.
          </p>
        </GlowCard>
      </div>

      {/* Row 5: Hyperparams impact + Ablation modalité */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <GlowCard delay={0.65}>
          <h3 className="font-mono text-sm font-semibold text-foreground mb-4">Impact des hyperparamètres (LGBM)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={hyperparamImpact} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="param" tick={{ ...tickStyle, fontSize: 8 }} angle={-25} textAnchor="end" height={55} />
              <YAxis domain={[76, 86]} tick={tickStyle} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="low" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} animationDuration={4000} name="Low" fillOpacity={0.7} />
              <Bar dataKey="medium" fill="hsl(45, 90%, 55%)" radius={[4, 4, 0, 0]} animationDuration={4000} name="Default" />
              <Bar dataKey="high" fill="hsl(165, 80%, 48%)" radius={[4, 4, 0, 0]} animationDuration={4000} name="High" />
              <Legend wrapperStyle={{ fontSize: 10, fontFamily: "JetBrains Mono" }} />
            </BarChart>
          </ResponsiveContainer>
        </GlowCard>

        <GlowCard delay={0.7}>
          <h3 className="font-mono text-sm font-semibold text-foreground mb-4">Ablation — F1 par modalité</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={modalityAblation} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" domain={[0, 100]} tick={tickStyle} unit="%" />
              <YAxis dataKey="name" type="category" width={100} tick={tickStyle} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value}%`, "F1 Macro"]} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} animationDuration={4000}>
                {modalityAblation.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 p-3 rounded-lg bg-secondary/50 border border-border">
            <p className="font-mono text-xs text-muted-foreground">
              L'image seule est faible (<span className="text-foreground font-semibold">55.2%</span>), mais booste le texte de <span className="text-foreground font-semibold">+6 pts</span> en multimodal.
            </p>
          </div>
        </GlowCard>
      </div>

      {/* Row 6: Stacking weights + Bias-Variance */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <GlowCard delay={0.75}>
          <h3 className="font-mono text-sm font-semibold text-foreground mb-4">Poids du Stacking Ensemble</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={stackingWeights} cx="50%" cy="50%" innerRadius={55} outerRadius={95} dataKey="value" animationDuration={4000} label={({ name, value }) => `${name}: ${value}%`}>
                {stackingWeights.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-2 font-mono">
            LightGBM domine le stacking (35%) grâce à sa vitesse et sa performance.
          </p>
        </GlowCard>

        <GlowCard delay={0.8}>
          <h3 className="font-mono text-sm font-semibold text-foreground mb-4">Décomposition Biais-Variance</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={biasVariance}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="complexity" tick={tickStyle} />
              <YAxis tick={tickStyle} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="bias" stroke="hsl(0, 72%, 51%)" fill="hsl(0, 72%, 51%)" fillOpacity={0.15} strokeWidth={2} animationDuration={4000} name="Biais" />
              <Area type="monotone" dataKey="variance" stroke="hsl(260, 60%, 58%)" fill="hsl(260, 60%, 58%)" fillOpacity={0.15} strokeWidth={2} animationDuration={4000} name="Variance" />
              <Legend wrapperStyle={{ fontSize: 10, fontFamily: "JetBrains Mono" }} />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-2 font-mono">
            Stacking réduit le biais tout en contrôlant la variance via le meta-learner.
          </p>
        </GlowCard>
      </div>

      {/* Détail des modèles (table) */}
      <GlowCard delay={0.85}>
        <h3 className="font-mono text-sm font-semibold text-foreground mb-4">Détail des modèles</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-mono text-xs text-muted-foreground">Modèle</th>
                <th className="text-left py-2 px-3 font-mono text-xs text-muted-foreground">Type</th>
                <th className="text-right py-2 px-3 font-mono text-xs text-muted-foreground">Accuracy</th>
                <th className="text-right py-2 px-3 font-mono text-xs text-muted-foreground">F1 Macro</th>
              </tr>
            </thead>
            <tbody>
              {models.map((m) => (
                <tr key={m.name} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-xs text-foreground font-medium">{m.name}</td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${typeBg[m.type]} ${typeColors[m.type]}`}>
                      {m.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-xs">{(m.accuracy * 100).toFixed(1)}%</td>
                  <td className="py-2.5 px-3 text-right font-mono text-xs">{(m.f1_macro * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlowCard>
    </div>
  );
}
