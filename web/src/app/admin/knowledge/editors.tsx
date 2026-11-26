"use client";
import { useActionState, useState } from "react";
import { ChevronDown, Pencil, Plus } from "lucide-react";
import { deleteRow, saveFaq, saveKnowledge } from "../actions";
import { FormMessage, SubmitButton } from "@/components/admin/ui";
import type { Faq } from "@/lib/types";
import { BiInput, TranslateButton } from "@/components/admin/bilingual";
import { useAdminT } from "@/components/admin/i18n";

type Note = { id: string; title: string; content: string };

/** One editable row: a summary line that opens into its form. New rows start open. */
function Row({ summary, detail, icon, open, children }: { summary: string; detail?: string; icon: React.ReactNode; open?: boolean; children: React.ReactNode }) {
  return (
    <details open={open} className="group border-t open:bg-brand-tint open:shadow-[inset_3px_0_0_var(--c-brand)] rtl:open:shadow-[inset_-3px_0_0_var(--c-brand)]">
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
  const { t } = useAdminT();
  return (
    <form action={action} className="flex flex-col gap-3.5">
      {faq && <input type="hidden" name="id" value={faq.id} />}
      <BiInput name="question" label={t.faq.question} required defaultValue={faq?.question} defaultValueAr={faq?.question_ar} />
      <BiInput name="answer" label={t.faq.answer} multiline required defaultValue={faq?.answer} defaultValueAr={faq?.answer_ar} />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <label className="field"><span>{t.faq.position}</span><input name="sort" type="number" defaultValue={faq?.sort ?? 0} className="!w-24" /></label>
        <div className="flex flex-wrap items-center gap-2">
          <FormMessage state={state} />
          <TranslateButton />
          {faq && <button type="button" className="a-btn a-btn-danger" onClick={() => { if (window.confirm(t.faq.confirmDeleteFaq)) deleteRow("faqs", faq.id); }}>{t.ui.delete}</button>}
          <SubmitButton>{faq ? t.faq.saveFaq : t.faq.addFaq}</SubmitButton>
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
  const { t } = useAdminT();
  return (
    <form action={action} className="flex flex-col gap-3.5">
      {note && <input type="hidden" name="id" value={note.id} />}
      <label className="field"><span>{t.faq.topic}</span><input name="title" dir="auto" defaultValue={note?.title} placeholder={t.faq.topicPh} required /></label>
      <label className="field"><span>{t.faq.knows}</span><textarea name="content" dir="auto" defaultValue={note?.content} rows={4} required /></label>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <FormMessage state={state} />
        {note && <button type="button" className="a-btn a-btn-danger" onClick={() => { if (window.confirm(t.faq.confirmDeleteNote)) deleteRow("knowledge", note.id); }}>{t.ui.delete}</button>}
        <SubmitButton>{note ? t.faq.saveNote : t.faq.addNote}</SubmitButton>
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
  const { t, locale } = useAdminT();
  return (
    <Panel title={t.faq.faqs} count={faqs.length} hint={t.faq.faqsHint}
      add={!adding && <button type="button" className="a-btn a-btn-primary" onClick={() => setAdding(true)}><Plus size={16} aria-hidden /> {t.faq.addFaq}</button>}>
      {adding && <div className="rise border-t bg-brand-tint px-5 py-5 shadow-[inset_3px_0_0_var(--c-brand)]"><FaqForm onDone={() => setAdding(false)} /></div>}
      {faqs.map((f) => <Row key={f.id} summary={(locale === "ar" && f.question_ar) || f.question} detail={(locale === "ar" && f.answer_ar) || f.answer} icon={<ChevronDown size={18} aria-hidden />}><FaqForm faq={f} /></Row>)}
      {!faqs.length && !adding && <p className="a-muted border-t px-5 py-8 text-center">{t.faq.noFaqs}</p>}
    </Panel>
  );
}

export function KnowledgeEditor({ notes }: { notes: Note[] }) {
  const [adding, setAdding] = useState(false);
  const { t } = useAdminT();
  return (
    <Panel title={t.faq.notes} count={notes.length} hint={t.faq.notesHint}
      add={!adding && <button type="button" className="a-btn a-btn-ghost" onClick={() => setAdding(true)}><Plus size={16} aria-hidden /> {t.faq.addNote}</button>}>
      {adding && <div className="rise border-t bg-brand-tint px-5 py-5 shadow-[inset_3px_0_0_var(--c-brand)]"><NoteForm onDone={() => setAdding(false)} /></div>}
      {notes.map((n) => <Row key={n.id} summary={n.title} detail={n.content} icon={<Pencil size={16} aria-hidden />}><NoteForm note={n} /></Row>)}
      {!notes.length && !adding && <p className="a-muted border-t px-5 py-8 text-center">{t.faq.noNotes}</p>}
    </Panel>
  );
}
