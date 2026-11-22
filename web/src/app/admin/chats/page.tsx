import Link from "next/link";
import { getAdmin } from "@/lib/admin/context";
import { PageTitle } from "@/components/admin/ui";
import { timeAgo } from "@/lib/admin/time";
import { Transcript } from "./transcript";

type Msg = { content: string; role: string; created_at: string };

export default async function ChatsPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { db, tenant } = await getAdmin();
  const { id } = await searchParams;
  const { data } = await db.from("chat_sessions")
    .select("id,created_at,updated_at,chat_messages(content,role,created_at)")
    .eq("tenant_id", tenant.id).order("updated_at", { ascending: false }).limit(100);
  const sessions = ((data ?? []) as { id: string; updated_at: string; chat_messages: Msg[] }[])
    .filter((s) => s.chat_messages.length)
    .map((s) => ({ ...s, chat_messages: [...s.chat_messages].sort((a, b) => a.created_at.localeCompare(b.created_at)) }));
  const { data: leadRows } = await db.from("leads").select("id,name,session_id").eq("tenant_id", tenant.id).in("session_id", sessions.map((s) => s.id));
  const leadFor = new Map((leadRows ?? []).map((l) => [l.session_id as string, l as { id: string; name: string | null }]));
  const cur = sessions.find((s) => s.id === id) ?? sessions[0];
  const first = (s: (typeof sessions)[number]) => s.chat_messages.find((m) => m.role === "user")?.content ?? "…";

  return (
    <div>
      <PageTitle title="Conversations" subtitle="Every chat with your AI concierge. Use them to spot what visitors ask about." />
      {!sessions.length ? (
        <p className="a-card a-muted text-center">No conversations yet. They appear here as soon as a visitor talks to the concierge.</p>
      ) : (
        <div className="flex flex-wrap items-start gap-6">
          <nav aria-label="Conversations" className="stagger min-w-0 flex-[1_1_320px] overflow-hidden rounded-xl border bg-white">
            <p className="a-muted px-4 py-3.5 text-sm"><span className="font-semibold text-[#0f1728]">{sessions.length}</span> latest conversations</p>
            {sessions.map((s) => {
              const lead = leadFor.get(s.id);
              return (
                <Link key={s.id} href={`?id=${s.id}`} scroll={false} aria-current={s.id === cur.id ? "true" : undefined} className="a-row flex min-h-[72px] flex-col gap-1 border-t px-4 py-3">
                  <span className="flex items-baseline justify-between gap-3"><span className="truncate font-medium">{first(s)}</span><span className="a-muted shrink-0 text-[0.82rem]">{timeAgo(s.updated_at)}</span></span>
                  <span className="a-muted flex flex-wrap items-center gap-2 text-[0.85rem]">{s.chat_messages.length} messages{lead && <span className="a-pill a-pill-green">Became a lead</span>}</span>
                </Link>
              );
            })}
          </nav>
          <Transcript
            key={cur.id}
            className="p-pop flex-[1.7_1_440px]"
            title={first(cur)}
            meta={`${timeAgo(cur.updated_at)} · ${cur.chat_messages.length} messages`}
            assistant={tenant.ai_config?.assistantName || `${tenant.name} concierge`}
            messages={cur.chat_messages}
            lead={leadFor.get(cur.id)}
          />
        </div>
      )}
    </div>
  );
}
