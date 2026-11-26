"use client";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { askConcierge } from "@/components/sections/client";
import { useSiteT } from "@/components/site/link";

/**
 * The concierge question box in each template's own shape: a pill (Horizon), a labelled field
 * with a square button (Ledger and Foyer), or a single underlined line (Atelier). Submitting
 * opens the floating concierge with the question already sent.
 */
export function TemplateAsk({ shape, placeholder, label, note, suggestions = [], id = "t-ask" }: {
  shape: "pill" | "field" | "line";
  placeholder: string;
  label: string;
  note?: string;
  suggestions?: string[];
  id?: string;
}) {
  const [q, setQ] = useState("");
  const { t } = useSiteT();
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (q.trim()) { askConcierge(q); setQ(""); } };
  const input = (cls: string) => (
    <input id={id} value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} maxLength={500} aria-label={shape === "pill" ? label : undefined} className={cls} />
  );
  return (
    <form onSubmit={submit} className={`flex w-full flex-col gap-2.5 ${shape === "pill" ? "items-center" : ""}`}>
      {shape !== "pill" && <label htmlFor={id} className={shape === "line" ? "text-[0.95rem] text-muted-foreground" : "font-semibold"}>{label}</label>}
      {shape === "pill" && (
        <div className="t-ask-pill flex w-full flex-wrap gap-2 rounded-[28px] border bg-card p-2">
          {input("min-h-12 min-w-0 flex-[1_1_15rem] rounded-full bg-transparent px-4 text-base outline-none")}
          <button className="btn btn-primary !min-h-12 !px-6">{t.common.ask}</button>
        </div>
      )}
      {shape === "field" && (
        <div className="flex flex-wrap gap-2">
          {input("input !min-h-[3.25rem] min-w-0 flex-[1_1_14rem] !bg-card !text-base")}
          <button className="btn btn-primary !min-h-[3.25rem] !px-6">{t.common.ask}</button>
        </div>
      )}
      {shape === "line" && (
        <div className="t-ask-line flex items-end gap-3 border-b border-foreground">
          {input("min-h-[3.1rem] min-w-0 flex-1 bg-transparent text-lg outline-none")}
          <button aria-label={t.common.ask} className="flex h-12 w-12 shrink-0 items-center justify-center text-primary"><ArrowRight size={22} strokeWidth={1.6} className="rtl:-scale-x-100" aria-hidden /></button>
        </div>
      )}
      {suggestions.length > 0 && (
        <div className={`flex flex-wrap gap-2 ${shape === "pill" ? "justify-center" : ""}`}>
          {suggestions.slice(0, 4).map((s) => <button key={s} type="button" className="c-chip" onClick={() => askConcierge(s)}>{s}</button>)}
        </div>
      )}
      {note && <p className="text-[0.88rem] text-muted-foreground">{note}</p>}
    </form>
  );
}
