// Per Document ($5) allowance: one purchase buys one generated document (and the
// exports of that same document). The allowance lives in
// payment_records.metadata.documents_remaining (missing = 1, set by the webhook).
//
// Consumption is an atomic compare-and-swap: the UPDATE only matches while the row
// still holds the value we read and is still paid, so two concurrent requests can
// never both spend the same credit (Postgres re-checks the WHERE clause on the
// locked row before writing).

const ACTIVE_PAYMENT_STATUSES = ["paid", "succeeded"];
const SUBSCRIPTION_TIERS = new Set(["premium", "pro", "enterprise"]);
const MAX_ATTEMPTS = 4;

export type DocumentPaymentRecord = {
  id: string;
  tier: string | null;
  status: string | null;
  expires_at: string | null;
  metadata: Record<string, unknown> | null;
};

export type SubscriptionRow = { status: string | null; tier: string | null } | null;

// deno-lint-ignore no-explicit-any
type Db = any;

export function documentsRemaining(metadata: Record<string, unknown> | null | undefined): number {
  const raw = metadata && typeof metadata === "object" ? metadata.documents_remaining : undefined;
  if (raw === undefined || raw === null) return 1;
  const value = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(value) ? value : 0;
}

function isLiveRecord(record: { status: string | null; expires_at: string | null }, now: Date) {
  if (!record.status || !ACTIVE_PAYMENT_STATUSES.includes(record.status)) return false;
  return !record.expires_at || new Date(record.expires_at) > now;
}

/**
 * True when the user has a subscription-style entitlement (Premium/Pro/Enterprise),
 * which must never consume Per Document credits.
 */
export function hasSubscriptionEntitlement(
  profileTier: string | null | undefined,
  subscription: SubscriptionRow,
  paymentRecords: Array<{ tier: string | null; status: string | null; expires_at: string | null }> | null | undefined,
  now = new Date(),
): boolean {
  const activeSubscription = Boolean(subscription && ["active", "trialing", "past_due"].includes(subscription.status || ""));
  if (activeSubscription && SUBSCRIPTION_TIERS.has(subscription?.tier || profileTier || "")) return true;
  if ((paymentRecords || []).some((r) => SUBSCRIPTION_TIERS.has(r.tier || "") && isLiveRecord(r, now))) return true;
  // Legacy profile-only tier with no subscription row (mirrors resolveSubscriptionAccess' fallback).
  return !subscription && SUBSCRIPTION_TIERS.has(profileTier || "");
}

/** Live Per Document records, newest first (caller supplies them ordered). */
export function liveDocumentRecords(records: DocumentPaymentRecord[] | null | undefined, now = new Date()) {
  return (records || []).filter((r) => r.tier === "document" && isLiveRecord(r, now));
}

export type ConsumeResult =
  | { ok: true; recordId: string; remaining: number }
  | { ok: false; reason: "no_purchase" | "exhausted" | "contention" };

/** Atomically spend one Per Document credit for userId. */
export async function consumeDocumentCredit(db: Db, userId: string, now = new Date()): Promise<ConsumeResult> {
  let sawPurchase = false;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const { data, error } = await db
      .from("payment_records")
      .select("id, tier, status, expires_at, metadata")
      .eq("user_id", userId)
      .eq("tier", "document")
      .in("status", ACTIVE_PAYMENT_STATUSES)
      .order("verified_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (error) throw error;

    const live = liveDocumentRecords(data as DocumentPaymentRecord[]);
    if (live.length) sawPurchase = true;
    // Newest purchase with a credit left.
    const record = live.find((r) => documentsRemaining(r.metadata) > 0);
    if (!record) return { ok: false, reason: sawPurchase ? "exhausted" : "no_purchase" };

    const rawValue = record.metadata?.documents_remaining;
    const next = documentsRemaining(record.metadata) - 1;
    let update = db
      .from("payment_records")
      .update({
        metadata: { ...(record.metadata || {}), documents_remaining: next },
        updated_at: now.toISOString(),
      })
      .eq("id", record.id)
      .eq("user_id", userId)
      .in("status", ACTIVE_PAYMENT_STATUSES);
    update = rawValue === undefined || rawValue === null
      ? update.is("metadata->>documents_remaining", null) // missing key or JSON null
      : update.eq("metadata->>documents_remaining", String(rawValue));

    const { data: updated, error: updateError } = await update.select("id");
    if (updateError) throw updateError;
    if (Array.isArray(updated) && updated.length === 1) {
      return { ok: true, recordId: record.id, remaining: next };
    }
    // Another request changed the row between our read and write; re-read and retry.
  }
  return { ok: false, reason: "contention" };
}

/** Best-effort return of a credit when generation failed after it was spent. */
export async function refundDocumentCredit(db: Db, userId: string, recordId: string, now = new Date()): Promise<boolean> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const { data, error } = await db
      .from("payment_records")
      .select("id, metadata")
      .eq("id", recordId)
      .eq("user_id", userId)
      .maybeSingle();
    if (error || !data) return false;
    const rawValue = data.metadata?.documents_remaining;
    if (rawValue === undefined || rawValue === null) return false;
    const { data: updated, error: updateError } = await db
      .from("payment_records")
      .update({
        metadata: { ...(data.metadata || {}), documents_remaining: documentsRemaining(data.metadata) + 1 },
        updated_at: now.toISOString(),
      })
      .eq("id", recordId)
      .eq("user_id", userId)
      .eq("metadata->>documents_remaining", String(rawValue))
      .select("id");
    if (updateError) return false;
    if (Array.isArray(updated) && updated.length === 1) return true;
  }
  return false;
}
