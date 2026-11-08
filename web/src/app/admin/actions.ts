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

export async function signOut() {
  const { db } = await getAdmin();
  await db.auth.signOut();
  redirect("/login");
}

// ───────────── site settings ─────────────
const navSchema = z.array(z.object({ label: z.string().min(1).max(40), href: z.string().min(1).max(300) })).max(10);
const domainRe = /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.[a-z0-9-]{1,63})+$/;

export async function saveSite(_: ActionResult | null, f: FormData): Promise<ActionResult> {
  const { db, tenant } = await getAdmin();
  const nav = navSchema.safeParse(JSON.parse(fd(f, "nav") || "[]"));
  if (!nav.success) return { ok: false, error: "Navigation links need a label and a link." };

  const domains = fd(f, "domains").toLowerCase().split(/[\s,]+/).filter(Boolean);
  const bad = domains.find((d) => !domainRe.test(d));
  if (bad) return { ok: false, error: `"${bad}" is not a valid domain (use e.g. www.example.com).` };
  if (domains.length) {
    const { data: taken } = await supabaseAdmin().from("tenants").select("id").overlaps("domains", domains).neq("id", tenant.id).limit(1);
    if (taken?.length) return { ok: false, error: "One of these domains is already used by another site." };
  }

  const { error } = await db.from("tenants").update({
    name: fd(f, "name") || tenant.name,
    tagline: orNull(fd(f, "tagline")),
    contact: {
      email: fd(f, "email"), phone: fd(f, "phone"), whatsapp: fd(f, "whatsapp").replace(/\D/g, ""),
      address: fd(f, "address"), hours: fd(f, "hours"),
    },
    nav: nav.data,
    domains,
    published: f.get("published") === "on",
  }).eq("id", tenant.id);
  if (error) return { ok: false, error: error.message };

  // Keep the hosting provider in sync (no-op unless VERCEL_* env vars are set).
  const added = domains.filter((d) => !tenant.domains.includes(d));
  const removed = tenant.domains.filter((d) => !domains.includes(d));
  await Promise.all([...added.map(addDomainToHosting), ...removed.map(removeDomainFromHosting)]).catch((e) =>
    console.error("[domains]", e),
  );
  return done();
}

// ───────────── theme ─────────────
export async function saveTheme(theme: ThemeConfig): Promise<ActionResult> {
  const { db, tenant } = await getAdmin();
  const clean = Object.fromEntries(Object.entries(theme).filter(([, v]) => typeof v === "string" && v.length < 500));
  const { error } = await db.from("tenants").update({ theme: clean }).eq("id", tenant.id);
  return error ? { ok: false, error: error.message } : done();
}

// ───────────── AI ─────────────
export async function saveAi(_: ActionResult | null, f: FormData): Promise<ActionResult> {
  const { db, tenant } = await getAdmin();
  const temperature = Math.min(1, Math.max(0, Number(fd(f, "temperature")) || 0.4));
  const { error } = await db.from("tenants").update({
    ai_config: {
      enabled: f.get("enabled") === "on",
      provider: fd(f, "provider") || "auto",
      model: fd(f, "model") || undefined,
      assistantName: fd(f, "assistantName").slice(0, 60),
      greeting: fd(f, "greeting").slice(0, 600),
      instructions: fd(f, "instructions").slice(0, 4000),
      temperature,
      suggestions: fd(f, "suggestions").split("\n").map((x) => x.trim().slice(0, 60)).filter(Boolean).slice(0, 8),
    },
  }).eq("id", tenant.id);
  return error ? { ok: false, error: error.message } : done();
}

// ───────────── pages ─────────────
const slugRe = /^[a-z0-9-]*$/;
const RESERVED = ["projects", "concierge", "admin", "api", "login", "signup", "s"];

export async function createPage(_: ActionResult | null, f: FormData): Promise<ActionResult> {
  const { db, tenant } = await getAdmin();
  const title = fd(f, "title");
  const slug = fd(f, "slug").toLowerCase();
  if (!title) return { ok: false, error: "Title is required." };
  if (!slugRe.test(slug) || RESERVED.includes(slug)) return { ok: false, error: "Use lowercase letters, numbers and dashes; some words are reserved." };
  const { data, error } = await db.from("pages").insert({ tenant_id: tenant.id, title, slug, sections: [] }).select("id").single();
  if (error) return { ok: false, error: error.code === "23505" ? "A page with that URL already exists." : error.message };
  redirect(`/admin/pages/${data.id}`);
}

export async function savePage(id: string, page: { title: string; slug: string; description: string; published: boolean; sections: Section[] }): Promise<ActionResult> {
  const { db, tenant } = await getAdmin();
  const slug = page.slug.toLowerCase();
  if (!slugRe.test(slug) || RESERVED.includes(slug)) return { ok: false, error: "Invalid page URL." };
  if (JSON.stringify(page.sections).length > 200_000) return { ok: false, error: "Page is too large." };
  const { error } = await db.from("pages").update({
    title: page.title.slice(0, 120), slug, description: page.description.slice(0, 300), published: page.published,
    sections: page.sections.map((s) => ({ id: String(s.id), type: String(s.type), props: s.props ?? {} })),
  }).eq("id", id).eq("tenant_id", tenant.id);
  if (error) return { ok: false, error: error.code === "23505" ? "A page with that URL already exists." : error.message };
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

export async function saveProject(_: ActionResult | null, f: FormData): Promise<ActionResult> {
  const { db, tenant } = await getAdmin();
  const id = fd(f, "id");
  const title = fd(f, "title");
  if (!title) return { ok: false, error: "Title is required." };
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
    images: list(fd(f, "images")),
    brochure_url: orNull(fd(f, "brochure_url")),
    featured: f.get("featured") === "on",
    published: f.get("published") === "on",
    sort: Number(fd(f, "sort")) || 0,
  };
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
  const row = { tenant_id: tenant.id, question: fd(f, "question"), answer: fd(f, "answer"), sort: Number(fd(f, "sort")) || 0, published: true };
  if (!row.question || !row.answer) return { ok: false, error: "Question and answer are required." };
  const { error } = id ? await db.from("faqs").update(row).eq("id", id).eq("tenant_id", tenant.id) : await db.from("faqs").insert(row);
  return error ? { ok: false, error: error.message } : done();
}

export async function saveKnowledge(_: ActionResult | null, f: FormData): Promise<ActionResult> {
  const { db, tenant } = await getAdmin();
  const id = fd(f, "id");
  const row = { tenant_id: tenant.id, title: fd(f, "title"), content: fd(f, "content").slice(0, 8000) };
  if (!row.title || !row.content) return { ok: false, error: "Title and content are required." };
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
