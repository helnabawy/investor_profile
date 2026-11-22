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

/**
 * Address the server uses to reach Supabase. Self-hosted installs set SUPABASE_INTERNAL_URL to the
 * gateway on the private network (http://kong:8000); everywhere else it is the public URL.
 */
export const supabaseServerUrl = process.env.SUPABASE_INTERNAL_URL || env.supabaseUrl;

/**
 * Name of the login cookie. supabase-js derives it from the URL it is given, so it is pinned to the
 * public URL here: the browser and the server must agree on it even when the server uses the internal one.
 */
export const authCookieName = `sb-${hostFirstLabel(env.supabaseUrl)}-auth-token`;

function hostFirstLabel(url: string | undefined) {
  try {
    return new URL(url ?? "").hostname.split(".")[0];
  } catch {
    return "app";
  }
}

export const isMulti = env.mode === "multi";

/** http for local dev hosts (localhost, *.localhost), https everywhere else. */
export const rootProtocol = /^(localhost|[^/]*\.localhost)(:\d+)?$/.test(env.rootDomain) ? "http" : "https";

/**
 * *.vercel.app addresses cannot have subdomains of their own (no wildcard DNS or certificate), so with
 * one as the root domain each tenant is served under a path instead: https://x.vercel.app/s/demo.
 */
export const pathRouting = env.rootDomain.endsWith(".vercel.app");

/** Public URL of a tenant's platform address, e.g. https://demo.example.com (or …/s/demo, see above). */
export function subdomainUrl(slug: string) {
  return pathRouting ? `${rootProtocol}://${env.rootDomain}/s/${slug}` : `${rootProtocol}://${slug}.${env.rootDomain}`;
}
