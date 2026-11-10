"use client";
import { useState, useTransition } from "react";
import { Check, Crown, Eye } from "lucide-react";
import { FONTS, PRESETS, resolveTheme, googleFontsHref, type PresetId, type ThemeConfig, type ThemeTokens } from "@/lib/theme";
import { galleryTemplates, templateFor, type Template } from "@/lib/templates";
import { previewTheme, saveTheme, type ActionResult } from "../actions";
import { FormMessage, PageTitle } from "@/components/admin/ui";
import { ImageField } from "@/components/admin/image-upload";
import { TemplateThumb } from "@/components/template-thumb";

const COLORS: [keyof ThemeTokens, string][] = [
  ["background", "Background"], ["foreground", "Text"], ["card", "Cards"], ["muted", "Muted surfaces"],
  ["mutedForeground", "Secondary text"], ["border", "Borders"], ["primary", "Brand / buttons"], ["primaryForeground", "Button text"],
];

/** Settings that belong to the agent's brand and survive a template or preset switch. */
const brand = (c: ThemeConfig): ThemeConfig => ({
  logoUrl: c.logoUrl, faviconUrl: c.faviconUrl, portraitUrl: c.portraitUrl, backdropUrl: c.backdropUrl, ctaLabel: c.ctaLabel, ctaHref: c.ctaHref,
});

