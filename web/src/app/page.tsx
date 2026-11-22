import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { env, subdomainUrl } from "@/lib/env";
import { TemplateThumb } from "@/components/template-thumb";
import { TEMPLATES } from "@/lib/templates";
import { PLANS as LIMITS } from "@/lib/plans";
import { platformFont } from "@/lib/fonts";
import { RevealOnScroll } from "@/components/motion/reveal";
import { Skyline } from "@/components/marketing/skyline";
import { RoofEdge, TailEdge } from "@/components/marketing/roof-edge";

export const metadata = { icons: { icon: "/logo-mark.svg" } };

// Platform marketing page (root domain in multi-tenant mode). Tenant sites never reach this route.

const STEPS = [
  ["Create your account", "Enter your business name, pick a site address and choose a starting template."],
  ["Add your projects", "Upload photos, prices and payment plans. Add FAQs so the concierge answers well."],
  ["Share your link", "Buyers browse and ask questions. Leads arrive ready for a WhatsApp follow-up."],
];

// Plan names and limits come from src/lib/plans.ts, so this page cannot promise what the app does
// not enforce. The Solo price is a placeholder until it is decided (see PRODUCT.md, "Evidence on Hand").
const perDay = (n: number) => `${n.toLocaleString("en")} concierge messages a day`;
const PLANS = [
  { name: LIMITS.free.name, price: "Free", per: "", desc: "Try it with your listings", cta: "Start free", href: "/signup",
    items: ["Your site on our subdomain", `Up to ${LIMITS.free.maxProjects} projects`, perDay(LIMITS.free.dailyChat), "Both templates", "EstateProfile badge in the footer"] },
  { name: LIMITS.solo.name, price: "AED 199", per: " a month", desc: "For independent agents", cta: "Start free, upgrade later", href: "/signup", highlight: true,
    items: ["Your own domain", "Unlimited projects", perDay(LIMITS.solo.dailyChat), "Both templates", "No badge"] },
  { name: LIMITS.team.name, price: "Contact us", per: "", desc: "For brokerages", cta: "Start free, upgrade later", href: "/signup",
    items: ["Everything in Solo", perDay(LIMITS.team.dailyChat), "Managed setup on your domain", "Accounts for several agents (coming soon)"] },
];

const IMG = (id: string, w = 1400) => `https://images.unsplash.com/photo-${id}?w=${w}&q=70`;
const FRAME = "overflow-hidden rounded-xl border border-[#dfe3ea] bg-white";
const LEAD = "m-0 text-[1.05rem] text-[#4a5466]";
const H2 = "text-balance text-[clamp(1.9rem,3.2vw,2.75rem)] font-semibold leading-[1.1] tracking-[-0.025em]";

const D = (s: number) => ({ "--d": `${s}s` }) as React.CSSProperties;

