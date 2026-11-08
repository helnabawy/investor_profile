"use client";
import { useActionState, useState } from "react";
import { deleteProject, saveProject } from "../../actions";
import { FormMessage, PageTitle, SubmitButton } from "@/components/admin/ui";
import { UploadButton } from "@/components/admin/image-upload";
import type { Project } from "@/lib/types";
import { Trash2 } from "lucide-react";

export function ProjectForm({ tenantId, project }: { tenantId: string; project?: Project }) {
  const [state, action] = useActionState(saveProject, null);
  const [images, setImages] = useState<string[]>(project?.images ?? []);
  const [brochure, setBrochure] = useState(project?.brochure_url ?? "");
  const p = project;
  const text = (name: keyof Project, label: string, placeholder?: string) => (
    <label className="field"><span>{label}</span><input name={name} defaultValue={(p?.[name] as string) ?? ""} placeholder={placeholder} /></label>
  );

  return (
    <div className="space-y-6">
      <form action={action} className="space-y-6">
        <PageTitle title={p ? `Edit: ${p.title}` : "New project"}><SubmitButton>{p ? "Save project" : "Create project"}</SubmitButton></PageTitle>
        <FormMessage state={state} />
        {p && <input type="hidden" name="id" value={p.id} />}
        <input type="hidden" name="images" value={images.join("\n")} />

        <section className="a-card grid gap-4 sm:grid-cols-2">
          <label className="field sm:col-span-2"><span>Title *</span><input name="title" required defaultValue={p?.title} /></label>
          {text("developer", "Developer")}
          {text("property_type", "Property type", "Apartment, Villa, Townhouse…")}
          {text("area", "Area / community", "Dubai Marina")}
          {text("city", "City", "Dubai")}
          <label className="field"><span>Status</span>
            <select name="status" defaultValue={p?.status ?? "off-plan"}><option value="off-plan">Off-plan</option><option value="ready">Ready</option><option value="sold-out">Sold out</option></select>
          </label>
          {text("bedrooms", "Bedrooms", "Studio, 1, 2, 3")}
          <div className="grid grid-cols-[1fr_90px] gap-2">
            <label className="field"><span>Starting price</span><input name="price_from" inputMode="numeric" defaultValue={p?.price_from ?? ""} placeholder="1450000" /></label>
            <label className="field"><span>Currency</span><input name="currency" defaultValue={p?.currency ?? "AED"} /></label>
          </div>
          {text("handover", "Handover", "Q4 2027")}
          {text("payment_plan", "Payment plan", "60/40")}
          {text("roi", "Expected yield / ROI", "6–7% gross")}
          <label className="field sm:col-span-2"><span>Description</span><textarea name="description" rows={5} defaultValue={p?.description ?? ""} /></label>
          <label className="field sm:col-span-2"><span>Amenities</span><textarea name="amenities" rows={3} defaultValue={p?.amenities.join("\n")} /><small>One per line.</small></label>
        </section>

        <section className="a-card space-y-3">
          <div className="flex items-center justify-between"><h2 className="font-semibold">Images</h2><UploadButton tenantId={tenantId} multiple label="Upload images" onUploaded={(u) => setImages([...images, ...u])} /></div>
          <div className="flex flex-wrap gap-3">
            {images.map((src, i) => (
              <div key={src + i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-24 w-32 rounded-lg border object-cover" />
                {i === 0 && <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 text-[10px] text-white">Cover</span>}
                <div className="absolute right-1 top-1 flex gap-1">
                  {i > 0 && <button type="button" className="rounded bg-white/90 px-1.5 text-xs shadow" onClick={() => setImages([src, ...images.filter((_, j) => j !== i)])}>Cover</button>}
                  <button type="button" className="rounded bg-white/90 px-1.5 text-xs shadow" onClick={() => setImages(images.filter((_, j) => j !== i))} aria-label="Remove">×</button>
                </div>
              </div>
            ))}
          </div>
          <label className="field"><span>…or paste image URLs</span>
            <input className="a-input" placeholder="https://… (press Enter)" onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              e.preventDefault();
              const v = e.currentTarget.value.trim();
              if (/^https?:\/\//.test(v)) { setImages([...images, v]); e.currentTarget.value = ""; }
            }} />
          </label>
        </section>

        <section className="a-card grid gap-4 sm:grid-cols-2">
          <div className="field sm:col-span-2"><span>Brochure (PDF)</span>
            <div className="flex gap-2"><input name="brochure_url" className="a-input flex-1" value={brochure} onChange={(e) => setBrochure(e.target.value)} placeholder="https://…" />
              <UploadButton tenantId={tenantId} accept="application/pdf" label="Upload PDF" onUploaded={(u) => setBrochure(u[0])} /></div>
          </div>
          <label className="field"><span>Sort order</span><input name="sort" type="number" defaultValue={p?.sort ?? 0} /></label>
          <div className="flex flex-col justify-end gap-2 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" name="featured" defaultChecked={p?.featured} /> Featured on home page</label>
            <label className="flex items-center gap-2"><input type="checkbox" name="published" defaultChecked={p?.published ?? true} /> Published</label>
          </div>
        </section>
      </form>
      {p && (
        <form action={deleteProject.bind(null, p.id)} onSubmit={(e) => { if (!window.confirm("Delete this project?")) e.preventDefault(); }}>
          <button className="a-btn a-btn-danger"><Trash2 size={14} /> Delete project</button>
        </form>
      )}
    </div>
  );
}
