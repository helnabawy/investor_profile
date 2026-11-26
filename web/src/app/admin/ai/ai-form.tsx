"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { ChevronDown } from "lucide-react";
import { saveAi } from "../actions";
import { FormMessage, PageTitle, SubmitButton } from "@/components/admin/ui";
import type { AiConfig } from "@/lib/ai/config";
import { BiField, TranslateButton } from "@/components/admin/bilingual";
import { useAdminT } from "@/components/admin/i18n";

type P = { id: string; label: string; note: string; defaultModel: string; configured: boolean };

function Card({ title, hint, children }: { title: string; hint?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="a-card flex flex-col gap-[18px]">
      <div><h2 className="text-[1.05rem] font-semibold">{title}</h2>{hint && <p className="a-muted text-sm">{hint}</p>}</div>
      {children}
    </section>
  );
}

export function AiForm({ config, providers, tenantName, sources }: { config: AiConfig; providers: P[]; tenantName: string; sources: { projects: number; faqs: number; notes: number } }) {
  const [state, action] = useActionState(saveAi, null);
  const { t, locale } = useAdminT();
  const a = t.ai;
  const [provider, setProvider] = useState<string>(config.provider ?? "auto");
  // Live copy of what the greeting preview shows, in both languages.
  const [name, setName] = useState(config.assistantName ?? a.defaultName(tenantName));
  const [nameAr, setNameAr] = useState(config.assistantName_ar ?? "");
  const [greeting, setGreeting] = useState(config.greeting ?? "");
  const [greetingAr, setGreetingAr] = useState(config.greeting_ar ?? "");
  const [chips, setChips] = useState((config.suggestions ?? []).join("\n"));
  const [chipsAr, setChipsAr] = useState((config.suggestions_ar ?? []).join("\n"));
  const [enabled, setEnabled] = useState(config.enabled !== false);
  const current = providers.find((p) => p.id === provider);
  const toList = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean).slice(0, 8);
  const chipList = toList(locale === "ar" && chipsAr.trim() ? chipsAr : chips);
  const providerLabel = provider === "auto" ? a.automaticFallback : current?.label ?? provider;

  return (
    <form action={action}>
      <PageTitle title={a.title} subtitle={a.subtitle}>
        <div className="flex flex-wrap items-center gap-3"><FormMessage state={state} /><TranslateButton /><SubmitButton>{t.ui.saveChanges}</SubmitButton></div>
      </PageTitle>

      <div className="flex flex-wrap items-start gap-6">
        <div className="flex min-w-0 flex-[1.4_1_440px] flex-col gap-6">
          <section className="a-card !py-4">
            <label className="flex min-h-12 cursor-pointer items-center justify-between gap-5">
              <span><span className="block font-semibold">{enabled ? a.on : a.off}</span><span className="a-muted text-sm">{a.onHint}</span></span>
              <input type="checkbox" name="enabled" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="h-[22px] w-[22px] shrink-0" />
            </label>
          </section>

          <Card title={a.greets}>
            <BiField name="assistantName" label={a.name} value={name} valueAr={nameAr} onChange={setName} onChangeAr={setNameAr} maxLength={60} />
            <BiField name="greeting" label={a.greeting} multiline value={greeting} valueAr={greetingAr} onChange={setGreeting} onChangeAr={setGreetingAr} placeholder={a.greetingPh} maxLength={600} />
            <BiField name="suggestions" label={a.chips} multiline rows={6} value={chips} valueAr={chipsAr} onChange={setChips} onChangeAr={setChipsAr}
              placeholder={a.chipsPh} hint={a.chipsHint(toList(chips).length)} />
          </Card>

          <Card title={a.behave} hint={<>{a.behaveHint1}<Link href="/admin/knowledge" className="a-link">{a.behaveLink}</Link>.</>}>
            <label className="field"><span>{a.instructions}</span>
              <textarea name="instructions" rows={7} dir="auto" defaultValue={config.instructions ?? ""} placeholder={a.instructionsPh} />
              <small>{a.languageNote}</small>
            </label>
            <label className="field"><span>{a.creativity}</span>
              <select name="temperature" defaultValue={String(config.temperature ?? 0.4)} className="max-w-[360px]">
                <option value="0.2">{a.precise}</option><option value="0.4">{a.balanced}</option><option value="0.7">{a.conversational}</option>
              </select>
            </label>
          </Card>

          <details className="a-card group !py-0">
            <summary className="flex min-h-[64px] cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
              <span><span className="block font-semibold">{a.model}</span><span className="a-muted text-sm">{providerLabel}</span></span>
              <ChevronDown size={20} className="text-ink-2 transition-transform duration-300 group-open:rotate-180" aria-hidden />
            </summary>
            <div className="flex flex-col gap-4 pb-6">
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors has-[:checked]:border-brand has-[:checked]:bg-brand-tint">
                  <input type="radio" name="provider" value="auto" checked={provider === "auto"} onChange={() => setProvider("auto")} className="mt-1" />
                  <span><span className="text-sm font-medium">{a.automatic}</span><span className="a-muted block text-[0.82rem]">{a.automaticHint}</span></span>
                </label>
                {providers.map((p) => (
                  <label key={p.id} className={`flex items-start gap-3 rounded-lg border p-3 transition-colors has-[:checked]:border-brand has-[:checked]:bg-brand-tint ${p.configured ? "cursor-pointer" : "opacity-55"}`}>
                    <input type="radio" name="provider" value={p.id} disabled={!p.configured} checked={provider === p.id} onChange={() => setProvider(p.id)} className="mt-1" />
                    <span><span className="text-sm font-medium">{p.label}</span><span className="a-muted block text-[0.82rem]">{p.note}{!p.configured && a.notConfigured}</span></span>
                  </label>
                ))}
              </div>
              {provider !== "auto" && current && (
                <label className="field"><span>{a.modelId}</span><input name="model" dir="ltr" defaultValue={config.provider === provider ? config.model : ""} placeholder={current.defaultModel} /></label>
              )}
              <p className="a-muted text-[0.82rem]">{a.fallbackHint}</p>
            </div>
          </details>
        </div>

        <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-6 lg:sticky lg:top-6">
          <section aria-label={a.preview} className="overflow-hidden rounded-xl border bg-surface">
            <div className="border-b px-5 py-4"><h2 className="font-semibold">{a.firstSeen}</h2><p className="a-muted text-sm">{a.updates}</p></div>
            <div className={`flex flex-col gap-3 bg-subtle p-5 transition-opacity ${enabled ? "" : "opacity-50"}`}>
              <p className="text-[0.82rem] font-medium text-quiet">{(locale === "ar" && nameAr) || name || a.concierge}</p>
              <p className="-mt-1.5 max-w-[92%] self-start whitespace-pre-line rounded-[4px_12px_12px_12px] border bg-surface px-3.5 py-2.5 text-[0.95rem] rtl:rounded-[12px_4px_12px_12px]">{(locale === "ar" && greetingAr) || greeting || a.greetingPh}</p>
              {chipList.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {chipList.map((c) => <span key={c} className="rounded-full border border-line-strong bg-surface px-3 py-1.5 text-[0.85rem] text-ink-2">{c}</span>)}
                </div>
              )}
              {!enabled && <p className="text-sm font-medium text-warning">{a.offWarning}</p>}
            </div>
          </section>

          <section className="rounded-xl border bg-surface px-5 pt-4">
            <h2 className="font-semibold">{a.sources}</h2>
            <p className="a-muted text-sm">{a.sourcesHint}</p>
            <ul className="mt-2.5 text-[0.95rem]">
              {([[a.publishedProjects, sources.projects, "/admin/projects"], [a.faqs, sources.faqs, "/admin/knowledge"], [a.notes, sources.notes, "/admin/knowledge"]] as const).map(([label, n, href]) => (
                <li key={label} className="border-t"><Link href={href} className="flex min-h-11 items-center justify-between gap-3 hover:text-brand-ink"><span>{label}</span><span className="font-semibold tabular-nums">{n}</span></Link></li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </form>
  );
}
