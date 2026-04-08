import { PageHeader } from "@/components/PageHeader";
import { GlowCard } from "@/components/GlowCard";
import { MetricCard } from "@/components/MetricCard";
import { BarChart3 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, CartesianGrid,
  ScatterChart, Scatter, ZAxis, LineChart, Line,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from "recharts";

// --- DATA ---

const classDistribution = [
  { name: "2583", count: 8640 },
  { name: "1280", count: 6720 },
  { name: "2705", count: 5890 },
  { name: "2522", count: 5510 },
  { name: "1920", count: 5200 },
  { name: "1140", count: 4980 },
  { name: "2060", count: 4620 },
  { name: "1281", count: 4100 },
  { name: "1560", count: 3850 },
  { name: "2462", count: 3600 },
  { name: "Autres", count: 31806 },
];

const modalityData = [
  { name: "Texte seul", value: 45, color: "hsl(165, 80%, 48%)" },
  { name: "Image seule", value: 25, color: "hsl(260, 60%, 58%)" },
  { name: "Texte + Image", value: 30, color: "hsl(330, 70%, 56%)" },
];

const missingData = [
  { field: "designation", missing: 0, total: 84916 },
  { field: "description", missing: 31247, total: 84916 },
  { field: "image", missing: 0, total: 84916 },
  { field: "productid", missing: 0, total: 84916 },
  { field: "imageid", missing: 12, total: 84916 },
];

const textLengthData = [
  { range: "0-20", designation: 4200, description: 1800 },
  { range: "20-50", designation: 18500, description: 5200 },
  { range: "50-100", designation: 32000, description: 12400 },
  { range: "100-200", designation: 21000, description: 18900 },
  { range: "200-500", designation: 8200, description: 11600 },
  { range: "500+", designation: 1016, description: 4769 },
];

const classImbalanceData = [
  { classe: "2583", ratio: 12.0 },
  { classe: "1280", ratio: 9.3 },
  { classe: "2705", ratio: 8.2 },
  { classe: "2522", ratio: 7.6 },
  { classe: "1920", ratio: 7.2 },
  { classe: "1140", ratio: 6.9 },
  { classe: "2060", ratio: 6.4 },
  { classe: "1281", ratio: 5.7 },
  { classe: "1560", ratio: 5.3 },
  { classe: "2462", ratio: 5.0 },
  { classe: "10", ratio: 3.8 },
  { classe: "40", ratio: 2.6 },
  { classe: "50", ratio: 1.8 },
  { classe: "60", ratio: 1.0 },
];

const correlationData = [
  { x: 42, y: 87, z: 8640, name: "2583" },
  { x: 78, y: 72, z: 6720, name: "1280" },
  { x: 95, y: 65, z: 5890, name: "2705" },
  { x: 55, y: 58, z: 5510, name: "2522" },
  { x: 120, y: 45, z: 5200, name: "1920" },
  { x: 88, y: 82, z: 4980, name: "1140" },
  { x: 65, y: 38, z: 4620, name: "2060" },
  { x: 35, y: 92, z: 4100, name: "1281" },
  { x: 110, y: 28, z: 3850, name: "1560" },
  { x: 72, y: 55, z: 3600, name: "2462" },
];

const wordFreqData = [
  { word: "livre", freq: 4820 },
  { word: "jeu", freq: 3950 },
  { word: "figurine", freq: 2870 },
  { word: "neuf", freq: 2640 },
  { word: "lot", freq: 2310 },
  { word: "edition", freq: 1980 },
  { word: "vintage", freq: 1720 },
  { word: "carte", freq: 1540 },
  { word: "collection", freq: 1380 },
  { word: "coffret", freq: 1210 },
];

const imageResolutionData = [
  { range: "< 100px", count: 890 },
  { range: "100-300px", count: 12400 },
  { range: "300-500px", count: 38200 },
  { range: "500-800px", count: 24600 },
  { range: "800px+", count: 8826 },
];

const langData = [
  { name: "Français", value: 78, color: "hsl(165, 80%, 48%)" },
  { name: "Anglais", value: 14, color: "hsl(260, 60%, 58%)" },
  { name: "Mixte", value: 6, color: "hsl(45, 90%, 55%)" },
  { name: "Autre", value: 2, color: "hsl(var(--muted-foreground))" },
];

const classRadarData = [
  { metric: "Moy. mots", "Top classes": 82, "Bottom classes": 35 },
  { metric: "% avec desc.", "Top classes": 78, "Bottom classes": 42 },
  { metric: "% avec image", "Top classes": 100, "Bottom classes": 100 },
  { metric: "Résolution img", "Top classes": 72, "Bottom classes": 55 },
  { metric: "Diversité vocab", "Top classes": 88, "Bottom classes": 40 },
];

const priceDistribution = [
  { range: "0-10€", count: 18200 },
  { range: "10-25€", count: 22400 },
  { range: "25-50€", count: 19800 },
  { range: "50-100€", count: 14200 },
  { range: "100-200€", count: 6800 },
  { range: "200€+", count: 3516 },
];

const duplicatesData = [
  { name: "Uniques", value: 72, color: "hsl(165, 80%, 48%)" },
  { name: "Quasi-doublons", value: 18, color: "hsl(45, 90%, 55%)" },
  { name: "Doublons exacts", value: 10, color: "hsl(0, 72%, 51%)" },
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

export default function Exploration() {
  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <PageHeader
        icon={BarChart3}
        title="Exploration"
        subtitle="Analyse exploratoire du dataset Rakuten France : distributions, valeurs manquantes, et statistiques descriptives."
        step="Étape 01"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Total produits" value="84,916" delay={0.1} />
        <MetricCard label="Classes" value="27" delay={0.15} />
        <MetricCard label="Descriptions manquantes" value="36.8%" delta="31,247 lignes" deltaType="negative" delay={0.2} />
        <MetricCard label="Déséquilibre max" value="×12" delta="Classe la + vs la -" deltaType="neutral" delay={0.25} />
      </div>

      {/* Row 1: Distribution classes + Modalités */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <GlowCard delay={0.3}>
          <h3 className="font-mono text-sm font-semibold text-foreground mb-4">Distribution des classes (Top 10)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={classDistribution} layout="vertical">
              <XAxis type="number" tick={tickStyle} />
              <YAxis dataKey="name" type="category" width={50} tick={tickStyle} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="hsl(165, 80%, 48%)" radius={[0, 4, 4, 0]} animationDuration={4000} />
            </BarChart>
          </ResponsiveContainer>
        </GlowCard>

        <GlowCard delay={0.35}>
          <h3 className="font-mono text-sm font-semibold text-foreground mb-4">Contribution des modalités</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={modalityData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" animationDuration={4000} label={({ name, value }) => `${name}: ${value}%`}>
                {modalityData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: "JetBrains Mono" }} />
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </GlowCard>
      </div>

      {/* Row 2: Longueur texte + Déséquilibre */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <GlowCard delay={0.4}>
          <h3 className="font-mono text-sm font-semibold text-foreground mb-4">Longueur des textes (distribution)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={textLengthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="range" tick={tickStyle} />
              <YAxis tick={tickStyle} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="designation" stackId="1" stroke="hsl(165, 80%, 48%)" fill="hsl(165, 80%, 48%)" fillOpacity={0.3} animationDuration={4000} name="Designation" />
              <Area type="monotone" dataKey="description" stackId="1" stroke="hsl(260, 60%, 58%)" fill="hsl(260, 60%, 58%)" fillOpacity={0.3} animationDuration={4000} name="Description" />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: "JetBrains Mono" }} />
            </AreaChart>
          </ResponsiveContainer>
        </GlowCard>

        <GlowCard delay={0.45}>
          <h3 className="font-mono text-sm font-semibold text-foreground mb-4">Ratio déséquilibre par classe</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={classImbalanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="classe" tick={{ ...tickStyle, fontSize: 9 }} angle={-45} textAnchor="end" height={50} />
              <YAxis tick={tickStyle} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="ratio" stroke="hsl(330, 70%, 56%)" strokeWidth={2} dot={{ fill: "hsl(330, 70%, 56%)", r: 4 }} animationDuration={4000} />
            </LineChart>
          </ResponsiveContainer>
        </GlowCard>
      </div>

      {/* Row 3: Top mots + Résolution images */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <GlowCard delay={0.5}>
          <h3 className="font-mono text-sm font-semibold text-foreground mb-4">Top 10 mots fréquents (designations)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={wordFreqData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={tickStyle} />
              <YAxis dataKey="word" type="category" width={70} tick={tickStyle} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="freq" fill="hsl(260, 60%, 58%)" radius={[0, 4, 4, 0]} animationDuration={4000} name="Fréquence" />
            </BarChart>
          </ResponsiveContainer>
        </GlowCard>

        <GlowCard delay={0.55}>
          <h3 className="font-mono text-sm font-semibold text-foreground mb-4">Distribution résolution images</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={imageResolutionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="range" tick={{ ...tickStyle, fontSize: 9 }} />
              <YAxis tick={tickStyle} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="hsl(45, 90%, 55%)" radius={[4, 4, 0, 0]} animationDuration={4000} name="Nb images" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-2 font-mono">
            Majorité d'images entre 300-500px — résolution suffisante pour CNN.
          </p>
        </GlowCard>
      </div>

      {/* Row 4: Langues + Radar top vs bottom classes */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <GlowCard delay={0.6}>
          <h3 className="font-mono text-sm font-semibold text-foreground mb-4">Langues détectées</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={langData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" animationDuration={4000} label={({ name, value }) => `${value}%`}>
                {langData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 10, fontFamily: "JetBrains Mono" }} />
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-2 font-mono">
            14% d'anglais et 6% mixte → le modèle doit être multilingue.
          </p>
        </GlowCard>

        <GlowCard delay={0.65}>
          <h3 className="font-mono text-sm font-semibold text-foreground mb-4">Profil Top classes vs Bottom classes</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={classRadarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
              <Radar name="Top classes" dataKey="Top classes" stroke="hsl(165, 80%, 48%)" fill="hsl(165, 80%, 48%)" fillOpacity={0.15} animationDuration={4000} />
              <Radar name="Bottom classes" dataKey="Bottom classes" stroke="hsl(0, 72%, 51%)" fill="hsl(0, 72%, 51%)" fillOpacity={0.15} animationDuration={4000} />
              <Legend wrapperStyle={{ fontSize: 10, fontFamily: "JetBrains Mono" }} />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </GlowCard>
      </div>

      {/* Row 5: Scatter + Prix */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <GlowCard delay={0.7}>
          <h3 className="font-mono text-sm font-semibold text-foreground mb-4">Longueur texte vs résolution image</h3>
          <p className="text-xs text-muted-foreground mb-3">Taille bulle = nombre de produits</p>
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" dataKey="x" name="Moy. mots" tick={tickStyle} />
              <YAxis type="number" dataKey="y" name="Résolution img" tick={tickStyle} />
              <ZAxis type="number" dataKey="z" range={[40, 400]} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number, name: string) => [value, name === "x" ? "Moy. mots" : name === "y" ? "Résolution" : "Produits"]} />
              <Scatter data={correlationData} fill="hsl(165, 80%, 48%)" fillOpacity={0.6} animationDuration={4000} />
            </ScatterChart>
          </ResponsiveContainer>
        </GlowCard>

        <GlowCard delay={0.75}>
          <h3 className="font-mono text-sm font-semibold text-foreground mb-4">Distribution des prix</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={priceDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="range" tick={{ ...tickStyle, fontSize: 9 }} />
              <YAxis tick={tickStyle} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="hsl(330, 70%, 56%)" radius={[4, 4, 0, 0]} animationDuration={4000} name="Nb produits" />
            </BarChart>
          </ResponsiveContainer>
        </GlowCard>
      </div>

      {/* Row 6: Doublons + Valeurs manquantes */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <GlowCard delay={0.8}>
          <h3 className="font-mono text-sm font-semibold text-foreground mb-4">Détection de doublons</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={duplicatesData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" animationDuration={4000} label={({ name, value }) => `${name}: ${value}%`}>
                {duplicatesData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 10, fontFamily: "JetBrains Mono" }} />
            </PieChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-2 font-mono">
            28% de doublons/quasi-doublons → nettoyage nécessaire avant entraînement.
          </p>
        </GlowCard>

        <GlowCard delay={0.85}>
          <h3 className="font-mono text-sm font-semibold text-foreground mb-4">Valeurs manquantes</h3>
          <div className="space-y-3 mt-4">
            {missingData.map((d) => {
              const pct = ((d.missing / d.total) * 100).toFixed(1);
              return (
                <div key={d.field}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs text-foreground">{d.field}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {d.missing > 0 ? `${d.missing.toLocaleString()} (${pct}%)` : "Complet ✓"}
                    </span>
                  </div>
                  <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: d.missing > 0 ? `${Math.max(parseFloat(pct), 2)}%` : "100%",
                        background: d.missing > 0
                          ? "linear-gradient(90deg, hsl(0, 72%, 51%), hsl(0, 72%, 40%))"
                          : "linear-gradient(90deg, hsl(165, 80%, 48%), hsl(165, 80%, 38%))",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 p-3 rounded-lg bg-secondary/50 border border-border">
            <p className="font-mono text-xs text-muted-foreground">
              <span className="text-foreground font-semibold">36.8%</span> des descriptions sont absentes — le modèle doit gérer les données incomplètes via des stratégies de fallback multimodal.
            </p>
          </div>
        </GlowCard>
      </div>
    </div>
  );
}
