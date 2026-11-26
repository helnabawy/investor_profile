import Link from "@/components/site/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import type { Section } from "@/lib/sections/registry";
import type { Project, Tenant } from "@/lib/types";
import type { SiteLayout } from "@/lib/theme";
import { getProjects } from "@/lib/tenant";
import { formatFullPrice, whatsappLink } from "@/lib/format";
import { statusLabel, yieldFigure } from "../site/project-card";
import { ChatAwareLink, Reveal } from "../sections/client";
import { TemplateAsk } from "./ask";
import { siteT } from "@/lib/i18n/server";
import type { SiteDict } from "@/lib/i18n/site";
import type { Locale } from "@/lib/i18n/locales";

/** The page language and its words, handed down from templateSection. */
type L = { t: SiteDict; locale: Locale };

/**
 * Horizon, Ledger and Atelier versions of the sections that carry a home page: the hero, quick
 * links, featured projects, steps and the closing call to action. Returns `undefined` for any
 * other section (or the Classic, Lounge and Foyer layouts), and the caller renders the standard
 * version, which already follows the tenant's colours.
 */

type P = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" ? v : "");
const arr = (v: unknown) => (Array.isArray(v) ? (v as P[]) : []);

const WRAP = "mx-auto max-w-[1240px] px-5 md:px-6";
const H2 = "text-balance font-heading text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.1]";
/** The short plan label for tight spaces: "60/40 — 60% during construction…" → "60/40". */
const planShort = (plan: string | null) => plan?.match(/^\s*\d{1,2}\s*\/\s*\d{1,2}/)?.[0].replace(/\s/g, "") ?? plan?.split(/[;—–-]/)[0].trim() ?? "";
const handover = (p: Project, { t }: L) => (p.status === "ready" ? t.card.ready : p.handover ?? "");
const facts = (p: Project, { t, locale }: L) => [p.area, statusLabel(p.status, locale), p.for_sale && t.card.availableForSale].filter(Boolean).join(" · ");

