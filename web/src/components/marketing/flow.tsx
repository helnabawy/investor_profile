import { Check } from "lucide-react";

/**
 * Landing page diagram of the product in one line: the agent's site → a buyer asks the
 * concierge → the lead arrives in the inbox. CSS-only motion (see "flow-" rules in globals.css).
 */
const NODES = [
  {
    step: "Your portfolio site",
    body: "Projects with prices, payment plans and yields on every card. Pick a template, then add your name, colours and domain.",
    art: (
      <div className="flex h-full flex-col overflow-hidden rounded-xl border bg-white">
        <div className="flex items-center gap-1.5 border-b bg-slate-50 px-3 py-2">
          {[0, 1, 2].map((i) => <span key={i} className="h-2 w-2 rounded-full bg-slate-300" />)}
        </div>
        <div className="flex flex-1 gap-3 p-3">
          <div className="flex-1 rounded-lg bg-gradient-to-br from-sky-200 to-slate-300" />
          <div className="flex flex-1 flex-col justify-center gap-2">
            <span className="h-2.5 w-4/5 rounded bg-slate-800" />
            <span className="h-2 w-3/5 rounded bg-slate-300" />
            <span className="mt-1 text-xs font-bold text-[#1e46b8]">From AED 1.45M</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    step: "A buyer asks the concierge",
    body: "It answers day and night, only from your own projects, FAQs and notes. It never invents listings.",
    art: (
      <div className="flex h-full flex-col justify-center gap-2 rounded-xl border bg-white p-3 text-xs">
        <p className="max-w-[85%] self-end rounded-xl rounded-br-sm bg-[#1e46b8] px-3 py-2 text-white">Anything ready under AED 1.5M?</p>
        <p className="max-w-[85%] self-start rounded-xl rounded-bl-sm bg-slate-100 px-3 py-2">Yes, from AED 1.15M in Downtown.</p>
        <p className="typing flex gap-1 self-start rounded-xl rounded-bl-sm bg-slate-100 px-3 py-2.5 text-slate-500"><span /><span /><span /></p>
      </div>
    ),
  },
  {
    step: "The lead lands in your inbox",
    body: "Every form and chat enquiry arrives with the buyer's interest, budget and the full conversation.",
    art: (
      <div className="flex h-full flex-col justify-center gap-2 rounded-xl border bg-white p-3 text-xs">
        <div className="flex items-center justify-between gap-2 rounded-lg border-2 border-[#1e46b8] px-3 py-2">
          <span className="flex flex-col"><span className="font-bold">New enquiry</span><span className="text-slate-600">Downtown · Budget AED 1.5M</span></span>
          <span className="pop-loop rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-900">New</span>
        </div>
        <div className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-slate-600">
          <span>Earlier enquiry</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 font-semibold text-green-800"><Check size={12} aria-hidden /> Contacted</span>
        </div>
      </div>
    ),
  },
];

export function ProductFlow() {
  return (
    <ol className="flex flex-col md:flex-row md:items-stretch">
      {NODES.map((n, i) => (
        <li key={n.step} className="contents">
          {i > 0 && (
            <span aria-hidden className="flow-link">
              <span className="flow-dot" style={{ animationDelay: `${(i - 1) * 1.2}s` }} />
            </span>
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-4 rounded-2xl border bg-[#f6f7f9] p-5">
            <div aria-hidden className="h-36">{n.art}</div>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-bold text-[#1e46b8]">{i + 1} of {NODES.length}</p>
              <h3 className="text-xl font-bold">{n.step}</h3>
              <p className="text-slate-600">{n.body}</p>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
