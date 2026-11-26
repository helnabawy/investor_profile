import { z } from "zod";

/** One unit type's launch price against today's price. Amounts are in the project's currency. */
export type GrowthUnit = {
  unit: string;          // "Studio", "1 BR", "2 BR + maid"
  size?: string | null;  // free text, "37–44 m²"
  before: number;        // launch price
  now: number;           // today's price
  psfBefore?: number | null;
  psfNow?: number | null;
  paid?: number | null;  // what a buyer has paid so far on the launch price
};

export type PriceGrowth = {
  label?: string | null;       // phase or building, "Granada (4)"
  beforeLabel?: string | null; // "Launch"
  nowLabel?: string | null;    // "Today"
  note?: string | null;        // source or date of the figures
  units: GrowthUnit[];
};

const amount = z.coerce.number().finite().positive();
const optAmount = z.preprocess((v) => (v === "" || v == null ? null : v), amount.nullable()).catch(null);
const optText = (max: number) => z.preprocess((v) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null), z.string().nullable());

const schema = z.object({
  label: optText(80),
  beforeLabel: optText(40),
  nowLabel: optText(40),
  note: optText(400),
  units: z.array(z.unknown()).max(20).catch([]),
});

const unitSchema = z.object({
  unit: z.string().trim().min(1).max(40),
  size: optText(40),
  before: amount,
  now: amount,
  psfBefore: optAmount,
  psfNow: optAmount,
  paid: optAmount,
});

/** Validates admin input. Rows without a name and both prices are dropped; no rows means no section. */
export function cleanPriceGrowth(raw: unknown): PriceGrowth | null {
  const top = schema.safeParse(raw);
  if (!top.success) return null;
  const units = top.data.units.flatMap((u) => {
    const r = unitSchema.safeParse(u);
    return r.success ? [r.data] : [];
  });
  return units.length ? { ...top.data, units } : null;
}

/**
 * Reads amounts the way agents type them: "591k", "1.2M", "1,150,000", even "1.150,000".
 * Returns null for anything that is not a positive number.
 */
export function parseAmount(input: string): number | null {
  const s = input.trim().toLowerCase().replace(/[^\d.,km]/g, "");
  const mult = s.endsWith("m") ? 1_000_000 : s.endsWith("k") ? 1_000 : 1;
  let digits = s.replace(/[km]/g, "");
  // Several dots or commas are thousands separators; a single dot followed by 1–2 digits is a decimal.
  if (/^\d+\.\d{1,2}$/.test(digits)) digits = digits.replace(",", "");
  else digits = digits.replace(/[.,]/g, "");
  const n = Number(digits) * mult;
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : null;
}

export type GrowthRow = GrowthUnit & {
  gain: number;              // now − before
  growth: number;            // gain ÷ before
  psfGrowth: number | null;
  paidReturn: number | null; // gain ÷ paid: what the money put in so far has earned
};

export function growthRows(g: PriceGrowth): GrowthRow[] {
  return g.units.map((u) => {
    const gain = u.now - u.before;
    return {
      ...u,
      gain,
      growth: gain / u.before,
      psfGrowth: u.psfBefore && u.psfNow ? (u.psfNow - u.psfBefore) / u.psfBefore : null,
      paidReturn: u.paid ? gain / u.paid : null,
    };
  });
}

export const pct = (x: number) => `${x >= 0 ? "+" : "−"}${Math.round(Math.abs(x) * 100)}%`;

/** One line for the concierge, so it can quote the same figures the charts show. */
export function growthSummary(g: PriceGrowth | null, currency: string) {
  if (!g?.units.length) return null;
  const rows = growthRows(g);
  const parts = rows.map((r) =>
    `${r.unit} ${currency} ${r.before.toLocaleString("en-US")} → ${r.now.toLocaleString("en-US")} (${pct(r.growth)}` +
    (r.paidReturn != null ? `, ${pct(r.paidReturn)} on ${currency} ${r.paid!.toLocaleString("en-US")} paid` : "") + ")");
  return `price growth since ${g.beforeLabel || "launch"}${g.label ? ` (${g.label})` : ""}: ${parts.join("; ")}`;
}
