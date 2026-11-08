import { notFound } from "next/navigation";
import { getAdmin } from "@/lib/admin/context";
import { ProjectForm } from "./project-form";
import { PROJECT_COLUMNS, type Project } from "@/lib/types";

export default async function EditProject({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { db, tenant } = await getAdmin();
  if (id === "new") return <ProjectForm tenantId={tenant.id} />;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data } = await db.from("projects").select(PROJECT_COLUMNS).eq("id", id).eq("tenant_id", tenant.id).maybeSingle();
  if (!data) notFound();
  return <ProjectForm tenantId={tenant.id} project={data as Project} />;
}
