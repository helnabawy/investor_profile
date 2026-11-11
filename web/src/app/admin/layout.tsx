import { getAdmin, siteUrl } from "@/lib/admin/context";
import { signOut, switchTenant } from "./actions";
import { AdminNav } from "@/components/admin/nav";
import { ExternalLink } from "lucide-react";
import { Logo } from "@/components/brand/logo";

export const metadata = { title: "Dashboard · EstateProfile", icons: { icon: "/logo-mark.svg" } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, sites, tenant } = await getAdmin();
  return (
    <div className="admin flex min-h-screen bg-[#f6f7f9] text-slate-900">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-y-auto border-r bg-white md:flex">
        <div className="border-b p-4">
          <Logo href="/admin" />
          {sites.length > 1 ? (
            <form action={async (f) => { "use server"; await switchTenant(String(f.get("t"))); }} className="mt-3 flex gap-2">
              <select name="t" defaultValue={tenant.id} className="a-input text-sm" aria-label="Switch site">
                {sites.map((s) => <option key={s.tenant.id} value={s.tenant.id}>{s.tenant.name}</option>)}
              </select>
              <button className="a-btn a-btn-ghost">Switch</button>
            </form>
          ) : (
            <p className="mt-3 truncate px-1 font-semibold">{tenant.name}</p>
          )}
          <a href={siteUrl(tenant)} target="_blank" rel="noreferrer" className="mt-1 inline-flex min-h-11 items-center gap-1.5 px-1 text-sm font-medium text-blue-700 hover:text-blue-900">
            View my site <ExternalLink size={14} aria-hidden />
          </a>
        </div>
        <AdminNav />
        <div className="mt-auto border-t p-4 text-sm text-slate-600">
          <p className="truncate">{user.email}</p>
          <form action={signOut}><button className="mt-1 min-h-11 font-medium text-blue-700 hover:text-blue-900">Sign out</button></form>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="border-b bg-white px-4 py-3 md:hidden">
          <p className="font-semibold">{tenant.name}</p>
          <AdminNav mobile />
        </div>
        <main className="mx-auto max-w-6xl px-4 py-8 md:px-10">{children}</main>
      </div>
    </div>
  );
}
