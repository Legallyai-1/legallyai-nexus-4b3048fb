import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { 
  Check, Star, Zap, Crown, Building2, ArrowRight, Loader2 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Stripe price IDs
const STRIPE_PRICES = {
  pro: "price_1SckV70QhWGUtGKvvg1tH7lu", // $99/month subscription
  document: "price_1SckVt0QhWGUtGKvl9YdmQqk", // $5 per document
};

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Try LegallyAI with basic features",
    features: [
      "1 document per day",
      "Basic AI chat",
      "Document previews",
      "Email support",
    ],
    cta: "Start Free",
    href: "/signup",
    popular: false,
    icon: Zap,
    priceId: null,
    mode: null,
  },
  {
    name: "Per Document",
    price: "$5",
    period: "per document",
    description: "Pay only for what you need",
    features: [
      "Professional legal documents",
      "Download as PDF",
      "All document types",
      "State-specific templates",
      "No subscription required",
    ],
    cta: "Buy Document",
    href: null,
    popular: false,
    icon: Star,
    priceId: STRIPE_PRICES.document,
    mode: "payment",
  },
  {
    name: "Pro - Lawyers",
    price: "$99",
    period: "per month",
    description: "Full law firm management suite",
    features: [
      "Unlimited documents",
      "AI legal assistant",
      "Client portal access",
      "Case management",
      "Time tracking",
      "Invoicing system",
      "Virtual consultations",
      "Priority support",
    ],
    cta: "Go Pro",
    href: null,
    popular: true,
    icon: Crown,
    priceId: STRIPE_PRICES.pro,
    mode: "subscription",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    description: "For large law firms",
    features: [
      "Everything in Pro",
      "Unlimited users",
      "SSO integration",
      "Custom integrations",
      "White-label options",
      "SLA guarantee",
      "Account manager",
    ],
    cta: "Contact Sales",
    href: "mailto:sales@legallyai.ai",
    popular: false,
    icon: Building2,
    priceId: null,
    mode: null,
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCheckout = async (priceId: string, mode: string, planName: string) => {
    setLoading(planName);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Login Required",
          description: "Please log in to purchase a subscription",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId, mode },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout Error",
        description: error.message || "Failed to start checkout",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Layout>
      {/* Header */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Start free, upgrade when you need more. Pay per document or subscribe for unlimited access.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-background -mt-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={cn(
                  "relative p-6 rounded-2xl border transition-all duration-300",
                  plan.popular
                    ? "bg-primary text-primary-foreground border-legal-gold shadow-lg scale-105"
                    : "bg-card text-foreground border-border shadow-card hover:border-legal-gold/50"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-legal-gold text-legal-navy text-sm font-semibold">
                    Best Value
                  </div>
                )}

                <div className="mb-6">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                    plan.popular ? "bg-legal-gold/20" : "bg-legal-gold/10"
                  )}>
                    <plan.icon className="h-6 w-6 text-legal-gold" />
                  </div>
                  <h3 className="font-display text-2xl font-bold">{plan.name}</h3>
                  <p className={cn(
                    "text-sm mt-1",
                    plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}>
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  <span className="font-display text-4xl font-bold">{plan.price}</span>
                  <span className={cn(
                    "text-sm ml-2",
                    plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}>
                    {plan.period}
                  </span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <Check className="h-5 w-5 shrink-0 mt-0.5 text-legal-gold" />
                      <span className={cn(
                        "text-sm",
                        plan.popular ? "text-primary-foreground/90" : "text-foreground"
                      )}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {plan.priceId ? (
                  <Button
                    variant={plan.popular ? "hero" : "outline"}
                    className={cn("w-full", !plan.popular && "border-2")}
                    onClick={() => handleCheckout(plan.priceId!, plan.mode!, plan.name)}
                    disabled={loading === plan.name}
                  >
                    {loading === plan.name ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {plan.cta}
                    {loading !== plan.name && <ArrowRight className="h-4 w-4 ml-2" />}
                  </Button>
                ) : (
                  <Link to={plan.href || "/signup"}>
                    <Button
                      variant={plan.popular ? "hero" : "outline"}
                      className={cn("w-full", !plan.popular && "border-2")}
                    >
                      {plan.cta}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Platform Fee Notice */}
          <p className="text-center text-sm text-muted-foreground mt-8 max-w-2xl mx-auto">
            By purchasing, you agree to our{" "}
            <Link to="/terms" className="text-primary underline">Terms of Service</Link>
            {" "}including the 1% platform fee on law firm revenue generated through the platform.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                q: "Is LegallyAI legally accurate?",
                a: "LegallyAI is trained on current US law (2025) and generates legally-sound documents. However, we recommend consulting with a licensed attorney before signing any legal document.",
              },
              {
                q: "Can I get a refund?",
                a: "Yes! We offer a 30-day money-back guarantee on all paid plans. If you're not satisfied, contact support for a full refund.",
              },
              {
                q: "What's included in the Pro plan?",
                a: "Pro includes unlimited document generation, full AI chat, case management, client portal, time tracking, invoicing, virtual consultations, and priority support.",
              },
              {
                q: "What document types are supported?",
                a: "We support 50+ document types including NDAs, contracts, wills, custody agreements, LLCs, leases, and more. New templates are added regularly.",
              },
            ].map((faq, i) => (
              <div key={i} className="p-6 rounded-xl bg-card border border-border">
                <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                <p className="text-muted-foreground text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join thousands who trust LegallyAI for their legal documents.
          </p>
          <Link to="/signup">
            <Button variant="hero" size="xl">
              Start Free Today
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
