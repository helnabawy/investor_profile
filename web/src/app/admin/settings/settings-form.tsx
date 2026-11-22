"use client";
import { useActionState, useState } from "react";
import { saveSite } from "../actions";
import { FormMessage, PageTitle, SubmitButton, UpgradeNote } from "@/components/admin/ui";
import type { NavItem, Tenant } from "@/lib/types";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";

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
  const [nav, setNav] = useState<NavItem[]>(tenant.nav ?? []);
  const c = tenant.contact ?? {};
  const move = (i: number, d: number) => setNav((n) => { const a = [...n]; [a[i], a[i + d]] = [a[i + d], a[i]]; return a; });

  return (
    <form action={action} className="max-w-[1000px]">
      <PageTitle title="Site settings" subtitle="Business details, contact info, navigation and domains.">
        <div className="flex items-center gap-3"><FormMessage state={state} /><SubmitButton>Save changes</SubmitButton></div>
      </PageTitle>
      <input type="hidden" name="nav" value={JSON.stringify(nav)} />

      <Group first title="Business" hint="Shown in your site header, footer and browser tab.">
        <div className="flex flex-wrap gap-4">
          <label className={F}><span>Business name</span><input name="name" defaultValue={tenant.name} required /></label>
          <label className={F}><span>Tagline</span><input name="tagline" defaultValue={tenant.tagline ?? ""} /></label>
        </div>
        <label className="flex cursor-pointer items-start gap-3"><input type="checkbox" name="published" defaultChecked={tenant.published} className="mt-0.5 h-5 w-5" /><span><span className="font-medium">Site is published</span><span className="a-muted block text-sm">Turn off to hide your site from buyers while you work on it.</span></span></label>
      </Group>

      <Group title="Contact" hint="How buyers reach you. The concierge hands conversations over to these.">
        <div className="flex flex-wrap gap-4">
          <label className="field basis-full"><span>Email</span><input name="email" type="email" autoComplete="email" defaultValue={c.email} /><small>New leads are sent here.</small></label>
          <label className={F}><span>Phone</span><input name="phone" type="tel" defaultValue={c.phone} /></label>
          <label className={F}><span>WhatsApp number</span><input name="whatsapp" inputMode="numeric" defaultValue={c.whatsapp} placeholder="9715xxxxxxxx" /><small>International format, digits only.</small></label>
          <label className={F}><span>Office hours</span><input name="hours" defaultValue={c.hours} /></label>
          <label className={F}><span>Address</span><input name="address" defaultValue={c.address} /></label>
        </div>
      </Group>

      <Group title="Navigation menu" hint="The links at the top of your site, left to right.">
        {nav.length > 0 && (
          <div aria-hidden className="-mb-2 flex gap-2.5 pr-[146px] text-[0.85rem] font-medium text-[#5a6475]"><span className="flex-1">Label</span><span className="flex-[1.4]">Link</span></div>
        )}
        {nav.map((n, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <input className="a-input min-w-0 flex-1" aria-label={`Link ${i + 1} label`} value={n.label} placeholder="Label" onChange={(e) => setNav(nav.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
            <input className="a-input min-w-0 flex-[1.4]" aria-label={`Link ${i + 1} address`} value={n.href} placeholder="/projects" onChange={(e) => setNav(nav.map((x, j) => (j === i ? { ...x, href: e.target.value } : x)))} />
            <button type="button" className="a-btn a-btn-ghost !w-11 !px-0" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up"><ArrowUp size={16} aria-hidden /></button>
            <button type="button" className="a-btn a-btn-ghost !w-11 !px-0" disabled={i === nav.length - 1} onClick={() => move(i, 1)} aria-label="Move down"><ArrowDown size={16} aria-hidden /></button>
            <button type="button" className="a-btn a-btn-danger !w-11 !px-0" onClick={() => setNav(nav.filter((_, j) => j !== i))} aria-label="Remove link"><X size={16} aria-hidden /></button>
          </div>
        ))}
        <button type="button" className="a-btn a-btn-ghost self-start border-dashed" onClick={() => setNav([...nav, { label: "", href: "/" }])}><Plus size={16} aria-hidden /> Add link</button>
      </Group>

      {multi ? (
        <Group title="Domains" hint="Where buyers find your site.">
          <div className="overflow-hidden rounded-xl border bg-white">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3.5">
              <span className="min-w-0"><span className="block font-medium [overflow-wrap:anywhere]">{tenant.slug}.{rootDomain}</span><span className="a-muted text-sm">Your free EstateProfile address. Always works.</span></span>
              <span className={`a-pill ${tenant.published === false ? "a-pill-amber" : "a-pill-green"}`}>{tenant.published === false ? "Not published" : "Live"}</span>
            </div>
            {customDomains && tenant.domains.map((d) => (
              <div key={d} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t px-4 py-3.5">
                <span className="min-w-0"><span className="block font-medium [overflow-wrap:anywhere]">{d}</span><span className="a-muted text-sm">Custom domain</span></span>
              </div>
            ))}
          </div>
          {!customDomains && <UpgradeNote>You are on the {planName} plan. Using your own domain is part of the Solo and Team plans.</UpgradeNote>}
          {customDomains && (
            <>
              <label className="field"><span>Custom domains</span>
                <input name="domains" defaultValue={tenant.domains.join(", ")} placeholder="www.youragency.com" />
                <small>Separate several with commas.</small>
              </label>
              <div className="flex flex-col gap-2.5 rounded-lg bg-[#eef0f3] px-4 py-3.5">
                <p className="text-sm">At your domain provider, point each domain to us with this record, then save.</p>
                <dl className="flex flex-wrap gap-x-9 gap-y-2.5 text-sm">
                  <div><dt className="a-muted text-[0.8rem]">Type</dt><dd className="font-mono">CNAME</dd></div>
                  <div className="min-w-0"><dt className="a-muted text-[0.8rem]">Points to</dt><dd className="font-mono [overflow-wrap:anywhere]">{cnameTarget}</dd></div>
                </dl>
              </div>
            </>
          )}
        </Group>
      ) : <input type="hidden" name="domains" value={tenant.domains.join(",")} />}
    </form>
  );
}
