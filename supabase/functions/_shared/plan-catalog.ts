// Plan names and seat allowances, derived from the Stripe price ID stored on the subscription.
// Solo and Enterprise sync with tier "pro" (the DB tier CHECK only allows free/premium/pro), so the
// price ID is what tells Solo, Firm and Enterprise apart. Keep in sync with create-checkout-handler.ts.
export const PREMIUM_PRICE_ID = "price_1Sdfqp0QhWGUtGKvcQuWONuB";
export const SOLO_PLAN_PRICE_ID = "price_1UVwxE0QhWGUtGKv3tjz0A3I";
export const FIRM_PLAN_PRICE_ID = "price_1SckV70QhWGUtGKvvg1tH7lu";
export const ENTERPRISE_PLAN_PRICE_ID = "price_1UVwxL0QhWGUtGKvpqH8gbUR";
export const MAX_EXTRA_SEATS = 100;

export type PlanName = "Free" | "Premium" | "Per document" | "Solo" | "Firm" | "Enterprise";

const BY_PRICE: Record<string, { name: PlanName; includedSeats: number | null; extraSeats: boolean }> = {
  [PREMIUM_PRICE_ID]: { name: "Premium", includedSeats: null, extraSeats: false },
  [SOLO_PLAN_PRICE_ID]: { name: "Solo", includedSeats: 1, extraSeats: false },
  [FIRM_PLAN_PRICE_ID]: { name: "Firm", includedSeats: 3, extraSeats: true },
  [ENTERPRISE_PLAN_PRICE_ID]: { name: "Enterprise", includedSeats: 10, extraSeats: true },
};

/** Display name for a plan: the price ID wins; the stored tier is only a fallback for older rows. */
export function planNameFor(priceId: string | null | undefined, tier: string | null | undefined): PlanName {
  const known = priceId ? BY_PRICE[priceId] : undefined;
  if (known) return known.name;
  switch ((tier ?? "").toLowerCase()) {
    case "premium": return "Premium";
    case "document": return "Per document";
    case "enterprise": return "Enterprise";
    case "pro": return "Firm";
    default: return "Free";
  }
}

/** Extra seats bought on the subscription (webhook stores the seat add-on quantity as metadata.extra_seats). */
export function extraSeatsFrom(metadata: unknown): number {
  const raw = metadata && typeof metadata === "object" ? (metadata as Record<string, unknown>).extra_seats : undefined;
  const value = typeof raw === "number" ? raw : typeof raw === "string" && /^\d+$/.test(raw.trim()) ? Number(raw) : 0;
  return Number.isInteger(value) && value > 0 ? Math.min(value, MAX_EXTRA_SEATS) : 0;
}

/**
 * Total seats (owner included) for a firm plan, or null when the plan has no seat allowance
 * (free/premium/document). Older 'pro' rows without a known price are treated as Firm.
 */
export function seatLimitFor(priceId: string | null | undefined, tier: string | null | undefined, metadata?: unknown): number | null {
  const known = priceId ? BY_PRICE[priceId] : undefined;
  if (known) {
    if (known.includedSeats === null) return null;
    return known.includedSeats + (known.extraSeats ? extraSeatsFrom(metadata) : 0);
  }
  const name = planNameFor(null, tier);
  if (name === "Firm") return 3 + extraSeatsFrom(metadata);
  if (name === "Enterprise") return 10 + extraSeatsFrom(metadata);
  return null;
}
