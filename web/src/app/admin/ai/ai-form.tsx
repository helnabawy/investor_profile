"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { ChevronDown } from "lucide-react";
import { saveAi } from "../actions";
import { FormMessage, PageTitle, SubmitButton } from "@/components/admin/ui";
import type { AiConfig } from "@/lib/ai/config";

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
  const [provider, setProvider] = useState<string>(config.provider ?? "auto");
  // Live copy of what the greeting preview shows.
  const [name, setName] = useState(config.assistantName ?? `${tenantName} Concierge`);
  const [greeting, setGreeting] = useState(config.greeting ?? "");
  const [chips, setChips] = useState((config.suggestions ?? []).join("\n"));
  const [enabled, setEnabled] = useState(config.enabled !== false);
  const current = providers.find((p) => p.id === provider);
  const chipList = chips.split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 8);
  const providerLabel = provider === "auto" ? "Automatic, with fallback" : current?.label ?? provider;

  return (
    <form action={action}>
      <PageTitle title="AI concierge" subtitle="Your 24/7 assistant answers from your projects, FAQs and knowledge notes, and captures leads.">
        <div className="flex items-center gap-3"><FormMessage state={state} /><SubmitButton>Save changes</SubmitButton></div>
      </PageTitle>

      <div className="flex flex-wrap items-start gap-6">
        <div className="flex min-w-0 flex-[1.4_1_440px] flex-col gap-6">
          <section className="a-card !py-4">
            <label className="flex min-h-12 cursor-pointer items-center justify-between gap-5">
              <span><span className="block font-semibold">{enabled ? "Concierge is on" : "Concierge is off"}</span><span className="a-muted text-sm">Buyers see the question box and the chat on every page.</span></span>
              <input type="checkbox" name="enabled" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="h-[22px] w-[22px] shrink-0" />
            </label>
          </section>

          <Card title="How it greets buyers">
            <label className="field"><span>Assistant name</span><input name="assistantName" value={name} onChange={(e) => setName(e.target.value)} className="max-w-[360px]" /></label>
            <label className="field"><span>Greeting</span><textarea name="greeting" rows={3} value={greeting} onChange={(e) => setGreeting(e.target.value)} placeholder="Welcome! How can I help you find the right property?" /></label>
            <label className="field"><span>Quick questions</span>
              <textarea name="suggestions" rows={6} value={chips} onChange={(e) => setChips(e.target.value)} placeholder={"Dubai market overview\nBest areas to invest\nBuying costs & fees"} />
              <small>One per line, up to 8. Shown under the chat so visitors can start with a tap. You have {chipList.length}.</small>
            </label>
          </Card>

          <Card title="How it should behave" hint={<>Facts about projects come from your Projects. Put general business information in <Link href="/admin/knowledge" className="a-link">FAQ &amp; knowledge</Link>.</>}>
            <label className="field"><span>Instructions for the assistant</span>
              <textarea name="instructions" rows={7} defaultValue={config.instructions ?? ""} placeholder="Tone of voice, what to emphasise, what never to say, languages, when to hand over to a human…" />
            </label>
            <label className="field"><span>Creativity</span>
              <select name="temperature" defaultValue={String(config.temperature ?? 0.4)} className="max-w-[360px]">
                <option value="0.2">Precise: stays close to your wording</option><option value="0.4">Balanced</option><option value="0.7">Conversational</option>
              </select>
            </label>
          </Card>

          <details className="a-card group !py-0">
            <summary className="flex min-h-[64px] cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
              <span><span className="block font-semibold">Model</span><span className="a-muted text-sm">{providerLabel}</span></span>
              <ChevronDown size={20} className="text-[#3d4658] transition-transform duration-300 group-open:rotate-180" aria-hidden />
            </summary>
            <div className="flex flex-col gap-4 pb-6">
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors has-[:checked]:border-[#1e46b8] has-[:checked]:bg-[#f1f5fe]">
                  <input type="radio" name="provider" value="auto" checked={provider === "auto"} onChange={() => setProvider("auto")} className="mt-1" />
                  <span><span className="text-sm font-medium">Automatic</span><span className="a-muted block text-[0.82rem]">Cheapest available model, with automatic fallback.</span></span>
                </label>
                {providers.map((p) => (
                  <label key={p.id} className={`flex items-start gap-3 rounded-lg border p-3 transition-colors has-[:checked]:border-[#1e46b8] has-[:checked]:bg-[#f1f5fe] ${p.configured ? "cursor-pointer" : "opacity-55"}`}>
                    <input type="radio" name="provider" value={p.id} disabled={!p.configured} checked={provider === p.id} onChange={() => setProvider(p.id)} className="mt-1" />
                    <span><span className="text-sm font-medium">{p.label}</span><span className="a-muted block text-[0.82rem]">{p.note}{!p.configured && " · not configured on server"}</span></span>
                  </label>
                ))}
              </div>
              {provider !== "auto" && current && (
                <label className="field"><span>Model ID (optional)</span><input name="model" defaultValue={config.provider === provider ? config.model : ""} placeholder={current.defaultModel} /></label>
              )}
              <p className="a-muted text-[0.82rem]">If the chosen model is rate-limited or down, the concierge falls back to the next configured provider.</p>
            </div>
          </details>
        </div>

        <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-6 lg:sticky lg:top-6">
          <section aria-label="Greeting preview" className="overflow-hidden rounded-xl border bg-white">
            <div className="border-b px-5 py-4"><h2 className="font-semibold">What buyers see first</h2><p className="a-muted text-sm">Updates as you type.</p></div>
            <div className={`flex flex-col gap-3 bg-[#fafbfc] p-5 transition-opacity ${enabled ? "" : "opacity-50"}`}>
              <p className="text-[0.82rem] font-medium text-[#5a6475]">{name || "Concierge"}</p>
              <p className="-mt-1.5 max-w-[92%] self-start whitespace-pre-line rounded-[4px_12px_12px_12px] border bg-white px-3.5 py-2.5 text-[0.95rem]">{greeting || "Welcome! How can I help you find the right property?"}</p>
              {chipList.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {chipList.map((c) => <span key={c} className="rounded-full border border-[#c9cfda] bg-white px-3 py-1.5 text-[0.85rem] text-[#3d4658]">{c}</span>)}
                </div>
              )}
              {!enabled && <p className="text-sm font-medium text-[#6b4200]">The concierge is off, so buyers won&apos;t see this.</p>}
            </div>
          </section>

          <section className="rounded-xl border bg-white px-5 pt-4">
            <h2 className="font-semibold">What it can answer from</h2>
            <p className="a-muted text-sm">It never answers from anything else.</p>
            <ul className="mt-2.5 text-[0.95rem]">
              {([["Published projects", sources.projects, "/admin/projects"], ["FAQs", sources.faqs, "/admin/knowledge"], ["Knowledge notes", sources.notes, "/admin/knowledge"]] as const).map(([label, n, href]) => (
                <li key={label} className="border-t"><Link href={href} className="flex min-h-11 items-center justify-between gap-3 hover:text-[#1e46b8]"><span>{label}</span><span className="font-semibold tabular-nums">{n}</span></Link></li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </form>
  );
}
