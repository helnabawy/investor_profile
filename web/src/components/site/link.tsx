"use client";
// A tenant site normally lives at the root of its own host (demo.example.com/projects). On hosts that
// cannot give each tenant a subdomain (*.vercel.app), it is served under a path instead
// (example.vercel.app/s/demo/projects): see the proxy. Site links are written as "/projects", so these
// helpers add the site's base path, which is "" on its own host.
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, type ComponentProps } from "react";

import type { Locale } from "@/lib/i18n/locales";
import { SITE } from "@/lib/i18n/site";

// Arabic pages add a language prefix to the base: "/ar/projects", "/s/demo/ar/projects". The prefix
// is left out for the site's default language, so `base` already carries it and links keep it.
type SiteCtx = { base: string; root: string; locale: Locale; defaultLocale: Locale; locales: Locale[] };
const SiteBase = createContext<SiteCtx>({ base: "", root: "", locale: "en", defaultLocale: "en", locales: ["en"] });

export function SiteBaseProvider({ children, ...value }: SiteCtx & { children: React.ReactNode }) {
  return <SiteBase.Provider value={value}>{children}</SiteBase.Provider>;
}

export const useSiteBase = () => useContext(SiteBase).base;
/** Language of the page, with the site's language settings. */
export const useSiteLocale = () => useContext(SiteBase);

/** Base path of the site in another language: "" / "/ar" on its own host, "/s/demo" / "/s/demo/ar" under a path. */
export function localeBase(ctx: Pick<SiteCtx, "root" | "defaultLocale">, locale: Locale) {
  return ctx.root + (locale === ctx.defaultLocale ? "" : `/${locale}`);
}

/** "/projects" → "/s/demo/projects" under a base path; external, hash and mailto links are unchanged. */
export function siteHref(base: string, href: string) {
  if (!base || !href.startsWith("/") || href.startsWith("//")) return href;
  if (href === "/") return base;
  return href.startsWith("/?") || href.startsWith("/#") ? base + href.slice(1) : base + href;
}

/** next/link for site pages: same props, with the base path added. */
export default function Link({ href, ...props }: ComponentProps<typeof NextLink>) {
  const base = useSiteBase();
  return <NextLink href={typeof href === "string" ? siteHref(base, href) : href} {...props} />;
}

/** The page's path within the site ("/projects"), whether or not it is served under a base path. */
export function useSitePathname() {
  const base = useSiteBase();
  const path = usePathname() ?? "/";
  if (!base || (path !== base && !path.startsWith(base + "/"))) return path;
  return path.slice(base.length) || "/";
}

/** The site's words in the page's language (client components). */
export function useSiteT() {
  const { locale } = useContext(SiteBase);
  return { t: SITE[locale], locale };
}
