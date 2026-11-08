"use client";
import { useState, useTransition } from "react";
import { FONTS, PRESETS, resolveTheme, googleFontsHref, type PresetId, type ThemeConfig, type ThemeTokens } from "@/lib/theme";
import { saveTheme, type ActionResult } from "../actions";
import { FormMessage, PageTitle } from "@/components/admin/ui";
import { ImageField } from "@/components/admin/image-upload";

const COLORS: [keyof ThemeTokens, string][] = [
  ["background", "Background"], ["foreground", "Text"], ["card", "Cards"], ["muted", "Muted surfaces"],
  ["mutedForeground", "Secondary text"], ["border", "Borders"], ["primary", "Brand / buttons"], ["primaryForeground", "Button text"],
];

export function ThemeEditor({ tenantId, initial, name }: { tenantId: string; initial: ThemeConfig; name: string }) {
  const [cfg, setCfg] = useState<ThemeConfig>(initial);
  const [state, setState] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();
  const t = resolveTheme(cfg);
  const fonts = googleFontsHref(t);
  const set = (patch: Partial<ThemeConfig>) => { setCfg({ ...cfg, ...patch }); setState(null); };

  return (
    <div className="space-y-6">
      {fonts && <link rel="stylesheet" href={fonts} />}
      <PageTitle title="Theme" subtitle="Pick a starting style, then fine-tune colors, fonts and logo.">
        <button className="a-btn a-btn-primary" disabled={pending} onClick={() => start(async () => setState(await saveTheme(cfg)))}>
          {pending ? "Saving…" : "Save theme"}
        </button>
      </PageTitle>
      <FormMessage state={state} />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="a-card">
            <h2 className="font-semibold">Site layout</h2>
            <p className="mt-1 text-sm text-slate-500">How your whole site is structured. You can switch any time; your content stays.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {([
                ["lounge", "Lounge", "Sidebar menu, and your AI concierge is the homepage. Story-style About and a contact lounge."],
                ["classic", "Classic", "Top menu and a scrolling homepage built from sections (hero, projects, testimonials…)."],
              ] as const).map(([id, label, desc]) => {
                const on = (cfg.layout ?? "classic") === id;
                return (
                  <button key={id} type="button" onClick={() => set({ layout: id })} aria-pressed={on}
                    className={`flex gap-3 rounded-lg border p-3 text-left transition ${on ? "border-teal-600 ring-1 ring-teal-600" : "hover:border-slate-400"}`}>
                    <LayoutThumb kind={id} />
                    <span><span className="text-sm font-medium">{label}</span><span className="mt-0.5 block text-xs text-slate-500">{desc}</span></span>
                  </button>
                );
              })}
            </div>
          </section>

          {(cfg.layout ?? "classic") === "lounge" && (
            <section className="a-card grid gap-4">
              <h2 className="font-semibold">Lounge</h2>
              <ImageField tenantId={tenantId} label="Your portrait (round avatar above the chat)" value={cfg.portraitUrl ?? ""} onChange={(v) => set({ portraitUrl: v })} />
              <ImageField tenantId={tenantId} label="Backdrop photo (blurred and toned behind the chat and page headers)" value={cfg.backdropUrl ?? ""} onChange={(v) => set({ backdropUrl: v })} />
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="field"><span>Sidebar button label</span><input value={cfg.ctaLabel ?? ""} placeholder="Book a consultation" onChange={(e) => set({ ctaLabel: e.target.value })} /></label>
                <label className="field"><span>Sidebar button link</span><input value={cfg.ctaHref ?? ""} placeholder="/contact" onChange={(e) => set({ ctaHref: e.target.value })} /></label>
              </div>
              <p className="text-xs text-slate-500">Portrait photos work best as a square head-and-shoulders crop. Quick-question chips are set under AI concierge.</p>
            </section>
          )}

          <section className="a-card">
            <h2 className="mb-3 font-semibold">Style preset</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(Object.entries(PRESETS) as [PresetId, (typeof PRESETS)[PresetId]][]).map(([id, p]) => (
                <button key={id} type="button" onClick={() => setCfg({ preset: id, logoUrl: cfg.logoUrl, faviconUrl: cfg.faviconUrl, layout: cfg.layout, portraitUrl: cfg.portraitUrl, backdropUrl: cfg.backdropUrl, ctaLabel: cfg.ctaLabel, ctaHref: cfg.ctaHref })}
                  className={`overflow-hidden rounded-lg border text-left ${(cfg.preset ?? "luxury-gold") === id ? "ring-2 ring-teal-600" : ""}`}>
                  <div className="flex h-14 items-end gap-1 p-2" style={{ background: p.tokens.background }}>
                    <span className="h-6 w-6 rounded-full" style={{ background: p.tokens.primary }} />
                    <span className="text-xs" style={{ color: p.tokens.foreground, fontFamily: p.tokens.headingFont }}>Aa</span>
                  </div>
                  <p className="px-2 py-1.5 text-xs font-medium">{p.label}</p>
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">Choosing a preset resets custom colors and fonts.</p>
          </section>

          <section className="a-card grid gap-4 sm:grid-cols-2">
            <h2 className="font-semibold sm:col-span-2">Colors</h2>
            {COLORS.map(([key, label]) => (
              <label key={key} className="field"><span>{label}</span>
                <div className="flex items-center gap-2">
                  <input type="color" value={t[key]} onChange={(e) => set({ [key]: e.target.value })} className="h-9 w-12 cursor-pointer rounded border" />
                  <input className="a-input" value={t[key]} onChange={(e) => set({ [key]: e.target.value })} />
                </div>
              </label>
            ))}
          </section>

          <section className="a-card grid gap-4 sm:grid-cols-3">
            <h2 className="font-semibold sm:col-span-3">Typography & shape</h2>
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
          </section>

          <section className="a-card grid gap-4">
            <h2 className="font-semibold">Brand assets</h2>
            <ImageField tenantId={tenantId} label="Logo (shown instead of your name)" value={cfg.logoUrl ?? ""} onChange={(v) => set({ logoUrl: v })} />
            <ImageField tenantId={tenantId} label="Favicon" value={cfg.faviconUrl ?? ""} onChange={(v) => set({ faviconUrl: v })} />
          </section>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <p className="mb-2 text-sm font-medium text-slate-600">Preview</p>
          <div className="overflow-hidden border shadow-sm" style={{ background: t.background, color: t.foreground, borderRadius: t.radius, fontFamily: `"${t.bodyFont}"` }}>
            <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: t.border }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {cfg.logoUrl ? <img src={cfg.logoUrl} alt="" className="h-6" /> : <span style={{ fontFamily: `"${t.headingFont}"` }}>{name}</span>}
              <span className="text-[10px] uppercase tracking-widest" style={{ color: t.mutedForeground }}>Projects · About</span>
            </div>
            <div className="p-5">
              <p className="text-[10px] uppercase tracking-[0.28em]" style={{ color: t.primary }}>Investor lounge</p>
              <h3 className="mt-2 text-2xl leading-tight" style={{ fontFamily: `"${t.headingFont}"` }}>Curated real estate for discerning investors</h3>
              <p className="mt-2 text-sm" style={{ color: t.mutedForeground }}>Off-plan and ready opportunities, hand-picked and explained.</p>
              <span className="mt-4 inline-block px-4 py-2 text-sm" style={{ background: t.primary, color: t.primaryForeground, borderRadius: t.radius }}>Explore projects</span>
              <div className="mt-5 border p-3" style={{ background: t.card, borderColor: t.border, borderRadius: t.radius }}>
                <p className="text-[10px] uppercase tracking-widest" style={{ color: t.primary }}>Developer</p>
                <p style={{ fontFamily: `"${t.headingFont}"` }}>Marina Vista Residences</p>
                <p className="text-sm" style={{ color: t.primary }}>From AED 1.45M</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Tiny schematic of each layout so the choice is visual, not just words. */
function LayoutThumb({ kind }: { kind: "lounge" | "classic" }) {
  return (
    <svg viewBox="0 0 64 44" className="h-11 w-16 shrink-0 rounded border border-slate-200 bg-slate-800" aria-hidden>
      {kind === "lounge" ? (
        <>
          <rect x="3" y="3" width="15" height="38" rx="2" fill="#e7dcc6" />
          <circle cx="41" cy="14" r="4" fill="#94a3b8" />
          <rect x="31" y="21" width="20" height="2.5" rx="1" fill="#e2e8f0" />
          <rect x="27" y="33" width="28" height="5" rx="2.5" fill="none" stroke="#94a3b8" />
        </>
      ) : (
        <>
          <rect x="0" y="0" width="64" height="6" fill="#334155" />
          <rect x="0" y="6" width="64" height="18" fill="#475569" />
          <rect x="6" y="14" width="22" height="2.5" rx="1" fill="#e2e8f0" />
          <rect x="6" y="28" width="15" height="11" rx="1" fill="#64748b" />
          <rect x="24.5" y="28" width="15" height="11" rx="1" fill="#64748b" />
          <rect x="43" y="28" width="15" height="11" rx="1" fill="#64748b" />
        </>
      )}
    </svg>
  );
}
