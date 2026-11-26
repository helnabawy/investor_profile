"use client";
import { useActionState, useState } from "react";
import { saveSite } from "../actions";
import { FormMessage, PageTitle, SubmitButton, UpgradeNote } from "@/components/admin/ui";
import type { NavItem, Tenant } from "@/lib/types";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { BiInput, TranslateButton } from "@/components/admin/bilingual";
import { AdminLocaleProvider, useAdminT } from "@/components/admin/i18n";
import { LOCALE_NAMES } from "@/lib/i18n/locales";

/** A settings group: what it is on the left, its fields on the right; stacks on narrow screens. */
function Group({ title, hint, children, first }: { title: string; hint: string; children: React.ReactNode; first?: boolean }) {
  return (
    <section className={`flex flex-wrap gap-x-12 gap-y-4 py-8 ${first ? "" : "border-t"}`}>
      <div className="flex min-w-0 flex-[1_1_220px] flex-col gap-1"><h2 className="text-[1.05rem] font-semibold">{title}</h2><p className="a-muted text-sm">{hint}</p></div>
      <div className="flex min-w-0 flex-[2.4_1_420px] flex-col gap-4">{children}</div>
    </section>
  );
}
const F = "field min-w-0 flex-[1_1_240px]";

export function SettingsForm({ tenant, multi, rootDomain, planName, customDomains, cnameTarget }: { tenant: Tenant; multi: boolean; rootDomain: string; planName: string; customDomains: boolean; cnameTarget: string }) {
  const [state, action] = useActionState(saveSite, null);
  const { t, locale } = useAdminT();
  const st = t.settings;
  const [nav, setNav] = useState<NavItem[]>(tenant.nav ?? []);
  const [defaultLocale, setDefaultLocale] = useState(tenant.default_locale ?? "en");
  const [both, setBoth] = useState((tenant.locales ?? ["en", "ar"]).length > 1);
  // Arabic boxes follow this form's own switch, so they appear as soon as Arabic is turned on.
  const arabicOn = both || defaultLocale === "ar";
  const c = tenant.contact ?? {};
  const move = (i: number, d: number) => setNav((n) => { const a = [...n]; [a[i], a[i + d]] = [a[i + d], a[i]]; return a; });

  return (
    <AdminLocaleProvider locale={locale} siteLocales={arabicOn ? ["en", "ar"] : ["en"]}>
    <form action={action} className="max-w-[1000px]">
      <PageTitle title={st.title} subtitle={st.subtitle}>
        <div className="flex flex-wrap items-center gap-3"><FormMessage state={state} />{arabicOn && <TranslateButton />}<SubmitButton>{t.ui.saveChanges}</SubmitButton></div>
      </PageTitle>
      <input type="hidden" name="nav" value={JSON.stringify(nav)} />

      <Group first title={st.business} hint={st.businessHint}>
        <BiInput name="name" label={st.name} required defaultValue={tenant.name} defaultValueAr={tenant.name_ar} />
        <BiInput name="tagline" label={st.tagline} defaultValue={tenant.tagline} defaultValueAr={tenant.tagline_ar} />
        <label className="flex cursor-pointer items-start gap-3"><input type="checkbox" name="published" defaultChecked={tenant.published} className="mt-0.5 h-5 w-5" /><span><span className="font-medium">{st.published}</span><span className="a-muted block text-sm">{st.publishedHint}</span></span></label>
      </Group>

      <Group title={st.languages} hint={st.languagesHint}>
        <fieldset className="field">
          <legend className="mb-1.5 font-medium">{st.defaultLanguage}</legend>
          <div className="flex flex-wrap gap-2">
            {(["en", "ar"] as const).map((l) => (
              <label key={l} lang={l} className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg border px-4 has-[:checked]:border-brand has-[:checked]:bg-brand-tint">
                <input type="radio" name="default_locale" value={l} checked={defaultLocale === l} onChange={() => setDefaultLocale(l)} />{LOCALE_NAMES[l]}
              </label>
            ))}
          </div>
          <small>{st.defaultLanguageHint}</small>
        </fieldset>
        <label className="flex cursor-pointer items-start gap-3"><input type="checkbox" name="both_locales" checked={both} onChange={(e) => setBoth(e.target.checked)} className="mt-0.5 h-5 w-5" /><span><span className="font-medium">{st.bothLanguages}</span><span className="a-muted block text-sm">{st.bothLanguagesHint}</span></span></label>
      </Group>

      <Group title={st.contact} hint={st.contactHint}>
        <div className="flex flex-wrap gap-4">
          <label className="field basis-full"><span>{st.email}</span><input name="email" type="email" dir="ltr" autoComplete="email" defaultValue={c.email} /><small>{st.emailHint}</small></label>
          <label className={F}><span>{st.phone}</span><input name="phone" type="tel" dir="ltr" defaultValue={c.phone} /></label>
          <label className={F}><span>{st.whatsapp}</span><input name="whatsapp" dir="ltr" inputMode="numeric" defaultValue={c.whatsapp} placeholder="9715xxxxxxxx" /><small>{st.whatsappHint}</small></label>
        </div>
        <BiInput name="hours" label={st.hours} defaultValue={c.hours} defaultValueAr={c.hours_ar} />
        <BiInput name="address" label={st.address} defaultValue={c.address} defaultValueAr={c.address_ar} />
      </Group>

      <Group title={st.nav} hint={st.navHint}>
        {nav.length > 0 && (
          <div aria-hidden className="-mb-2 flex gap-2.5 pe-[146px] text-[0.85rem] font-medium text-quiet"><span className="flex-1">{st.label}</span>{arabicOn && <span className="flex-1">{st.label} · {t.bi.arabic}</span>}<span className="flex-[1.4]">{st.link}</span></div>
        )}
        {nav.map((n, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <input className="a-input min-w-0 flex-1" dir="ltr" name={`nav${i}`} aria-label={st.linkLabel(i + 1)} value={n.label} placeholder={st.label} onChange={(e) => setNav(nav.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
            {arabicOn && <input className="a-input min-w-0 flex-1" dir="rtl" lang="ar" name={`nav${i}_ar`} aria-label={st.linkLabelAr(i + 1)} value={n.label_ar ?? ""} placeholder={n.label || st.label} onChange={(e) => setNav(nav.map((x, j) => (j === i ? { ...x, label_ar: e.target.value } : x)))} />}
            <input className="a-input min-w-0 flex-[1.4]" dir="ltr" aria-label={st.linkAddress(i + 1)} value={n.href} placeholder="/projects" onChange={(e) => setNav(nav.map((x, j) => (j === i ? { ...x, href: e.target.value } : x)))} />
            <button type="button" className="a-btn a-btn-ghost !w-11 !px-0" disabled={i === 0} onClick={() => move(i, -1)} aria-label={t.ui.moveUp}><ArrowUp size={16} aria-hidden /></button>
            <button type="button" className="a-btn a-btn-ghost !w-11 !px-0" disabled={i === nav.length - 1} onClick={() => move(i, 1)} aria-label={t.ui.moveDown}><ArrowDown size={16} aria-hidden /></button>
            <button type="button" className="a-btn a-btn-danger !w-11 !px-0" onClick={() => setNav(nav.filter((_, j) => j !== i))} aria-label={st.removeLink}><X size={16} aria-hidden /></button>
          </div>
        ))}
        <button type="button" className="a-btn a-btn-ghost self-start border-dashed" onClick={() => setNav([...nav, { label: "", href: "/" }])}><Plus size={16} aria-hidden /> {st.addLink}</button>
      </Group>

      {multi ? (
        <Group title={st.domains} hint={st.domainsHint}>
          <div className="overflow-hidden rounded-xl border bg-surface">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3.5">
              <span className="min-w-0"><span className="block font-medium [overflow-wrap:anywhere]">{tenant.slug}.{rootDomain}</span><span className="a-muted text-sm">{st.freeAddress}</span></span>
              <span className={`a-pill ${tenant.published === false ? "a-pill-amber" : "a-pill-green"}`}>{tenant.published === false ? t.ui.notPublished : t.ui.live}</span>
            </div>
            {customDomains && tenant.domains.map((d) => (
              <div key={d} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t px-4 py-3.5">
                <span className="min-w-0"><span className="block font-medium [overflow-wrap:anywhere]">{d}</span><span className="a-muted text-sm">{st.customDomain}</span></span>
              </div>
            ))}
          </div>
          {!customDomains && <UpgradeNote>{st.domainUpgrade(planName)}</UpgradeNote>}
          {customDomains && (
            <>
              <label className="field"><span>{st.customDomains}</span>
                <input name="domains" dir="ltr" defaultValue={tenant.domains.join(", ")} placeholder="www.youragency.com" />
                <small>{st.commaHint}</small>
              </label>
              <div className="flex flex-col gap-2.5 rounded-lg bg-wash px-4 py-3.5">
                <p className="text-sm">{st.dnsHint}</p>
                <dl className="flex flex-wrap gap-x-9 gap-y-2.5 text-sm">
                  <div><dt className="a-muted text-[0.8rem]">{st.type}</dt><dd className="font-mono">CNAME</dd></div>
                  <div className="min-w-0"><dt className="a-muted text-[0.8rem]">{st.pointsTo}</dt><dd className="font-mono [overflow-wrap:anywhere]">{cnameTarget}</dd></div>
                </dl>
              </div>
            </>
          )}
        </Group>
      ) : <input type="hidden" name="domains" value={tenant.domains.join(",")} />}
    </form>
    </AdminLocaleProvider>
  );
}
