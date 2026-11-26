import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Faq, Project, Tenant } from "../types";
import { PROJECT_COLUMNS } from "../types";
import { growthSummary } from "../price-growth";
import { formatPrice } from "../format";
import type { Locale } from "../i18n/locales";

// Retrieval uses Postgres full-text search (no embeddings), so it works with every
// provider — including ones without an embedding API — and costs nothing per query.

const STOP = new Set([
  ..."a an and are can do for from have how i in is it me my of on or show the to what which with you your".split(" "),
  // Arabic: particles and question words that would otherwise match every row.
  ..."في من على إلى الى عن مع هل ما ماذا كيف كم أي اي هذا هذه ذلك التي الذي أو او و ال لي لك عندكم ممكن أريد اريد".split(" "),
]);

export function toTsQuery(text: string) {
  const words = text
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP.has(w))
    .slice(0, 12);
  return words.length ? words.map((w) => `${w}:*`).join(" | ") : null;
}

export function projectSummary(p: Project) {
  return [
    `• ${p.title}${p.title_ar ? ` (Arabic: ${p.title_ar})` : ""} [id:${p.id}]`,
    p.area && `area: ${p.area}${p.city ? `, ${p.city}` : ""}${p.area_ar ? ` (Arabic: ${p.area_ar})` : ""}`,
    p.developer && `developer: ${p.developer}`,
    p.property_type && `type: ${p.property_type}`,
    `status: ${p.status}`,
    p.bedrooms && `bedrooms: ${p.bedrooms}`,
    `from: ${formatPrice(p.price_from, p.currency)}`,
    p.handover && `handover: ${p.handover}`,
    p.payment_plan && `payment plan: ${p.payment_plan}`,
    p.payment_plan_ar && `payment plan (Arabic): ${p.payment_plan_ar}`,
    p.roi && `yield: ${p.roi}`,
    p.for_sale && "available for sale now",
    growthSummary(p.price_growth, p.currency),
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
    db.from("faqs").select("question,answer,question_ar,answer_ar").eq("tenant_id", tenantId).eq("published", true)
      .textSearch("search", q, { config: "simple" }).limit(4),
    db.from("knowledge").select("title,content").eq("tenant_id", tenantId)
      .textSearch("search", q, { config: "simple" }).limit(4),
  ]);
  return [
    ...((faqs.data ?? []) as Pick<Faq, "question" | "answer" | "question_ar" | "answer_ar">[]).map((f) =>
      `Q: ${f.question}\nA: ${f.answer}` + (f.question_ar && f.answer_ar ? `\nس: ${f.question_ar}\nج: ${f.answer_ar}` : "")),
    ...((notes.data ?? []) as { title: string; content: string }[]).map((n) => `${n.title}: ${n.content}`),
  ];
}

/** `tenant` is the stored row, with both languages; `locale` is the language of the visitor's page. */
export function buildInstructions(tenant: Tenant, catalogue: Project[], snippets: string[], locale: Locale = "en") {
  const ai = tenant.ai_config ?? {};
  const c = tenant.contact ?? {};
  const ar = locale === "ar";
  const name = (ar && ai.assistantName_ar) || ai.assistantName || (ar ? `مساعد ${tenant.name_ar || tenant.name}` : `${tenant.name} Assistant`);
  const language = ar
    ? `- The visitor is on the Arabic version of the site. Reply in Arabic (clear Modern Standard Arabic, as Gulf property advisors write it) unless they write to you in another language; then reply in theirs. Keep prices, numbers, project names in Latin script where they have no Arabic name, and links exactly as given. Use the Arabic names in the inventory when they exist.`
    : `- The visitor is on the English version of the site. Reply in English unless they write in another language; then reply in theirs (Arabic names in the inventory help when they write in Arabic).`;
  return `You are ${name}, the AI concierge on the website of ${tenant.name}${tenant.name_ar ? ` (in Arabic: ${tenant.name_ar})` : ""}${tenant.tagline ? ` (${tenant.tagline})` : ""}, a real-estate business.

## How to behave
- Answer questions about real-estate projects across the UAE, including projects outside this business's inventory and outside Dubai.
- Treat the inventory below as the only source for properties this business actually lists. You may discuss other UAE projects using your general knowledge, but clearly distinguish that information from this business's listings.
- Never invent projects, prices, availability, or facts. For details not in the inventory or relevant notes, answer only what you know with confidence, explain when information may be out of date, and recommend verifying current details with the developer or an advisor.
- Ask short qualifying questions when needed: budget, preferred area, bedrooms, purpose (live / invest), timeline.
- For any project recommendation, first use the searchProjects tool to check this profile's published inventory, even when the inventory below seems sufficient. Mention matching profile projects first (1–3), with key facts and links as markdown: [Project title](/projects/<id>).
- If the visitor asks for broader UAE options, or no profile projects match, then mention suitable projects across the UAE that you know from general knowledge. Clearly label these as not listed in this profile and not live-verified; never imply you performed a live UAE-wide search.
- When the visitor wants a call, viewing, brochure, or more details — or shares contact info — collect at least a name plus phone or email and call captureLead. Confirm once it is saved.
- Keep answers concise (under ~120 words), friendly and professional.
${language}
- You are not a lawyer or financial advisor; for legal, visa, or mortgage specifics give general info and offer an advisor.
${ai.instructions ? `\n## Business-specific instructions\n${ai.instructions}\n` : ""}
## Contact details
${[c.phone && `Phone: ${c.phone}`, c.email && `Email: ${c.email}`, c.whatsapp && `WhatsApp: +${c.whatsapp.replace(/\D/g, "")}`, c.address && `Office: ${c.address}`, c.hours && `Hours: ${c.hours}`].filter(Boolean).join("\n") || "Use the contact form on the website."}

## Inventory (${catalogue.length} published projects)
${catalogue.map(projectSummary).join("\n") || "No projects published yet."}
${snippets.length ? `\n## Relevant FAQ & notes\n${snippets.join("\n\n")}` : ""}`;
}
