"use client";
import { useState, useTransition } from "react";
import { Check, Crown, Eye } from "lucide-react";
import { ARABIC_FONTS, FONTS, PRESETS, arabicFont, resolveTheme, googleFontsHref, type ArabicFont, type PresetId, type ThemeConfig, type ThemeTokens } from "@/lib/theme";
import { galleryTemplates, templateFor, type Template } from "@/lib/templates";
import { previewTheme, saveTheme, type ActionResult } from "../actions";
import { FormMessage, PageTitle } from "@/components/admin/ui";
import { ImageField } from "@/components/admin/image-upload";
import { TemplateThumb } from "@/components/template-thumb";
import { BiField } from "@/components/admin/bilingual";
import { useAdminT } from "@/components/admin/i18n";

const COLOR_KEYS: (keyof ThemeTokens)[] = ["background", "foreground", "card", "muted", "mutedForeground", "border", "primary", "primaryForeground"];

/** Settings that belong to the agent's brand and survive a template or preset switch. */
const brand = (c: ThemeConfig): ThemeConfig => ({
  logoUrl: c.logoUrl, faviconUrl: c.faviconUrl, portraitUrl: c.portraitUrl, backdropUrl: c.backdropUrl, ctaLabel: c.ctaLabel, ctaLabel_ar: c.ctaLabel_ar, ctaHref: c.ctaHref,
  fontArabic: c.fontArabic,
});

