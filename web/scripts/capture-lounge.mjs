// Dev helper: captures the Lounge layout (desktop + mobile) into .impeccable/review/.
import { chromium } from "playwright-core";
import { readdirSync } from "node:fs"; import { homedir } from "node:os";
const out = process.argv[2] ?? ".impeccable/review";
const base = `${homedir()}/Library/Caches/ms-playwright`; const dir = readdirSync(base).find((d) => d.startsWith("chromium-"));
const b = await chromium.launch({ executablePath: `${base}/${dir}/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing` });
const S = "http://demo.localhost:3100";
const errors = [];
// Canned concierge reply in the AI SDK UI-stream format, so the conversation state can be captured without an API key.
const reply = "Here are two off-plan options under AED 2M that fit a 2-bedroom brief:\n- [Marina Vista Residences](/projects/x) — from AED 1.45M, 60/40 plan, handover Q4 2027\n- [Business Bay Lofts](/projects/y) — from AED 890K, 80/20 plan\n\nWould you like floor plans, or shall I arrange a call with an advisor?";
const sse = [{ type: "start" }, { type: "start-step" }, { type: "text-start", id: "t" }, ...reply.match(/.{1,24}/gs).map((d) => ({ type: "text-delta", id: "t", delta: d })), { type: "text-end", id: "t" }, { type: "finish-step" }, { type: "finish" }]
  .map((e) => `data: ${JSON.stringify(e)}\n\n`).join("") + "data: [DONE]\n\n";

async function shot(path, name, { w, h, full = true, act } = {}) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => errors.push(`${name}: ${e.message}`));
  p.on("console", (m) => m.type() === "error" && !/Failed to load resource/.test(m.text()) && errors.push(`${name}: ${m.text()}`));
  await p.route("**/api/chat", (r) => r.fulfill({ status: 200, headers: { "content-type": "text/event-stream", "x-vercel-ai-ui-message-stream": "v1" }, body: sse }));
  await p.goto(S + path, { waitUntil: "networkidle" });
  if (act) await act(p);
  if (full) await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } window.scrollTo(0, 0); });
  await p.waitForTimeout(900);
  await p.screenshot({ path: `${out}/${name}.png`, fullPage: full });
  await ctx.close();
}
const talk = async (p) => { await p.click("text=Best areas to invest"); await p.waitForTimeout(1500); };
for (const [w, h, t] of [[1440, 900, "desktop"], [390, 844, "mobile"]]) {
  await shot("/", `${t}-home`, { w, h, full: false });
  await shot("/", `${t}-home-talking`, { w, h, full: false, act: talk });
  await shot("/about", `${t}-about`, { w, h });
  await shot("/projects", `${t}-projects`, { w, h });
  await shot("/contact", `${t}-contact`, { w, h });
}
await shot("/", "mobile-menu", { w: 390, h: 844, full: false, act: async (p) => { await p.click("button[aria-label='Open menu']"); await p.waitForTimeout(600); } });
console.log(errors.length ? errors.join("\n") : "no page errors");
await b.close();
