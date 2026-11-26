"use client";
import { useState } from "react";
import { Plus, TrendingUp, X } from "lucide-react";
import { parseAmount, parseCount, pct, type PriceGrowth } from "@/lib/price-growth";
import { BiField } from "@/components/admin/bilingual";
import { useAdminT } from "@/components/admin/i18n";
import type { AdminDict } from "@/lib/i18n/admin";

type Row = { unit: string; unit_ar: string; size: string; size_ar: string; available: string; before: string; now: string; psfBefore: string; psfNow: string; paid: string };
const EMPTY: Row = { unit: "", unit_ar: "", size: "", size_ar: "", available: "", before: "", now: "", psfBefore: "", psfNow: "", paid: "" };
const TEXT: (keyof Row)[] = ["unit", "unit_ar", "size", "size_ar"];
const cols = (g: AdminDict["growth"], arabic: boolean): [keyof Row, string, string][] => [
  ["unit", g.unit, "Studio"],
  ...(arabic ? [["unit_ar", g.unitAr, "ستوديو"] as [keyof Row, string, string]] : []),
  ["size", g.size, "37–44 m²"],
  ...(arabic ? [["size_ar", g.sizeAr, "37–44 م²"] as [keyof Row, string, string]] : []),
  ["available", g.forSale, "4"],
  ["before", g.before, "591,000"],
  ["now", g.now, "750,000"],
  ["psfBefore", g.psfBefore, "1,484"],
  ["psfNow", g.psfNow, "1,884"],
  ["paid", g.paid, "236,400"],
];

const str = (n: number | null | undefined) => (n ? n.toLocaleString("en-US") : "");

/**
 * Launch-vs-today prices per unit type. Serialised into one hidden `price_growth` field; the server
 * re-validates it. Gain and return-on-paid are worked out here so the agent sees what visitors will see.
 */
