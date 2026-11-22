import Link from "next/link";
import { Check, ExternalLink, Inbox, Plus } from "lucide-react";
import { getAdmin, siteUrl } from "@/lib/admin/context";
import { availableProviders, PROVIDERS } from "@/lib/ai/config";
import { templateFor } from "@/lib/templates";
import { PRESETS, type PresetId } from "@/lib/theme";
import { whatsappLink } from "@/lib/format";
import type { Lead } from "@/lib/types";
import { timeAgo } from "@/lib/admin/time";
import { CountUp } from "@/components/motion/count-up";

export default async function Overview({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { db, tenant } = await getAdmin();
  const { welcome } = await searchParams;
  // eslint-disable-next-line react-hooks/purity -- per-request server render
  const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const count = { count: "exact", head: true } as const;
  const [projects, published, leads, chatLeads, chats, waiting, faqs, notes, pages] = await Promise.all([
    db.from("projects").select("id", count).eq("tenant_id", tenant.id),
    db.from("projects").select("id", count).eq("tenant_id", tenant.id).eq("published", true),
    db.from("leads").select("id", count).eq("tenant_id", tenant.id).gte("created_at", since),
    db.from("leads").select("id", count).eq("tenant_id", tenant.id).gte("created_at", since).not("session_id", "is", null),
    db.from("chat_sessions").select("id", count).eq("tenant_id", tenant.id).gte("created_at", since),
    db.from("leads").select("*").eq("tenant_id", tenant.id).eq("status", "new").order("created_at", { ascending: false }).limit(4),
    db.from("faqs").select("id", count).eq("tenant_id", tenant.id),
    db.from("knowledge").select("id", count).eq("tenant_id", tenant.id),
    db.from("pages").select("id", count).eq("tenant_id", tenant.id),
  ]);
  const providers = availableProviders();
  const url = siteUrl(tenant);
  const template = templateFor(tenant.theme?.layout);
  const presetId = tenant.theme?.preset ?? "luxury-gold";
  const preset = Object.hasOwn(PRESETS, presetId) ? PRESETS[presetId as PresetId].label : "Custom";
  const contact = tenant.contact ?? {};
  const newLeads = (waiting.data ?? []) as Lead[];

  const steps = [
    { done: true, title: "Choose your template", body: `${template.name} with ${preset} colours.`, href: "/admin/theme", cta: "Change" },
    { done: (projects.count ?? 0) > 0, title: "Add your first project", body: "Photos, price, payment plan and expected yield. About five minutes.", href: "/admin/projects/new", cta: "Add project" },
    { done: Boolean(contact.phone || contact.whatsapp), title: "Set your contact details", body: "Phone, WhatsApp, email and office hours shown to buyers.", href: "/admin/settings", cta: "Set up" },
    { done: (faqs.count ?? 0) > 0, title: "Teach your AI concierge", body: "Add the questions buyers ask you most, so it answers well.", href: "/admin/knowledge", cta: "Set up" },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const next = steps.find((s) => !s.done);
  const stats: [string, number][] = [
    ["Leads", leads.count ?? 0],
    ["Concierge chats", chats.count ?? 0],
    ["Chats that became leads", chatLeads.count ?? 0],
    ["Published projects", published.count ?? 0],
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[1.6rem] font-semibold leading-tight tracking-[-0.02em]">{welcome ? "Welcome" : "Welcome back"}, {tenant.name}</h1>
          <p className="a-muted mt-1">Your site is {tenant.published === false ? "not published yet" : "live at"} <a href={url} target="_blank" rel="noreferrer" className="a-link break-all">{url.replace(/^https?:\/\//, "")}</a></p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={url} target="_blank" rel="noreferrer" className="a-btn a-btn-ghost">View my site <ExternalLink size={15} aria-hidden /></a>
          <Link href="/admin/projects/new" className="a-btn a-btn-primary"><Plus size={16} aria-hidden /> Add project</Link>
        </div>
      </div>

      {welcome && (
        <div className="flex items-center gap-3.5 rounded-xl border border-success-line bg-success-soft px-5 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success-fill text-white"><Check size={18} aria-hidden /></span>
          <p className="text-success-strong"><span className="font-semibold">Your site is live.</span> Add a project next, then share your link.</p>
        </div>
      )}

      {!providers.length && (
        <div className="a-card border-warning-line bg-warning-soft text-warning-strong">
          <p className="font-semibold">The AI concierge needs an API key</p>
          <p className="mt-1 text-sm">Add one of these to your environment: {Object.values(PROVIDERS).map((p) => p.envKey).join(", ")}. Gemini and Groq both have free tiers.</p>
        </div>
      )}

      <div className="flex flex-wrap items-start gap-6">
        <section className="min-w-0 flex-[2_1_480px] overflow-hidden rounded-xl border bg-surface">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-6 pb-4 pt-5">
            <div>
              <h2 className="text-lg font-semibold">
                {newLeads.length ? `${newLeads.length === 4 ? "4 or more" : newLeads.length} ${newLeads.length === 1 ? "buyer is" : "buyers are"} waiting for a reply` : "No buyers waiting"}
              </h2>
              <p className="a-muted text-sm">New enquiries from your contact form and the concierge.</p>
            </div>
            <Link href="/admin/leads" className="a-link inline-flex min-h-11 items-center text-[0.95rem]">Open all leads</Link>
          </div>
          {newLeads.length ? (
            <ul className="stagger">
              {newLeads.map((l) => {
                const wa = whatsappLink(l.phone ?? undefined, `Hi ${l.name ?? ""}, this is ${tenant.name}.`);
                return (
                  <li key={l.id} className="a-row flex flex-wrap items-center gap-x-4 gap-y-2.5 border-t px-6 py-4">
                    <Link href={`/admin/leads?id=${l.id}`} className="flex min-w-0 flex-[1_1_260px] flex-col gap-0.5">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{l.name ?? "Anonymous"}</span>
                        <span className={`a-pill ${l.source === "chat" ? "a-pill-blue" : "a-pill-grey"}`}>{l.source === "chat" ? "Concierge" : "Form"}</span>
                        <span className="a-muted text-[0.85rem]">{timeAgo(l.created_at)}</span>
                      </span>
                      <span className="line-clamp-2 text-[0.95rem] text-ink-2">{[l.interest, l.budget && `Budget ${l.budget}`].filter(Boolean).join(" · ") || l.message || "No details given"}</span>
                    </Link>
                    <span className="flex gap-2">
                      {l.session_id && <Link href={`/admin/chats/${l.session_id}`} className="a-btn a-btn-ghost a-btn-sm">Transcript</Link>}
                      {wa ? <a href={wa} target="_blank" rel="noreferrer" className="a-btn a-btn-primary a-btn-sm">Reply on WhatsApp</a>
                        : l.email ? <a href={`mailto:${l.email}`} className="a-btn a-btn-primary a-btn-sm">Reply by email</a> : null}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-2 border-t px-6 py-10 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand-ink"><Inbox size={22} aria-hidden /></span>
              <p className="font-semibold">You are all caught up</p>
              <p className="a-muted max-w-sm text-sm">New enquiries from your contact form and the AI concierge appear here first.</p>
            </div>
          )}
          <div className="flex flex-col gap-3 border-t bg-subtle px-6 pb-5 pt-4">
            <h2 className="text-[0.95rem] font-semibold">Last 30 days</h2>
            <dl className="flex flex-wrap gap-x-12 gap-y-3.5">
              {stats.map(([label, value]) => (
                <div key={label}><dt className="a-muted text-[0.85rem]">{label}</dt><dd className="text-[1.4rem] font-semibold tabular-nums"><CountUp value={value} /></dd></div>
              ))}
            </dl>
          </div>
        </section>

        <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-6">
          <section className="overflow-hidden rounded-xl border bg-surface">
            <div className="relative h-[140px] bg-inverse">
              {tenant.theme?.backdropUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tenant.theme.backdropUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-75" />
              )}
              <span className={`a-pill absolute left-3.5 top-3.5 bg-surface ${tenant.published === false ? "text-warning" : "text-success"}`}>
                <span aria-hidden className={`h-[7px] w-[7px] rounded-full ${tenant.published === false ? "bg-warning-fill" : "bg-success-fill"}`} />
                {tenant.published === false ? "Not published" : "Published"}
              </span>
            </div>
            <div className="flex flex-col gap-3 px-5 pb-5 pt-4">
              <div>
                <h2 className="font-semibold">Your site</h2>
                <p className="a-muted text-sm">{template.name} template · {preset} colours · {pages.count ?? 0} pages</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/admin/pages" className="a-btn a-btn-ghost a-btn-sm flex-1">Edit pages</Link>
                <Link href="/admin/theme" className="a-btn a-btn-ghost a-btn-sm flex-1">Change theme</Link>
              </div>
            </div>
          </section>

          <section className="rounded-xl border bg-surface px-5 pt-4">
            <h2 className="font-semibold">What the concierge knows</h2>
            <p className="a-muted text-sm">It answers only from these.</p>
            <ul className="mt-2.5 text-[0.95rem]">
              {([["Published projects", published.count ?? 0, "/admin/projects"], ["FAQs", faqs.count ?? 0, "/admin/knowledge"], ["Knowledge notes", notes.count ?? 0, "/admin/knowledge"]] as const).map(([label, value, href]) => (
                <li key={label} className="border-t"><Link href={href} className="flex min-h-11 items-center justify-between gap-3 hover:text-brand-ink"><span>{label}</span><span className="font-semibold tabular-nums">{value}</span></Link></li>
              ))}
            </ul>
          </section>

          {next && (
            <section className="flex flex-col gap-3 rounded-xl border bg-surface px-5 py-4">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-semibold">Setup</h2>
                <span className="a-muted text-[0.85rem]">{doneCount} of {steps.length} done</span>
              </div>
              <div role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={doneCount} aria-label="Setup progress" className="h-1.5 overflow-hidden rounded-full bg-brand-soft">
                <span className="grow-x block h-full rounded-full bg-brand" style={{ width: `${(doneCount / steps.length) * 100}%` }} />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                <span className="flex min-w-[10rem] flex-1 flex-col"><span className="font-medium">{next.title}</span><span className="a-muted text-[0.85rem]">{next.body}</span></span>
                <Link href={next.href} className="a-btn a-btn-primary a-btn-sm">{next.cta}</Link>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
