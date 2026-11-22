// An exported copy of a site (see scripts/export-site.mjs) is plain files on someone else's host, so
// its chat and contact form must call back to the platform. The exporter writes the platform address
// into each page as `window.__ESTATEPROFILE_API__`; on the live site it is unset and calls stay relative.
// A site served under a path on the platform host (/s/<slug>/…, see the proxy) calls /s/<slug>/api/…,
// which the proxy maps to /api/… for that site.
export function apiUrl(path: string) {
  if (typeof window === "undefined") return path;
  const base = (window as { __ESTATEPROFILE_API__?: string }).__ESTATEPROFILE_API__ ?? window.location.pathname.match(/^\/s\/[a-z0-9-]+(?=\/|$)/)?.[0] ?? "";
  return `${base.replace(/\/$/, "")}${path}`;
}
