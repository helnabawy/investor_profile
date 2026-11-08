// Dev helper: screenshots key pages. Usage: node scripts/screenshots.mjs <outDir>
import { chromium } from "playwright-core";
import { readdirSync } from "node:fs";
import { homedir } from "node:os";
const out = process.argv[2] ?? ".";
const base = `${homedir()}/Library/Caches/ms-playwright`;
const dir = readdirSync(base).find((d) => d.startsWith("chromium-"));
const browser = await chromium.launch({ executablePath: `${base}/${dir}/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing` });
const errors = [];
async function shot(url, name, { width = 1440, height = 900, full = true, act } = {}) {
  const page = await browser.newPage({ viewport: { width, height } });
  page.on("pageerror", (e) => errors.push(`${name}: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && errors.push(`${name} console: ${m.text()}`));
  await page.goto(url, { waitUntil: "networkidle" });
  if (act) await act(page);
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 80)); } window.scrollTo(0, 0); });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: full });
  await page.close();
}
const site = "http://demo.localhost:3100";
await shot(`${site}/`, "home");
await shot(`${site}/projects`, "projects", { full: false });
const ids = await (await fetch(`${site}/projects`)).text();
const id = ids.match(/\/projects\/([0-9a-f-]{36})/)[1];
await shot(`${site}/projects/${id}`, "project", { full: false });
await shot(`${site}/`, "chat-open", { full: false, act: async (p) => { await p.click('button[aria-label^="Chat with"]'); await p.waitForTimeout(400); } });
await shot(`${site}/`, "mobile", { width: 390, height: 844, full: false });
await shot("http://skyline.localhost:3100/", "skyline", { full: false });
await shot("http://localhost:3100/", "landing", { full: false });
console.log(errors.length ? errors.join("\n") : "no page errors");
await browser.close();
