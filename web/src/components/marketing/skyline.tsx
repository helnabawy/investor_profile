"use client";
import { useEffect, useRef } from "react";

/**
 * Hero background: a skyline drawn as a dot matrix, in the logo's own vocabulary (the three chat
 * dots). Windows light up in blue, sometimes three in a row like the concierge typing.
 *
 * Fills its positioned parent. The skyline stands on the element marked `data-skyline-base`, and
 * never lights a window behind elements marked `data-skyline-avoid` (the headline and copy).
 * Pauses off-screen and in hidden tabs; draws one still frame under reduced motion.
 */

const PITCH = 20; // px between dots
const INK = "rgb(15 23 40 / 0.2)";
const DOT = 1.9; // px radius
const BLUE = "30 70 184";

type Light = { c: number; r: number; t0: number; dur: number };
type Box = { x0: number; y0: number; x1: number; y1: number };

/** Small seeded generator, so the same skyline is drawn on every visit and every resize. */
function seeded(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function Skyline() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0, baseY = 0;
    let heights: number[] = [];
    let avoid: Box[] = [];
    let lights: Light[] = [];
    let raf = 0, visible = true, lastSpawn = 0;
    const born = performance.now();

    const layout = () => {
      const rect = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const base = host.querySelector<HTMLElement>("[data-skyline-base]");
      baseY = base ? base.getBoundingClientRect().top - rect.top + 56 : rect.height * 0.62;
      avoid = Array.from(host.querySelectorAll<HTMLElement>("[data-skyline-avoid]")).map((el) => {
        const r = el.getBoundingClientRect();
        return { x0: r.left - rect.left - 12, y0: r.top - rect.top - 12, x1: r.right - rect.left + 12, y1: r.bottom - rect.top + 12 };
      });

      // Buildings: blocks 2–5 dots wide, taller toward the right so the headline side stays calm.
      const rnd = seeded(11);
      const cols = Math.ceil(w / PITCH) + 1;
      const maxRows = Math.max(4, Math.floor((baseY - 28) / PITCH));
      heights = new Array(cols).fill(1);
      for (let c = 0; c < cols;) {
        const width = 2 + Math.floor(rnd() * 4);
        const x = c / cols;
        let rows = maxRows * (0.2 + 0.8 * Math.pow(x, 0.85)) * (0.5 + 0.5 * rnd());
        if (rnd() < 0.16) rows *= 0.35;
        for (let i = 0; i < width && c + i < cols; i++) heights[c + i] = Math.max(1, Math.round(rows));
        c += width;
        if (rnd() < 0.55 && c < cols) c += 1; // a street between some buildings
      }
      lights = lights.filter((l) => l.c < cols && l.r < heights[l.c]);
    };

    const pos = (c: number, r: number) => ({ x: c * PITCH + PITCH / 2, y: baseY - r * PITCH - PITCH / 2 });
    const blocked = (c: number, r: number) => {
      const { x, y } = pos(c, r);
      return avoid.some((b) => x > b.x0 && x < b.x1 && y > b.y0 && y < b.y1);
    };

    const spawn = (now: number) => {
      const c = Math.floor(Math.random() * heights.length);
      const h = heights[c];
      if (h < 3) return;
      const r = 1 + Math.floor(Math.random() * (h - 1));
      // About a third of the time: three in a row, lit one after another.
      const triple = Math.random() < 0.34 && c + 2 < heights.length && heights[c + 1] > r && heights[c + 2] > r;
      const cells = triple ? [c, c + 1, c + 2] : [c];
      if (cells.some((cc) => blocked(cc, r))) return;
      cells.forEach((cc, i) => lights.push({ c: cc, r, t0: now + i * 170, dur: triple ? 2100 : 2600 + Math.random() * 1600 }));
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // The city rises once, bottom rows first.
      const k = reduce ? 1 : Math.min(1, (now - born) / 1700);
      const rise = 1 - Math.pow(1 - k, 3);

      ctx.fillStyle = INK;
      ctx.beginPath();
      for (let c = 0; c < heights.length; c++) {
        const top = Math.ceil(heights[c] * rise);
        for (let r = 0; r < top; r++) {
          const { x, y } = pos(c, r);
          ctx.moveTo(x + DOT, y);
          ctx.arc(x, y, DOT, 0, Math.PI * 2);
        }
      }
      ctx.fill();

      lights = lights.filter((l) => now < l.t0 + l.dur);
      for (const l of lights) {
        if (now < l.t0 || l.r >= heights[l.c] * rise) continue;
        const a = Math.sin(Math.PI * ((now - l.t0) / l.dur));
        const { x, y } = pos(l.c, l.r);
        ctx.fillStyle = `rgb(${BLUE} / ${0.16 * a})`;
        ctx.beginPath(); ctx.arc(x, y, 8.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgb(${BLUE} / ${a})`;
        ctx.beginPath(); ctx.arc(x, y, 2.9, 0, Math.PI * 2); ctx.fill();
      }
    };

    const frame = (now: number) => {
      if (now - lastSpawn > 240 && lights.length < 26) { spawn(now); lastSpawn = now; }
      draw(now);
      raf = requestAnimationFrame(frame);
    };
    const play = () => { cancelAnimationFrame(raf); if (!reduce && visible && !document.hidden) raf = requestAnimationFrame(frame); };

    const still = () => {
      // Reduced motion: one frame with a few windows already lit.
      const rnd = seeded(5);
      const now = performance.now();
      lights = [];
      for (let i = 0; i < 60 && lights.length < 9; i++) {
        const c = Math.floor(rnd() * heights.length);
        const r = 1 + Math.floor(rnd() * Math.max(1, heights[c] - 1));
        if (heights[c] > 3 && !blocked(c, r)) lights.push({ c, r, t0: now - 1000, dur: 2000 });
      }
      draw(now);
    };

    layout();
    if (reduce) still(); else play();

    const ro = new ResizeObserver(() => { layout(); if (reduce) still(); });
    ro.observe(host);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; play(); });
    io.observe(host);
    document.addEventListener("visibilitychange", play);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); document.removeEventListener("visibilitychange", play); };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ maskImage: "linear-gradient(to right, rgb(0 0 0 / 0.4), #000 55%)", WebkitMaskImage: "linear-gradient(to right, rgb(0 0 0 / 0.4), #000 55%)" }}
    />
  );
}
