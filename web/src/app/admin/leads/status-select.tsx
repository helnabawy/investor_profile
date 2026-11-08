"use client";
import { useTransition } from "react";
import { setLeadStatus } from "../actions";

export function StatusSelect({ id, value }: { id: string; value: string }) {
  const [pending, start] = useTransition();
  return (
    <select defaultValue={value} disabled={pending} onChange={(e) => start(() => setLeadStatus(id, e.target.value))} className="a-input !w-auto !py-1.5 text-sm" aria-label="Lead status">
      {["new", "contacted", "qualified", "closed"].map((s) => <option key={s}>{s}</option>)}
    </select>
  );
}
