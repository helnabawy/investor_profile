"use client";
import { useActionState } from "react";
import { createPage } from "../actions";
import { FormMessage, SubmitButton } from "@/components/admin/ui";

export function NewPageForm() {
  const [state, action] = useActionState(createPage, null);
  return (
    <form action={action} className="a-card flex flex-wrap items-end gap-3">
      <label className="field flex-1"><span>New page title</span><input name="title" required placeholder="e.g. Golden Visa" /></label>
      <label className="field flex-1"><span>URL</span><input name="slug" required placeholder="golden-visa" pattern="[a-z0-9-]+" /></label>
      <SubmitButton>Create page</SubmitButton>
      <div className="w-full"><FormMessage state={state} /></div>
    </form>
  );
}
