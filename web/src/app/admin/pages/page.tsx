import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getAdmin } from "@/lib/admin/context";
import { PageTitle } from "@/components/admin/ui";
import { NewPageForm } from "./new-page-form";
import type { Page } from "@/lib/types";
import { adminT } from "@/lib/i18n/admin-server";

export default async function PagesList() {
  const { db, tenant } = await getAdmin();
  const { t } = await adminT();
  const { data } = await db.from("pages").select("id,slug,title,published,sections").eq("tenant_id", tenant.id).order("sort").order("created_at");
  const pages = (data ?? []) as Page[];
  return (
    <div className="flex flex-col gap-6">
      <PageTitle title={t.shell.items.pages} subtitle={t.pagesList.subtitle} />
      <div className="stagger overflow-hidden rounded-xl border bg-surface">
        {pages.map((p, i) => (
          <Link key={p.id} href={`/admin/pages/${p.id}`} className={`a-row flex min-h-[68px] items-center gap-4 px-5 py-3 ${i ? "border-t" : ""}`}>
            <span className="flex min-w-0 flex-1 flex-col"><span className="font-semibold">{p.title}</span><span className="a-muted text-[0.85rem]"><bdi dir="ltr">/{p.slug}</bdi> · {t.pagesList.sections(p.sections.length)}</span></span>
            <span className={`a-pill ${p.published ? "a-pill-green" : "a-pill-grey"}`}>{p.published ? t.ui.published : t.ui.draft}</span>
            <ChevronRight size={18} className="text-faint rtl:-scale-x-100" aria-hidden />
          </Link>
        ))}
        {!pages.length && <p className="a-muted p-8 text-center">{t.pagesList.none}</p>}
      </div>
      <NewPageForm />
    </div>
  );
}
