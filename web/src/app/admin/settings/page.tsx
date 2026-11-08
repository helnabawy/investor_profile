import { getAdmin } from "@/lib/admin/context";
import { SettingsForm } from "./settings-form";
import { env, isMulti } from "@/lib/env";

export default async function SettingsPage() {
  const { tenant } = await getAdmin();
  return <SettingsForm tenant={tenant} multi={isMulti} rootDomain={env.rootDomain} />;
}
