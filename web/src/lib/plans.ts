// The plans a hosted site can be on, and what each one allows. `tenants.plan` stores the id.
// The project and custom-domain limits are also enforced in the database
// (supabase/migrations/20261112000000_plan_limits.sql) — keep the two in step.
export type PlanId = "free" | "solo" | "team";

export type Plan = {
  id: PlanId;
  name: string;
  /** Most projects a site may hold; null = unlimited. */
  maxProjects: number | null;
  customDomain: boolean;
  /** Shows the "Powered by" line in the site footer. */
  badge: boolean;
  /** Visitor chat messages per rolling 24 hours (protects the operator's AI bill). */
  dailyChat: number;
};

export const PLANS: Record<PlanId, Plan> = {
  free: { id: "free", name: "Free", maxProjects: 10, customDomain: false, badge: true, dailyChat: 100 },
  solo: { id: "solo", name: "Solo", maxProjects: null, customDomain: true, badge: false, dailyChat: 2000 },
  team: { id: "team", name: "Team", maxProjects: null, customDomain: true, badge: false, dailyChat: 10000 },
};

/** Plan for a stored `tenants.plan` value. Unknown values get the Free limits. */
export function planOf(value: string | null | undefined): Plan {
  return (value && Object.hasOwn(PLANS, value) ? PLANS[value as PlanId] : PLANS.free);
}

/** Where an agent goes to upgrade (no self-serve billing yet). */
export const upgradeUrl = process.env.NEXT_PUBLIC_PLATFORM_URL ? `${process.env.NEXT_PUBLIC_PLATFORM_URL.replace(/\/$/, "")}/#pricing` : null;
