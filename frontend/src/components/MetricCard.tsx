import { GlowCard } from "./GlowCard";
import { useCountUp } from "@/hooks/useCountUp";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaType?: "positive" | "negative" | "neutral";
  delay?: number;
  colorAccent?: "primary" | "accent" | "neon-blue" | "neon-purple" | "neon-orange" | "neon-pink";
}

const accentBorder: Record<string, string> = {
  primary: "border-l-[3px] border-l-primary",
  accent: "border-l-[3px] border-l-accent",
  "neon-blue": "border-l-[3px] border-l-neon-blue",
  "neon-purple": "border-l-[3px] border-l-neon-purple",
  "neon-orange": "border-l-[3px] border-l-neon-orange",
  "neon-pink": "border-l-[3px] border-l-neon-pink",
};

// Light mode only: visible tinted backgrounds
const accentBg: Record<string, string> = {
  primary: "[&]:bg-[hsl(0_100%_96%)] dark:[&]:bg-transparent",
  accent: "[&]:bg-[hsl(0_80%_96%)] dark:[&]:bg-transparent",
  "neon-blue": "[&]:bg-[hsl(210_60%_95%)] dark:[&]:bg-transparent",
  "neon-purple": "[&]:bg-[hsl(260_50%_96%)] dark:[&]:bg-transparent",
  "neon-orange": "[&]:bg-[hsl(25_80%_95%)] dark:[&]:bg-transparent",
  "neon-pink": "[&]:bg-[hsl(340_60%_96%)] dark:[&]:bg-transparent",
};

const accentValue: Record<string, string> = {
  primary: "text-primary",
  accent: "text-accent",
  "neon-blue": "text-neon-blue",
  "neon-purple": "text-neon-purple",
  "neon-orange": "text-neon-orange",
  "neon-pink": "text-neon-pink",
};

export function MetricCard({ label, value, delta, deltaType = "neutral", delay = 0, colorAccent }: MetricCardProps) {
  const deltaColor = {
    positive: "text-primary",
    negative: "text-destructive",
    neutral: "text-muted-foreground",
  }[deltaType];

  const { ref, display, done } = useCountUp(value, 1200, delay * 1000);

  return (
    <GlowCard delay={delay} className={cn("flex flex-col gap-1", colorAccent && accentBorder[colorAccent], colorAccent && accentBg[colorAccent])}>
      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</span>
      <span
        ref={ref}
        className={cn(
          "text-2xl font-mono font-bold transition-all duration-500",
          colorAccent ? accentValue[colorAccent] : "text-foreground",
          done && "animate-kpi-flash"
        )}
      >
        {display}
      </span>
      {delta && <span className={`text-xs font-mono ${deltaColor}`}>{delta}</span>}
    </GlowCard>
  );
}
