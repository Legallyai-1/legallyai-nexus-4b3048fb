import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedAIHead } from "@/components/ui/AnimatedAIHead";
import { FuturisticBackground } from "@/components/ui/FuturisticBackground";
import AdBanner from "@/components/ads/AdBanner";
import AdContainer from "@/components/ads/AdContainer";
import AdMobBanner, { ADMOB_AD_UNITS } from "@/components/ads/AdMobBanner";
import { 
  Scale, Sparkles, FileText, MessageSquare, Heart, Shield, 
  Briefcase, GraduationCap, Users, Gavel, Car, Building2,
  Home, Zap, Star, ArrowRight, Check
} from "lucide-react";

const hubs = [
  { id: "chat", name: "Lee Legal AI", icon: MessageSquare, color: "cyan", path: "/chat", description: "General legal assistant" },
  { id: "custody", name: "CustodiAI", icon: Heart, color: "purple", path: "/custody", description: "Child custody specialist" },
  { id: "marriage", name: "MaryAI", icon: Heart, color: "pink", path: "/marriage-divorce", description: "Marriage & divorce expert" },
  { id: "defense", name: "DefendrAI", icon: Gavel, color: "rose", path: "/tickets-defense", description: "Criminal defense" },
  { id: "dui", name: "DriveSafeAI", icon: Car, color: "orange", path: "/dui-hub", description: "DUI defense specialist" },
  { id: "probation", name: "Freedom AI", icon: Users, color: "green", path: "/probation-parole", description: "Probation & parole guide" },
  { id: "will", name: "LegacyAI", icon: Home, color: "blue", path: "/will-hub", description: "Wills & estate planning" },
  { id: "workplace", name: "WorkAI", icon: Building2, color: "orange", path: "/workplace-legal-aid", description: "Employment rights" },
];

const features = [
  { title: "AI Document Generation", description: "Create legal documents instantly with AI", icon: FileText },
  { title: "Legal Chat Assistant", description: "Get answers to your legal questions 24/7", icon: MessageSquare },
  { title: "Court Prep Tools", description: "Prepare for hearings with simulations", icon: Gavel },
  { title: "Law Firm Management", description: "Complete practice management suite", icon: Briefcase },
];

const pricingTiers = [
  { 
    name: "Free", 
    price: "$0", 
    period: "forever",
    features: ["Unlimited AI Chat", "1 Document/Day", "Email Support"],
    cta: "Get Started",
    path: "/signup",
    popular: false
  },
  { 
    name: "Premium", 
    price: "$9.99", 
    period: "/month",
    features: ["Unlimited Documents", "All AI Hubs", "Priority Support", "Document Templates"],
    cta: "Upgrade Now",
    path: "/pricing",
    popular: true
  },
  { 
    name: "Pro (Lawyers)", 
    price: "$99", 
    period: "/month",
    features: ["Everything in Premium", "Firm Management", "Client Portal", "Team Access"],
    cta: "Start Trial",
    path: "/pricing",
    popular: false
  },
];

