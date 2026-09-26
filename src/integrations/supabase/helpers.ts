import type { AuthChangeEvent, Session, SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './client';
import { getSupabaseBrowserConfig } from '@/lib/env';

export interface SupabaseHealthCheckResult {
  ok: boolean;
  status: number;
  message: string;
}

export function formatSupabaseError(error: unknown, fallback = 'Supabase request failed') {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export async function getSupabaseSessionSafely(client: SupabaseClient = supabase) {
  try {
    const { data, error } = await client.auth.getSession();
    if (error) {
      throw error;
    }

    return data.session;
  } catch (error) {
    console.error('Unable to load Supabase session', error);
    return null;
  }
}

export function subscribeToSupabaseAuthState(
  onChange: (event: AuthChangeEvent, session: Session | null) => void,
  client: SupabaseClient = supabase,
) {
  return client.auth.onAuthStateChange((event, session) => {
    try {
      onChange(event, session);
    } catch (error) {
      console.error('Supabase auth state callback failed', error);
    }
  });
}

export async function checkSupabaseHealth(): Promise<SupabaseHealthCheckResult> {
  try {
    const { url, publicKey } = getSupabaseBrowserConfig();
    const response = await fetch(`${url}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        apikey: publicKey,
      },
    });

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        message: `Supabase responded with ${response.status}`,
      };
    }

    return {
      ok: true,
      status: response.status,
      message: 'Supabase connectivity verified',
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      message: formatSupabaseError(error, 'Unable to reach Supabase'),
    };
  }
}
