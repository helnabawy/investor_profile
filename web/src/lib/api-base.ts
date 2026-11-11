// An exported copy of a site (see scripts/export-site.mjs) is plain files on someone else's host, so
// its chat and contact form must call back to the platform. The exporter writes the platform address
// into each page as `window.__ESTATEPROFILE_API__`; on the live site it is unset and calls stay relative.
export function apiUrl(path: string) {
  const base = typeof window === "undefined" ? "" : (window as { __ESTATEPROFILE_API__?: string }).__ESTATEPROFILE_API__;
  return `${(base ?? "").replace(/\/$/, "")}${path}`;
}
