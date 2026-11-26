import { ThemeToggle } from "@/components/theme-toggle";
import { getAdmin, siteUrl } from "@/lib/admin/context";
import { signOut, switchTenant } from "./actions";
import { AdminNav } from "@/components/admin/nav";
import { ExternalLink } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { platformArabicFont, platformFont } from "@/lib/fonts";
import { adminT } from "@/lib/i18n/admin-server";
import { AdminLocaleProvider } from "@/components/admin/i18n";
import { UiLanguageSwitch } from "@/components/admin/ui-language";
import { siteLocales } from "@/lib/tenant";
import { tenantPlan } from "@/lib/tenant";
import { templateFor } from "@/lib/templates";

export async function generateMetadata() {
  return { title: (await adminT()).t.shell.metaTitle, icons: { icon: "/logo-mark.svg" } };
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { db, user, sites, tenant } = await getAdmin();
  const { count: newLeads } = await db.from("leads").select("id", { count: "exact", head: true }).eq("tenant_id", tenant.id).eq("status", "new");
  const { t, locale } = await adminT();
  // Only plain strings may cross into client components.
  const { theme, themeSystem, themeLight, themeDark, themeSwitch, themeTitle } = t.shell;
  const themeLabels = { theme, themeSystem, themeLight, themeDark, themeSwitch, themeTitle };
  const status = t.shell.status(tenant.published !== false, templateFor(tenant.theme?.layout).name);
  return (
    <AdminLocaleProvider locale={locale} siteLocales={siteLocales(tenant).locales}>
    <div className={`admin ${platformFont.variable} ${platformArabicFont.variable} flex min-h-screen bg-sunken`}>
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col overflow-y-auto border-e bg-surface md:flex">
        <div className="flex flex-col gap-3.5 border-b px-4 pb-3.5 pt-3">
          <Logo href="/admin" />
          {sites.length > 1 ? (
            <form action={async (f) => { "use server"; await switchTenant(String(f.get("t"))); }} className="flex gap-2">
              <select name="t" defaultValue={tenant.id} className="a-input text-sm" aria-label={t.shell.switchSite}>
                {sites.map((s) => <option key={s.tenant.id} value={s.tenant.id}>{s.tenant.name}</option>)}
              </select>
              <button className="a-btn a-btn-ghost a-btn-sm">{t.shell.switch}</button>
            </form>
          ) : (
            <div className="flex items-center gap-2.5 rounded-lg border px-2.5 py-2">
              <span aria-hidden className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-md bg-inverse text-sm font-semibold text-white">{tenant.name.trim().charAt(0).toUpperCase()}</span>
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="truncate text-[0.95rem] font-semibold">{tenant.name}</span>
                <span className={`text-[0.8rem] ${tenant.published === false ? "text-warning" : "text-success"}`}>{status}</span>
              </span>
            </div>
          )}
          <a href={siteUrl(tenant)} target="_blank" rel="noreferrer" className="a-link -mt-1 inline-flex min-h-11 items-center gap-1.5 px-1 text-sm">
            {t.shell.viewSite} <ExternalLink size={14} aria-hidden />
          </a>
        </div>
        <AdminNav newLeads={newLeads ?? 0} />
        <div className="mt-auto flex items-center justify-between gap-3 border-t px-4 py-3 text-[0.85rem]">
          <span className="flex min-w-0 flex-col leading-snug">
            <span className="truncate font-medium">{user.email}</span>
            <span className="a-muted">{t.shell.plan(tenantPlan(tenant).name)}</span>
          </span>
          <form action={signOut}><button className="a-link min-h-11 whitespace-nowrap">{t.shell.signOut}</button></form>
        </div>
        <div className="flex items-center justify-between gap-3 border-t px-4 py-2.5 text-[0.85rem]">
          <span className="a-muted">{t.shell.appearance}</span>
          <ThemeToggle variant="segmented" labels={themeLabels} />
        </div>
        <div className="flex items-center justify-between gap-3 border-t px-4 py-2.5 text-[0.85rem]">
          <span className="a-muted">{t.shell.language}</span>
          <UiLanguageSwitch />
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="border-b bg-surface px-4 py-3 md:hidden">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate font-semibold">{tenant.name}</p>
            <div className="flex items-center gap-2">
              <UiLanguageSwitch compact />
              <ThemeToggle labels={themeLabels} />
              <form action={signOut}><button className="a-link min-h-11 text-sm">{t.shell.signOut}</button></form>
            </div>
          </div>
          <AdminNav mobile newLeads={newLeads ?? 0} />
        </div>
        <main className="mx-auto max-w-[1180px] px-4 pb-14 pt-7 md:px-8">{children}</main>
      </div>
    </div>
    </AdminLocaleProvider>
  );
}
