// Tenant content is stored in English with an Arabic twin beside each field: `title` / `title_ar`,
// both as table columns and as keys inside jsonb (sections, nav, contact, theme, ai_config, price_growth).
// The site reads plain `title`; this resolves it for the visitor's language.
import type { Locale } from "./locales";

const SUFFIX = "_ar";

const filled = (v: unknown) =>
  typeof v === "string" ? v.trim() !== "" : Array.isArray(v) ? v.length > 0 : v != null;

/**
 * Returns a copy of `value` in `locale`: in Arabic every `k` with a filled `k_ar` takes the Arabic,
 * and an empty one keeps the English. The `_ar` keys themselves are dropped in both languages.
 */
export function localize<T>(value: T, locale: Locale): T {
  if (Array.isArray(value)) return value.map((v) => localize(v, locale)) as T;
  if (!value || typeof value !== "object" || Object.getPrototypeOf(value) !== Object.prototype) return value;
  const src = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(src)) {
    if (k.endsWith(SUFFIX)) continue;
    const ar = src[k + SUFFIX];
    out[k] = localize(locale === "ar" && filled(ar) ? ar : v, locale);
  }
  return out as T;
}

/** The Arabic twin key of a field: "title" → "title_ar". */
export const arKey = (key: string) => key + SUFFIX;
