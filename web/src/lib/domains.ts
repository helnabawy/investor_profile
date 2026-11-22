import "server-only";
import { env } from "./env";

// Tells the hosting provider about a tenant's custom domain so it gets routed and receives an
// SSL certificate. The provider is picked from the env vars that are set:
//   CLOUDFLARE_API_TOKEN + CLOUDFLARE_ZONE_ID → Cloudflare for SaaS custom hostnames (VPS install)
//   VERCEL_TOKEN + VERCEL_PROJECT_ID          → Vercel project domains
// With neither (local dev, single-tenant installs) both functions do nothing.
const cf = { token: process.env.CLOUDFLARE_API_TOKEN, zone: process.env.CLOUDFLARE_ZONE_ID };
const vercel = { token: process.env.VERCEL_TOKEN, project: process.env.VERCEL_PROJECT_ID, team: process.env.VERCEL_TEAM_ID };

/** Where a client points their domain's CNAME record; shown in Admin → Settings. */
export const cnameTarget =
  process.env.CUSTOM_DOMAIN_CNAME || (process.env.VERCEL ? "cname.vercel-dns.com" : `customers.${env.rootDomain}`);

export async function addDomainToHosting(domain: string) {
  if (cf.token && cf.zone) return cfAdd(domain);
  if (vercel.token && vercel.project) return vercelAdd(domain);
}

export async function removeDomainFromHosting(domain: string) {
  if (cf.token && cf.zone) return cfRemove(domain);
  if (vercel.token && vercel.project) return vercelRemove(domain);
}

// ───────────── Cloudflare for SaaS ─────────────
function cfFetch(path: string, init?: RequestInit) {
  return fetch(`https://api.cloudflare.com/client/v4/zones/${cf.zone}/custom_hostnames${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${cf.token}`, "Content-Type": "application/json" },
  });
}

async function cfAdd(domain: string) {
  // "http" validation needs nothing from the client beyond the CNAME record they already create.
  const res = await cfFetch("", { method: "POST", body: JSON.stringify({ hostname: domain, ssl: { method: "http", type: "dv" } }) });
  if (!res.ok && res.status !== 409) throw new Error(`Cloudflare add domain ${domain}: ${res.status} ${await res.text()}`);
}

async function cfRemove(domain: string) {
  const found = await cfFetch(`?hostname=${encodeURIComponent(domain)}`);
  if (!found.ok) throw new Error(`Cloudflare find domain ${domain}: ${found.status}`);
  const { result } = (await found.json()) as { result?: { id: string; hostname: string }[] };
  const id = result?.find((h) => h.hostname === domain)?.id;
  if (!id) return;
  const res = await cfFetch(`/${id}`, { method: "DELETE" });
  if (!res.ok && res.status !== 404) throw new Error(`Cloudflare remove domain ${domain}: ${res.status}`);
}

// ───────────── Vercel ─────────────
function vercelUrl(path: string) {
  return `https://api.vercel.com${path}${vercel.team ? `?teamId=${vercel.team}` : ""}`;
}

async function vercelAdd(domain: string) {
  const res = await fetch(vercelUrl(`/v10/projects/${vercel.project}/domains`), {
    method: "POST",
    headers: { Authorization: `Bearer ${vercel.token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name: domain }),
  });
  if (!res.ok && res.status !== 409) throw new Error(`Vercel add domain ${domain}: ${res.status} ${await res.text()}`);
}

async function vercelRemove(domain: string) {
  const res = await fetch(vercelUrl(`/v9/projects/${vercel.project}/domains/${encodeURIComponent(domain)}`), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${vercel.token}` },
  });
  if (!res.ok && res.status !== 404) throw new Error(`Vercel remove domain ${domain}: ${res.status}`);
}
