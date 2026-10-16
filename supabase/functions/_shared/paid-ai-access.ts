import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getAnthropicKey } from "./anthropic-key.ts";

interface PaidAIAccessOptions {
  userId: string;
  authorization: string;
  supabaseUrl: string;
  serviceRoleKey: string;
  anonKey: string;
  cost?: number;
  reason: string;
}

async function getPaidAIAccess({
  userId,
  authorization,
  supabaseUrl,
  serviceRoleKey,
  anonKey,
  cost = 1,
}: PaidAIAccessOptions): Promise<"unavailable" | "included" | "credits"> {
  if (
    Deno.env.get("ENABLE_PAID_AI") !== "true"
    || !getAnthropicKey()
    || !userId
    || !authorization.startsWith("Bearer ")
    || !supabaseUrl
    || !serviceRoleKey
    || !anonKey
    || !Number.isSafeInteger(cost)
    || cost <= 0
  ) return "unavailable";

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (profileError || !profile) return "unavailable";

  // Free AI access for every signed-in user with a profile.
  // ENABLE_PAID_AI and the Anthropic key remain master safety switches.
  return "included";
}

export async function hasPaidAIQuota(options: PaidAIAccessOptions): Promise<boolean> {
  return (await getPaidAIAccess(options)) !== "unavailable";
}

export async function consumePaidAIQuota(options: PaidAIAccessOptions): Promise<boolean> {
  const access = await getPaidAIAccess(options);
  return access === "included";
}
