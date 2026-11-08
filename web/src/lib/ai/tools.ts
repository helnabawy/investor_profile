import "server-only";
import { tool } from "ai";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Project, Tenant } from "../types";
import { PROJECT_COLUMNS } from "../types";
import { projectSummary, toTsQuery } from "./knowledge";
import { saveLead } from "../leads";
import { whatsappLink } from "../format";

export function chatTools(db: SupabaseClient, tenant: Tenant, sessionId: string) {
  return {
    searchProjects: tool({
      description: "Search this business's published property inventory with optional filters.",
      inputSchema: z.object({
        query: z.string().optional().describe("Free text, e.g. area, developer, or property type"),
        maxPrice: z.number().optional().describe("Maximum starting price in the listing currency"),
        minPrice: z.number().optional(),
        status: z.enum(["off-plan", "ready"]).optional(),
        bedrooms: z.string().optional().describe('e.g. "2" or "studio"'),
      }),
      execute: async ({ query, maxPrice, minPrice, status, bedrooms }) => {
        let q = db.from("projects").select(PROJECT_COLUMNS).eq("tenant_id", tenant.id).eq("published", true);
        if (maxPrice) q = q.lte("price_from", maxPrice);
        if (minPrice) q = q.gte("price_from", minPrice);
        if (status) q = q.eq("status", status);
        if (bedrooms) q = q.ilike("bedrooms", `%${bedrooms.replace(/[%_,()]/g, "")}%`);
        const ts = query ? toTsQuery(query) : null;
        if (ts) q = q.textSearch("search", ts, { config: "simple" });
        const { data, error } = await q.order("price_from").limit(6);
        if (error) return { error: "Search failed" };
        const rows = (data ?? []) as Project[];
        return { count: rows.length, results: rows.map(projectSummary) };
      },
    }),
    captureLead: tool({
      description: "Save the visitor's contact details so an advisor can follow up. Requires a name and a phone or email.",
      inputSchema: z.object({
        name: z.string().min(1),
        phone: z.string().optional(),
        email: z.string().optional(),
        interest: z.string().optional().describe("Projects / areas / property type they are interested in"),
        budget: z.string().optional(),
        notes: z.string().optional().describe("Anything else useful: timeline, purpose, preferred contact time"),
      }),
      execute: async ({ name, phone, email, interest, budget, notes }) => {
        if (!phone && !email) return { saved: false, reason: "Ask for a phone number or email first." };
        await saveLead(db, tenant, { name, phone, email, interest, budget, message: notes, source: "chat", sessionId });
        return {
          saved: true,
          whatsapp: whatsappLink(tenant.contact?.whatsapp, `Hi, I'm ${name}. I just chatted on your website about ${interest ?? "a property"}.`),
        };
      },
    }),
  };
}
