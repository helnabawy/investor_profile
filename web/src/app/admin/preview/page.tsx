import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin/context";
import { PRESETS, type PresetId, type ThemeConfig } from "@/lib/theme";
import { templateFor } from "@/lib/templates";
import { createPreviewToken, previewOrigin } from "@/lib/preview";
import { PreviewFrame } from "./preview-frame";
import { adminT } from "@/lib/i18n/admin-server";
import type { AdminDict } from "@/lib/i18n/admin";

export async function generateMetadata() {
  return { title: (await adminT()).t.preview.metaTitle };
}

/** Human list of what the draft changes compared with the live theme. */
function describeChanges(t: AdminDict, live: ThemeConfig, draft: ThemeConfig) {
  const out: { label: string; detail: string; href: string }[] = [];
  const liveTpl = templateFor(live.layout), draftTpl = templateFor(draft.layout);
  if (liveTpl.id !== draftTpl.id) out.push({ label: t.theme.template, detail: `${liveTpl.name} → ${draftTpl.name}`, href: "/admin/theme" });
  const presetName = (p?: string) => (p && Object.hasOwn(PRESETS, p) ? PRESETS[p as PresetId].label : p ? t.preview.custom : PRESETS["luxury-gold"].label);
  if ((live.preset ?? "luxury-gold") !== (draft.preset ?? "luxury-gold")) {
    out.push({ label: t.theme.colours, detail: `${presetName(live.preset)} → ${presetName(draft.preset)}`, href: "/admin/theme" });
  }
  const ignore = new Set(["layout", "preset"]);
  const keys = new Set([...Object.keys(live), ...Object.keys(draft)].filter((k) => !ignore.has(k)));
  const edited = [...keys].filter((k) => (live as Record<string, unknown>)[k] !== (draft as Record<string, unknown>)[k]);
  if (edited.length) out.push({ label: t.preview.themeDetails, detail: t.preview.settingsEdited(edited.length), href: "/admin/theme" });
  return out;
}

export default async function PreviewPage() {
  const { db, tenant } = await getAdmin();
  const { t, locale } = await adminT();
  const { data } = await db.from("theme_drafts").select("theme").eq("tenant_id", tenant.id).maybeSingle();
  if (!data) redirect("/admin/theme");

  const pages = [{ label: t.preview.home, href: "/" }, ...(tenant.nav ?? []).filter((n) => n.href.startsWith("/") && n.href !== "/")
    .map((n) => ({ label: (locale === "ar" && n.label_ar) || n.label, href: n.href }))];
  return (
    <PreviewFrame
      siteName={tenant.name}
      origin={previewOrigin(tenant.slug)}
      token={createPreviewToken(tenant.id)}
      pages={pages}
      changes={describeChanges(t, tenant.theme ?? {}, data.theme as ThemeConfig)}
    />
  );
}
