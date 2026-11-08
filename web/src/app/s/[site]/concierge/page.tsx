import { requireTenant } from "@/lib/tenant";
import { ConciergeChat } from "./concierge-chat";

export const metadata = { title: "Concierge" };

export default async function ConciergePage({ params }: { params: Promise<{ site: string }> }) {
  const tenant = await requireTenant((await params).site);
  const ai = tenant.ai_config ?? {};
  return (
    <section className="mx-auto max-w-4xl px-5 pb-16 pt-28">
      <p className="eyebrow mb-3">AI Concierge</p>
      <h1 className="text-3xl md:text-5xl">Ask {ai.assistantName || tenant.name} anything</h1>
      <p className="mt-3 text-lg text-muted-foreground">Projects, prices, payment plans, areas and buying process — answered instantly, with an advisor one message away.</p>
      <div className="mt-8 h-[640px] max-h-[75vh] overflow-hidden rounded-[var(--radius)] border bg-background">
        <ConciergeChat
          storageKey={tenant.slug}
          assistantName={ai.assistantName || `${tenant.name} Assistant`}
          greeting={ai.greeting || `Hi! I'm the ${tenant.name} assistant. How can I help?`}
        />
      </div>
    </section>
  );
}
