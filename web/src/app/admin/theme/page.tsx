import { getAdmin } from "@/lib/admin/context";
import type { ThemeConfig } from "@/lib/theme";
import { ThemeEditor } from "./theme-editor";

export default async function ThemePage({ searchParams }: { searchParams: Promise<{ published?: string }> }) {
  const { db, tenant } = await getAdmin();
  const { published } = await searchParams;
  // Pick up where the agent left off: an unpublished draft wins over the live theme.
  const { data: draft } = await db.from("theme_drafts").select("theme").eq("tenant_id", tenant.id).maybeSingle();
  return (
    <ThemeEditor
      tenantId={tenant.id}
      name={tenant.name}
      initial={(draft?.theme as ThemeConfig | undefined) ?? tenant.theme ?? {}}
      hasDraft={Boolean(draft)}
      justPublished={published === "1"}
    />
  );
}
