import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

// NEXT_PUBLIC_ROOT_DOMAIN is compiled into the build: tenant routing, the landing page's demo link and
// every subdomain URL come from it. A deploy built without it falls back to localhost:3000 and
// silently links visitors to demo.localhost:3000, so a hosted build stops here instead.
function checkRootDomain(phase: string) {
  if (phase !== PHASE_PRODUCTION_BUILD) return;
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim() ?? "";
  const local = !root || /^(localhost|[^/]*\.localhost)(:\d+)?$/i.test(root);
  if (!local) return;
  const msg = `NEXT_PUBLIC_ROOT_DOMAIN is ${root ? `"${root}"` : "not set"}; links will point at ${root || "localhost:3000"}.`;
  if (process.env.VERCEL) {
    throw new Error(`${msg} Set it in Vercel → Settings → Environment Variables (e.g. yourdomain.com) and redeploy.`);
  }
  console.warn(`⚠ ${msg} Fine for a local build; set the real domain for a deploy.`);
}

const nextConfig = (phase: string): NextConfig => (checkRootDomain(phase), {
  // Tenant pages are resolved per request from the Host header, so we render dynamically.
  // (Per-tenant "use cache" + cacheTag is a later optimisation.)
  cacheComponents: false,
  // Used by the Dockerfile for self-hosted installs; Vercel uses its own output format.
  output: process.env.VERCEL ? undefined : "standalone",
  // Lets a second build live beside a running dev server (the site exporter builds into its own folder).
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
});

export default nextConfig;
