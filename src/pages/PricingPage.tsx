import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { 
  Check, Star, Zap, Crown, Building2, ArrowRight, Loader2, Sparkles 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FuturisticBackground } from "@/components/ui/FuturisticBackground";
import { AnimatedAIHead } from "@/components/ui/AnimatedAIHead";

// Stripe price IDs
const STRIPE_PRICES = {
  premium: "price_1Sdfqp0QhWGUtGKvcQuWONuB", // $9.99/month for normal users
  pro: "price_1SckV70QhWGUtGKvvg1tH7lu", // $99/month for lawyers
  document: "price_1SckVt0QhWGUtGKvl9YdmQqk", // $5 per document
};

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Try all AI assistants free",
    features: [
      "Unlimited AI chat access",
      "All 10+ AI assistants",
      "1 document per day",
      "Document previews",
      "Email support",
    ],
    cta: "Start Free",
    href: "/signup",
    popular: false,
    icon: Zap,
    priceId: null,
    mode: null,
    color: "cyan",
  },
  {
    name: "Premium",
    price: "$9.99",
    period: "per month",
    description: "Full access for individuals",
    features: [
      "Everything in Free, plus:",
      "Unlimited document generation",
      "Download as PDF",
      "All document types",
      "State-specific templates",
      "Priority email support",
    ],
    cta: "Subscribe Now",
    href: null,
    popular: true,
    icon: Star,
    priceId: STRIPE_PRICES.premium,
    mode: "subscription",
    color: "green",
  },
  {
    name: "Per Document",
    price: "$5",
    period: "one-time",
    description: "Pay only for what you need",
    features: [
      "Single professional document",
      "Download as PDF",
      "All document types",
      "State-specific templates",
      "No subscription required",
    ],
    cta: "Buy Document",
    href: null,
    popular: false,
    icon: Sparkles,
    priceId: STRIPE_PRICES.document,
    mode: "payment",
    color: "blue",
  },
  {
    name: "Pro - Lawyers",
    price: "$99",
    period: "per month",
    description: "Full law firm management suite",
    features: [
      "Everything in Premium, plus:",
      "Client portal access",
      "Case management",
      "Time tracking & billing",
      "Invoicing system",
      "Virtual consultations",
      "Dedicated support",
    ],
    cta: "Subscribe Now",
    href: null,
    popular: false,
    icon: Crown,
    priceId: STRIPE_PRICES.pro,
    mode: "subscription",
    color: "orange",
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
    color: "purple",
  },
];

const colorClasses: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  cyan: {
    bg: "bg-neon-cyan/10",
    border: "border-neon-cyan/30",
    text: "text-neon-cyan",
    glow: "shadow-glow-sm",
  },
  green: {
    bg: "bg-neon-green/10",
    border: "border-neon-green/50",
    text: "text-neon-green",
    glow: "shadow-glow-md",
  },
  blue: {
    bg: "bg-neon-blue/10",
    border: "border-neon-blue/30",
    text: "text-neon-blue",
    glow: "hover:shadow-glow-md",
  },
  orange: {
    bg: "bg-section-premium/10",
    border: "border-section-premium/50",
    text: "text-section-premium",
    glow: "shadow-glow-md",
  },
  purple: {
    bg: "bg-neon-purple/10",
    border: "border-neon-purple/30",
    text: "text-neon-purple",
    glow: "hover:shadow-glow-purple",
  },
};

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCheckout = async (priceId: string, mode: string, planName: string) => {
    setLoading(planName);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Login Required",
          description: "Please sign in first",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Determine tier from plan name
      const tier = planName.toLowerCase().replace(' - lawyers', '');
      
      // Parse amount from price string (remove $ and convert to number)
      const amount = parseFloat(plans.find(p => p.name === planName)?.price.replace('$', '') || '0');
      
      // Call new process-payment function (database-only)
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: { 
          tier: tier,
          amount: amount,
          payment_method: 'demo' // In production, integrate real payment gateway
        }
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Successfully upgraded to ${planName}!`,
      });
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Subscription error:", error);
      toast({
        title: "Subscription Error",
        description: error.message || "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Layout>
      <FuturisticBackground variant="dense">
        {/* Header */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            {/* Animated AI Head */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-section-premium/20 blur-3xl rounded-full scale-150" />
                <AnimatedAIHead variant="orange" size="lg" />
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-section-premium/10 border border-section-premium/30 mb-6">
              <Sparkles className="h-4 w-4 text-section-premium" />
              <span className="text-sm font-medium text-section-premium">Pricing Plans</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Simple, <span className="text-section-premium">Transparent</span> Pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free, upgrade when you need more. Pay per document or subscribe for unlimited access.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-12 -mt-8">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {plans.map((plan, i) => {
                const colors = colorClasses[plan.color];
                return (
                  <div
                    key={i}
                    className={cn(
                      "relative p-6 rounded-2xl glass-card transition-all duration-300",
                      plan.popular
                        ? `${colors.border} ${colors.glow} scale-105`
                        : `border-border/30 hover:${colors.border} ${colors.glow}`
                    )}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-section-premium to-neon-orange text-background text-sm font-semibold">
                        Best Value
                      </div>
                    )}

                    <div className="mb-6">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                        colors.bg
                      )}>
                        <plan.icon className={cn("h-6 w-6", colors.text)} />
                      </div>
                      <h3 className="font-display text-2xl font-bold text-foreground">{plan.name}</h3>
                      <p className="text-sm mt-1 text-muted-foreground">
                        {plan.description}
                      </p>
                    </div>

                    <div className="mb-6">
                      <span className={cn("font-display text-4xl font-bold", plan.popular ? colors.text : "text-foreground")}>
                        {plan.price}
                      </span>
                      <span className="text-sm ml-2 text-muted-foreground">
                        {plan.period}
                      </span>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, j) => (
                        <li key={j} className="flex items-start gap-3">
                          <Check className={cn("h-5 w-5 shrink-0 mt-0.5", colors.text)} />
                          <span className="text-sm text-foreground">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {plan.priceId ? (
                      <Button
                        variant={plan.popular ? "neon" : "glass"}
                        className={cn(
                          "w-full",
                          plan.popular && "bg-gradient-to-r from-section-premium to-neon-orange text-background"
                        )}
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
                          variant={plan.popular ? "neon" : "glass"}
                          className="w-full"
                        >
                          {plan.cta}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Platform Fee Notice */}
            <p className="text-center text-sm text-muted-foreground mt-8 max-w-2xl mx-auto">
              By purchasing, you agree to our{" "}
              <Link to="/terms" className="text-neon-cyan underline hover:text-neon-cyan/80">Terms of Service</Link>
              {" "}including the 1% platform fee on law firm revenue generated through the platform.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl font-bold text-foreground text-center mb-12">
              Frequently Asked <span className="text-neon-cyan">Questions</span>
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
                <div key={i} className="glass-card-hover p-6 rounded-xl">
                  <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="glass-card max-w-2xl mx-auto p-8 rounded-2xl border-neon-cyan/30">
              <h2 className="font-display text-3xl font-bold mb-6 text-foreground">
                Ready to Get <span className="text-neon-cyan">Started?</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
                Join thousands who trust LegallyAI for their legal documents.
              </p>
              <Link to="/signup">
                <Button variant="neon" size="xl">
                  Start Free Today
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </FuturisticBackground>
    </Layout>
  );
}
