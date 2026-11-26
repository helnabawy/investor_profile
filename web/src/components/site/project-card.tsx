import Link from "@/components/site/link";
import type { Project } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { growthRows } from "@/lib/price-growth";

export const statusLabel = (s: Project["status"]) => (s === "off-plan" ? "Off-plan" : s === "ready" ? "Ready" : "Sold out");

/** "6–7% expected gross yield" → "6–7%". Falls back to the full text when there is no figure. */
export function yieldFigure(roi: string | null) {
  const m = roi?.match(/\d+(?:\.\d+)?\s*(?:[–-]\s*\d+(?:\.\d+)?)?\s*%/);
  return m ? m[0].replace(/\s+/g, "") : null;
}

/** "Available for sale": the agent's own flag, so visitors can see which projects they can buy into now. */
export function ForSaleTag({ className = "" }: { className?: string }) {
  return (
    <span className={`c-badge gap-1.5 bg-primary text-primary-foreground ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />Available for sale
    </span>
  );
}

/** Project card: photo, status, one line of facts, then the two numbers investors compare first. */
export function ProjectCard({ p }: { p: Project }) {
  const yld = yieldFigure(p.roi);
  const rise = p.price_growth?.units.length ? Math.max(...growthRows(p.price_growth).map((r) => r.growth)) : 0;
  const facts = [p.area, p.bedrooms && `${p.bedrooms} BR`, p.status === "ready" ? "Ready to move" : p.handover && `Handover ${p.handover}`].filter(Boolean).join(" · ");
  return (
    <Link href={`/projects/${p.id}`} className="c-card group flex h-full flex-col overflow-hidden transition hover:border-primary">
      <div className="relative aspect-[3/2] overflow-hidden bg-muted">
        {p.images[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.images[0]} alt={p.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        )}
        <span className="absolute left-3.5 right-3.5 top-3.5 flex flex-wrap gap-1.5">
          <span className={`c-badge ${p.status === "ready" ? "bg-primary text-primary-foreground" : "bg-card text-primary"}`}>{statusLabel(p.status)}</span>
          {p.for_sale && <ForSaleTag />}
        </span>
        {rise > 0 && <span className="c-badge absolute bottom-3.5 left-3.5 bg-card text-foreground normal-case tracking-normal">Up {Math.round(rise * 100)}% since {(p.price_growth?.beforeLabel || "launch").toLowerCase()}</span>}
      </div>
      <div className="flex flex-1 flex-col gap-3.5 p-5">
        <div>
          <h3 className="text-[1.2rem] font-bold leading-snug">{p.title}</h3>
          {facts && <p className="mt-0.5 text-sm text-muted-foreground">{facts}</p>}
        </div>
        <div className="mt-auto flex gap-3 border-t pt-3.5">
          <span className="flex flex-1 flex-col"><span className="c-label">From</span><span className="c-figure text-[1.05rem]">{formatPrice(p.price_from, p.currency)}</span></span>
          {(yld || p.roi) && (
            <span className="flex flex-1 flex-col">
              <span className="c-label">{yld ? "Expected gross yield" : "Strategy"}</span>
              <span className="c-figure text-[1.05rem] text-primary">{yld ?? p.roi}</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