export function ThemeEditor({ tenantId, initial, name, hasDraft, justPublished }: {
  tenantId: string; initial: ThemeConfig; name: string; hasDraft: boolean; justPublished: boolean;
}) {
  const { t: d, locale, arabicOn } = useAdminT();
  const tt = d.theme;
  const COLORS = COLOR_KEYS.map((k) => [k, tt.colors[k as keyof typeof tt.colors]] as [keyof ThemeTokens, string]);
  const [cfg, setCfg] = useState<ThemeConfig>(initial);
  const [state, setState] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();
  const t = resolveTheme(cfg);
  const fonts = googleFontsHref(t, arabicOn ? "ar" : "en", arabicFont(cfg));
  const current = templateFor(cfg.layout);
  const set = (patch: Partial<ThemeConfig>) => { setCfg({ ...cfg, ...patch }); setState(null); };
  const pickTemplate = (tpl: Template) => { setCfg({ ...brand(cfg), layout: tpl.id, preset: tpl.preset }); setState(null); };

  return (
    <div className="space-y-6">
      {fonts && <link rel="stylesheet" href={fonts} />}
      <PageTitle title={tt.title} subtitle={tt.subtitle}>
        <div className="flex flex-wrap gap-2">
          <button className="a-btn a-btn-ghost" disabled={pending} onClick={() => start(async () => { const r = await previewTheme(cfg); if (r && !r.ok) setState(r); })}>
            <Eye size={17} aria-hidden /> {tt.preview}
          </button>
          <button className="a-btn a-btn-primary" disabled={pending} onClick={() => start(async () => setState(await saveTheme(cfg)))}>
            {pending ? d.ui.working : tt.publish}
          </button>
        </div>
      </PageTitle>

      {justPublished && !state && <p role="status" className="rise rounded-lg border border-success-line bg-success-soft px-4 py-3 text-sm font-medium text-success-strong">{tt.justPublished}</p>}
      {hasDraft && !state && <p className="rounded-lg border border-warning-line bg-warning-soft px-4 py-3 text-sm text-warning-strong">{tt.hasDraft}</p>}
      <FormMessage state={state} />

      <section className="a-card" aria-labelledby="tpl-h">
        <h2 id="tpl-h" className="text-[1.05rem] font-semibold">{tt.template}</h2>
        <p className="a-muted mt-0.5 text-sm">{tt.templateHint}</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {galleryTemplates().map((tpl) => {
            const on = current.id === tpl.id;
            return (
              <article key={tpl.id} className={`flex flex-col overflow-hidden rounded-xl border bg-surface transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_-20px_rgb(0_0_0/0.35)] ${on ? "border-brand shadow-[0_0_0_1px_var(--c-brand)]" : ""}`}>
                <div className="relative">
                  <TemplateThumb kind={tpl.id} />
                  <span className="absolute start-3 top-3 flex gap-1.5">
                    {tpl.tier === "premium"
                      ? <span className="inline-flex items-center gap-1.5 a-pill bg-inverse text-[#f5d58a]"><Crown size={13} aria-hidden /> {tt.premium}</span>
                      : <span className="a-pill a-pill-green">{tt.free}</span>}
                    {on && <span className="a-pill bg-brand text-white">{tt.selected}</span>}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <h3 className="text-[1.05rem] font-semibold">{tpl.name}</h3>
                  <ul aria-label={tt.tags} className="flex flex-wrap gap-1.5">
                    {tpl.tags.map((tag) => <li key={tag} className="rounded-full border border-line-strong px-2.5 py-0.5 text-[0.82rem] text-ink-2">{tag}</li>)}
                  </ul>
                  <p className="a-muted text-sm">{tpl.description}</p>
                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
                    {tpl.price && <span className="me-auto font-semibold">{tpl.price}</span>}
                    {on
                      ? <span className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-brand-strong"><Check size={16} aria-hidden /> {tt.inDraft}</span>
                      : <button type="button" className="a-btn a-btn-primary" onClick={() => pickTemplate(tpl)}>{tt.useTemplate}</button>}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        <p className="a-muted mt-4 text-sm">{tt.switchHint}</p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <section className="a-card">
            <h2 className="text-[1.05rem] font-semibold">{tt.colours}</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {(Object.entries(PRESETS) as [PresetId, (typeof PRESETS)[PresetId]][]).map(([id, p]) => {
                const on = (cfg.preset ?? "luxury-gold") === id;
                return (
                  <button key={id} type="button" aria-pressed={on} onClick={() => { setCfg({ ...brand(cfg), layout: cfg.layout, preset: id }); setState(null); }}
                    className={`overflow-hidden rounded-lg border text-start transition-[border-color,box-shadow] duration-200 ${on ? "border-brand shadow-[0_0_0_1px_var(--c-brand)]" : "hover:border-line-bold"}`}>
                    <span className="flex h-14 items-end gap-1.5 p-2.5" style={{ background: p.tokens.background }}>
                      <span className="h-3 w-7 rounded" style={{ background: p.tokens.primary }} />
                      <span className="h-3 w-11 rounded" style={{ background: p.tokens.muted }} />
                    </span>
                    <span className="block px-3 py-2 text-sm font-medium">{p.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="a-muted mt-3 text-sm">{tt.coloursHint}</p>
          </section>

          {current.id === "lounge" && (
            <section className="a-card grid gap-4">
              <h2 className="text-[1.05rem] font-semibold">{tt.loungePhotos}</h2>
              <ImageField tenantId={tenantId} label={tt.portrait} value={cfg.portraitUrl ?? ""} onChange={(v) => set({ portraitUrl: v })} />
              <ImageField tenantId={tenantId} label={tt.backdrop} value={cfg.backdropUrl ?? ""} onChange={(v) => set({ backdropUrl: v })} />
              <p className="a-muted text-sm">{tt.loungeHint}</p>
            </section>
          )}

          <section className="a-card grid gap-4">
            <h2 className="text-[1.05rem] font-semibold">{tt.brand}</h2>
            <ImageField tenantId={tenantId} label={tt.logo} value={cfg.logoUrl ?? ""} onChange={(v) => set({ logoUrl: v })} />
            <ImageField tenantId={tenantId} label={tt.favicon} value={cfg.faviconUrl ?? ""} onChange={(v) => set({ faviconUrl: v })} />
            <BiField label={tt.ctaLabel} placeholder="Book a consultation" value={cfg.ctaLabel ?? ""} valueAr={cfg.ctaLabel_ar ?? ""}
              onChange={(v) => set({ ctaLabel: v })} onChangeAr={(v) => set({ ctaLabel_ar: v })} />
            <label className="field"><span>{tt.ctaHref}</span><input dir="ltr" value={cfg.ctaHref ?? ""} placeholder="/contact" onChange={(e) => set({ ctaHref: e.target.value })} /></label>
            {arabicOn && (
              <label className="field"><span>{tt.arabicFont}</span>
                <select value={arabicFont(cfg)} onChange={(e) => set({ fontArabic: e.target.value as ArabicFont })} style={{ fontFamily: `"${arabicFont(cfg)}"` }}>
                  {(Object.keys(ARABIC_FONTS) as ArabicFont[]).map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                <small>{tt.arabicFontHint} <span lang="ar" dir="rtl" style={{ fontFamily: `"${arabicFont(cfg)}"` }}>استثمر بأرقام واضحة</span></small>
              </label>
            )}
          </section>

          <details className="a-card group">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-[1.05rem] font-semibold">
              {tt.advanced}
              <span aria-hidden className="text-brand-ink transition-transform duration-300 group-open:rotate-45">+</span>
            </summary>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {COLORS.map(([key, label]) => (
                <label key={key} className="field"><span>{label}</span>
                  <div className="flex items-center gap-2">
                    <input type="color" value={t[key]} onChange={(e) => set({ [key]: e.target.value })} className="h-11 w-12 shrink-0 cursor-pointer rounded-lg border" aria-label={tt.colourPicker(label)} />
                    <input className="a-input" dir="ltr" value={t[key]} onChange={(e) => set({ [key]: e.target.value })} />
                  </div>
                </label>
              ))}
              <label className="field"><span>{tt.headingFont}</span>
                <select value={t.headingFont} onChange={(e) => set({ headingFont: e.target.value })}>{FONTS.map((f) => <option key={f}>{f}</option>)}</select>
              </label>
              <label className="field"><span>{tt.bodyFont}</span>
                <select value={t.bodyFont} onChange={(e) => set({ bodyFont: e.target.value })}>{FONTS.map((f) => <option key={f}>{f}</option>)}</select>
              </label>
              <label className="field"><span>{tt.roundness}</span>
                <select value={t.radius} onChange={(e) => set({ radius: e.target.value })}>
                  {[["0rem", tt.radius.square], ["0.125rem", tt.radius.subtle], ["0.5rem", tt.radius.rounded], ["0.75rem", tt.radius.soft], ["1.25rem", tt.radius.pill]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </label>
            </div>
          </details>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <p className="mb-2 text-sm font-semibold">{tt.quickLook} <span className="a-muted font-normal">{tt.quickLookHint}</span></p>
          <div className="overflow-hidden border shadow-[0_18px_40px_-28px_rgb(15_23_40/0.45)] transition-colors duration-300" style={{ background: t.background, color: t.foreground, borderRadius: t.radius, fontFamily: `"${t.bodyFont}", "${arabicFont(cfg)}"` }} dir={locale === "ar" ? "rtl" : "ltr"}>
            <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: t.border, background: t.card }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {cfg.logoUrl ? <img src={cfg.logoUrl} alt="" className="h-6" /> : <span className="font-bold" style={{ fontFamily: `"${t.headingFont}"` }}>{name}</span>}
              <span className="px-2.5 py-1 text-xs font-semibold" style={{ background: t.primary, color: t.primaryForeground, borderRadius: t.radius }}>{(locale === "ar" && cfg.ctaLabel_ar) || cfg.ctaLabel || tt.ctaPh}</span>
            </div>
            <div className="p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: t.primary }}>{tt.sampleEyebrow}</p>
              <h3 className="mt-2 text-xl font-bold leading-tight" style={{ fontFamily: `"${t.headingFont}", "${arabicFont(cfg)}"` }}>{tt.sampleTitle}</h3>
              <div className="mt-4 border p-3" style={{ background: t.card, borderColor: t.border, borderRadius: t.radius }}>
                <p className="font-bold" style={{ fontFamily: `"${t.headingFont}"` }}>Marina Vista Residences</p>
                <p className="text-sm" style={{ color: t.mutedForeground }}>{tt.sampleMeta}</p>
                <p className="mt-1 text-sm font-semibold" style={{ color: t.primary }}>{tt.sampleFrom}</p>
              </div>
            </div>
          </div>
          <p className="a-muted mt-2 text-sm">{tt.fullPicture1}<strong>{tt.preview}</strong>{tt.fullPicture2}</p>
        </div>
      </div>
    </div>
  );
}
