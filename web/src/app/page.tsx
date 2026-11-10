import Link from "next/link";
import { ArrowRight, Check, Home, Inbox, LayoutTemplate, MessageCircle } from "lucide-react";
import { env } from "@/lib/env";

// Platform marketing page (root domain in multi-tenant mode). Tenant sites never reach this route.
const FEATURES = [
  { icon: LayoutTemplate, title: "Your portfolio site", body: "Projects with prices, payment plans and yields on every card. Pick a template, then add your name, colours and domain." },
  { icon: MessageCircle, title: "An AI concierge", body: "Answers buyers day and night, only from your own projects, FAQs and notes. It never invents listings." },
  { icon: Inbox, title: "A leads inbox", body: "Every form and chat enquiry arrives with the buyer's interest, budget and the full conversation." },
];

const STEPS = [
  ["Create your account", "Enter your business name, pick a site address and choose a starting template."],
  ["Add your projects", "Upload photos, prices and payment plans. Add FAQs so the concierge answers well."],
  ["Share your link", "Buyers browse and ask questions. Leads arrive ready for a WhatsApp follow-up."],
];

// Prices are placeholders until the plans are decided (see PRODUCT.md, "Evidence on Hand").
const PLANS = [
  { name: "Starter", price: "Free", desc: "Try it with your listings", items: ["Subdomain", "Up to 10 projects", "Free templates", "EstateSite badge"] },
  { name: "Pro", price: "$29/mo", desc: "For independent agents", items: ["Custom domain", "Unlimited projects", "Free templates, premium as add-ons", "No badge", "Email lead alerts"], highlight: true },
  { name: "Self-hosted", price: "One-time", desc: "For brokerages", items: ["Your own servers", "Your own AI keys", "Full source access", "Priority setup support"] },
];

