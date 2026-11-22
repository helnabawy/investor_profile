import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { getAdmin } from "@/lib/admin/context";
import { PageTitle, UpgradeNote } from "@/components/admin/ui";
import { tenantPlan } from "@/lib/tenant";
import { formatFullPrice } from "@/lib/format";
import { PROJECT_COLUMNS, type Project } from "@/lib/types";

const STATUS: Record<Project["status"], [string, string]> = {
  "off-plan": ["Off-plan", "a-pill-blue"],
  ready: ["Ready", "a-pill-green"],
  "sold-out": ["Sold out", "a-pill-grey"],
};
const COLS = "grid-cols-[minmax(0,2.2fr)_96px_140px_96px_minmax(0,1.2fr)_96px_20px]";

export default async function ProjectsAdmin({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { db, tenant } = await getAdmin();
  const { status } = await searchParams;
  const { data } = await db.from("projects").select(PROJECT_COLUMNS).eq("tenant_id", tenant.id).order("sort").order("created_at", { ascending: false });
  const all = (data ?? []) as Project[];
  const projects = status ? all.filter((p) => p.status === status) : all;
  const plan = tenantPlan(tenant);
  const full = plan.maxProjects !== null && all.length >= plan.maxProjects;
  return (
    <div>
      <PageTitle title="Projects" subtitle="Your property portfolio. The AI concierge answers from these.">
        <div className="flex flex-wrap items-center gap-3">
          {plan.maxProjects !== null && <p className="a-muted text-sm">{all.length} of {plan.maxProjects} projects used</p>}
          {!full && <Link href="/admin/projects/new" className="a-btn a-btn-primary"><Plus size={16} aria-hidden /> Add project</Link>}
        </div>
      </PageTitle>
      {full && <div className="mb-4"><UpgradeNote>The {plan.name} plan includes up to {plan.maxProjects} projects. Upgrade to add more, or delete one you no longer need.</UpgradeNote></div>}

      <nav aria-label="Filter by status" className="mb-4 flex flex-wrap gap-1.5">
        {[["", "All"] as const, ...(Object.entries(STATUS) as [string, [string, string]][]).map(([k, [label]]) => [k, label] as const)].map(([k, label]) => (
          <Link key={k} href={k ? `?status=${k}` : "?"} aria-current={(status ?? "") === k ? "page" : undefined} className="a-tab">
            {label} <span>{k ? all.filter((p) => p.status === k).length : all.length}</span>
          </Link>
        ))}
      </nav>

      <div className="overflow-x-auto rounded-xl border bg-surface">
        <div className="stagger min-w-[880px]">
          <div aria-hidden className={`grid ${COLS} gap-4 px-5 py-3 text-[0.85rem] font-medium text-quiet`}>
            <span>Project</span><span>Status</span><span>Price from</span><span>Handover</span><span>Payment plan</span><span>On site</span><span />
          </div>
          {projects.map((p) => {
            const [label, cls] = STATUS[p.status] ?? STATUS["off-plan"];
            const meta = [p.area, p.property_type, p.featured && "Featured"].filter(Boolean).join(" · ");
            return (
              <Link key={p.id} href={`/admin/projects/${p.id}`} className={`a-row grid ${COLS} min-h-[76px] items-center gap-4 border-t px-5 py-2`}>
                <span className="flex min-w-0 items-center gap-3.5">
                  {p.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.images[0]} alt="" className="h-[54px] w-[72px] shrink-0 rounded-md border object-cover" />
                  ) : (
                    <span className="flex h-[54px] w-[72px] shrink-0 items-center justify-center rounded-md border border-warning-line bg-warning-soft text-center text-xs font-medium text-warning">No photo</span>
                  )}
                  <span className="flex min-w-0 flex-col leading-snug">
                    <span className="truncate font-semibold">{p.title}</span>
                    <span className={`truncate text-[0.85rem] ${p.images[0] ? "a-muted" : "text-warning"}`}>{p.images[0] ? meta : `${meta ? `${meta} · ` : ""}Add a photo`}</span>
                  </span>
                </span>
                <span><span className={`a-pill ${cls}`}>{label}</span></span>
                <span className="tabular-nums">{p.price_from ? formatFullPrice(p.price_from, p.currency) : "—"}</span>
                <span className="text-[0.95rem]">{p.handover ?? "—"}</span>
                <span className="truncate text-[0.95rem] text-ink-2">{p.payment_plan ?? "—"}</span>
                <span className={`text-[0.9rem] font-medium ${p.published ? "text-success" : "text-quiet"}`}>{p.published ? "Published" : "Hidden"}</span>
                <ChevronRight size={18} className="text-faint" aria-hidden />
              </Link>
            );
          })}
          {!projects.length && <p className="a-muted border-t px-5 py-9 text-center">{status ? "No projects with this status." : "No projects yet. Add your first listing."}</p>}
        </div>
      </div>
      <p className="a-muted mt-4 text-sm">Featured projects appear on your home page.</p>
    </div>
  );
}
