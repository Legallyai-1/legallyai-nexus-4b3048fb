/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_SUPABASE_PROJECT_ID: string;
  readonly VITE_ADSENSE_CLIENT_ID?: string;
  readonly VITE_ENABLE_ADSENSE: 'true' | 'false';
  readonly VITE_ENABLE_PAYMENTS: 'true' | 'false';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
