import Link from "next/link";
import { Bot, Palette, Globe, Inbox, Building2, Zap, Check } from "lucide-react";
import { env } from "@/lib/env";

// Platform marketing page (root domain in multi-tenant mode). Tenant sites never reach this route.
const FEATURES = [
  { icon: Building2, title: "Property portfolio", body: "Showcase off-plan and ready projects with galleries, payment plans, yields and brochures." },
  { icon: Bot, title: "AI concierge", body: "A 24/7 assistant trained on your listings and FAQs that qualifies buyers and books calls." },
  { icon: Inbox, title: "Lead inbox", body: "Every enquiry from forms and chat in one place, with transcripts and WhatsApp follow-up." },
  { icon: Palette, title: "Your brand", body: "Pick a style, then change colors, fonts, logo and every section of every page." },
  { icon: Globe, title: "Your domain", body: "Start on a free subdomain, connect your own domain whenever you're ready." },
  { icon: Zap, title: "Low running cost", body: "Runs on free or low-cost AI models with automatic fallback, so the chat stays up." },
];

const PLANS = [
  { name: "Starter", price: "Free", desc: "Try it with your listings", items: ["Subdomain", "Up to 10 projects", "100 AI chats / day", "EstateSite badge"] },
  { name: "Pro", price: "$29/mo", desc: "For independent agents", items: ["Custom domain", "Unlimited projects", "2,000 AI chats / day", "No badge", "Email lead alerts"], highlight: true },
  { name: "Self-hosted", price: "One-time", desc: "For brokerages", items: ["Deploy on your own servers", "Your own AI keys", "Full source access", "Priority setup support"] },
];

export default function Landing() {
  return (
    <div className="admin bg-white text-slate-900">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <span className="text-lg font-semibold text-teal-700">EstateSite</span>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/login" className="px-3 py-2 text-slate-600 hover:text-slate-900">Sign in</Link>
          <Link href="/signup" className="a-btn a-btn-primary">Create your site</Link>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-20 pt-16 text-center md:pt-24">
        <p className="mx-auto inline-block rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-800">For real-estate agents & brokers</p>
        <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">A luxury property website with an AI concierge, live in minutes</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">Show your portfolio beautifully, answer buyers instantly, and turn every conversation into a lead.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/signup" className="a-btn a-btn-primary !px-6 !py-3 text-base">Start free</Link>
          <a href={`http://demo.${env.rootDomain}`} className="a-btn a-btn-ghost !px-6 !py-3 text-base">See a live demo</a>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="a-card">
              <Icon className="text-teal-700" size={22} />
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="text-center text-3xl font-semibold">Simple pricing</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {PLANS.map((p) => (
            <div key={p.name} className={`a-card ${p.highlight ? "ring-2 ring-teal-600" : ""}`}>
              <p className="font-semibold">{p.name}</p>
              <p className="mt-2 text-3xl font-semibold">{p.price}</p>
              <p className="text-sm text-slate-500">{p.desc}</p>
              <ul className="mt-5 space-y-2 text-sm">
                {p.items.map((i) => <li key={i} className="flex gap-2"><Check size={16} className="text-teal-700" />{i}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-slate-500">© {new Date().getFullYear()} EstateSite</footer>
    </div>
  );
}
