import Link from "next/link";
import { getAdmin } from "@/lib/admin/context";
import { PageTitle } from "@/components/admin/ui";
import { StatusSelect } from "./status-select";
import type { Lead } from "@/lib/types";
import { whatsappLink } from "@/lib/format";
import { timeAgo } from "@/lib/admin/time";
import { adminT } from "@/lib/i18n/admin-server";
import { ADMIN } from "@/lib/i18n/admin";

const STATUSES = [
  ["new", "a-pill-blue"],
  ["contacted", "a-pill-amber"],
  ["qualified", "a-pill-green"],
  ["closed", "a-pill-grey"],
] as const;
type Status = (typeof STATUSES)[number][0];
const pill = (s: string) => STATUSES.find(([k]) => k === s) ?? STATUSES[0];
const COLS = "grid-cols-[minmax(0,1.5fr)_minmax(0,1.6fr)_minmax(0,0.9fr)_96px_120px_104px]";

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ status?: string; id?: string }> }) {
  const { db, tenant } = await getAdmin();
  const { t, locale } = await adminT();
  const tl = t.leads;
  const statusLabel = (s: Status) => tl.statuses[s];
  const { status, id } = await searchParams;
  const all = ((await db.from("leads").select("*").eq("tenant_id", tenant.id).order("created_at", { ascending: false }).limit(200)).data ?? []) as Lead[];
  const leads = status ? all.filter((l) => l.status === status) : all;
  const cur = leads.find((l) => l.id === id) ?? leads[0];
  const href = (q: { status?: string; id?: string }) => {
    const p = new URLSearchParams(Object.entries(q).filter(([, v]) => v) as [string, string][]);
    return p.size ? `?${p}` : "?";
  };
  // Greet the buyer in the language they wrote in.
  const wa = cur && whatsappLink(cur.phone ?? undefined, ADMIN[cur.locale ?? "en"].leads.waGreeting(cur.name ?? "", tenant.name));
  const arabicPill = (l: Lead) => l.locale === "ar" && <span className="a-pill a-pill-grey" lang="ar" title={tl.arabicHint}>{tl.arabic}</span>;

  return (
    <div>
      <PageTitle title={tl.title} subtitle={tl.subtitle} />
      <div className="flex flex-wrap items-start gap-6">
        <section className="flex min-w-0 flex-[2_1_520px] flex-col gap-4">
          <nav aria-label={tl.filterAria} className="flex flex-wrap gap-1.5">
            {[["", tl.all] as const, ...STATUSES.map(([k]) => [k, statusLabel(k)] as const)].map(([k, label]) => (
              <Link key={k} href={href({ status: k })} aria-current={(status ?? "") === k ? "page" : undefined} className="a-tab">
                {label} <span>{k ? all.filter((l) => l.status === k).length : all.length}</span>
              </Link>
            ))}
          </nav>
          <div className="overflow-x-auto rounded-xl border bg-surface">
            <div className="stagger min-w-[760px]">
              <div aria-hidden className={`grid ${COLS} gap-4 px-5 py-3 text-[0.85rem] font-medium text-quiet`}>
                <span>{tl.colBuyer}</span><span>{tl.colInterest}</span><span>{tl.colBudget}</span><span>{tl.colSource}</span><span>{tl.colReceived}</span><span>{tl.colStatus}</span>
              </div>
              {leads.map((l) => {
                const [key, cls] = pill(l.status);
                return (
                  <Link key={l.id} href={href({ status, id: l.id })} scroll={false} aria-current={l.id === cur?.id ? "true" : undefined}
                    className={`a-row grid ${COLS} min-h-16 items-center gap-4 border-t px-5 py-2.5`}>
                    <span className="flex min-w-0 flex-col leading-snug"><span className="truncate font-semibold">{l.name ?? tl.anonymous}</span><span className="a-muted truncate text-[0.85rem]"><bdi dir="ltr">{l.email ?? l.phone ?? ""}</bdi></span></span>
                    <span className="truncate text-[0.95rem] text-ink-2">{l.interest ?? l.message ?? "—"}</span>
                    <span className="truncate text-[0.95rem] tabular-nums">{l.budget ?? "—"}</span>
                    <span className="flex flex-wrap items-center gap-1.5 text-[0.9rem] text-ink-2">{l.source === "chat" ? tl.concierge : tl.form}{arabicPill(l)}</span>
                    <span className="a-muted text-[0.9rem]">{timeAgo(l.created_at, locale)}</span>
                    <span><span className={`a-pill ${cls}`}>{statusLabel(key)}</span></span>
                  </Link>
                );
              })}
              {!leads.length && <p className="a-muted border-t px-5 py-9 text-center">{status ? tl.noneWithStatus : tl.none}</p>}
            </div>
          </div>
        </section>

        {cur && (
          <aside key={cur.id} aria-label={tl.selected} className="p-pop flex min-w-0 flex-[1_1_320px] flex-col rounded-xl border bg-surface">
            <div className="flex flex-col gap-3.5 px-5 pb-4 pt-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold">{cur.name ?? tl.anonymous}</h2>
                  <p className="a-muted flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm">{cur.source === "chat" ? tl.concierge : tl.form} · {timeAgo(cur.created_at, locale)}{arabicPill(cur)}</p>
                </div>
                <span className={`a-pill ${pill(cur.status)[1]}`}>{statusLabel(pill(cur.status)[0])}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {wa && <a href={wa} target="_blank" rel="noreferrer" className="a-btn a-btn-primary flex-[1_1_150px]">{tl.replyWhatsApp}</a>}
                {cur.phone && <a href={`tel:${cur.phone.replace(/\s/g, "")}`} className="a-btn a-btn-ghost">{tl.call}</a>}
                {cur.email && <a href={`mailto:${cur.email}`} className={`a-btn ${wa ? "a-btn-ghost" : "a-btn-primary flex-1"}`}>{tl.email}</a>}
              </div>
            </div>
            <dl className="border-t px-5 py-1 text-[0.95rem]">
              {([["email", tl.email, cur.email], ["phone", tl.phone, cur.phone], ["interest", tl.interest, cur.interest], ["budget", tl.budgetField, cur.budget]] as const).filter(([, , v]) => v).map(([k, label, v]) => (
                <div key={k} className="flex justify-between gap-4 border-t border-line-soft py-2.5 first:border-0"><dt className="a-muted">{label}</dt>
                  <dd className="min-w-0 text-end [overflow-wrap:anywhere]">{k === "email" || k === "phone" ? <bdi dir="ltr">{v}</bdi> : v}</dd></div>
              ))}
            </dl>
            {(cur.message || cur.session_id) && (
              <div className="flex flex-col gap-2 border-t px-5 py-4">
                <h3 className="text-[0.95rem] font-semibold">{tl.asked}</h3>
                {cur.message && <p dir="auto" className="whitespace-pre-line text-[0.95rem] text-ink-2">{cur.message}</p>}
                {cur.session_id && <Link href={`/admin/chats/${cur.session_id}`} className="a-link inline-flex min-h-11 items-center self-start text-[0.95rem]">{tl.readTranscript}</Link>}
              </div>
            )}
            <div className="flex flex-col gap-1.5 border-t px-5 pb-5 pt-4">
              <span className="text-[0.95rem] font-semibold">{tl.moveTo}</span>
              <StatusSelect key={cur.id} id={cur.id} value={cur.status} />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
