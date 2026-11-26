"use client";
// Link to the same page in the site's other language. A plain <a> on purpose: the whole page changes
// direction and fonts, and the site exporter (scripts/export-site.mjs) follows plain hrefs.
import { LOCALE_NAMES, LOCALE_SHORT } from "@/lib/i18n/locales";
import { cn } from "@/lib/format";
import { localeBase, siteHref, useSiteLocale, useSitePathname } from "./link";

export function LangSwitch({ className, compact = false }: { className?: string; compact?: boolean }) {
  const ctx = useSiteLocale();
  const path = useSitePathname();
  const other = ctx.locales.find((l) => l !== ctx.locale);
  if (!other) return null;
  return (
    <a
      href={siteHref(localeBase(ctx, other), path)}
      hrefLang={other}
      lang={other}
      className={cn("inline-flex min-h-11 items-center justify-center font-medium", className)}
      aria-label={LOCALE_NAMES[other]}
    >
      {compact ? LOCALE_SHORT[other] : LOCALE_NAMES[other]}
    </a>
  );
}
