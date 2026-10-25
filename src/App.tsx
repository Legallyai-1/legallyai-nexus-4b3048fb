import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AnimatedRoutes } from '@/components/AnimatedRoutes';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { setStoredSubscriptionTier, isPaidSubscriptionTier } from '@/lib/subscription';
import { getSupabaseBrowserConfig } from '@/lib/env';
import { supabase } from '@/integrations/supabase/client';
import { getSupabaseSessionSafely, subscribeToSupabaseAuthState } from '@/integrations/supabase/helpers';
import { PRIVATE_APP_MODE, PRIVATE_APP_MESSAGE, PRIVATE_APP_CONFIG_ERROR } from '@/config/privateApp';
const SpeedInsights = () => null;
import { FreeLimitDialog } from '@/components/paywall/FreeLimitDialog';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [configReady, setConfigReady] = useState(true);

  useEffect(() => {
    try { getSupabaseBrowserConfig(); setConfigReady(true); }
    catch { setConfigReady(PRIVATE_APP_MODE); }
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const register = () => { void navigator.serviceWorker.register('/sw.js').catch(() => undefined); };
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });
    return () => window.removeEventListener('load', register);
  }, []);

  useEffect(() => {
    let disposed = false;
    let revision = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const allowed = new Set(['free', 'premium', 'pro', 'enterprise', 'document']);
    // Display cache only: server-side authorization must independently check access.
    const apply = (value: unknown) => {
      const normalized = typeof value === 'string' ? value.toLowerCase() : 'free';
      const tier = allowed.has(normalized) ? normalized : 'free';
      setStoredSubscriptionTier(tier);
      document.body.dataset.subscriptionTier = tier;
      document.body.dataset.adsEnabled = String(!isPaidSubscriptionTier(tier));
    };
    const schedule = (session: Awaited<ReturnType<typeof getSupabaseSessionSafely>>) => {
      if (disposed) return;
      const request = ++revision;
      if (timer !== undefined) clearTimeout(timer);
      apply('free');
      if (!session?.user) return;
      const userId = session.user.id;
      // Defer Supabase queries until outside the synchronous auth callback.
      timer = setTimeout(() => {
        timer = undefined;
        void (async () => {
          try {
            const { data, error } = await supabase.from('profiles')
              .select('subscription_tier').eq('id', userId).maybeSingle();
            if (disposed || request !== revision) return;
            apply(error ? 'free' : data?.subscription_tier);
          } catch {
            if (!disposed && request === revision) apply('free');
          }
        })();
      }, 0);
    };
    apply('free');
    const { data: { subscription } } = subscribeToSupabaseAuthState((_event, session) => schedule(session));
    const initialRevision = revision;
    void getSupabaseSessionSafely().then(session => {
      if (!disposed && revision === initialRevision) schedule(session);
    });
    return () => {
      disposed = true;
      revision += 1;
      if (timer !== undefined) clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  if (!configReady && !PRIVATE_APP_MODE) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6 text-center">
        <div className="max-w-md space-y-3">
          <h1 className="text-2xl font-bold">Private application configuration</h1>
          <p className="text-muted-foreground">{PRIVATE_APP_CONFIG_ERROR}</p>
        </div>
      </div>
    );
  }
  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading ? <LoadingScreen key="loading" /> : (
          <motion.div key="app-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
            <div className="sr-only">{PRIVATE_APP_MESSAGE}</div>
            <AnimatedRoutes />
          </motion.div>
        )}
      </AnimatePresence>
      <FreeLimitDialog />
      <SpeedInsights />
    </>
  );
}

export default App;
