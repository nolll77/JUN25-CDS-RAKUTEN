import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  step?: string;
}

export function PageHeader({ icon: Icon, title, subtitle, step }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      {step && (
        <span className="inline-block text-[10px] font-mono uppercase tracking-[0.2em] text-primary/70 mb-2">
          {step}
        </span>
      )}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-mono font-bold text-foreground">{title}</h1>
      </div>
      <p className="text-muted-foreground text-sm max-w-2xl">{subtitle}</p>
    </motion.div>
  );
}
