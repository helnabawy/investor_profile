"use client";
import { useFormStatus } from "react-dom";
import type { ActionResult } from "@/app/admin/actions";
import { upgradeUrl } from "@/lib/plans";
import { useAdminT } from "./i18n";

/** One line telling an agent that something needs a higher plan, with the way to get it. */
export function UpgradeNote({ children }: { children: React.ReactNode }) {
  const { t } = useAdminT();
  return (
    <p className="rounded-lg bg-warning-soft px-4 py-3 text-sm text-warning-strong">
      {children}{" "}
      {upgradeUrl ? <a href={upgradeUrl} className="font-semibold underline">{t.ui.seePlans}</a> : t.ui.contactToUpgrade}
    </p>
  );
}

export function PageTitle({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-[1.6rem] font-semibold leading-tight tracking-[-0.02em]">{title}</h1>
        {subtitle && <p className="a-muted mt-1 max-w-2xl">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function SubmitButton({ children, className = "a-btn a-btn-primary", pendingLabel }: { children: React.ReactNode; className?: string; pendingLabel?: string }) {
  const { pending } = useFormStatus();
  const { t } = useAdminT();
  return <button className={className} disabled={pending}>{pending ? pendingLabel ?? t.ui.saving : children}</button>;
}

export function FormMessage({ state }: { state: ActionResult | null }) {
  const { t } = useAdminT();
  if (!state) return null;
  return state.ok
    ? <p role="status" className="rise text-sm font-medium text-success">{t.ui.saved}</p>
    : <p role="alert" className="rise text-sm font-medium text-danger">{state.error}</p>;
}
