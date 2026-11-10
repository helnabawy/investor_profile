import "server-only";
import type { Tenant } from "./types";

/**
 * Cross-origin rules for the public endpoints (/api/chat, /api/contact).
 *
 * The live site calls them from its own origin. An exported copy of the site calls them from another
 * domain, which is allowed only when that origin is in the tenant's `allowed_origins` (set by the
 * operator; members cannot edit it). Requests without an Origin header (not from a browser page) are
 * unchanged and stay covered by the rate limits.
 *
 * Returns the headers to add to the response, or null when the request must be refused.
 */
export function corsFor(req: Request, tenant: Pick<Tenant, "allowed_origins"> | null): Record<string, string> | null {
  const origin = req.headers.get("origin");
  if (!origin) return {};
  let parsed: URL;
  try {
    parsed = new URL(origin);
  } catch {
    return null;
  }
  const host = req.headers.get("host");
  if (host && parsed.host.toLowerCase() === host.toLowerCase()) return {}; // same origin
  if (tenant?.allowed_origins?.includes(parsed.origin.toLowerCase())) {
    return { "Access-Control-Allow-Origin": parsed.origin, Vary: "Origin" };
  }
  return null;
}

/** Response to a browser's preflight request. */
export function preflight(req: Request, tenant: Pick<Tenant, "allowed_origins"> | null) {
  const cors = corsFor(req, tenant);
  if (!cors) return new Response(null, { status: 403 });
  return new Response(null, {
    status: 204,
    headers: { ...cors, "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "86400" },
  });
}
