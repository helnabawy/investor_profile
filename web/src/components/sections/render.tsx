import Link from "next/link";
import type { Section } from "@/lib/sections/registry";
import type { Tenant } from "@/lib/types";
import { getFaqs, getProjects } from "@/lib/tenant";
import { ProjectCard } from "../site/project-card";
import { ChatAwareLink, ConciergeAsk, ContactForm, OpenChatButton, ProjectExplorer, Reveal } from "./client";
import { Mail, MapPin, Phone, Check, MessageCircle, Clock, ChevronDown, ArrowRight, Building2, LineChart, UserRound, ChevronRight } from "lucide-react";
import { formatPrice, whatsappLink } from "@/lib/format";
import { DEFAULT_SUGGESTIONS } from "@/lib/suggestions";
import { statusLabel, yieldFigure } from "../site/project-card";
import { siteLayout, type SiteLayout } from "@/lib/theme";
import { Backdrop } from "../lounge/backdrop";

type P = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" ? v : "");
const arr = <T,>(v: unknown) => (Array.isArray(v) ? (v as T[]) : []);

function Btn({ href, label, variant = "primary" }: { href?: string; label?: string; variant?: "primary" | "outline" }) {
  if (!href || !label) return null;
  const cls = `btn btn-${variant}`;
  return /^https?:/.test(href) ? <a href={href} className={cls} target="_blank" rel="noreferrer">{label}</a> : <Link href={href} className={cls}>{label}</Link>;
}

function Heading({ eyebrow, title, subtitle, center, as: Tag = "h2" }: { eyebrow?: string; title?: string; subtitle?: string; center?: boolean; as?: "h1" | "h2" }) {
  if (!title && !eyebrow) return null;
  return (
    <Reveal className={center ? "mx-auto mb-10 max-w-2xl text-center" : "mb-8 max-w-2xl"}>
      {eyebrow && <p className="eyebrow mb-2.5">{eyebrow}</p>}
      {title && <Tag className={`text-balance font-bold leading-[1.12] ${Tag === "h1" ? "text-[clamp(2rem,3.4vw,2.75rem)]" : "text-[clamp(1.75rem,2.6vw,2.15rem)]"}`}>{title}</Tag>}
      {subtitle && <p className="mt-3 text-[1.06rem] text-muted-foreground">{subtitle}</p>}
    </Reveal>
  );
}

