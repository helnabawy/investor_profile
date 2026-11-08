"use client";
import { useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Upload, Loader2 } from "lucide-react";

/** Uploads to the public "media" bucket under <tenantId>/ (RLS restricts writes to members). */
export async function uploadMedia(tenantId: string, file: File) {
  if (file.size > 8 * 1024 * 1024) throw new Error("Max file size is 8 MB.");
  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const path = `${tenantId}/${crypto.randomUUID()}.${ext}`;
  const sb = supabaseBrowser();
  const { error } = await sb.storage.from("media").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return sb.storage.from("media").getPublicUrl(path).data.publicUrl;
}

export function UploadButton({ tenantId, onUploaded, multiple, label = "Upload", accept = "image/*" }: {
  tenantId: string; onUploaded: (urls: string[]) => void; multiple?: boolean; label?: string; accept?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  return (
    <span className="inline-flex items-center gap-2">
      <button type="button" className="a-btn a-btn-ghost" disabled={busy} onClick={() => ref.current?.click()}>
        {busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} {label}
      </button>
      <input ref={ref} type="file" accept={accept} multiple={multiple} className="hidden" onChange={async (e) => {
        const files = Array.from(e.target.files ?? []);
        if (!files.length) return;
        setBusy(true); setErr("");
        try { onUploaded(await Promise.all(files.map((f) => uploadMedia(tenantId, f)))); }
        catch (x) { setErr((x as Error).message); }
        finally { setBusy(false); e.target.value = ""; }
      }} />
      {err && <span className="text-xs text-red-600">{err}</span>}
    </span>
  );
}

export function ImageField({ tenantId, value, onChange, label }: { tenantId: string; value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div className="field">
      <span>{label}</span>
      <div className="flex items-center gap-3">
        {value && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-12 w-16 rounded border object-cover" />
        )}
        <input className="a-input flex-1" value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://…" />
        <UploadButton tenantId={tenantId} onUploaded={(u) => onChange(u[0])} />
      </div>
    </div>
  );
}
