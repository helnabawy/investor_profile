import { getAdmin } from "@/lib/admin/context";
import { availableProviders, PROVIDERS } from "@/lib/ai/config";
import { AiForm } from "./ai-form";

export default async function AiPage() {
  const { db, tenant } = await getAdmin();
  const available = availableProviders();
  const providers = Object.entries(PROVIDERS).map(([id, p]) => ({ id, label: p.label, note: p.note, defaultModel: p.defaultModel, configured: available.includes(id as never) }));
  const count = { count: "exact", head: true } as const;
  const [projects, faqs, notes] = await Promise.all([
    db.from("projects").select("id", count).eq("tenant_id", tenant.id).eq("published", true),
    db.from("faqs").select("id", count).eq("tenant_id", tenant.id),
    db.from("knowledge").select("id", count).eq("tenant_id", tenant.id),
  ]);
  return (
    <AiForm config={tenant.ai_config ?? {}} providers={providers} tenantName={tenant.name}
      sources={{ projects: projects.count ?? 0, faqs: faqs.count ?? 0, notes: notes.count ?? 0 }} />
  );
}
