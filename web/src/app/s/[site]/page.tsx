import { requireTenant, getPage, getProjects, getFaqs, tenantPlan } from "@/lib/tenant";
import { RenderSections } from "@/components/sections/render";
import { newSection } from "@/lib/sections/registry";
import { siteLayout } from "@/lib/theme";
import { LoungeChatHome } from "@/components/lounge/chat-home";
import { siteT } from "@/lib/i18n/server";
import { FoyerHome } from "@/components/templates/foyer-home";

export default async function Home({ params }: { params: Promise<{ site: string }> }) {
  const tenant = await requireTenant((await params).site);
  const ai = tenant.ai_config ?? {};
  const { t, locale } = await siteT();

  // Lounge: the conversation is the homepage.
  if (siteLayout(tenant.theme) === "lounge" && ai.enabled !== false) {
    return (
      <LoungeChatHome
          name={tenant.name}
          subtitle={tenant.tagline || t.common.loungeSubtitle(ai.assistantName)}
          portraitUrl={tenant.theme?.portraitUrl}
          backdropUrl={tenant.theme?.backdropUrl}
          storageKey={tenant.slug}
          suggestions={ai.suggestions?.length ? ai.suggestions : t.chat.suggestions}
        />
    );
  }

  const page = await getPage(tenant.id, "");

  // Foyer: the home page is one screen. Its words come from the page's hero section, so the agent
  // still edits them in Pages; projects, questions and contact fill the panel.
  if (siteLayout(tenant.theme) === "foyer") {
    const hero = (page?.sections ?? []).find((x) => x.type === "hero-split" || x.type === "hero")?.props as Record<string, unknown> | undefined;
    const text = (k: string) => (typeof hero?.[k] === "string" ? (hero[k] as string) : "");
    const [projects, faqs] = await Promise.all([getProjects(tenant.id, true), getFaqs(tenant.id)]);
    return (
      <FoyerHome
        name={tenant.name}
        tagline={tenant.tagline}
        title={text("title") || t.common.findNext(tenant.name)}
        subtitle={text("subtitle")}
        image={text("image") || tenant.theme?.backdropUrl}
        projects={(projects.length ? projects : await getProjects(tenant.id)).slice(0, 3)}
        faqs={faqs.slice(0, 3)}
        contact={tenant.contact ?? {}}
        nav={tenant.nav ?? []}
        askLabel={t.common.askNamed(ai.assistantName)}
        askPlaceholder={text("askPlaceholder") || t.common.askPlaceholder}
        chat={ai.enabled !== false}
        poweredBy={tenantPlan(tenant).badge}
      />
    );
  }
  // A brand-new tenant without a home page still gets something sensible.
  const sections = page?.sections?.length ? page.sections : [
    { ...newSection("hero-split", locale), props: { eyebrow: tenant.tagline ?? "", title: t.common.findNext(tenant.name), image: tenant.theme?.backdropUrl ?? "" } },
    newSection("quick-links", locale),
    newSection("featured-projects", locale),
    newSection("contact", locale),
  ];
  return <RenderSections sections={sections} tenant={tenant} />;
}
