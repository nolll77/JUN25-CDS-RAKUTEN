import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function GlowCard({ children, className, delay = 0 }: GlowCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn("glow-card rounded-xl p-6", className)}
    >
      {children}
    </motion.div>
  );
}
