import { PageHeader } from "@/components/PageHeader";
import { GlowCard } from "@/components/GlowCard";
import { Bot, GitBranch, Cpu, MessageSquare, ArrowRight } from "lucide-react";

const agentTools = [
  { name: "tool_rag_answer", desc: "Interroge l'index FAISS et retourne le contexte le plus pertinent", icon: MessageSquare },
  { name: "tool_classify", desc: "Lance le pipeline de classification sur un texte/image", icon: Cpu },
  { name: "tool_summarize", desc: "Résume la description d'un produit en une phrase", icon: GitBranch },
];

const workflowSteps = [
  { label: "Entrée utilisateur", desc: "Texte ou image de produit" },
  { label: "Router Agent", desc: "Détermine quel outil utiliser" },
  { label: "Exécution Tool", desc: "RAG, Classification ou Résumé" },
  { label: "Réponse formatée", desc: "Catégorie + explication + confiance" },
];

export default function Agents() {
  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <PageHeader
        icon={Bot}
        title="AI Agents"
        subtitle="Architecture d'agents IA avec routage d'outils et orchestration LangGraph pour automatiser le workflow de classification."
        step="Ouverture"
      />

      <GlowCard delay={0.1} className="mb-8">
        <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-neon-pink/10 text-neon-pink mb-3">
          ÉBAUCHE – Piste exploratoire
        </span>
        <p className="text-sm text-muted-foreground">
          Ce notebook explore l'utilisation d'agents IA pour orchestrer intelligemment les différents
          composants du pipeline : RAG, classification, résumé. L'agent route automatiquement la requête
          vers le bon outil.
        </p>
      </GlowCard>

      <GlowCard delay={0.2} className="mb-8">
        <h3 className="font-mono text-sm font-semibold text-foreground mb-4">Workflow Agent</h3>
        <div className="flex flex-col md:flex-row items-stretch gap-2">
          {workflowSteps.map((step, i) => (
            <div key={step.label} className="flex-1 flex items-center gap-2">
              <div className="flex-1 p-3 rounded-lg bg-secondary/50 border border-border text-center">
                <span className="block font-mono text-xs font-semibold text-foreground">{step.label}</span>
                <span className="block text-[10px] text-muted-foreground mt-0.5">{step.desc}</span>
              </div>
              {i < workflowSteps.length - 1 && (
                <ArrowRight className="h-4 w-4 text-primary shrink-0 hidden md:block" />
              )}
            </div>
          ))}
        </div>
      </GlowCard>

      <GlowCard delay={0.3}>
        <h3 className="font-mono text-sm font-semibold text-foreground mb-4">Outils disponibles</h3>
        <div className="space-y-3">
          {agentTools.map((tool, i) => (
            <div key={tool.name} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 border border-border">
              <div className="w-8 h-8 rounded-lg bg-neon-pink/10 flex items-center justify-center shrink-0">
                <tool.icon className="h-4 w-4 text-neon-pink" />
              </div>
              <div>
                <code className="font-mono text-xs text-foreground font-semibold">{tool.name}</code>
                <p className="text-xs text-muted-foreground mt-0.5">{tool.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </GlowCard>
    </div>
  );
}
