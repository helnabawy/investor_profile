import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAdmin } from "@/lib/admin/context";
import { timeAgo } from "@/lib/admin/time";
import { Transcript } from "../transcript";

export default async function ChatTranscript({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { db, tenant } = await getAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data: msgs } = await db.from("chat_messages").select("role,content,created_at").eq("session_id", id).eq("tenant_id", tenant.id).order("created_at");
  if (!msgs?.length) notFound();
  const { data: lead } = await db.from("leads").select("id,name").eq("tenant_id", tenant.id).eq("session_id", id).maybeSingle();
  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin/chats" className="a-link inline-flex min-h-11 items-center gap-1.5 self-start"><ArrowLeft size={16} aria-hidden /> All conversations</Link>
      <Transcript
        title={msgs.find((m) => m.role === "user")?.content ?? "Conversation"}
        meta={`${timeAgo(msgs[0].created_at)} · ${msgs.length} messages`}
        assistant={tenant.ai_config?.assistantName || `${tenant.name} concierge`}
        messages={msgs}
        lead={lead ?? undefined}
      />
    </div>
  );
}
