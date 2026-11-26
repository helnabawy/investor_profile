"use client";
import { useMemo, useState } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { Project } from "@/lib/types";
import { ProjectCard } from "../site/project-card";
import { apiUrl } from "@/lib/api-base";
import { siteHref, useSiteBase, useSiteT } from "../site/link";

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
  const { t } = useSiteT();
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (q.trim()) { askConcierge(q); setQ(""); } }}
      className="c-card flex flex-col gap-3.5 p-5 shadow-[0_12px_32px_rgb(0_0_0/0.07)]"
    >
      <label htmlFor="hero-ask" className="flex items-center gap-2 font-heading text-[0.95rem] font-semibold">
        <MessageCircle size={18} className="text-primary" aria-hidden /> {t.common.askConcierge}
      </label>
      <div className="flex flex-wrap gap-2.5">
        <input id="hero-ask" value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} maxLength={500}
          className="input !min-h-[3.25rem] min-w-0 flex-[1_1_16rem] !bg-card" />
        <button className="btn btn-primary !min-h-[3.25rem]">{t.common.ask}</button>
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
  const base = useSiteBase();
  if (href === "#chat") return <button type="button" className={`text-start ${className ?? ""}`} onClick={() => askConcierge()}>{children}</button>;
  return <a href={siteHref(base, href)} className={className}>{children}</a>;
}

function Select({ value, onChange, label, options, id }: { value: string; onChange: (v: string) => void; label: string; options: [string, string][]; id: string }) {
  return (
    <div className="flex min-w-0 flex-[1_1_10rem] flex-col gap-1.5">
      <label htmlFor={id} className="text-[0.82rem] font-semibold text-muted-foreground">{label}</label>
      <div className="relative">
        <select id={id} className="input appearance-none !bg-card pe-10" value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <ChevronDown aria-hidden size={16} strokeWidth={1.6} className="pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
      </div>
    </div>
  );
}

const BUDGETS: [string, "anyBudget" | "under15" | "from15to5" | "above5", number, number][] = [
  ["all", "anyBudget", 0, Infinity],
  ["lt1.5", "under15", 0, 1_500_000],
  ["1.5-5", "from15to5", 1_500_000, 5_000_000],
  ["gt5", "above5", 5_000_000, Infinity],
];

