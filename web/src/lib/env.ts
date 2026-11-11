// Central place for deployment settings.
//   DEPLOY_MODE=multi  → SaaS: tenants resolved from subdomain / custom domain.
//   DEPLOY_MODE=single → self-hosted: every request serves TENANT_SLUG.
export const env = {
  mode: (process.env.DEPLOY_MODE === "single" ? "single" : "multi") as "single" | "multi",
  tenantSlug: process.env.TENANT_SLUG ?? "demo",
  rootDomain: (process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000").toLowerCase(),
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
};

export const isMulti = env.mode === "multi";

/** http for local dev hosts (localhost, *.localhost), https everywhere else. */
export const rootProtocol = /^(localhost|[^/]*\.localhost)(:\d+)?$/.test(env.rootDomain) ? "http" : "https";

/** Public URL of a tenant's platform subdomain, e.g. https://demo.example.com. */
export function subdomainUrl(slug: string) {
  return `${rootProtocol}://${slug}.${env.rootDomain}`;
}
