import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getAdsConsent, isGoogleAdsConfigured, setAdsConsent } from "@/lib/googleAds";

// Asks before loading Google Ads measurement. Renders nothing when Google Ads is not configured.
export function AdsConsentBanner() {
  const [open, setOpen] = useState(() => isGoogleAdsConfigured() && getAdsConsent() === null);
  if (!open) return null;
  const choose = (value: "granted" | "denied") => { setAdsConsent(value); setOpen(false); };
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
