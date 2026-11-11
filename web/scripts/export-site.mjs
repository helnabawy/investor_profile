#!/usr/bin/env node
// Exports one client's public site as plain static files (HTML, scripts, styles, images) that can be
// hosted anywhere, without any platform code. Chat and the contact form keep working by calling back
// to the platform, which allows the client's domain (see src/lib/cors.ts).
//
// Usage:
//   node --env-file=.env.local scripts/export-site.mjs <tenant-slug> <output-folder> \
//        [--site-url https://<slug>.<root-domain>] [--origin https://www.clientdomain.com]...
//
// - <output-folder> must not exist or must be empty.
// - --site-url is where the live site is served (default: https://<slug>.$NEXT_PUBLIC_ROOT_DOMAIN). It is
//   also the address the exported site's chat and form call. Use a production build of the platform.
// - --origin registers the domain the export will be hosted on, so the platform accepts its chat and form
//   requests. Repeat it for each domain (for example the bare domain and the www one).
// - Needs Playwright's Chromium (the same one the other scripts use) or CHROMIUM_PATH.
import { chromium } from "playwright-core";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, extname, join, resolve } from "node:path";

// ───────── arguments ─────────
const args = process.argv.slice(2);
const flag = (name) => args.flatMap((a, i) => (a === name ? [args[i + 1]] : []));
const positional = args.filter((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));
const [slug, outArg] = positional;
if (!slug || !outArg) {
  console.error("Usage: export-site.mjs <tenant-slug> <output-folder> [--site-url URL] [--origin URL]...");
  process.exit(1);
}
const root = (process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "").toLowerCase();
const siteUrl = (flag("--site-url")[0] ?? (root ? `${root.startsWith("localhost") ? "http" : "https"}://${slug}.${root}` : "")).replace(/\/$/, "");
if (!siteUrl) {
  console.error("Pass --site-url, or set NEXT_PUBLIC_ROOT_DOMAIN.");
  process.exit(1);
}
const site = new URL(siteUrl);
const origins = flag("--origin").map((o) => new URL(o).origin.toLowerCase());
const out = resolve(outArg);
if (existsSync(out) && readdirSync(out).length) {
  console.error(`${out} is not empty. Choose a new or empty folder.`);
  process.exit(1);
}

const problems = [];
const warn = (m) => console.warn("  !", m);

