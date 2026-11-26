import { ADMIN } from "@/lib/i18n/admin";
import { intlLocale, type Locale } from "@/lib/i18n/locales";

/** "12 min ago", "3 hours ago", "Yesterday, 18:40", then "18 Nov". For admin lists; server-rendered per request. */
export function timeAgo(iso: string, locale: Locale = "en", now = Date.now()) {
  const t = ADMIN[locale].time;
  const d = new Date(iso);
  const mins = Math.round((now - d.getTime()) / 60_000);
  if (mins < 1) return t.justNow;
  if (mins < 60) return t.minAgo(mins);
  const hours = Math.round(mins / 60);
  if (hours < 24) return t.hoursAgo(hours);
  const fmt = locale === "ar" ? intlLocale(locale) : "en-GB";
  const time = d.toLocaleTimeString(fmt, { hour: "2-digit", minute: "2-digit" });
  if (hours < 48) return t.yesterday(time);
  return d.toLocaleDateString(fmt, { day: "numeric", month: "short" });
}
