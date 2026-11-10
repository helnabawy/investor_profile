import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env, isMulti } from "./env";

// Theme preview runs on the agent's own site host (not the platform host), so it never changes
// what the platform's landing page serves. The admin hands the iframe a short-lived signed token;
// /api/preview on the site host checks it and stores it in a host-only cookie; the site layout then
// renders the tenant's draft theme for that browser only.

export const PREVIEW_COOKIE = "es_preview";
export const PREVIEW_TTL_SECONDS = 30 * 60;

function secret() {
  const s = process.env.PREVIEW_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!s) throw new Error("Set PREVIEW_SECRET (or SUPABASE_SERVICE_ROLE_KEY) to enable theme preview");
  return s;
}

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

/** Token = "<tenantId>.<expiry seconds>.<signature>". */
export function createPreviewToken(tenantId: string) {
  const payload = `${tenantId}.${Math.floor(Date.now() / 1000) + PREVIEW_TTL_SECONDS}`;
  return `${payload}.${sign(payload)}`;
}

/** Returns the tenant id the token was issued for, or null when it is forged or expired. */
export function verifyPreviewToken(token: string | undefined | null): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [tenantId, exp, sig] = parts;
  const expected = Buffer.from(sign(`${tenantId}.${exp}`));
  const given = Buffer.from(sig);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  if (!(Number(exp) > Date.now() / 1000)) return null;
  return tenantId;
}

/**
 * Origin the preview iframe loads. Always the tenant's platform subdomain (custom domains are often
 * cross-site from the admin, where browsers block the iframe's cookie). Same origin in single mode.
 */
export function previewOrigin(slug: string) {
  if (!isMulti) return "";
  const proto = env.rootDomain.startsWith("localhost") ? "http" : "https";
  return `${proto}://${slug}.${env.rootDomain}`;
}
