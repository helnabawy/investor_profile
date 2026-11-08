import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdmin } from "@/lib/admin/context";
import { PageTitle } from "@/components/admin/ui";

export default async function ChatTranscript({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { db, tenant } = await getAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data: msgs } = await db.from("chat_messages").select("role,content,created_at").eq("session_id", id).eq("tenant_id", tenant.id).order("created_at");
  if (!msgs?.length) notFound();
  return (
    <div>
      <PageTitle title="Conversation" subtitle={new Date(msgs[0].created_at).toLocaleString()}>
        <Link href="/admin/chats" className="a-btn a-btn-ghost">Back</Link>
      </PageTitle>
      <div className="a-card space-y-3">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : ""}`}>
            <p className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${m.role === "user" ? "bg-teal-700 text-white" : "bg-slate-100"}`}>{m.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
