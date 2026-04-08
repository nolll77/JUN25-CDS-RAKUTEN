import { useRef, useState, useEffect, type ReactNode } from "react";

interface LazyChartProps {
  children: ReactNode;
  height?: number;
}

function getTopInContainer(el: HTMLElement, container: HTMLElement) {
  const elRect = el.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  return elRect.top - containerRect.top + container.scrollTop;
}

function isVisibleInContainer(el: HTMLElement, container: HTMLElement) {
  const top = getTopInContainer(el, container);
  const bottom = top + el.offsetHeight;
  const viewTop = container.scrollTop;
  const viewBottom = viewTop + container.clientHeight;
  const revealMargin = Math.min(120, Math.max(24, el.offsetHeight * 0.15));

  return bottom >= viewTop + revealMargin && top <= viewBottom - revealMargin;
}

function isVisibleInWindow(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const revealTop = window.innerHeight * 0.92;
  const revealBottom = window.innerHeight * 0.08;
  return rect.top <= revealTop && rect.bottom >= revealBottom;
}

export function LazyChart({ children, height = 280 }: LazyChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;

    const mainScroll = document.querySelector("main.overflow-auto") as HTMLElement | null;

    let frameId: number | null = null;
    let revealTimeout: number | null = null;
    let delayedCheckA: number | null = null;
    let delayedCheckB: number | null = null;
    let delayedCheckC: number | null = null;
    let triggered = false;

    const reveal = () => {
      if (triggered) return;
      triggered = true;

      revealTimeout = window.setTimeout(() => {
        setRenderKey((k) => k + 1);
        setVisible(true);

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.dispatchEvent(new Event("resize"));
          });
        });
      }, 60);
    };

    const check = () => {
      if (triggered || !el.isConnected) return;
      const inView = mainScroll ? isVisibleInContainer(el, mainScroll) : isVisibleInWindow(el);
      if (inView) reveal();
    };

    const queueCheck = () => {
      if (frameId !== null || triggered) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        check();
      });
    };

    document.addEventListener("scroll", queueCheck, { passive: true, capture: true });
    if (mainScroll) mainScroll.addEventListener("scroll", queueCheck, { passive: true });
    window.addEventListener("resize", queueCheck, { passive: true });

    queueCheck();
    delayedCheckA = window.setTimeout(queueCheck, 120);
    delayedCheckB = window.setTimeout(queueCheck, 260);
    delayedCheckC = window.setTimeout(queueCheck, 480);

    return () => {
      document.removeEventListener("scroll", queueCheck, true);
      if (mainScroll) mainScroll.removeEventListener("scroll", queueCheck);
      window.removeEventListener("resize", queueCheck);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      if (revealTimeout !== null) window.clearTimeout(revealTimeout);
      if (delayedCheckA !== null) window.clearTimeout(delayedCheckA);
      if (delayedCheckB !== null) window.clearTimeout(delayedCheckB);
      if (delayedCheckC !== null) window.clearTimeout(delayedCheckC);
    };
  }, [visible]);

  return <div ref={ref} style={{ minHeight: height }}>{visible ? <div key={renderKey}>{children}</div> : null}</div>;
}