export function ThemeEditor({ tenantId, initial, name, hasDraft, justPublished }: {
  tenantId: string; initial: ThemeConfig; name: string; hasDraft: boolean; justPublished: boolean;
}) {
  const [cfg, setCfg] = useState<ThemeConfig>(initial);
  const [state, setState] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();
  const t = resolveTheme(cfg);
  const fonts = googleFontsHref(t);
  const current = templateFor(cfg.layout);
  const set = (patch: Partial<ThemeConfig>) => { setCfg({ ...cfg, ...patch }); setState(null); };
  const pickTemplate = (tpl: Template) => { setCfg({ ...brand(cfg), layout: tpl.id, preset: tpl.preset }); setState(null); };

  return (
    <div className="space-y-6">
      {fonts && <link rel="stylesheet" href={fonts} />}
      <PageTitle title="Template & theme" subtitle="Choose how your whole site looks. Preview it on your real site before buyers see anything.">
        <div className="flex flex-wrap gap-2">
          <button className="a-btn a-btn-ghost" disabled={pending} onClick={() => start(async () => { const r = await previewTheme(cfg); if (r && !r.ok) setState(r); })}>
            <Eye size={17} aria-hidden /> Preview on my site
          </button>
          <button className="a-btn a-btn-primary" disabled={pending} onClick={() => start(async () => setState(await saveTheme(cfg)))}>
            {pending ? "Working…" : "Publish now"}
          </button>
        </div>
      </PageTitle>

      {justPublished && !state && <p role="status" className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-900">Published. Buyers now see your new look.</p>}
      {hasDraft && !state && <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">You have unpublished changes. They are loaded below; buyers still see your live site.</p>}
      <FormMessage state={state} />

      <section className="a-card" aria-labelledby="tpl-h">
        <h2 id="tpl-h" className="text-lg font-bold">Template</h2>
        <p className="mt-1 text-sm text-slate-600">A template sets the layout of every page. Your projects, text and leads stay the same when you switch.</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {galleryTemplates().map((tpl) => {
            const on = current.id === tpl.id;
            return (
              <article key={tpl.id} className={`flex flex-col overflow-hidden rounded-2xl border bg-white transition-shadow hover:shadow-[0_16px_30px_-20px_rgb(0_0_0/0.35)] ${on ? "border-2 border-[#1e46b8]" : ""}`}>
                <div className="relative">
                  <TemplateThumb kind={tpl.id} />
                  <span className="absolute left-3 top-3 flex gap-1.5">
                    {tpl.tier === "premium"
                      ? <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-amber-200"><Crown size={13} aria-hidden /> Premium</span>
                      : <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-800">Free</span>}
                    {on && <span className="rounded-full bg-[#1e46b8] px-3 py-1 text-xs font-semibold text-white">Selected</span>}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <h3 className="text-lg font-bold">{tpl.name}</h3>
                  <ul aria-label="Tags" className="flex flex-wrap gap-1.5">
                    {tpl.tags.map((tag) => <li key={tag} className="rounded-md border border-slate-300 px-2.5 py-0.5 text-xs font-medium text-slate-700">{tag}</li>)}
                  </ul>
                  <p className="text-sm text-slate-600">{tpl.description}</p>
                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
                    {tpl.price && <span className="mr-auto font-bold">{tpl.price}</span>}
                    {on
                      ? <span className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-blue-800"><Check size={16} aria-hidden /> In this draft</span>
                      : <button type="button" className="a-btn a-btn-primary" onClick={() => pickTemplate(tpl)}>Use this template</button>}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        <p className="mt-4 text-sm text-slate-600">Switching template also applies its matching colours. You can change them below.</p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <section className="a-card">
            <h2 className="text-lg font-bold">Colours</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {(Object.entries(PRESETS) as [PresetId, (typeof PRESETS)[PresetId]][]).map(([id, p]) => {
                const on = (cfg.preset ?? "luxury-gold") === id;
                return (
                  <button key={id} type="button" aria-pressed={on} onClick={() => { setCfg({ ...brand(cfg), layout: cfg.layout, preset: id }); setState(null); }}
                    className={`overflow-hidden rounded-xl border text-left ${on ? "border-2 border-[#1e46b8]" : "hover:border-slate-400"}`}>
                    <span className="flex h-14 items-end gap-1.5 p-2.5" style={{ background: p.tokens.background }}>
                      <span className="h-3 w-7 rounded" style={{ background: p.tokens.primary }} />
                      <span className="h-3 w-11 rounded" style={{ background: p.tokens.muted }} />
                    </span>
                    <span className="block px-3 py-2 text-sm font-semibold">{p.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-sm text-slate-600">Choosing colours resets any custom colours and fonts below.</p>
          </section>

          {current.id === "lounge" && (
            <section className="a-card grid gap-4">
              <h2 className="text-lg font-bold">Lounge photos</h2>
              <ImageField tenantId={tenantId} label="Your portrait (round avatar above the chat)" value={cfg.portraitUrl ?? ""} onChange={(v) => set({ portraitUrl: v })} />
              <ImageField tenantId={tenantId} label="Backdrop photo (blurred and toned behind the chat and page headers)" value={cfg.backdropUrl ?? ""} onChange={(v) => set({ backdropUrl: v })} />
              <p className="text-sm text-slate-600">Portraits work best as a square head-and-shoulders crop. Quick-question buttons are set under AI concierge.</p>
            </section>
          )}

          <section className="a-card grid gap-4">
            <h2 className="text-lg font-bold">Brand</h2>
            <ImageField tenantId={tenantId} label="Logo (shown instead of your name)" value={cfg.logoUrl ?? ""} onChange={(v) => set({ logoUrl: v })} />
            <ImageField tenantId={tenantId} label="Favicon" value={cfg.faviconUrl ?? ""} onChange={(v) => set({ faviconUrl: v })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="field"><span>Main button label</span><input value={cfg.ctaLabel ?? ""} placeholder="Book a consultation" onChange={(e) => set({ ctaLabel: e.target.value })} /></label>
              <label className="field"><span>Main button link</span><input value={cfg.ctaHref ?? ""} placeholder="/contact" onChange={(e) => set({ ctaHref: e.target.value })} /></label>
            </div>
          </section>

          <details className="a-card group">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-lg font-bold">
              Advanced: custom colours and fonts
              <span aria-hidden className="text-blue-700 transition group-open:rotate-45">+</span>
            </summary>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {COLORS.map(([key, label]) => (
                <label key={key} className="field"><span>{label}</span>
                  <div className="flex items-center gap-2">
                    <input type="color" value={t[key]} onChange={(e) => set({ [key]: e.target.value })} className="h-11 w-12 cursor-pointer rounded border" aria-label={`${label} colour picker`} />
                    <input className="a-input" value={t[key]} onChange={(e) => set({ [key]: e.target.value })} />
                  </div>
                </label>
              ))}
              <label className="field"><span>Heading font</span>
                <select value={t.headingFont} onChange={(e) => set({ headingFont: e.target.value })}>{FONTS.map((f) => <option key={f}>{f}</option>)}</select>
              </label>
              <label className="field"><span>Body font</span>
                <select value={t.bodyFont} onChange={(e) => set({ bodyFont: e.target.value })}>{FONTS.map((f) => <option key={f}>{f}</option>)}</select>
              </label>
              <label className="field"><span>Corner roundness</span>
                <select value={t.radius} onChange={(e) => set({ radius: e.target.value })}>
                  {[["0rem", "Square"], ["0.125rem", "Subtle"], ["0.5rem", "Rounded"], ["0.75rem", "Soft"], ["1.25rem", "Pill-ish"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </label>
            </div>
          </details>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <p className="mb-2 text-sm font-semibold text-slate-700">Quick look</p>
          <div className="overflow-hidden border shadow-sm" style={{ background: t.background, color: t.foreground, borderRadius: t.radius, fontFamily: `"${t.bodyFont}"` }}>
            <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: t.border, background: t.card }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {cfg.logoUrl ? <img src={cfg.logoUrl} alt="" className="h-6" /> : <span className="font-bold" style={{ fontFamily: `"${t.headingFont}"` }}>{name}</span>}
              <span className="px-2.5 py-1 text-xs font-semibold" style={{ background: t.primary, color: t.primaryForeground, borderRadius: t.radius }}>{cfg.ctaLabel || "Book a consultation"}</span>
            </div>
            <div className="p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: t.primary }}>Real estate advisory</p>
              <h3 className="mt-2 text-xl font-bold leading-tight" style={{ fontFamily: `"${t.headingFont}"` }}>Invest with clear numbers and one advisor you can reach</h3>
              <div className="mt-4 border p-3" style={{ background: t.card, borderColor: t.border, borderRadius: t.radius }}>
                <p className="font-bold" style={{ fontFamily: `"${t.headingFont}"` }}>Marina Vista Residences</p>
                <p className="text-sm" style={{ color: t.mutedForeground }}>Dubai Marina · Off-plan</p>
                <p className="mt-1 text-sm font-semibold" style={{ color: t.primary }}>From AED 1.45M</p>
              </div>
            </div>
          </div>
          <p className="mt-2 text-sm text-slate-600">For the full picture, use <strong>Preview on my site</strong>.</p>
        </div>
      </div>
    </div>
  );
}
