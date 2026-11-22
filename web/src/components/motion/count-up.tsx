"use client";
import { useEffect, useState } from "react";

/** Counts a number up from zero once, on mount. Screen readers get the final value straight away. */
export function CountUp({ value, duration = 900 }: { value: number; duration?: number }) {
  const [shown, setShown] = useState(value);
  useEffect(() => {
    if (value <= 0 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / duration);
      setShown(Math.round(value * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <><span aria-hidden>{shown.toLocaleString("en")}</span><span className="sr-only">{value.toLocaleString("en")}</span></>;
}
