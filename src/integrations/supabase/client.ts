import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { getSupabaseBrowserConfig } from '@/lib/env';

const { url, publicKey } = getSupabaseBrowserConfig();

const supabaseFetch: typeof fetch = async (input, init) => {
  try {
    return await fetch(input, init);
  } catch (error) {
    console.error('Supabase network request failed', error);
    throw error instanceof Error
      ? new Error(`Supabase network request failed: ${error.message}`)
      : new Error('Supabase network request failed');
  }
};

export const supabase = createClient<Database>(url, publicKey, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    persistSession: typeof window !== 'undefined',
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: supabaseFetch,
  },
});
