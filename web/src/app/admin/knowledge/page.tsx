import { getAdmin } from "@/lib/admin/context";
import { PageTitle } from "@/components/admin/ui";
import { FaqEditor, KnowledgeEditor } from "./editors";
import type { Faq } from "@/lib/types";

export default async function KnowledgePage() {
  const { db, tenant } = await getAdmin();
  const [faqs, notes] = await Promise.all([
    db.from("faqs").select("*").eq("tenant_id", tenant.id).order("sort"),
    db.from("knowledge").select("id,title,content").eq("tenant_id", tenant.id).order("created_at"),
  ]);
  return (
    <div>
      <PageTitle title="FAQ & knowledge" subtitle="FAQs appear on your site and teach the concierge. Knowledge notes are private: only the concierge reads them." />
      <div className="flex flex-wrap items-start gap-6">
        <div className="min-w-0 flex-[1.3_1_440px]"><FaqEditor faqs={(faqs.data ?? []) as Faq[]} /></div>
        <div className="min-w-0 flex-[1_1_340px]"><KnowledgeEditor notes={(notes.data ?? []) as { id: string; title: string; content: string }[]} /></div>
      </div>
    </div>
  );
}
