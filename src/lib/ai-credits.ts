import { supabase } from '@/integrations/supabase/client';

export interface CreditBalanceResult {
  credits: number;
  tier: string;
}

export async function ensureUserProfile(userId: string, email?: string | null, fullName?: string | null): Promise<void> {
  if (!userId) return;

  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (existingProfile) return;

  const { error } = await supabase.from('profiles').insert({
    id: userId,
    email: email || '',
    full_name: fullName || email || 'User',
    subscription_tier: 'free',
    credits: 50,
  });

  if (error && error.code !== '23505') {
    throw error;
  }
}

export async function getUserCreditBalance(userId: string): Promise<CreditBalanceResult> {
  const { data, error } = await supabase
    .from('profiles')
    .select('credits, subscription_tier')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Failed to load credit balance:', error);
    return { credits: 0, tier: 'free' };
  }

  return {
    credits: data?.credits ?? 0,
    tier: data?.subscription_tier ?? 'free',
  };
}

export async function deductUserCredits(userId: string, cost: number, reason: string): Promise<{ success: boolean; remaining: number }> {
  const { data, error } = await supabase.rpc('deduct_ai_credits', {
    p_user_id: userId,
    p_cost: cost,
    p_reason: reason,
  });

  if (error) {
    console.error('Credits deduction failed:', error);
    return { success: false, remaining: 0 };
  }

  const result = Array.isArray(data) ? data[0] : data;
  return {
    success: Boolean(result?.success),
    remaining: Number(result?.remaining ?? 0),
  };
}
