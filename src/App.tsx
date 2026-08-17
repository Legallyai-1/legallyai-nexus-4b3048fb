import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AnimatedRoutes } from '@/components/AnimatedRoutes';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { setStoredSubscriptionTier, shouldShowAds } from '@/lib/subscription';
import { supabase } from '@/integrations/supabase/client';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [configReady, setConfigReady] = useState(true);

  useEffect(() => {
    const requiredEnvReady = Boolean(
      import.meta.env.VITE_SUPABASE_URL &&
      (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)
    );

    setConfigReady(requiredEnvReady);

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

    const syncSubscriptionFromSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        setStoredSubscriptionTier('free');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .maybeSingle();

      const tierName = profile?.subscription_tier || 'free';
      setStoredSubscriptionTier(tierName);
      document.body.dataset.subscriptionTier = tierName;
    };

    syncSubscriptionFromSession();
  }, []);

  useEffect(() => {
    const adsEnabled = shouldShowAds();
    document.body.dataset.adsEnabled = String(adsEnabled);
    document.body.dataset.subscriptionTier = localStorage.getItem('legallyai_subscription_tier') || 'free';
  }, []);

  if (!configReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6 text-center">
        <div className="max-w-md space-y-3">
          <h1 className="text-2xl font-bold">Missing Supabase configuration</h1>
          <p className="text-muted-foreground">
            Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> (or <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>) in your Vercel environment variables.
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
          <AnimatedRoutes />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;
