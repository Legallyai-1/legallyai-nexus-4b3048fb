import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { 
  Check, Star, Zap, Crown, Building2, ArrowRight 
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  },
  {
    name: "Pro",
    price: "$29",
    period: "one-time",
    description: "Unlock full document access",
    features: [
      "Unlimited documents",
      "Full AI chat access",
      "Download as PDF/Word",
      "All document types",
      "State-specific templates",
      "Priority support",
    ],
    cta: "Get Pro Access",
    href: "/signup?plan=pro",
    popular: true,
    icon: Star,
  },
  {
    name: "Premium",
    price: "$99",
    period: "per month",
    description: "For power users & small firms",
    features: [
      "Everything in Pro",
      "Unlimited AI chat",
      "Custom branding",
      "Document history",
      "Team collaboration",
      "API access",
      "Dedicated support",
    ],
    cta: "Go Premium",
    href: "/signup?plan=premium",
    popular: false,
    icon: Crown,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    description: "For law firms & organizations",
    features: [
      "Everything in Premium",
      "Unlimited users",
      "SSO integration",
      "Custom integrations",
      "White-label options",
      "SLA guarantee",
      "Account manager",
    ],
    cta: "Contact Sales",
    href: "/contact",
    popular: false,
    icon: Building2,
  },
];

export default function PricingPage() {
  return (
    <Layout>
      {/* Header */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Start free, upgrade when you need more. No hidden fees, no subscriptions unless you want them.
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
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                    plan.popular ? "bg-legal-gold/20" : "bg-legal-gold/10"
                  )}>
                    <plan.icon className={cn(
                      "h-6 w-6",
                      plan.popular ? "text-legal-gold" : "text-legal-gold"
                    )} />
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
                      <Check className={cn(
                        "h-5 w-5 shrink-0 mt-0.5",
                        plan.popular ? "text-legal-gold" : "text-legal-gold"
                      )} />
                      <span className={cn(
                        "text-sm",
                        plan.popular ? "text-primary-foreground/90" : "text-foreground"
                      )}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link to={plan.href}>
                  <Button
                    variant={plan.popular ? "hero" : "outline"}
                    className={cn(
                      "w-full",
                      !plan.popular && "border-2"
                    )}
                  >
                    {plan.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
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
                q: "Do you offer team plans?",
                a: "Yes! Our Enterprise plan includes unlimited users and team collaboration features. Contact our sales team for custom pricing.",
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
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
