"use client";
// Text fields with their Arabic twin beside them (`title` / `title_ar`, see src/lib/i18n/content.ts).
// The Arabic box only appears while the site publishes Arabic; an empty one shows the English.
import { useState, useTransition } from "react";
import { Languages, Loader2 } from "lucide-react";
import { translateFields } from "@/app/admin/actions";
import { useAdminT } from "./i18n";

type Box = { tag: string; lang: "en" | "ar"; children: React.ReactNode };

/** One language's input, with a small language tag in its corner. */
function LangBox({ tag, lang, children }: Box) {
  return (
    // The box takes its language's direction, so the tag always sits at the end of the text.
    <div className="relative min-w-0" lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>
      {children}
      <span aria-hidden className="pointer-events-none absolute end-2 top-2 rounded bg-sunken px-1.5 text-[0.7rem] font-semibold text-quiet">{tag}</span>
    </div>
  );
}

type Common = { label: string; multiline?: boolean; rows?: number; placeholder?: string; hint?: React.ReactNode; required?: boolean; maxLength?: number; className?: string };

/**
 * Controlled: the parent holds both values. `name` (optional) names the pair `name` / `name_ar`, so a
 * TranslateButton in the same form finds it; the server ignores names it does not read.
 */
export function BiField({ label, name, value, valueAr, onChange, onChangeAr, multiline, rows = 3, placeholder, hint, required, maxLength, className = "" }: Common & {
  name?: string; value: string; valueAr: string; onChange: (v: string) => void; onChangeAr: (v: string) => void;
}) {
  const { t, arabicOn } = useAdminT();
  const El = multiline ? "textarea" : "input";
  return (
    <div className={`field ${className}`}>
      <span>{label}</span>
      <div className={arabicOn ? "grid gap-2 md:grid-cols-2" : ""}>
        <LangBox tag={t.bi.en} lang="en">
          <El dir="ltr" name={name} aria-label={`${label} (${t.bi.english})`} value={value} rows={multiline ? rows : undefined} placeholder={placeholder}
            required={required} maxLength={maxLength} onChange={(e) => onChange(e.target.value)} className="w-full pe-9" />
        </LangBox>
        {arabicOn && (
          <LangBox tag={t.bi.ar} lang="ar">
            <El dir="rtl" name={name && `${name}_ar`} aria-label={`${label} (${t.bi.arabic})`} value={valueAr} rows={multiline ? rows : undefined} placeholder={value || t.bi.arabicPlaceholder}
              maxLength={maxLength} onChange={(e) => onChangeAr(e.target.value)} className="w-full pe-9" />
          </LangBox>
        )}
      </div>
      {hint && <small>{hint}</small>}
    </div>
  );
}

/** Uncontrolled, for FormData forms: posts `name` and `name_ar`. */
export function BiInput({ label, name, defaultValue, defaultValueAr, multiline, rows = 3, placeholder, hint, required, maxLength, className = "" }: Common & {
  name: string; defaultValue?: string | null; defaultValueAr?: string | null;
}) {
  const { t, arabicOn } = useAdminT();
  const El = multiline ? "textarea" : "input";
  return (
    <div className={`field ${className}`}>
      <span>{label}</span>
      <div className={arabicOn ? "grid gap-2 md:grid-cols-2" : ""}>
        <LangBox tag={t.bi.en} lang="en">
          <El dir="ltr" name={name} aria-label={`${label} (${t.bi.english})`} defaultValue={defaultValue ?? ""} rows={multiline ? rows : undefined}
            placeholder={placeholder} required={required} maxLength={maxLength} className="w-full pe-9" />
        </LangBox>
        {arabicOn
          ? (
            <LangBox tag={t.bi.ar} lang="ar">
              <El dir="rtl" name={`${name}_ar`} aria-label={`${label} (${t.bi.arabic})`} defaultValue={defaultValueAr ?? ""} rows={multiline ? rows : undefined}
                placeholder={t.bi.arabicPlaceholder} maxLength={maxLength} className="w-full pe-9" />
            </LangBox>
          )
          // Keep the Arabic when the site has Arabic switched off, so turning it back on loses nothing.
          : <input type="hidden" name={`${name}_ar`} value={defaultValueAr ?? ""} />}
      </div>
      {hint && <small>{hint}</small>}
    </div>
  );
}

/**
 * Fills the empty Arabic fields from their English with the site's AI provider. Works on the form (or
 * `[data-translate-scope]` element) around it: every `*_ar` field that is empty while its English twin
 * has text. Values go in through the native setter and an input event, so controlled fields update too.
 * Callers with data that is not all on screen pass `collect` and `apply` instead.
 */
export function TranslateButton({ collect, apply, className = "" }: {
  collect?: () => Record<string, string>;
  apply?: (map: Record<string, string>) => void;
  className?: string;
}) {
  const { t, arabicOn } = useAdminT();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  if (!arabicOn) return null;

  const run = (btn: HTMLButtonElement) => start(async () => {
    setMsg(null);
    const scope = btn.closest("[data-translate-scope]") ?? btn.closest("form");
    let texts: Record<string, string> = {};
    const fields = new Map<string, HTMLInputElement | HTMLTextAreaElement>();
    if (collect) texts = collect();
    else if (scope) {
      scope.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input[name$='_ar'], textarea[name$='_ar']").forEach((el, i) => {
        if (el.type === "hidden" || el.value.trim()) return;
        const en = scope.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${CSS.escape(el.name.slice(0, -3))}"]`);
        const text = en?.value.trim();
        if (!text) return;
        const key = `f${i}`;
        texts[key] = text;
        fields.set(key, el);
      });
    }
    if (!Object.keys(texts).length) return setMsg({ ok: true, text: t.bi.nothingToTranslate });
    const r = await translateFields(texts);
    if (!r.ok) {
      const text = r.error === "no-provider" ? t.bi.noProvider : r.error === "too-much" ? t.bi.tooMuch : r.error === "rate" ? t.bi.rateLimited : t.bi.translateFailed;
      return setMsg({ ok: false, text });
    }
    const map = r.map ?? {};
    if (apply) apply(map);
    else {
      for (const [key, el] of fields) {
        if (!map[key]) continue;
        const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
        Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(el, map[key]);
        el.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }
    setMsg({ ok: true, text: t.bi.translated(Object.keys(map).length) });
  });

  return (
    <span className={`inline-flex flex-wrap items-center gap-x-3 gap-y-1 ${className}`}>
      <button type="button" className="a-btn a-btn-ghost" disabled={pending} onClick={(e) => run(e.currentTarget)}>
        {pending ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Languages size={16} aria-hidden />}
        {pending ? t.bi.translating : t.bi.translate}
      </button>
      {msg && <span role={msg.ok ? "status" : "alert"} className={`text-sm ${msg.ok ? "a-muted" : "text-danger"}`}>{msg.text}</span>}
    </span>
  );
}
