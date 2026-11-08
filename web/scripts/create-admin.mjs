#!/usr/bin/env node
// Creates (or reuses) a user and makes them owner of a tenant.
// Usage: node --env-file=.env.local scripts/create-admin.mjs <email> <password> <tenant-slug> [--create "Business Name"]
// In single-tenant (self-hosted) installs this is how the client's first admin is created.
import { createClient } from "@supabase/supabase-js";

const [email, password, slug, flag, name] = process.argv.slice(2);
if (!email || !password || !slug) {
  console.error('Usage: create-admin.mjs <email> <password> <tenant-slug> [--create "Business Name"]');
  process.exit(1);
}
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

let { data: tenant } = await db.from("tenants").select("id,slug").eq("slug", slug).maybeSingle();
if (!tenant && flag === "--create") {
  const res = await db.from("tenants").insert({
    slug, name: name || slug,
    theme: { preset: "luxury-gold" },
    ai_config: { provider: "auto" },
    nav: [{ label: "Projects", href: "/projects" }, { label: "About", href: "/about" }, { label: "Concierge", href: "/concierge" }, { label: "Contact", href: "/contact" }],
  }).select("id,slug").single();
  if (res.error) throw res.error;
  tenant = res.data;
  console.log(`Created tenant "${slug}"`);
}
if (!tenant) {
  console.error(`Tenant "${slug}" not found (pass --create "Business Name" to create it).`);
  process.exit(1);
}

let userId;
const created = await db.auth.admin.createUser({ email, password, email_confirm: true });
if (created.error) {
  if (!/already/i.test(created.error.message)) throw created.error;
  const { data } = await db.auth.admin.listUsers({ perPage: 1000 });
  userId = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())?.id;
  console.log("User already exists — linking it.");
} else userId = created.data.user.id;

const { error } = await db.from("tenant_members").upsert({ tenant_id: tenant.id, user_id: userId, role: "owner" });
if (error) throw error;
console.log(`✓ ${email} is now owner of "${slug}". Sign in at /login`);