export default function Landing() {
  const demo = `http://demo.${env.rootDomain}`;
  return (
    <div className="admin bg-[#f6f7f9] text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3">
          <Link href="/" className="flex min-h-11 items-center gap-2.5 text-lg font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1e46b8] text-white"><Home size={18} aria-hidden /></span>
            EstateSite
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {[["#features", "What you get"], ["#how", "How it works"], ["#pricing", "Pricing"]].map(([href, label]) => (
              <a key={href} href={href} className="rounded-md px-3.5 py-3 text-[0.94rem] font-medium text-slate-600 hover:text-slate-900">{label}</a>
            ))}
            <a href={demo} className="rounded-md px-3.5 py-3 text-[0.94rem] font-medium text-slate-600 hover:text-slate-900">Live demo</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="inline-flex min-h-11 items-center px-3 font-semibold">Sign in</Link>
            <Link href="/signup" className="a-btn a-btn-primary">Create your site</Link>
          </div>
        </div>
      </header>

      <section className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-14 gap-y-12 px-5 py-16 md:py-24">
        <div className="flex min-w-0 flex-[1_1_28rem] flex-col items-start gap-6">
          <p className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-900">For real-estate agents & brokers</p>
          <h1 className="text-balance text-[clamp(2.1rem,4.2vw,3.5rem)] font-bold leading-[1.08] tracking-[-0.02em]">A professional property website with an AI concierge, live in minutes.</h1>
          <p className="max-w-xl text-lg text-slate-600">Show your portfolio clearly, answer buyers instantly, and turn every conversation into a lead. No web team needed.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/signup" className="a-btn a-btn-primary !min-h-[3.25rem] !px-6 text-base">Start free <ArrowRight size={18} aria-hidden /></Link>
            <a href={demo} className="a-btn a-btn-ghost !min-h-[3.25rem] !px-6 text-base">See a live demo</a>
          </div>
          <p className="text-sm text-slate-600">Set up in three steps. Your own subdomain or custom domain.</p>
        </div>

        <div aria-hidden className="min-w-0 flex-[1_1_24rem] overflow-hidden rounded-2xl border bg-white shadow-[0_24px_56px_rgba(16,24,40,0.12)]">
          <div className="flex items-center gap-3 border-b bg-slate-50 px-4 py-3">
            <span className="flex gap-1.5">{[0, 1, 2].map((i) => <span key={i} className="h-2.5 w-2.5 rounded-full bg-slate-300" />)}</span>
            <span className="flex-1 truncate rounded-md border bg-white px-3 py-1 text-xs text-slate-600">aurelia.{env.rootDomain}</span>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=70" alt="" className="h-64 w-full object-cover" />
          <div className="flex flex-col gap-3 p-5 text-[0.95rem]">
            <p className="max-w-[80%] self-end rounded-2xl rounded-br-sm bg-[#1e46b8] px-4 py-2.5 text-white">What can I buy for AED 1.5M with a payment plan?</p>
            <p className="max-w-[88%] self-start rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-2.5">Marina Vista Residences starts from AED 1.45M on a 60/40 plan. Shall I connect you with the advisor?</p>
          </div>
        </div>
      </section>

      <section id="features" className="border-y bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-20">
          <div className="max-w-2xl">
            <h2 className="text-[2.1rem] font-bold leading-tight">Three things, working together</h2>
            <p className="mt-2 text-lg text-slate-600">One sign-up gives you a public site, an assistant that knows your inventory, and one place where every enquiry lands.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex flex-col gap-3 rounded-2xl border p-7">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#1e46b8]"><Icon size={24} aria-hidden /></span>
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-20">
        <h2 className="text-[2.1rem] font-bold leading-tight">Live in three steps</h2>
        <ol className="grid gap-8 md:grid-cols-3">
          {STEPS.map(([title, body], i) => (
            <li key={title} className="flex flex-col gap-2 border-t-[3px] border-[#1e46b8] pt-5">
              <span className="text-sm font-bold text-[#1e46b8]">Step {i + 1}</span>
              <span className="text-xl font-bold">{title}</span>
              <span className="text-slate-600">{body}</span>
            </li>
          ))}
        </ol>
      </section>

      <section id="pricing" className="border-y bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-20">
          <div>
            <h2 className="text-[2.1rem] font-bold leading-tight">Simple pricing</h2>
            <p className="mt-2 text-lg text-slate-600">Hosted for you, or installed on your own server.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {PLANS.map((p) => (
              <div key={p.name} className={`flex flex-col gap-5 rounded-2xl p-7 ${p.highlight ? "border-2 border-[#1e46b8]" : "border"}`}>
                <div>
                  <p className="text-xl font-bold">{p.name}</p>
                  <p className="text-slate-600">{p.desc}</p>
                </div>
                <p className="text-[2.1rem] font-bold">{p.price}</p>
                <ul className="flex flex-col gap-2.5">
                  {p.items.map((i) => <li key={i} className="flex gap-2.5"><Check size={20} className="mt-0.5 shrink-0 text-[#1e46b8]" aria-hidden />{i}</li>)}
                </ul>
                <Link href="/signup" className={`a-btn mt-auto !min-h-[3.25rem] ${p.highlight ? "a-btn-primary" : "a-btn-ghost"}`}>Start free</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="flex flex-wrap items-center justify-between gap-x-12 gap-y-7 rounded-3xl bg-[#14275f] px-8 py-14 text-white md:px-12">
          <div className="min-w-0 flex-[1_1_26rem]">
            <h2 className="text-[2.1rem] font-bold leading-tight">Ready to put your portfolio online?</h2>
            <p className="mt-2 text-lg text-blue-100">Create your site now and add your first project today.</p>
          </div>
          <Link href="/signup" className="a-btn !min-h-[3.25rem] bg-white !px-6 text-base text-[#14275f] hover:bg-blue-50">Create your site</Link>
        </div>
      </section>

      <footer className="border-t bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-sm text-slate-600">
          <span>© {new Date().getFullYear()} EstateSite</span>
          <Link href="/login" className="inline-flex min-h-11 items-center hover:text-slate-900">Sign in</Link>
        </div>
      </footer>
    </div>
  );
}
