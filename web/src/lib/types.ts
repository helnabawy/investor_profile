import type { ThemeConfig } from "./theme";
import type { AiConfig } from "./ai/config";
import type { Section } from "./sections/registry";

export type Contact = {
  email?: string;
  phone?: string;
  whatsapp?: string; // digits only, international format
  address?: string;
  hours?: string;
  socials?: Record<string, string>;
};

export type NavItem = { label: string; href: string };

export type Tenant = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  domains: string[];
  plan: string;
  theme: ThemeConfig;
  ai_config: AiConfig;
  contact: Contact;
  nav: NavItem[];
  published: boolean;
};

export type Page = {
  id: string;
  tenant_id: string;
  slug: string;
  title: string;
  description: string | null;
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
  images: string[];
  brochure_url: string | null;
  featured: boolean;
  published: boolean;
  sort: number;
};

export type Faq = { id: string; tenant_id: string; question: string; answer: string; published: boolean; sort: number };

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
  created_at: string;
};

export const PROJECT_COLUMNS =
  "id,tenant_id,title,developer,area,city,property_type,status,bedrooms,price_from,currency,handover,payment_plan,roi,description,amenities,images,brochure_url,featured,published,sort";
