// Exercises the chatbot's retrieval + tools against the local database (no LLM needed).
// Run: pnpm exec tsx --conditions=react-server --env-file=.env.local scripts/test-chat-tools.ts
import { createClient } from "@supabase/supabase-js";
import { chatTools } from "../src/lib/ai/tools";
import { buildInstructions, loadCatalogue, retrieveSnippets } from "../src/lib/ai/knowledge";
import type { Tenant } from "../src/lib/types";

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
const assert = (c: unknown, msg: string) => { if (!c) { console.error("✗", msg); process.exitCode = 1; } else console.log("✓", msg); };

const { data: tenant } = await db.from("tenants").select("*").eq("slug", "demo").single<Tenant>();
const { data: other } = await db.from("tenants").select("id").eq("slug", "skyline").single();
const sessionId = crypto.randomUUID();
await db.from("chat_sessions").insert({ id: sessionId, tenant_id: tenant!.id });
const tools = chatTools(db, tenant!, sessionId);
const ctx = { toolCallId: "t1", messages: [] } as never;

const r1 = (await tools.searchProjects.execute!({ maxPrice: 2_000_000, status: "off-plan", bedrooms: "2" }, ctx)) as { results: string[] };
assert(r1.results.length === 1 && r1.results[0].includes("Marina Vista"), `search 2BR off-plan ≤2M → ${r1.results.map((r) => r.split(" [")[0]).join(", ")}`);

const r2 = (await tools.searchProjects.execute!({ query: "palm villa" }, ctx)) as { results: string[] };
assert(r2.results.some((r) => r.includes("Palm Crescent")), "full-text search 'palm villa' finds Palm Crescent Villas");

const r3 = (await tools.searchProjects.execute!({ query: "Hills Park" }, ctx)) as { results: string[] };
assert(!r3.results.some((r) => r.includes("Hills Park Villa")), `search never returns another tenant's projects (got: ${r3.results.map((r) => r.split(" [")[0]).join(", ") || "none"})`);

const noContact = (await tools.captureLead.execute!({ name: "Sam" }, ctx)) as { saved: boolean };
assert(!noContact.saved, "captureLead refuses without phone/email");

const lead = (await tools.captureLead.execute!({ name: "Sam Tester", phone: "+44 7700 900000", interest: "Marina Vista 2BR" }, ctx)) as { saved: boolean; whatsapp: string };
assert(lead.saved && lead.whatsapp.startsWith("https://wa.me/971500000000"), "captureLead saves and returns WhatsApp link");
const { data: saved } = await db.from("leads").select("tenant_id,source,session_id").eq("session_id", sessionId).single();
assert(saved?.tenant_id === tenant!.id && saved?.source === "chat", "lead stored for the right tenant with source=chat");

const snippets = await retrieveSnippets(db, tenant!.id, "what are the fees for buying?");
assert(snippets.some((s) => /fee/i.test(s)), `FAQ/knowledge retrieval for 'fees' → ${snippets.length} snippets`);

const cat = await loadCatalogue(db, tenant!.id);
const prompt = buildInstructions(tenant!, cat, snippets);
assert(prompt.includes("Aurelia Concierge") && prompt.includes("Marina Vista") && !prompt.includes("Hills Park"), "system prompt has persona + own inventory only");
assert(other && cat.every((p) => p.tenant_id === tenant!.id), "catalogue is tenant-scoped");

await db.from("chat_sessions").delete().eq("id", sessionId);
await db.from("leads").delete().eq("session_id", sessionId);