export default function Index() {
  return (
    <Layout>
      <FuturisticBackground>
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center px-4 py-20">
          <div className="container mx-auto text-center max-w-5xl">
            {/* Badge */}
            <Badge className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30 mb-6 animate-fade-in">
              <Sparkles className="w-3 h-3 mr-1" /> AI-Powered Legal Intelligence
            </Badge>
            
            {/* AI Head */}
            <div className="flex justify-center mb-8 animate-fade-in" style={{ animationDelay: "100ms" }}>
              <AnimatedAIHead variant="cyan" size="lg" />
            </div>
            
            {/* Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6 animate-fade-in" style={{ animationDelay: "200ms" }}>
              <span className="text-foreground">Your AI </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-purple">
                Legal Assistant
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: "300ms" }}>
              Generate legal documents, get instant answers, and access specialized AI assistants for every legal need. Free chat, premium features.
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "400ms" }}>
              <Link to="/chat">
                <Button size="lg" variant="neon" className="text-lg px-8 py-6">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Start Free Chat
                </Button>
              </Link>
              <Link to="/generate">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-neon-gold/50 text-neon-gold hover:bg-neon-gold/10">
                  <FileText className="mr-2 h-5 w-5" />
                  Generate Document
                </Button>
              </Link>
            </div>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-4 mt-8 animate-fade-in" style={{ animationDelay: "500ms" }}>
              <Badge variant="outline" className="text-muted-foreground">
                <Check className="w-3 h-3 mr-1 text-neon-green" /> 50,000+ Documents Generated
              </Badge>
              <Badge variant="outline" className="text-muted-foreground">
                <Star className="w-3 h-3 mr-1 text-neon-gold" /> 4.9/5 User Rating
              </Badge>
              <Badge variant="outline" className="text-muted-foreground">
                <Shield className="w-3 h-3 mr-1 text-neon-cyan" /> Secure & Private
              </Badge>
            </div>
          </div>
        </section>

        {/* Ad Banner */}
        <AdContainer position="inline" className="container mx-auto px-4 mb-8">
          <AdBanner slot="1234567890" format="horizontal" />
        </AdContainer>
        <AdMobBanner adUnitId={ADMOB_AD_UNITS.HOME_BANNER} size="banner" className="mb-4" />

        {/* AI Hubs Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <Badge className="bg-neon-purple/20 text-neon-purple border-neon-purple/30 mb-4">
                <Zap className="w-3 h-3 mr-1" /> 15+ Specialized AI Assistants
              </Badge>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                AI Hubs for Every Legal Need
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Each hub is rated 10/10 against industry leaders. Choose your specialized assistant.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {hubs.map((hub, i) => (
                <Link
                  key={hub.id}
                  to={hub.path}
                  className="group glass-card p-5 rounded-2xl border border-border/50 hover:border-neon-cyan/50 hover:shadow-glow-sm transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-xl bg-neon-${hub.color}/20`}>
                      <hub.icon className={`h-5 w-5 text-neon-${hub.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{hub.name}</h3>
                      <p className="text-xs text-muted-foreground">{hub.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30 text-xs">
                      <Star className="w-2 h-2 mr-1" /> 10/10
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-neon-cyan group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Link to="/ai-assistants">
                <Button variant="outline" size="lg">
                  View All AI Assistants <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-background/50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Everything You Need
              </h2>
              <p className="text-muted-foreground">
                Comprehensive legal tools powered by advanced AI
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, i) => (
                <div 
                  key={i}
                  className="glass-card p-6 rounded-2xl text-center animate-fade-in"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="inline-flex p-3 rounded-xl bg-neon-cyan/20 mb-4">
                    <feature.icon className="h-6 w-6 text-neon-cyan" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <Badge className="bg-neon-gold/20 text-neon-gold border-neon-gold/30 mb-4">
                Simple Pricing
              </Badge>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Start Free, Upgrade When Ready
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {pricingTiers.map((tier, i) => (
                <div 
                  key={tier.name}
                  className={`glass-card p-6 rounded-2xl relative animate-fade-in ${
                    tier.popular ? "border-2 border-neon-cyan shadow-glow" : "border border-border/50"
                  }`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {tier.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-neon-cyan text-background">
                      Most Popular
                    </Badge>
                  )}
                  <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    <span className="text-muted-foreground">{tier.period}</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-neon-green" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link to={tier.path}>
                    <Button 
                      className="w-full" 
                      variant={tier.popular ? "neon" : "outline"}
                    >
                      {tier.cta}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <div className="glass-card p-12 rounded-3xl border border-neon-cyan/30">
              <AnimatedAIHead variant="cyan" size="lg" className="mx-auto mb-6" />
              <h2 className="text-3xl font-display font-bold mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-muted-foreground mb-8">
                Join thousands using AI-powered legal assistance. Free chat, no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/chat">
                  <Button size="lg" variant="neon">
                    <MessageSquare className="mr-2" />
                    Start Free Chat
                  </Button>
                </Link>
                <Link to="/ai-assistants">
                  <Button size="lg" variant="outline">
                    Explore AI Hubs
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Ad */}
        <AdContainer position="bottom" className="container mx-auto px-4 mb-8">
          <AdBanner slot="0987654321" format="horizontal" />
        </AdContainer>
      </FuturisticBackground>
    </Layout>
  );
}
