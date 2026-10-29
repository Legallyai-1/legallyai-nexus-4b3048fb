import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getAdsConsent, isGoogleAdsConfigured, setAdsConsent } from "@/lib/googleAds";
import { isGoogleCmpActive, isGoogleConsentMessageVisible } from "@/lib/consent";

// Asks before loading Google Ads measurement. Renders nothing when Google Ads is not configured, and steps aside
// whenever Google's certified consent tool (AdSense Privacy & messaging) is on the page, since that tool governs
// consent for EEA/UK/CH visitors and the two prompts must never show at the same time.
// Intended trade-off: where the CMP is present we don't record a choice here, so Google Ads conversion measurement
// stays off for those visitors (privacy-conservative). Bridging the CMP's TCF decision into it is a possible follow-up.
export function AdsConsentBanner() {
  const [needed, setNeeded] = useState(() => isGoogleAdsConfigured() && getAdsConsent() === null);
  const [googleCmp, setGoogleCmp] = useState(() => isGoogleCmpActive() || isGoogleConsentMessageVisible());

  useEffect(() => {
    if (!needed || googleCmp || typeof MutationObserver === "undefined") return;
    const check = () => {
      if (isGoogleCmpActive() || isGoogleConsentMessageVisible()) setGoogleCmp(true);
    };
    const observer = new MutationObserver(check);
    observer.observe(document.body, { childList: true });
    check();
    return () => observer.disconnect();
  }, [needed, googleCmp]);

  if (!needed || googleCmp) return null;
  const choose = (value: "granted" | "denied") => { setAdsConsent(value); setNeeded(false); };
  return (
    <div role="dialog" aria-live="polite" aria-label="Advertising measurement consent" className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 p-4 shadow-lg backdrop-blur">
      <div className="container mx-auto flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">We use Google Ads cookies to measure sign-ups from our ads. Allow advertising measurement? See our <a className="underline" href="/privacy">Privacy Policy</a>.</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => choose("denied")}>Decline</Button>
          <Button size="sm" onClick={() => choose("granted")}>Allow</Button>
        </div>
      </div>
    </div>
  );
}
