"use server";
import { redirect } from "next/navigation";
import { supabaseAdmin, supabaseServer } from "@/lib/supabase/server";
import { starterPages, starterTheme, STARTER_NAV } from "@/lib/admin/starter";
import { isMulti } from "@/lib/env";
import { PRESETS } from "@/lib/theme";
import { TEMPLATES, templateFor } from "@/lib/templates";
import { adminT } from "@/lib/i18n/admin-server";

const RESERVED = new Set(["www", "app", "admin", "api", "mail", "help", "support", "blog", "docs", "status", "s"]);

export async function createSite(_: { error?: string } | null, f: FormData): Promise<{ error?: string }> {
  const a = (await adminT()).t.auth;
  if (!isMulti) return { error: a.signupDisabled };
  const user = (await (await supabaseServer()).auth.getUser()).data.user;
  if (!user) return { error: a.signInFirst };

  const name = String(f.get("name") ?? "").trim().slice(0, 80);
  const slug = String(f.get("slug") ?? "").trim().toLowerCase();
  if (!name) return { error: a.nameRequired };
  if (!/^[a-z0-9](-?[a-z0-9])*$/.test(slug) || slug.length < 2 || slug.length > 40 || RESERVED.has(slug)) {
    return { error: a.badAddress };
  }

  // "look" is "<template>:<preset>" from the sign-up form, e.g. "classic:calm-green".
  const [tplRaw, presetRaw] = String(f.get("look") ?? "").split(":");
  const template = TEMPLATES.some((t) => t.id === tplRaw) ? tplRaw : "classic";
  const preset = presetRaw && Object.hasOwn(PRESETS, presetRaw) ? presetRaw : templateFor(template).preset;

  const admin = supabaseAdmin();
  const { data: tenant, error } = await admin.from("tenants").insert({
    slug, name,
    theme: starterTheme(template, preset),
    ai_config: { provider: "auto", assistantName: `${name} Concierge` },
    contact: { email: user.email },
    nav: STARTER_NAV,
  }).select("id").single();
  if (error) return { error: error.code === "23505" ? a.addressTaken : error.message };

  await admin.from("tenant_members").insert({ tenant_id: tenant.id, user_id: user.id, role: "owner" });
  await admin.from("pages").insert(starterPages(name).map((p) => ({ ...p, tenant_id: tenant.id })));
  redirect("/admin?welcome=1");
}
