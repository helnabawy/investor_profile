import { getAdmin, siteUrl } from "@/lib/admin/context";
import { signOut, switchTenant } from "./actions";
import { AdminNav } from "@/components/admin/nav";
import { ExternalLink } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { platformFont } from "@/lib/fonts";
import { tenantPlan } from "@/lib/tenant";
import { templateFor } from "@/lib/templates";

export const metadata = { title: "Dashboard · EstateProfile", icons: { icon: "/logo-mark.svg" } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { db, user, sites, tenant } = await getAdmin();
  const { count: newLeads } = await db.from("leads").select("id", { count: "exact", head: true }).eq("tenant_id", tenant.id).eq("status", "new");
  const status = `${tenant.published === false ? "Not published" : "Live"} · ${templateFor(tenant.theme?.layout).name} template`;
  return (
    <div className={`admin ${platformFont.variable} flex min-h-screen bg-[#f4f5f7]`}>
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col overflow-y-auto border-r bg-white md:flex">
        <div className="flex flex-col gap-3.5 border-b px-4 pb-3.5 pt-3">
          <Logo href="/admin" />
          {sites.length > 1 ? (
            <form action={async (f) => { "use server"; await switchTenant(String(f.get("t"))); }} className="flex gap-2">
              <select name="t" defaultValue={tenant.id} className="a-input text-sm" aria-label="Switch site">
                {sites.map((s) => <option key={s.tenant.id} value={s.tenant.id}>{s.tenant.name}</option>)}
              </select>
              <button className="a-btn a-btn-ghost a-btn-sm">Switch</button>
            </form>
          ) : (
            <div className="flex items-center gap-2.5 rounded-lg border px-2.5 py-2">
              <span aria-hidden className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-md bg-[#0f1728] text-sm font-semibold text-white">{tenant.name.trim().charAt(0).toUpperCase()}</span>
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="truncate text-[0.95rem] font-semibold">{tenant.name}</span>
                <span className={`text-[0.8rem] ${tenant.published === false ? "text-[#6b4200]" : "text-[#1a7f4b]"}`}>{status}</span>
              </span>
            </div>
          )}
          <a href={siteUrl(tenant)} target="_blank" rel="noreferrer" className="a-link -mt-1 inline-flex min-h-11 items-center gap-1.5 px-1 text-sm">
            View my site <ExternalLink size={14} aria-hidden />
          </a>
        </div>
        <AdminNav newLeads={newLeads ?? 0} />
        <div className="mt-auto flex items-center justify-between gap-3 border-t px-4 py-3 text-[0.85rem]">
          <span className="flex min-w-0 flex-col leading-snug">
            <span className="truncate font-medium">{user.email}</span>
            <span className="a-muted">{tenantPlan(tenant).name} plan</span>
          </span>
          <form action={signOut}><button className="a-link min-h-11 whitespace-nowrap">Sign out</button></form>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="border-b bg-white px-4 py-3 md:hidden">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate font-semibold">{tenant.name}</p>
            <form action={signOut}><button className="a-link min-h-11 text-sm">Sign out</button></form>
          </div>
          <AdminNav mobile newLeads={newLeads ?? 0} />
        </div>
        <main className="mx-auto max-w-[1180px] px-4 pb-14 pt-7 md:px-8">{children}</main>
      </div>
    </div>
  );
}
