import "server-only";
import { Resend } from "resend";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Tenant } from "./types";

export type LeadInput = {
  name?: string;
  email?: string;
  phone?: string;
  interest?: string;
  budget?: string;
  message?: string;
  source: "form" | "chat";
  sessionId?: string;
  clientHash?: string;
};

const clip = (v: string | undefined, n = 500) => (v ? v.trim().slice(0, n) || null : null);

export async function saveLead(db: SupabaseClient, tenant: Tenant, input: LeadInput) {
  const row = {
    tenant_id: tenant.id,
    name: clip(input.name, 120),
    email: clip(input.email, 200),
    phone: clip(input.phone, 40),
    interest: clip(input.interest),
    budget: clip(input.budget, 80),
    message: clip(input.message, 4000),
    source: input.source,
    session_id: input.sessionId ?? null,
    client_hash: input.clientHash ?? null,
  };
  const { data, error } = await db.from("leads").insert(row).select("id").single();
  if (error) throw error;
  await notifyAgent(tenant, row).catch((e) => console.error("[leads] notify failed", e));
  return data.id as string;
}

async function notifyAgent(tenant: Tenant, lead: Record<string, unknown>) {
  const to = tenant.contact?.email;
  const key = process.env.RESEND_API_KEY;
  const lines = Object.entries(lead)
    .filter(([k, v]) => v && !["tenant_id", "session_id", "client_hash"].includes(k))
    .map(([k, v]) => `${k}: ${v}`);
  if (!key || !to) {
    console.log(`[leads] new ${lead.source} lead for ${tenant.slug}:\n  ${lines.join("\n  ")}`);
    return;
  }
  await new Resend(key).emails.send({
    from: process.env.LEADS_FROM_EMAIL ?? "EstateSite <leads@resend.dev>",
    to,
    subject: `New ${lead.source} lead — ${lead.name ?? "website visitor"}`,
    text: `You have a new lead from your website.\n\n${lines.join("\n")}`,
  });
}
