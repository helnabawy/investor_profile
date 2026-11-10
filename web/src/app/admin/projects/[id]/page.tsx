import { notFound } from "next/navigation";
import { getAdmin } from "@/lib/admin/context";
import { ProjectForm } from "./project-form";
import { PROJECT_COLUMNS, type Project } from "@/lib/types";
import { PageTitle, UpgradeNote } from "@/components/admin/ui";
import { tenantPlan } from "@/lib/tenant";

export default async function EditProject({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { db, tenant } = await getAdmin();
  if (id === "new") {
    const plan = tenantPlan(tenant);
    if (plan.maxProjects !== null) {
      const { count } = await db.from("projects").select("id", { count: "exact", head: true }).eq("tenant_id", tenant.id);
      if ((count ?? 0) >= plan.maxProjects) {
        return (
          <div>
            <PageTitle title="New project" />
            <UpgradeNote>The {plan.name} plan includes up to {plan.maxProjects} projects. Upgrade to add more, or delete one you no longer need.</UpgradeNote>
          </div>
        );
      }
    }
    return <ProjectForm tenantId={tenant.id} />;
  }
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data } = await db.from("projects").select(PROJECT_COLUMNS).eq("id", id).eq("tenant_id", tenant.id).maybeSingle();
  if (!data) notFound();
  return <ProjectForm tenantId={tenant.id} project={data as Project} />;
}
