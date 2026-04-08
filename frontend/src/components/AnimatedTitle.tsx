import { motion, AnimatePresence } from "framer-motion";

interface AnimatedTitleProps {
  text: string;
  className?: string;
}

export function AnimatedTitle({ text, className }: AnimatedTitleProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={text}
        className={className}
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.03 },
          },
        }}
      >
        {text.split("").map((char, i) => (
          <motion.span
            key={`${text}-${i}`}
            className="inline-block"
            style={{ whiteSpace: char === " " ? "pre" : undefined }}
            variants={{
              hidden: { opacity: 0, y: 8, filter: "blur(4px)" },
              visible: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: { duration: 0.25, ease: "easeOut" },
              },
            }}
          >
            {char}
          </motion.span>
        ))}
      </motion.span>
    </AnimatePresence>
  );
}
