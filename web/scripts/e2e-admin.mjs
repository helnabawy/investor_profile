// Dev E2E: admin login → edit settings/theme/project → verify public site; signup → new tenant.
// Usage: node scripts/e2e-admin.mjs <screenshotDir>   (local dev server on :3100, seeded DB)
import { chromium } from "playwright-core";
import { readdirSync } from "node:fs"; import { homedir } from "node:os";
const out = process.argv[2] ?? ".";
const base = `${homedir()}/Library/Caches/ms-playwright`; const dir = readdirSync(base).find((d) => d.startsWith("chromium-"));
const b = await chromium.launch({ executablePath: `${base}/${dir}/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing` });
const ok = (c, m) => { console.log(c ? "✓" : "✗", m); if (!c) process.exitCode = 1; };
const ctx = await b.newContext({ viewport: { width: 1360, height: 900 } });
const page = await ctx.newPage();
const errs = []; page.on("pageerror", (e) => errs.push(e.message));
const R = "http://localhost:3100";

await page.goto(`${R}/login`);
await page.fill('input[name=email]', "demo@estatesite.test");
await page.fill('input[name=password]', "demo-pass-123");
await page.click("button:has-text('Sign in')");
await page.waitForURL(`${R}/admin`);
ok(await page.isVisible("text=Welcome back"), "login → admin overview");
await page.screenshot({ path: `${out}/admin-overview.png` });

// Site settings: change tagline
await page.goto(`${R}/admin/settings`);
await page.fill('input[name=tagline]', "Boutique advisory for Dubai investors");
await page.click("button:has-text('Save changes')");
await page.waitForSelector("text=Saved ✓");
const home = await (await fetch("http://demo.localhost:3100/")).text();
ok(home.includes("Boutique advisory for Dubai investors"), "settings change shows on public site");

// Theme: switch to Desert Sand preset
await page.goto(`${R}/admin/theme`);
await page.click("button:has-text('Desert Sand')");
await page.click("button:has-text('Save theme')");
await page.waitForSelector("text=Saved ✓");
await page.screenshot({ path: `${out}/admin-theme.png` });
const themed = await (await fetch("http://demo.localhost:3100/")).text();
ok(themed.includes("--primary:#a0522d"), "theme change applied to public site CSS");

// Page builder: open home, add a Gallery section, save
await page.goto(`${R}/admin/pages`);
await page.click("text=Home");
await page.waitForSelector("button[aria-label='Remove']");
const before = await page.locator("button[aria-label='Remove']").count();
await page.click("button:has-text('+ Add section')");
await page.click("button:has-text('Call to action')");
await page.fill("input >> nth=-3", "Book a private consultation"); // CTA title field
await page.click("button:has-text('Save page')");
await page.waitForSelector("text=Saved ✓");
await page.screenshot({ path: `${out}/admin-builder.png`, fullPage: true });
ok((await page.locator("button[aria-label='Remove']").count()) === before + 1, "section added in builder");
const built = await (await fetch("http://demo.localhost:3100/")).text();
ok(built.includes("Book a private consultation"), "new section renders on public home page");

// Projects: create one
await page.goto(`${R}/admin/projects/new`);
await page.fill('input[name=title]', "E2E Test Tower");
await page.fill('input[name=area]', "JVC");
await page.fill('input[name=price_from]', "750000");
await page.click("button:has-text('Create project')");
await page.waitForURL(`${R}/admin/projects`);
ok(await page.isVisible("text=E2E Test Tower"), "project created");
const plist = await (await fetch("http://demo.localhost:3100/projects")).text();
ok(plist.includes("E2E Test Tower"), "project appears on public site");
await page.screenshot({ path: `${out}/admin-projects.png` });

// Leads inbox shows the contact-form lead
await page.goto(`${R}/admin/leads`);
ok(await page.isVisible("text=Test Buyer"), "lead from contact form in inbox");
await page.screenshot({ path: `${out}/admin-leads.png` });
await ctx.close();

// Signup → new tenant
const c2 = await b.newContext({ viewport: { width: 1200, height: 900 } });
const p2 = await c2.newPage(); p2.on("pageerror", (e) => errs.push(e.message));
const email = `new${Date.now()}@estatesite.test`;
await p2.goto(`${R}/signup`);
await p2.fill('input[name=email]', email);
await p2.fill('input[name=password]', "test-pass-1234");
await p2.click("button:has-text('Continue')");
await p2.waitForSelector('input[name=name]');
const slug = `e2e${Date.now().toString(36)}`;
await p2.fill('input[name=name]', "E2E Realty");
await p2.fill('input[name=slug]', slug);
await p2.click("button:has-text('Create my site')");
await p2.waitForURL(/\/admin\?welcome=1/);
ok(await p2.isVisible("text=Your site is live"), "signup creates site and lands in admin");
const res = await fetch(`http://${slug}.localhost:3100/`);
ok(res.ok && (await res.text()).includes("Find your next property with E2E Realty"), `new site live at ${slug}.localhost:3100`);
await c2.close();

console.log(errs.length ? "page errors:\n" + errs.join("\n") : "no page errors");
await b.close();
