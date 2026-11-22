"use client";
import { useActionState } from "react";
import { createPage } from "../actions";
import { FormMessage, SubmitButton } from "@/components/admin/ui";

export function NewPageForm() {
  const [state, action] = useActionState(createPage, null);
  return (
    <form action={action} className="a-card flex flex-col gap-4">
      <div><h2 className="text-[1.05rem] font-semibold">Add a page</h2><p className="a-muted text-sm">For example a Golden Visa guide or an area overview.</p></div>
      <div className="flex flex-wrap items-end gap-3">
        <label className="field min-w-0 flex-[1_1_220px]"><span>Page title</span><input name="title" required placeholder="e.g. Golden Visa" /></label>
        <label className="field min-w-0 flex-[1_1_220px]"><span>Address</span><input name="slug" required placeholder="golden-visa" pattern="[a-z0-9-]+" /><small>Lowercase letters, numbers and dashes.</small></label>
        <div className="flex items-center gap-3 pb-[22px]"><SubmitButton>Create page</SubmitButton><FormMessage state={state} /></div>
      </div>
    </form>
  );
}
