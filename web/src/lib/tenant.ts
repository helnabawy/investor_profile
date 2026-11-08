import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { supabasePublic } from "./supabase/server";
import type { Faq, Page, Project, Tenant } from "./types";
import { PROJECT_COLUMNS } from "./types";

const TENANT_COLUMNS = "id,slug,name,tagline,domains,plan,theme,ai_config,contact,nav,published";

/**
 * `site` is what proxy.ts put in the URL: a tenant slug (subdomain / single mode)
 * or a full hostname (custom domain). Slugs never contain dots, so that is the discriminator.
 */
export const getTenantBySite = cache(async (site: string): Promise<Tenant | null> => {
  const db = supabasePublic();
  const key = decodeURIComponent(site).toLowerCase();
  const q = db.from("tenants").select(TENANT_COLUMNS).eq("published", true);
  const { data } = key.includes(".") ? await q.contains("domains", [key]).maybeSingle() : await q.eq("slug", key).maybeSingle();
  return (data as Tenant | null) ?? null;
});

export async function requireTenant(site: string) {
  const t = await getTenantBySite(site);
  if (!t) notFound();
  return t;
}

export const getPage = cache(async (tenantId: string, slug: string) => {
  const { data } = await supabasePublic()
    .from("pages")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  return data as Page | null;
});

export const getProjects = cache(async (tenantId: string, opts: { featured?: boolean; limit?: number } = {}) => {
  let q = supabasePublic()
    .from("projects")
    .select(PROJECT_COLUMNS)
    .eq("tenant_id", tenantId)
    .eq("published", true)
    .order("sort")
    .order("created_at", { ascending: false });
  if (opts.featured) q = q.eq("featured", true);
  if (opts.limit) q = q.limit(opts.limit);
  const { data } = await q;
  return (data ?? []) as Project[];
});

export const getProject = cache(async (tenantId: string, id: string) => {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data } = await supabasePublic()
    .from("projects")
    .select(PROJECT_COLUMNS)
    .eq("tenant_id", tenantId)
    .eq("id", id)
    .eq("published", true)
    .maybeSingle();
  return data as Project | null;
});

export const getFaqs = cache(async (tenantId: string) => {
  const { data } = await supabasePublic()
    .from("faqs")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("published", true)
    .order("sort");
  return (data ?? []) as Faq[];
});
