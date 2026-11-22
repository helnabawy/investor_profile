"use client";
import { useTransition } from "react";
import { setLeadStatus } from "../actions";

const OPTIONS = [["new", "New"], ["contacted", "Contacted"], ["qualified", "Qualified"], ["closed", "Closed"]];

export function StatusSelect({ id, value }: { id: string; value: string }) {
  const [pending, start] = useTransition();
  return (
    <select defaultValue={value} disabled={pending} onChange={(e) => start(() => setLeadStatus(id, e.target.value))} className="a-input" aria-label="Lead status">
      {OPTIONS.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
    </select>
  );
}
