"use client";
import { useState } from "react";
import { Plus, TrendingUp, X } from "lucide-react";
import { parseAmount, parseCount, pct, type PriceGrowth } from "@/lib/price-growth";

type Row = { unit: string; size: string; available: string; before: string; now: string; psfBefore: string; psfNow: string; paid: string };
const EMPTY: Row = { unit: "", size: "", available: "", before: "", now: "", psfBefore: "", psfNow: "", paid: "" };
const COLS: [keyof Row, string, string][] = [
  ["unit", "Unit", "Studio"],
  ["size", "Size", "37–44 m²"],
  ["available", "Units for sale", "4"],
  ["before", "Launch price", "591,000"],
  ["now", "Price today", "750,000"],
  ["psfBefore", "Launch / sq ft", "1,484"],
  ["psfNow", "Today / sq ft", "1,884"],
  ["paid", "Paid so far", "236,400"],
];

const str = (n: number | null | undefined) => (n ? n.toLocaleString("en-US") : "");

/**
 * Launch-vs-today prices per unit type. Serialised into one hidden `price_growth` field; the server
 * re-validates it. Gain and return-on-paid are worked out here so the agent sees what visitors will see.
 */
export function PriceGrowthEditor({ value, currency }: { value: PriceGrowth | null; currency: string }) {
  const [meta, setMeta] = useState({
    label: value?.label ?? "", beforeLabel: value?.beforeLabel ?? "", nowLabel: value?.nowLabel ?? "", note: value?.note ?? "",
  });
  const [rows, setRows] = useState<Row[]>(
    value?.units.map((u) => ({
      unit: u.unit, size: u.size ?? "", available: u.available == null ? "" : String(u.available), before: str(u.before), now: str(u.now),
      psfBefore: str(u.psfBefore), psfNow: str(u.psfNow), paid: str(u.paid),
    })) ?? [],
  );

  const units = rows.map((r) => ({
    unit: r.unit.trim(), size: r.size.trim() || null, available: parseCount(r.available), before: parseAmount(r.before), now: parseAmount(r.now),
    psfBefore: parseAmount(r.psfBefore), psfNow: parseAmount(r.psfNow), paid: parseAmount(r.paid),
  }));
  const complete = units.filter((u) => u.unit && u.before && u.now);
  const json = complete.length ? JSON.stringify({ ...meta, units: complete }) : "";
  const set = (i: number, k: keyof Row, v: string) => setRows(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)));

  return (
    <div className="flex flex-col gap-5">
      <input type="hidden" name="price_growth" value={json} />
      <div className="flex flex-wrap items-start gap-4">
        <label className="field min-w-0 flex-[1_1_220px]"><span>Phase or building</span>
          <input value={meta.label} onChange={(e) => setMeta({ ...meta, label: e.target.value })} placeholder="Granada (4)" /><small>Optional. Shown above the charts.</small></label>
        <label className="field min-w-0 flex-[1_1_140px]"><span>“Before” is called</span>
          <input value={meta.beforeLabel} onChange={(e) => setMeta({ ...meta, beforeLabel: e.target.value })} placeholder="Launch" /></label>
        <label className="field min-w-0 flex-[1_1_140px]"><span>“After” is called</span>
          <input value={meta.nowLabel} onChange={(e) => setMeta({ ...meta, nowLabel: e.target.value })} placeholder="Today" /></label>
      </div>

      {rows.length > 0 ? (
        <div className="-mx-1 overflow-x-auto px-1">
          <table className="w-full min-w-[1100px] border-separate border-spacing-x-1.5 border-spacing-y-1 text-sm">
            <thead>
              <tr className="text-left">
                {COLS.map(([k, label]) => <th key={k} scope="col" className="pb-1 font-medium">{label}</th>)}
                <th scope="col" className="pb-1 text-right font-medium">Gain</th>
                <th scope="col" className="pb-1 text-right font-medium">On paid</th>
                <th><span className="sr-only">Remove</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const u = units[i];
                const gain = u.before && u.now ? u.now - u.before : null;
                return (
                  <tr key={i}>
                    {COLS.map(([k, label, ph]) => (
                      <td key={k} className={k === "unit" ? "w-[7.5rem]" : k === "available" ? "w-[6.5rem]" : ""}>
                        <input
                          className="a-input !min-h-10 !px-2.5 !py-1.5 tabular-nums"
                          aria-label={`${label}, row ${i + 1}`}
                          inputMode={k === "unit" || k === "size" ? undefined : k === "available" ? "numeric" : "decimal"}
                          value={r[k]}
                          placeholder={i === 0 ? ph : ""}
                          onChange={(e) => set(i, k, e.target.value)}
                          onBlur={() => {
                            // Tidy amounts on the way out, so "591k" reads back as 591,000.
                            if (k === "unit" || k === "size" || k === "available") return;
                            const n = parseAmount(r[k]);
                            if (n) set(i, k, n.toLocaleString("en-US"));
                          }}
                        />
                      </td>
                    ))}
                    <td className="whitespace-nowrap text-right tabular-nums">
                      {gain != null ? <>{gain.toLocaleString("en-US")}<span className="a-muted block text-xs">{pct(gain / u.before!)}</span></> : <span className="a-muted">—</span>}
                    </td>
                    <td className="whitespace-nowrap text-right font-medium tabular-nums">
                      {gain != null && u.paid ? pct(gain / u.paid) : <span className="a-muted font-normal">—</span>}
                    </td>
                    <td className="w-10">
                      <button type="button" className="a-btn a-btn-ghost !min-h-10 !w-10 !px-0" aria-label={`Remove row ${i + 1}`} onClick={() => setRows(rows.filter((_, j) => j !== i))}><X size={15} aria-hidden /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-lg border border-dashed border-line-bold bg-subtle px-4 py-3.5 text-sm">
          <TrendingUp size={18} className="mt-0.5 shrink-0" aria-hidden />
          <p>Has this project gone up since launch? Add each unit type&rsquo;s launch price and today&rsquo;s price, and your project page shows the rise as charts. Add what a buyer has paid so far to show the gain on their money, and how many units of each type are for sale.</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="a-btn a-btn-ghost" onClick={() => setRows([...rows, EMPTY])}><Plus size={16} aria-hidden /> Add unit type</button>
        <span className="a-muted text-[0.82rem]">Amounts in {currency || "AED"}. You can type 591k or 1.15M.{" "}Units for sale: enter 0 for sold out, or leave empty to hide.{rows.length > complete.length && " Rows need a unit name and both prices to show."}</span>
      </div>

      <label className="field"><span>Source note</span>
        <input value={meta.note} onChange={(e) => setMeta({ ...meta, note: e.target.value })} placeholder="Developer price list, November 2026" />
        <small>Shown under the charts. Say where the figures come from and when.</small>
      </label>
    </div>
  );
}
