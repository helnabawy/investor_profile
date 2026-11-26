import Link from "@/components/site/link";
import type { Project } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { growthRows } from "@/lib/price-growth";
import type { Locale } from "@/lib/i18n/locales";
import { SITE } from "@/lib/i18n/site";

// Rendered by server sections and by the client project explorer, so the language comes in as a prop.

export const statusLabel = (s: Project["status"], locale: Locale = "en") => {
  const c = SITE[locale].card;
  return s === "off-plan" ? c.offPlan : s === "ready" ? c.ready : c.soldOut;
};

/** "6–7% expected gross yield" → "6–7%". Falls back to the full text when there is no figure. */
export function yieldFigure(roi: string | null) {
  const m = roi?.match(/\d+(?:\.\d+)?\s*(?:[–-]\s*\d+(?:\.\d+)?)?\s*%/);
  return m ? m[0].replace(/\s+/g, "") : null;
}

/** "Available for sale": the agent's own flag, so visitors can see which projects they can buy into now. */
export function ForSaleTag({ className = "", locale = "en" }: { className?: string; locale?: Locale }) {
  return (
    <span className={`c-badge gap-1.5 bg-primary text-primary-foreground ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />{SITE[locale].card.availableForSale}
    </span>
  );
}

/** Project card: photo, status, one line of facts, then the two numbers investors compare first. */
export function ProjectCard({ p, locale = "en" }: { p: Project; locale?: Locale }) {
  const c = SITE[locale].card;
  const yld = yieldFigure(p.roi);
  const rise = p.price_growth?.units.length ? Math.max(...growthRows(p.price_growth).map((r) => r.growth)) : 0;
  const facts = [p.area, p.bedrooms && c.bedrooms(p.bedrooms), p.status === "ready" ? c.readyToMove : p.handover && c.handoverOn(p.handover)].filter(Boolean).join(" · ");
  return (
    <Link href={`/projects/${p.id}`} className="c-card group flex h-full flex-col overflow-hidden transition hover:border-primary">
      <div className="relative aspect-[3/2] overflow-hidden bg-muted">
        {p.images[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.images[0]} alt={p.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        )}
        <span className="absolute inset-x-3.5 top-3.5 flex flex-wrap gap-1.5">
          <span className={`c-badge ${p.status === "ready" ? "bg-primary text-primary-foreground" : "bg-card text-primary"}`}>{statusLabel(p.status, locale)}</span>
          {p.for_sale && <ForSaleTag locale={locale} />}
        </span>
        {rise > 0 && <span className="c-badge absolute bottom-3.5 start-3.5 bg-card text-foreground normal-case tracking-normal">{c.upSince(Math.round(rise * 100), p.price_growth?.beforeLabel || c.launch)}</span>}
      </div>
      <div className="flex flex-1 flex-col gap-3.5 p-5">
        <div>
          <h3 className="text-[1.2rem] font-bold leading-snug">{p.title}</h3>
          {facts && <p className="mt-0.5 text-sm text-muted-foreground">{facts}</p>}
        </div>
        <div className="mt-auto flex gap-3 border-t pt-3.5">
          <span className="flex flex-1 flex-col"><span className="c-label">{c.from}</span><span className="c-figure text-[1.05rem]">{formatPrice(p.price_from, p.currency, locale)}</span></span>
          {(yld || p.roi) && (
            <span className="flex flex-1 flex-col">
              <span className="c-label">{yld ? c.expectedYield : c.strategy}</span>
              <span className="c-figure text-[1.05rem] text-primary">{yld ?? p.roi}</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
