import Link from "next/link";
import { Check, ExternalLink, Inbox } from "lucide-react";
import { getAdmin, siteUrl } from "@/lib/admin/context";
import { availableProviders, PROVIDERS } from "@/lib/ai/config";
import { templateFor } from "@/lib/templates";
import { PRESETS, type PresetId } from "@/lib/theme";
import type { Lead } from "@/lib/types";

export default async function Overview({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { db, tenant } = await getAdmin();
  const { welcome } = await searchParams;
  // eslint-disable-next-line react-hooks/purity -- per-request server render
  const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const [projects, leads, newLeads, chats, recent, faqs] = await Promise.all([
    db.from("projects").select("id", { count: "exact", head: true }).eq("tenant_id", tenant.id),
    db.from("leads").select("id", { count: "exact", head: true }).eq("tenant_id", tenant.id).gte("created_at", since),
    db.from("leads").select("id", { count: "exact", head: true }).eq("tenant_id", tenant.id).eq("status", "new"),
    db.from("chat_sessions").select("id", { count: "exact", head: true }).eq("tenant_id", tenant.id).gte("created_at", since),
    db.from("leads").select("*").eq("tenant_id", tenant.id).order("created_at", { ascending: false }).limit(5),
    db.from("faqs").select("id", { count: "exact", head: true }).eq("tenant_id", tenant.id),
  ]);
  const providers = availableProviders();
  const url = siteUrl(tenant);
  const template = templateFor(tenant.theme?.layout);
  const preset = PRESETS[(tenant.theme?.preset as PresetId) ?? "luxury-gold"]?.label ?? "Custom";
  const contact = tenant.contact ?? {};

  const steps = [
    { done: true, title: "Choose your template", body: `${template.name} with ${preset} colours.`, href: "/admin/theme", cta: "Change" },
    { done: (projects.count ?? 0) > 0, title: "Add your first project", body: "Photos, price, payment plan and expected yield. About five minutes.", href: "/admin/projects", cta: "Add project" },
    { done: Boolean(contact.phone || contact.whatsapp), title: "Set your contact details", body: "Phone, WhatsApp, email and office hours shown to buyers.", href: "/admin/settings", cta: "Set up" },
    { done: (faqs.count ?? 0) > 0, title: "Teach your AI concierge", body: "Add the questions buyers ask you most, so it answers well.", href: "/admin/knowledge", cta: "Set up" },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const next = steps.findIndex((s) => !s.done);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[1.75rem] font-bold leading-tight">{welcome ? "Welcome" : "Welcome back"}, {tenant.name}</h1>
          <p className="mt-1 text-slate-600">{doneCount < steps.length ? `${steps.length - doneCount} short step${steps.length - doneCount > 1 ? "s" : ""} make your site yours.` : "Your site is fully set up."}</p>
        </div>
        <a href={url} target="_blank" rel="noreferrer" className="a-btn a-btn-ghost">View my site <ExternalLink size={16} aria-hidden /></a>
      </div>

      {welcome && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-green-200 bg-green-50 px-6 py-5">
          <div className="flex items-center gap-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-700 text-white"><Check size={20} aria-hidden /></span>
            <div>
              <p className="font-bold text-green-950">Your site is live</p>
              <a href={url} target="_blank" rel="noreferrer" className="break-all text-green-900 underline">{url.replace(/^https?:\/\//, "")}</a>
            </div>
          </div>
        </div>
      )}

      {!providers.length && (
        <div className="a-card border-amber-200 bg-amber-50 text-amber-950">
          <p className="font-semibold">The AI concierge needs an API key</p>
          <p className="mt-1 text-sm">Add one of these to your environment: {Object.values(PROVIDERS).map((p) => p.envKey).join(", ")}. Gemini and Groq both have free tiers.</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section className="a-card space-y-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-bold">{doneCount < steps.length ? "Finish setting up" : "Setup complete"}</h2>
            <span className="text-sm font-semibold text-slate-600">{doneCount} of {steps.length} done</span>
          </div>
          <div role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={doneCount} aria-label="Setup progress" className="h-2 overflow-hidden rounded-full bg-blue-50">
            <span className="grow-x block h-full rounded-full bg-[#1e46b8]" style={{ width: `${(doneCount / steps.length) * 100}%` }} />
          </div>
          <ol className="space-y-3">
            {steps.map((s, i) => {
              const current = i === next;
              return (
                <li key={s.title} className={`flex flex-wrap items-center gap-3.5 rounded-xl px-4 py-3.5 ${s.done ? "border bg-slate-50" : current ? "border-2 border-[#1e46b8] bg-white" : "border bg-white"}`}>
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${s.done ? "bg-green-700 text-white" : current ? "bg-[#1e46b8] text-white" : "bg-blue-50 text-blue-900"}`}>
                    {s.done ? <Check size={16} aria-label="Done" /> : i + 1}
                  </span>
                  <span className="min-w-[14rem] flex-1">
                    <span className={`block font-semibold ${s.done ? "text-slate-600" : ""}`}>{s.title}</span>
                    <span className="block text-sm text-slate-600">{s.body}</span>
                  </span>
                  <Link href={s.href} className={current ? "a-btn a-btn-primary" : "inline-flex min-h-11 items-center text-sm font-semibold text-blue-700 hover:text-blue-900"}>{s.cta}</Link>
                </li>
              );
            })}
          </ol>
        </section>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Projects", projects.count ?? 0, "/admin/projects"],
              ["New leads", newLeads.count ?? 0, "/admin/leads"],
              ["Leads, 30 days", leads.count ?? 0, "/admin/leads"],
              ["Chats, 30 days", chats.count ?? 0, "/admin/chats"],
            ].map(([label, value, href]) => (
              <Link key={label as string} href={href as string} className="a-card !p-4 hover:border-blue-300">
                <p className="text-sm text-slate-600">{label}</p>
                <p className="mt-1 text-2xl font-bold">{value}</p>
              </Link>
            ))}
          </div>

          <section className="a-card space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Latest leads</h2>
              <Link href="/admin/leads" className="inline-flex min-h-11 items-center text-sm font-semibold text-blue-700 hover:text-blue-900">View all</Link>
            </div>
            {(recent.data as Lead[] | null)?.length ? (
              <ul className="divide-y">
                {(recent.data as Lead[]).map((l) => (
                  <li key={l.id} className="py-3 text-sm">
                    <p className="flex items-center justify-between gap-2"><span className="font-semibold">{l.name ?? "Anonymous"}</span><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{l.source === "chat" ? "Concierge" : "Form"}</span></p>
                    <p className="mt-0.5 truncate text-slate-600">{l.interest ?? l.message?.slice(0, 60) ?? ""}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 px-5 py-7 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Inbox size={22} aria-hidden /></span>
                <p className="font-semibold">No leads yet</p>
                <p className="text-sm text-slate-600">They will appear here from your contact form and the AI concierge.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
