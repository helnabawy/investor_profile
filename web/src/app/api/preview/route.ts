import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { PREVIEW_COOKIE, PREVIEW_TTL_SECONDS, verifyPreviewToken } from "@/lib/preview";
import { getTenantBySite } from "@/lib/tenant";

/**
 * Entry point of the admin's preview iframe, on the tenant's own host:
 * /api/preview?token=…&path=/projects → stores the token in a host-only cookie and redirects.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const path = url.searchParams.get("path") ?? "/";
  const site = (await headers()).get("x-site");
  const tenant = site ? await getTenantBySite(site) : null;
  const tenantId = verifyPreviewToken(token);
  if (!tenant || !tenantId || tenant.id !== tenantId) return new Response("Preview link expired. Open the preview again from your dashboard.", { status: 401 });

  // Only same-site paths: never an absolute or protocol-relative URL (open redirect).
  const target = path.startsWith("/") && !path.startsWith("//") && !path.includes("\\") ? path : "/";
  // Relative Location: stays on whatever host the browser used (req.url's origin can differ behind proxies).
  const res = new NextResponse(null, { status: 307, headers: { Location: target } });
  res.cookies.set(PREVIEW_COOKIE, token!, {
    path: "/",
    httpOnly: true,
    maxAge: PREVIEW_TTL_SECONDS,
    // The iframe sits inside the platform admin; in local dev (*.localhost) that is cross-site,
    // so the cookie must be SameSite=None (browsers allow Secure on localhost over http).
    sameSite: "none",
    secure: true,
  });
  res.headers.set("Cache-Control", "no-store");
  return res;
}
