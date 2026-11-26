import type { ThemeConfig } from "./theme";
import type { AiConfig } from "./ai/config";
import type { Section } from "./sections/registry";
import type { PriceGrowth } from "./price-growth";
import type { Locale } from "./i18n/locales";

// Visitor-facing text has an Arabic twin named `<field>_ar` (columns and jsonb keys alike); see src/lib/i18n/content.ts.

export type Contact = {
  email?: string;
  phone?: string;
  whatsapp?: string; // digits only, international format
  address?: string;
  address_ar?: string;
  hours?: string;
  hours_ar?: string;
  socials?: Record<string, string>;
};

export type NavItem = { label: string; label_ar?: string; href: string };

export type Tenant = {
  id: string;
  slug: string;
  name: string;
  name_ar: string | null;
  tagline: string | null;
  tagline_ar: string | null;
  /** Language served at the site's plain URLs; the other one lives under /ar or /en. */
  default_locale: Locale;
  /** Languages the site is published in (always includes default_locale). */
  locales: Locale[];
  domains: string[];
  plan: string;
  theme: ThemeConfig;
  ai_config: AiConfig;
  contact: Contact;
  nav: NavItem[];
  published: boolean;
  /** Origins of exported copies of the site that may call the chat and contact endpoints. */
  allowed_origins: string[];
};

export type Page = {
  id: string;
  tenant_id: string;
  slug: string;
  title: string;
  title_ar: string | null;
  description: string | null;
  description_ar: string | null;
  sections: Section[];
  published: boolean;
  sort: number;
};

export type Project = {
  id: string;
  tenant_id: string;
  title: string;
  developer: string | null;
  area: string | null;
  city: string | null;
  property_type: string | null;
  status: "off-plan" | "ready" | "sold-out";
  bedrooms: string | null;
  price_from: number | null;
  currency: string;
  handover: string | null;
  payment_plan: string | null;
  roi: string | null;
  description: string | null;
  amenities: string[];
  title_ar: string | null;
  developer_ar: string | null;
  area_ar: string | null;
  city_ar: string | null;
  property_type_ar: string | null;
  bedrooms_ar: string | null;
  handover_ar: string | null;
  payment_plan_ar: string | null;
  roi_ar: string | null;
  description_ar: string | null;
  amenities_ar: string[];
  images: string[];
  brochure_url: string | null;
  /** Launch-vs-today prices per unit type, charted on the project page. */
  price_growth: PriceGrowth | null;
  /** Shown to visitors as an "Available for sale" tag. */
  for_sale: boolean;
  featured: boolean;
  published: boolean;
  sort: number;
};

export type Faq = { id: string; tenant_id: string; question: string; question_ar: string | null; answer: string; answer_ar: string | null; published: boolean; sort: number };

export type Lead = {
  id: string;
  tenant_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  interest: string | null;
  budget: string | null;
  message: string | null;
  source: "form" | "chat";
  status: "new" | "contacted" | "qualified" | "closed";
  session_id: string | null;
  locale: Locale | null;
  created_at: string;
};

export const PROJECT_COLUMNS =
  "id,tenant_id,title,developer,area,city,property_type,status,bedrooms,price_from,currency,handover,payment_plan,roi,description,amenities,images,brochure_url,price_growth,for_sale,featured,published,sort,title_ar,developer_ar,area_ar,city_ar,property_type_ar,bedrooms_ar,handover_ar,payment_plan_ar,roi_ar,description_ar,amenities_ar";
