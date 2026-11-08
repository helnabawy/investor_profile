import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Faq, Project, Tenant } from "../types";
import { PROJECT_COLUMNS } from "../types";
import { formatPrice } from "../format";

// Retrieval uses Postgres full-text search (no embeddings), so it works with every
// provider — including ones without an embedding API — and costs nothing per query.

const STOP = new Set("a an and are can do for from have how i in is it me my of on or show the to what which with you your".split(" "));

export function toTsQuery(text: string) {
  const words = text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP.has(w))
    .slice(0, 12);
  return words.length ? words.map((w) => `${w}:*`).join(" | ") : null;
}

export function projectSummary(p: Project) {
  return [
    `• ${p.title} [id:${p.id}]`,
    p.area && `area: ${p.area}${p.city ? `, ${p.city}` : ""}`,
    p.developer && `developer: ${p.developer}`,
    p.property_type && `type: ${p.property_type}`,
    `status: ${p.status}`,
    p.bedrooms && `bedrooms: ${p.bedrooms}`,
    `from: ${formatPrice(p.price_from, p.currency)}`,
    p.handover && `handover: ${p.handover}`,
    p.payment_plan && `payment plan: ${p.payment_plan}`,
    p.roi && `yield: ${p.roi}`,
  ]
    .filter(Boolean)
    .join(" | ");
}

/** Compact catalogue of the tenant's inventory, always included in the prompt (cheap for small portfolios). */
export async function loadCatalogue(db: SupabaseClient, tenantId: string, limit = 40) {
  const { data } = await db
    .from("projects")
    .select(PROJECT_COLUMNS)
    .eq("tenant_id", tenantId)
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("sort")
    .limit(limit);
  return (data ?? []) as Project[];
}

/** FAQ + knowledge snippets relevant to the latest question. */
export async function retrieveSnippets(db: SupabaseClient, tenantId: string, question: string) {
  const q = toTsQuery(question);
  if (!q) return [];
  const [faqs, notes] = await Promise.all([
    db.from("faqs").select("question,answer").eq("tenant_id", tenantId).eq("published", true)
      .textSearch("search", q, { config: "simple" }).limit(4),
    db.from("knowledge").select("title,content").eq("tenant_id", tenantId)
      .textSearch("search", q, { config: "simple" }).limit(4),
  ]);
  return [
    ...((faqs.data ?? []) as Pick<Faq, "question" | "answer">[]).map((f) => `Q: ${f.question}\nA: ${f.answer}`),
    ...((notes.data ?? []) as { title: string; content: string }[]).map((n) => `${n.title}: ${n.content}`),
  ];
}

export function buildInstructions(tenant: Tenant, catalogue: Project[], snippets: string[]) {
  const ai = tenant.ai_config ?? {};
  const c = tenant.contact ?? {};
  const name = ai.assistantName || `${tenant.name} Assistant`;
  return `You are ${name}, the AI concierge on the website of ${tenant.name}${tenant.tagline ? ` (${tenant.tagline})` : ""}, a real-estate business.

## How to behave
- Help visitors find suitable properties from THIS business's inventory only. Never invent projects, prices, or facts. If something is not in the data below, say you will check with an advisor.
- Ask short qualifying questions when needed: budget, preferred area, bedrooms, purpose (live / invest), timeline.
- When recommending, mention 1–3 matching projects with their key facts and link them as markdown: [Project title](/projects/<id>).
- Use the searchProjects tool for filtered searches (budget, bedrooms, area, status) when the catalogue below is not enough.
- When the visitor wants a call, viewing, brochure, or more details — or shares contact info — collect at least a name plus phone or email and call captureLead. Confirm once it is saved.
- Keep answers concise (under ~120 words), friendly and professional. Reply in the visitor's language.
- You are not a lawyer or financial advisor; for legal, visa, or mortgage specifics give general info and offer an advisor.
${ai.instructions ? `\n## Business-specific instructions\n${ai.instructions}\n` : ""}
## Contact details
${[c.phone && `Phone: ${c.phone}`, c.email && `Email: ${c.email}`, c.whatsapp && `WhatsApp: +${c.whatsapp.replace(/\D/g, "")}`, c.address && `Office: ${c.address}`, c.hours && `Hours: ${c.hours}`].filter(Boolean).join("\n") || "Use the contact form on the website."}

## Inventory (${catalogue.length} published projects)
${catalogue.map(projectSummary).join("\n") || "No projects published yet."}
${snippets.length ? `\n## Relevant FAQ & notes\n${snippets.join("\n\n")}` : ""}`;
}
