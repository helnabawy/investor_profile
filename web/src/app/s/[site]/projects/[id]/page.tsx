import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireTenant, getProject } from "@/lib/tenant";
import { formatPrice, whatsappLink } from "@/lib/format";
import { ContactForm, OpenChatButton } from "@/components/sections/client";
import { ArrowLeft, Check, FileDown } from "lucide-react";

type Props = { params: Promise<{ site: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { site, id } = await params;
  const tenant = await requireTenant(site);
  const p = await getProject(tenant.id, id);
  return p ? { title: p.title, description: p.description?.slice(0, 160), openGraph: { images: p.images.slice(0, 1) } } : {};
}

export default async function ProjectPage({ params }: Props) {
  const { site, id } = await params;
  const tenant = await requireTenant(site);
  const p = await getProject(tenant.id, id);
  if (!p) notFound();

  const facts: [string, string | null][] = [
    ["Starting price", formatPrice(p.price_from, p.currency)],
    ["Status", p.status === "off-plan" ? "Off-plan" : p.status === "ready" ? "Ready" : "Sold out"],
    ["Location", [p.area, p.city].filter(Boolean).join(", ") || null],
    ["Developer", p.developer],
    ["Type", p.property_type],
    ["Bedrooms", p.bedrooms],
    ["Handover", p.handover],
    ["Payment plan", p.payment_plan],
    ["Expected yield", p.roi],
  ];
  const wa = whatsappLink(tenant.contact?.whatsapp, `Hi, I'm interested in ${p.title}. Could you share more details?`);

  return (
    <>
      <section data-hero className="relative h-[70vh] min-h-[460px] overflow-hidden text-white">
        {p.images[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.images[0]} alt={p.title} className="absolute inset-0 h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/30" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-14">
          <Link href="/projects" className="mb-6 inline-flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-white/80 hover:text-white"><ArrowLeft size={16} /> All projects</Link>
          {p.developer && <p className="eyebrow mb-3">{p.developer}</p>}
          <h1 className="text-4xl md:text-6xl">{p.title}</h1>
          <p className="mt-4 text-xl text-white/85">From {formatPrice(p.price_from, p.currency)}{p.area ? ` · ${p.area}` : ""}</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-14 px-5 py-16 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <h2 className="text-3xl">Overview</h2>
          {p.description && <p className="mt-5 whitespace-pre-line text-lg leading-relaxed text-muted-foreground">{p.description}</p>}

          <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius)] border bg-border sm:grid-cols-3">
            {facts.filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="bg-background p-5">
                <dt className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{k}</dt>
                <dd className="mt-1.5 font-heading text-lg">{v}</dd>
              </div>
            ))}
          </dl>

          {p.amenities.length > 0 && (
            <>
              <h3 className="mt-12 text-2xl">Amenities</h3>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {p.amenities.map((a) => <li key={a} className="flex items-center gap-3"><Check size={18} className="text-primary" />{a}</li>)}
              </ul>
            </>
          )}

          {p.images.length > 1 && (
            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {p.images.slice(1).map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} src={src} alt="" loading="lazy" className="aspect-[4/3] w-full rounded-[var(--radius)] object-cover" />
              ))}
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[var(--radius)] border bg-card p-6 md:p-8">
            <p className="eyebrow mb-2">Enquire</p>
            <h3 className="text-2xl">Get floor plans & availability</h3>
            <div className="mt-6"><ContactForm interest={p.title} /></div>
            <div className="mt-6 flex flex-col gap-3 border-t pt-6">
              {wa && <a href={wa} target="_blank" rel="noreferrer" className="btn btn-outline">WhatsApp an advisor</a>}
              {p.brochure_url && <a href={p.brochure_url} target="_blank" rel="noreferrer" className="btn btn-outline"><FileDown size={16} /> Download brochure</a>}
              {tenant.ai_config?.enabled !== false && <OpenChatButton label="Ask the AI concierge" />}
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}
