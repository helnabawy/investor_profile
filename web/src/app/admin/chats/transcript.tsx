import Link from "next/link";

/** One concierge conversation, read-only. Used by the conversations list and the single-transcript route. */
export function Transcript({ title, meta, assistant, messages, lead, className = "" }: {
  title: string;
  meta: string;
  assistant: string;
  messages: { role: string; content: string }[];
  lead?: { id: string; name: string | null };
  className?: string;
}) {
  return (
    <section aria-label="Transcript" className={`flex min-w-0 flex-col overflow-hidden rounded-xl border bg-white ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2.5 border-b px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="a-muted text-sm">{meta}</p>
        </div>
        {lead && <Link href={`/admin/leads?id=${lead.id}`} className="a-btn a-btn-primary">Open lead{lead.name ? `: ${lead.name}` : ""}</Link>}
      </div>
      <div className="flex flex-col gap-3 bg-[#fafbfc] p-5">
        {messages.map((m, i) => {
          const user = m.role === "user";
          return (
            <div key={i} className={`flex max-w-[80%] flex-col gap-1 ${user ? "items-end self-end" : "items-start self-start"}`}>
              <span className="a-muted text-[0.8rem]">{user ? "Visitor" : assistant}</span>
              <p className={`whitespace-pre-wrap px-3.5 py-2.5 text-[0.95rem] ${user ? "rounded-[12px_4px_12px_12px] bg-[#1e46b8] text-white" : "rounded-[4px_12px_12px_12px] border bg-white"}`}>{m.content}</p>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t px-5 py-2">
        <p className="a-muted text-sm">A wrong or missing answer? Teach the concierge.</p>
        <Link href="/admin/knowledge" className="a-link inline-flex min-h-11 items-center text-[0.95rem]">Improve answers</Link>
      </div>
    </section>
  );
}
