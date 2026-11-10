import { headers } from "next/headers";
import {
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
  type ModelMessage,
  type UIMessage,
} from "ai";
import type { LanguageModelV4 } from "@ai-sdk/provider";
import { getTenantBySite, tenantPlan } from "@/lib/tenant";
import { supabaseAdmin } from "@/lib/supabase/server";
import { resolveModels } from "@/lib/ai/config";
import { fallbackModel } from "@/lib/ai/fallback";
import { buildInstructions, loadCatalogue, retrieveSnippets } from "@/lib/ai/knowledge";
import { chatTools } from "@/lib/ai/tools";
import { clientHash, LIMITS, minutesAgo } from "@/lib/rate-limit";
import { corsFor, preflight } from "@/lib/cors";

export const maxDuration = 30;

const MAX_HISTORY = 20;
const MAX_INPUT_CHARS = 2000;

const json = (status: number, error: string, headers?: HeadersInit) => Response.json({ error }, { status, headers });

// Browser preflight for chat calls made from an exported copy of the site.
export async function OPTIONS(req: Request) {
  const site = (await headers()).get("x-site");
  return preflight(req, site ? await getTenantBySite(site) : null);
}

export async function POST(req: Request) {
  const h = await headers();
  const site = h.get("x-site");
  if (!site) return json(400, "Unknown site");
  const tenant = await getTenantBySite(site);
  if (!tenant || tenant.ai_config?.enabled === false) return json(404, "Chat is not available");
  const cors = corsFor(req, tenant);
  if (!cors) return json(403, "This site is not allowed to use the concierge");

  // Only the visitor's newest message is taken from the request. Earlier turns come from our own
  // chat_messages table, so a client cannot inflate the prompt or forge assistant replies.
  const body = (await req.json().catch(() => null)) as { messages?: UIMessage[]; sessionId?: string } | null;
  const last = body?.messages?.at(-1);
  const lastText = last?.parts?.map((p) => (p.type === "text" ? p.text : "")).join("").trim() ?? "";
  if (!last || last.role !== "user" || !lastText) return json(400, "No message", cors);
  if (lastText.length > MAX_INPUT_CHARS) return json(413, "Message too long", cors);

  const db = supabaseAdmin();
  const client = clientHash(h);

  // Rate limits: per visitor (survives session rotation), per tenant per day, per session burst.
  const [{ count: recent }, { count: today }] = await Promise.all([
    db.from("chat_messages").select("id", { count: "exact", head: true }).eq("client_hash", client).eq("role", "user").gte("created_at", minutesAgo(10)),
    db.from("chat_messages").select("id", { count: "exact", head: true }).eq("client_hash", client).eq("role", "user").gte("created_at", minutesAgo(24 * 60)),
  ]);
  if ((recent ?? 0) >= LIMITS.chatPer10Min || (today ?? 0) >= LIMITS.chatPerDay) {
    return json(429, "You've sent a lot of messages. Please use the contact form and an advisor will reply.", cors);
  }

  const since = new Date(Date.now() - 86_400_000).toISOString();
  const { count: daily } = await db.from("chat_messages").select("id", { count: "exact", head: true })
    .eq("tenant_id", tenant.id).eq("role", "user").gte("created_at", since);
  if ((daily ?? 0) >= tenantPlan(tenant).dailyChat) {
    return json(429, "The concierge is busy right now. Please use the contact form and we'll reply shortly.", cors);
  }

  const sessionId = await ensureSession(db, tenant.id, body?.sessionId);
  const { count: burst } = await db.from("chat_messages").select("id", { count: "exact", head: true })
    .eq("session_id", sessionId).eq("role", "user").gte("created_at", new Date(Date.now() - 60_000).toISOString());
  if ((burst ?? 0) >= 8) return json(429, "You're sending messages quickly — please wait a moment.", cors);

  const models = resolveModels(tenant.ai_config ?? {});
  if (!models.length) return json(503, "No AI provider configured. Set GOOGLE_GENERATIVE_AI_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY or ANTHROPIC_API_KEY.", cors);

  const [{ data: past }, catalogue, snippets] = await Promise.all([
    db.from("chat_messages").select("role,content").eq("session_id", sessionId).order("created_at", { ascending: false }).limit(MAX_HISTORY - 1),
    loadCatalogue(db, tenant.id),
    retrieveSnippets(db, tenant.id, lastText),
  ]);
  const history: ModelMessage[] = [
    ...((past ?? []) as { role: "user" | "assistant"; content: string }[]).reverse().map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: lastText },
  ];
  await db.from("chat_messages").insert({ session_id: sessionId, tenant_id: tenant.id, role: "user", content: lastText, client_hash: client });

  const result = streamText({
    model: fallbackModel(models.map((m) => m.model as LanguageModelV4)),
    instructions: buildInstructions(tenant, catalogue, snippets),
    messages: history,
    tools: chatTools(db, tenant, sessionId),
    stopWhen: isStepCount(4),
    temperature: tenant.ai_config?.temperature ?? 0.4,
    maxOutputTokens: 600,
    onEnd: async ({ text }) => {
      if (!text?.trim()) return;
      await db.from("chat_messages").insert({ session_id: sessionId, tenant_id: tenant.id, role: "assistant", content: text });
      await db.from("chat_sessions").update({ updated_at: new Date().toISOString() }).eq("id", sessionId);
    },
    onError: ({ error }) => console.error("[chat] stream error", error),
  });

  return createUIMessageStreamResponse({ stream: toUIMessageStream({ stream: result.stream }), headers: cors });
}

// The widget generates the session id (kept in localStorage) so it can resume conversations.
async function ensureSession(db: ReturnType<typeof supabaseAdmin>, tenantId: string, id?: string) {
  const valid = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (valid) {
    const { data } = await db.from("chat_sessions").select("id,tenant_id").eq("id", id).maybeSingle();
    if (data?.tenant_id === tenantId) return data.id as string;
    if (!data) {
      const { error } = await db.from("chat_sessions").insert({ id, tenant_id: tenantId });
      if (!error) return id;
    }
  }
  const { data, error } = await db.from("chat_sessions").insert({ tenant_id: tenantId }).select("id").single();
  if (error) throw error;
  return data.id as string;
}
