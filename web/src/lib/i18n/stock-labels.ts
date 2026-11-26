// Arabic for the stock English labels a new site starts with (menu items, the call-to-action button).
// A site whose owner never typed an Arabic twin still shows these in Arabic; a label the owner
// changed or translated themselves is left alone.
import type { NavItem, Tenant } from "../types";

const STOCK_AR: Record<string, string> = {
  home: "الرئيسية",
  about: "من نحن",
  "about us": "من نحن",
  projects: "المشاريع",
  contact: "تواصل معنا",
  "contact us": "تواصل معنا",
  concierge: "المساعد الذكي",
  faq: "الأسئلة الشائعة",
  faqs: "الأسئلة الشائعة",
  "book a consultation": "احجز استشارة",
};

/** Arabic for a stock English label, or undefined when the label is the owner's own wording. */
export const stockArabic = (label: string | undefined) => (label ? STOCK_AR[label.trim().toLowerCase()] : undefined);

const blank = (v: unknown) => typeof v !== "string" || v.trim() === "";

function withNavArabic(n: NavItem): NavItem {
  const ar = blank(n.label_ar) ? stockArabic(n.label) : undefined;
  return ar ? { ...n, label_ar: ar } : n;
}

/** Fills empty Arabic twins of stock menu and button labels, before the tenant is localized. */
export function withStockArabic<T extends Pick<Tenant, "nav" | "theme">>(tenant: T): T {
  const theme = tenant.theme ?? {};
  const ctaAr = blank(theme.ctaLabel_ar) ? stockArabic(theme.ctaLabel) : undefined;
  return {
    ...tenant,
    nav: (tenant.nav ?? []).map(withNavArabic),
    theme: ctaAr ? { ...theme, ctaLabel_ar: ctaAr } : theme,
  };
}
