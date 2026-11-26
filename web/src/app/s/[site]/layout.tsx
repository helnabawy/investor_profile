import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTenantBySite, requestedLocale, requireTenant, siteLocale, siteLocales, tenantPlan } from "@/lib/tenant";
import { siteT } from "@/lib/i18n/server";
import { arabicFont, googleFontsHref, resolveTheme, siteLayout, themeCss } from "@/lib/theme";
import { LoungeSidebar } from "@/components/lounge/sidebar";
import { LoungeFooter } from "@/components/lounge/footer";
import { NotOnHome } from "@/components/lounge/not-on-home";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { ChatWidget } from "@/components/site/chat";
import { SiteBaseProvider } from "@/components/site/link";
import { TemplateHeader } from "@/components/templates/header";
import { TemplateFooter } from "@/components/templates/footer";

type Props = { children: React.ReactNode; params: Promise<{ site: string }> };

/** Where the site lives and which page this is (set by the proxy). */
async function sitePaths() {
  const h = await headers();
  // "/s/<slug>" when the site is served under a path (see the proxy), "" on its own host.
  const root = h.get("x-site-root") ?? "";
  return { root, path: h.get("x-site-path") ?? "/" };
}

const join = (base: string, path: string) => (path === "/" ? base || "/" : base + path);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const site = (await params).site;
  const t = await requireTenant(site);
  const { defaultLocale, locales } = siteLocales((await getTenantBySite(site))!);
  const { root, path } = await sitePaths();
  // hreflang: each published language's address for this page, the default one as x-default.
  const languages = locales.length > 1
    ? Object.fromEntries([
        ...locales.map((l) => [l, join(root + (l === defaultLocale ? "" : `/${l}`), path)]),
        ["x-default", join(root, path)],
      ])
    : undefined;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.includes("localhost") ? "http" : "https");
  return {
    metadataBase: host ? new URL(`${proto}://${host}`) : undefined,
    title: { default: t.name, template: `%s · ${t.name}` },
    description: t.tagline ?? undefined,
    icons: t.theme?.faviconUrl ? [{ url: t.theme.faviconUrl }] : undefined,
    alternates: languages ? { languages } : undefined,
  };
}

export default async function TenantLayout(props: Props) {
  const raw = await getTenantBySite((await props.params).site);
  const { root, path } = await sitePaths();
  const asked = await requestedLocale();
  const locale = await siteLocale();
  const { defaultLocale, locales } = raw ? siteLocales(raw) : { defaultLocale: locale, locales: [locale] };
  // /en on an English site, or /ar on a site that does not publish Arabic: the plain address.
  if (raw && asked && (asked === defaultLocale || !locales.includes(asked))) redirect(join(root, path));
  const base = root + (locale === defaultLocale ? "" : `/${locale}`);
  return (
    <SiteBaseProvider base={base} root={root} locale={locale} defaultLocale={defaultLocale} locales={locales}>
      <TenantShell {...props} />
    </SiteBaseProvider>
  );
}

async function TenantShell({ children, params }: Props) {
  const tenant = await requireTenant((await params).site);
  const { t, locale } = await siteT();
  const theme = resolveTheme(tenant.theme);
  const fonts = googleFontsHref(theme, locale, arabicFont(tenant.theme));
  const ai = tenant.ai_config ?? {};
  const layout = siteLayout(tenant.theme);
  const chat = ai.enabled !== false && (
    <ChatWidget
      storageKey={tenant.slug}
      hideOnHome={layout === "lounge"}
      assistantName={ai.assistantName || t.common.assistantName(tenant.name)}
      greeting={ai.greeting || t.common.greeting(tenant.name)}
      suggestions={ai.suggestions?.length ? ai.suggestions : t.chat.suggestions}
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
      <style dangerouslySetInnerHTML={{ __html: themeCss(theme, locale, arabicFont(tenant.theme)) }} />
    </>
  );

  if (layout === "lounge") {
    return (
      <div className="lounge min-h-screen bg-background">
        {head}
        <LoungeSidebar
          name={tenant.name}
          logoUrl={tenant.theme?.logoUrl}
          portraitUrl={tenant.theme?.portraitUrl}
          nav={tenant.nav ?? []}
          cta={{ label: tenant.theme?.ctaLabel || t.common.bookConsultation, href: tenant.theme?.ctaHref || "/contact" }}
        />
        <div className="lg:ps-[16rem]">
          <main>{children}</main>
          <NotOnHome><LoungeFooter tenant={tenant} poweredBy={tenantPlan(tenant).badge} /></NotOnHome>
        </div>
        {chat}
      </div>
    );
  }

  if (layout !== "classic") {
    // Horizon, Ledger, Atelier and Foyer share one shell; `.tpl-<name>` scopes each one's shapes.
    // Foyer's home page is a single screen, so its header and footer appear on inner pages only.
    const footer = <TemplateFooter name={tenant.name} tagline={tenant.tagline} contact={tenant.contact ?? {}} nav={tenant.nav ?? []} poweredBy={tenantPlan(tenant).badge} />;
    return (
      <div className={`tpl tpl-${layout} min-h-screen bg-background`}>
        {head}
        <TemplateHeader
          kind={layout}
          hideOnHome={layout === "foyer"}
          name={tenant.name}
          tagline={tenant.tagline}
          logoUrl={tenant.theme?.logoUrl}
          nav={tenant.nav ?? []}
          phone={tenant.contact?.phone}
          cta={{ label: tenant.theme?.ctaLabel || t.common.bookConsultation, href: tenant.theme?.ctaHref || "/contact" }}
        />
        <main>{children}</main>
        {layout === "foyer" ? <NotOnHome>{footer}</NotOnHome> : footer}
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
        cta={{ label: tenant.theme?.ctaLabel || t.common.bookConsultation, href: tenant.theme?.ctaHref || "/contact" }}
      />
      <main>{children}</main>
      <SiteFooter name={tenant.name} tagline={tenant.tagline} contact={tenant.contact ?? {}} nav={tenant.nav ?? []} poweredBy={tenantPlan(tenant).badge} />
      {chat}
    </>
  );
}
