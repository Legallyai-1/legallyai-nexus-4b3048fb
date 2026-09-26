import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AnimatedRoutes } from '@/components/AnimatedRoutes';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { setStoredSubscriptionTier, shouldShowAds } from '@/lib/subscription';
import { getSupabaseBrowserConfig } from '@/lib/env';
import { supabase } from '@/integrations/supabase/client';
import { getSupabaseSessionSafely, subscribeToSupabaseAuthState } from '@/integrations/supabase/helpers';
import { PRIVATE_APP_MODE, PRIVATE_APP_MESSAGE, PRIVATE_APP_CONFIG_ERROR } from '@/config/privateApp';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [configReady, setConfigReady] = useState(true);

  useEffect(() => {
    let requiredEnvReady = false;

    try {
      getSupabaseBrowserConfig();
      requiredEnvReady = true;
    } catch {
      requiredEnvReady = false;
    }

    setConfigReady(PRIVATE_APP_MODE ? true : requiredEnvReady);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
          // Silently ignore registration failures; the app remains usable without offline support.
        });
      });
    }

    const tier = new URLSearchParams(window.location.search).get('tier');
    if (tier) {
      setStoredSubscriptionTier(tier);
    }

    const syncSubscriptionFromSession = async (overrideSession?: Awaited<ReturnType<typeof getSupabaseSessionSafely>>) => {
      const session = overrideSession ?? await getSupabaseSessionSafely();
      const user = session?.user;

      if (!user) {
        setStoredSubscriptionTier('free');
        document.body.dataset.subscriptionTier = 'free';
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Unable to sync subscription tier', error);
      }

      const tierName = profile?.subscription_tier || 'free';
      setStoredSubscriptionTier(tierName);
      document.body.dataset.subscriptionTier = tierName;
    };

    void syncSubscriptionFromSession();

    const { data: { subscription } } = subscribeToSupabaseAuthState((_event, session) => {
      void syncSubscriptionFromSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const adsEnabled = shouldShowAds();
    document.body.dataset.adsEnabled = String(adsEnabled);
    document.body.dataset.subscriptionTier = localStorage.getItem('legallyai_subscription_tier') || 'free';
  }, []);

  if (!configReady && !PRIVATE_APP_MODE) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6 text-center">
        <div className="max-w-md space-y-3">
          <h1 className="text-2xl font-bold">Private application configuration</h1>
          <p className="text-muted-foreground">
            {PRIVATE_APP_CONFIG_ERROR}
          </p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <LoadingScreen key="loading" />
      ) : (
        <motion.div
          key="app-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
        >
          <div className="sr-only">{PRIVATE_APP_MESSAGE}</div>
          <AnimatedRoutes />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;
