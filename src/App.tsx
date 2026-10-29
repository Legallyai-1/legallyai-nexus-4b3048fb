import { useEffect } from 'react';
import { AnimatedRoutes } from '@/components/AnimatedRoutes';
import { resolveAdEligibility, setAdEligibility, setStoredSubscriptionTier } from '@/lib/subscription';
import { supabase } from '@/integrations/supabase/client';
import { getSupabaseSessionSafely, subscribeToSupabaseAuthState } from '@/integrations/supabase/helpers';
const SpeedInsights = () => null;
import { FreeLimitDialog } from '@/components/paywall/FreeLimitDialog';

function App() {

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
    // Display cache only: server-side authorization must independently check access.
    const applyTier = (value: unknown) => {
      const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
      const tier = /^[a-z_]{1,32}$/.test(normalized) ? normalized : 'free';
      setStoredSubscriptionTier(tier);
      document.body.dataset.subscriptionTier = tier;
      setAdEligibility(resolveAdEligibility({ signedIn: true, tier }));
    };
    const schedule = (session: Awaited<ReturnType<typeof getSupabaseSessionSafely>>) => {
      if (disposed) return;
      const request = ++revision;
      if (timer !== undefined) clearTimeout(timer);
      if (!session?.user) {
        setStoredSubscriptionTier('free');
        document.body.dataset.subscriptionTier = 'free';
        setAdEligibility(resolveAdEligibility({ signedIn: false }));
        return;
      }
      // Signed in: show no ads until the plan is known, so paying users never see one.
      setAdEligibility('unknown');
      const userId = session.user.id;
      // Defer Supabase queries until outside the synchronous auth callback.
      timer = setTimeout(() => {
        timer = undefined;
        void (async () => {
          try {
            const { data, error } = await supabase.from('profiles')
              .select('subscription_tier').eq('id', userId).maybeSingle();
            if (disposed || request !== revision) return;
            if (error) setAdEligibility(resolveAdEligibility({ signedIn: true, failed: true }));
            else applyTier(data?.subscription_tier);
          } catch {
            if (!disposed && request === revision) setAdEligibility(resolveAdEligibility({ signedIn: true, failed: true }));
          }
        })();
      }, 0);
    };
    setAdEligibility('unknown');
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

  return (
    <>
      <AnimatedRoutes />
      <FreeLimitDialog />
      <SpeedInsights />
    </>
  );
}

export default App;
