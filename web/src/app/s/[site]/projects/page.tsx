import { requireTenant, getPage } from "@/lib/tenant";
import { RenderSections } from "@/components/sections/render";
import { newSection } from "@/lib/sections/registry";
import { siteLayout } from "@/lib/theme";
import { siteT } from "@/lib/i18n/server";

export async function generateMetadata() {
  return { title: (await siteT()).t.pages.projects };
}

export default async function ProjectsPage({ params }: { params: Promise<{ site: string }> }) {
  const tenant = await requireTenant((await params).site);
  const page = await getPage(tenant.id, "projects");
  if (page?.sections?.length) return <RenderSections sections={page.sections} tenant={tenant} />;
  const { t, locale } = await siteT();
  const sections = siteLayout(tenant.theme) === "lounge"
    ? [
        { ...newSection("page-header", locale), props: { title: t.pages.portfolioLounge, subtitle: t.pages.portfolioSubLounge } },
        newSection("project-grid", locale),
      ]
    : [{ ...newSection("project-grid", locale), props: { title: t.pages.portfolio, subtitle: t.pages.portfolioSub } }];
  return <RenderSections sections={sections} tenant={tenant} />;
}
