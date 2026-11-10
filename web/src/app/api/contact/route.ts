import { headers } from "next/headers";
import { z } from "zod";
import { getTenantBySite } from "@/lib/tenant";
import { supabaseAdmin } from "@/lib/supabase/server";
import { saveLead } from "@/lib/leads";
import { clientHash, LIMITS, minutesAgo } from "@/lib/rate-limit";
import { corsFor, preflight } from "@/lib/cors";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional(),
  interest: z.string().trim().max(500).optional(),
  message: z.string().trim().max(4000).optional(),
  company: z.string().optional(), // honeypot — real users never fill it
});

// Browser preflight for form posts made from an exported copy of the site.
export async function OPTIONS(req: Request) {
  const site = (await headers()).get("x-site");
  return preflight(req, site ? await getTenantBySite(site) : null);
}

export async function POST(req: Request) {
  const h = await headers();
  const site = h.get("x-site");
  const tenant = site ? await getTenantBySite(site) : null;
  if (!tenant) return Response.json({ error: "Unknown site" }, { status: 404 });
  const cors = corsFor(req, tenant);
  if (!cors) return Response.json({ error: "This site is not allowed to send messages" }, { status: 403 });
  const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: cors });

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return reply({ error: "Please check the form fields." }, 400);
  const d = parsed.data;
  if (d.company) return reply({ ok: true }); // bot
  if (!d.email && !d.phone) return reply({ error: "Please add an email or phone number." }, 400);

  const db = supabaseAdmin();
  const client = clientHash(h);
  const { count } = await db.from("leads").select("id", { count: "exact", head: true }).eq("client_hash", client).gte("created_at", minutesAgo(60));
  if ((count ?? 0) >= LIMITS.leadsPerHour) return reply({ error: "We already have your message. An advisor will be in touch shortly." }, 429);

  await saveLead(db, tenant, { ...d, email: d.email || undefined, source: "form", clientHash: client });
  return reply({ ok: true });
}
