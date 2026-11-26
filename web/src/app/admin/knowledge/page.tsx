import { getAdmin } from "@/lib/admin/context";
import { PageTitle } from "@/components/admin/ui";
import { FaqEditor, KnowledgeEditor } from "./editors";
import type { Faq } from "@/lib/types";
import { adminT } from "@/lib/i18n/admin-server";

export default async function KnowledgePage() {
  const { db, tenant } = await getAdmin();
  const { t } = await adminT();
  const [faqs, notes] = await Promise.all([
    db.from("faqs").select("*").eq("tenant_id", tenant.id).order("sort"),
    db.from("knowledge").select("id,title,content").eq("tenant_id", tenant.id).order("created_at"),
  ]);
  return (
    <div>
      <PageTitle title={t.shell.items.knowledge} subtitle={t.knowledgePage.subtitle} />
      <div className="flex flex-wrap items-start gap-6">
        <div className="min-w-0 flex-[1.3_1_440px]"><FaqEditor faqs={(faqs.data ?? []) as Faq[]} /></div>
        <div className="min-w-0 flex-[1_1_340px]"><KnowledgeEditor notes={(notes.data ?? []) as { id: string; title: string; content: string }[]} /></div>
      </div>
    </div>
  );
}
