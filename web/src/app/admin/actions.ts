"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ADMIN_TENANT_COOKIE, getAdmin } from "@/lib/admin/context";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { Section } from "@/lib/sections/registry";
import type { ThemeConfig } from "@/lib/theme";
import { addDomainToHosting, removeDomainFromHosting } from "@/lib/domains";
import { tenantPlan } from "@/lib/tenant";
import { cleanPriceGrowth } from "@/lib/price-growth";
import { adminT } from "@/lib/i18n/admin-server";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { translateToArabic, TRANSLATE_LIMITS } from "@/lib/ai/translate";

export type ActionResult = { ok: boolean; error?: string; id?: string };

const fd = (f: FormData, k: string) => {
  const v = f.get(k);
  return typeof v === "string" ? v.trim() : "";
};
const orNull = (v: string) => v || null;

function done(path = "/admin"): ActionResult {
  revalidatePath(path, "layout");
  return { ok: true };
}

export async function switchTenant(tenantId: string) {
  const { sites } = await getAdmin();
  if (sites.some((s) => s.tenant.id === tenantId)) {
    (await cookies()).set(ADMIN_TENANT_COOKIE, tenantId, { path: "/", httpOnly: true, sameSite: "lax" });
  }
  redirect("/admin");
}

/** The admin's interface language, kept in a cookie the proxy reads (see src/proxy.ts). */
export async function setUiLanguage(locale: string) {
  (await cookies()).set("ui_lang", isLocale(locale) ? locale : "en", { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/admin", "layout");
}

// ───────────── Arabic translation ─────────────
// A short window per site, so one open tab cannot run up the AI bill.
const translateCalls = new Map<string, number[]>();

/** Translates the agent's English text to Arabic with the site's AI provider. Keys come back unchanged. */
export async function translateFields(texts: Record<string, string>): Promise<{ ok: boolean; map?: Record<string, string>; error?: "no-provider" | "too-much" | "rate" | "failed" }> {
  const { tenant } = await getAdmin();
  const entries = Object.entries(texts ?? {}).filter(([k, v]) => typeof k === "string" && typeof v === "string" && v.trim());
  const chars = entries.reduce((n, [, v]) => n + v.length, 0);
  if (entries.length > TRANSLATE_LIMITS.strings || chars > TRANSLATE_LIMITS.chars || entries.some(([, v]) => v.length > TRANSLATE_LIMITS.perString)) {
    return { ok: false, error: "too-much" };
  }
  if (!entries.length) return { ok: true, map: {} };
  const now = Date.now();
  const recent = (translateCalls.get(tenant.id) ?? []).filter((t) => now - t < 60_000);
  if (recent.length >= 10) return { ok: false, error: "rate" };
  translateCalls.set(tenant.id, [...recent, now]);
  try {
    return { ok: true, map: await translateToArabic(tenant.ai_config ?? {}, Object.fromEntries(entries)) };
  } catch (e) {
    console.error("[translate]", e);
    return { ok: false, error: (e as Error)?.message === "no-provider" ? "no-provider" : "failed" };
  }
}

export async function signOut() {
  const { db } = await getAdmin();
  await db.auth.signOut();
  redirect("/login");
}

// ───────────── site settings ─────────────
const navSchema = z.array(z.object({ label: z.string().min(1).max(40), label_ar: z.string().max(40).optional(), href: z.string().min(1).max(300) })).max(10);
const domainRe = /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.[a-z0-9-]{1,63})+$/;

export async function saveSite(_: ActionResult | null, f: FormData): Promise<ActionResult> {
  const { db, tenant } = await getAdmin();
  const { t } = await adminT();
  const nav = navSchema.safeParse(JSON.parse(fd(f, "nav") || "[]"));
  if (!nav.success) return { ok: false, error: t.errors.nav };

  // Custom domains need a plan that includes them; otherwise the saved list is left as it is.
  const domains = tenantPlan(tenant).customDomain
    ? fd(f, "domains").toLowerCase().split(/[\s,]+/).filter(Boolean)
    : tenant.domains;
  const bad = domains.find((d) => !domainRe.test(d));
  if (bad) return { ok: false, error: t.errors.badDomain(bad) };
  if (domains.length) {
    const { data: taken } = await supabaseAdmin().from("tenants").select("id").overlaps("domains", domains).neq("id", tenant.id).limit(1);
    if (taken?.length) return { ok: false, error: t.errors.domainTaken };
  }

  // Languages: the main one, plus the other when both are on.
  const defaultLocale: Locale = isLocale(fd(f, "default_locale")) ? (fd(f, "default_locale") as Locale) : "en";
  const locales: Locale[] = f.get("both_locales") === "on" ? ["en", "ar"] : [defaultLocale];

  const { error } = await db.from("tenants").update({
    name: fd(f, "name") || tenant.name,
    name_ar: orNull(fd(f, "name_ar")),
    tagline: orNull(fd(f, "tagline")),
    tagline_ar: orNull(fd(f, "tagline_ar")),
    default_locale: defaultLocale,
    locales,
    contact: {
      ...tenant.contact, // keeps anything this form does not edit (socials)
      email: fd(f, "email"), phone: fd(f, "phone"), whatsapp: fd(f, "whatsapp").replace(/\D/g, ""),
      address: fd(f, "address"), address_ar: fd(f, "address_ar"), hours: fd(f, "hours"), hours_ar: fd(f, "hours_ar"),
    },
    nav: nav.data.map((n) => ({ label: n.label, ...(n.label_ar?.trim() ? { label_ar: n.label_ar.trim() } : {}), href: n.href })),
    domains,
    published: f.get("published") === "on",
  }).eq("id", tenant.id);
  if (error) return { ok: false, error: error.message };

  // Keep the hosting provider in sync (no-op unless Cloudflare or Vercel env vars are set; see lib/domains.ts).
  const added = domains.filter((d) => !tenant.domains.includes(d));
  const removed = tenant.domains.filter((d) => !domains.includes(d));
  await Promise.all([...added.map(addDomainToHosting), ...removed.map(removeDomainFromHosting)]).catch((e) =>
    console.error("[domains]", e),
  );
  return done();
}

// ───────────── theme ─────────────
const cleanTheme = (theme: ThemeConfig) =>
  Object.fromEntries(Object.entries(theme).filter(([, v]) => typeof v === "string" && v.length < 500));

/** Publishes a theme straight to the live site and drops any draft. */
export async function saveTheme(theme: ThemeConfig): Promise<ActionResult> {
  const { db, tenant } = await getAdmin();
  const { error } = await db.from("tenants").update({ theme: cleanTheme(theme) }).eq("id", tenant.id);
  if (error) return { ok: false, error: error.message };
  await db.from("theme_drafts").delete().eq("tenant_id", tenant.id);
  return done();
}

/** Stores the theme as an unpublished draft and opens the preview screen on the agent's own site. */
export async function previewTheme(theme: ThemeConfig): Promise<ActionResult> {
  const { db, tenant } = await getAdmin();
  const { error } = await db.from("theme_drafts").upsert({ tenant_id: tenant.id, theme: cleanTheme(theme) });
  if (error) return { ok: false, error: error.message };
  redirect("/admin/preview");
}

export async function publishDraft() {
  const { db, tenant } = await getAdmin();
  const { data } = await db.from("theme_drafts").select("theme").eq("tenant_id", tenant.id).maybeSingle();
  if (data) {
    const { error } = await db.from("tenants").update({ theme: data.theme }).eq("id", tenant.id);
    if (error) throw new Error(error.message);
    await db.from("theme_drafts").delete().eq("tenant_id", tenant.id);
  }
  revalidatePath("/", "layout");
  redirect("/admin/theme?published=1");
}

export async function discardDraft() {
  const { db, tenant } = await getAdmin();
  await db.from("theme_drafts").delete().eq("tenant_id", tenant.id);
  redirect("/admin/theme");
}

// ───────────── AI ─────────────
const lines = (v: string) => v.split("\n").map((x) => x.trim().slice(0, 60)).filter(Boolean).slice(0, 8);

export async function saveAi(_: ActionResult | null, f: FormData): Promise<ActionResult> {
  const { db, tenant } = await getAdmin();
  const temperature = Math.min(1, Math.max(0, Number(fd(f, "temperature")) || 0.4));
  const { error } = await db.from("tenants").update({
    ai_config: {
      enabled: f.get("enabled") === "on",
      provider: fd(f, "provider") || "auto",
      model: fd(f, "model") || undefined,
      assistantName: fd(f, "assistantName").slice(0, 60),
      assistantName_ar: fd(f, "assistantName_ar").slice(0, 60),
      greeting: fd(f, "greeting").slice(0, 600),
      greeting_ar: fd(f, "greeting_ar").slice(0, 600),
      instructions: fd(f, "instructions").slice(0, 4000),
      temperature,
      suggestions: lines(fd(f, "suggestions")),
      suggestions_ar: lines(fd(f, "suggestions_ar")),
    },
  }).eq("id", tenant.id);
  return error ? { ok: false, error: error.message } : done();
}

// ───────────── pages ─────────────
const slugRe = /^[a-z0-9-]*$/;
// "ar" and "en" are language prefixes (/ar/projects), so no page may take them.
const RESERVED = ["projects", "concierge", "admin", "api", "login", "signup", "s", "ar", "en"];

export async function createPage(_: ActionResult | null, f: FormData): Promise<ActionResult> {
  const { db, tenant } = await getAdmin();
  const title = fd(f, "title");
  const slug = fd(f, "slug").toLowerCase();
  const { t } = await adminT();
  if (!title) return { ok: false, error: t.errors.titleRequired };
  if (!slugRe.test(slug) || RESERVED.includes(slug)) return { ok: false, error: t.errors.badSlug };
  const { data, error } = await db.from("pages").insert({ tenant_id: tenant.id, title, title_ar: orNull(fd(f, "title_ar")), slug, sections: [] }).select("id").single();
  if (error) return { ok: false, error: error.code === "23505" ? t.errors.slugTaken : error.message };
  redirect(`/admin/pages/${data.id}`);
}

export async function savePage(id: string, page: { title: string; title_ar: string; slug: string; description: string; description_ar: string; published: boolean; sections: Section[] }): Promise<ActionResult> {
  const { db, tenant } = await getAdmin();
  const { t } = await adminT();
  const slug = page.slug.toLowerCase();
  if (!slugRe.test(slug) || RESERVED.includes(slug)) return { ok: false, error: t.errors.invalidUrl };
  if (JSON.stringify(page.sections).length > 300_000) return { ok: false, error: t.errors.pageTooLarge };
  const { error } = await db.from("pages").update({
    title: page.title.slice(0, 120), title_ar: page.title_ar?.trim().slice(0, 120) || null, slug,
    description: page.description.slice(0, 300), description_ar: page.description_ar?.trim().slice(0, 300) || null, published: page.published,
    sections: page.sections.map((s) => ({ id: String(s.id), type: String(s.type), props: s.props ?? {} })),
  }).eq("id", id).eq("tenant_id", tenant.id);
  if (error) return { ok: false, error: error.code === "23505" ? t.errors.slugTaken : error.message };
  return done();
}

export async function deletePage(id: string) {
  const { db, tenant } = await getAdmin();
  await db.from("pages").delete().eq("id", id).eq("tenant_id", tenant.id);
  revalidatePath("/admin", "layout");
  redirect("/admin/pages");
}

// ───────────── projects ─────────────
const list = (v: string) => v.split("\n").map((s) => s.trim()).filter(Boolean);

function readGrowth(json: string) {
  if (!json) return null;
  try { return cleanPriceGrowth(JSON.parse(json)); } catch { return null; }
}

export async function saveProject(_: ActionResult | null, f: FormData): Promise<ActionResult> {
  const { db, tenant } = await getAdmin();
  const id = fd(f, "id");
  const title = fd(f, "title");
  const { t } = await adminT();
  if (!title) return { ok: false, error: t.errors.titleRequired };
  const price = fd(f, "price_from").replace(/[^\d.]/g, "");
  const status = fd(f, "status");
  const row = {
    tenant_id: tenant.id,
    title,
    developer: orNull(fd(f, "developer")),
    area: orNull(fd(f, "area")),
    city: orNull(fd(f, "city")),
    property_type: orNull(fd(f, "property_type")),
    status: ["off-plan", "ready", "sold-out"].includes(status) ? status : "off-plan",
    bedrooms: orNull(fd(f, "bedrooms")),
    price_from: price ? Number(price) : null,
    currency: fd(f, "currency") || "AED",
    handover: orNull(fd(f, "handover")),
    payment_plan: orNull(fd(f, "payment_plan")),
    roi: orNull(fd(f, "roi")),
    description: orNull(fd(f, "description")),
    amenities: list(fd(f, "amenities")),
    title_ar: orNull(fd(f, "title_ar")),
    developer_ar: orNull(fd(f, "developer_ar")),
    area_ar: orNull(fd(f, "area_ar")),
    city_ar: orNull(fd(f, "city_ar")),
    property_type_ar: orNull(fd(f, "property_type_ar")),
    bedrooms_ar: orNull(fd(f, "bedrooms_ar")),
    handover_ar: orNull(fd(f, "handover_ar")),
    payment_plan_ar: orNull(fd(f, "payment_plan_ar")),
    roi_ar: orNull(fd(f, "roi_ar")),
    description_ar: orNull(fd(f, "description_ar")),
    amenities_ar: list(fd(f, "amenities_ar")),
    images: list(fd(f, "images")),
    brochure_url: orNull(fd(f, "brochure_url")),
    price_growth: readGrowth(fd(f, "price_growth")),
    for_sale: f.get("for_sale") === "on",
    featured: f.get("featured") === "on",
    published: f.get("published") === "on",
    sort: Number(fd(f, "sort")) || 0,
  };
  const max = tenantPlan(tenant).maxProjects;
  if (!id && max !== null) {
    const { count } = await db.from("projects").select("id", { count: "exact", head: true }).eq("tenant_id", tenant.id);
    if ((count ?? 0) >= max) return { ok: false, error: t.errors.planProjects(max) };
  }
  const q = id ? db.from("projects").update(row).eq("id", id).eq("tenant_id", tenant.id) : db.from("projects").insert(row);
  const { error } = await q;
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin", "layout");
  redirect("/admin/projects");
}

export async function deleteProject(id: string) {
  const { db, tenant } = await getAdmin();
  await db.from("projects").delete().eq("id", id).eq("tenant_id", tenant.id);
  revalidatePath("/admin", "layout");
  redirect("/admin/projects");
}

// ───────────── FAQ & knowledge ─────────────
export async function saveFaq(_: ActionResult | null, f: FormData): Promise<ActionResult> {
  const { db, tenant } = await getAdmin();
  const id = fd(f, "id");
  const row = {
    tenant_id: tenant.id, question: fd(f, "question"), answer: fd(f, "answer"),
    question_ar: orNull(fd(f, "question_ar")), answer_ar: orNull(fd(f, "answer_ar")),
    sort: Number(fd(f, "sort")) || 0, published: true,
  };
  if (!row.question || !row.answer) return { ok: false, error: (await adminT()).t.errors.faqRequired };
  const { error } = id ? await db.from("faqs").update(row).eq("id", id).eq("tenant_id", tenant.id) : await db.from("faqs").insert(row);
  return error ? { ok: false, error: error.message } : done();
}

export async function saveKnowledge(_: ActionResult | null, f: FormData): Promise<ActionResult> {
  const { db, tenant } = await getAdmin();
  const id = fd(f, "id");
  const row = { tenant_id: tenant.id, title: fd(f, "title"), content: fd(f, "content").slice(0, 8000) };
  if (!row.title || !row.content) return { ok: false, error: (await adminT()).t.errors.noteRequired };
  const { error } = id ? await db.from("knowledge").update(row).eq("id", id).eq("tenant_id", tenant.id) : await db.from("knowledge").insert(row);
  return error ? { ok: false, error: error.message } : done();
}

export async function deleteRow(table: "faqs" | "knowledge", id: string) {
  const { db, tenant } = await getAdmin();
  if (table !== "faqs" && table !== "knowledge") return;
  await db.from(table).delete().eq("id", id).eq("tenant_id", tenant.id);
  revalidatePath("/admin", "layout");
}

// ───────────── leads ─────────────
export async function setLeadStatus(id: string, status: string) {
  const { db, tenant } = await getAdmin();
  if (!["new", "contacted", "qualified", "closed"].includes(status)) return;
  await db.from("leads").update({ status }).eq("id", id).eq("tenant_id", tenant.id);
  revalidatePath("/admin/leads");
}
