import Link from "next/link";
import { getAdmin } from "@/lib/admin/context";
import { PageTitle } from "@/components/admin/ui";
import { NewPageForm } from "./new-page-form";
import type { Page } from "@/lib/types";

export default async function PagesList() {
  const { db, tenant } = await getAdmin();
  const { data } = await db.from("pages").select("id,slug,title,published,sections").eq("tenant_id", tenant.id).order("sort").order("created_at");
  const pages = (data ?? []) as Page[];
  return (
    <div className="space-y-6">
      <PageTitle title="Pages" subtitle="Build each page from sections. The Projects and Concierge pages are built in." />
      <div className="a-card divide-y !p-0">
        {pages.map((p) => (
          <Link key={p.id} href={`/admin/pages/${p.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50">
            <div>
              <p className="font-medium">{p.title}</p>
              <p className="text-xs text-slate-500">/{p.slug} · {p.sections.length} sections</p>
            </div>
            {!p.published && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">Draft</span>}
          </Link>
        ))}
        {!pages.length && <p className="p-5 text-sm text-slate-500">No pages yet.</p>}
      </div>
      <NewPageForm />
    </div>
  );
}
