import Link from "next/link";
import { getAdmin } from "@/lib/admin/context";
import { PageTitle } from "@/components/admin/ui";
import { StatusSelect } from "./status-select";
import type { Lead } from "@/lib/types";
import { whatsappLink } from "@/lib/format";

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { db, tenant } = await getAdmin();
  const { status } = await searchParams;
  let q = db.from("leads").select("*").eq("tenant_id", tenant.id).order("created_at", { ascending: false }).limit(200);
  if (status) q = q.eq("status", status);
  const leads = ((await q).data ?? []) as Lead[];
  return (
    <div>
      <PageTitle title="Leads" subtitle="Enquiries from your contact forms and the AI concierge." />
      <div className="mb-4 flex gap-2 text-sm">
        {["", "new", "contacted", "qualified", "closed"].map((s) => (
          <Link key={s} href={s ? `?status=${s}` : "?"} className={`rounded-full px-3 py-1 ${status === s || (!status && !s) ? "bg-teal-700 text-white" : "bg-white border"}`}>{s || "All"}</Link>
        ))}
      </div>
      <div className="space-y-3">
        {leads.map((l) => {
          const wa = l.phone ? whatsappLink(l.phone) : null;
          return (
            <div key={l.id} className="a-card !p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{l.name ?? "Anonymous"} <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal">{l.source}</span></p>
                  <p className="text-sm text-slate-500">
                    {[l.email && <a key="e" href={`mailto:${l.email}`} className="underline">{l.email}</a>, l.phone && <span key="p">{l.phone}</span>].filter(Boolean).reduce<React.ReactNode[]>((a, x) => (a.length ? [...a, " · ", x] : [x]), [])}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {wa && <a href={wa} target="_blank" rel="noreferrer" className="a-btn a-btn-ghost !py-1.5">WhatsApp</a>}
                  {l.session_id && <Link href={`/admin/chats/${l.session_id}`} className="a-btn a-btn-ghost !py-1.5">Transcript</Link>}
                  <StatusSelect id={l.id} value={l.status} />
                </div>
              </div>
              {(l.interest || l.budget || l.message) && (
                <div className="mt-3 space-y-1 text-sm text-slate-700">
                  {l.interest && <p><span className="text-slate-500">Interest:</span> {l.interest}</p>}
                  {l.budget && <p><span className="text-slate-500">Budget:</span> {l.budget}</p>}
                  {l.message && <p className="whitespace-pre-line">{l.message}</p>}
                </div>
              )}
              <p className="mt-2 text-xs text-slate-400">{new Date(l.created_at).toLocaleString()}</p>
            </div>
          );
        })}
        {!leads.length && <p className="a-card text-sm text-slate-500">No leads here yet.</p>}
      </div>
    </div>
  );
}
