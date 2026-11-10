import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tenant pages are resolved per request from the Host header, so we render dynamically.
  // (Per-tenant "use cache" + cacheTag is a later optimisation.)
  cacheComponents: false,
  output: "standalone", // used by the Dockerfile for self-hosted installs
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
};

export default nextConfig;
