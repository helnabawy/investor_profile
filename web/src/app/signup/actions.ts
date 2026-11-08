"use server";
import { redirect } from "next/navigation";
import { supabaseAdmin, supabaseServer } from "@/lib/supabase/server";
import { starterPages, starterTheme, STARTER_NAV } from "@/lib/admin/starter";
import { isMulti } from "@/lib/env";

const RESERVED = new Set(["www", "app", "admin", "api", "mail", "help", "support", "blog", "docs", "status", "s"]);

export async function createSite(_: { error?: string } | null, f: FormData): Promise<{ error?: string }> {
  if (!isMulti) return { error: "Sign-up is disabled on this installation." };
  const user = (await (await supabaseServer()).auth.getUser()).data.user;
  if (!user) return { error: "Please sign in first." };

  const name = String(f.get("name") ?? "").trim().slice(0, 80);
  const slug = String(f.get("slug") ?? "").trim().toLowerCase();
  if (!name) return { error: "Business name is required." };
  if (!/^[a-z0-9](-?[a-z0-9])*$/.test(slug) || slug.length < 2 || slug.length > 40 || RESERVED.has(slug)) {
    return { error: "Choose a web address of 2–40 lowercase letters, numbers or dashes." };
  }

  const admin = supabaseAdmin();
  const { data: tenant, error } = await admin.from("tenants").insert({
    slug, name,
    theme: starterTheme(String(f.get("preset") ?? "luxury-gold")),
    ai_config: { provider: "auto", assistantName: `${name} Concierge` },
    contact: { email: user.email },
    nav: STARTER_NAV,
  }).select("id").single();
  if (error) return { error: error.code === "23505" ? "That web address is taken — try another." : error.message };

  await admin.from("tenant_members").insert({ tenant_id: tenant.id, user_id: user.id, role: "owner" });
  await admin.from("pages").insert(starterPages(name).map((p) => ({ ...p, tenant_id: tenant.id })));
  redirect("/admin?welcome=1");
}
