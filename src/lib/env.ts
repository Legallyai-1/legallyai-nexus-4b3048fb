const DEFAULT_ADSENSE_CLIENT_ID = 'ca-pub-4991947741196600';

export function getSupabaseBrowserConfig() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const publicKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url) {
    throw new Error('Missing VITE_SUPABASE_URL');
  }

  if (!publicKey) {
    throw new Error('Missing VITE_SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_KEY');
  }

  return {
    url,
    publicKey,
    projectId: import.meta.env.VITE_SUPABASE_PROJECT_ID,
  };
}

export function isAdsenseEnabled() {
  return import.meta.env.VITE_ENABLE_ADSENSE !== 'false';
}

export function getAdsenseClientId() {
  return import.meta.env.VITE_ADSENSE_CLIENT_ID || DEFAULT_ADSENSE_CLIENT_ID;
}

export function arePaymentsEnabled() {
  return import.meta.env.VITE_ENABLE_PAYMENTS !== 'false';
}
