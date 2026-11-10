import { requireTenant, getPage } from "@/lib/tenant";
import { RenderSections } from "@/components/sections/render";
import { newSection } from "@/lib/sections/registry";
import { siteLayout } from "@/lib/theme";

export const metadata = { title: "Projects" };

export default async function ProjectsPage({ params }: { params: Promise<{ site: string }> }) {
  const tenant = await requireTenant((await params).site);
  const page = await getPage(tenant.id, "projects");
  if (page?.sections?.length) return <RenderSections sections={page.sections} tenant={tenant} />;
  const sections = siteLayout(tenant.theme) === "lounge"
    ? [
        { ...newSection("page-header"), props: { title: "The Portfolio", subtitle: "Hand-picked off-plan and ready projects. Ask the concierge about any of them." } },
        newSection("project-grid"),
      ]
    : [{ ...newSection("project-grid"), props: { title: "The portfolio", subtitle: "Hand-picked off-plan and ready projects. Every card shows the starting price, handover and expected return." } }];
  return <RenderSections sections={sections} tenant={tenant} />;
}
