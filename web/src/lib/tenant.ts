import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { supabaseAdmin, supabasePublic } from "./supabase/server";
import type { Faq, Page, Project, Tenant } from "./types";
import { PROJECT_COLUMNS } from "./types";
import type { ThemeConfig } from "./theme";
import { PREVIEW_COOKIE, verifyPreviewToken } from "./preview";

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
  const tenant = (data as Tenant | null) ?? null;
  if (!tenant) return null;
  const draft = await previewTheme(tenant);
  return draft ? { ...tenant, theme: draft } : tenant;
});

/**
 * While a browser holds a valid preview token for this tenant (see src/lib/preview.ts), the site
 * renders the unpublished draft theme. Everyone else, and the same browser once the draft is
 * published or discarded, sees the live theme.
 */
async function previewTheme(tenant: Tenant): Promise<ThemeConfig | null> {
  const token = (await cookies()).get(PREVIEW_COOKIE)?.value;
  if (!token || verifyPreviewToken(token) !== tenant.id) return null;
  // The preview runs on the site host, where the admin's session cookie does not exist; the
  // signed token is the authorisation, so read the draft with the service role.
  const { data } = await supabaseAdmin().from("theme_drafts").select("theme").eq("tenant_id", tenant.id).maybeSingle();
  return (data?.theme as ThemeConfig | undefined) ?? null;
}

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

// Primitive arguments on purpose: React cache() compares arguments by identity, so an options
// object would miss the cache on every call.
export const getProjects = cache(async (tenantId: string, featuredOnly = false, limit = 0) => {
  let q = supabasePublic()
    .from("projects")
    .select(PROJECT_COLUMNS)
    .eq("tenant_id", tenantId)
    .eq("published", true)
    .order("sort")
    .order("created_at", { ascending: false });
  if (featuredOnly) q = q.eq("featured", true);
  if (limit) q = q.limit(limit);
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
