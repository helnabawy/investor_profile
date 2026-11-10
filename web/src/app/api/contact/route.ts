import { headers } from "next/headers";
import { z } from "zod";
import { getTenantBySite } from "@/lib/tenant";
import { supabaseAdmin } from "@/lib/supabase/server";
import { saveLead } from "@/lib/leads";
import { clientHash, LIMITS, minutesAgo } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional(),
  interest: z.string().trim().max(500).optional(),
  message: z.string().trim().max(4000).optional(),
  company: z.string().optional(), // honeypot — real users never fill it
});

export async function POST(req: Request) {
  const h = await headers();
  const site = h.get("x-site");
  const tenant = site ? await getTenantBySite(site) : null;
  if (!tenant) return Response.json({ error: "Unknown site" }, { status: 404 });

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return Response.json({ error: "Please check the form fields." }, { status: 400 });
  const d = parsed.data;
  if (d.company) return Response.json({ ok: true }); // bot
  if (!d.email && !d.phone) return Response.json({ error: "Please add an email or phone number." }, { status: 400 });

  const db = supabaseAdmin();
  const client = clientHash(h);
  const { count } = await db.from("leads").select("id", { count: "exact", head: true }).eq("client_hash", client).gte("created_at", minutesAgo(60));
  if ((count ?? 0) >= LIMITS.leadsPerHour) return Response.json({ error: "We already have your message. An advisor will be in touch shortly." }, { status: 429 });

  await saveLead(db, tenant, { ...d, email: d.email || undefined, source: "form", clientHash: client });
  return Response.json({ ok: true });
}
