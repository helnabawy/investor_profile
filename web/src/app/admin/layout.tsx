import Link from "next/link";
import { getAdmin, siteUrl } from "@/lib/admin/context";
import { signOut, switchTenant } from "./actions";
import { AdminNav } from "@/components/admin/nav";
import { ExternalLink } from "lucide-react";

export const metadata = { title: "Dashboard · EstateSite" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, sites, tenant } = await getAdmin();
  return (
    <div className="admin flex min-h-screen bg-slate-50 text-slate-900">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r bg-white md:flex">
        <div className="border-b p-4">
          <Link href="/admin" className="text-sm font-semibold tracking-wide text-teal-700">EstateSite</Link>
          {sites.length > 1 ? (
            <form action={async (f) => { "use server"; await switchTenant(String(f.get("t"))); }} className="mt-2">
              <select name="t" defaultValue={tenant.id} className="a-input !py-1.5 text-sm" aria-label="Switch site">
                {sites.map((s) => <option key={s.tenant.id} value={s.tenant.id}>{s.tenant.name}</option>)}
              </select>
              <button className="mt-1 text-xs text-teal-700 underline">Switch</button>
            </form>
          ) : (
            <p className="mt-1 truncate font-medium">{tenant.name}</p>
          )}
          <a href={siteUrl(tenant)} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-teal-700">
            View site <ExternalLink size={12} />
          </a>
        </div>
        <AdminNav />
        <div className="mt-auto border-t p-4 text-xs text-slate-500">
          <p className="truncate">{user.email}</p>
          <form action={signOut}><button className="mt-1 text-teal-700 underline">Sign out</button></form>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="border-b bg-white px-4 py-3 md:hidden">
          <p className="font-medium">{tenant.name}</p>
          <AdminNav mobile />
        </div>
        <main className="mx-auto max-w-5xl px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
