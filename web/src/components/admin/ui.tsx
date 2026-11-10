"use client";
import { useFormStatus } from "react-dom";
import type { ActionResult } from "@/app/admin/actions";

export function PageTitle({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[1.75rem] font-bold leading-tight">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-slate-600">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function SubmitButton({ children, className = "a-btn a-btn-primary", pendingLabel = "Saving…" }: { children: React.ReactNode; className?: string; pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return <button className={className} disabled={pending}>{pending ? pendingLabel : children}</button>;
}

export function FormMessage({ state }: { state: ActionResult | null }) {
  if (!state) return null;
  return state.ok
    ? <p role="status" className="text-sm font-medium text-green-700">Saved ✓</p>
    : <p role="alert" className="text-sm font-medium text-red-700">{state.error}</p>;
}
