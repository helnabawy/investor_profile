import { notFound } from "next/navigation";
import { getAdmin, siteUrl } from "@/lib/admin/context";
import { PageBuilder } from "./page-builder";
import type { Page } from "@/lib/types";

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { db, tenant } = await getAdmin();
  const { data } = await db.from("pages").select("*").eq("id", id).eq("tenant_id", tenant.id).maybeSingle();
  if (!data) notFound();
  return <PageBuilder page={data as Page} tenantId={tenant.id} siteUrl={siteUrl(tenant)} />;
}
