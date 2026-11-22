"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { TemplateThumb } from "@/components/template-thumb";
import type { Template } from "@/lib/templates";

const EVERY = 4500; // ms each template stays in focus

/**
 * The landing page's templates as a carousel: one template in focus in the centre, its neighbours
 * peeking in from the sides. It is a native scroll-snap track, so swiping, trackpads and keyboard
 * scrolling all work; the arrows, dots and autoplay only move that scroll position.
 *
 * Autoplay waits while the pointer or focus is on the carousel, while it is off-screen or the tab
 * is hidden, and never starts for visitors who ask for reduced motion. The pause button stops it.
 */
export function TemplateCarousel({ templates }: { templates: Pick<Template, "id" | "name" | "tags" | "description">[] }) {
  const track = useRef<HTMLDivElement>(null);
  // Open on the second template, so there is a neighbour on both sides and the row reads as browsable.
  const start = Math.min(1, templates.length - 1);
  const [active, setActive] = useState(start);
  const [playing, setPlaying] = useState(true);
  const [held, setHeld] = useState(false); // pointer or focus is inside
  const [seen, setSeen] = useState(false); // carousel is on screen
  const [reduce, setReduce] = useState(false);

  const go = useCallback((i: number) => {
    const el = track.current;
    if (!el) return;
    const n = templates.length;
    const card = el.children[((i % n) + n) % n] as HTMLElement;
    el.scrollTo({ left: card.offsetLeft - (el.clientWidth - card.clientWidth) / 2, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [templates.length]);

  // Centre the starting card before the first paint, without animating.
  useLayoutEffect(() => {
    const el = track.current;
    const card = el?.children[start] as HTMLElement | undefined;
    if (el && card) el.scrollLeft = card.offsetLeft - (el.clientWidth - card.clientWidth) / 2;
  }, [start]);

  // The card nearest the centre of the track is the one in focus.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let raf = 0;
    const measure = () => {
      const mid = el.scrollLeft + el.clientWidth / 2;
      let best = 0, dist = Infinity;
      Array.from(el.children).forEach((c, i) => {
        const card = c as HTMLElement;
        const d = Math.abs(card.offsetLeft + card.clientWidth / 2 - mid);
        if (d < dist) { dist = d; best = i; }
      });
      setActive(best);
    };
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(measure); };
    el.addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const onMq = () => setReduce(mq.matches);
    onMq();
    mq.addEventListener("change", onMq);
    return () => { el.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); io.disconnect(); mq.removeEventListener("change", onMq); };
  }, []);

  const running = playing && !held && seen && !reduce;
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => { if (!document.hidden) go(active + 1); }, EVERY);
    return () => clearInterval(t);
  }, [running, active, go]);

  const btn = "flex h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-surface text-ink transition-colors hover:border-brand hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

  return (
    <div role="group" aria-roledescription="carousel" aria-label="Templates" className="flex flex-col gap-7"
      onPointerEnter={() => setHeld(true)} onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setHeld(false); }}>
      <div ref={track} tabIndex={0} aria-label="Templates, scroll sideways to browse"
        className="carousel-track flex snap-x snap-mandatory gap-6 overflow-x-auto px-[max(1.5rem,calc(50%-280px))] py-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand md:gap-9">
        {templates.map((t, i) => (
          <article key={t.id} role="group" aria-roledescription="slide" aria-label={`${t.name}, ${i + 1} of ${templates.length}`} aria-current={i === active ? "true" : undefined}
            onClick={() => { if (i !== active) go(i); }}
            className={`carousel-card flex w-[min(560px,82vw)] shrink-0 snap-center flex-col gap-5 ${i === active ? "" : "cursor-pointer"}`}>
            <div className="carousel-frame overflow-hidden rounded-xl border border-line bg-surface"><TemplateThumb kind={t.id} className="" /></div>
            <div className="carousel-text flex flex-col gap-2.5">
              <h3 className="text-2xl font-semibold tracking-[-0.02em]">{t.name}</h3>
              <ul aria-label="Tags" className="flex flex-wrap gap-1.5">
                {t.tags.map((tag) => <li key={tag} className="rounded-full border border-line-strong px-3 py-0.5 text-[0.85rem] text-ink-2">{tag}</li>)}
              </ul>
              <p className="max-w-[52ch] text-[1.05rem] text-ink-3">{t.description}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="mx-auto flex w-full max-w-[1240px] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6">
        <div className="flex items-center gap-2">
          <button type="button" className={btn} onClick={() => go(active - 1)} aria-label="Previous template"><ArrowLeft size={18} aria-hidden /></button>
          <button type="button" className={btn} onClick={() => go(active + 1)} aria-label="Next template"><ArrowRight size={18} aria-hidden /></button>
          {!reduce && (
            <button type="button" className={btn} onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause the carousel" : "Play the carousel"}>
              {playing ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />}
            </button>
          )}
        </div>
        <div className="flex items-center">
          {templates.map((t, i) => (
            <button key={t.id} type="button" onClick={() => go(i)} aria-label={`Show ${t.name}`} aria-current={i === active ? "true" : undefined} className="group flex h-11 items-center px-1.5">
              <span className={`carousel-dot block h-1.5 overflow-hidden rounded-full transition-[width,background-color] duration-500 ${i === active ? "w-9 bg-line" : "w-1.5 bg-line-strong group-hover:bg-brand"}`}>
                {/* The focused dot fills while its template is on show; the key restarts it each time. */}
                {i === active && <span key={`${active}-${running}`} className={`block h-full rounded-full bg-brand ${running ? "carousel-fill" : "w-full"}`} style={{ animationDuration: `${EVERY}ms` }} />}
              </span>
            </button>
          ))}
        </div>
        <p aria-live="polite" className="text-[0.95rem] tabular-nums text-ink-3"><span className="font-semibold text-ink">{templates[active]?.name}</span> · {active + 1} of {templates.length}</p>
      </div>
    </div>
  );
}
