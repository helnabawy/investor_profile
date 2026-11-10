import "server-only";
import { createHash } from "node:crypto";

/**
 * Stable, non-reversible id for the visitor behind a request, used to rate-limit public endpoints.
 * Takes the first X-Forwarded-For hop (set by Vercel and most proxies) or X-Real-IP.
 * Requests with neither (local dev without a proxy) share one bucket.
 */
export function clientHash(h: Headers) {
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip")?.trim() || "unknown";
  const salt = process.env.PREVIEW_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "estatesite";
  return createHash("sha256").update(`${salt}:${ip}`).digest("base64url").slice(0, 32);
}

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();
export { minutesAgo };

// Limits per visitor. Generous for a real buyer, tight enough that one script cannot drain a
// tenant's daily AI allowance or flood the leads inbox.
export const LIMITS = {
  chatPer10Min: 20,
  chatPerDay: 120,
  leadsPerHour: 5,
};
