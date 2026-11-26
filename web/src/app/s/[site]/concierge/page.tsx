import { requireTenant } from "@/lib/tenant";
import { ConciergeChat } from "./concierge-chat";
import { siteT } from "@/lib/i18n/server";

export async function generateMetadata() {
  return { title: (await siteT()).t.pages.concierge };
}

export default async function ConciergePage({ params }: { params: Promise<{ site: string }> }) {
  const tenant = await requireTenant((await params).site);
  const ai = tenant.ai_config ?? {};
  const { t } = await siteT();
  return (
    <section className="mx-auto max-w-4xl px-5 pb-16 pt-28">
      <p className="eyebrow mb-3">{t.common.aiConcierge}</p>
      <h1 className="text-3xl md:text-5xl">{t.pages.askAnything(ai.assistantName || tenant.name)}</h1>
      <p className="mt-3 text-lg text-muted-foreground">{t.pages.conciergeIntro}</p>
      <div className="mt-8 h-[640px] max-h-[75vh] overflow-hidden rounded-[var(--radius)] border bg-background">
        <ConciergeChat
          storageKey={tenant.slug}
          assistantName={ai.assistantName || t.common.assistantName(tenant.name)}
          greeting={ai.greeting || t.common.greetingShort(tenant.name)}
          suggestions={ai.suggestions?.length ? ai.suggestions : undefined}
        />
      </div>
    </section>
  );
}
