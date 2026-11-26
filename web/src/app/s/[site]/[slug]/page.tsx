import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireTenant, getPage } from "@/lib/tenant";
import { RenderSections } from "@/components/sections/render";
import { newSection } from "@/lib/sections/registry";
import { siteT } from "@/lib/i18n/server";

type Props = { params: Promise<{ site: string; slug: string }> };

// Pages every site has even if the agent hasn't built them yet.
const BUILTIN: Record<string, { title: "contact" | "about"; type: string }> = {
  contact: { title: "contact", type: "contact" },
  about: { title: "about", type: "about" },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { site, slug } = await params;
  const tenant = await requireTenant(site);
  const page = await getPage(tenant.id, slug);
  const { t } = await siteT();
  return { title: page?.title ?? (BUILTIN[slug] && t.pages[BUILTIN[slug].title]), description: page?.description ?? undefined };
}

export default async function CmsPage({ params }: Props) {
  const { site, slug } = await params;
  const tenant = await requireTenant(site);
  const page = await getPage(tenant.id, slug);
  if (page) return <RenderSections sections={page.sections} tenant={tenant} />;
  if (BUILTIN[slug]) return <RenderSections sections={[newSection(BUILTIN[slug].type, (await siteT()).locale)]} tenant={tenant} />;
  notFound();
}
