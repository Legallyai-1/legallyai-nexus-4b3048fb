import { getSupabaseBrowserConfig } from '@/lib/env';

export function getSupabaseFunctionHeaders(accessToken: string) {
  const { publicKey } = getSupabaseBrowserConfig();

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
    apikey: publicKey,
  };
}