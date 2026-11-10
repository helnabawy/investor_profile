"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Monitor, Smartphone } from "lucide-react";
import { discardDraft, publishDraft } from "../actions";
import { SubmitButton } from "@/components/admin/ui";

type Change = { label: string; detail: string; href: string };

/** Full-screen preview: the agent's real site, rendered with the draft theme, in an iframe. */
export function PreviewFrame({ siteName, origin, token, pages, changes }: {
  siteName: string; origin: string; token: string; pages: { label: string; href: string }[]; changes: Change[];
}) {
  const [device, setDevice] = useState<"desktop" | "phone">("desktop");
  const [path, setPath] = useState("/");
  const count = changes.length;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-200">
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 bg-slate-900 px-4 py-2.5 text-white">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link href="/admin/theme" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold hover:text-slate-200">
            <ArrowLeft size={18} /> Back to editing
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-950 px-3 py-1 text-xs font-semibold text-amber-200">
            <span aria-hidden className="h-2 w-2 rounded-full bg-amber-200" /> Preview · only you can see this
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <label className="flex items-center gap-2 text-sm text-slate-300">
            Page
            <select value={path} onChange={(e) => setPath(e.target.value)} className="min-h-11 rounded-lg border border-slate-600 bg-slate-800 px-3 text-sm text-white">
              {pages.map((p) => <option key={p.href} value={p.href}>{p.label}</option>)}
            </select>
          </label>
          <div role="group" aria-label="Screen size" className="flex overflow-hidden rounded-lg border border-slate-600">
            {([["desktop", "Desktop", Monitor], ["phone", "Phone", Smartphone]] as const).map(([id, label, Icon]) => (
              <button key={id} type="button" aria-pressed={device === id} onClick={() => setDevice(id)}
                className={`inline-flex min-h-11 items-center gap-2 px-4 text-sm font-semibold ${device === id ? "bg-white text-slate-900" : "text-white hover:bg-slate-800"}`}>
                <Icon size={17} /> {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <form action={discardDraft}>
            <SubmitButton pendingLabel="Discarding…" className="min-h-11 rounded-lg border border-slate-600 px-4 text-sm font-semibold hover:bg-slate-800">Discard changes</SubmitButton>
          </form>
          <form action={publishDraft}>
            <SubmitButton pendingLabel="Publishing…" className="min-h-11 rounded-lg bg-white px-5 text-sm font-semibold text-slate-900 hover:bg-slate-100">
              {count ? `Publish ${count} change${count > 1 ? "s" : ""}` : "Publish"}
            </SubmitButton>
          </form>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-wrap gap-5 overflow-auto p-5">
        <aside className="flex w-full flex-col gap-4 self-start rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 lg:w-80">
          <div>
            <h1 className="text-lg font-semibold">Unpublished changes</h1>
            <p className="mt-0.5 text-sm text-slate-600">Buyers still see your current site until you publish.</p>
          </div>
          {count ? (
            <ul className="flex flex-col gap-2.5">
              {changes.map((c) => (
                <li key={c.label} className="rounded-xl border border-slate-200 px-4 py-3">
                  <p className="text-xs text-slate-500">{c.label}</p>
                  <p className="font-semibold">{c.detail}</p>
                  <Link href={c.href} className="inline-flex min-h-11 items-center text-sm font-semibold text-blue-700 hover:text-blue-900">Change</Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-600">This draft matches your live site.</p>
          )}
        </aside>

        <section aria-label={`Preview of ${siteName}`} className="flex min-h-[640px] min-w-0 flex-1 justify-center">
          <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-xl transition-[max-width] duration-300"
            style={{ maxWidth: device === "phone" ? 390 : "100%" }}>
            <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-3 py-2">
              <span aria-hidden className="flex gap-1.5">{[0, 1, 2].map((i) => <span key={i} className="h-2.5 w-2.5 rounded-full bg-slate-300" />)}</span>
              <span className="min-w-0 flex-1 truncate rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">{siteName} · preview{path === "/" ? "" : ` · ${path}`}</span>
            </div>
            <iframe key={path} src={`${origin}/api/preview?token=${encodeURIComponent(token)}&path=${encodeURIComponent(path)}`} title={`${siteName} preview`} className="min-h-0 w-full flex-1 bg-white" />
          </div>
        </section>
      </div>
    </div>
  );
}
