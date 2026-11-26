"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowDown, ArrowLeft, ArrowUp, Copy, ExternalLink, Plus, Trash2, X } from "lucide-react";
import { SECTION_DEFS, SECTION_MAP, TRANSLATABLE, newSection, type Field, type Section } from "@/lib/sections/registry";
import { builderLabel } from "@/lib/sections/labels-ar";
import { arKey } from "@/lib/i18n/content";
import type { Page } from "@/lib/types";
import { deletePage, savePage, type ActionResult } from "../../actions";
import { FormMessage } from "@/components/admin/ui";
import { ImageField, UploadButton } from "@/components/admin/image-upload";
import { BiField, TranslateButton } from "@/components/admin/bilingual";
import { useAdminT } from "@/components/admin/i18n";

type Props = Record<string, unknown>;
type Path = (string | number)[];

/** Text fields of a section (list items included) whose Arabic twin is empty while the English is filled. */
function missingArabic(fields: Field[], value: Props, path: Path = []): { path: Path; text: string }[] {
  return fields.flatMap((f) => {
    const v = value[f.name];
    if (f.type === "list" && Array.isArray(v)) {
      return v.flatMap((it, i) => (it && typeof it === "object" ? missingArabic(f.itemFields ?? [], it as Props, [...path, f.name, i]) : []));
    }
    if (!TRANSLATABLE.includes(f.type) || typeof v !== "string" || !v.trim()) return [];
    const ar = value[arKey(f.name)];
    return typeof ar === "string" && ar.trim() ? [] : [{ path: [...path, arKey(f.name)], text: v }];
  });
}

/** Copy of `obj` with `v` at `path`. */
function setAt(obj: unknown, path: Path, v: unknown): unknown {
  if (!path.length) return v;
  const [k, ...rest] = path;
  if (Array.isArray(obj)) return obj.map((x, i) => (i === k ? setAt(x, rest, v) : x));
  const o = (obj && typeof obj === "object" ? obj : {}) as Props;
  return { ...o, [k]: setAt(o[k as string], rest, v) };
}

