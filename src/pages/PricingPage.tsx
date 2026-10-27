import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { FuturisticBackground } from "@/components/ui/FuturisticBackground";
import { supabase } from "@/integrations/supabase/client";
import { arePaymentsEnabled } from "@/lib/env";
import { Loader2 } from "lucide-react";

type Offer = { name: string; price: string; period: string; description: string; priceId?: string; mode?: "subscription" | "payment"; trial?: boolean; planned?: boolean };
const offers: Offer[] = [
  { name: "Free", price: "$0", period: "no subscription", description: "Explore the legal-information assistants. Usage restrictions apply; the published daily and monthly allowances are being verified." },
  { name: "Premium", price: "$9.99", period: "per month after an eligible trial", description: "Individual subscription. The homepage's advertised chat and document allowances are being reconciled with server enforcement; unlimited document generation is not promised here.", priceId: "price_1Sdfqp0QhWGUtGKvcQuWONuB", mode: "subscription", trial: true },
  { name: "Solo Lawyer", price: "$29", period: "per month — planned", description: "Planned one-seat lawyer plan. Billing and access enforcement are not ready for enrollment.", planned: true },
  { name: "Firm", price: "$99", period: "per month + $25 per extra seat — planned", description: "Planned three-seat firm plan. Seat provisioning and additional-seat billing are not ready for enrollment.", planned: true },
  { name: "Large Firm", price: "$149", period: "per user/month — planned", description: "Planned ten-seat minimum: $1,490/month minimum before taxes. Team billing and access enforcement are not ready for enrollment.", planned: true },
  { name: "Per Document", price: "$5", period: "one-time", description: "One document-generation allowance. This is not a subscription and has no free trial.", priceId: "price_1SckVt0QhWGUtGKvl9YdmQqk", mode: "payment" },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const busy = useRef(false);
  const navigate = useNavigate();
  const enabled = arePaymentsEnabled();

  async function checkout(offer: Offer) {
    if (busy.current || !enabled || !offer.priceId || !offer.mode || offer.planned) return;
    busy.current = true;
    setLoading(offer.name);
    setErrorMessage("");
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        navigate("/login?returnTo=%2Fpricing");
        return;
      }
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: offer.priceId, mode: offer.mode, trial: offer.trial === true },
      });
      if (error) {
        let message = "Checkout could not be started. No checkout redirect occurred. Please try again or contact support.";
        if (error.context instanceof Response) {
          const body = await error.context.clone().json().catch(() => null);
          if (typeof body?.error === "string") message = body.error;
        }
        throw new Error(message);
      }
      if (typeof data?.error === "string") throw new Error(data.error);
      if (typeof data?.url !== "string") throw new Error("Checkout did not return a payment URL.");
      const destination = new URL(data.url);
      if (destination.protocol !== "https:" || destination.hostname !== "checkout.stripe.com") {
        throw new Error("The payment redirect could not be verified. Contact support.");
      }
      window.location.assign(destination.href);
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : "Checkout is unavailable. Please try again.");
    } finally {
      busy.current = false;
      setLoading(null);
    }
  }

  return (
    <Layout>
      <FuturisticBackground variant="dense">
        <section className="container mx-auto px-4 py-16 max-w-7xl">
          <header className="text-center max-w-3xl mx-auto mb-10">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-5">Plans and availability</h1>
            <p className="text-muted-foreground">Start free. Review availability, usage restrictions, and payment terms before choosing a paid plan.</p>
          </header>
          <div role="note" className="rounded-xl border border-border p-5 mb-6 text-sm space-y-2">
            <p>{enabled ? "Checkout availability is also checked by the server. No payment is created just by viewing this page." : "Online payments and trial enrollment are disabled in this website configuration. No paid checkout is available here."}</p>
            <p>The homepage's five-plan pricing is a rollout target, not confirmation that every plan is available. Firm plans remain unavailable until billing and seat controls are implemented.</p>
          </div>
          {errorMessage && <div role="alert" className="rounded-xl border border-destructive p-4 mb-6 text-sm">{errorMessage} <a href="mailto:support@legallyai.ai" className="underline">Contact support</a></div>}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {offers.map(offer => (
              <article key={offer.name} className="glass-card rounded-2xl p-6 flex flex-col min-w-0">
                <h2 className="font-display text-2xl font-bold mb-4">{offer.name}</h2>
                <p className="text-4xl font-bold mb-2">{offer.price}</p>
                <p className="text-sm text-muted-foreground mb-5">{offer.period}</p>
                <p className="text-sm mb-5 flex-1">{offer.description}</p>
                {offer.trial && <p className="text-sm text-muted-foreground mb-5">If eligible, seven days free, then $9.99/month plus applicable taxes until canceled. A payment method is required. Cancel before the trial ends to avoid the first subscription charge. Eligibility is checked by the server; an ineligible trial request will not silently become a paid checkout.</p>}
                {offer.name === "Free" ? <Button asChild variant="outline"><Link to="/signup?returnTo=%2Fpricing">Create a free account</Link></Button> : (
                  <Button variant="outline" disabled={offer.planned || !enabled || loading !== null} onClick={() => void checkout(offer)} aria-busy={loading === offer.name}>
                    {loading === offer.name && <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />}
                    {offer.planned ? "Enrollment not available" : !enabled ? "Checkout currently disabled" : loading === offer.name ? "Opening checkout…" : offer.trial ? "Start eligible 7-day trial" : "Buy one allowance"}
                  </Button>
                )}
              </article>
            ))}
          </div>
          <footer className="mt-10 max-w-3xl mx-auto space-y-4 text-sm text-muted-foreground">
            <p>LegallyAI provides AI-generated drafts and general legal information, not legal advice. Outputs may be inaccurate or unsuitable for your jurisdiction. Have a qualified attorney review documents before relying on them.</p>
            <p>Review the <Link to="/terms" className="underline">Terms of Service</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>. For billing questions or refund requests, email <a href="mailto:support@legallyai.ai" className="underline">support@legallyai.ai</a>. Refunds are reviewed case by case.</p>
          </footer>
        </section>
      </FuturisticBackground>
    </Layout>
  );
}
