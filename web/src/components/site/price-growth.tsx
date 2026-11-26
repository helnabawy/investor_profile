"use client";
import { useEffect, useRef, useState } from "react";
import { TrendingUp } from "lucide-react";
import { growthRows, pct, type GrowthRow, type PriceGrowth } from "@/lib/price-growth";
import { formatPrice } from "@/lib/format";

const full = (n: number) => n.toLocaleString("en-US");
const range = (xs: number[], f: (n: number) => string) => {
  const lo = Math.min(...xs), hi = Math.max(...xs);
  return f(lo) === f(hi) ? f(lo) : `${f(lo)}–${f(hi)}`;
};
const pctRange = (xs: number[]) => {
  const lo = Math.round(Math.min(...xs) * 100), hi = Math.round(Math.max(...xs) * 100);
  return lo === hi ? `+${lo}%` : `+${lo}–${hi}%`;
};

/** Clean ticks (1, 2, 2.5 or 5 × 10ⁿ) spanning [lo, hi]. */
function ticks(lo: number, hi: number, count = 4) {
  const raw = (hi - lo) / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const start = Math.floor(lo / step) * step, end = Math.ceil(hi / step) * step;
  const out: number[] = [];
  for (let v = start; v <= end + step / 2; v += step) out.push(v);
  return out;
}

/**
 * Animates once when scrolled into view. Server HTML is drawn at the final values, so the charts
 * read correctly without JS; the start position is only applied after hydration, off-screen.
 */
function useEnter<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [phase, setPhase] = useState<"static" | "armed" | "in">("static");
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < innerHeight * 0.85) return; // already on screen: leave it be
    setPhase("armed");
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setPhase("in"); io.disconnect(); }
    }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, phase] as const;
}

type Metric = "price" | "psf";

