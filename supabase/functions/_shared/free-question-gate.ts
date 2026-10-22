// Free-question limit: anonymous visitors and signed-in non-subscribers get
// FREE_QUESTION_LIMIT questions (default 5), then must sign up / start a trial.
// Counting is atomic in Postgres (public.consume_free_question), keyed by user id
// or a salted SHA-256 hash of the visitor's IP address (raw IPs are never stored).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { resolveSubscriptionAccess } from "./subscription-access.ts";

export const DEFAULT_FREE_QUESTION_LIMIT = 5;

export function freeQuestionLimit(env: { get(name: string): string | undefined }): number {
  const value = Number(env.get("FREE_QUESTION_LIMIT"));
  return Number.isSafeInteger(value) && value > 0 && value <= 100 ? value : DEFAULT_FREE_QUESTION_LIMIT;
}

export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") || "unknown";
}

export async function hashSubject(ip: string, salt: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return "ip:" + Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export interface GateResult { allowed: boolean; used: number; limit: number; subscriber: boolean }

export async function checkFreeQuestion(opts: {
  req: Request;
  userId: string | null;
  supabaseUrl: string;
  serviceKey: string;
  limit: number;
}): Promise<GateResult> {
  const admin = createClient(opts.supabaseUrl, opts.serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  if (opts.userId) {
    const [{ data: profile }, { data: subscription }, { data: paymentRecords }] = await Promise.all([
      admin.from("profiles").select("subscription_tier").eq("id", opts.userId).maybeSingle(),
      admin.from("subscriptions").select("status, tier, current_period_end, cancel_at_period_end").eq("user_id", opts.userId).maybeSingle(),
      admin.from("payment_records").select("tier, payment_method, expires_at, status, metadata").eq("user_id", opts.userId),
    ]);
    const access = resolveSubscriptionAccess(profile?.subscription_tier || "free", subscription, paymentRecords);
    if (access.entitled) return { allowed: true, used: 0, limit: opts.limit, subscriber: true };
  }
  const subject = opts.userId ? `user:${opts.userId}` : await hashSubject(clientIp(opts.req), opts.serviceKey.slice(-16));
  const { data, error } = await admin.rpc("consume_free_question", { p_subject: subject, p_limit: opts.limit });
  if (error) {
    // Fail open so a database hiccup never breaks the chat; log for follow-up.
    console.warn("free question gate unavailable", error.message);
    return { allowed: true, used: 0, limit: opts.limit, subscriber: false };
  }
  const row = Array.isArray(data) ? data[0] : data;
  return { allowed: !!row?.allowed, used: Number(row?.used ?? 0), limit: opts.limit, subscriber: false };
}
