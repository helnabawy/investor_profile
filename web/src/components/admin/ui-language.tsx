"use client";
// EN / ع switch for the dashboard's own language (not the site's: that is in Site settings).
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setUiLanguage } from "@/app/admin/actions";
import { LOCALE_NAMES, LOCALES } from "@/lib/i18n/locales";
import { useAdminT } from "./i18n";

export function UiLanguageSwitch({ compact = false }: { compact?: boolean }) {
  const { t, locale } = useAdminT();
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <div role="radiogroup" aria-label={t.shell.language} className="theme-seg">
      {LOCALES.map((l) => (
        <button key={l} type="button" role="radio" aria-checked={locale === l} lang={l} disabled={pending}
          className="!w-auto px-2 text-[0.8rem] font-medium"
          // The whole page changes direction, so reload it rather than patch it in place.
          onClick={() => start(async () => { await setUiLanguage(l); router.refresh(); })}>
          {compact ? (l === "ar" ? "ع" : "EN") : LOCALE_NAMES[l]}
        </button>
      ))}
    </div>
  );
}
