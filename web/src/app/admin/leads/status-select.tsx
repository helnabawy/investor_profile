"use client";
import { useTransition } from "react";
import { setLeadStatus } from "../actions";
import { useAdminT } from "@/components/admin/i18n";

const OPTIONS = ["new", "contacted", "qualified", "closed"] as const;

export function StatusSelect({ id, value }: { id: string; value: string }) {
  const [pending, start] = useTransition();
  const { t } = useAdminT();
  return (
    <select defaultValue={value} disabled={pending} onChange={(e) => start(() => setLeadStatus(id, e.target.value))} className="a-input" aria-label={t.leads.statusAria}>
      {OPTIONS.map((v) => <option key={v} value={v}>{t.leads.statuses[v]}</option>)}
    </select>
  );
}
