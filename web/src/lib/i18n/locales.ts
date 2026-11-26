// Languages a site (and the admin) can be shown in. Shared by server and client code.
export const LOCALES = ["en", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

export const isLocale = (v: unknown): v is Locale => v === "en" || v === "ar";
export const isRtl = (l: Locale) => l === "ar";
export const dirOf = (l: Locale) => (isRtl(l) ? "rtl" : "ltr");

/** Names shown in language switches, each in its own language. */
export const LOCALE_NAMES: Record<Locale, string> = { en: "English", ar: "العربية" };
/** Short switch labels. */
export const LOCALE_SHORT: Record<Locale, string> = { en: "EN", ar: "ع" };

/**
 * Intl locale for numbers and dates. Arabic keeps Western digits (1,450,000), which is what UAE
 * property listings, brochures and payment plans use.
 */
export const intlLocale = (l: Locale) => (l === "ar" ? "ar-AE-u-nu-latn" : "en-US");

export function formatNumber(n: number, locale: Locale, opts?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat(intlLocale(locale), opts).format(n);
}

/** Picks the plural form for a count, using each language's own rules (Arabic has six). */
export function plural(locale: Locale, n: number, forms: Partial<Record<Intl.LDMLPluralRule, string>> & { other: string }) {
  const rule = new Intl.PluralRules(intlLocale(locale)).select(n);
  return (forms[rule] ?? forms.other).replace("{n}", formatNumber(n, locale));
}
