"use client";
import { useActionState } from "react";
import { createPage } from "../actions";
import { FormMessage, SubmitButton } from "@/components/admin/ui";
import { BiInput } from "@/components/admin/bilingual";
import { useAdminT } from "@/components/admin/i18n";

export function NewPageForm() {
  const [state, action] = useActionState(createPage, null);
  const { t } = useAdminT();
  const n = t.newPage;
  return (
    <form action={action} className="a-card flex flex-col gap-4">
      <div><h2 className="text-[1.05rem] font-semibold">{n.heading}</h2><p className="a-muted text-sm">{n.hint}</p></div>
      <BiInput name="title" label={t.pages.pageTitle} required placeholder={n.titlePh} hint={n.titleHint} />
      <div className="flex flex-wrap items-end gap-3">
        <label className="field min-w-0 flex-[1_1_220px]"><span>{t.pages.address}</span><input name="slug" dir="ltr" required placeholder="golden-visa" pattern="[a-z0-9-]+" /><small>{n.slugHint}</small></label>
        <div className="flex items-center gap-3 pb-[22px]"><SubmitButton>{n.create}</SubmitButton><FormMessage state={state} /></div>
      </div>
    </form>
  );
}
