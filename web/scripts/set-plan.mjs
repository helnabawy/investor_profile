#!/usr/bin/env node
// Changes a site's plan. Plans can only be changed with the service role, so until billing
// exists this is how the operator upgrades or downgrades a client.
// Usage: node --env-file=.env.local scripts/set-plan.mjs <tenant-slug> <free|solo|team>
import { createClient } from "@supabase/supabase-js";

const [slug, plan] = process.argv.slice(2);
if (!slug || !["free", "solo", "team"].includes(plan)) {
  console.error("Usage: set-plan.mjs <tenant-slug> <free|solo|team>");
  process.exit(1);
}
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data, error } = await db.from("tenants").update({ plan }).eq("slug", slug).select("slug,plan,domains");
if (error) throw error;
if (!data.length) {
  console.error(`Tenant "${slug}" not found.`);
  process.exit(1);
}
console.log(`✓ "${slug}" is now on the ${plan} plan.`);
if (plan === "free" && data[0].domains.length) {
  console.log(`  Note: its custom domains (${data[0].domains.join(", ")}) stay saved but are no longer served.`);
}