const Wrap = ({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) => (
  <section id={id} className={`mx-auto max-w-7xl px-5 py-16 md:py-20 ${className}`}>{children}</section>
);

/** Full-width band on the card colour, for alternating section grounds. */
const Band = ({ children }: { children: React.ReactNode }) => <div className="border-y bg-card">{children}</div>;

const QUICK_ICONS = { building: Building2, chart: LineChart, person: UserRound, chat: MessageCircle } as const;

/** "Get in Touch" → Get in <accent>Touch</accent>. An explicit accent (matching the title's end) wins over the last word. */
function AccentTitle({ title, accent, as: Tag = "h1", className = "" }: { title: string; accent?: string; as?: "h1" | "h2"; className?: string }) {
  const cut = accent && title.endsWith(accent) ? title.length - accent.length : accent ? title.length : title.lastIndexOf(" ") + 1;
  const head = title.slice(0, cut), tail = title.slice(cut);
  return <Tag className={`text-balance font-heading ${className}`}>{head}{tail && <span className="text-[color-mix(in_srgb,var(--accent)_45%,#fff)]">{tail}</span>}</Tag>;
}

async function SectionView({ s, tenant, layout, index, next }: { s: Section; tenant: Tenant; layout: SiteLayout; index: number; next?: string }) {
  const p = s.props as P;
  switch (s.type) {
    case "page-header": {
      const tall = index === 0 && !["project-grid", "featured-projects"].includes(next ?? "");
      return (
        <section data-hero className={`on-photo relative isolate flex flex-col items-center justify-center overflow-hidden px-5 text-center ${tall ? "min-h-[62vh] pb-20 pt-28 lg:pt-20" : "pb-16 pt-28 lg:pt-24"}`}>
          <Backdrop src={str(p.image) || tenant.theme?.backdropUrl} />
          <Reveal className="max-w-3xl">
            <AccentTitle title={str(p.title)} accent={str(p.accent) || undefined} className="text-[clamp(2.6rem,6vw,4.75rem)] leading-[1.04]" />
            {str(p.subtitle) && <p className="muted font-ui mx-auto mt-5 max-w-[52ch] text-[1.05rem] leading-relaxed">{str(p.subtitle)}</p>}
          </Reveal>
          {tall && <ChevronDown aria-hidden className="muted lounge-drift absolute bottom-6" size={22} strokeWidth={1.5} />}
        </section>
      );
    }

    case "story":
      return (
        <section className="mx-auto max-w-[88rem] space-y-6 px-4 py-16 sm:px-6 md:space-y-8 md:py-24">
          {arr<P>(p.items).map((it, i) => (
            <Reveal key={i}>
              <article className="on-photo relative isolate grid md:min-h-[34rem] md:items-center overflow-hidden rounded-[calc(var(--radius)+6px)] bg-[var(--lounge-ink)] md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                {str(it.image) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={str(it.image)} alt="" loading="lazy" className="lounge-story-img aspect-[4/3] w-full object-cover md:absolute md:inset-0 md:-z-10 md:aspect-auto md:h-full" />
                )}
                <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,var(--lounge-ink)_0%,color-mix(in_srgb,var(--lounge-ink)_88%,transparent)_38%,color-mix(in_srgb,var(--lounge-ink)_25%,transparent)_75%,transparent_100%)] max-md:hidden" />
                <div className="px-6 pb-10 pt-8 sm:px-12 md:py-16 lg:px-16">
                  <p aria-hidden className="font-heading text-[clamp(3.2rem,6vw,5rem)] font-normal leading-none text-[color-mix(in_srgb,var(--lounge-text)_62%,transparent)] md:text-[color-mix(in_srgb,var(--lounge-text)_38%,transparent)] [font-variant-numeric:lining-nums]">{String(i + 1).padStart(2, "0")}</p>
                  <h2 className="mt-5 max-w-[16ch] text-balance font-heading text-[clamp(1.8rem,3vw,2.6rem)] leading-[1.1]">{str(it.title)}</h2>
                  <p className="muted font-ui mt-5 max-w-[46ch] whitespace-pre-line text-[0.98rem] leading-[1.7]">{str(it.body)}</p>
                  <span aria-hidden className="mt-8 block h-px w-14 bg-[color-mix(in_srgb,var(--accent)_70%,transparent)]" />
                </div>
              </article>
            </Reveal>
          ))}
        </section>
      );

    case "hero-split": {
      const [featured] = await getProjects(tenant.id, { featured: true, limit: 1 });
      const ai = tenant.ai_config ?? {};
      const yld = featured && yieldFigure(featured.roi);
      return (
        <section className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-16 gap-y-12 px-5 pb-14 pt-10 md:pb-16 md:pt-16">
          {/* Above the fold: render at once, no reveal animation. */}
          <div className="flex min-w-0 flex-[1_1_28rem] flex-col gap-6">
            {str(p.eyebrow) && <p className="eyebrow">{str(p.eyebrow)}</p>}
            <h1 className="text-balance text-[clamp(2.1rem,4.2vw,3.5rem)] font-bold leading-[1.08] tracking-[-0.02em]">{str(p.title)}</h1>
            {str(p.subtitle) && <p className="max-w-[34rem] text-[1.12rem] text-muted-foreground">{str(p.subtitle)}</p>}
            {ai.enabled !== false ? (
              <ConciergeAsk
                placeholder={str(p.askPlaceholder) || "Ask about projects, prices or payment plans"}
                suggestions={ai.suggestions?.length ? ai.suggestions : DEFAULT_SUGGESTIONS}
                note={`Answers come only from ${tenant.name}'s own portfolio and notes. A person follows up on request.`}
              />
            ) : (
              <div className="flex flex-wrap gap-3"><Btn href="/projects" label="Browse projects" /><Btn href="/contact" label="Contact us" variant="outline" /></div>
            )}
          </div>
          <div className="relative min-w-0 flex-[1_1_24rem]">
            {str(p.image) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={str(p.image)} alt="" className="block h-[min(560px,70vw)] min-h-[340px] w-full rounded-[calc(var(--radius)+8px)] object-cover" />
            ) : <div className="h-[460px] rounded-[calc(var(--radius)+8px)] bg-muted" />}
            {featured && (
              <Link href={`/projects/${featured.id}`} className="absolute inset-x-4 bottom-4 flex flex-wrap items-center justify-between gap-x-5 gap-y-2 rounded-[calc(var(--radius)+2px)] bg-card px-5 py-4 shadow-[0_10px_28px_rgb(0_0_0/0.18)] transition hover:-translate-y-0.5 sm:inset-x-5 sm:bottom-5">
                <span className="flex min-w-0 flex-col">
                  <span className="text-xs font-semibold uppercase tracking-[0.06em] text-primary">Featured · {statusLabel(featured.status)}</span>
                  <span className="font-heading font-bold">{featured.title}</span>
                  <span className="text-sm text-muted-foreground">{[featured.area, yld && `${yld} expected gross yield`].filter(Boolean).join(" · ")}</span>
                </span>
                <span className="c-figure whitespace-nowrap">From {formatPrice(featured.price_from, featured.currency)}</span>
              </Link>
            )}
          </div>
        </section>
      );
    }

    case "quick-links":
      return (
        <nav aria-label="Start here" className="mx-auto grid max-w-7xl gap-4 px-5 pb-16 sm:grid-cols-2 lg:grid-cols-3">
          {arr<P>(p.items).map((it, i) => {
            const Icon = QUICK_ICONS[str(it.icon) as keyof typeof QUICK_ICONS] ?? ArrowRight;
            return (
              <ChatAwareLink key={i} href={str(it.href) || "/"} className="c-card flex items-center gap-4 px-6 py-5 transition hover:border-primary">
                <span className="c-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"><Icon size={22} aria-hidden /></span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="font-heading text-[1.05rem] font-semibold">{str(it.title)}</span>
                  {str(it.body) && <span className="text-sm text-muted-foreground">{str(it.body)}</span>}
                </span>
                <ChevronRight size={18} className="shrink-0 text-primary" aria-hidden />
              </ChatAwareLink>
            );
          })}
        </nav>
      );

    case "steps":
      return (
        <section className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-16 gap-y-10 px-5 py-16 md:py-20">
          {str(p.image) && (
            <Reveal className="min-w-0 flex-[1_1_22rem]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={str(p.image)} alt="" loading="lazy" className="block h-[min(460px,80vw)] w-full rounded-[calc(var(--radius)+8px)] object-cover" />
            </Reveal>
          )}
          <Reveal delay={0.08} className="flex min-w-0 flex-[1_1_28rem] flex-col gap-7">
            <div className="flex flex-col gap-2.5">
              <h2 className="text-balance text-[clamp(1.75rem,2.6vw,2.15rem)] font-bold leading-[1.12]">{str(p.title)}</h2>
              {str(p.subtitle) && <p className="text-[1.06rem] text-muted-foreground">{str(p.subtitle)}</p>}
            </div>
            <ol className="flex flex-col gap-5">
              {arr<P>(p.items).map((it, i) => (
                <li key={i} className="flex gap-4">
                  <span aria-hidden className="c-tile flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-heading font-bold">{i + 1}</span>
                  <span className="flex flex-col gap-1">
                    <span className="font-heading text-lg font-semibold">{str(it.title)}</span>
                    <span className="text-muted-foreground">{str(it.body)}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Reveal>
        </section>
      );

    case "hero":
      return (
        <section data-hero className="relative flex min-h-[88vh] items-end overflow-hidden text-white">
          {str(p.image) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={str(p.image)} alt="" className="absolute inset-0 h-full w-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
          <div className="relative mx-auto w-full max-w-7xl px-5 pb-20 pt-40 md:pb-28">
            <Reveal className="max-w-3xl">
              {str(p.eyebrow) && <p className="eyebrow mb-5 !text-[color-mix(in_srgb,var(--accent)_45%,#fff)] [text-shadow:0_1px_12px_rgb(0_0_0/0.6)]">{str(p.eyebrow)}</p>}
              <h1 className="text-4xl leading-[1.08] md:text-7xl">{str(p.title)}</h1>
              {str(p.subtitle) && <p className="mt-6 max-w-2xl text-lg text-white/80 md:text-xl">{str(p.subtitle)}</p>}
              <div className="mt-10 flex flex-wrap gap-4">
                <Btn href={str(p.ctaHref)} label={str(p.ctaLabel)} />
                <Btn href={str(p.secondaryHref)} label={str(p.secondaryLabel)} variant="outline" />
              </div>
            </Reveal>
          </div>
        </section>
      );

    case "stats":
      return (
        <section className="border-y bg-card">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-5 py-12 md:grid-cols-4">
            {arr<P>(p.items).map((it, i) => (
              <Reveal key={i} delay={i * 0.08} className="text-center">
                <p className="font-heading text-3xl text-primary md:text-4xl">{str(it.value)}</p>
                <p className="mt-2 text-sm uppercase tracking-[0.16em] text-muted-foreground">{str(it.label)}</p>
              </Reveal>
            ))}
          </div>
        </section>
      );

    case "about":
      return (
        <Wrap>
          <div className="grid items-center gap-12 md:grid-cols-2">
            <Reveal>
              <p className="eyebrow mb-3">About</p>
              <h2 className="text-3xl md:text-5xl">{str(p.title)}</h2>
              <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-muted-foreground">{str(p.body)}</p>
              <ul className="mt-8 space-y-3">
                {arr<P>(p.bullets).map((b, i) => (
                  <li key={i} className="flex items-center gap-3"><Check size={18} className="text-primary" />{str(b.text ?? b)}</li>
                ))}
              </ul>
            </Reveal>
            {str(p.image) && (
              <Reveal delay={0.1}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={str(p.image)} alt="" className="aspect-[4/5] w-full rounded-[var(--radius)] object-cover" />
              </Reveal>
            )}
          </div>
        </Wrap>
      );

    case "featured-projects": {
      const projects = await getProjects(tenant.id, { featured: true, limit: Number(p.limit) || 3 });
      if (!projects.length) return null;
      const featuredGrid = (
        <Wrap>
          <div className="flex flex-wrap items-end justify-between gap-x-6">
            <Heading title={str(p.title)} subtitle={str(p.subtitle)} />
            <Link href="/projects" className="mb-8 inline-flex min-h-11 items-center gap-2 font-semibold text-primary hover:underline">View all projects <ArrowRight size={18} aria-hidden /></Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((pr, i) => <Reveal key={pr.id} delay={i * 0.08} className="h-full"><ProjectCard p={pr} /></Reveal>)}
          </div>
        </Wrap>
      );
      return layout === "lounge" ? featuredGrid : <Band>{featuredGrid}</Band>;
    }

    case "project-grid": {
      const projects = await getProjects(tenant.id);
      const headed = layout === "lounge" && index > 0; // a page-header above already titles the page
      return (
        <Wrap className={headed ? "!pt-12 md:!pt-16" : ""}>
          {!headed && <Heading as={index === 0 ? "h1" : "h2"} title={str(p.title)} subtitle={str(p.subtitle)} />}
          <ProjectExplorer projects={projects} />
        </Wrap>
      );
    }

    case "features":
      return (
        <Wrap>
          <Heading title={str(p.title)} center />
          <div className="grid gap-px overflow-hidden rounded-[var(--radius)] border bg-border md:grid-cols-3">
            {arr<P>(p.items).map((it, i) => (
              <Reveal key={i} delay={i * 0.08} className="bg-background p-8 md:p-10">
                <p className="font-heading text-4xl text-primary/60">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-4 text-2xl">{str(it.title)}</h3>
                <p className="mt-3 text-muted-foreground">{str(it.body)}</p>
              </Reveal>
            ))}
          </div>
        </Wrap>
      );

    case "testimonials":
      return (
        <section className="bg-card">
          <Wrap>
            <Heading title={str(p.title)} center />
            <div className="grid gap-6 md:grid-cols-2">
              {arr<P>(p.items).map((it, i) => (
                <Reveal key={i} delay={i * 0.08} className="rounded-[var(--radius)] border bg-background p-8">
                  <p className="font-heading text-2xl leading-snug">“{str(it.quote)}”</p>
                  <p className="mt-6 text-sm uppercase tracking-[0.16em] text-primary">{str(it.author)}</p>
                  {str(it.role) && <p className="text-sm text-muted-foreground">{str(it.role)}</p>}
                </Reveal>
              ))}
            </div>
          </Wrap>
        </section>
      );

    case "gallery":
      return (
        <Wrap>
          <Heading title={str(p.title)} />
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {arr<string>(p.images).map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt="" loading="lazy" className="mb-4 w-full rounded-[var(--radius)]" />
            ))}
          </div>
        </Wrap>
      );

    case "cta":
      if (layout === "lounge") {
        return (
          <section className="px-5 pb-24 pt-8 text-center md:pb-32">
            <Reveal className="mx-auto max-w-2xl">
              <h2 className="text-balance font-heading text-[clamp(2rem,4vw,3rem)] leading-[1.1]">{str(p.title)}</h2>
              {str(p.body) && <p className="font-ui mx-auto mt-4 max-w-[52ch] text-[1.02rem] leading-relaxed text-muted-foreground">{str(p.body)}</p>}
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                {str(p.ctaHref) && str(p.ctaLabel) && <Link href={str(p.ctaHref)} className="lounge-submit inline-flex px-7">{str(p.ctaLabel)}</Link>}
                {tenant.ai_config?.enabled !== false && <OpenChatButton label="Ask the concierge" variant="lounge" />}
              </div>
            </Reveal>
          </section>
        );
      }
      {
        const wa = whatsappLink(tenant.contact?.whatsapp, `Hi ${tenant.name}, I'd like to know more.`);
        return (
          <Wrap>
            <Reveal className="c-dark flex flex-wrap items-center justify-between gap-x-12 gap-y-7 rounded-[calc(var(--radius)+12px)] px-7 py-12 md:px-12 md:py-14">
              <div className="flex min-w-0 flex-[1_1_26rem] flex-col gap-2.5">
                <h2 className="text-balance text-[clamp(1.75rem,2.6vw,2.15rem)] font-bold leading-[1.12]">{str(p.title)}</h2>
                {str(p.body) && <p className="text-[1.06rem] text-white/80">{str(p.body)}</p>}
              </div>
              <div className="flex flex-wrap gap-3">
                {str(p.ctaHref) && str(p.ctaLabel) && <Link href={str(p.ctaHref)} className="btn bg-white text-[color:var(--foreground)] hover:bg-white/90">{str(p.ctaLabel)}</Link>}
                {wa && <a href={wa} target="_blank" rel="noreferrer" className="btn border border-white/45 text-white hover:bg-white/10">Chat on WhatsApp</a>}
              </div>
            </Reveal>
          </Wrap>
        );
      }

    case "chat-cta":
      if (tenant.ai_config?.enabled === false) return null;
      return (
        <Wrap>
          <Reveal className="grid items-center gap-8 rounded-[var(--radius)] border border-primary/30 bg-primary/5 p-10 md:grid-cols-[1fr_auto] md:p-14">
            <div>
              <p className="eyebrow mb-3">AI Concierge</p>
              <h2 className="text-3xl md:text-4xl">{str(p.title)}</h2>
              {str(p.body) && <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{str(p.body)}</p>}
            </div>
            <OpenChatButton label={str(p.buttonLabel) || "Start chatting"} />
          </Reveal>
        </Wrap>
      );

    case "faq": {
      const faqs = await getFaqs(tenant.id);
      if (!faqs.length) return null;
      return (
        <Band>
          <Wrap id="faq" className="flex scroll-mt-20 flex-wrap gap-x-16 gap-y-8">
            <div className="flex min-w-0 flex-[1_1_18rem] flex-col items-start gap-3">
              <Heading title={str(p.title)} subtitle={str(p.subtitle) || "Straight answers on ownership, costs and payment plans."} />
              {tenant.ai_config?.enabled !== false && <OpenChatButton label="Ask something else" variant="light" />}
            </div>
            <div className="flex min-w-0 flex-[2_1_30rem] flex-col gap-3">
              {faqs.map((f, i) => (
                <details key={f.id} open={i === 0} className="faq-item group rounded-[calc(var(--radius)+2px)] border bg-background px-5 open:bg-background">
                  <summary className="flex min-h-[3.75rem] cursor-pointer list-none items-center justify-between gap-6 font-heading text-[1.05rem] font-semibold">
                    {f.question}
                    <ChevronDown size={20} aria-hidden className="shrink-0 text-primary transition group-open:rotate-180" />
                  </summary>
                  <p className="whitespace-pre-line pb-5 text-muted-foreground">{f.answer}</p>
                </details>
              ))}
            </div>
          </Wrap>
        </Band>
      );
    }

    case "contact": {
      const c = tenant.contact ?? {};
      const wa = whatsappLink(c.whatsapp, `Hi ${tenant.name}, I'd like to know more.`);
      if (layout === "lounge") {
        const channels = [
          c.email && { icon: Mail, label: "Email", value: c.email, href: `mailto:${c.email}` },
          c.phone && { icon: Phone, label: "Phone", value: c.phone, href: `tel:${c.phone.replace(/\s/g, "")}` },
          wa && { icon: MessageCircle, label: "WhatsApp", value: `Chat with ${tenant.name.split(" ")[0]}`, href: wa },
          c.address && { icon: MapPin, label: "Office", value: c.address },
          c.hours && { icon: Clock, label: "Hours", value: c.hours },
        ].filter(Boolean) as { icon: typeof Mail; label: string; value: string; href?: string }[];
        return (
          <section className="on-photo relative isolate overflow-hidden px-4 pb-20 pt-28 sm:px-6 lg:pt-20">
            <Backdrop src={tenant.theme?.backdropUrl} />
            <Reveal className="mx-auto max-w-3xl text-center">
              <AccentTitle title={str(p.title) || "Get in Touch"} className="text-[clamp(2.6rem,6vw,4.5rem)] leading-[1.04]" />
              {str(p.subtitle) && <p className="muted font-ui mx-auto mt-5 max-w-[56ch] text-[1.05rem] leading-relaxed">{str(p.subtitle)}</p>}
            </Reveal>
            <div className="mx-auto mt-14 grid max-w-6xl gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.25fr)]">
              <ul className="self-start overflow-hidden rounded-[calc(var(--radius)+6px)] border border-[var(--lounge-glass-line)] bg-[var(--lounge-glass)] backdrop-blur-md">
                {channels.map(({ icon: Icon, label, value, href }) => {
                  const body = (
                    <>
                      <Icon size={20} strokeWidth={1.5} className="mt-0.5 shrink-0 text-[var(--accent)]" aria-hidden />
                      <span>
                        <span className="block font-heading text-[1.05rem]">{label}</span>
                        <span className="muted font-ui mt-1 block whitespace-pre-line text-[0.92rem]">{value}</span>
                      </span>
                    </>
                  );
                  return (
                    <li key={label} className="border-b border-[var(--lounge-glass-line)] last:border-0">
                      {href ? (
                        <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="flex gap-4 px-6 py-5 transition-colors hover:bg-white/5">{body}</a>
                      ) : (
                        <div className="flex gap-4 px-6 py-5">{body}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
              <div className="rounded-[calc(var(--radius)+6px)] border border-[var(--lounge-glass-line)] bg-[color-mix(in_srgb,#0b0a08_70%,transparent)] p-6 backdrop-blur-md sm:p-9">
                <h2 className="font-heading text-2xl">Request a consultation</h2>
                <div className="mt-6"><ContactForm variant="lounge" /></div>
              </div>
            </div>
          </section>
        );
      }
      const rows = [
        wa && { icon: MessageCircle, label: "WhatsApp", value: "Usually the fastest reply", href: wa },
        c.phone && { icon: Phone, label: "Call", value: c.phone, href: `tel:${c.phone.replace(/\s/g, "")}` },
        c.email && { icon: Mail, label: "Email", value: c.email, href: `mailto:${c.email}` },
      ].filter(Boolean) as { icon: typeof Mail; label: string; value: string; href: string }[];
      const Title = index === 0 ? "h1" : "h2";
      return (
        <Wrap className="flex flex-wrap items-start gap-x-16 gap-y-10">
          <div className="flex min-w-0 flex-[1_1_24rem] flex-col gap-7">
            <div className="flex flex-col gap-3">
              <Title className="text-balance text-[clamp(2rem,3.4vw,2.75rem)] font-bold leading-[1.1]">{str(p.title)}</Title>
              {str(p.subtitle) && <p className="text-[1.1rem] text-muted-foreground">{str(p.subtitle)}</p>}
            </div>
            {rows.length > 0 && (
              <ul className="flex flex-col gap-3">
                {rows.map(({ icon: Icon, label, value, href }) => (
                  <li key={label}>
                    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="c-card flex items-center gap-4 px-5 py-4 transition hover:border-primary">
                      <span className="c-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"><Icon size={21} aria-hidden /></span>
                      <span className="flex min-w-0 flex-1 flex-col"><span className="font-heading font-semibold">{label}</span><span className="truncate text-[0.94rem] text-muted-foreground">{value}</span></span>
                      <ArrowRight size={18} className="shrink-0 text-primary" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {(c.address || c.hours) && (
              <dl className="flex flex-wrap gap-x-12 gap-y-4 border-t pt-5">
                {c.address && <div><dt className="c-label">Office</dt><dd className="font-medium">{c.address}</dd></div>}
                {c.hours && <div><dt className="c-label">Hours</dt><dd className="font-medium">{c.hours}</dd></div>}
              </dl>
            )}
          </div>
          <div className="c-card min-w-0 flex-[1_1_28rem] p-6 shadow-[0_12px_32px_rgb(0_0_0/0.07)] md:p-9">
            <h2 className="font-heading text-2xl font-bold">Send a message</h2>
            <p className="mb-6 mt-1 text-[0.95rem] text-muted-foreground">An advisor replies within working hours.</p>
            <ContactForm />
          </div>
        </Wrap>
      );
    }

    case "map":
      if (!str(p.query)) return null;
      return (
        <Wrap>
          <Heading title={str(p.title)} />
          <iframe
            title="Map"
            className="h-[420px] w-full rounded-[var(--radius)] border"
            loading="lazy"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(str(p.query))}&output=embed`}
          />
        </Wrap>
      );

    default:
      return null;
  }
}

const SELF_PADDED = new Set(["hero", "page-header"]);

export function RenderSections({ sections, tenant }: { sections: Section[]; tenant: Tenant }) {
  const layout = siteLayout(tenant.theme);
  const first = sections[0]?.type ?? "";
  const padTop = !SELF_PADDED.has(first) && !(layout === "lounge" && first === "contact");
  return (
    <>
      {padTop && <div className={layout === "lounge" ? "h-16 lg:h-4" : "h-20"} />}
      {sections.map((s, i) => <SectionView key={s.id} s={s} tenant={tenant} layout={layout} index={i} next={sections[i + 1]?.type} />)}
    </>
  );
}