export function PriceGrowthSection({ growth, currency }: { growth: PriceGrowth; currency: string }) {
  const rows = growthRows(growth);
  const psfRows = rows.filter((r) => r.psfBefore && r.psfNow);
  const paidRows = rows.filter((r) => r.paidReturn != null);
  const [metric, setMetric] = useState<Metric>("price");
  const before = growth.beforeLabel || "Launch";
  const now = growth.nowLabel || "Today";
  if (!rows.length) return null;

  const best = paidRows.reduce<GrowthRow | null>((a, r) => (!a || r.paidReturn! > a.paidReturn! ? r : a), null);
  const rising = rows.every((r) => r.growth > 0);

  return (
    <section aria-labelledby="growth-title" className="c-card flex flex-col gap-7 p-5 sm:p-7">
      <header className="flex flex-col gap-1.5">
        <span className="c-label flex items-center gap-1.5 font-medium uppercase tracking-[0.08em]">
          <TrendingUp size={15} className="text-primary" aria-hidden /> Price growth{growth.label ? ` · ${growth.label}` : ""}
        </span>
        <h2 id="growth-title" className="text-balance text-[1.5rem] font-bold leading-tight">
          {rising
            ? <>Prices are up <span className="whitespace-nowrap">{pctRange(rows.map((r) => r.growth)).slice(1)}</span> since {before.toLowerCase()}</>
            : `${before} prices against ${now.toLowerCase()}`}
        </h2>
        <p className="text-muted-foreground">Every unit type, {before.toLowerCase()} price against {now.toLowerCase()}&rsquo;s.</p>
      </header>

      <dl className="flex flex-wrap gap-3">
        <Tile label={`${currency} gained per unit since ${before.toLowerCase()}`} value={range(rows.map((r) => r.gain), (n) => formatPrice(n, "").trim())}
          sub="Depending on the unit type" />
        {best && (
          <Tile label="Best gain on the amount paid so far" value={pct(best.paidReturn!)}
            sub={`${best.unit}: ${formatPrice(best.gain, currency)} on ${formatPrice(best.paid!, currency)} paid`} />
        )}
        {psfRows.length > 0 && (
          <Tile label={`${currency} per sq ft ${now.toLowerCase()}`} value={range(psfRows.map((r) => r.psfNow!), full)}
            sub={`${range(psfRows.map((r) => r.psfBefore!), full)} at ${before.toLowerCase()}`} />
        )}
      </dl>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-bold">{metric === "price" ? "Unit price" : "Price per sq ft"}, {before.toLowerCase()} → {now.toLowerCase()}</h3>
          {psfRows.length > 0 && (
            <div role="radiogroup" aria-label="Measure" className="pg-toggle">
              {(["price", "psf"] as const).map((m) => (
                <button key={m} type="button" role="radio" aria-checked={metric === m} onClick={() => setMetric(m)}>
                  {m === "price" ? "Unit price" : "Per sq ft"}
                </button>
              ))}
            </div>
          )}
        </div>
        <Legend items={[[before, "pg-before"], [now, "pg-now"]]} />
        <Dumbbell rows={metric === "price" ? rows : psfRows} metric={metric} currency={currency} before={before} now={now} />
      </div>

      {paidRows.length > 0 && (
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-lg font-bold">What the money paid so far has earned</h3>
            <p className="text-[0.95rem] text-muted-foreground">An early buyer&rsquo;s payments to date, and how much the unit has gained on top.</p>
          </div>
          <Legend items={[["Paid so far", "pg-paid"], [`Gain since ${before.toLowerCase()}`, "pg-now"]]} />
          <PaidBars rows={paidRows} currency={currency} />
        </div>
      )}

      <details className="pg-details group">
        <summary className="cursor-pointer font-medium text-primary">See all the figures</summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-[0.92rem] tabular-nums">
            <thead className="text-muted-foreground">
              <tr className="border-b">
                <th scope="col" className="py-2 pr-3 font-medium">Unit</th>
                <th scope="col" className="py-2 pr-3 font-medium">Size</th>
                <th scope="col" className="py-2 pr-3 text-right font-medium">{before}</th>
                <th scope="col" className="py-2 pr-3 text-right font-medium">{now}</th>
                <th scope="col" className="py-2 pr-3 text-right font-medium">Gain</th>
                {psfRows.length > 0 && <th scope="col" className="py-2 pr-3 text-right font-medium">Per sq ft</th>}
                {paidRows.length > 0 && <th scope="col" className="py-2 text-right font-medium">On paid</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.unit} className="border-b last:border-0">
                  <th scope="row" className="py-2 pr-3 font-medium">{r.unit}</th>
                  <td className="py-2 pr-3 text-muted-foreground">{r.size ?? "—"}</td>
                  <td className="py-2 pr-3 text-right">{full(r.before)}</td>
                  <td className="py-2 pr-3 text-right">{full(r.now)}</td>
                  <td className="py-2 pr-3 text-right">{full(r.gain)} <span className="text-muted-foreground">({pct(r.growth)})</span></td>
                  {psfRows.length > 0 && <td className="py-2 pr-3 text-right">{r.psfBefore && r.psfNow ? `${full(r.psfBefore)} → ${full(r.psfNow)}` : "—"}</td>}
                  {paidRows.length > 0 && <td className="py-2 text-right">{r.paid ? <>{pct(r.paidReturn!)} <span className="text-muted-foreground">of {full(r.paid)}</span></> : "—"}</td>}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-sm text-muted-foreground">Amounts in {currency}.</p>
        </div>
      </details>

      <p className="border-t pt-4 text-sm text-muted-foreground">
        {growth.note ? `${growth.note}. ` : ""}Past price growth does not guarantee future returns. Ask for the current price list before you decide.
      </p>
    </section>
  );
}

function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex min-w-0 flex-[1_1_10.5rem] flex-col gap-1 rounded-[var(--radius)] bg-muted px-4 py-3.5">
      <dt className="c-label">{label}</dt>
      <dd className="font-heading text-[1.4rem] font-bold leading-tight">{value}</dd>
      {sub && <dd className="text-sm text-muted-foreground">{sub}</dd>}
    </div>
  );
}

function Legend({ items }: { items: [string, string][] }) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground" aria-hidden>
      {items.map(([label, cls]) => <li key={label} className="flex items-center gap-2"><span className={`pg-key ${cls}`} />{label}</li>)}
    </ul>
  );
}

