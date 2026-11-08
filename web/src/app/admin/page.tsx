import Link from "next/link";
import { getAdmin, siteUrl } from "@/lib/admin/context";
import { availableProviders, PROVIDERS } from "@/lib/ai/config";
import type { Lead } from "@/lib/types";

export default async function Overview({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { db, tenant } = await getAdmin();
  const { welcome } = await searchParams;
  // eslint-disable-next-line react-hooks/purity -- per-request server render
  const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const [projects, leads, newLeads, chats, recent] = await Promise.all([
    db.from("projects").select("id", { count: "exact", head: true }).eq("tenant_id", tenant.id),
    db.from("leads").select("id", { count: "exact", head: true }).eq("tenant_id", tenant.id).gte("created_at", since),
    db.from("leads").select("id", { count: "exact", head: true }).eq("tenant_id", tenant.id).eq("status", "new"),
    db.from("chat_sessions").select("id", { count: "exact", head: true }).eq("tenant_id", tenant.id).gte("created_at", since),
    db.from("leads").select("*").eq("tenant_id", tenant.id).order("created_at", { ascending: false }).limit(5),
  ]);
  const providers = availableProviders();
  const url = siteUrl(tenant);

  return (
    <div className="space-y-6">
      {welcome && (
        <div className="a-card border-teal-200 bg-teal-50">
          <p className="font-medium text-teal-900">Your site is live 🎉</p>
          <p className="mt-1 text-sm text-teal-800">Next steps: add your projects, set your contact details, and tune the AI concierge.</p>
        </div>
      )}
      <div>
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Your site: <a href={url} target="_blank" rel="noreferrer" className="text-teal-700 underline">{url.replace(/^https?:\/\//, "")}</a></p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Projects", projects.count ?? 0, "/admin/projects"],
          ["Leads (30 days)", leads.count ?? 0, "/admin/leads"],
          ["New leads", newLeads.count ?? 0, "/admin/leads"],
          ["Chats (30 days)", chats.count ?? 0, "/admin/chats"],
        ].map(([label, value, href]) => (
          <Link key={label as string} href={href as string} className="a-card hover:border-teal-300">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-3xl font-semibold">{value}</p>
          </Link>
        ))}
      </div>
      {!providers.length && (
        <div className="a-card border-amber-200 bg-amber-50 text-sm text-amber-900">
          <p className="font-medium">The AI concierge needs an API key</p>
          <p className="mt-1">Add one of these to your environment: {Object.values(PROVIDERS).map((p) => p.envKey).join(", ")}. Gemini and Groq both have free tiers.</p>
        </div>
      )}
      <div className="a-card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Latest leads</h2>
          <Link href="/admin/leads" className="text-sm text-teal-700 underline">View all</Link>
        </div>
        {(recent.data as Lead[] | null)?.length ? (
          <ul className="divide-y">
            {(recent.data as Lead[]).map((l) => (
              <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <span className="font-medium">{l.name ?? "Anonymous"}</span>
                <span className="text-slate-500">{l.interest ?? l.message?.slice(0, 60) ?? ""}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{l.source}</span>
                <span className="text-xs text-slate-400">{new Date(l.created_at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No leads yet. They&apos;ll appear here from the contact form and the AI concierge.</p>
        )}
      </div>
    </div>
  );
}
