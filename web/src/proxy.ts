import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { authCookieName, pathRouting, supabaseServerUrl } from "@/lib/env";

// Paths that are never tenant pages (app-level routes).
const APP_PATHS = ["/admin", "/api", "/login", "/signup", "/auth"];

const MODE = process.env.DEPLOY_MODE === "single" ? "single" : "multi";
const TENANT_SLUG = process.env.TENANT_SLUG ?? "demo";
const ROOT = (process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000").toLowerCase();

/** Returns the site key for a host: tenant slug, custom hostname, or null for the platform root. */
function siteForHost(rawHost: string): string | null {
  if (MODE === "single") return TENANT_SLUG;
  const host = rawHost.toLowerCase();
  if (host === ROOT || host === `www.${ROOT}`) return null;
  // Vercel's own deployment URLs (production alias and per-branch previews) serve the platform root.
  if (host.endsWith(".vercel.app")) return null;
  if (host.endsWith(`.${ROOT}`)) {
    const sub = host.slice(0, -(ROOT.length + 1));
    return /^[a-z0-9-]+$/.test(sub) ? sub : null;
  }
  return host.split(":")[0]; // custom domain
}

/** Cookie holding the admin's interface language ("en" | "ar"). */
const UI_LANG_COOKIE = "ui_lang";

/** Splits a leading language prefix off a site path: "/ar/projects" → ["ar", "/projects"]. */
function splitLocale(path: string): [string | null, string] {
  const m = path.match(/^\/(ar|en)(?=\/|$)(.*)$/);
  return m ? [m[1], m[2] || "/"] : [null, path];
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAppPath = APP_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const hostSite = siteForHost(req.headers.get("host") ?? ROOT);

  // Path routing (root domain is a *.vercel.app address, which cannot have subdomains):
  //   /s/<slug>/…      a tenant's pages, served as they are, with links kept under /s/<slug>
  //   /s/<slug>/ar/…   the same pages in Arabic (/en/… in English when Arabic is the site default)
  //   /s/<slug>/api/…  that tenant's chat, contact form and preview, handled as /api/… for the site
  const viaPath = pathRouting && !hostSite ? pathname.match(/^\/s\/([a-z0-9-]+)(\/.*)?$/) : null;
  if (viaPath) {
    const [, slug, rest0 = ""] = viaPath;
    const [locale, rest] = splitLocale(rest0 || "/");
    const root = `/s/${slug}`;
    const headers = withSite(req, slug, locale ? `${root}/${locale}` : root, root, locale, rest);
    if (rest === "/api" || rest.startsWith("/api/")) {
      const url = req.nextUrl.clone();
      url.pathname = rest;
      return NextResponse.rewrite(url, { request: { headers } });
    }
    if (!locale) return NextResponse.next({ request: { headers } });
    const url = req.nextUrl.clone();
    url.pathname = rest === "/" ? root : root + rest;
    return NextResponse.rewrite(url, { request: { headers } });
  }

  const site = hostSite;

  if (isAppPath) {
    const ui = req.cookies.get(UI_LANG_COOKIE)?.value;
    const headers = withSite(req, site, undefined, undefined, ui === "ar" ? "ar" : null);
    const res = NextResponse.next({ request: { headers } });
    if (pathname.startsWith("/admin") || pathname.startsWith("/login") || pathname.startsWith("/auth")) {
      await refreshSession(req, res);
    }
    return res;
  }

  if (site) {
    const [locale, rest] = splitLocale(pathname);
    const url = req.nextUrl.clone();
    if (locale && (rest === "/api" || rest.startsWith("/api/"))) {
      url.pathname = rest;
      return NextResponse.rewrite(url, { request: { headers: withSite(req, site) } });
    }
    const headers = withSite(req, site, locale ? `/${locale}` : undefined, undefined, locale, rest);
    url.pathname = `/s/${encodeURIComponent(site)}${rest === "/" ? "" : rest}`;
    return NextResponse.rewrite(url, { request: { headers } });
  }
  return NextResponse.next({ request: { headers: withSite(req, site) } });
}

/**
 * Passes the resolved site to route handlers / server components:
 *   x-site       tenant slug or custom hostname
 *   x-site-base  path the site's links start with ("/s/demo/ar", "/ar" or unset)
 *   x-site-root  the same without the language prefix ("/s/demo" or unset)
 *   x-locale     language asked for by a /ar or /en prefix (or the admin's ui_lang cookie)
 *   x-site-path  the page's path within the site, without base or prefix ("/projects")
 */
function withSite(req: NextRequest, site: string | null, base?: string, root?: string, locale?: string | null, path?: string) {
  const headers = new Headers(req.headers);
  // never trust client-supplied values
  for (const h of ["x-site", "x-site-base", "x-site-root", "x-locale", "x-site-path"]) headers.delete(h);
  if (site) headers.set("x-site", site);
  if (base) headers.set("x-site-base", base);
  if (root) headers.set("x-site-root", root);
  if (locale) headers.set("x-locale", locale);
  if (path) headers.set("x-site-path", path);
  return headers;
}

// Keeps the Supabase auth cookie fresh for admin pages.
async function refreshSession(req: NextRequest, res: NextResponse) {
  const supabase = createServerClient(supabaseServerUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookieOptions: { name: authCookieName },
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list) => list.forEach(({ name, value, options }) => res.cookies.set(name, value, options)),
    },
  });
  await supabase.auth.getUser();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)"],
};
