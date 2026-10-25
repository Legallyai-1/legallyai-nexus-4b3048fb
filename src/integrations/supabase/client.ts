import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { getSupabaseBrowserConfig } from '@/lib/env';

let url = 'https://placeholder.supabase.co';
let publicKey = 'placeholder-key';

try {
  const config = getSupabaseBrowserConfig();
  url = config.url;
  publicKey = config.publicKey;
} catch (error) {
  console.warn('Supabase browser config not found, initializing fallback client:', error);
}

const supabaseFetch: typeof fetch = async (input, init) => {
  try {
    return await fetch(input, init);
  } catch (error) {
    console.warn('Supabase network request failed', error);
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