export function ProjectExplorer({ projects }: { projects: Project[] }) {
  const { t, locale } = useSiteT();
  const x = t.explorer;
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
  const counts = {
    all: base.length, "off-plan": base.filter((p) => p.status === "off-plan").length, ready: base.filter((p) => p.status === "ready").length,
    "for-sale": base.filter((p) => p.for_sale).length,
  };
  // "For sale" is the agent's own flag, so the chip only appears once a project carries it.
  const chips: ["all" | "off-plan" | "ready" | "for-sale", string][] = [["all", x.all], ["off-plan", t.card.offPlan], ["ready", t.card.ready]];
  if (projects.some((p) => p.for_sale)) chips.push(["for-sale", t.card.forSale]);
  const byPrice = (a: Project, b: Project) => (a.price_from ?? Infinity) - (b.price_from ?? Infinity);
  const shown = base
    .filter((p) => status === "all" || (status === "for-sale" ? p.for_sale : p.status === status))
    .sort(sort === "price-asc" ? byPrice : sort === "price-desc" ? (a, b) => byPrice(b, a) : sort === "featured" ? (a, b) => Number(b.featured) - Number(a.featured) : () => 0);
  const currency = projects[0]?.currency ?? "AED";

  return (
    <div className="flex flex-col gap-6">
      <div role="search" className="c-card flex flex-wrap items-end gap-3.5 p-4">
        <div className="flex min-w-0 flex-[2_1_14rem] flex-col gap-1.5">
          <label htmlFor="pe-q" className="text-[0.82rem] font-semibold text-muted-foreground">{x.search}</label>
          <input id="pe-q" type="search" className="input !bg-card" placeholder={x.searchPlaceholder} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select id="pe-area" value={area} onChange={setArea} label={x.area} options={[["all", x.allAreas], ...areas.map((a) => [a, a] as [string, string])]} />
        {types.length > 1 && <Select id="pe-type" value={type} onChange={setType} label={x.propertyType} options={[["all", x.allTypes], ...types.map((t) => [t, t] as [string, string])]} />}
        <Select id="pe-budget" value={budget} onChange={setBudget} label={x.budget(currency)} options={BUDGETS.map(([v, l]) => [v, x[l]])} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label={x.status} className="flex flex-wrap gap-2">
          {chips.map(([v, l]) => (
            <button key={v} type="button" aria-pressed={status === v} onClick={() => setStatus(v)}
              className={`min-h-11 rounded-full border px-4 text-[0.94rem] ${status === v ? "border-primary bg-primary font-semibold text-primary-foreground" : "bg-card font-medium hover:border-primary"}`}>
              {l} · {counts[v]}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2.5 text-sm text-muted-foreground">
          {x.sortBy}
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="input !w-auto !bg-card !py-2 text-[0.94rem] text-foreground">
            <option value="featured">{x.featuredFirst}</option>
            <option value="price-asc">{x.priceAsc}</option>
            <option value="price-desc">{x.priceDesc}</option>
          </select>
        </label>
      </div>

      {shown.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{shown.map((p) => <ProjectCard key={p.id} p={p} locale={locale} />)}</div>
      ) : (
        <div className="c-card flex flex-col items-center gap-3 px-6 py-14 text-center">
          <p className="font-heading text-lg font-bold">{x.noMatch}</p>
          <p className="text-muted-foreground">{x.noMatchHint}</p>
          <OpenChatButton label={t.common.askConcierge} />
        </div>
      )}
    </div>
  );
}

export function ContactForm({ interest, variant = "classic" }: { interest?: string; variant?: "classic" | "lounge" }) {
  const { t, locale } = useSiteT();
  const f = t.form;
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [err, setErr] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch(apiUrl("/api/contact"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, locale }) }).catch(() => null);
    if (res?.ok) return setState("done");
    setErr((await res?.json().catch(() => null))?.error ?? f.error);
    setState("error");
  }
  if (state === "done") {
    return <div role="status" className="rounded-[var(--radius)] border border-primary/40 bg-primary/10 p-6 font-medium">{f.thanks}</div>;
  }
  const lounge = variant === "lounge";
  if (lounge) {
    const field = (label: string, el: React.ReactNode) => <label className="grid gap-2"><span className="font-ui text-[0.82rem] text-[var(--lounge-muted)]">{label}</span>{el}</label>;
    const cls = "lounge-input";
    return (
      <form onSubmit={submit} className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {field(f.fullName, <input name="name" required className={cls} placeholder={f.yourName} autoComplete="name" />)}
          {field(f.email, <input name="email" type="email" dir="ltr" className={cls} placeholder={f.emailPlaceholder} autoComplete="email" />)}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {field(f.phoneWhatsapp, <input name="phone" dir="ltr" className={cls} placeholder="+971 …" autoComplete="tel" />)}
          {field(f.subject, <input name="interest" defaultValue={interest} className={cls} placeholder={f.subjectPlaceholder} />)}
        </div>
        {field(f.message, <textarea name="message" rows={5} className={cls} placeholder={f.messagePlaceholder} />)}
        <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        {state === "error" && <p role="alert" className="text-sm text-red-400">{err}</p>}
        <button className="lounge-submit" disabled={state === "sending"}>{state === "sending" ? f.sending : f.send}</button>
      </form>
    );
  }
  // Classic: visible labels, three short required-feeling fields, everything else optional.
  const field = (id: string, label: string, el: React.ReactNode, optional?: boolean) => (
    <div className="grid min-w-0 gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">{label}{optional && <span className="font-normal text-muted-foreground">{f.optional}</span>}</label>
      {el}
    </div>
  );
  const uid = interest ? "pf" : "cf"; // project form and contact form never share a page, but keep ids distinct anyway
  return (
    <form onSubmit={submit} className="grid gap-4">
      {/* The project-page form sits in a narrow side column, so its fields stack. */}
      <div className={`grid gap-4 ${interest ? "" : "sm:grid-cols-2"}`}>
        {field(`${uid}-name`, f.fullName, <input id={`${uid}-name`} name="name" required className="input !bg-card" autoComplete="name" />)}
        {field(`${uid}-phone`, f.phoneOrWhatsapp, <input id={`${uid}-phone`} name="phone" type="tel" dir="ltr" className="input !bg-card" placeholder="+971" autoComplete="tel" />)}
      </div>
      {field(`${uid}-email`, f.email, <input id={`${uid}-email`} name="email" type="email" dir="ltr" className="input !bg-card" autoComplete="email" />)}
      {interest
        ? <input type="hidden" name="interest" value={interest} />
        : field(`${uid}-interest`, f.lookingFor, <input id={`${uid}-interest`} name="interest" className="input !bg-card" placeholder={f.lookingForPlaceholder} />, true)}
      {field(`${uid}-msg`, f.message, <textarea id={`${uid}-msg`} name="message" rows={interest ? 3 : 4} className="input !bg-card" placeholder={f.messagePlaceholderShort} />, true)}
      <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {state === "error" && <p role="alert" className="text-sm font-medium text-red-700">{err}</p>}
      <button className="btn btn-primary !min-h-[3.25rem]" disabled={state === "sending"}>{state === "sending" ? f.sending : interest ? f.requestDetails : f.send}</button>
      <p className="text-[0.82rem] text-muted-foreground">{f.privacy}</p>
    </form>
  );
}
