// Free-question limit: anonymous visitors and signed-in non-subscribers get
// FREE_QUESTION_LIMIT questions (default 5) per UTC day, then are asked to subscribe or sign in.
// Counting is atomic in Postgres (public.consume_free_question, service-role only) on
// public.ai_question_usage. The day is part of the subject, so counts reset daily with no schema change.
// Subjects: signed in => per user; anonymous => per device (random id kept in the browser's
// localStorage, hashed) plus a higher per-network cap on the salted IP hash so one shared IP
// (mobile carrier, office, home Wi-Fi) doesn't lock out everyone behind it, while clearing
// storage can't give one network unlimited questions. Raw IPs and device ids are never stored.
// Pure logic (no network imports) so it can be unit-tested under Node; the caller supplies the client.
import { resolveSubscriptionAccess } from "./subscription-access.ts";

export const DEFAULT_FREE_QUESTION_LIMIT = 5;
/** Per-network cap for anonymous devices sharing one IP, as a multiple of the per-device limit. */
export const NETWORK_LIMIT_MULTIPLIER = 10;

export function freeQuestionLimit(env: { get(name: string): string | undefined }): number {
  const value = Number(env.get("FREE_QUESTION_LIMIT"));
  return Number.isSafeInteger(value) && value > 0 && value <= 100 ? value : DEFAULT_FREE_QUESTION_LIMIT;
}

export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") || "unknown";
}

/** Accepts only a browser-generated id (UUID-like); anything else is ignored. */
export function normalizeDeviceId(value: unknown): string | null {
  return typeof value === "string" && /^[A-Za-z0-9-]{16,64}$/.test(value) ? value : null;
}

export const utcDay = (now: Date) => now.toISOString().slice(0, 10);

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashSubject(ip: string, salt: string): Promise<string> {
  return "ip:" + await sha256Hex(`${salt}:${ip}`);
}

export interface QuestionSubject { subject: string; limit: number }

/** The counters one question is charged against, most specific first. */
export async function freeQuestionSubjects(opts: {
  userId: string | null; ip: string; deviceId: string | null; salt: string; limit: number; now: Date;
}): Promise<QuestionSubject[]> {
  const day = utcDay(opts.now);
  if (opts.userId) return [{ subject: `user:${opts.userId}:${day}`, limit: opts.limit }];
  const network = `${await hashSubject(opts.ip, opts.salt)}:${day}`;
  if (!opts.deviceId) return [{ subject: network, limit: opts.limit }];
  return [
    { subject: `dev:${await sha256Hex(`${opts.salt}:dev:${opts.deviceId}`)}:${day}`, limit: opts.limit },
    { subject: network, limit: opts.limit * NETWORK_LIMIT_MULTIPLIER },
  ];
}

export interface GateResult { allowed: boolean; used: number; limit: number; subscriber: boolean }

// deno-lint-ignore no-explicit-any
type AdminDb = any;

export async function checkFreeQuestion(opts: {
  admin: AdminDb;
  req: Request;
  userId: string | null;
  deviceId: string | null;
  salt: string;
  limit: number;
  now?: Date;
}): Promise<GateResult> {
  const { admin } = opts;
  if (opts.userId) {
    const [{ data: profile }, { data: subscription }, { data: paymentRecords }] = await Promise.all([
      admin.from("profiles").select("subscription_tier").eq("id", opts.userId).maybeSingle(),
      admin.from("subscriptions").select("status, tier, current_period_end, cancel_at_period_end").eq("user_id", opts.userId).maybeSingle(),
      admin.from("payment_records").select("tier, payment_method, expires_at, status, metadata").eq("user_id", opts.userId),
    ]);
    const access = resolveSubscriptionAccess(profile?.subscription_tier || "free", subscription, paymentRecords);
    if (access.entitled) return { allowed: true, used: 0, limit: opts.limit, subscriber: true };
  }
  const subjects = await freeQuestionSubjects({
    userId: opts.userId, ip: clientIp(opts.req), deviceId: opts.deviceId, salt: opts.salt, limit: opts.limit, now: opts.now ?? new Date(),
  });
  let used = 0;
  for (const [index, { subject, limit }] of subjects.entries()) {
    const { data, error } = await admin.rpc("consume_free_question", { p_subject: subject, p_limit: limit });
    if (error) {
      // Fail open so a database hiccup never breaks the chat; log for follow-up.
      console.warn("free question gate unavailable", error.message);
      return { allowed: true, used, limit: opts.limit, subscriber: false };
    }
    const row = Array.isArray(data) ? data[0] : data;
    // The first (most specific) counter is the one shown to the visitor.
    if (index === 0) used = Number(row?.used ?? 0);
    if (!row?.allowed) return { allowed: false, used: index === 0 ? used : opts.limit, limit: opts.limit, subscriber: false };
  }
  return { allowed: true, used, limit: opts.limit, subscriber: false };
}
