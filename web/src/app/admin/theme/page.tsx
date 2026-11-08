import { getAdmin } from "@/lib/admin/context";
import { ThemeEditor } from "./theme-editor";

export default async function ThemePage() {
  const { tenant } = await getAdmin();
  return <ThemeEditor tenantId={tenant.id} initial={tenant.theme ?? {}} name={tenant.name} />;
}
