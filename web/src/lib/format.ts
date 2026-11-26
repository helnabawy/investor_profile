import { formatNumber, type Locale } from "./i18n/locales";
import { SITE } from "./i18n/site";

/** Currency names written after the amount in Arabic ("1.5 مليون درهم"). Others keep their code. */
const AR_CURRENCY: Record<string, string> = { AED: "درهم", SAR: "ريال", USD: "دولار", EUR: "يورو", GBP: "جنيه إسترليني" };
const currencyName = (currency: string, locale: Locale) => (locale === "ar" ? AR_CURRENCY[currency] ?? currency : currency);

/** Short price for cards: "AED 1.5M" / "1.5 مليون درهم". An empty currency gives just the figure. */
export function formatPrice(value: number | null | undefined, currency = "AED", locale: Locale = "en") {
  if (value == null) return SITE[locale].card.priceOnRequest;
  const n = Number(value);
  const m = (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 2).replace(/\.?0+$/, "");
  const k = String(Math.round(n / 1_000));
  if (locale === "ar") {
    const short = n >= 1_000_000 ? `${m} مليون` : n >= 1_000 ? `${k} ألف` : formatNumber(n, locale);
    return `${short} ${currencyName(currency, locale)}`.trim();
  }
  const short = n >= 1_000_000 ? `${m}M` : n >= 1_000 ? `${k}K` : String(n);
  return `${currency} ${short}`;
}

/** Full figure for detail pages: "AED 1,450,000" / "1,450,000 درهم". */
export function formatFullPrice(value: number | null | undefined, currency = "AED", locale: Locale = "en") {
  if (value == null) return SITE[locale].card.priceOnRequest;
  const n = formatNumber(Number(value), locale);
  return locale === "ar" ? `${n} ${currencyName(currency, locale)}` : `${currency} ${n}`;
}

export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

export function whatsappLink(number: string | undefined, text?: string) {
  if (!number) return null;
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

/**
 * Initials for a brand tile or avatar: "Aurelia Estates" → "AE". Arabic letters change shape when
 * set apart, so an Arabic name gets its first letter only ("أوريليا العقارية" → "أ").
 */
export function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (/[؀-ۿ]/.test(words[0] ?? "")) return words[0][0];
  return words.slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
}
