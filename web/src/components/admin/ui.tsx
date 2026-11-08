"use client";
import { useFormStatus } from "react-dom";
import type { ActionResult } from "@/app/admin/actions";

export function PageTitle({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function SubmitButton({ children, className = "a-btn a-btn-primary" }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return <button className={className} disabled={pending}>{pending ? "Saving…" : children}</button>;
}

export function FormMessage({ state }: { state: ActionResult | null }) {
  if (!state) return null;
  return state.ok ? <p className="text-sm text-teal-700">Saved ✓</p> : <p className="text-sm text-red-600">{state.error}</p>;
}
