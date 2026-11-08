import "server-only";

// Registers custom domains with Vercel so they get routed + SSL certificates.
// No-op unless VERCEL_TOKEN and VERCEL_PROJECT_ID are set (e.g. local dev, self-hosting).
const token = process.env.VERCEL_TOKEN;
const project = process.env.VERCEL_PROJECT_ID;
const team = process.env.VERCEL_TEAM_ID;

function url(path: string) {
  return `https://api.vercel.com${path}${team ? `?teamId=${team}` : ""}`;
}

export async function addDomainToHosting(domain: string) {
  if (!token || !project) return;
  const res = await fetch(url(`/v10/projects/${project}/domains`), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name: domain }),
  });
  if (!res.ok && res.status !== 409) throw new Error(`Vercel add domain ${domain}: ${res.status} ${await res.text()}`);
}

export async function removeDomainFromHosting(domain: string) {
  if (!token || !project) return;
  const res = await fetch(url(`/v9/projects/${project}/domains/${encodeURIComponent(domain)}`), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok && res.status !== 404) throw new Error(`Vercel remove domain ${domain}: ${res.status}`);
}
