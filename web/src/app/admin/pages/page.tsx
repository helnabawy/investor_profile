import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getAdmin } from "@/lib/admin/context";
import { PageTitle } from "@/components/admin/ui";
import { NewPageForm } from "./new-page-form";
import type { Page } from "@/lib/types";

export default async function PagesList() {
  const { db, tenant } = await getAdmin();
  const { data } = await db.from("pages").select("id,slug,title,published,sections").eq("tenant_id", tenant.id).order("sort").order("created_at");
  const pages = (data ?? []) as Page[];
  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="Pages" subtitle="Build each page from sections. The Projects and Concierge pages are built in." />
      <div className="stagger overflow-hidden rounded-xl border bg-white">
        {pages.map((p, i) => (
          <Link key={p.id} href={`/admin/pages/${p.id}`} className={`a-row flex min-h-[68px] items-center gap-4 px-5 py-3 ${i ? "border-t" : ""}`}>
            <span className="flex min-w-0 flex-1 flex-col"><span className="font-semibold">{p.title}</span><span className="a-muted text-[0.85rem]">/{p.slug} · {p.sections.length} sections</span></span>
            <span className={`a-pill ${p.published ? "a-pill-green" : "a-pill-grey"}`}>{p.published ? "Published" : "Draft"}</span>
            <ChevronRight size={18} className="text-[#6a7385]" aria-hidden />
          </Link>
        ))}
        {!pages.length && <p className="a-muted p-8 text-center">No pages yet.</p>}
      </div>
      <NewPageForm />
    </div>
  );
}
