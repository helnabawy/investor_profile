"use client";
import { useMemo, useState } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { Project } from "@/lib/types";
import { ProjectCard } from "../site/project-card";

export function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  // Server HTML can't know the visitor's setting, so the first paint is hidden either way; with
  // reduced motion we just show it at once (zero-length transition) instead of fading it in.
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={reduce ? { duration: 0 } : { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function OpenChatButton({ label, variant = "classic" }: { label: string; variant?: "classic" | "lounge" | "light" }) {
  const cls = variant === "lounge" ? "lounge-ghost" : variant === "light" ? "btn btn-light" : "btn btn-primary";
  return (
    <button type="button" className={cls} onClick={() => askConcierge()}>
      {label}
    </button>
  );
}

/** Opens the floating concierge; with a question, sends it straight away. */
export function askConcierge(question?: string) {
  window.dispatchEvent(new CustomEvent("open-chat", { detail: question ? { question } : undefined }));
}

/** Hero question box: type or tap a suggestion, and the concierge opens with the answer. */
export function ConciergeAsk({ placeholder, suggestions, note }: { placeholder: string; suggestions: string[]; note?: string }) {
  const [q, setQ] = useState("");
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (q.trim()) { askConcierge(q); setQ(""); } }}
      className="c-card flex flex-col gap-3.5 p-5 shadow-[0_12px_32px_rgb(0_0_0/0.07)]"
    >
      <label htmlFor="hero-ask" className="flex items-center gap-2 font-heading text-[0.95rem] font-semibold">
        <MessageCircle size={18} className="text-primary" aria-hidden /> Ask the concierge
      </label>
      <div className="flex flex-wrap gap-2.5">
        <input id="hero-ask" value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} maxLength={500}
          className="input !min-h-[3.25rem] min-w-0 flex-[1_1_16rem] !bg-card" />
        <button className="btn btn-primary !min-h-[3.25rem]">Ask</button>
      </div>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.slice(0, 4).map((s) => <button key={s} type="button" className="c-chip" onClick={() => askConcierge(s)}>{s}</button>)}
        </div>
      )}
      {note && <p className="text-[0.82rem] text-muted-foreground">{note}</p>}
    </form>
  );
}

/** A link that opens the concierge when its href is "#chat"; a normal link otherwise. */
export function ChatAwareLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  if (href === "#chat") return <button type="button" className={`text-left ${className ?? ""}`} onClick={() => askConcierge()}>{children}</button>;
  return <a href={href} className={className}>{children}</a>;
}

function Select({ value, onChange, label, options, id }: { value: string; onChange: (v: string) => void; label: string; options: [string, string][]; id: string }) {
  return (
    <div className="flex min-w-0 flex-[1_1_10rem] flex-col gap-1.5">
      <label htmlFor={id} className="text-[0.82rem] font-semibold text-muted-foreground">{label}</label>
      <div className="relative">
        <select id={id} className="input appearance-none !bg-card pr-10" value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <ChevronDown aria-hidden size={16} strokeWidth={1.6} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
      </div>
    </div>
  );
}

const BUDGETS: [string, string, number, number][] = [
  ["all", "Any budget", 0, Infinity],
  ["lt1.5", "Under 1.5M", 0, 1_500_000],
  ["1.5-5", "1.5M – 5M", 1_500_000, 5_000_000],
  ["gt5", "Above 5M", 5_000_000, Infinity],
];

