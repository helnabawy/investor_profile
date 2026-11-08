"use client";
import { useActionState } from "react";
import { deleteRow, saveFaq, saveKnowledge } from "../actions";
import { FormMessage, SubmitButton } from "@/components/admin/ui";
import type { Faq } from "@/lib/types";

function FaqRow({ faq }: { faq?: Faq }) {
  const [state, action] = useActionState(saveFaq, null);
  return (
    <form action={action} className="grid gap-2 border-b py-4 last:border-0">
      {faq && <input type="hidden" name="id" value={faq.id} />}
      <input name="question" defaultValue={faq?.question} placeholder="Question" className="a-input font-medium" required />
      <textarea name="answer" defaultValue={faq?.answer} placeholder="Answer" rows={2} className="a-input" required />
      <div className="flex items-center gap-2">
        <input name="sort" type="number" defaultValue={faq?.sort ?? 0} className="a-input !w-20" aria-label="Order" />
        <SubmitButton className="a-btn a-btn-ghost">{faq ? "Save" : "Add FAQ"}</SubmitButton>
        {faq && <button type="button" className="a-btn a-btn-danger" onClick={() => deleteRow("faqs", faq.id)}>Delete</button>}
        <FormMessage state={state} />
      </div>
    </form>
  );
}

export function FaqEditor({ faqs }: { faqs: Faq[] }) {
  return (
    <section className="a-card">
      <h2 className="font-semibold">FAQs</h2>
      {faqs.map((f) => <FaqRow key={f.id} faq={f} />)}
      <FaqRow key={`new-${faqs.length}`} />
    </section>
  );
}

function NoteRow({ note }: { note?: { id: string; title: string; content: string } }) {
  const [state, action] = useActionState(saveKnowledge, null);
  return (
    <form action={action} className="grid gap-2 border-b py-4 last:border-0">
      {note && <input type="hidden" name="id" value={note.id} />}
      <input name="title" defaultValue={note?.title} placeholder="Topic (e.g. Viewing process, Fees, Golden visa)" className="a-input font-medium" required />
      <textarea name="content" defaultValue={note?.content} placeholder="What the concierge should know…" rows={4} className="a-input" required />
      <div className="flex items-center gap-2">
        <SubmitButton className="a-btn a-btn-ghost">{note ? "Save" : "Add note"}</SubmitButton>
        {note && <button type="button" className="a-btn a-btn-danger" onClick={() => deleteRow("knowledge", note.id)}>Delete</button>}
        <FormMessage state={state} />
      </div>
    </form>
  );
}

export function KnowledgeEditor({ notes }: { notes: { id: string; title: string; content: string }[] }) {
  return (
    <section className="a-card">
      <h2 className="font-semibold">Knowledge notes</h2>
      {notes.map((n) => <NoteRow key={n.id} note={n} />)}
      <NoteRow key={`new-${notes.length}`} />
    </section>
  );
}
