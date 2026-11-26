"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, CircleAlert, Trash2, X } from "lucide-react";
import { deleteProject, saveProject } from "../../actions";
import { FormMessage, SubmitButton } from "@/components/admin/ui";
import { UploadButton } from "@/components/admin/image-upload";
import type { Project } from "@/lib/types";
import { formatFullPrice } from "@/lib/format";
import { PriceGrowthEditor } from "./price-growth-editor";
import { BiInput, TranslateButton } from "@/components/admin/bilingual";
import { useAdminT } from "@/components/admin/i18n";

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
  const { t: d, locale } = useAdminT();
  const tp = d.project;
  const STATUS_LABEL = { "off-plan": tp.statusOffPlan, ready: tp.statusReady, "sold-out": tp.statusSoldOut } as const;
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
  // Each text field with its Arabic twin (`developer` / `developer_ar`).
  const text = (name: keyof Project & string, label: string, placeholder?: string, hint?: string) => (
    <BiInput className="basis-full" name={name} label={label} placeholder={placeholder} hint={hint}
      defaultValue={(p?.[name] as string) ?? ""} defaultValueAr={(p?.[`${name}_ar` as keyof Project] as string) ?? ""} />
  );
  const price = Number(v.price_from.replace(/[^\d.]/g, ""));
  const checks: [string, boolean][] = [
    [tp.checkPrice, price > 0], [tp.checkPlan, !!v.payment_plan.trim()], [tp.checkHandover, !!v.handover.trim()],
    [tp.checkYield, !!v.roi.trim()], [tp.checkPhotos, images.length >= 2], [tp.checkBrochure, !!brochure.trim()],
  ];
  const done = checks.filter(([, ok]) => ok).length;

  return (
    <div className="flex flex-col gap-6">
      <form id="project" action={action} onChange={track} className="contents">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/admin/projects" aria-label={tp.backToProjects} className="a-btn a-btn-ghost !w-11 !px-0"><ArrowLeft size={18} className="rtl:-scale-x-100" aria-hidden /></Link>
            <div className="min-w-0">
              <p className="a-muted text-sm">{tp.projects}</p>
              <h1 className="truncate text-[1.4rem] font-semibold leading-tight tracking-[-0.02em]">{v.title || (p ? tp.untitled : tp.newProject)}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3"><FormMessage state={state} /><TranslateButton /><SubmitButton>{p ? tp.save : tp.create}</SubmitButton></div>
        </div>
        {p && <input type="hidden" name="id" value={p.id} />}
        <input type="hidden" name="images" value={images.join("\n")} />

        <div className="flex flex-wrap items-start gap-6">
          <div className="flex min-w-0 flex-[2_1_520px] flex-col gap-6">
            <Card title={tp.basics}>
              <div className="flex flex-wrap gap-4">
                <BiInput className="basis-full" name="title" label={tp.title} required defaultValue={p?.title} defaultValueAr={p?.title_ar} />
                {text("developer", tp.developer)}
                {text("property_type", tp.propertyType, tp.propertyTypePh)}
                {text("area", tp.area, "Dubai Marina")}
                {text("city", tp.city, "Dubai")}
                <label className="field min-w-0 flex-[1_1_220px]"><span>{tp.status}</span>
                  <select name="status" defaultValue={p?.status ?? "off-plan"}><option value="off-plan">{tp.statusOffPlan}</option><option value="ready">{tp.statusReady}</option><option value="sold-out">{tp.statusSoldOut}</option></select>
                </label>
                {text("bedrooms", tp.bedrooms, "Studio, 1, 2, 3", tp.bedroomsHint)}
              </div>
            </Card>

            <Card title={tp.numbers} hint={tp.numbersHint}>
              <div className="flex flex-wrap gap-4">
                <div className="field min-w-0 flex-[1_1_220px]"><span>{tp.startingPrice}</span>
                  <div className="flex gap-2" dir="ltr">
                    <input name="currency" aria-label={tp.currency} defaultValue={p?.currency ?? "AED"} className="!w-20 shrink-0" />
                    <input name="price_from" aria-label={tp.startingPrice} inputMode="numeric" defaultValue={p?.price_from ?? ""} placeholder="1450000" className="tabular-nums" />
                  </div>
                </div>
                {text("handover", tp.handover, "Q4 2027")}
                {text("payment_plan", tp.paymentPlan, "60/40")}
                {text("roi", tp.expectedYield, tp.yieldPh, tp.yieldHint)}
              </div>
            </Card>

            <Card title={tp.growth} hint={tp.growthHint}>
              <PriceGrowthEditor value={p?.price_growth ?? null} currency={v.currency} />
            </Card>

            <Card title={tp.descAmenities}>
              <BiInput name="description" label={tp.description} multiline rows={5} defaultValue={p?.description} defaultValueAr={p?.description_ar} />
              <BiInput name="amenities" label={tp.amenities} multiline rows={4} hint={tp.onePerLine}
                defaultValue={p?.amenities.join("\n")} defaultValueAr={p?.amenities_ar?.join("\n")} />
            </Card>

            <Card title={tp.photos} hint={tp.photosHint}>
              <div className="flex flex-wrap gap-3">
                {images.map((src, i) => (
                  <div key={src + i} className="group relative h-[108px] w-[148px] overflow-hidden rounded-lg border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    {i === 0 && <span className="absolute start-1.5 top-1.5 rounded-full bg-inverse px-2 py-px text-xs font-medium text-white">{tp.cover}</span>}
                    <div className="absolute inset-x-1.5 bottom-1.5 flex justify-end gap-1">
                      {i > 0 && <button type="button" className="rounded-md bg-surface/95 px-2 py-1 text-xs font-medium shadow" onClick={() => setImages([src, ...images.filter((_, j) => j !== i)])}>{tp.makeCover}</button>}
                      <button type="button" className="rounded-md bg-surface/95 p-1 shadow" onClick={() => setImages(images.filter((_, j) => j !== i))} aria-label={tp.removePhoto}><X size={14} aria-hidden /></button>
                    </div>
                  </div>
                ))}
                <div className="flex min-h-[108px] flex-[1_1_200px] flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-line-bold bg-subtle p-3 text-center">
                  <UploadButton tenantId={tenantId} multiple label={tp.uploadPhotos} onUploaded={(u) => setImages([...images, ...u])} />
                  <span className="a-muted text-[0.82rem]">{tp.photoTypes}</span>
                </div>
              </div>
              <label className="field"><span>{tp.pasteLink}</span>
                <input type="url" dir="ltr" placeholder={tp.pasteLinkPh} onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  e.preventDefault();
                  const url = e.currentTarget.value.trim();
                  if (/^https?:\/\//.test(url)) { setImages([...images, url]); e.currentTarget.value = ""; }
                }} />
              </label>
            </Card>

            <Card title={tp.brochure}>
              {!brochure && <p className="rounded-lg border border-warning-line bg-warning-soft px-4 py-3 text-sm text-warning-strong">{tp.brochureNudge}</p>}
              <div className="field"><span>{tp.brochurePdf}</span>
                <div className="flex flex-wrap gap-2">
                  <input name="brochure_url" dir="ltr" className="a-input min-w-0 flex-1" value={brochure} onChange={(e) => setBrochure(e.target.value)} placeholder="https://…" />
                  <UploadButton tenantId={tenantId} accept="application/pdf" label={tp.uploadPdf} onUploaded={(u) => setBrochure(u[0])} />
                </div>
              </div>
            </Card>
          </div>

          <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-6 lg:sticky lg:top-6">
            <section className="a-card flex flex-col gap-3.5 !p-5">
              <h2 className="font-semibold">{tp.howBuyersSee}</h2>
              <div className="overflow-hidden rounded border border-[#dad6ca] bg-white">
                <div className="relative h-[170px] bg-wash">
                  {images[0]
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={images[0]} alt="" className="h-full w-full object-cover" />
                    : <span className="a-muted flex h-full items-center justify-center text-sm">{tp.noCover}</span>}
                  <span className="absolute start-3 top-3 flex flex-wrap gap-1.5">
                    <span className="rounded-sm bg-surface px-2.5 py-1 text-xs font-semibold">{STATUS_LABEL[v.status as keyof typeof STATUS_LABEL] ?? tp.statusOffPlan}</span>
                    {forSale && <span className="rounded-sm bg-inverse px-2.5 py-1 text-xs font-semibold text-white">{tp.forSaleTag}</span>}
                  </span>
                </div>
                <div className="flex flex-col gap-2.5 px-4 pb-4 pt-3.5">
                  <div>
                    <p className="font-[Georgia,serif] text-[1.25rem] leading-tight">{v.title || tp.titlePh}</p>
                    <p className="a-muted text-sm">{[v.area, v.bedrooms && tp.bedroomsShort(v.bedrooms)].filter(Boolean).join(" · ") || tp.areaBedroomsPh}</p>
                  </div>
                  <p className="border-t pt-2.5 text-sm text-[#4c5952]">
                    {tp.from} <strong className="font-semibold tabular-nums text-[#0f1728]">{price ? formatFullPrice(price, v.currency, locale) : tp.onRequest}</strong>
                    <br />{[v.handover && tp.handoverOn(v.handover), v.payment_plan.split(/\s/)[0]].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
            </section>

            <section className="a-card !p-5 !pb-2">
              <h2 className="font-semibold">{tp.readyForConcierge}</h2>
              <p className="a-muted text-sm">{tp.filledOf(done, checks.length)}</p>
              <ul className="mt-2">
                {checks.map(([label, ok]) => (
                  <li key={label} className={`flex items-center gap-2.5 border-t border-line-soft py-2.5 text-[0.95rem] ${ok ? "" : "text-warning"}`}>
                    {ok ? <Check size={18} strokeWidth={2.2} className="text-success" aria-hidden /> : <CircleAlert size={18} className="text-warning-fill" aria-hidden />}
                    {label}{!ok && <span className="sr-only">{tp.missing}</span>}
                  </li>
                ))}
              </ul>
            </section>

            <section className="a-card flex flex-col gap-4 !p-5">
              <h2 className="font-semibold">{tp.visibility}</h2>
              <label className="flex cursor-pointer items-start gap-3"><input type="checkbox" name="for_sale" checked={forSale} onChange={(e) => setForSale(e.target.checked)} className="mt-0.5 h-5 w-5" /><span><span className="font-medium">{tp.forSaleTag}</span><span className="a-muted block text-sm">{tp.forSaleHint}</span></span></label>
              <label className="flex cursor-pointer items-start gap-3"><input type="checkbox" name="published" defaultChecked={p?.published ?? true} className="mt-0.5 h-5 w-5" /><span><span className="font-medium">{d.ui.published}</span><span className="a-muted block text-sm">{tp.publishedHint}</span></span></label>
              <label className="flex cursor-pointer items-start gap-3"><input type="checkbox" name="featured" defaultChecked={p?.featured} className="mt-0.5 h-5 w-5" /><span><span className="font-medium">{tp.featured}</span><span className="a-muted block text-sm">{tp.featuredHint}</span></span></label>
              <label className="field"><span>{tp.position}</span><input name="sort" type="number" min={0} defaultValue={p?.sort ?? 0} className="!w-28" /><small>{tp.positionHint}</small></label>
            </section>
          </div>
        </div>
      </form>
      {p && (
        <form action={deleteProject.bind(null, p.id)} onSubmit={(e) => { if (!window.confirm(tp.confirmDelete)) e.preventDefault(); }}>
          <button className="a-btn a-btn-danger"><Trash2 size={15} aria-hidden /> {tp.deleteProject}</button>
        </form>
      )}
    </div>
  );
}
