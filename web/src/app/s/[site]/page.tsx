import { requireTenant, getPage } from "@/lib/tenant";
import { RenderSections } from "@/components/sections/render";
import { newSection } from "@/lib/sections/registry";
import { siteLayout } from "@/lib/theme";
import { LoungeChatHome } from "@/components/lounge/chat-home";
import { DEFAULT_SUGGESTIONS } from "@/lib/suggestions";

export default async function Home({ params }: { params: Promise<{ site: string }> }) {
  const tenant = await requireTenant((await params).site);
  const ai = tenant.ai_config ?? {};

  // Lounge: the conversation is the homepage.
  if (siteLayout(tenant.theme) === "lounge" && ai.enabled !== false) {
    return (
      <LoungeChatHome
          name={tenant.name}
          subtitle={tenant.tagline || `Ask ${ai.assistantName || "our concierge"} about projects, prices and payment plans`}
          portraitUrl={tenant.theme?.portraitUrl}
          backdropUrl={tenant.theme?.backdropUrl}
          storageKey={tenant.slug}
          suggestions={ai.suggestions?.length ? ai.suggestions : DEFAULT_SUGGESTIONS}
        />
    );
  }

  const page = await getPage(tenant.id, "");
  // A brand-new tenant without a home page still gets something sensible.
  const sections = page?.sections?.length ? page.sections : [
    { ...newSection("hero"), props: { title: tenant.name, subtitle: tenant.tagline ?? "", ctaLabel: "View projects", ctaHref: "/projects" } },
    newSection("featured-projects"),
    newSection("contact"),
  ];
  return <RenderSections sections={sections} tenant={tenant} />;
}
