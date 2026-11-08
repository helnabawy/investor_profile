import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

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
  if (host.endsWith(`.${ROOT}`)) {
    const sub = host.slice(0, -(ROOT.length + 1));
    return /^[a-z0-9-]+$/.test(sub) ? sub : null;
  }
  return host.split(":")[0]; // custom domain
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const site = siteForHost(req.headers.get("host") ?? ROOT);
  const isAppPath = APP_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  // Pass the resolved site to route handlers / server components.
  const headers = new Headers(req.headers);
  headers.delete("x-site"); // never trust a client-supplied value
  if (site) headers.set("x-site", site);

  if (isAppPath) {
    const res = NextResponse.next({ request: { headers } });
    if (pathname.startsWith("/admin") || pathname.startsWith("/login") || pathname.startsWith("/auth")) {
      await refreshSession(req, res);
    }
    return res;
  }

  if (site) {
    const url = req.nextUrl.clone();
    url.pathname = `/s/${encodeURIComponent(site)}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url, { request: { headers } });
  }
  return NextResponse.next({ request: { headers } });
}

// Keeps the Supabase auth cookie fresh for admin pages.
async function refreshSession(req: NextRequest, res: NextResponse) {
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
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
