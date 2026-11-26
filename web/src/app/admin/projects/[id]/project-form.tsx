"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, CircleAlert, Trash2, X } from "lucide-react";
import { deleteProject, saveProject } from "../../actions";
import { FormMessage, SubmitButton } from "@/components/admin/ui";
import { UploadButton } from "@/components/admin/image-upload";
import type { Project } from "@/lib/types";
import { PriceGrowthEditor } from "./price-growth-editor";

const STATUS_LABEL = { "off-plan": "Off-plan", ready: "Ready", "sold-out": "Sold out" } as const;

function Card({ title, hint, children, className = "" }: { title: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`a-card flex flex-col gap-[18px] ${className}`}>
      <div><h2 className="text-[1.05rem] font-semibold">{title}</h2>{hint && <p className="a-muted text-sm">{hint}</p>}</div>
      {children}
    </section>
  );
}

export function ProjectForm({ tenantId, project }: { tenantId: string; project?: Project }) {
  const [state, action] = useActionState(saveProject, null);
  const p = project;
  const [images, setImages] = useState<string[]>(p?.images ?? []);
  const [brochure, setBrochure] = useState(p?.brochure_url ?? "");
  const [forSale, setForSale] = useState(p?.for_sale ?? false);
  // Mirrors the fields the buyer card and checklist read, so both update as the agent types.
  const [v, setV] = useState({
    title: p?.title ?? "", area: p?.area ?? "", bedrooms: p?.bedrooms ?? "", status: p?.status ?? "off-plan",
    price_from: p?.price_from ? String(p.price_from) : "", currency: p?.currency ?? "AED", handover: p?.handover ?? "",
    payment_plan: p?.payment_plan ?? "", roi: p?.roi ?? "",
  });
  const track = (e: React.FormEvent<HTMLFormElement>) => {
    const t = e.target as HTMLInputElement;
    if (t.name in v) setV((x) => ({ ...x, [t.name]: t.value }));
  };
  const text = (name: keyof Project, label: string, placeholder?: string, hint?: string) => (
    <label className="field min-w-0 flex-[1_1_220px]"><span>{label}</span><input name={name} defaultValue={(p?.[name] as string) ?? ""} placeholder={placeholder} />{hint && <small>{hint}</small>}</label>
  );
  const price = Number(v.price_from.replace(/[^\d.]/g, ""));
  const checks: [string, boolean][] = [
    ["Starting price", price > 0], ["Payment plan", !!v.payment_plan.trim()], ["Handover date", !!v.handover.trim()],
    ["Expected yield", !!v.roi.trim()], ["At least two photos", images.length >= 2], ["Brochure", !!brochure.trim()],
  ];
  const done = checks.filter(([, ok]) => ok).length;

  return (
    <div className="flex flex-col gap-6">
      <form id="project" action={action} onChange={track} className="contents">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/admin/projects" aria-label="Back to projects" className="a-btn a-btn-ghost !w-11 !px-0"><ArrowLeft size={18} aria-hidden /></Link>
            <div className="min-w-0">
              <p className="a-muted text-sm">Projects</p>
              <h1 className="truncate text-[1.4rem] font-semibold leading-tight tracking-[-0.02em]">{v.title || (p ? "Untitled project" : "New project")}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3"><FormMessage state={state} /><SubmitButton>{p ? "Save project" : "Create project"}</SubmitButton></div>
        </div>
        {p && <input type="hidden" name="id" value={p.id} />}
        <input type="hidden" name="images" value={images.join("\n")} />

        <div className="flex flex-wrap items-start gap-6">
          <div className="flex min-w-0 flex-[2_1_520px] flex-col gap-6">
            <Card title="Basics">
              <div className="flex flex-wrap gap-4">
                <label className="field basis-full"><span>Title</span><input name="title" required defaultValue={p?.title} /></label>
                {text("developer", "Developer")}
                {text("property_type", "Property type", "Apartment, Villa, Townhouse…")}
                {text("area", "Area / community", "Dubai Marina")}
                {text("city", "City", "Dubai")}
                <label className="field min-w-0 flex-[1_1_220px]"><span>Status</span>
                  <select name="status" defaultValue={p?.status ?? "off-plan"}><option value="off-plan">Off-plan</option><option value="ready">Ready</option><option value="sold-out">Sold out</option></select>
                </label>
                {text("bedrooms", "Bedrooms", "Studio, 1, 2, 3", "Separate with commas.")}
              </div>
            </Card>

            <Card title="The numbers buyers ask for" hint="These appear on the project card, and the concierge quotes them word for word.">
              <div className="flex flex-wrap gap-4">
                <div className="field min-w-0 flex-[1_1_220px]"><span>Starting price</span>
                  <div className="flex gap-2">
                    <input name="currency" aria-label="Currency" defaultValue={p?.currency ?? "AED"} className="!w-20 shrink-0" />
                    <input name="price_from" aria-label="Starting price" inputMode="numeric" defaultValue={p?.price_from ?? ""} placeholder="1450000" className="tabular-nums" />
                  </div>
                </div>
                {text("handover", "Handover", "Q4 2027")}
                {text("payment_plan", "Payment plan", "60/40")}
                {text("roi", "Expected yield", "6–7% gross", "Write it as an expectation, not a promise.")}
              </div>
            </Card>

            <Card title="Price growth" hint="Show buyers how much the project has risen since launch. Your project page turns these figures into charts.">
              <PriceGrowthEditor value={p?.price_growth ?? null} currency={v.currency} />
            </Card>

            <Card title="Description and amenities">
              <label className="field"><span>Description</span><textarea name="description" rows={5} defaultValue={p?.description ?? ""} /></label>
              <label className="field"><span>Amenities</span><textarea name="amenities" rows={4} defaultValue={p?.amenities.join("\n")} /><small>One per line.</small></label>
            </Card>

            <Card title="Photos" hint="The first photo is the cover.">
              <div className="flex flex-wrap gap-3">
                {images.map((src, i) => (
                  <div key={src + i} className="group relative h-[108px] w-[148px] overflow-hidden rounded-lg border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    {i === 0 && <span className="absolute left-1.5 top-1.5 rounded-full bg-inverse px-2 py-px text-xs font-medium text-white">Cover</span>}
                    <div className="absolute inset-x-1.5 bottom-1.5 flex justify-end gap-1">
                      {i > 0 && <button type="button" className="rounded-md bg-surface/95 px-2 py-1 text-xs font-medium shadow" onClick={() => setImages([src, ...images.filter((_, j) => j !== i)])}>Make cover</button>}
                      <button type="button" className="rounded-md bg-surface/95 p-1 shadow" onClick={() => setImages(images.filter((_, j) => j !== i))} aria-label="Remove photo"><X size={14} aria-hidden /></button>
                    </div>
                  </div>
                ))}
                <div className="flex min-h-[108px] flex-[1_1_200px] flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-line-bold bg-subtle p-3 text-center">
                  <UploadButton tenantId={tenantId} multiple label="Upload photos" onUploaded={(u) => setImages([...images, ...u])} />
                  <span className="a-muted text-[0.82rem]">JPG or PNG, up to 8 MB each.</span>
                </div>
              </div>
              <label className="field"><span>Or paste an image link</span>
                <input type="url" placeholder="https://… then press Enter" onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  e.preventDefault();
                  const url = e.currentTarget.value.trim();
                  if (/^https?:\/\//.test(url)) { setImages([...images, url]); e.currentTarget.value = ""; }
                }} />
              </label>
            </Card>

            <Card title="Brochure">
              {!brochure && <p className="rounded-lg border border-warning-line bg-warning-soft px-4 py-3 text-sm text-warning-strong">Buyers often ask the concierge for a brochure. Add a PDF and it can share the link.</p>}
              <div className="field"><span>Brochure (PDF)</span>
                <div className="flex flex-wrap gap-2">
                  <input name="brochure_url" className="a-input min-w-0 flex-1" value={brochure} onChange={(e) => setBrochure(e.target.value)} placeholder="https://…" />
                  <UploadButton tenantId={tenantId} accept="application/pdf" label="Upload PDF" onUploaded={(u) => setBrochure(u[0])} />
                </div>
              </div>
            </Card>
          </div>

          <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-6 lg:sticky lg:top-6">
            <section className="a-card flex flex-col gap-3.5 !p-5">
              <h2 className="font-semibold">How buyers see it</h2>
              <div className="overflow-hidden rounded border border-[#dad6ca] bg-white">
                <div className="relative h-[170px] bg-wash">
                  {images[0]
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={images[0]} alt="" className="h-full w-full object-cover" />
                    : <span className="a-muted flex h-full items-center justify-center text-sm">No cover photo yet</span>}
                  <span className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                    <span className="rounded-sm bg-surface px-2.5 py-1 text-xs font-semibold">{STATUS_LABEL[v.status as keyof typeof STATUS_LABEL] ?? "Off-plan"}</span>
                    {forSale && <span className="rounded-sm bg-inverse px-2.5 py-1 text-xs font-semibold text-white">Available for sale</span>}
                  </span>
                </div>
                <div className="flex flex-col gap-2.5 px-4 pb-4 pt-3.5">
                  <div>
                    <p className="font-[Georgia,serif] text-[1.25rem] leading-tight">{v.title || "Project title"}</p>
                    <p className="a-muted text-sm">{[v.area, v.bedrooms && `${v.bedrooms} bedrooms`].filter(Boolean).join(" · ") || "Area · bedrooms"}</p>
                  </div>
                  <p className="border-t pt-2.5 text-sm text-[#4c5952]">
                    From <strong className="font-semibold tabular-nums text-[#0f1728]">{price ? `${v.currency} ${price.toLocaleString("en-US")}` : "price on request"}</strong>
                    <br />{[v.handover && `Handover ${v.handover}`, v.payment_plan.split(/\s/)[0]].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
            </section>

            <section className="a-card !p-5 !pb-2">
              <h2 className="font-semibold">Ready for the concierge</h2>
              <p className="a-muted text-sm">{done} of {checks.length} details filled in.</p>
              <ul className="mt-2">
                {checks.map(([label, ok]) => (
                  <li key={label} className={`flex items-center gap-2.5 border-t border-line-soft py-2.5 text-[0.95rem] ${ok ? "" : "text-warning"}`}>
                    {ok ? <Check size={18} strokeWidth={2.2} className="text-success" aria-hidden /> : <CircleAlert size={18} className="text-warning-fill" aria-hidden />}
                    {label}{!ok && <span className="sr-only"> (missing)</span>}
                  </li>
                ))}
              </ul>
            </section>

            <section className="a-card flex flex-col gap-4 !p-5">
              <h2 className="font-semibold">Visibility</h2>
              <label className="flex cursor-pointer items-start gap-3"><input type="checkbox" name="for_sale" checked={forSale} onChange={(e) => setForSale(e.target.checked)} className="mt-0.5 h-5 w-5" /><span><span className="font-medium">Available for sale</span><span className="a-muted block text-sm">Shows an &ldquo;Available for sale&rdquo; tag on the project card and page.</span></span></label>
              <label className="flex cursor-pointer items-start gap-3"><input type="checkbox" name="published" defaultChecked={p?.published ?? true} className="mt-0.5 h-5 w-5" /><span><span className="font-medium">Published</span><span className="a-muted block text-sm">Shown on your site and known to the concierge.</span></span></label>
              <label className="flex cursor-pointer items-start gap-3"><input type="checkbox" name="featured" defaultChecked={p?.featured} className="mt-0.5 h-5 w-5" /><span><span className="font-medium">Featured on the home page</span><span className="a-muted block text-sm">Featured projects lead your home page.</span></span></label>
              <label className="field"><span>Position in lists</span><input name="sort" type="number" min={0} defaultValue={p?.sort ?? 0} className="!w-28" /><small>Lower numbers come first.</small></label>
            </section>
          </div>
        </div>
      </form>
      {p && (
        <form action={deleteProject.bind(null, p.id)} onSubmit={(e) => { if (!window.confirm("Delete this project? This cannot be undone.")) e.preventDefault(); }}>
          <button className="a-btn a-btn-danger"><Trash2 size={15} aria-hidden /> Delete project</button>
        </form>
      )}
    </div>
  );
}
