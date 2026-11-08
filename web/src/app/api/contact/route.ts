import { headers } from "next/headers";
import { z } from "zod";
import { getTenantBySite } from "@/lib/tenant";
import { supabaseAdmin } from "@/lib/supabase/server";
import { saveLead } from "@/lib/leads";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional(),
  interest: z.string().trim().max(500).optional(),
  message: z.string().trim().max(4000).optional(),
  company: z.string().optional(), // honeypot — real users never fill it
});

export async function POST(req: Request) {
  const site = (await headers()).get("x-site");
  const tenant = site ? await getTenantBySite(site) : null;
  if (!tenant) return Response.json({ error: "Unknown site" }, { status: 404 });

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return Response.json({ error: "Please check the form fields." }, { status: 400 });
  const d = parsed.data;
  if (d.company) return Response.json({ ok: true }); // bot
  if (!d.email && !d.phone) return Response.json({ error: "Please add an email or phone number." }, { status: 400 });

  await saveLead(supabaseAdmin(), tenant, { ...d, email: d.email || undefined, source: "form" });
  return Response.json({ ok: true });
}
