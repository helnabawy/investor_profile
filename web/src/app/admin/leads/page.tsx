import Link from "next/link";
import { getAdmin } from "@/lib/admin/context";
import { PageTitle } from "@/components/admin/ui";
import { StatusSelect } from "./status-select";
import type { Lead } from "@/lib/types";
import { whatsappLink } from "@/lib/format";
import { timeAgo } from "@/lib/admin/time";

const STATUSES = [
  ["new", "New", "a-pill-blue"],
  ["contacted", "Contacted", "a-pill-amber"],
  ["qualified", "Qualified", "a-pill-green"],
  ["closed", "Closed", "a-pill-grey"],
] as const;
const pill = (s: string) => STATUSES.find(([k]) => k === s) ?? STATUSES[0];
const COLS = "grid-cols-[minmax(0,1.5fr)_minmax(0,1.6fr)_minmax(0,0.9fr)_96px_120px_104px]";

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ status?: string; id?: string }> }) {
  const { db, tenant } = await getAdmin();
  const { status, id } = await searchParams;
  const all = ((await db.from("leads").select("*").eq("tenant_id", tenant.id).order("created_at", { ascending: false }).limit(200)).data ?? []) as Lead[];
  const leads = status ? all.filter((l) => l.status === status) : all;
  const cur = leads.find((l) => l.id === id) ?? leads[0];
  const href = (q: { status?: string; id?: string }) => {
    const p = new URLSearchParams(Object.entries(q).filter(([, v]) => v) as [string, string][]);
    return p.size ? `?${p}` : "?";
  };
  const wa = cur && whatsappLink(cur.phone ?? undefined, `Hi ${cur.name ?? ""}, this is ${tenant.name}.`);

  return (
    <div>
      <PageTitle title="Leads" subtitle="Enquiries from your contact forms and the AI concierge." />
      <div className="flex flex-wrap items-start gap-6">
        <section className="flex min-w-0 flex-[2_1_520px] flex-col gap-4">
          <nav aria-label="Filter by status" className="flex flex-wrap gap-1.5">
            {[["", "All"] as const, ...STATUSES].map(([k, label]) => (
              <Link key={k} href={href({ status: k })} aria-current={(status ?? "") === k ? "page" : undefined} className="a-tab">
                {label} <span>{k ? all.filter((l) => l.status === k).length : all.length}</span>
              </Link>
            ))}
          </nav>
          <div className="overflow-x-auto rounded-xl border bg-surface">
            <div className="stagger min-w-[760px]">
              <div aria-hidden className={`grid ${COLS} gap-4 px-5 py-3 text-[0.85rem] font-medium text-quiet`}>
                <span>Buyer</span><span>Interest</span><span>Budget</span><span>Source</span><span>Received</span><span>Status</span>
              </div>
              {leads.map((l) => {
                const [, label, cls] = pill(l.status);
                return (
                  <Link key={l.id} href={href({ status, id: l.id })} scroll={false} aria-current={l.id === cur?.id ? "true" : undefined}
                    className={`a-row grid ${COLS} min-h-16 items-center gap-4 border-t px-5 py-2.5`}>
                    <span className="flex min-w-0 flex-col leading-snug"><span className="truncate font-semibold">{l.name ?? "Anonymous"}</span><span className="a-muted truncate text-[0.85rem]">{l.email ?? l.phone ?? ""}</span></span>
                    <span className="truncate text-[0.95rem] text-ink-2">{l.interest ?? l.message ?? "—"}</span>
                    <span className="truncate text-[0.95rem] tabular-nums">{l.budget ?? "—"}</span>
                    <span className="text-[0.9rem] text-ink-2">{l.source === "chat" ? "Concierge" : "Form"}</span>
                    <span className="a-muted text-[0.9rem]">{timeAgo(l.created_at)}</span>
                    <span><span className={`a-pill ${cls}`}>{label}</span></span>
                  </Link>
                );
              })}
              {!leads.length && <p className="a-muted border-t px-5 py-9 text-center">{status ? "No leads with this status yet." : "No leads yet. They arrive from your contact form and the AI concierge."}</p>}
            </div>
          </div>
        </section>

        {cur && (
          <aside key={cur.id} aria-label="Selected lead" className="p-pop flex min-w-0 flex-[1_1_320px] flex-col rounded-xl border bg-surface">
            <div className="flex flex-col gap-3.5 px-5 pb-4 pt-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold">{cur.name ?? "Anonymous"}</h2>
                  <p className="a-muted text-sm">{cur.source === "chat" ? "Concierge" : "Form"} · {timeAgo(cur.created_at)}</p>
                </div>
                <span className={`a-pill ${pill(cur.status)[2]}`}>{pill(cur.status)[1]}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {wa && <a href={wa} target="_blank" rel="noreferrer" className="a-btn a-btn-primary flex-[1_1_150px]">Reply on WhatsApp</a>}
                {cur.phone && <a href={`tel:${cur.phone.replace(/\s/g, "")}`} className="a-btn a-btn-ghost">Call</a>}
                {cur.email && <a href={`mailto:${cur.email}`} className={`a-btn ${wa ? "a-btn-ghost" : "a-btn-primary flex-1"}`}>Email</a>}
              </div>
            </div>
            <dl className="border-t px-5 py-1 text-[0.95rem]">
              {([["Email", cur.email], ["Phone", cur.phone], ["Interest", cur.interest], ["Budget", cur.budget]] as const).filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-t border-line-soft py-2.5 first:border-0"><dt className="a-muted">{k}</dt><dd className="min-w-0 text-right [overflow-wrap:anywhere]">{v}</dd></div>
              ))}
            </dl>
            {(cur.message || cur.session_id) && (
              <div className="flex flex-col gap-2 border-t px-5 py-4">
                <h3 className="text-[0.95rem] font-semibold">What they asked</h3>
                {cur.message && <p className="whitespace-pre-line text-[0.95rem] text-ink-2">{cur.message}</p>}
                {cur.session_id && <Link href={`/admin/chats/${cur.session_id}`} className="a-link inline-flex min-h-11 items-center self-start text-[0.95rem]">Read the concierge transcript</Link>}
              </div>
            )}
            <div className="flex flex-col gap-1.5 border-t px-5 pb-5 pt-4">
              <span className="text-[0.95rem] font-semibold">Move to</span>
              <StatusSelect key={cur.id} id={cur.id} value={cur.status} />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
