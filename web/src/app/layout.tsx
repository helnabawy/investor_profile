import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { THEME_SCRIPT } from "@/components/theme-toggle";
import { siteLocale } from "@/lib/tenant";
import { dirOf, isLocale, type Locale } from "@/lib/i18n/locales";

export const metadata: Metadata = {
  title: "EstateInvestor — websites & AI concierge for real-estate agents",
  description: "Launch a beautiful property portfolio site with an AI concierge that captures leads 24/7.",
};

/** A tenant page is in its site's language; the admin, sign-in and sign-up follow the ui_lang cookie. */
async function pageLocale(): Promise<Locale> {
  const h = await headers();
  if (h.get("x-site-path")) return siteLocale();
  const v = h.get("x-locale");
  return isLocale(v) ? v : "en";
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await pageLocale();
  return (
    // data-theme is set by THEME_SCRIPT before paint (platform surfaces only), so it may differ from the server render.
    <html lang={locale} dir={dirOf(locale)} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