function Dumbbell({ rows, metric, currency, before, now }: { rows: GrowthRow[]; metric: Metric; currency: string; before: string; now: string }) {
  const [ref, phase] = useEnter<HTMLDivElement>();
  const a = (r: GrowthRow) => (metric === "price" ? r.before : r.psfBefore!);
  const b = (r: GrowthRow) => (metric === "price" ? r.now : r.psfNow!);
  const t = ticks(Math.min(...rows.map(a)), Math.max(...rows.map(b)));
  const lo = t[0], hi = t[t.length - 1];
  const x = (v: number) => ((v - lo) / (hi - lo)) * 100;
  const money = (v: number) => (metric === "price" ? formatPrice(v, currency) : `${currency} ${full(v)}`);
  const tick = (v: number) => (metric === "price" ? formatPrice(v, "").trim() : full(v));

  return (
    <div ref={ref} data-phase={phase} className="pg-chart">
      <ul className="flex flex-col">
        {rows.map((r, i) => {
          const from = x(a(r)), to = x(b(r));
          const delta = (b(r) - a(r)) / a(r);
          return (
            <li key={r.unit} tabIndex={0} className="pg-row group" style={{ "--i": i } as React.CSSProperties}
              aria-label={`${r.unit}: ${before} ${money(a(r))}, ${now} ${money(b(r))}, ${pct(delta)}`}>
              <span className="pg-label">
                <span className="font-medium">{r.unit}</span>
                {r.size && <span className="block text-[0.8rem] text-muted-foreground">{r.size}{/\d$/.test(r.size) ? " m²" : ""}</span>}
              </span>
              <span className="pg-track" aria-hidden>
                {t.map((v) => <span key={v} className="pg-grid" style={{ left: `${x(v)}%` }} />)}
                <span className="pg-link" style={{ left: `${from}%`, width: `${to - from}%` }} />
                <span className="pg-dot pg-before" style={{ left: `${from}%` }} />
                <span className="pg-dot pg-now pg-moving" style={{ left: `${to}%`, "--from": `${from}%` } as React.CSSProperties} />
                <span className="pg-tip" style={{ left: `${Math.min(Math.max(to, 18), 82)}%` }}>
                  <strong>{r.unit}</strong>
                  <span>{before} {money(a(r))}</span>
                  <span>{now} {money(b(r))}</span>
                  <span className="font-semibold">{pct(delta)}</span>
                </span>
              </span>
              <span className="pg-value" aria-hidden>
                <span className="c-figure">{money(b(r)).replace(`${currency} `, "")}</span>
                <span className="text-sm font-semibold text-primary">{pct(delta)}</span>
              </span>
            </li>
          );
        })}
      </ul>
      <div className="pg-row pg-axis" aria-hidden>
        <span className="pg-label" />
        <span className="pg-track">
          {t.map((v) => <span key={v} className="pg-tick" style={{ left: `${x(v)}%` }}>{tick(v)}</span>)}
        </span>
        <span className="pg-value text-xs text-muted-foreground">{currency}</span>
      </div>
    </div>
  );
}

function PaidBars({ rows, currency }: { rows: GrowthRow[]; currency: string }) {
  const [ref, phase] = useEnter<HTMLUListElement>();
  const max = Math.max(...rows.map((r) => r.paid! + Math.max(r.gain, 0)));
  return (
    <ul ref={ref} data-phase={phase} className="pg-chart flex flex-col">
      {rows.map((r, i) => (
        <li key={r.unit} tabIndex={0} className="pg-row group" style={{ "--i": i } as React.CSSProperties}
          aria-label={`${r.unit}: paid ${formatPrice(r.paid, currency)}, gain ${formatPrice(r.gain, currency)}, ${pct(r.paidReturn!)} on the money paid`}>
          <span className="pg-label font-medium">{r.unit}</span>
          <span className="pg-track" aria-hidden>
            <span className="pg-stack" style={{ width: `${((r.paid! + Math.max(r.gain, 0)) / max) * 100}%` }}>
              <span className="pg-paid" style={{ flexGrow: r.paid! }} />
              {r.gain > 0 && <span className="pg-now" style={{ flexGrow: r.gain }} />}
            </span>
            <span className="pg-tip" style={{ left: "50%" }}>
              <strong>{r.unit}</strong>
              <span>Paid {formatPrice(r.paid, currency)}</span>
              <span>Gain {formatPrice(r.gain, currency)}</span>
              <span className="font-semibold">{pct(r.paidReturn!)} on the money paid</span>
            </span>
          </span>
          <span className="pg-value" aria-hidden>
            <span className="c-figure">{pct(r.paidReturn!)}</span>
            <span className="text-sm text-muted-foreground">{formatPrice(r.gain, "").trim()} gain</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
