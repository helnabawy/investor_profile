import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireTenant, getProject } from "@/lib/tenant";
import { formatFullPrice, whatsappLink } from "@/lib/format";
import { statusLabel, yieldFigure } from "@/components/site/project-card";
import { ContactForm, OpenChatButton } from "@/components/sections/client";
import { ArrowLeft, Check, FileDown, MapPin } from "lucide-react";

type Props = { params: Promise<{ site: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { site, id } = await params;
  const tenant = await requireTenant(site);
  const p = await getProject(tenant.id, id);
  return p ? { title: p.title, description: p.description?.slice(0, 160), openGraph: { images: p.images.slice(0, 1) } } : {};
}

/** "60/40 — 60% during construction…" → [60, 40]. Only plans written as two parts that add up to 100. */
function planSplit(plan: string | null): [number, number] | null {
  const m = plan?.match(/(\d{1,2})\s*\/\s*(\d{1,2})/);
  if (!m) return null;
  const a = Number(m[1]), b = Number(m[2]);
  return a + b === 100 ? [a, b] : null;
}

export default async function ProjectPage({ params }: Props) {
  const { site, id } = await params;
  const tenant = await requireTenant(site);
  const p = await getProject(tenant.id, id);
  if (!p) notFound();

  const yld = yieldFigure(p.roi);
  const facts: [string, string | null, boolean?][] = [
    ["Bedrooms", p.bedrooms && `${p.bedrooms} BR`],
    ["Handover", p.status === "ready" ? "Ready to move" : p.handover],
    [yld ? "Expected gross yield" : "Strategy", yld ?? p.roi, true],
    ["Property type", p.property_type],
  ];
  const split = planSplit(p.payment_plan);
  const wa = whatsappLink(tenant.contact?.whatsapp, `Hi, I'm interested in ${p.title}. Could you share more details?`);
  const tel = tenant.contact?.phone;
  const [cover, ...rest] = p.images;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-7 px-5 pb-20 pt-24 lg:pt-28">
      <Link href="/projects" className="inline-flex min-h-11 items-center gap-2 self-start font-medium text-primary hover:underline"><ArrowLeft size={18} aria-hidden /> All projects</Link>

      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
        <div className="flex min-w-0 flex-col gap-2.5">
          <span className="c-badge c-tile self-start">{statusLabel(p.status)}</span>
          <h1 className="text-balance text-[clamp(1.9rem,3.4vw,2.75rem)] font-bold leading-[1.1]">{p.title}</h1>
          <p className="flex items-center gap-2 text-[1.06rem] text-muted-foreground">
            <MapPin size={18} aria-hidden /> {[[p.area, p.city].filter(Boolean).join(", "), p.developer && `by ${p.developer}`].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className="flex flex-col">
          <span className="c-label">Starting from</span>
          <span className="c-figure text-[2rem] leading-tight">{formatFullPrice(p.price_from, p.currency)}</span>
        </div>
      </div>

      {cover && (
        <div className="flex flex-wrap gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover} alt={p.title} className="h-[min(460px,62vw)] min-w-0 flex-[2_1_30rem] rounded-[calc(var(--radius)+8px)] object-cover" />
          {rest[0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={rest[0]} alt="" className="h-[min(460px,62vw)] min-w-0 flex-[1_1_18rem] rounded-[calc(var(--radius)+8px)] object-cover" />
          )}
        </div>
      )}

      <div className="flex flex-wrap items-start gap-x-10 gap-y-8">
        <div className="flex min-w-0 flex-[999_1_34rem] flex-col gap-6">
          <dl aria-label="Key facts" className="c-card grid grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))] gap-x-6 px-6 py-2">
            {facts.filter(([, v]) => v).map(([k, v, accent]) => (
              <div key={k} className="flex flex-col gap-0.5 py-4">
                <dt className="c-label">{k}</dt>
                <dd className={`c-figure text-lg ${accent ? "text-primary" : ""}`}>{v}</dd>
              </div>
            ))}
          </dl>

          {p.description && (
            <section className="c-card flex flex-col gap-3 p-7">
              <h2 className="text-[1.35rem] font-bold">Overview</h2>
              <p className="whitespace-pre-line text-[1.06rem] leading-relaxed text-muted-foreground">{p.description}</p>
            </section>
          )}

          {p.payment_plan && (
            <section className="c-card flex flex-col gap-4 p-7">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-[1.35rem] font-bold">Payment plan</h2>
                {split && <span className="c-figure text-primary">{split[0]} / {split[1]}</span>}
              </div>
              {split ? (
                <>
                  <div role="img" aria-label={`${split[0]} percent before handover, ${split[1]} percent on handover`} className="flex h-3.5 gap-[3px] overflow-hidden rounded-full">
                    <span className="bg-primary" style={{ flex: split[0] }} />
                    <span className="bg-[color-mix(in_srgb,var(--primary)_40%,var(--card))]" style={{ flex: split[1] }} />
                  </div>
                  <p className="text-muted-foreground">{p.payment_plan}</p>
                </>
              ) : (
                <p className="text-[1.06rem] text-muted-foreground">{p.payment_plan}</p>
              )}
              <p className="border-t pt-4 text-sm text-muted-foreground">Ask for the full cost sheet for any unit: price, fees and service charges.</p>
            </section>
          )}

          {p.amenities.length > 0 && (
            <section className="c-card flex flex-col gap-4 p-7">
              <h2 className="text-[1.35rem] font-bold">Amenities</h2>
              <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {p.amenities.map((a) => <li key={a} className="flex items-center gap-2.5"><Check size={19} className="shrink-0 text-primary" aria-hidden />{a}</li>)}
              </ul>
            </section>
          )}

          {rest.length > 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {rest.slice(1).map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} src={src} alt="" loading="lazy" className="aspect-[4/3] w-full rounded-[calc(var(--radius)+4px)] object-cover" />
              ))}
            </div>
          )}
        </div>

        <aside className="flex min-w-0 flex-[1_1_21rem] flex-col gap-4 lg:sticky lg:top-24">
          <div className="c-card p-7 shadow-[0_12px_32px_rgb(0_0_0/0.07)]">
            <h2 className="text-[1.35rem] font-bold">Enquire about this project</h2>
            <p className="mb-5 mt-1 text-[0.95rem] text-muted-foreground">Get availability, floor plans and the full cost sheet.</p>
            <ContactForm interest={p.title} />
          </div>
          {(wa || tel || p.brochure_url || tenant.ai_config?.enabled !== false) && (
            <div className="flex flex-col gap-3 rounded-[calc(var(--radius)+4px)] bg-muted p-6">
              <p className="font-heading text-lg font-bold">Prefer to talk now?</p>
              {wa && <a href={wa} target="_blank" rel="noreferrer" className="btn btn-light">Chat on WhatsApp</a>}
              {tel && <a href={`tel:${tel.replace(/\s/g, "")}`} className="btn btn-light">Call {tel}</a>}
              {p.brochure_url && <a href={p.brochure_url} target="_blank" rel="noreferrer" className="btn btn-light"><FileDown size={17} aria-hidden /> Download brochure</a>}
              {tenant.ai_config?.enabled !== false && <OpenChatButton label="Ask the concierge about this project" variant="light" />}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
