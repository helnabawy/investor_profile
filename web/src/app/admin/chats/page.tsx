import Link from "next/link";
import { getAdmin } from "@/lib/admin/context";
import { PageTitle } from "@/components/admin/ui";

export default async function ChatsPage() {
  const { db, tenant } = await getAdmin();
  const { data } = await db.from("chat_sessions")
    .select("id,created_at,updated_at,chat_messages(content,role,created_at)")
    .eq("tenant_id", tenant.id).order("updated_at", { ascending: false }).limit(100);
  const sessions = (data ?? []) as { id: string; updated_at: string; chat_messages: { content: string; role: string; created_at: string }[] }[];
  return (
    <div>
      <PageTitle title="Conversations" subtitle="Every chat with your AI concierge. Use them to spot what visitors ask about." />
      <div className="a-card divide-y !p-0">
        {sessions.filter((s) => s.chat_messages.length).map((s) => {
          const first = [...s.chat_messages].sort((a, b) => a.created_at.localeCompare(b.created_at)).find((m) => m.role === "user");
          return (
            <Link key={s.id} href={`/admin/chats/${s.id}`} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-slate-50">
              <p className="truncate text-sm">{first?.content ?? "…"}</p>
              <p className="shrink-0 text-xs text-slate-400">{s.chat_messages.length} msgs · {new Date(s.updated_at).toLocaleString()}</p>
            </Link>
          );
        })}
        {!sessions.some((s) => s.chat_messages.length) && <p className="p-6 text-sm text-slate-500">No conversations yet.</p>}
      </div>
    </div>
  );
}
