import { getAdmin } from "@/lib/admin/context";
import { availableProviders, PROVIDERS } from "@/lib/ai/config";
import { AiForm } from "./ai-form";

export default async function AiPage() {
  const { tenant } = await getAdmin();
  const available = availableProviders();
  const providers = Object.entries(PROVIDERS).map(([id, p]) => ({ id, label: p.label, note: p.note, defaultModel: p.defaultModel, configured: available.includes(id as never) }));
  return <AiForm config={tenant.ai_config ?? {}} providers={providers} tenantName={tenant.name} />;
}