export function PriceGrowthEditor({ value, currency }: { value: PriceGrowth | null; currency: string }) {
  const { t, arabicOn } = useAdminT();
  const g = t.growth;
  const COLS = cols(g, arabicOn);
  const [meta, setMeta] = useState({
    label: value?.label ?? "", beforeLabel: value?.beforeLabel ?? "", nowLabel: value?.nowLabel ?? "", note: value?.note ?? "",
    label_ar: value?.label_ar ?? "", beforeLabel_ar: value?.beforeLabel_ar ?? "", nowLabel_ar: value?.nowLabel_ar ?? "", note_ar: value?.note_ar ?? "",
  });
  const [rows, setRows] = useState<Row[]>(
    value?.units.map((u) => ({
      unit: u.unit, unit_ar: u.unit_ar ?? "", size: u.size ?? "", size_ar: u.size_ar ?? "", available: u.available == null ? "" : String(u.available), before: str(u.before), now: str(u.now),
      psfBefore: str(u.psfBefore), psfNow: str(u.psfNow), paid: str(u.paid),
    })) ?? [],
  );

  const units = rows.map((r) => ({
    unit: r.unit.trim(), unit_ar: r.unit_ar.trim() || null, size: r.size.trim() || null, size_ar: r.size_ar.trim() || null, available: parseCount(r.available), before: parseAmount(r.before), now: parseAmount(r.now),
    psfBefore: parseAmount(r.psfBefore), psfNow: parseAmount(r.psfNow), paid: parseAmount(r.paid),
  }));
  const complete = units.filter((u) => u.unit && u.before && u.now);
  const json = complete.length ? JSON.stringify({ ...meta, units: complete }) : "";
  const set = (i: number, k: keyof Row, v: string) => setRows(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)));

  return (
    <div className="flex flex-col gap-5">
      <input type="hidden" name="price_growth" value={json} />
      <div className="flex flex-wrap items-start gap-4">
        <BiField className="basis-full" name="pg_label" label={g.phase} hint={g.phaseHint} placeholder="Granada (4)"
          value={meta.label} valueAr={meta.label_ar} onChange={(x) => setMeta({ ...meta, label: x })} onChangeAr={(x) => setMeta({ ...meta, label_ar: x })} />
        <BiField className="min-w-0 flex-[1_1_260px]" name="pg_before" label={g.beforeName} placeholder="Launch"
          value={meta.beforeLabel} valueAr={meta.beforeLabel_ar} onChange={(x) => setMeta({ ...meta, beforeLabel: x })} onChangeAr={(x) => setMeta({ ...meta, beforeLabel_ar: x })} />
        <BiField className="min-w-0 flex-[1_1_260px]" name="pg_now" label={g.afterName} placeholder="Today"
          value={meta.nowLabel} valueAr={meta.nowLabel_ar} onChange={(x) => setMeta({ ...meta, nowLabel: x })} onChangeAr={(x) => setMeta({ ...meta, nowLabel_ar: x })} />
      </div>

      {rows.length > 0 ? (
        <div className="-mx-1 overflow-x-auto px-1">
          <table className="w-full min-w-[1100px] border-separate border-spacing-x-1.5 border-spacing-y-1 text-sm">
            <thead>
              <tr className="text-start">
                {COLS.map(([k, label]) => <th key={k} scope="col" className="pb-1 font-medium">{label}</th>)}
                <th scope="col" className="pb-1 text-end font-medium">{g.gain}</th>
                <th scope="col" className="pb-1 text-end font-medium">{g.onPaid}</th>
                <th><span className="sr-only">{t.ui.remove}</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const u = units[i];
                const gain = u.before && u.now ? u.now - u.before : null;
                return (
                  <tr key={i}>
                    {COLS.map(([k, label, ph]) => (
                      <td key={k} className={k === "unit" || k === "unit_ar" ? "w-[7.5rem]" : k === "available" ? "w-[6.5rem]" : ""}>
                        <input
                          className="a-input !min-h-10 !px-2.5 !py-1.5 tabular-nums"
                          aria-label={g.cellLabel(label, i + 1)}
                          name={TEXT.includes(k) ? `pg${i}_${k}` : undefined}
                          dir={k.endsWith("_ar") ? "rtl" : "ltr"}
                          inputMode={TEXT.includes(k) ? undefined : k === "available" ? "numeric" : "decimal"}
                          value={r[k]}
                          placeholder={i === 0 ? ph : ""}
                          onChange={(e) => set(i, k, e.target.value)}
                          onBlur={() => {
                            // Tidy amounts on the way out, so "591k" reads back as 591,000.
                            if (TEXT.includes(k) || k === "available") return;
                            const n = parseAmount(r[k]);
                            if (n) set(i, k, n.toLocaleString("en-US"));
                          }}
                        />
                      </td>
                    ))}
                    <td className="whitespace-nowrap text-end tabular-nums" dir="ltr">
                      {gain != null ? <>{gain.toLocaleString("en-US")}<span className="a-muted block text-xs">{pct(gain / u.before!)}</span></> : <span className="a-muted">—</span>}
                    </td>
                    <td className="whitespace-nowrap text-end font-medium tabular-nums" dir="ltr">
                      {gain != null && u.paid ? pct(gain / u.paid) : <span className="a-muted font-normal">—</span>}
                    </td>
                    <td className="w-10">
                      <button type="button" className="a-btn a-btn-ghost !min-h-10 !w-10 !px-0" aria-label={g.removeRow(i + 1)} onClick={() => setRows(rows.filter((_, j) => j !== i))}><X size={15} aria-hidden /></button>
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
          <p>{g.empty}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="a-btn a-btn-ghost" onClick={() => setRows([...rows, EMPTY])}><Plus size={16} aria-hidden /> {g.addUnit}</button>
        <span className="a-muted text-[0.82rem]">{g.amountsHint(currency || "AED")}{rows.length > complete.length && g.incomplete}</span>
      </div>

      <BiField name="pg_note" label={g.note} placeholder={g.notePh} hint={g.noteHint}
        value={meta.note} valueAr={meta.note_ar} onChange={(x) => setMeta({ ...meta, note: x })} onChangeAr={(x) => setMeta({ ...meta, note_ar: x })} />
    </div>
  );
}
