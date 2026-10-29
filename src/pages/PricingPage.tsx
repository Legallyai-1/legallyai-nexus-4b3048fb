import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { arePaymentsEnabled } from "@/lib/env";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseStripeCheckoutUrl, readCheckoutError } from "@/lib/checkout";

type Offer = {
  key: string; name: string; price: string; period: string; description: string; audience: "individual" | "firm";
  priceId?: string; mode?: "subscription" | "payment"; trial?: boolean; contact?: boolean; trialTerms?: string;
  /** Monthly price in cents and included seats, for plans that sell extra seats. */
  monthlyCents?: number; includedSeats?: number; extraSeats?: boolean;
};
const SALES_MAILTO = "mailto:support@legallyai.ai?subject=LegallyAI%20firm%20plan";
const EXTRA_SEAT_CENTS = 2500;
const MAX_EXTRA_SEATS = 100;
const dollars = (cents: number) => `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: cents % 100 ? 2 : 0 })}`;
/** Monthly total for a plan plus extra seats, e.g. "$149/month" for Firm with 2 extra seats. */
const monthlyTerms = (monthlyCents: number, extraSeats: number) => `${dollars(monthlyCents + extraSeats * EXTRA_SEAT_CENTS)}/month`;
// Only offers with a priceId are sold online; the server re-checks every price before checkout.
const offers: Offer[] = [
  { key: "free", audience: "individual", name: "Free", price: "$0", period: "no subscription", description: "5 free Ask Lee questions to try it out, no card needed. After that, start a Premium trial to keep asking." },
  { key: "premium", audience: "individual", name: "Premium", price: "$9.99", period: "per month", description: "For people handling their own legal matter: more Ask Lee answers, document drafting and every self-help hub.", priceId: "price_1Sdfqp0QhWGUtGKvcQuWONuB", mode: "subscription", trial: true, trialTerms: "$9.99/month" },
  { key: "document", audience: "individual", name: "Per Document", price: "$5", period: "one-time", description: "One document-generation allowance. Not a subscription and no free trial.", priceId: "price_1SckVt0QhWGUtGKvl9YdmQqk", mode: "payment" },
  { key: "solo", audience: "firm", name: "Solo", price: "$29", period: "per month", description: "The firm workspace for one attorney or paralegal: case files, client portal, AI drafting, billing and trust accounting. 1 seat; staff access needs Firm or Enterprise.", priceId: "price_1UVwxE0QhWGUtGKv3tjz0A3I", mode: "subscription", trial: true, trialTerms: "$29/month" },
  { key: "firm", audience: "firm", name: "Firm", price: "$99", period: "per month", description: "Everything in Solo for your team. Includes 3 seats; add extra seats for $25/seat/month.", priceId: "price_1SckV70QhWGUtGKvvg1tH7lu", mode: "subscription", trial: true, trialTerms: "$99/month", monthlyCents: 9900, includedSeats: 3, extraSeats: true },
  { key: "enterprise", audience: "firm", name: "Enterprise", price: "$299", period: "per month", description: "Everything in Firm for larger teams. Includes 10 seats; add extra seats for $25/seat/month.", priceId: "price_1UVwxL0QhWGUtGKvpqH8gbUR", mode: "subscription", trial: true, trialTerms: "$299/month", monthlyCents: 29900, includedSeats: 10, extraSeats: true },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  // Plans whose free trial the server refused (account already had a subscription): offer paid signup instead.
  const [noTrial, setNoTrial] = useState<Set<string>>(() => new Set());
  const [extraSeats, setExtraSeats] = useState<Record<string, number>>({});
  const seatsFor = (offer: Offer) => (offer.extraSeats ? extraSeats[offer.key] ?? 0 : 0);
  const termsFor = (offer: Offer) => offer.monthlyCents ? monthlyTerms(offer.monthlyCents, seatsFor(offer)) : offer.trialTerms ?? offer.price;
  const busy = useRef(false);
  const navigate = useNavigate();
  const enabled = arePaymentsEnabled();
  const [searchParams] = useSearchParams();
  const selectedPlan = searchParams.get("plan");

  // Coming back from sign-up with ?plan=…: bring that plan into view. Checkout still needs a click.
  useEffect(() => {
    if (selectedPlan) document.getElementById(`plan-${selectedPlan}`)?.scrollIntoView({ block: "center" });
  }, [selectedPlan]);

  async function checkout(offer: Offer) {
    if (busy.current || !enabled || !offer.priceId || !offer.mode) return;
    busy.current = true;
    setLoading(offer.key);
    setErrorMessage("");
    const useTrial = offer.trial === true && !noTrial.has(offer.key);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        navigate(`/signup?returnTo=${encodeURIComponent(`/pricing?plan=${offer.key}`)}`);
        return;
      }
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: offer.priceId, mode: offer.mode, trial: useTrial, ...(seatsFor(offer) > 0 ? { extraSeats: seatsFor(offer) } : {}) },
      });
      if (error || typeof data?.error === "string") {
        const failure = await readCheckoutError(error, data);
        if (failure.trialUnavailable && useTrial) {
          setNoTrial((current) => new Set(current).add(offer.key));
          throw new Error(`${failure.message} You can still subscribe to ${offer.name} at ${termsFor(offer)} using the updated button.`);
        }
        throw new Error(failure.message);
      }
      if (typeof data?.url !== "string") throw new Error("Checkout did not return a payment URL.");
      const destination = parseStripeCheckoutUrl(data.url);
      if (!destination) throw new Error("The payment redirect could not be verified. Contact support.");
      window.location.assign(destination.href);
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : "Checkout is unavailable. Please try again.");
    } finally {
      busy.current = false;
      setLoading(null);
    }
  }

  const renderOffer = (offer: Offer) => (
    <article
      key={offer.key}
      id={`plan-${offer.key}`}
      data-active={selectedPlan === offer.key ? "true" : undefined}
      className={cn("metal-card rounded-3xl p-6 flex flex-col min-w-0 scroll-mt-24")}
    >
      <h3 className="font-display text-2xl font-bold">{offer.name}</h3>
      <p className="mt-3"><span className="text-4xl font-bold">{offer.price}</span> <span className="text-sm text-[hsl(218_22%_30%)]">{offer.period}</span></p>
      <p className="mt-4 text-sm flex-1">{offer.description}</p>
      {offer.extraSeats && (
        <label className="mt-4 flex items-center justify-between gap-3 text-sm">
          <span>Extra seats <span className="text-xs text-[hsl(218_22%_30%)]">($25/seat/month)</span></span>
          <input
            type="number" min={0} max={MAX_EXTRA_SEATS} step={1} inputMode="numeric"
            aria-label={`Extra seats for ${offer.name}`}
            className="w-20 rounded-md border border-input bg-white/80 px-2 py-1 text-right"
            value={seatsFor(offer)}
            onChange={(event) => {
              const next = Math.min(MAX_EXTRA_SEATS, Math.max(0, Math.floor(Number(event.target.value) || 0)));
              setExtraSeats((current) => ({ ...current, [offer.key]: next }));
            }}
          />
        </label>
      )}
      {offer.extraSeats && seatsFor(offer) > 0 && (
        <p className="mt-2 text-xs text-[hsl(218_22%_30%)]">Total: {termsFor(offer)} for {(offer.includedSeats ?? 0) + seatsFor(offer)} seats.</p>
      )}
      {offer.trial && offer.trialTerms && !noTrial.has(offer.key) && (
        <p className="mt-4 text-xs text-[hsl(218_22%_30%)]">First subscription only: 7 days free, then {termsFor(offer)} plus applicable taxes until canceled. A payment method is required; cancel before the trial ends to avoid the first charge.</p>
      )}
      <div className="mt-5">
        {offer.key === "free" ? (
          <Button asChild variant="outline" className="w-full bg-white/70"><Link to="/signup">Create a free account</Link></Button>
        ) : offer.contact ? (
          <Button asChild variant="outline" className="w-full bg-white/70"><a href={SALES_MAILTO}>Join the waitlist</a></Button>
        ) : (
          <Button
            className={cn("w-full", selectedPlan === offer.key || offer.key === "firm" || offer.key === "premium" ? "gold-tile border-0 font-semibold" : "bg-white/70")}
            variant={selectedPlan === offer.key || offer.key === "firm" || offer.key === "premium" ? "default" : "outline"}
            disabled={!enabled || loading !== null}
            onClick={() => void checkout(offer)}
            aria-busy={loading === offer.key}
          >
            {loading === offer.key && <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />}
            {!enabled ? "Checkout currently unavailable" : loading === offer.key ? "Opening checkout…" : offer.trial && noTrial.has(offer.key) ? `Subscribe for ${termsFor(offer)}` : offer.trial ? "Start 7-day free trial" : "Buy one document"}
          </Button>
        )}
      </div>
    </article>
  );

  return (
    <Layout>
      <div className="hub-theme hub-bg text-foreground">
        <section className="container mx-auto px-4 py-12 sm:py-16 max-w-6xl">
          <header className="text-center max-w-3xl mx-auto mb-10">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Simple pricing</h1>
            <p className="text-muted-foreground">Start free with Lee. Upgrade when you need more, or set up your firm.</p>
          </header>
          {errorMessage && <div role="alert" className="rounded-xl border border-destructive bg-white/80 p-4 mb-6 text-sm">{errorMessage} <a href="mailto:support@legallyai.ai" className="underline">Contact support</a></div>}
          <h2 className="font-display text-2xl font-bold mb-4">For individuals</h2>
          <div className="grid gap-5 md:grid-cols-3">{offers.filter((o) => o.audience === "individual").map(renderOffer)}</div>
          <h2 id="firm-plans" className="font-display text-2xl font-bold mt-12 mb-4">For law firms</h2>
          <div className="grid gap-5 md:grid-cols-3">{offers.filter((o) => o.audience === "firm").map(renderOffer)}</div>
          <footer className="mt-10 max-w-3xl mx-auto space-y-4 text-sm text-muted-foreground">
            <p>Prices in USD before tax. Checkout is handled securely by Stripe.</p>
            <p>LegallyAI provides AI-generated drafts and general legal information, not legal advice. Outputs may be inaccurate or unsuitable for your jurisdiction. Have a qualified attorney review documents before relying on them.</p>
            <p>Review the <Link to="/terms" className="underline">Terms of Service</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>. For billing questions or refund requests, email <a href="mailto:support@legallyai.ai" className="underline">support@legallyai.ai</a>. Refunds are reviewed case by case.</p>
          </footer>
        </section>
      </div>
    </Layout>
  );
}
