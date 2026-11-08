import Link from "next/link";
import { getAdmin } from "@/lib/admin/context";
import { PageTitle } from "@/components/admin/ui";
import { formatPrice } from "@/lib/format";
import { PROJECT_COLUMNS, type Project } from "@/lib/types";

export default async function ProjectsAdmin() {
  const { db, tenant } = await getAdmin();
  const { data } = await db.from("projects").select(PROJECT_COLUMNS).eq("tenant_id", tenant.id).order("sort").order("created_at", { ascending: false });
  const projects = (data ?? []) as Project[];
  return (
    <div>
      <PageTitle title="Projects" subtitle="Your property portfolio. The AI concierge answers from these.">
        <Link href="/admin/projects/new" className="a-btn a-btn-primary">+ New project</Link>
      </PageTitle>
      <div className="a-card divide-y !p-0">
        {projects.map((p) => (
          <Link key={p.id} href={`/admin/projects/${p.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {p.images[0] ? <img src={p.images[0]} alt="" className="h-12 w-16 rounded object-cover" /> : <div className="h-12 w-16 rounded bg-slate-100" />}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{p.title}</p>
              <p className="truncate text-xs text-slate-500">{[p.area, p.developer, p.status].filter(Boolean).join(" · ")}</p>
            </div>
            <p className="hidden text-sm sm:block">{formatPrice(p.price_from, p.currency)}</p>
            <div className="flex gap-1">
              {p.featured && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">Featured</span>}
              {!p.published && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">Hidden</span>}
            </div>
          </Link>
        ))}
        {!projects.length && <p className="p-6 text-sm text-slate-500">No projects yet — add your first listing.</p>}
      </div>
    </div>
  );
}
