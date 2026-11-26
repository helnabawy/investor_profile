import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/brand/logo";
import { platformArabicFont, platformFont } from "@/lib/fonts";
import { adminT } from "@/lib/i18n/admin-server";
import { AdminLocaleProvider } from "@/components/admin/i18n";
import { UiLanguageSwitch } from "@/components/admin/ui-language";

const SKYLINE = "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600&q=72";

/**
 * Sign-in and sign-up: the form on the start side, what the product does on the other (hidden on phones).
 * Provides the admin language to the client forms inside, and a switch to change it before signing in.
 */
export async function AuthShell({ title, subtitle, children, aside }: { title: string; subtitle?: string; children: React.ReactNode; aside?: React.ReactNode }) {
  const { t, locale } = await adminT();
  const a = t.auth;
  // Only plain strings may cross into client components.
  const { theme, themeSystem, themeLight, themeDark, themeSwitch, themeTitle } = t.shell;
  const themeLabels = { theme, themeSystem, themeLight, themeDark, themeSwitch, themeTitle };
  return (
    <AdminLocaleProvider locale={locale} siteLocales={["en", "ar"]}>
      <div className={`admin ${platformFont.variable} ${platformArabicFont.variable} flex min-h-screen bg-canvas`}>
        <main className="flex min-w-0 flex-[1_1_440px] flex-col px-6 py-6 md:px-8">
          <div className="flex items-center justify-between gap-3"><Logo /><div className="flex items-center gap-2"><UiLanguageSwitch /><ThemeToggle labels={themeLabels} /></div></div>
          <div className="m-auto flex w-full max-w-[420px] flex-col gap-7 py-12">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-[1.9rem] font-semibold leading-tight tracking-[-0.02em]">{title}</h1>
              {subtitle && <p className="a-muted text-base">{subtitle}</p>}
            </div>
            <div>{children}</div>
            {aside}
          </div>
          <p className="a-muted text-[0.85rem]">{a.tagline}</p>
        </main>
        <aside className="relative hidden flex-[1.15_1_420px] flex-col justify-end overflow-hidden bg-inverse text-white lg:flex">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={SKYLINE} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(15_23_40/0.15)_0%,rgb(15_23_40/0.45)_45%,rgb(15_23_40/0.94)_100%)]" />
          <div className="relative flex flex-col gap-6 px-[clamp(24px,5vw,64px)] pb-14 pt-12">
            <div aria-hidden className="flex max-w-[420px] flex-col gap-2 self-start">
              <p className="max-w-[88%] self-end rounded-[12px_4px_12px_12px] bg-brand px-3.5 py-2.5 text-[0.95rem] rtl:rounded-[4px_12px_12px_12px]">{a.sampleQuestion}</p>
              <p className="max-w-[92%] self-start rounded-[4px_12px_12px_12px] bg-surface px-3.5 py-2.5 text-[0.95rem] text-ink rtl:rounded-[12px_4px_12px_12px]">{a.sampleAnswer}</p>
            </div>
            <p className="max-w-[18ch] text-balance text-[clamp(1.8rem,3.2vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.025em]">{a.pitch}</p>
            <p className="max-w-[46ch] text-[1.05rem] text-[#d7dbe3]">{a.pitchSub}</p>
          </div>
        </aside>
      </div>
    </AdminLocaleProvider>
  );
}
