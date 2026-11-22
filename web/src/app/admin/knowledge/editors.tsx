"use client";
import { useActionState, useState } from "react";
import { ChevronDown, Pencil, Plus } from "lucide-react";
import { deleteRow, saveFaq, saveKnowledge } from "../actions";
import { FormMessage, SubmitButton } from "@/components/admin/ui";
import type { Faq } from "@/lib/types";

type Note = { id: string; title: string; content: string };

/** One editable row: a summary line that opens into its form. New rows start open. */
function Row({ summary, detail, icon, open, children }: { summary: string; detail?: string; icon: React.ReactNode; open?: boolean; children: React.ReactNode }) {
  return (
    <details open={open} className="group border-t open:bg-brand-tint open:shadow-[inset_3px_0_0_var(--c-brand)]">
      <summary className="a-row flex min-h-[60px] cursor-pointer list-none items-center gap-3 px-5 py-2.5 group-open:hover:bg-transparent [&::-webkit-details-marker]:hidden">
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="font-medium">{summary}</span>
          {detail && <span className="line-clamp-2 text-[0.92rem] text-ink-2 group-open:hidden">{detail}</span>}
        </span>
        <span className="shrink-0 text-faint transition-transform duration-300 group-open:rotate-180">{icon}</span>
      </summary>
      <div className="px-5 pb-5 pt-1">{children}</div>
    </details>
  );
}

function FaqForm({ faq, onDone }: { faq?: Faq; onDone?: () => void }) {
  const [state, action] = useActionState(async (s: Awaited<ReturnType<typeof saveFaq>> | null, f: FormData) => {
    const r = await saveFaq(s, f);
    if (r.ok) onDone?.();
    return r;
  }, null);
  return (
    <form action={action} className="flex flex-col gap-3.5">
      {faq && <input type="hidden" name="id" value={faq.id} />}
      <label className="field"><span>Question</span><input name="question" defaultValue={faq?.question} required /></label>
      <label className="field"><span>Answer</span><textarea name="answer" defaultValue={faq?.answer} rows={3} required /></label>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <label className="field"><span>Position</span><input name="sort" type="number" defaultValue={faq?.sort ?? 0} className="!w-24" /></label>
        <div className="flex flex-wrap items-center gap-2">
          <FormMessage state={state} />
          {faq && <button type="button" className="a-btn a-btn-danger" onClick={() => { if (window.confirm("Delete this FAQ?")) deleteRow("faqs", faq.id); }}>Delete</button>}
          <SubmitButton>{faq ? "Save FAQ" : "Add FAQ"}</SubmitButton>
        </div>
      </div>
    </form>
  );
}

function NoteForm({ note, onDone }: { note?: Note; onDone?: () => void }) {
  const [state, action] = useActionState(async (s: Awaited<ReturnType<typeof saveKnowledge>> | null, f: FormData) => {
    const r = await saveKnowledge(s, f);
    if (r.ok) onDone?.();
    return r;
  }, null);
  return (
    <form action={action} className="flex flex-col gap-3.5">
      {note && <input type="hidden" name="id" value={note.id} />}
      <label className="field"><span>Topic</span><input name="title" defaultValue={note?.title} placeholder="e.g. Viewing process, Fees, Golden visa" required /></label>
      <label className="field"><span>What the concierge should know</span><textarea name="content" defaultValue={note?.content} rows={4} required /></label>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <FormMessage state={state} />
        {note && <button type="button" className="a-btn a-btn-danger" onClick={() => { if (window.confirm("Delete this note?")) deleteRow("knowledge", note.id); }}>Delete</button>}
        <SubmitButton>{note ? "Save note" : "Add note"}</SubmitButton>
      </div>
    </form>
  );
}

function Panel({ title, count, hint, add, children }: { title: string; count: number; hint: string; add: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 px-5 pb-4 pt-5">
        <div><h2 className="text-[1.05rem] font-semibold">{title} <span className="a-muted font-normal">{count}</span></h2><p className="a-muted text-sm">{hint}</p></div>
        {add}
      </div>
      {children}
    </section>
  );
}

export function FaqEditor({ faqs }: { faqs: Faq[] }) {
  const [adding, setAdding] = useState(false);
  return (
    <Panel title="FAQs" count={faqs.length} hint="Shown on your site in this order."
      add={!adding && <button type="button" className="a-btn a-btn-primary" onClick={() => setAdding(true)}><Plus size={16} aria-hidden /> Add FAQ</button>}>
      {adding && <div className="rise border-t bg-brand-tint px-5 py-5 shadow-[inset_3px_0_0_var(--c-brand)]"><FaqForm onDone={() => setAdding(false)} /></div>}
      {faqs.map((f) => <Row key={f.id} summary={f.question} detail={f.answer} icon={<ChevronDown size={18} aria-hidden />}><FaqForm faq={f} /></Row>)}
      {!faqs.length && !adding && <p className="a-muted border-t px-5 py-8 text-center">No FAQs yet. Add the questions buyers ask you most.</p>}
    </Panel>
  );
}

export function KnowledgeEditor({ notes }: { notes: Note[] }) {
  const [adding, setAdding] = useState(false);
  return (
    <Panel title="Knowledge notes" count={notes.length} hint="Private. Never shown on your site."
      add={!adding && <button type="button" className="a-btn a-btn-ghost" onClick={() => setAdding(true)}><Plus size={16} aria-hidden /> Add note</button>}>
      {adding && <div className="rise border-t bg-brand-tint px-5 py-5 shadow-[inset_3px_0_0_var(--c-brand)]"><NoteForm onDone={() => setAdding(false)} /></div>}
      {notes.map((n) => <Row key={n.id} summary={n.title} detail={n.content} icon={<Pencil size={16} aria-hidden />}><NoteForm note={n} /></Row>)}
      {!notes.length && !adding && <p className="a-muted border-t px-5 py-8 text-center">No notes yet. Add fees, viewing process or anything the concierge should know.</p>}
    </Panel>
  );
}