export function ProjectExplorer({ projects }: { projects: Project[] }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [area, setArea] = useState("all");
  const [type, setType] = useState("all");
  const [budget, setBudget] = useState("all");
  const [sort, setSort] = useState("featured");
  const areas = useMemo(() => Array.from(new Set(projects.map((p) => p.area).filter(Boolean))) as string[], [projects]);
  const types = useMemo(() => Array.from(new Set(projects.map((p) => p.property_type).filter(Boolean))) as string[], [projects]);
  const [, , lo, hi] = BUDGETS.find((b) => b[0] === budget) ?? BUDGETS[0];
  const base = projects.filter((p) => {
    const text = `${p.title} ${p.developer ?? ""} ${p.area ?? ""}`.toLowerCase();
    const price = p.price_from ?? 0;
    return (!q || text.includes(q.toLowerCase())) &&
      (area === "all" || p.area === area) &&
      (type === "all" || p.property_type === type) &&
      (budget === "all" || (p.price_from != null && price >= lo && price < hi));
  });
  const counts = { all: base.length, "off-plan": base.filter((p) => p.status === "off-plan").length, ready: base.filter((p) => p.status === "ready").length };
  const byPrice = (a: Project, b: Project) => (a.price_from ?? Infinity) - (b.price_from ?? Infinity);
  const shown = base
    .filter((p) => status === "all" || p.status === status)
    .sort(sort === "price-asc" ? byPrice : sort === "price-desc" ? (a, b) => byPrice(b, a) : sort === "featured" ? (a, b) => Number(b.featured) - Number(a.featured) : () => 0);
  const currency = projects[0]?.currency ?? "AED";

  return (
    <div className="flex flex-col gap-6">
      <div role="search" className="c-card flex flex-wrap items-end gap-3.5 p-4">
        <div className="flex min-w-0 flex-[2_1_14rem] flex-col gap-1.5">
          <label htmlFor="pe-q" className="text-[0.82rem] font-semibold text-muted-foreground">Search</label>
          <input id="pe-q" type="search" className="input !bg-card" placeholder="Name, developer or area" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select id="pe-area" value={area} onChange={setArea} label="Area" options={[["all", "All areas"], ...areas.map((a) => [a, a] as [string, string])]} />
        {types.length > 1 && <Select id="pe-type" value={type} onChange={setType} label="Property type" options={[["all", "All types"], ...types.map((t) => [t, t] as [string, string])]} />}
        <Select id="pe-budget" value={budget} onChange={setBudget} label={`Budget (${currency})`} options={BUDGETS.map(([v, l]) => [v, l])} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Status" className="flex flex-wrap gap-2">
          {([["all", "All"], ["off-plan", "Off-plan"], ["ready", "Ready"]] as const).map(([v, l]) => (
            <button key={v} type="button" aria-pressed={status === v} onClick={() => setStatus(v)}
              className={`min-h-11 rounded-full border px-4 text-[0.94rem] ${status === v ? "border-primary bg-primary font-semibold text-primary-foreground" : "bg-card font-medium hover:border-primary"}`}>
              {l} · {counts[v]}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2.5 text-sm text-muted-foreground">
          Sort by
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="input !w-auto !bg-card !py-2 text-[0.94rem] text-foreground">
            <option value="featured">Featured first</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </label>
      </div>

      {shown.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{shown.map((p) => <ProjectCard key={p.id} p={p} />)}</div>
      ) : (
        <div className="c-card flex flex-col items-center gap-3 px-6 py-14 text-center">
          <p className="font-heading text-lg font-bold">No projects match these filters</p>
          <p className="text-muted-foreground">Try a wider budget or another area, or ask the concierge for options.</p>
          <OpenChatButton label="Ask the concierge" />
        </div>
      )}
    </div>
  );
}

export function ContactForm({ interest, variant = "classic" }: { interest?: string; variant?: "classic" | "lounge" }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [err, setErr] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).catch(() => null);
    if (res?.ok) return setState("done");
    setErr((await res?.json().catch(() => null))?.error ?? "Something went wrong. Please try again.");
    setState("error");
  }
  if (state === "done") {
    return <div role="status" className="rounded-[var(--radius)] border border-primary/40 bg-primary/10 p-6 font-medium">Thank you. We&apos;ll be in touch shortly.</div>;
  }
  const lounge = variant === "lounge";
  if (lounge) {
    const field = (label: string, el: React.ReactNode) => <label className="grid gap-2"><span className="font-ui text-[0.82rem] text-[var(--lounge-muted)]">{label}</span>{el}</label>;
    const cls = "lounge-input";
    return (
      <form onSubmit={submit} className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {field("Full name", <input name="name" required className={cls} placeholder="Your name" autoComplete="name" />)}
          {field("Email", <input name="email" type="email" className={cls} placeholder="you@email.com" autoComplete="email" />)}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {field("Phone / WhatsApp", <input name="phone" className={cls} placeholder="+971 …" autoComplete="tel" />)}
          {field("Subject", <input name="interest" defaultValue={interest} className={cls} placeholder="Investment enquiry" />)}
        </div>
        {field("Message", <textarea name="message" rows={5} className={cls} placeholder="Budget, preferred areas, timeline…" />)}
        <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        {state === "error" && <p role="alert" className="text-sm text-red-400">{err}</p>}
        <button className="lounge-submit" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Send message"}</button>
      </form>
    );
  }
  // Classic: visible labels, three short required-feeling fields, everything else optional.
  const field = (id: string, label: string, el: React.ReactNode, optional?: boolean) => (
    <div className="grid min-w-0 gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">{label}{optional && <span className="font-normal text-muted-foreground"> (optional)</span>}</label>
      {el}
    </div>
  );
  const uid = interest ? "pf" : "cf"; // project form and contact form never share a page, but keep ids distinct anyway
  return (
    <form onSubmit={submit} className="grid gap-4">
      {/* The project-page form sits in a narrow side column, so its fields stack. */}
      <div className={`grid gap-4 ${interest ? "" : "sm:grid-cols-2"}`}>
        {field(`${uid}-name`, "Full name", <input id={`${uid}-name`} name="name" required className="input !bg-card" autoComplete="name" />)}
        {field(`${uid}-phone`, "Phone or WhatsApp", <input id={`${uid}-phone`} name="phone" type="tel" className="input !bg-card" placeholder="+971" autoComplete="tel" />)}
      </div>
      {field(`${uid}-email`, "Email", <input id={`${uid}-email`} name="email" type="email" className="input !bg-card" autoComplete="email" />)}
      {interest
        ? <input type="hidden" name="interest" value={interest} />
        : field(`${uid}-interest`, "I am looking for", <input id={`${uid}-interest`} name="interest" className="input !bg-card" placeholder="e.g. a 2 BR for rental yield" />, true)}
      {field(`${uid}-msg`, "Message", <textarea id={`${uid}-msg`} name="message" rows={interest ? 3 : 4} className="input !bg-card" placeholder="Budget, preferred areas, timeline" />, true)}
      <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {state === "error" && <p role="alert" className="text-sm font-medium text-red-700">{err}</p>}
      <button className="btn btn-primary !min-h-[3.25rem]" disabled={state === "sending"}>{state === "sending" ? "Sending…" : interest ? "Request details" : "Send message"}</button>
      <p className="text-[0.82rem] text-muted-foreground">Your details go only to this advisor. No spam, no sharing.</p>
    </form>
  );
}
