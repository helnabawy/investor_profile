"use client";
import { useActionState, useState } from "react";
import { saveSite } from "../actions";
import { FormMessage, PageTitle, SubmitButton } from "@/components/admin/ui";
import type { NavItem, Tenant } from "@/lib/types";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";

export function SettingsForm({ tenant, multi, rootDomain }: { tenant: Tenant; multi: boolean; rootDomain: string }) {
  const [state, action] = useActionState(saveSite, null);
  const [nav, setNav] = useState<NavItem[]>(tenant.nav ?? []);
  const c = tenant.contact ?? {};
  const move = (i: number, d: number) => setNav((n) => { const a = [...n]; [a[i], a[i + d]] = [a[i + d], a[i]]; return a; });

  return (
    <form action={action} className="space-y-6">
      <PageTitle title="Site settings" subtitle="Business details, contact info, navigation and domains.">
        <SubmitButton>Save changes</SubmitButton>
      </PageTitle>
      <FormMessage state={state} />
      <input type="hidden" name="nav" value={JSON.stringify(nav)} />

      <section className="a-card grid gap-4 sm:grid-cols-2">
        <label className="field"><span>Business name</span><input name="name" defaultValue={tenant.name} required /></label>
        <label className="field"><span>Tagline</span><input name="tagline" defaultValue={tenant.tagline ?? ""} /></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={tenant.published} /> Site is published</label>
      </section>

      <section className="a-card grid gap-4 sm:grid-cols-2">
        <h2 className="font-semibold sm:col-span-2">Contact</h2>
        <label className="field"><span>Email (receives lead notifications)</span><input name="email" type="email" defaultValue={c.email} /></label>
        <label className="field"><span>Phone</span><input name="phone" defaultValue={c.phone} /></label>
        <label className="field"><span>WhatsApp number</span><input name="whatsapp" defaultValue={c.whatsapp} placeholder="9715xxxxxxxx" /><small>International format, digits only.</small></label>
        <label className="field"><span>Office hours</span><input name="hours" defaultValue={c.hours} /></label>
        <label className="field sm:col-span-2"><span>Address</span><input name="address" defaultValue={c.address} /></label>
      </section>

      <section className="a-card space-y-3">
        <h2 className="font-semibold">Navigation menu</h2>
        {nav.map((n, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2">
            <input className="a-input max-w-48" value={n.label} placeholder="Label" onChange={(e) => setNav(nav.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
            <input className="a-input flex-1" value={n.href} placeholder="/projects" onChange={(e) => setNav(nav.map((x, j) => (j === i ? { ...x, href: e.target.value } : x)))} />
            <button type="button" className="a-btn a-btn-ghost !px-2" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up"><ArrowUp size={14} /></button>
            <button type="button" className="a-btn a-btn-ghost !px-2" disabled={i === nav.length - 1} onClick={() => move(i, 1)} aria-label="Move down"><ArrowDown size={14} /></button>
            <button type="button" className="a-btn a-btn-danger !px-2" onClick={() => setNav(nav.filter((_, j) => j !== i))} aria-label="Remove"><Trash2 size={14} /></button>
          </div>
        ))}
        <button type="button" className="a-btn a-btn-ghost" onClick={() => setNav([...nav, { label: "", href: "/" }])}>+ Add link</button>
      </section>

      {multi && (
        <section className="a-card space-y-3">
          <h2 className="font-semibold">Domains</h2>
          <p className="text-sm text-slate-600">Your free address: <code className="rounded bg-slate-100 px-1.5 py-0.5">{tenant.slug}.{rootDomain}</code></p>
          <label className="field"><span>Custom domains</span>
            <input name="domains" defaultValue={tenant.domains.join(", ")} placeholder="www.youragency.com" />
            <small>Point a CNAME record for each domain to <code>cname.vercel-dns.com</code> (or your host), then save. Separate several with commas.</small>
          </label>
        </section>
      )}
      {!multi && <input type="hidden" name="domains" value={tenant.domains.join(",")} />}
    </form>
  );
}
