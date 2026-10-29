import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getSupabaseBrowserConfig } from "@/lib/env";

// Ask Supabase once per page load whether the Google provider is switched on, so the button
// never sends people to a raw "provider is not enabled" error page.
let googleEnabledPromise: Promise<boolean> | null = null;
function isGoogleProviderEnabled(): Promise<boolean> {
  if (!googleEnabledPromise) {
    googleEnabledPromise = (async () => {
      try {
        const { url, publicKey } = getSupabaseBrowserConfig();
        const res = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: publicKey } });
        if (!res.ok) return false;
        const settings = await res.json();
        return settings?.external?.google === true;
      } catch {
        return false;
      }
    })();
  }
  return googleEnabledPromise;
}

interface GoogleSignInButtonProps {
  /** Same-origin path to land on after Google returns (e.g. "/login" or "/login?returnTo=%2Fpricing"). */
  returnPath?: string;
  label?: string;
}

// "Continue with Google" via Supabase OAuth. New Google users get their profile from the same
// auth.users trigger (handle_new_user) as email sign-ups, and start on the free tier; trials are
// started from /pricing exactly like email accounts.
export function GoogleSignInButton({ returnPath = "/login", label = "Continue with Google" }: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (isNative) return;
    let active = true;
    void isGoogleProviderEnabled().then(value => { if (active) setEnabled(value); });
    return () => { active = false; };
  }, [isNative]);

  // The Android app serves the site from https://localhost, which Google/Supabase can't redirect
  // back to without a deep-link setup, so the option is web-only for now.
  if (isNative || !enabled) return null;

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    const path = returnPath.startsWith("/") && !returnPath.startsWith("//") ? returnPath : "/login";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}${path}` },
    });
    if (error) {
      setLoading(false);
      toast.error(/provider is not enabled/i.test(error.message)
        ? "Google sign-in isn't available yet. Please use email for now."
        : error.message || "Google sign-in failed. Please try again.");
    }
    // On success the browser navigates to Google, so keep the spinner.
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={loading}
        aria-busy={loading}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-legal-gold/40 bg-white/70 px-4 text-sm font-semibold text-legal-navy shadow-sm backdrop-blur-md transition-all hover:border-legal-gold hover:shadow-[0_0_14px_hsl(45_93%_58%/0.35)] disabled:opacity-60 dark:bg-white/90"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : (
          <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
            <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/>
          </svg>
        )}
        {label}
      </button>
      <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
        <span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}

export default GoogleSignInButton;
