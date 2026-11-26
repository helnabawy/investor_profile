"use client";
import Link from "@/components/site/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import type { Contact, Faq, NavItem, Project } from "@/lib/types";
import { formatPrice, whatsappLink } from "@/lib/format";
import { statusLabel } from "../site/project-card";
import { TemplateAsk } from "./ask";

type Tab = "projects" | "questions" | "contact";

/**
 * Foyer's home page: the whole site on one screen. The left half says who this is and takes the
 * buyer's question; the right half is one photograph with a panel that holds projects, questions
 * and contact as tabs. On laptops and desktops nothing scrolls; on phones the halves stack.
 */
export function FoyerHome({ name, tagline, title, subtitle, image, projects, faqs, contact, nav, askLabel, askPlaceholder, chat, poweredBy }: {
  name: string;
  tagline: string | null;
  title: string;
  subtitle: string;
  image?: string;
  projects: Project[];
  faqs: Faq[];
  contact: Contact;
  nav: NavItem[];
  askLabel: string;
  askPlaceholder: string;
  chat: boolean;
  poweredBy: boolean;
}) {
  const wa = whatsappLink(contact.whatsapp, `Hi ${name}, I'd like to know more.`);
  const channels = [
    wa && { label: "WhatsApp", value: "Usually the fastest reply", href: wa },
    contact.phone && { label: "Call", value: contact.phone, href: `tel:${contact.phone.replace(/\s/g, "")}` },
    contact.email && { label: "Email", value: contact.email, href: `mailto:${contact.email}` },
  ].filter(Boolean) as { label: string; value: string; href: string }[];
  const tabs = ([["projects", "Projects", projects.length > 0], ["questions", "Questions", faqs.length > 0], ["contact", "Contact", channels.length > 0 || !!contact.address]] as [Tab, string, boolean][]).filter(([, , has]) => has);
  const [tab, setTab] = useState<Tab>(tabs[0]?.[0] ?? "contact");
  // Extra pages the agent added (About, a visa guide…) stay reachable from the brand block.
  const more = nav.filter((n) => !["/", "/projects", "/contact"].includes(n.href));

  return (
    <div className="t-foyer flex min-h-[100dvh] flex-wrap lg:h-[100dvh] lg:min-h-[680px]">
      <div className="flex min-w-0 flex-[1_1_460px] flex-col justify-between gap-8 px-[clamp(1.25rem,4vw,3.5rem)] pb-7 pt-7">
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-2">
          <Link href="/" className="flex min-h-11 flex-col justify-center leading-tight">
            <span className="font-heading text-[1.25rem] font-bold tracking-[-0.02em]">{name}</span>
            {tagline && <span className="text-[0.82rem] text-muted-foreground">{tagline}</span>}
          </Link>
          {more.length > 0 && (
            <nav aria-label="More pages" className="flex flex-wrap gap-x-6">
              {more.map((n) => <Link key={n.href} href={n.href} className="t-nav py-3 text-[0.95rem]">{n.label}</Link>)}
            </nav>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <h1 className="max-w-[15ch] text-balance font-heading text-[clamp(2rem,3.9vw,3.5rem)] font-bold leading-[1.05] tracking-[-0.03em]">{title}</h1>
          {subtitle && <p className="line-clamp-3 max-w-[44ch] text-[1.08rem] text-muted-foreground">{subtitle}</p>}
          <div className="mt-1 max-w-[520px]">
            {chat
              ? <TemplateAsk shape="field" id="foyer-ask" label={askLabel} placeholder={askPlaceholder} note={`Answers come only from ${name}'s own portfolio and notes.`} />
              : <div className="flex flex-wrap gap-3"><Link href="/projects" className="btn btn-primary">Browse projects</Link><Link href="/contact" className="btn btn-light">Contact us</Link></div>}
          </div>
        </div>

        <p className="text-[0.85rem] text-muted-foreground">
          © {new Date().getFullYear()} {name}
          {poweredBy && <> · Powered by <a href={process.env.NEXT_PUBLIC_PLATFORM_URL ?? "#"} className="underline">EstateProfile</a></>}
        </p>
      </div>

      <div className={`t-foyer-photo relative flex min-h-[560px] min-w-0 flex-[1.15_1_460px] items-end justify-end overflow-hidden p-[clamp(1rem,2.4vw,2rem)] ${chat ? "!pb-24" : ""}`}>
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        )}
        <section aria-label="Explore" className="relative w-full max-w-[540px] rounded-2xl bg-card px-5 pb-5 pt-2.5 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.6)]">
          <div role="tablist" aria-label="Sections" className="flex gap-1 pb-2 pt-1">
            {tabs.map(([id, label]) => (
              <button key={id} type="button" role="tab" id={`foyer-tab-${id}`} aria-selected={tab === id} aria-controls="foyer-panel" onClick={() => setTab(id)}
                className={`min-h-11 rounded-full px-4 text-[0.97rem] font-semibold transition-colors ${tab === id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>
                {label}
              </button>
            ))}
          </div>

          <div key={tab} id="foyer-panel" role="tabpanel" aria-labelledby={`foyer-tab-${tab}`} className="rise flex min-h-[300px] flex-col">
            {tab === "projects" && (
              <>
                {projects.map((p) => (
                  <Link key={p.id} href={`/projects/${p.id}`} className="group flex min-h-[76px] items-center gap-3.5 border-t py-2">
                    {p.images[0]
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={p.images[0]} alt="" className="h-[58px] w-[76px] shrink-0 rounded-lg object-cover" />
                      : <span className="h-[58px] w-[76px] shrink-0 rounded-lg bg-muted" />}
                    <span className="flex min-w-0 flex-1 flex-col leading-snug">
                      <span className="truncate text-[1.05rem] font-bold group-hover:underline group-hover:underline-offset-4">{p.title}</span>
                      <span className="truncate text-[0.88rem] text-muted-foreground">{[p.area, statusLabel(p.status), p.for_sale && "For sale", p.status === "ready" ? null : p.handover].filter(Boolean).join(" · ")}</span>
                    </span>
                    <span className="shrink-0 whitespace-nowrap font-bold tabular-nums">{formatPrice(p.price_from, p.currency)}</span>
                  </Link>
                ))}
                <Link href="/projects" className="t-link mt-auto flex min-h-11 items-center gap-2 border-t pt-3 font-semibold">See all projects <ArrowRight size={17} aria-hidden /></Link>
              </>
            )}
            {tab === "questions" && (
              <>
                <dl className="flex flex-col">
                  {faqs.map((f) => (
                    <div key={f.id} className="border-t py-3">
                      <dt className="font-bold">{f.question}</dt>
                      <dd className="mt-0.5 line-clamp-2 text-[0.95rem] text-muted-foreground">{f.answer}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-auto border-t pt-3.5 text-[0.95rem] text-muted-foreground">{chat ? "Something else? Ask in the box on this page." : "Something else? Get in touch."}</p>
              </>
            )}
            {tab === "contact" && (
              <>
                {channels.map((c) => (
                  <a key={c.label} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="group flex min-h-[68px] items-center gap-3 border-t py-2">
                    <span className="flex min-w-0 flex-1 flex-col leading-snug">
                      <span className="text-[1.05rem] font-bold group-hover:underline group-hover:underline-offset-4">{c.label}</span>
                      <span className="truncate text-[0.88rem] tabular-nums text-muted-foreground">{c.value}</span>
                    </span>
                    <ArrowRight size={18} aria-hidden />
                  </a>
                ))}
                <p className="mt-auto border-t pt-3.5 text-[0.95rem] text-muted-foreground">{[contact.address, contact.hours].filter(Boolean).join(" · ") || "We reply within working hours."}</p>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
