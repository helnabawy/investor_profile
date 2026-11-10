import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { supabasePublic, supabaseServer } from "./supabase/server";
import type { Faq, Page, Project, Tenant } from "./types";
import { PROJECT_COLUMNS } from "./types";
import type { ThemeConfig } from "./theme";

/** Holds the slug of the site being previewed. Set by the admin, read here and in proxy.ts. */
export const PREVIEW_COOKIE = "es_preview";

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
 * While an agent is in preview mode (cookie set from /admin/theme), their own site renders with
 * the unpublished theme. The draft is read with the visitor's session, so RLS only returns it to
 * members of this tenant; everyone else gets null and sees the live theme.
 */
async function previewTheme(tenant: Tenant): Promise<ThemeConfig | null> {
  if ((await cookies()).get(PREVIEW_COOKIE)?.value !== tenant.slug) return null;
  const db = await supabaseServer();
  const { data } = await db.from("theme_drafts").select("theme").eq("tenant_id", tenant.id).maybeSingle();
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
