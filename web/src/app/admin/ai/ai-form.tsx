"use client";
import { useActionState, useState } from "react";
import { saveAi } from "../actions";
import { FormMessage, PageTitle, SubmitButton } from "@/components/admin/ui";
import type { AiConfig } from "@/lib/ai/config";

type P = { id: string; label: string; note: string; defaultModel: string; configured: boolean };

export function AiForm({ config, providers, tenantName }: { config: AiConfig; providers: P[]; tenantName: string }) {
  const [state, action] = useActionState(saveAi, null);
  const [provider, setProvider] = useState<string>(config.provider ?? "auto");
  const current = providers.find((p) => p.id === provider);
  return (
    <form action={action} className="space-y-6">
      <PageTitle title="AI concierge" subtitle="Your 24/7 assistant answers from your projects, FAQs and knowledge notes, and captures leads.">
        <SubmitButton>Save</SubmitButton>
      </PageTitle>
      <FormMessage state={state} />

      <section className="a-card grid gap-4 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" name="enabled" defaultChecked={config.enabled !== false} /> Show the chat on my site</label>
        <label className="field"><span>Assistant name</span><input name="assistantName" defaultValue={config.assistantName ?? `${tenantName} Concierge`} /></label>
        <label className="field"><span>Creativity</span>
          <select name="temperature" defaultValue={String(config.temperature ?? 0.4)}>
            <option value="0.2">Precise</option><option value="0.4">Balanced</option><option value="0.7">Conversational</option>
          </select>
        </label>
        <label className="field sm:col-span-2"><span>Greeting</span><textarea name="greeting" rows={2} defaultValue={config.greeting ?? ""} placeholder="Welcome! How can I help you find the right property?" /></label>
        <label className="field sm:col-span-2"><span>Quick-question chips</span>
          <textarea name="suggestions" rows={4} defaultValue={(config.suggestions ?? []).join("\n")} placeholder={"Dubai market overview\nBest areas to invest\nBuying costs & fees"} />
          <small>One per line, up to 8. Shown under the chat so visitors can start with a tap.</small>
        </label>
        <label className="field sm:col-span-2"><span>Instructions for the assistant</span>
          <textarea name="instructions" rows={6} defaultValue={config.instructions ?? ""} placeholder="Tone of voice, what to emphasise, what never to say, languages, when to hand over to a human…" />
          <small>Facts about projects come from your Projects; put general business info in FAQ & knowledge.</small>
        </label>
      </section>

      <section className="a-card space-y-4">
        <h2 className="font-semibold">AI model</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 has-[:checked]:border-teal-600 has-[:checked]:bg-teal-50">
            <input type="radio" name="provider" value="auto" checked={provider === "auto"} onChange={() => setProvider("auto")} className="mt-1" />
            <span><span className="text-sm font-medium">Automatic</span><span className="block text-xs text-slate-500">Cheapest available model, with automatic fallback.</span></span>
          </label>
          {providers.map((p) => (
            <label key={p.id} className={`flex items-start gap-3 rounded-lg border p-3 has-[:checked]:border-teal-600 has-[:checked]:bg-teal-50 ${p.configured ? "cursor-pointer" : "opacity-50"}`}>
              <input type="radio" name="provider" value={p.id} disabled={!p.configured} checked={provider === p.id} onChange={() => setProvider(p.id)} className="mt-1" />
              <span><span className="text-sm font-medium">{p.label}</span>
                <span className="block text-xs text-slate-500">{p.note}{!p.configured && " · not configured on server"}</span></span>
            </label>
          ))}
        </div>
        {provider !== "auto" && current && (
          <label className="field"><span>Model ID (optional)</span><input name="model" defaultValue={config.provider === provider ? config.model : ""} placeholder={current.defaultModel} /></label>
        )}
        <p className="text-xs text-slate-500">If the chosen model is rate-limited or down, the concierge automatically falls back to the next configured provider.</p>
      </section>
    </form>
  );
}
