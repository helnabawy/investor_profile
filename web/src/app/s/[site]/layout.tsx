import type { Metadata } from "next";
import { requireTenant, tenantPlan } from "@/lib/tenant";
import { googleFontsHref, resolveTheme, siteLayout, themeCss } from "@/lib/theme";
import { LoungeSidebar } from "@/components/lounge/sidebar";
import { LoungeFooter } from "@/components/lounge/footer";
import { NotOnHome } from "@/components/lounge/not-on-home";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { ChatWidget } from "@/components/site/chat";

type Props = { children: React.ReactNode; params: Promise<{ site: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await requireTenant((await params).site);
  return {
    title: { default: t.name, template: `%s · ${t.name}` },
    description: t.tagline ?? undefined,
    icons: t.theme?.faviconUrl ? [{ url: t.theme.faviconUrl }] : undefined,
  };
}

export default async function TenantLayout({ children, params }: Props) {
  const tenant = await requireTenant((await params).site);
  const theme = resolveTheme(tenant.theme);
  const fonts = googleFontsHref(theme);
  const ai = tenant.ai_config ?? {};
  const layout = siteLayout(tenant.theme);
  const chat = ai.enabled !== false && (
    <ChatWidget
      storageKey={tenant.slug}
      hideOnHome={layout === "lounge"}
      assistantName={ai.assistantName || `${tenant.name} Assistant`}
      greeting={ai.greeting || `Hi! I'm the ${tenant.name} assistant. How can I help you find the right property?`}
    />
  );
  const head = (
    <>
      {fonts && (
        <>
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link rel="stylesheet" href={fonts} />
        </>
      )}
      {layout === "lounge" && <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600&display=swap" />}
      <style dangerouslySetInnerHTML={{ __html: themeCss(theme) }} />
    </>
  );

  if (layout === "lounge") {
    return (
      <div className="lounge min-h-screen bg-background">
        {head}
        <LoungeSidebar
          name={tenant.name}
          logoUrl={tenant.theme?.logoUrl}
          nav={tenant.nav ?? []}
          cta={{ label: tenant.theme?.ctaLabel || "Book a consultation", href: tenant.theme?.ctaHref || "/contact" }}
        />
        <div className="lg:pl-[16rem]">
          <main>{children}</main>
          <NotOnHome><LoungeFooter tenant={tenant} poweredBy={tenantPlan(tenant).badge} /></NotOnHome>
        </div>
        {chat}
      </div>
    );
  }

  return (
    <>
      {head}
      <SiteHeader
        name={tenant.name}
        logoUrl={tenant.theme?.logoUrl}
        nav={tenant.nav ?? []}
        phone={tenant.contact?.phone}
        cta={{ label: tenant.theme?.ctaLabel || "Book a consultation", href: tenant.theme?.ctaHref || "/contact" }}
      />
      <main>{children}</main>
      <SiteFooter name={tenant.name} tagline={tenant.tagline} contact={tenant.contact ?? {}} nav={tenant.nav ?? []} poweredBy={tenantPlan(tenant).badge} />
      {chat}
    </>
  );
}