// ───────── 1. find the pages by following links from the home page ─────────
const SKIP = /^\/(admin|api|login|signup|auth|_next)(\/|$)|\.[a-z0-9]{2,5}$/i;
const pages = new Map(); // path → html
const missing = new Set();
const queue = ["/"];
while (queue.length) {
  const path = queue.shift();
  if (pages.has(path) || missing.has(path)) continue;
  const res = await fetch(site.origin + path, { redirect: "manual" }).catch(() => null);
  if (!res || !res.ok) {
    missing.add(path);
    continue;
  }
  const html = await res.text();
  pages.set(path, html);
  for (const [, href] of html.matchAll(/href="(\/[^"#?]*)"/g)) {
    const p = href.length > 1 ? href.replace(/\/$/, "") : href;
    if (!SKIP.test(p) && !pages.has(p) && !missing.has(p)) queue.push(p);
  }
}
if (!pages.has("/")) {
  console.error(`Could not load ${site.origin}/. Is the platform running, and is "${slug}" published?`);
  process.exit(1);
}
for (const p of missing) if (p !== "/") warn(`link to ${p} has no page; left as is`);
console.log(`Found ${pages.size} pages.`);

// ───────── 2. load each page in a browser to collect every script, style and image it uses ─────────
function chromiumPath() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const base = `${homedir()}/Library/Caches/ms-playwright`;
  const dir = existsSync(base) ? readdirSync(base).find((d) => d.startsWith("chromium-")) : null;
  if (!dir) throw new Error("No Chromium found. Set CHROMIUM_PATH or run `pnpm exec playwright-core install chromium`.");
  return `${base}/${dir}/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;
}
const browser = await chromium.launch({ executablePath: chromiumPath() });
const assets = new Map(); // pathname → Buffer (same-origin files the pages load)
const images = new Set(); // absolute URLs of images hosted elsewhere
{
  const page = await (await browser.newContext({ viewport: { width: 1360, height: 900 } })).newPage();
  page.on("response", async (r) => {
    try {
      const u = new URL(r.url());
      if (!r.ok()) return;
      if (u.origin === site.origin) {
        if (!u.searchParams.has("_rsc") && (u.pathname.startsWith("/_next/") || /\.[a-z0-9]{2,5}$/i.test(u.pathname)) && !/^\/(admin|api)\//.test(u.pathname)) {
          assets.set(u.pathname, await r.body());
        }
      } else if (r.request().resourceType() === "image") {
        images.add(r.url());
      }
    } catch {
      /* body no longer available; the verification step below will report anything missing */
    }
  });
  for (const path of pages.keys()) await page.goto(site.origin + path, { waitUntil: "networkidle" });
}
console.log(`Collected ${assets.size} script/style/font files.`);

// ───────── 3. copy the client's media so the export does not depend on the platform's storage ─────────
const storage = process.env.NEXT_PUBLIC_SUPABASE_URL ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/` : null;
// Besides the images the browser loaded, take every image or document URL written into the pages (below-the-fold
// images load lazily, and the page data carries more than what is on screen). A URL counts as media when it is in
// the platform's storage, hosted where a loaded image came from, or ends in an image/PDF extension.
const mediaUrls = new Set(images);
const imageHosts = new Set([...images].map((u) => new URL(u).host));
const mediaExt = /\.(jpe?g|png|webp|avif|gif|svg|pdf)$/i;
for (const html of pages.values()) {
  // "&" appears as "&amp;" in markup and as "\u0026" in the page data.
  for (const [m] of html.matchAll(/https?:\/\/(?:[^\s"'\\<>)]|\\u0026)+/g)) {
    const url = m.replace(/&amp;|\\u0026/g, "&");
    let u;
    try {
      u = new URL(url);
    } catch {
      continue;
    }
    if (u.origin === site.origin || /(^|\.)(fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(u.host)) continue;
    if ((storage && url.startsWith(storage)) || imageHosts.has(u.host) || mediaExt.test(u.pathname)) mediaUrls.add(url);
  }
}
const EXT = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/avif": ".avif", "image/gif": ".gif", "image/svg+xml": ".svg", "application/pdf": ".pdf", "image/x-icon": ".ico" };
const media = new Map(); // original URL → "/media/<hash>.<ext>"
const mediaFiles = new Map(); // "/media/..." → Buffer
for (const url of mediaUrls) {
  const res = await fetch(url).catch(() => null);
  if (!res?.ok) {
    warn(`could not download ${url}; the link is left pointing at the original`);
    continue;
  }
  const type = (res.headers.get("content-type") ?? "").split(";")[0].trim();
  const ext = EXT[type] ?? (extname(new URL(url).pathname) || ".bin");
  const local = `/media/${createHash("sha1").update(url).digest("hex").slice(0, 12)}${ext}`;
  media.set(url, local);
  mediaFiles.set(local, Buffer.from(await res.arrayBuffer()));
}
console.log(`Copied ${media.size} media files.`);

// ───────── 4. write the files ─────────
const replacements = [...media].sort((a, b) => b[0].length - a[0].length);
const apiTag = `<script>window.__ESTATEPROFILE_API__=${JSON.stringify(site.origin)}</script>`;
const write = (rel, data) => {
  const f = join(out, rel);
  mkdirSync(dirname(f), { recursive: true });
  writeFileSync(f, data);
};
for (const [path, original] of pages) {
  let html = original;
  for (const [url, local] of replacements) {
    for (const variant of new Set([url, url.replaceAll("&", "&amp;"), url.replaceAll("&", "\\u0026")])) html = html.split(variant).join(local);
  }
  html = /<head[^>]*>/.test(html) ? html.replace(/<head[^>]*>/, (m) => m + apiTag) : html.replace(/<html[^>]*>/, (m) => m + apiTag);
  write(path === "/" ? "index.html" : `${path.slice(1)}/index.html`, html);
}
for (const [path, body] of assets) write(path.slice(1), body);
for (const [path, body] of mediaFiles) write(path.slice(1), body);

// ───────── 5. allow the client's domain(s) to use chat and the contact form ─────────
if (origins.length) {
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const { data: tenant, error } = await db.from("tenants").select("id,allowed_origins").eq("slug", slug).maybeSingle();
  if (error || !tenant) {
    problems.push(`could not read tenant "${slug}" to register origins: ${error?.message ?? "not found"}`);
  } else {
    const all = [...new Set([...(tenant.allowed_origins ?? []), ...origins])];
    const upd = await db.from("tenants").update({ allowed_origins: all }).eq("id", tenant.id);
    if (upd.error) problems.push(`could not register origins: ${upd.error.message}`);
    else console.log(`Allowed origins: ${all.join(", ")}`);
  }
} else {
  warn("no --origin given: chat and the contact form will be refused until the hosting domain is registered");
}

// ───────── 6. check the export on its own, as a plain static host would serve it ─────────
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".woff": "font/woff", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif", ".gif": "image/gif", ".ico": "image/x-icon", ".pdf": "application/pdf", ".json": "application/json" };
const server = createServer((req, res) => {
  const u = new URL(req.url, "http://x");
  const p = decodeURIComponent(u.pathname);
  let f = join(out, p);
  if (!f.startsWith(out)) return void res.writeHead(403).end();
  if (existsSync(f) && statSync(f).isDirectory()) {
    if (!p.endsWith("/")) return void res.writeHead(301, { Location: p + "/" }).end(); // what most static hosts do
    f = join(f, "index.html");
  }
  if (!existsSync(f)) return void res.writeHead(404).end("not found");
  res.writeHead(200, { "Content-Type": MIME[extname(f)] ?? "application/octet-stream" }).end(readFileSync(f));
});
await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
const local = `http://127.0.0.1:${server.address().port}`;
{
  const page = await (await browser.newContext({ viewport: { width: 1360, height: 900 } })).newPage();
  let current = "";
  page.on("pageerror", (e) => problems.push(`${current}: script error: ${e.message}`));
  page.on("response", (r) => {
    const u = new URL(r.url());
    if (u.origin === local && r.status() >= 400 && !u.searchParams.has("_rsc")) problems.push(`${current}: ${r.status()} for ${u.pathname}`);
  });
  for (const path of pages.keys()) {
    current = path;
    await page.goto(local + path, { waitUntil: "networkidle" });
    if (!(await page.locator("body *").count())) problems.push(`${path}: page is empty`);
  }
}
await browser.close();
server.close();

// The export must never contain platform secrets or server-only code.
const SECRET_MARKERS = ["SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY, "supabaseAdmin"].filter(Boolean);
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
const files = walk(out);
for (const f of files.filter((f) => /\.(html|js|css|json|txt)$/.test(f))) {
  const text = readFileSync(f, "utf8");
  for (const m of SECRET_MARKERS) if (text.includes(m)) problems.push(`${f.slice(out.length + 1)} contains platform-only text ("${m.slice(0, 12)}…")`);
}

console.log(`\nExported ${pages.size} pages (${files.length} files) to ${out}`);
if (problems.length) {
  console.error("\nProblems:");
  for (const p of [...new Set(problems)]) console.error("  ✗", p);
  process.exit(1);
}
console.log("✓ Every page loads from the folder alone, with no errors and no platform-only code.");
console.log(`  Upload the folder's contents to the root of the client's hosting (${origins.join(" or ") || "their domain"}).`);
