"use client";
import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import type { Project } from "@/lib/types";
import { ProjectCard } from "../site/project-card";

export function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function OpenChatButton({ label, variant = "classic" }: { label: string; variant?: "classic" | "lounge" }) {
  return (
    <button className={variant === "lounge" ? "lounge-ghost" : "btn btn-primary"} onClick={() => window.dispatchEvent(new Event("open-chat"))}>
      {label}
    </button>
  );
}

function Select({ value, onChange, label, options }: { value: string; onChange: (v: string) => void; label: string; options: [string, string][] }) {
  return (
    <div className="relative">
      <select className="input appearance-none pr-10" value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <ChevronDown aria-hidden size={16} strokeWidth={1.6} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

export function ProjectExplorer({ projects }: { projects: Project[] }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [area, setArea] = useState("all");
  const [type, setType] = useState("all");
  const areas = useMemo(() => Array.from(new Set(projects.map((p) => p.area).filter(Boolean))) as string[], [projects]);
  const types = useMemo(() => Array.from(new Set(projects.map((p) => p.property_type).filter(Boolean))) as string[], [projects]);
  const shown = projects.filter((p) => {
    const text = `${p.title} ${p.developer ?? ""} ${p.area ?? ""}`.toLowerCase();
    return (!q || text.includes(q.toLowerCase())) &&
      (status === "all" || p.status === status) &&
      (area === "all" || p.area === area) &&
      (type === "all" || p.property_type === type);
  });
  return (
    <div>
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input className="input" placeholder="Search by name, developer, area…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search projects" />
        <Select value={status} onChange={setStatus} label="Status" options={[["all", "All statuses"], ["off-plan", "Off-plan"], ["ready", "Ready"]]} />
        <Select value={area} onChange={setArea} label="Area" options={[["all", "All areas"], ...areas.map((a) => [a, a] as [string, string])]} />
        <Select value={type} onChange={setType} label="Property type" options={[["all", "All types"], ...types.map((t) => [t, t] as [string, string])]} />
      </div>
      {shown.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{shown.map((p) => <ProjectCard key={p.id} p={p} />)}</div>
      ) : (
        <p className="py-16 text-center text-muted-foreground">No projects match these filters.</p>
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
    return <div role="status" className="rounded-[var(--radius)] border border-primary/40 bg-primary/10 p-6">Thank you — we&apos;ll be in touch shortly.</div>;
  }
  const lounge = variant === "lounge";
  const field = (name: string, label: string, el: React.ReactNode) =>
    lounge ? <label className="grid gap-2"><span className="font-ui text-[0.82rem] text-[var(--lounge-muted)]">{label}</span>{el}</label> : el;
  const cls = lounge ? "lounge-input" : "input";
  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {field("name", "Full name", <input name="name" required className={cls} placeholder={lounge ? "Your name" : "Full name"} aria-label={lounge ? undefined : "Full name"} autoComplete="name" />)}
        {lounge
          ? field("email", "Email", <input name="email" type="email" className={cls} placeholder="you@email.com" autoComplete="email" />)
          : <input name="phone" className={cls} placeholder="Phone / WhatsApp" aria-label="Phone" autoComplete="tel" />}
      </div>
      {lounge ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {field("phone", "Phone / WhatsApp", <input name="phone" className={cls} placeholder="+971 …" autoComplete="tel" />)}
          {field("interest", "Subject", <input name="interest" defaultValue={interest} className={cls} placeholder="Investment enquiry" />)}
        </div>
      ) : (
        <>
          <input name="email" type="email" className={cls} placeholder="Email" aria-label="Email" autoComplete="email" />
          <input name="interest" defaultValue={interest} className={cls} placeholder="What are you looking for?" aria-label="Interest" />
        </>
      )}
      {field("message", "Message", <textarea name="message" rows={lounge ? 5 : 4} className={cls} placeholder={lounge ? "Budget, preferred areas, timeline…" : "Message (optional)"} aria-label={lounge ? undefined : "Message"} />)}
      <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {state === "error" && <p role="alert" className="text-sm text-red-400">{err}</p>}
      <button className={lounge ? "lounge-submit" : "btn btn-primary justify-self-start"} disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : lounge ? "Send message" : "Send enquiry"}
      </button>
    </form>
  );
}
