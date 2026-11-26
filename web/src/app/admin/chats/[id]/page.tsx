import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAdmin } from "@/lib/admin/context";
import { timeAgo } from "@/lib/admin/time";
import { Transcript } from "../transcript";
import { adminT } from "@/lib/i18n/admin-server";

export default async function ChatTranscript({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { db, tenant } = await getAdmin();
  const { t, locale } = await adminT();
  const tc = t.chats;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data: msgs } = await db.from("chat_messages").select("role,content,created_at").eq("session_id", id).eq("tenant_id", tenant.id).order("created_at");
  if (!msgs?.length) notFound();
  const { data: lead } = await db.from("leads").select("id,name").eq("tenant_id", tenant.id).eq("session_id", id).maybeSingle();
  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin/chats" className="a-link inline-flex min-h-11 items-center gap-1.5 self-start"><ArrowLeft size={16} aria-hidden className="rtl:-scale-x-100" /> {tc.allConversations}</Link>
      <Transcript
        title={msgs.find((m) => m.role === "user")?.content ?? tc.conversation}
        meta={`${timeAgo(msgs[0].created_at, locale)} · ${tc.messages(msgs.length)}`}
        assistant={tenant.ai_config?.assistantName || tc.assistant(tenant.name)}
        messages={msgs}
        lead={lead ?? undefined}
      />
    </div>
  );
}