/** Three panes: the page's sections in order, the selected section's fields, and page settings. */
export function PageBuilder({ page, tenantId, siteUrl }: { page: Page; tenantId: string; siteUrl: string }) {
  const { t, locale } = useAdminT();
  const tp = t.pages;
  const L = (s: string) => builderLabel(s, locale);
  const [title, setTitle] = useState(page.title);
  const [titleAr, setTitleAr] = useState(page.title_ar ?? "");
  const [slug, setSlug] = useState(page.slug);
  const [description, setDescription] = useState(page.description ?? "");
  const [descriptionAr, setDescriptionAr] = useState(page.description_ar ?? "");
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
  const save = () => start(async () => {
    const r = await savePage(page.id, { title, title_ar: titleAr, slug, description, description_ar: descriptionAr, published, sections });
    setState(r);
    if (r.ok) setDirty(false);
  });

  // Every section's missing Arabic, plus the page title and description, translated in one go.
  const collect = () => {
    const texts: Record<string, string> = {};
    if (title.trim() && !titleAr.trim()) texts["page|title"] = title;
    if (description.trim() && !descriptionAr.trim()) texts["page|description"] = description;
    sections.forEach((s, i) => {
      const d = SECTION_MAP[s.type];
      if (d) missingArabic(d.fields, s.props as Props).forEach((m) => { texts[JSON.stringify([i, ...m.path])] = m.text; });
    });
    return texts;
  };
  const apply = (map: Record<string, string>) => {
    if (map["page|title"]) setTitleAr(map["page|title"]);
    if (map["page|description"]) setDescriptionAr(map["page|description"]);
    let next: unknown = sections;
    for (const [key, v] of Object.entries(map)) {
      if (key.startsWith("page|")) continue;
      const [i, ...path] = JSON.parse(key) as Path;
      next = setAt(next, [i, "props", ...path], v);
    }
    setSections(next as Section[]);
    touch();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
          <Link href="/admin/pages" aria-label={tp.backToPages} className="a-btn a-btn-ghost !w-11 !px-0"><ArrowLeft size={18} className="rtl:-scale-x-100" aria-hidden /></Link>
          <div className="min-w-0">
            <p className="a-muted text-sm">{tp.breadcrumb(slug)}</p>
            <h1 className="truncate text-[1.4rem] font-semibold leading-tight tracking-[-0.02em]">{(locale === "ar" && titleAr) || title || tp.untitled}</h1>
          </div>
          <span className={`a-pill ${published ? "a-pill-green" : "a-pill-grey"}`}>{published ? t.ui.published : t.ui.draft}</span>
          {dirty && <span className="text-sm text-warning">{tp.unsaved}</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FormMessage state={state} />
          <TranslateButton collect={collect} apply={apply} />
          <a href={`${siteUrl.replace(/\/$/, "")}/${slug}`} target="_blank" rel="noreferrer" className="a-btn a-btn-ghost">{tp.viewLive} <ExternalLink size={15} aria-hidden /></a>
          <button className="a-btn a-btn-primary" disabled={pending} onClick={save}>{pending ? t.ui.saving : tp.savePage}</button>
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-6">
        <nav aria-label={tp.sectionsNav} className="flex min-w-0 flex-[1_1_280px] flex-col gap-1 rounded-xl border bg-surface p-3 lg:sticky lg:top-6">
          <h2 className="px-2 pb-2 pt-1 text-[0.95rem] font-semibold">{tp.sections} <span className="a-muted font-normal">{tp.topToBottom}</span></h2>
          {sections.map((s, i) => {
            const label = L(SECTION_MAP[s.type]?.label ?? s.type);
            const p = s.props as Props;
            const sub = String((locale === "ar" && p.title_ar) || p.title || "");
            const on = s.id === open;
            return (
              <div key={s.id} className={`group flex items-center gap-1 rounded-lg border transition-colors ${on ? "border-brand bg-brand-tint" : "border-transparent hover:bg-sunken"}`}>
                <button type="button" aria-current={on || undefined} className="flex min-h-[52px] min-w-0 flex-1 flex-col justify-center px-2.5 py-1.5 text-start" onClick={() => { setOpen(s.id); setAdding(false); }}>
                  <span className="text-[0.95rem] font-medium leading-tight">{label}</span>
                  {sub && <span className="a-muted truncate text-[0.82rem]">{sub}</span>}
                </button>
                <span className={`flex shrink-0 pe-1 ${on ? "" : "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"} transition-opacity`}>
                  <button type="button" className="rounded-md p-2.5 text-ink-2 hover:bg-surface disabled:opacity-30" disabled={i === 0} onClick={() => move(i, -1)} aria-label={tp.moveUp(label)}><ArrowUp size={15} aria-hidden /></button>
                  <button type="button" className="rounded-md p-2.5 text-ink-2 hover:bg-surface disabled:opacity-30" disabled={i === sections.length - 1} onClick={() => move(i, 1)} aria-label={tp.moveDown(label)}><ArrowDown size={15} aria-hidden /></button>
                </span>
              </div>
            );
          })}
          {!sections.length && <p className="a-muted px-2 py-3 text-sm">{tp.noSections}</p>}
          <button type="button" className={`a-btn mt-2 border border-dashed ${adding ? "border-brand bg-brand-tint text-brand-strong" : "border-line-bold bg-surface"}`} onClick={() => setAdding(true)}><Plus size={16} aria-hidden /> {tp.addSection}</button>
        </nav>

        <section aria-label={tp.editSection} className="flex min-w-0 flex-[2_1_440px] flex-col rounded-xl border bg-surface">
          {adding ? (
            <div key="add" className="rise flex flex-col gap-4 p-5">
              <div className="flex items-center justify-between gap-3">
                <div><h2 className="text-[1.05rem] font-semibold">{tp.addASection}</h2><p className="a-muted text-sm">{tp.addedAtBottom}</p></div>
                <button type="button" className="a-btn a-btn-ghost !w-11 !px-0" onClick={() => setAdding(false)} aria-label={t.ui.close}><X size={16} aria-hidden /></button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {SECTION_DEFS.map((d) => (
                  <button key={d.type} type="button" className="rounded-lg border p-3.5 text-start transition-colors hover:border-brand hover:bg-brand-tint" onClick={() => {
                    const ns = newSection(d.type);
                    edit((x) => [...x, ns]); setOpen(ns.id); setAdding(false);
                  }}>
                    <span className="block font-medium">{L(d.label)}</span>
                    <span className="a-muted block text-[0.85rem]">{L(d.description)}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : selected && def ? (
            <div key={selected.id} className="rise flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
                <div className="min-w-0"><h2 className="text-[1.05rem] font-semibold">{L(def.label)}</h2><p className="a-muted text-sm">{L(def.description)}</p></div>
                <span className="flex gap-2">
                  <button type="button" className="a-btn a-btn-ghost a-btn-sm" onClick={() => { const i = sections.indexOf(selected); const copy = { ...structuredClone(selected), id: newSection(selected.type).id }; edit((x) => [...x.slice(0, i + 1), copy, ...x.slice(i + 1)]); setOpen(copy.id); }}><Copy size={15} aria-hidden /> {tp.duplicate}</button>
                  <button type="button" className="a-btn a-btn-danger a-btn-sm" onClick={() => { edit((x) => x.filter((y) => y.id !== selected.id)); setOpen(null); }}><Trash2 size={15} aria-hidden /> {t.ui.remove}</button>
                </span>
              </div>
              <div className="grid gap-4 p-5">
                <FieldsEditor fields={def.fields} value={selected.props as Props} onChange={(p) => update(selected.id, p)} tenantId={tenantId} />
              </div>
            </div>
          ) : (
            <p className="a-muted p-10 text-center">{tp.selectSection}</p>
          )}
        </section>

        <aside className="flex min-w-0 flex-[1_1_260px] flex-col gap-4 rounded-xl border bg-surface p-5">
          <h2 className="text-[1.05rem] font-semibold">{tp.settings}</h2>
          <BiField label={tp.pageTitle} value={title} valueAr={titleAr} onChange={(v) => { setTitle(v); touch(); }} onChangeAr={(v) => { setTitleAr(v); touch(); }} />
          <label className="field"><span>{tp.address}</span><input dir="ltr" value={slug} disabled={isHome} onChange={(e) => { setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")); touch(); }} />{isHome && <small>{tp.isHome}</small>}</label>
          <BiField label={tp.searchDescription} multiline value={description} valueAr={descriptionAr} maxLength={300} hint={tp.searchHint}
            onChange={(v) => { setDescription(v); touch(); }} onChangeAr={(v) => { setDescriptionAr(v); touch(); }} />
          <label className="flex cursor-pointer items-center gap-3"><input type="checkbox" className="h-5 w-5" checked={published} onChange={(e) => { setPublished(e.target.checked); touch(); }} /> <span className="font-medium">{t.ui.published}</span></label>
          {!isHome && (
            <form action={deletePage.bind(null, page.id)} onSubmit={(e) => { if (!window.confirm(tp.confirmDelete)) e.preventDefault(); }} className="border-t pt-4">
              <button className="a-btn a-btn-danger"><Trash2 size={15} aria-hidden /> {tp.deletePage}</button>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}

function FieldsEditor({ fields, value, onChange, tenantId }: { fields: Field[]; value: Props; onChange: (v: Props) => void; tenantId: string }) {
  const { t, locale } = useAdminT();
  const L = (s: string) => builderLabel(s, locale);
  const set = (k: string, v: unknown) => onChange({ ...value, [k]: v });
  return (
    <>
      {fields.map((f) => {
        const v = value[f.name];
        const ph = f.placeholder && L(f.placeholder);
        switch (f.type) {
          case "text":
          case "textarea":
            return (
              <BiField key={f.name} label={L(f.label)} multiline={f.type === "textarea"} placeholder={f.placeholder}
                value={String(v ?? "")} valueAr={String(value[arKey(f.name)] ?? "")}
                onChange={(x) => set(f.name, x)} onChangeAr={(x) => set(arKey(f.name), x)} />
            );
          case "number":
            return <label key={f.name} className="field"><span>{L(f.label)}</span><input type="number" min={1} max={24} value={Number(v ?? 0) || ""} onChange={(e) => set(f.name, Number(e.target.value))} /></label>;
          case "select":
            return <label key={f.name} className="field"><span>{L(f.label)}</span><select value={String(v ?? "")} onChange={(e) => set(f.name, e.target.value)}>{f.options?.map((o) => <option key={o}>{o}</option>)}</select></label>;
          case "image":
            return <ImageField key={f.name} tenantId={tenantId} label={L(f.label)} value={String(v ?? "")} onChange={(x) => set(f.name, x)} />;
          case "images": {
            const imgs = Array.isArray(v) ? (v as string[]) : [];
            return (
              <div key={f.name} className="field">
                <span>{L(f.label)}</span>
                <div className="flex flex-wrap gap-2">
                  {imgs.map((src, i) => (
                    <div key={i} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="h-16 w-24 rounded-md border object-cover" />
                      <button type="button" className="absolute -end-1.5 -top-1.5 rounded-full bg-surface px-1.5 text-xs shadow" onClick={() => set(f.name, imgs.filter((_, j) => j !== i))} aria-label={t.pages.removeImage}>×</button>
                    </div>
                  ))}
                </div>
                <UploadButton tenantId={tenantId} multiple label={t.pages.addImages} onUploaded={(u) => set(f.name, [...imgs, ...u])} />
              </div>
            );
          }
          case "list": {
            const items = Array.isArray(v) ? (v as Props[]) : [];
            return (
              <div key={f.name} className="field">
                <span>{L(f.label)}</span>
                <div className="space-y-2">
                  {items.map((it, i) => (
                    <div key={i} className="grid gap-3 rounded-lg border bg-subtle p-3.5">
                      <FieldsEditor fields={f.itemFields ?? []} value={typeof it === "object" ? it : { text: it }} tenantId={tenantId}
                        onChange={(nv) => set(f.name, items.map((x, j) => (j === i ? nv : x)))} />
                      <button type="button" className="a-link min-h-11 justify-self-end text-sm !text-danger" onClick={() => set(f.name, items.filter((_, j) => j !== i))}>{t.ui.remove}</button>
                    </div>
                  ))}
                  <button type="button" className="a-btn a-btn-ghost border-dashed" onClick={() => set(f.name, [...items, {}])}>{t.pages.addItem}</button>
                </div>
              </div>
            );
          }
          default:
            return <label key={f.name} className="field"><span>{L(f.label)}</span><input dir="ltr" value={String(v ?? "")} placeholder={ph} onChange={(e) => set(f.name, e.target.value)} /></label>;
        }
      })}
    </>
  );
}
