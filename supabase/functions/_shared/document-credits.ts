// Per Document ($5) allowance: one purchase buys one generated document (and the
// exports of that same document). The allowance lives in
// payment_records.metadata.documents_remaining (missing = 1, set by the webhook).
//
// Consumption is an atomic compare-and-swap: the UPDATE only matches while the row
// still holds the exact metadata value we read (and documents_remaining) and is still
// paid, so two concurrent requests can never both spend the same credit, and a
// concurrent write to any other metadata key is never silently overwritten (Postgres
// re-checks the WHERE clause on the locked row before writing). On a mismatch we
// re-read and retry a bounded number of times.
//
// A jsonb_set RPC with the same WHERE guard would be cleaner (no whole-object write),
// but it needs a migration, which requires owner approval.

const ACTIVE_PAYMENT_STATUSES = ["paid", "succeeded"];
const SUBSCRIPTION_TIERS = new Set(["premium", "pro", "enterprise"]);
const ACTIVE_SUBSCRIPTION_STATUSES = ["active", "trialing"];
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
 * which must never consume Per Document credits. Only an active or trialing
 * subscriptions row, or a live paid payment_records row for a subscription tier, counts.
 * past_due does not exempt, and profiles.subscription_tier alone never does (it can be
 * stale long after a subscription ends).
 */
export function hasSubscriptionEntitlement(
  subscription: SubscriptionRow,
  paymentRecords: Array<{ tier: string | null; status: string | null; expires_at: string | null }> | null | undefined,
  now = new Date(),
): boolean {
  const activeSubscription = Boolean(subscription && ACTIVE_SUBSCRIPTION_STATUSES.includes(subscription.status || ""));
  if (activeSubscription && SUBSCRIPTION_TIERS.has(subscription?.tier || "")) return true;
  return (paymentRecords || []).some((r) => SUBSCRIPTION_TIERS.has(r.tier || "") && isLiveRecord(r, now));
}

/**
 * WHERE guard on the exact metadata value read (jsonb equality, so key order does not
 * matter) plus documents_remaining, so the write only lands on the row we read.
 */
function guardOnRead(query: Db, metadata: Record<string, unknown> | null | undefined) {
  const guarded = metadata === null || metadata === undefined
    ? query.is("metadata", null)
    : query.eq("metadata", JSON.stringify(metadata));
  const raw = metadata?.documents_remaining;
  return raw === undefined || raw === null
    ? guarded.is("metadata->>documents_remaining", null) // missing key or JSON null
    : guarded.eq("metadata->>documents_remaining", String(raw));
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

    const next = documentsRemaining(record.metadata) - 1;
    const update = guardOnRead(db
      .from("payment_records")
      .update({
        metadata: { ...(record.metadata || {}), documents_remaining: next },
        updated_at: now.toISOString(),
      })
      .eq("id", record.id)
      .eq("user_id", userId)
      .in("status", ACTIVE_PAYMENT_STATUSES), record.metadata);

    const { data: updated, error: updateError } = await update.select("id");
    if (updateError) throw updateError;
    if (Array.isArray(updated) && updated.length === 1) {
      return { ok: true, recordId: record.id, remaining: next };
    }
    // Another request changed the row (credit or any other metadata key) between our
    // read and write; re-read and retry.
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
    const { data: updated, error: updateError } = await guardOnRead(db
      .from("payment_records")
      .update({
        metadata: { ...(data.metadata || {}), documents_remaining: documentsRemaining(data.metadata) + 1 },
        updated_at: now.toISOString(),
      })
      .eq("id", recordId)
      .eq("user_id", userId), data.metadata)
      .select("id");
    if (updateError) return false;
    if (Array.isArray(updated) && updated.length === 1) return true;
  }
  return false;
}
