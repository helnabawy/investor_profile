"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowDown, ArrowLeft, ArrowUp, Copy, ExternalLink, Plus, Trash2, X } from "lucide-react";
import { SECTION_DEFS, SECTION_MAP, newSection, type Field, type Section } from "@/lib/sections/registry";
import type { Page } from "@/lib/types";
import { deletePage, savePage, type ActionResult } from "../../actions";
import { FormMessage } from "@/components/admin/ui";
import { ImageField, UploadButton } from "@/components/admin/image-upload";

type Props = Record<string, unknown>;

/** Three panes: the page's sections in order, the selected section's fields, and page settings. */
export function PageBuilder({ page, tenantId, siteUrl }: { page: Page; tenantId: string; siteUrl: string }) {
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [description, setDescription] = useState(page.description ?? "");
  const [published, setPublished] = useState(page.published);
  const [sections, setSections] = useState<Section[]>(page.sections ?? []);
  const [open, setOpen] = useState<string | null>(page.sections?.[0]?.id ?? null);
  const [adding, setAdding] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [state, setState] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();
  const isHome = page.slug === "";
  const touch = () => { setDirty(true); setState(null); };
  const edit = (fn: (s: Section[]) => Section[]) => { setSections(fn); touch(); };
  const update = (id: string, props: Props) => edit((s) => s.map((x) => (x.id === id ? { ...x, props } : x)));
  const move = (i: number, d: number) => edit((s) => { const a = [...s]; [a[i], a[i + d]] = [a[i + d], a[i]]; return a; });
  const selected = sections.find((s) => s.id === open);
  const def = selected && SECTION_MAP[selected.type];
  const save = () => start(async () => { const r = await savePage(page.id, { title, slug, description, published, sections }); setState(r); if (r.ok) setDirty(false); });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
          <Link href="/admin/pages" aria-label="Back to pages" className="a-btn a-btn-ghost !w-11 !px-0"><ArrowLeft size={18} aria-hidden /></Link>
          <div className="min-w-0">
            <p className="a-muted text-sm">Pages · /{slug}</p>
            <h1 className="truncate text-[1.4rem] font-semibold leading-tight tracking-[-0.02em]">{title || "Untitled"}</h1>
          </div>
          <span className={`a-pill ${published ? "a-pill-green" : "a-pill-grey"}`}>{published ? "Published" : "Draft"}</span>
          {dirty && <span className="text-sm text-warning">Unsaved changes</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FormMessage state={state} />
          <a href={`${siteUrl.replace(/\/$/, "")}/${slug}`} target="_blank" rel="noreferrer" className="a-btn a-btn-ghost">View live <ExternalLink size={15} aria-hidden /></a>
          <button className="a-btn a-btn-primary" disabled={pending} onClick={save}>{pending ? "Saving…" : "Save page"}</button>
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-6">
        <nav aria-label="Page sections" className="flex min-w-0 flex-[1_1_280px] flex-col gap-1 rounded-xl border bg-surface p-3 lg:sticky lg:top-6">
          <h2 className="px-2 pb-2 pt-1 text-[0.95rem] font-semibold">Sections <span className="a-muted font-normal">top to bottom</span></h2>
          {sections.map((s, i) => {
            const label = SECTION_MAP[s.type]?.label ?? s.type;
            const sub = String((s.props as Props).title ?? "");
            const on = s.id === open;
            return (
              <div key={s.id} className={`group flex items-center gap-1 rounded-lg border transition-colors ${on ? "border-brand bg-brand-tint" : "border-transparent hover:bg-sunken"}`}>
                <button type="button" aria-current={on || undefined} className="flex min-h-[52px] min-w-0 flex-1 flex-col justify-center px-2.5 py-1.5 text-left" onClick={() => { setOpen(s.id); setAdding(false); }}>
                  <span className="text-[0.95rem] font-medium leading-tight">{label}</span>
                  {sub && <span className="a-muted truncate text-[0.82rem]">{sub}</span>}
                </button>
                <span className={`flex shrink-0 pr-1 ${on ? "" : "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"} transition-opacity`}>
                  <button type="button" className="rounded-md p-2.5 text-ink-2 hover:bg-surface disabled:opacity-30" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Move ${label} up`}><ArrowUp size={15} aria-hidden /></button>
                  <button type="button" className="rounded-md p-2.5 text-ink-2 hover:bg-surface disabled:opacity-30" disabled={i === sections.length - 1} onClick={() => move(i, 1)} aria-label={`Move ${label} down`}><ArrowDown size={15} aria-hidden /></button>
                </span>
              </div>
            );
          })}
          {!sections.length && <p className="a-muted px-2 py-3 text-sm">This page has no sections yet.</p>}
          <button type="button" className={`a-btn mt-2 border border-dashed ${adding ? "border-brand bg-brand-tint text-brand-strong" : "border-line-bold bg-surface"}`} onClick={() => setAdding(true)}><Plus size={16} aria-hidden /> Add section</button>
        </nav>

        <section aria-label="Edit section" className="flex min-w-0 flex-[2_1_440px] flex-col rounded-xl border bg-surface">
          {adding ? (
            <div key="add" className="rise flex flex-col gap-4 p-5">
              <div className="flex items-center justify-between gap-3">
                <div><h2 className="text-[1.05rem] font-semibold">Add a section</h2><p className="a-muted text-sm">It is added at the bottom. Move it up from the list.</p></div>
                <button type="button" className="a-btn a-btn-ghost !w-11 !px-0" onClick={() => setAdding(false)} aria-label="Close"><X size={16} aria-hidden /></button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {SECTION_DEFS.map((d) => (
                  <button key={d.type} type="button" className="rounded-lg border p-3.5 text-left transition-colors hover:border-brand hover:bg-brand-tint" onClick={() => {
                    const ns = newSection(d.type);
                    edit((x) => [...x, ns]); setOpen(ns.id); setAdding(false);
                  }}>
                    <span className="block font-medium">{d.label}</span>
                    <span className="a-muted block text-[0.85rem]">{d.description}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : selected && def ? (
            <div key={selected.id} className="rise flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
                <div className="min-w-0"><h2 className="text-[1.05rem] font-semibold">{def.label}</h2><p className="a-muted text-sm">{def.description}</p></div>
                <span className="flex gap-2">
                  <button type="button" className="a-btn a-btn-ghost a-btn-sm" onClick={() => { const i = sections.indexOf(selected); const copy = { ...structuredClone(selected), id: newSection(selected.type).id }; edit((x) => [...x.slice(0, i + 1), copy, ...x.slice(i + 1)]); setOpen(copy.id); }}><Copy size={15} aria-hidden /> Duplicate</button>
                  <button type="button" className="a-btn a-btn-danger a-btn-sm" onClick={() => { edit((x) => x.filter((y) => y.id !== selected.id)); setOpen(null); }}><Trash2 size={15} aria-hidden /> Remove</button>
                </span>
              </div>
              <div className="grid gap-4 p-5">
                <FieldsEditor fields={def.fields} value={selected.props as Props} onChange={(p) => update(selected.id, p)} tenantId={tenantId} />
              </div>
            </div>
          ) : (
            <p className="a-muted p-10 text-center">Select a section on the left to edit it, or add a new one.</p>
          )}
        </section>

        <aside className="flex min-w-0 flex-[1_1_260px] flex-col gap-4 rounded-xl border bg-surface p-5">
          <h2 className="text-[1.05rem] font-semibold">Page settings</h2>
          <label className="field"><span>Page title</span><input value={title} onChange={(e) => { setTitle(e.target.value); touch(); }} /></label>
          <label className="field"><span>Address</span><input value={slug} disabled={isHome} onChange={(e) => { setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")); touch(); }} />{isHome && <small>This is your home page.</small>}</label>
          <label className="field"><span>Search description</span><textarea rows={3} value={description} onChange={(e) => { setDescription(e.target.value); touch(); }} maxLength={300} /><small>Shown by Google under your page title.</small></label>
          <label className="flex cursor-pointer items-center gap-3"><input type="checkbox" className="h-5 w-5" checked={published} onChange={(e) => { setPublished(e.target.checked); touch(); }} /> <span className="font-medium">Published</span></label>
          {!isHome && (
            <form action={deletePage.bind(null, page.id)} onSubmit={(e) => { if (!window.confirm("Delete this page? This cannot be undone.")) e.preventDefault(); }} className="border-t pt-4">
              <button className="a-btn a-btn-danger"><Trash2 size={15} aria-hidden /> Delete page</button>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}

function FieldsEditor({ fields, value, onChange, tenantId }: { fields: Field[]; value: Props; onChange: (v: Props) => void; tenantId: string }) {
  const set = (k: string, v: unknown) => onChange({ ...value, [k]: v });
  return (
    <>
      {fields.map((f) => {
        const v = value[f.name];
        switch (f.type) {
          case "textarea":
            return <label key={f.name} className="field"><span>{f.label}</span><textarea rows={3} value={String(v ?? "")} onChange={(e) => set(f.name, e.target.value)} /></label>;
          case "number":
            return <label key={f.name} className="field"><span>{f.label}</span><input type="number" min={1} max={24} value={Number(v ?? 0) || ""} onChange={(e) => set(f.name, Number(e.target.value))} /></label>;
          case "select":
            return <label key={f.name} className="field"><span>{f.label}</span><select value={String(v ?? "")} onChange={(e) => set(f.name, e.target.value)}>{f.options?.map((o) => <option key={o}>{o}</option>)}</select></label>;
          case "image":
            return <ImageField key={f.name} tenantId={tenantId} label={f.label} value={String(v ?? "")} onChange={(x) => set(f.name, x)} />;
          case "images": {
            const imgs = Array.isArray(v) ? (v as string[]) : [];
            return (
              <div key={f.name} className="field">
                <span>{f.label}</span>
                <div className="flex flex-wrap gap-2">
                  {imgs.map((src, i) => (
                    <div key={i} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="h-16 w-24 rounded-md border object-cover" />
                      <button type="button" className="absolute -right-1.5 -top-1.5 rounded-full bg-surface px-1.5 text-xs shadow" onClick={() => set(f.name, imgs.filter((_, j) => j !== i))} aria-label="Remove image">×</button>
                    </div>
                  ))}
                </div>
                <UploadButton tenantId={tenantId} multiple label="Add images" onUploaded={(u) => set(f.name, [...imgs, ...u])} />
              </div>
            );
          }
          case "list": {
            const items = Array.isArray(v) ? (v as Props[]) : [];
            return (
              <div key={f.name} className="field">
                <span>{f.label}</span>
                <div className="space-y-2">
                  {items.map((it, i) => (
                    <div key={i} className="grid gap-3 rounded-lg border bg-subtle p-3.5">
                      <FieldsEditor fields={f.itemFields ?? []} value={typeof it === "object" ? it : { text: it }} tenantId={tenantId}
                        onChange={(nv) => set(f.name, items.map((x, j) => (j === i ? nv : x)))} />
                      <button type="button" className="a-link min-h-11 justify-self-end text-sm !text-danger" onClick={() => set(f.name, items.filter((_, j) => j !== i))}>Remove</button>
                    </div>
                  ))}
                  <button type="button" className="a-btn a-btn-ghost border-dashed" onClick={() => set(f.name, [...items, {}])}>+ Add item</button>
                </div>
              </div>
            );
          }
          default:
            return <label key={f.name} className="field"><span>{f.label}</span><input value={String(v ?? "")} placeholder={f.placeholder} onChange={(e) => set(f.name, e.target.value)} /></label>;
        }
      })}
    </>
  );
}