function Bubble({ who, children, className = "", style }: { who: "buyer" | "bot"; children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return who === "buyer"
    ? <p style={style} className={`max-w-[90%] self-end rounded-[12px_4px_12px_12px] bg-[#1e46b8] px-3.5 py-2.5 text-[0.95rem] text-white ${className}`}>{children}</p>
    : <p style={style} className={`max-w-[92%] self-start rounded-[4px_12px_12px_12px] border border-[#dfe3ea] bg-[#fafbfc] px-3.5 py-2.5 text-[0.95rem] ${className}`}>{children}</p>;
}

/** Headline words that rise in one after another; `from` continues the stagger across spans. */
function HeadlineWords({ text, from }: { text: string; from: number }) {
  const words = text.split(" ");
  return <>{words.map((w, i) => (
    <span key={i}><span className="h-word" style={{ "--i": from + i } as React.CSSProperties}>{w}</span>{i < words.length - 1 && " "}</span>
  ))}</>;
}

/** Three dots where the concierge's answer is about to appear. */
function Typing({ d, until, className = "" }: { d: number; until: number; className?: string }) {
  return (
    <span aria-hidden style={{ "--d": `${d}s`, "--until": `${until}s` } as React.CSSProperties}
      className={`p-typing typing flex items-center gap-1 self-start rounded-[4px_12px_12px_12px] border border-[#dfe3ea] bg-[#fafbfc] px-3.5 py-3.5 text-[#6a7385] ${className}`}>
      <span /><span /><span />
    </span>
  );
}

export default function Landing() {
  const demo = subdomainUrl("demo");
  return (
    <div className={`platform ${platformFont.variable} min-h-screen bg-white`}>
      <RevealOnScroll />
      <header className="border-b border-[#dfe3ea] bg-white">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-x-8 gap-y-2 px-6 py-3.5">
          <Logo />
          <nav aria-label="Main" className="flex flex-wrap items-center gap-x-7">
            {[["#features", "What you get"], ["#how", "How it works"], ["#templates", "Templates"], ["#pricing", "Pricing"]].map(([href, label]) => (
              <a key={href} href={href} className="py-3 text-[0.95rem] font-medium text-[#3d4658] hover:text-[#0f1728]">{label}</a>
            ))}
            <a href={demo} className="py-3 text-[0.95rem] font-medium text-[#3d4658] hover:text-[#0f1728]">Live demo</a>
          </nav>
          <div className="flex items-center gap-x-5">
            <Link href="/login" className="py-3 text-[0.95rem] font-medium text-[#3d4658] hover:text-[#0f1728]">Sign in</Link>
            <Link href="/signup" className="a-btn a-btn-primary">Create your site</Link>
          </div>
        </div>
      </header>

      {/* Hero: the claim, then the product doing it — a buyer's question becoming a lead. */}
      <section className="relative overflow-hidden border-b border-[#dfe3ea] bg-[#f4f5f7]">
        <Skyline />
        <div className="relative mx-auto flex max-w-[1240px] flex-col gap-14 px-6 pt-16 md:pt-20">
          <div className="flex flex-wrap items-end justify-between gap-x-16 gap-y-7">
            <h1 data-skyline-avoid className="min-w-0 max-w-[17ch] flex-[1.5_1_420px] text-balance text-[clamp(2.4rem,5.2vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.035em]">
              <HeadlineWords from={0} text="A professional property website with an" />{" "}
              <span className="text-[#1e46b8]"><HeadlineWords from={6} text="AI concierge," /></span>{" "}
              <span className="h-mark"><HeadlineWords from={8} text="live in minutes." /></span>
            </h1>
            <div data-skyline-avoid style={D(0.2)} className="p-in flex min-w-0 flex-[1_1_340px] flex-col gap-5">
              <p className="text-[1.15rem] text-[#3d4658]">Show your portfolio clearly, answer buyers instantly, and turn every conversation into a lead. No web team needed.</p>
              <div className="flex flex-wrap gap-2.5">
                <Link href="/signup" className="a-btn a-btn-primary !min-h-[52px] !px-6 !text-[1.05rem]">Start free <ArrowRight size={18} aria-hidden /></Link>
                <a href={demo} className="a-btn a-btn-ghost !min-h-[52px] !px-6 !text-[1.05rem]">See a live demo</a>
              </div>
              <p className="text-[0.95rem] text-[#4a5466]">Set up in three steps. Your own subdomain or custom domain.</p>
            </div>
          </div>

          <div data-skyline-base className="flex flex-wrap items-end gap-5">
            <div style={D(0.35)} className={`p-in ${FRAME} min-w-0 flex-[2.2_1_480px] rounded-b-none border-b-0 shadow-[0_24px_48px_-32px_rgb(15_23_40/0.45)]`}>
              <div className="flex items-center gap-2.5 border-b border-[#dfe3ea] bg-[#fafbfc] px-3.5 py-2.5">
                <span aria-hidden className="flex gap-[5px]">{[0, 1, 2].map((i) => <span key={i} className="h-[9px] w-[9px] rounded-full bg-[#d0d5dd]" />)}</span>
                <span className="flex-1 truncate rounded-md bg-[#eef0f3] px-3 py-0.5 text-[0.8rem] text-[#3d4658]">aurelia.{env.rootDomain}</span>
              </div>
              <div className="relative flex min-h-[340px] flex-col justify-end overflow-hidden bg-[#10221b] text-[#f6f4ef] md:min-h-[420px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={IMG("1512453979798-5ea266f8880c", 1800)} alt="Example agent site with a Dubai skyline behind a headline and a question box" className="p-photo absolute inset-0 h-full w-full object-cover object-[center_40%]" />
                <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(10_22_17/0.5)_0%,rgb(10_22_17/0.3)_35%,rgb(10_22_17/0.92)_100%)]" />
                <div className="relative flex flex-col gap-3.5 px-6 pb-8 pt-16 md:px-10 md:pb-10">
                  <p className="max-w-[19ch] text-balance font-[Georgia,serif] text-[clamp(1.5rem,3vw,2.5rem)] leading-[1.08]">Invest in Dubai property with clear numbers and one advisor you can reach.</p>
                  <div className="flex max-w-[460px] gap-1.5 rounded-[3px] bg-[#f6f4ef] p-1.5">
                    <span className="min-w-0 flex-1 truncate px-2.5 py-2 text-[0.85rem] text-[#12241d]">What can I buy for AED 1.5M with a payment plan?</span>
                    <span className="rounded-[2px] bg-[#1e4d3b] px-4 py-2 text-[0.85rem] font-semibold">Ask</span>
                  </div>
                </div>
              </div>
            </div>
            <div aria-hidden className="flex min-w-0 flex-[1_1_300px] flex-col gap-4 pb-7">
              <div style={D(0.55)} className={`p-pop ${FRAME} flex flex-col gap-2.5 px-4 py-4 shadow-[0_24px_48px_-32px_rgb(15_23_40/0.45)]`}>
                <p className="text-[0.82rem] font-medium text-[#5a6475]">Aurelia Concierge</p>
                <Bubble who="buyer" className="p-pop" style={D(0.8)}>What can I buy for AED 1.5M with a payment plan?</Bubble>
                <div className="grid">
                  <Typing d={1.2} until={1.95} className="col-start-1 row-start-1" />
                  <Bubble who="bot" className="p-pop col-start-1 row-start-1" style={D(1.95)}>Marina Vista Residences starts from AED 1.45M on a 60/40 plan. Shall I connect you with the advisor?</Bubble>
                </div>
              </div>
              <div style={D(2.55)} className={`p-lead ${FRAME} flex flex-col gap-2 border-[#b9c8f2] px-4 py-4 shadow-[0_24px_48px_-28px_rgb(30_70_184/0.55)]`}>
                <div className="flex items-center justify-between gap-3"><span className="font-semibold">New lead</span><span className="a-pill a-pill-blue">Concierge</span></div>
                <p className="text-[0.95rem] text-[#3d4658]">2-bedroom in Dubai Marina · Budget AED 1.5M · full conversation attached</p>
                <span className="self-start rounded-lg bg-[#1e46b8] px-3.5 py-2 text-sm font-medium text-white">Reply on WhatsApp</span>
              </div>
              <p style={D(2.9)} className="p-in text-[0.85rem] text-[#5a6475]">Example with a fictional agent and sample data.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto flex max-w-[1240px] scroll-mt-4 flex-col gap-12 px-6 pb-14 pt-24 md:pb-16 md:pt-28">
        <div data-reveal className="flex flex-col gap-3.5">
          <h2 className={`${H2} max-w-[18ch]`}>Three things, working together</h2>
          <p className={`${LEAD} max-w-[60ch]`}>One sign-up gives you a public site, an assistant that knows your inventory, and one place where every enquiry lands.</p>
        </div>
        <div className="flex flex-wrap gap-x-9 gap-y-10">
          <div data-reveal className="flex min-w-0 flex-[1_1_300px] flex-col gap-5">
            <div aria-hidden className={`p-lift ${FRAME} flex h-[232px] gap-3 bg-[#f6f4ef] p-4 text-[#12241d]`}>
              {[["1486406146926-c627a92ad1ab", "Marina Vista Residences", "From AED 1.45M · 60/40"], ["1546412414-8035e1776c9a", "Downtown Arc Tower", "From AED 1.15M · Ready"]].map(([id, t, s]) => (
                <div key={t} className="min-w-0 flex-1 overflow-hidden rounded-[3px] border border-[#dad6ca] bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={IMG(id, 600)} alt="" className="block h-28 w-full object-cover" />
                  <p className="px-3 py-2.5 font-[Georgia,serif] text-[0.95rem] leading-tight">{t}<span className="mt-1 block font-[family-name:var(--font-platform)] text-[0.8rem] text-[#4c5952]">{s}</span></p>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-1.5"><h3 className="text-[1.2rem] font-semibold tracking-[-0.01em]">Your portfolio site</h3><p className={LEAD}>Projects with prices, payment plans and yields on every card. Pick a template, then add your name, colours and domain.</p></div>
          </div>
          <div data-reveal style={D(0.1)} className="flex min-w-0 flex-[1_1_300px] flex-col gap-5">
            <div aria-hidden className={`p-lift ${FRAME} flex h-[232px] flex-col justify-center gap-2.5 bg-[#fafbfc] p-5`}>
              <Bubble who="buyer">Anything ready under AED 1.5M?</Bubble>
              <p className="max-w-[92%] self-start rounded-[4px_12px_12px_12px] border border-[#dfe3ea] bg-white px-3.5 py-2.5 text-[0.95rem]">Yes, from AED 1.15M in Downtown.</p>
              <p className="mt-1 text-[0.82rem] text-[#5a6475]">Answered from your projects</p>
            </div>
            <div className="flex flex-col gap-1.5"><h3 className="text-[1.2rem] font-semibold tracking-[-0.01em]">A buyer asks the concierge</h3><p className={LEAD}>It answers day and night, only from your own projects, FAQs and notes. It never invents listings.</p></div>
          </div>
          <div data-reveal style={D(0.2)} className="flex min-w-0 flex-[1_1_300px] flex-col gap-5">
            <div aria-hidden className={`p-lift ${FRAME} flex h-[232px] flex-col`}>
              <p className="border-b border-[#dfe3ea] px-4 py-3 text-[0.82rem] font-medium text-[#5a6475]">Leads</p>
              <div className="flex flex-col gap-0.5 bg-[#f1f5fe] px-4 py-3.5 shadow-[inset_3px_0_0_#1e46b8]"><span className="flex items-center justify-between gap-3"><span className="font-semibold">New enquiry</span><span className="a-pill a-pill-blue">New</span></span><span className="text-sm text-[#3d4658]">Downtown · Budget AED 1.5M</span></div>
              <div className="flex flex-col gap-0.5 border-t border-[#dfe3ea] px-4 py-3.5"><span className="flex items-center justify-between gap-3"><span className="font-semibold">Earlier enquiry</span><span className="a-pill a-pill-amber">Contacted</span></span><span className="text-sm text-[#3d4658]">Dubai Marina · Budget AED 2.5M</span></div>
            </div>
            <div className="flex flex-col gap-1.5"><h3 className="text-[1.2rem] font-semibold tracking-[-0.01em]">The lead lands in your inbox</h3><p className={LEAD}>Every form and chat enquiry arrives with the buyer&apos;s interest, budget and the full conversation.</p></div>
          </div>
        </div>
      </section>

      <RoofEdge color="#0f1728" line="#1e46b8" dots="#8ea2ea" />
      <section id="how" className="scroll-mt-4 bg-[#0f1728] text-white">
        <div className="mx-auto flex max-w-[1240px] flex-wrap gap-x-20 gap-y-12 px-6 py-24 md:py-28">
          <h2 data-reveal className={`${H2} min-w-0 max-w-[10ch] flex-[1_1_280px]`}>Live in three steps</h2>
          <ol className="flex min-w-0 flex-[2_1_480px] flex-col">
            {STEPS.map(([title, body], i) => (
              <li key={title} data-reveal style={D(0.08 + i * 0.12)} className="flex flex-wrap gap-x-8 gap-y-1.5 border-t border-white/20 py-6 last:border-b">
                <span className="flex flex-[0_0_88px] items-center gap-2.5 self-start pt-1 text-[0.95rem] font-medium text-[#a9b8e8]"><span aria-hidden className="step-dot" />Step {i + 1}</span>
                <span className="flex min-w-0 flex-[1_1_320px] flex-col gap-1"><span className="text-[1.35rem] font-semibold tracking-[-0.015em]">{title}</span><span className="max-w-[56ch] text-[#c9cfdd]">{body}</span></span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <TailEdge color="#0f1728" />
      <section id="templates" className="mx-auto flex max-w-[1240px] scroll-mt-4 flex-col gap-12 px-6 pb-14 pt-14 md:pb-16 md:pt-16">
        <div data-reveal className="flex flex-col gap-3.5">
          <h2 className={H2}>Start from a template</h2>
          <p className={`${LEAD} max-w-[60ch]`}>Each one sets the layout of your whole site. Switch any time and preview the change on your own site before buyers see it.</p>
        </div>
        <div className="flex flex-wrap gap-x-9 gap-y-10">
          {TEMPLATES.map((t, i) => (
            <article key={t.id} data-reveal style={D(i * 0.12)} className="flex min-w-0 flex-[1_1_380px] flex-col gap-5">
              <div className={`p-lift ${FRAME}`}><TemplateThumb kind={t.id} className="" /></div>
              <div className="flex flex-col gap-2.5">
                <h3 className="text-2xl font-semibold tracking-[-0.02em]">{t.name}</h3>
                <ul aria-label="Tags" className="flex flex-wrap gap-1.5">
                  {t.tags.map((tag) => <li key={tag} className="rounded-full border border-[#c9cfda] px-3 py-0.5 text-[0.85rem] text-[#3d4658]">{tag}</li>)}
                </ul>
                <p className={`${LEAD} max-w-[52ch]`}>{t.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <RoofEdge color="#f4f5f7" line="#dfe3ea" />
      <section id="pricing" className="scroll-mt-4 bg-[#f4f5f7]">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-11 px-6 pb-14 pt-16 md:pb-16 md:pt-20">
          <div data-reveal className="flex flex-col gap-3.5">
            <h2 className={H2}>Simple pricing</h2>
            <p className={LEAD}>Start free on our address. Move to your own domain when you are ready.</p>
          </div>
          <div className="flex flex-wrap items-stretch gap-5">
            {PLANS.map((p, i) => (
              <div key={p.name} data-reveal style={D(i * 0.1)} className={`p-lift flex min-w-0 flex-[1_1_300px] flex-col gap-5 rounded-[14px] border p-7 ${p.highlight ? "border-[#0f1728] bg-[#0f1728] text-white shadow-[0_28px_56px_-32px_rgb(15_23_40/0.7)]" : "border-[#dfe3ea] bg-white"}`}>
                <div>
                  <h3 className="text-[1.2rem] font-semibold">{p.name}</h3>
                  <p className={`text-[0.95rem] ${p.highlight ? "text-[#c9cfdd]" : "text-[#4a5466]"}`}>{p.desc}</p>
                </div>
                <p className="text-[2.35rem] font-semibold leading-none tracking-[-0.03em]">{p.price}{p.per && <span className={`text-[1.05rem] font-normal tracking-normal ${p.highlight ? "text-[#c9cfdd]" : "text-[#4a5466]"}`}>{p.per}</span>}</p>
                <ul className="flex flex-col gap-2.5">
                  {p.items.map((i) => <li key={i} className="flex items-start gap-2.5 text-[0.97rem]"><Check size={18} strokeWidth={2.2} className={`mt-0.5 shrink-0 ${p.highlight ? "text-[#a9b8e8]" : "text-[#1e46b8]"}`} aria-hidden />{i}</li>)}
                </ul>
                <Link href={p.href} className={`a-btn mt-auto !min-h-[50px] !text-base ${p.highlight ? "bg-white text-[#0f1728] hover:bg-[#e6ecfb]" : "a-btn-ghost"}`}>{p.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <RoofEdge invert color="#f4f5f7" ground="#1e46b8" line="#9fb1e6" dots="#1e46b8" />
      <section className="bg-[#1e46b8] text-white">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-end justify-between gap-x-16 gap-y-8 px-6 py-20 md:py-24">
          <div data-reveal className="flex min-w-0 flex-[1_1_420px] flex-col gap-3.5">
            <h2 className="max-w-[16ch] text-balance text-[clamp(2.1rem,4.4vw,3.75rem)] font-semibold leading-[1.04] tracking-[-0.03em]">Ready to put your portfolio online?</h2>
            <p className="text-[1.15rem] text-[#e1e7f8]">Create your site now and add your first project today.</p>
          </div>
          <Link href="/signup" className="a-btn !min-h-14 bg-white !px-7 !text-[1.05rem] !font-semibold text-[#16348c] hover:bg-[#e6ecfb]">Create your site <ArrowRight size={18} aria-hidden /></Link>
        </div>
      </section>

      <footer className="border-t border-[#dfe3ea] bg-white">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-4 text-[0.95rem] text-[#4a5466]">
          <span>© {new Date().getFullYear()} EstateProfile</span>
          <Link href="/login" className="a-link inline-flex min-h-11 items-center">Sign in</Link>
        </div>
      </footer>
    </div>
  );
}
