import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseServer } from "../supabase/server";
import type { Tenant } from "../types";
import { env, isMulti } from "../env";

export const ADMIN_TENANT_COOKIE = "admin_tenant";

/** Current admin user + the tenant they're editing. Redirects when not signed in / no site. */
export const getAdmin = cache(async () => {
  const db = await supabaseServer();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect("/login");

  const { data: memberships } = await db
    .from("tenant_members")
    .select("role, tenant:tenants(id,slug,name,tagline,domains,plan,theme,ai_config,contact,nav,published)")
    .eq("user_id", user.id);
  const sites = (memberships ?? [])
    .map((m) => ({ role: m.role as string, tenant: m.tenant as unknown as Tenant }))
    .filter((m) => m.tenant);
  if (!sites.length) redirect(isMulti ? "/signup?step=site" : "/login?error=no-site");

  const chosen = (await cookies()).get(ADMIN_TENANT_COOKIE)?.value;
  const current = sites.find((s) => s.tenant.id === chosen) ?? sites[0];
  return { db, user, sites, tenant: current.tenant, role: current.role };
});

/** Public URL of a tenant site, for "View site" links. */
export function siteUrl(t: Pick<Tenant, "slug" | "domains">) {
  const proto = env.rootDomain.startsWith("localhost") ? "http" : "https";
  if (!isMulti) return "/";
  if (t.domains?.[0]) return `https://${t.domains[0]}`;
  return `${proto}://${t.slug}.${env.rootDomain}`;
}
