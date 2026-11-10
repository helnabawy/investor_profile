"use client";
import { useFormStatus } from "react-dom";
import type { ActionResult } from "@/app/admin/actions";
import { upgradeUrl } from "@/lib/plans";

/** One line telling an agent that something needs a higher plan, with the way to get it. */
export function UpgradeNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
      {children}{" "}
      {upgradeUrl ? <a href={upgradeUrl} className="font-semibold underline">See plans</a> : "Contact us to upgrade."}
    </p>
  );
}

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
    ? <p role="status" className="rise text-sm font-medium text-green-700">Saved ✓</p>
    : <p role="alert" className="rise text-sm font-medium text-red-700">{state.error}</p>;
}
