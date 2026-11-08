// Verifies tenant isolation via RLS: a signed-in owner of "skyline" cannot read or change "demo" data.
// Run: pnpm exec tsx --env-file=.env.local scripts/test-rls.mts   (needs scripts/create-admin.mjs users)
import { createClient } from "@supabase/supabase-js";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!, anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const assert = (c: unknown, m: string) => { console.log(c ? "✓" : "✗", m); if (!c) process.exitCode = 1; };
const DEMO = "11111111-1111-1111-1111-111111111111", SKY = "22222222-2222-2222-2222-222222222222";

const sky = createClient(url, anon, { auth: { persistSession: false } });
const { error: e } = await sky.auth.signInWithPassword({ email: "skyline@estatesite.test", password: "demo-pass-123" });
assert(!e, "skyline owner signs in");

const leads = await sky.from("leads").select("id").eq("tenant_id", DEMO);
assert((leads.data ?? []).length === 0, "cannot read another tenant's leads");
const upd = await sky.from("tenants").update({ name: "hacked" }).eq("id", DEMO).select("id");
assert((upd.data ?? []).length === 0, "cannot update another tenant");
const ins = await sky.from("projects").insert({ tenant_id: DEMO, title: "spam" });
assert(!!ins.error, "cannot insert projects into another tenant");
const del = await sky.from("projects").delete().eq("tenant_id", DEMO).select("id");
assert((del.data ?? []).length === 0, "cannot delete another tenant's projects");
const up = await sky.storage.from("media").upload(`${DEMO}/x.txt`, new Blob(["x"]), { contentType: "text/plain" });
assert(!!up.error, "cannot upload into another tenant's media folder");
const own = await sky.from("projects").insert({ tenant_id: SKY, title: "RLS test" }).select("id").single();
assert(!own.error, "can write own projects");
if (own.data) await sky.from("projects").delete().eq("id", own.data.id);

const anonDb = createClient(url, anon, { auth: { persistSession: false } });
assert(((await anonDb.from("leads").select("id")).data ?? []).length === 0, "anonymous visitors cannot read leads");
assert(((await anonDb.from("chat_messages").select("id")).data ?? []).length === 0, "anonymous visitors cannot read chats");
assert(((await anonDb.from("knowledge").select("id")).data ?? []).length === 0, "knowledge notes are private");
assert(((await anonDb.from("projects").select("id").eq("tenant_id", DEMO)).data ?? []).length > 0, "published projects are public");
