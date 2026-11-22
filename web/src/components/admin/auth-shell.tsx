import { Logo } from "@/components/brand/logo";
import { platformFont } from "@/lib/fonts";

const SKYLINE = "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600&q=72";

/** Sign-in and sign-up: the form on the left, what the product does on the right (hidden on phones). */
export function AuthShell({ title, subtitle, children, aside }: { title: string; subtitle?: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className={`admin ${platformFont.variable} flex min-h-screen bg-white`}>
      <main className="flex min-w-0 flex-[1_1_440px] flex-col px-6 py-6 md:px-8">
        <div className="self-start"><Logo /></div>
        <div className="m-auto flex w-full max-w-[420px] flex-col gap-7 py-12">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-[1.9rem] font-semibold leading-tight tracking-[-0.02em]">{title}</h1>
            {subtitle && <p className="a-muted text-base">{subtitle}</p>}
          </div>
          <div>{children}</div>
          {aside}
        </div>
        <p className="a-muted text-[0.85rem]">Websites and an AI concierge for real-estate agents and brokers.</p>
      </main>
      <aside className="relative hidden flex-[1.15_1_420px] flex-col justify-end overflow-hidden bg-[#0f1728] text-white lg:flex">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={SKYLINE} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(15_23_40/0.15)_0%,rgb(15_23_40/0.45)_45%,rgb(15_23_40/0.94)_100%)]" />
        <div className="relative flex flex-col gap-6 px-[clamp(24px,5vw,64px)] pb-14 pt-12">
          <div aria-hidden className="flex max-w-[420px] flex-col gap-2 self-start">
            <p className="max-w-[88%] self-end rounded-[12px_4px_12px_12px] bg-[#1e46b8] px-3.5 py-2.5 text-[0.95rem]">What can I buy for AED 1.5M with a payment plan?</p>
            <p className="max-w-[92%] self-start rounded-[4px_12px_12px_12px] bg-white px-3.5 py-2.5 text-[0.95rem] text-[#0f1728]">Marina Vista Residences starts from AED 1.45M on a 60/40 plan. Shall I connect you with the advisor?</p>
          </div>
          <p className="max-w-[18ch] text-balance text-[clamp(1.8rem,3.2vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.025em]">A professional property website with an AI concierge, live in minutes.</p>
          <p className="max-w-[46ch] text-[1.05rem] text-[#d7dbe3]">Show your portfolio clearly, answer buyers instantly, and turn every conversation into a lead.</p>
        </div>
      </aside>
    </div>
  );
}
