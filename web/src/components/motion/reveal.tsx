"use client";
import { useEffect } from "react";

/**
 * Fades in every `[data-reveal]` element as it scrolls into view. Content stays visible when JS is
 * off; only elements still below the fold are hidden, so nothing on screen ever blinks out.
 */
export function RevealOnScroll() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    els.forEach((el) => { if (el.getBoundingClientRect().top < innerHeight * 0.92) el.classList.add("is-in"); });
    root.classList.add("js-reveal");
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    els.forEach((el) => { if (!el.classList.contains("is-in")) io.observe(el); });
    return () => { io.disconnect(); root.classList.remove("js-reveal"); };
  }, []);
  return null;
}
