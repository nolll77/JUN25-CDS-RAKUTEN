import { useEffect, useState, useRef } from "react";
import { useInView } from "framer-motion";

export function useCountUp(target: string, duration = 1200, delay = 0) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(target);
  const [done, setDone] = useState(false);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    // Extract numeric part and surrounding text
    const match = target.match(/^([^0-9]*)([\d,.]+)(%?[^0-9]*)$/);
    if (!match) {
      setDisplay(target);
      setDone(true);
      return;
    }

    const prefix = match[1];
    const numStr = match[2];
    const suffix = match[3];

    const cleanNum = numStr.replace(/,/g, "");
    const finalValue = parseFloat(cleanNum);
    if (isNaN(finalValue)) {
      setDisplay(target);
      setDone(true);
      return;
    }

    const hasCommas = numStr.includes(",");
    const decimals = cleanNum.includes(".") ? cleanNum.split(".")[1].length : 0;

    const startTime = performance.now() + delay;
    let raf: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      if (elapsed < 0) {
        setDisplay(`${prefix}${formatNum(0, decimals, hasCommas)}${suffix}`);
        raf = requestAnimationFrame(tick);
        return;
      }

      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * finalValue;

      setDisplay(`${prefix}${formatNum(current, decimals, hasCommas)}${suffix}`);

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setDone(true);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isInView, target, duration, delay]);

  return { ref, display, done };
}

function formatNum(value: number, decimals: number, commas: boolean): string {
  const fixed = value.toFixed(decimals);
  if (!commas) return fixed;
  const [int, dec] = fixed.split(".");
  const withCommas = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return dec ? `${withCommas}.${dec}` : withCommas;
}
