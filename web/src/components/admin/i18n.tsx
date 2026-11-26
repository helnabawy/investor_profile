"use client";
// The admin's interface language and the site's languages, for client components in the dashboard.
import { createContext, useContext } from "react";
import { ADMIN } from "@/lib/i18n/admin";
import type { Locale } from "@/lib/i18n/locales";

type Ctx = { locale: Locale; siteLocales: Locale[] };
const AdminLocale = createContext<Ctx>({ locale: "en", siteLocales: ["en", "ar"] });

export function AdminLocaleProvider({ children, ...value }: Ctx & { children: React.ReactNode }) {
  return <AdminLocale.Provider value={value}>{children}</AdminLocale.Provider>;
}

export function useAdminT() {
  const ctx = useContext(AdminLocale);
  return { t: ADMIN[ctx.locale], locale: ctx.locale, arabicOn: ctx.siteLocales.includes("ar") };
}
