import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin/context";
import { PRESETS, type PresetId, type ThemeConfig } from "@/lib/theme";
import { templateFor } from "@/lib/templates";
import { createPreviewToken, previewOrigin } from "@/lib/preview";
import { PreviewFrame } from "./preview-frame";

export const metadata = { title: "Preview · EstateProfile" };

/** Human list of what the draft changes compared with the live theme. */
function describeChanges(live: ThemeConfig, draft: ThemeConfig) {
  const out: { label: string; detail: string; href: string }[] = [];
  const liveTpl = templateFor(live.layout), draftTpl = templateFor(draft.layout);
  if (liveTpl.id !== draftTpl.id) out.push({ label: "Template", detail: `${liveTpl.name} → ${draftTpl.name}`, href: "/admin/theme" });
  const presetName = (p?: string) => (p && Object.hasOwn(PRESETS, p) ? PRESETS[p as PresetId].label : p ? "Custom" : PRESETS["luxury-gold"].label);
  if ((live.preset ?? "luxury-gold") !== (draft.preset ?? "luxury-gold")) {
    out.push({ label: "Colours", detail: `${presetName(live.preset)} → ${presetName(draft.preset)}`, href: "/admin/theme" });
  }
  const ignore = new Set(["layout", "preset"]);
  const keys = new Set([...Object.keys(live), ...Object.keys(draft)].filter((k) => !ignore.has(k)));
  const edited = [...keys].filter((k) => (live as Record<string, unknown>)[k] !== (draft as Record<string, unknown>)[k]);
  if (edited.length) out.push({ label: "Theme details", detail: `${edited.length} setting${edited.length > 1 ? "s" : ""} edited`, href: "/admin/theme" });
  return out;
}

export default async function PreviewPage() {
  const { db, tenant } = await getAdmin();
  const { data } = await db.from("theme_drafts").select("theme").eq("tenant_id", tenant.id).maybeSingle();
  if (!data) redirect("/admin/theme");

  const pages = [{ label: "Home", href: "/" }, ...(tenant.nav ?? []).filter((n) => n.href.startsWith("/") && n.href !== "/")];
  return (
    <PreviewFrame
      siteName={tenant.name}
      origin={previewOrigin(tenant.slug)}
      token={createPreviewToken(tenant.id)}
      pages={pages}
      changes={describeChanges(tenant.theme ?? {}, data.theme as ThemeConfig)}
    />
  );
}