function Img({ src, alt = "", className }: { src: string; alt?: string; className: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" className={className} />;
}

function Ask({ tenant, p, shape, l }: { tenant: Tenant; p: P; shape: "pill" | "field" | "line"; l: L }) {
  const ai = tenant.ai_config ?? {};
  const c = l.t.common;
  if (ai.enabled === false) {
    return <div className={`flex flex-wrap gap-3 ${shape === "pill" ? "justify-center" : ""}`}><Link href="/projects" className="btn btn-primary">{c.browseProjects}</Link><Link href="/contact" className="btn btn-outline">{c.contactUs}</Link></div>;
  }
  return (
    <TemplateAsk
      shape={shape}
      label={c.askNamed(ai.assistantName)}
      placeholder={str(p.askPlaceholder) || c.askPlaceholder}
      suggestions={shape === "pill" ? (ai.suggestions?.length ? ai.suggestions : l.t.chat.suggestions) : []}
      note={c.answersNote(tenant.name)}
    />
  );
}

function SectionHead({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <Reveal className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
      <div className="flex min-w-0 flex-col gap-2">
        <h2 className={H2}>{title}</h2>
        {subtitle && <p className="max-w-[60ch] text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </Reveal>
  );
}
const viewAll = ({ t }: L) => <Link href="/projects" className="t-link inline-flex min-h-11 items-center gap-2 font-semibold">{t.common.viewAllProjects} <ArrowRight size={18} className="rtl:-scale-x-100" aria-hidden /></Link>;

/* ───────── Horizon ───────── */

function HorizonHero({ p, tenant, l }: { p: P; tenant: Tenant; l: L }) {
  const image = str(p.image) || tenant.theme?.backdropUrl;
  return (
    <section className={`${WRAP} flex flex-col items-center gap-7 pt-10 text-center md:pt-16`}>
      <h1 className="max-w-[20ch] text-balance font-heading text-[clamp(2.2rem,4.8vw,4rem)] font-bold leading-[1.06] tracking-[-0.03em]">{str(p.title)}</h1>
      {str(p.subtitle) && <p className="max-w-[58ch] text-[1.12rem] text-muted-foreground">{str(p.subtitle)}</p>}
      <div className="w-full max-w-[640px]"><Ask tenant={tenant} p={p} shape="pill" l={l} /></div>
      {image && <Img src={image} className="mt-4 block h-[clamp(240px,38vw,520px)] w-full rounded-[20px] object-cover" />}
    </section>
  );
}

function HorizonProjects({ projects, p, l }: { projects: Project[]; p: P; l: L }) {
  const { t, locale } = l;
  return (
    <section className={`${WRAP} flex flex-col gap-9 py-20 md:py-24`}>
      <SectionHead title={str(p.title)} subtitle={str(p.subtitle)} action={viewAll(l)} />
      <div className="flex flex-wrap gap-6">
        {projects.map((pr, i) => (
          <Reveal key={pr.id} delay={i * 0.08} className="min-w-0 flex-[1_1_300px]">
            <Link href={`/projects/${pr.id}`} className="group flex flex-col gap-4">
              <div className="relative h-[250px] overflow-hidden rounded-2xl bg-muted">
                {pr.images[0] && <Img src={pr.images[0]} alt={pr.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />}
                <span className="absolute inset-x-3.5 top-3.5 flex flex-wrap gap-1.5">
                  <span className={`rounded-full px-3 py-1 text-[0.8rem] font-semibold ${pr.status === "ready" ? "bg-primary text-primary-foreground" : "bg-card text-foreground"}`}>{statusLabel(pr.status, locale)}</span>
                  {pr.for_sale && <span className="rounded-full bg-primary px-3 py-1 text-[0.8rem] font-semibold text-primary-foreground">{t.card.availableForSale}</span>}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-[1.25rem] font-bold leading-snug transition-colors group-hover:text-primary">{pr.title}</h3>
                <p className="text-[0.95rem] text-muted-foreground">{[pr.area, pr.bedrooms && t.card.bedrooms(pr.bedrooms)].filter(Boolean).join(" · ")}</p>
                <p className="mt-1 text-[0.95rem] text-muted-foreground">
                  {t.card.from} <strong className="font-bold tabular-nums text-primary">{formatFullPrice(pr.price_from, pr.currency, locale)}</strong>
                  {[planShort(pr.payment_plan), handover(pr, l)].filter(Boolean).map((x) => ` · ${x}`).join("")}
                </p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ───────── Ledger ───────── */

function LedgerHero({ p, tenant, l }: { p: P; tenant: Tenant; l: L }) {
  return (
    <section className="border-b bg-card">
      <div className={`${WRAP} flex flex-wrap items-end gap-x-16 gap-y-9 pb-16 pt-12 md:pt-16`}>
        <div className="flex min-w-0 flex-[1.4_1_420px] flex-col gap-4">
          <h1 className="max-w-[19ch] text-balance font-heading text-[clamp(2.1rem,4.4vw,3.6rem)] font-bold leading-[1.06] tracking-[-0.03em]">{str(p.title)}</h1>
          {str(p.subtitle) && <p className="max-w-[54ch] text-[1.08rem] text-muted-foreground">{str(p.subtitle)}</p>}
        </div>
        <div className="min-w-0 flex-[1_1_380px]"><Ask tenant={tenant} p={p} shape="field" l={l} /></div>
      </div>
    </section>
  );
}

const LEDGER_COLS = "grid-cols-[minmax(0,2.2fr)_minmax(0,1.1fr)_150px_104px_minmax(0,0.9fr)_112px_20px]";
function LedgerProjects({ projects, p, l }: { projects: Project[]; p: P; l: L }) {
  const { t, locale } = l;
  return (
    <section className={`${WRAP} flex flex-col gap-6 py-16 md:py-20`}>
      <SectionHead title={str(p.title)} subtitle={str(p.subtitle)} action={viewAll(l)} />
      <Reveal className="overflow-x-auto rounded-[10px] border bg-card">
        <div className="min-w-[940px]">
          <div aria-hidden className={`grid ${LEDGER_COLS} gap-5 px-6 py-3 text-[0.85rem] font-semibold text-muted-foreground`}>
            <span>{t.card.project}</span><span>{t.card.area}</span><span>{t.card.priceFrom}</span><span>{t.card.handover}</span><span>{t.card.plan}</span><span>{t.card.expectedYieldShort}</span><span />
          </div>
          {projects.map((pr) => (
            <Link key={pr.id} href={`/projects/${pr.id}`} className={`t-row grid ${LEDGER_COLS} items-center gap-5 border-t px-6 py-3.5`}>
              <span className="flex min-w-0 items-center gap-4">
                {pr.images[0] ? <Img src={pr.images[0]} className="h-[60px] w-[84px] shrink-0 rounded-md object-cover" /> : <span className="h-[60px] w-[84px] shrink-0 rounded-md bg-muted" />}
                <span className="flex min-w-0 flex-col leading-snug"><span className="truncate text-[1.05rem] font-bold">{pr.title}</span><span className="truncate text-[0.88rem] text-muted-foreground">{[statusLabel(pr.status, locale), pr.for_sale && t.card.forSale, pr.bedrooms && t.card.bedrooms(pr.bedrooms)].filter(Boolean).join(" · ")}</span></span>
              </span>
              <span className="truncate text-[0.97rem]">{pr.area ?? "—"}</span>
              <span className="font-bold tabular-nums">{formatFullPrice(pr.price_from, pr.currency, locale)}</span>
              <span className="text-[0.97rem]">{handover(pr, l) || "—"}</span>
              <span className="truncate text-[0.97rem] tabular-nums">{planShort(pr.payment_plan) || "—"}</span>
              <span className="truncate text-[0.97rem] tabular-nums">{yieldFigure(pr.roi) ?? pr.roi ?? "—"}</span>
              <ChevronRight size={18} className="text-primary rtl:-scale-x-100" aria-hidden />
            </Link>
          ))}
        </div>
      </Reveal>
      <p className="text-[0.88rem] text-muted-foreground">{t.card.yieldsDisclaimer}</p>
    </section>
  );
}

/* ───────── Atelier ───────── */

function AtelierHero({ p, tenant, l }: { p: P; tenant: Tenant; l: L }) {
  const image = str(p.image) || tenant.theme?.backdropUrl;
  return (
    <section className={`${WRAP} flex flex-wrap items-stretch gap-x-16 gap-y-10 pt-6 md:pt-10`}>
      <div className="flex min-w-0 flex-[1_1_420px] flex-col justify-center gap-6 py-6">
        <h1 className="max-w-[16ch] text-balance font-heading text-[clamp(2.1rem,4.2vw,3.6rem)] font-normal leading-[1.12]">{str(p.title)}</h1>
        {str(p.subtitle) && <p className="max-w-[46ch] text-[1.1rem] text-muted-foreground">{str(p.subtitle)}</p>}
        <div className="mt-1 max-w-[500px]"><Ask tenant={tenant} p={p} shape="line" l={l} /></div>
      </div>
      {image && <Img src={image} className="h-[clamp(320px,46vw,620px)] w-full min-w-0 flex-[1_1_380px] rounded-[2px] object-cover" />}
    </section>
  );
}

function AtelierProjects({ projects, p, l }: { projects: Project[]; p: P; l: L }) {
  const { t, locale } = l;
  return (
    <section className={`${WRAP} flex flex-col gap-16 pb-10 pt-24 md:pt-28`}>
      <Reveal className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-b pb-5">
        <h2 className={`${H2} font-normal`}>{str(p.title)}</h2>
        {viewAll(l)}
      </Reveal>
      {projects.map((pr, i) => {
        const dl: [string, string][] = ([[t.card.from, formatFullPrice(pr.price_from, pr.currency, locale)], [t.card.paymentPlan, planShort(pr.payment_plan)], [t.card.handover, handover(pr, l)], [t.card.expectedYieldShort, yieldFigure(pr.roi) ?? ""]] as [string, string][]).filter(([, v]) => v).slice(0, 3);
        return (
          <Reveal key={pr.id}>
            <Link href={`/projects/${pr.id}`} className={`group flex items-center gap-x-16 gap-y-8 ${i % 2 ? "flex-wrap-reverse" : "flex-wrap"}`}>
              <div className={`min-w-0 flex-[1.35_1_420px] overflow-hidden rounded-[2px] bg-muted ${i % 2 ? "order-2" : ""}`}>
                {pr.images[0] && <Img src={pr.images[0]} alt={pr.title} className="block h-[clamp(260px,34vw,460px)] w-full object-cover transition duration-[900ms] group-hover:scale-[1.03]" />}
              </div>
              <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-4">
                <p className="text-[0.95rem] text-muted-foreground">{facts(pr, l)}</p>
                <h3 className="font-heading text-[clamp(1.6rem,2.4vw,2.1rem)] font-normal leading-[1.18] transition-colors group-hover:text-primary">{pr.title}</h3>
                {pr.description && <p className="line-clamp-3 max-w-[44ch] text-muted-foreground">{pr.description}</p>}
                <dl className="mt-1 flex flex-wrap gap-x-9 gap-y-3 border-t pt-4">
                  {dl.map(([k, v]) => <div key={k}><dt className="text-[0.88rem] text-muted-foreground">{k}</dt><dd className="font-semibold tabular-nums">{v}</dd></div>)}
                </dl>
              </div>
            </Link>
          </Reveal>
        );
      })}
    </section>
  );
}

/* ───────── Shared by the three ───────── */

function QuickLinks({ p, tenant, l }: { p: P; tenant: Tenant; l: L }) {
  const items = arr(p.items).filter((it) => tenant.ai_config?.enabled !== false || str(it.href) !== "#chat");
  if (!items.length) return null;
  return (
    <nav aria-label={l.t.common.startHere} className={`${WRAP} flex flex-wrap gap-x-10 border-b pt-10`}>
      {items.map((it, i) => (
        <ChatAwareLink key={i} href={str(it.href) || "/"} className="t-quick group flex min-w-0 flex-[1_1_240px] flex-col border-t py-5">
          <span className="flex items-center gap-2 font-heading text-[1.1rem] font-semibold">{str(it.title)} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" aria-hidden /></span>
          {str(it.body) && <span className="text-[0.95rem] text-muted-foreground">{str(it.body)}</span>}
        </ChatAwareLink>
      ))}
    </nav>
  );
}

function Steps({ p, layout, l }: { p: P; layout: SiteLayout; l: L }) {
  const items = arr(p.items);
  const head = (
    <div className="flex min-w-0 flex-col gap-2.5">
      <h2 className={`${H2} max-w-[20ch] ${layout === "atelier" ? "font-normal" : ""}`}>{str(p.title)}</h2>
      {str(p.subtitle) && <p className="max-w-[44ch] text-muted-foreground">{str(p.subtitle)}</p>}
    </div>
  );
  if (layout === "horizon") {
    return (
      <section className="bg-muted">
        <div className={`${WRAP} flex flex-col gap-10 py-20 md:py-24`}>
          <Reveal>{head}</Reveal>
          <ol className="flex flex-wrap gap-x-10 gap-y-8">
            {items.map((it, i) => (
              <li key={i} className="flex min-w-0 flex-[1_1_260px] flex-col gap-2 border-t-2 border-primary pt-5">
                <span className="text-[0.9rem] font-semibold text-primary">{l.t.common.step(i + 1)}</span>
                <span className="text-[1.25rem] font-bold leading-snug">{str(it.title)}</span>
                <span className="text-muted-foreground">{str(it.body)}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }
  // Ledger: a plain two-column list. Atelier: the same, with an italic numeral before each step.
  return (
    <section className={layout === "ledger" ? "border-y bg-card" : ""}>
      <div className={`${WRAP} flex flex-wrap gap-x-20 gap-y-10 py-20 md:py-24`}>
        <Reveal className="flex-[1_1_300px]">{head}</Reveal>
        <ol className="flex min-w-0 flex-[1.8_1_460px] flex-col">
          {items.map((it, i) => (
            <li key={i} className="flex flex-wrap gap-x-8 gap-y-1 border-t py-6 last:border-b">
              {layout === "atelier"
                ? <span aria-hidden className="flex-[0_0_34px] font-heading text-[1.6rem] italic leading-tight text-primary">{i + 1}</span>
                : <span className="flex-[0_0_72px] pt-0.5 text-[0.95rem] font-semibold text-primary">{l.t.common.step(i + 1)}</span>}
              <span className="flex min-w-0 flex-[1_1_300px] flex-col gap-1">
                <span className={`font-heading text-[1.25rem] leading-snug ${layout === "atelier" ? "" : "font-bold"}`}>{str(it.title)}</span>
                <span className="max-w-[56ch] text-muted-foreground">{str(it.body)}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Cta({ p, tenant, layout, l }: { p: P; tenant: Tenant; layout: SiteLayout; l: L }) {
  const c = l.t.common;
  const wa = whatsappLink(tenant.contact?.whatsapp, c.waHello(tenant.name));
  const href = str(p.ctaHref), label = str(p.ctaLabel);
  if (layout === "ledger") {
    return (
      <section className={`${WRAP} flex flex-wrap items-center justify-between gap-x-16 gap-y-7 py-20`}>
        <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-2">
          <h2 className="text-balance font-heading text-[clamp(1.9rem,3.2vw,2.6rem)] font-bold leading-[1.08]">{str(p.title)}</h2>
          {str(p.body) && <p className="text-[1.1rem] text-muted-foreground">{str(p.body)}</p>}
        </div>
        <div className="flex flex-wrap gap-2.5">
          {href && label && <Link href={href} className="btn btn-primary !min-h-[3.25rem] !px-6">{label}</Link>}
          {wa && <a href={wa} target="_blank" rel="noreferrer" className="btn btn-light !min-h-[3.25rem] !px-6">{c.chatOnWhatsApp}</a>}
        </div>
      </section>
    );
  }
  const atelier = layout === "atelier";
  const inner = (
    <>
      <div className={`flex min-w-0 flex-col gap-2.5 ${atelier ? "items-center" : "flex-[1_1_360px]"}`}>
        <h2 className={`text-balance font-heading leading-[1.1] ${atelier ? "max-w-[18ch] text-[clamp(2rem,3.8vw,3.2rem)] font-normal" : "text-[clamp(1.9rem,3.4vw,2.75rem)] font-bold"}`}>{str(p.title)}</h2>
        {str(p.body) && <p className="text-[1.1rem] opacity-85">{str(p.body)}</p>}
      </div>
      <div className={`flex flex-wrap gap-3 ${atelier ? "justify-center" : ""}`}>
        {href && label && <Link href={href} className="btn t-cta-solid !min-h-[3.25rem] !px-7">{label}</Link>}
        {wa && <a href={wa} target="_blank" rel="noreferrer" className="btn t-cta-line !min-h-[3.25rem] !px-6">{c.chatOnWhatsApp}</a>}
      </div>
    </>
  );
  return atelier
    ? <section className="t-cta mt-10"><Reveal className={`${WRAP} flex flex-col items-center gap-7 py-24 text-center`}>{inner}</Reveal></section>
    : <section className={`${WRAP} pb-14`}><Reveal className="t-cta flex flex-wrap items-center justify-between gap-x-12 gap-y-7 rounded-3xl p-[clamp(2.25rem,6vw,4.5rem)]">{inner}</Reveal></section>;
}

export async function templateSection(s: Section, tenant: Tenant, layout: SiteLayout): Promise<React.ReactNode | undefined> {
  if (layout !== "horizon" && layout !== "ledger" && layout !== "atelier") return undefined;
  const p = s.props as P;
  const l = await siteT();
  switch (s.type) {
    case "hero-split":
    case "hero":
      return layout === "horizon" ? <HorizonHero p={p} tenant={tenant} l={l} /> : layout === "ledger" ? <LedgerHero p={p} tenant={tenant} l={l} /> : <AtelierHero p={p} tenant={tenant} l={l} />;
    case "quick-links":
      return <QuickLinks p={p} tenant={tenant} l={l} />;
    case "featured-projects": {
      // Ledger's table is for comparing, so it lists the whole portfolio; the others show featured projects.
      const projects = layout === "ledger" ? (await getProjects(tenant.id)).slice(0, 8) : (await getProjects(tenant.id, true)).slice(0, Number(p.limit) || 3);
      if (!projects.length) return null;
      return layout === "horizon" ? <HorizonProjects projects={projects} p={p} l={l} /> : layout === "ledger" ? <LedgerProjects projects={projects} p={p} l={l} /> : <AtelierProjects projects={projects} p={p} l={l} />;
    }
    case "steps":
      return <Steps p={p} layout={layout} l={l} />;
    case "cta":
      return <Cta p={p} tenant={tenant} layout={layout} l={l} />;
    default:
      return undefined;
  }
}
