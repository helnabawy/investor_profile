"use client";
import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Copy, ExternalLink, Trash2 } from "lucide-react";
import { SECTION_DEFS, SECTION_MAP, newSection, type Field, type Section } from "@/lib/sections/registry";
import type { Page } from "@/lib/types";
import { deletePage, savePage, type ActionResult } from "../../actions";
import { FormMessage, PageTitle } from "@/components/admin/ui";
import { ImageField, UploadButton } from "@/components/admin/image-upload";

type Props = Record<string, unknown>;

export function PageBuilder({ page, tenantId, siteUrl }: { page: Page; tenantId: string; siteUrl: string }) {
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [description, setDescription] = useState(page.description ?? "");
  const [published, setPublished] = useState(page.published);
  const [sections, setSections] = useState<Section[]>(page.sections ?? []);
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [state, setState] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();
  const isHome = page.slug === "";

  const update = (id: string, props: Props) => { setSections((s) => s.map((x) => (x.id === id ? { ...x, props } : x))); setState(null); };
  const move = (i: number, d: number) => setSections((s) => { const a = [...s]; [a[i], a[i + d]] = [a[i + d], a[i]]; return a; });

  return (
    <div className="space-y-6">
      <PageTitle title={`Edit: ${title || "Untitled"}`} subtitle={`/${slug}`}>
        <div className="flex gap-2">
          <a href={`${siteUrl.replace(/\/$/, "")}/${slug}`} target="_blank" rel="noreferrer" className="a-btn a-btn-ghost"><ExternalLink size={14} /> View</a>
          <button className="a-btn a-btn-primary" disabled={pending} onClick={() => start(async () => setState(await savePage(page.id, { title, slug, description, published, sections })))}>
            {pending ? "Saving…" : "Save page"}
          </button>
        </div>
      </PageTitle>
      <FormMessage state={state} />

      <section className="a-card grid gap-4 sm:grid-cols-2">
        <label className="field"><span>Page title</span><input value={title} onChange={(e) => setTitle(e.target.value)} /></label>
        <label className="field"><span>URL</span><input value={slug} disabled={isHome} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} />{isHome && <small>This is your home page.</small>}</label>
        <label className="field sm:col-span-2"><span>SEO description</span><input value={description} onChange={(e) => setDescription(e.target.value)} maxLength={300} /></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} /> Published</label>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Sections</h2>
        {sections.map((s, i) => {
          const def = SECTION_MAP[s.type];
          const isOpen = open === s.id;
          return (
            <div key={s.id} className="a-card !p-0">
              <div className="flex items-center gap-2 px-4 py-3">
                <button className="flex flex-1 items-center gap-2 text-left" onClick={() => setOpen(isOpen ? null : s.id)}>
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <span className="font-medium">{def?.label ?? s.type}</span>
                  <span className="truncate text-sm text-slate-500">{String((s.props as Props).title ?? "")}</span>
                </button>
                <button className="a-btn a-btn-ghost !px-2" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up"><ArrowUp size={14} /></button>
                <button className="a-btn a-btn-ghost !px-2" disabled={i === sections.length - 1} onClick={() => move(i, 1)} aria-label="Move down"><ArrowDown size={14} /></button>
                <button className="a-btn a-btn-ghost !px-2" aria-label="Duplicate" onClick={() => setSections((x) => [...x.slice(0, i + 1), { ...structuredClone(s), id: newSection(s.type).id }, ...x.slice(i + 1)])}><Copy size={14} /></button>
                <button className="a-btn a-btn-danger !px-2" aria-label="Remove" onClick={() => setSections((x) => x.filter((y) => y.id !== s.id))}><Trash2 size={14} /></button>
              </div>
              {isOpen && def && (
                <div className="grid gap-4 border-t px-4 py-4">
                  <FieldsEditor fields={def.fields} value={s.props as Props} onChange={(p) => update(s.id, p)} tenantId={tenantId} />
                </div>
              )}
            </div>
          );
        })}
        {adding ? (
          <div className="a-card">
            <div className="mb-3 flex items-center justify-between"><p className="font-medium">Add a section</p><button className="text-sm text-slate-500" onClick={() => setAdding(false)}>Cancel</button></div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {SECTION_DEFS.map((d) => (
                <button key={d.type} className="rounded-lg border p-3 text-left hover:border-blue-500 hover:bg-blue-50" onClick={() => {
                  const ns = newSection(d.type);
                  setSections((x) => [...x, ns]); setOpen(ns.id); setAdding(false);
                }}>
                  <p className="text-sm font-medium">{d.label}</p>
                  <p className="text-xs text-slate-500">{d.description}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <button className="a-btn a-btn-ghost w-full border-dashed" onClick={() => setAdding(true)}>+ Add section</button>
        )}
      </section>

      {!isHome && (
        <form action={deletePage.bind(null, page.id)} onSubmit={(e) => { if (!window.confirm("Delete this page?")) e.preventDefault(); }}>
          <button className="a-btn a-btn-danger"><Trash2 size={14} /> Delete page</button>
        </form>
      )}
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
                      <img src={src} alt="" className="h-16 w-24 rounded border object-cover" />
                      <button className="absolute -right-1.5 -top-1.5 rounded-full bg-white px-1.5 text-xs shadow" onClick={() => set(f.name, imgs.filter((_, j) => j !== i))} aria-label="Remove image">×</button>
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
                    <div key={i} className="grid gap-2 rounded-lg border bg-slate-50 p-3">
                      <FieldsEditor fields={f.itemFields ?? []} value={typeof it === "object" ? it : { text: it }} tenantId={tenantId}
                        onChange={(nv) => set(f.name, items.map((x, j) => (j === i ? nv : x)))} />
                      <button className="justify-self-end text-xs text-red-600" onClick={() => set(f.name, items.filter((_, j) => j !== i))}>Remove</button>
                    </div>
                  ))}
                  <button className="a-btn a-btn-ghost" onClick={() => set(f.name, [...items, {}])}>+ Add item</button>
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
