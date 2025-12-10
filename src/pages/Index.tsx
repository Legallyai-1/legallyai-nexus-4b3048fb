import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { 
  Scale, FileText, MessageSquare, Users, Shield, Zap, 
  CheckCircle, ArrowRight, Star, Clock, Lock, Sparkles 
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Document Generator",
    description: "Generate NDAs, contracts, wills, and 50+ legal documents instantly with AI precision.",
    href: "/generate",
  },
  {
    icon: MessageSquare,
    title: "AI Legal Chat",
    description: "Get instant answers to your legal questions from our AI trained on US law.",
    href: "/chat",
  },
  {
    icon: Users,
    title: "Custody Helper",
    description: "Navigate child custody with AI-guided questionnaires and document generation.",
    href: "/custody",
  },
  {
    icon: Scale,
    title: "For Lawyers",
    description: "Professional tools for attorneys to streamline document drafting and research.",
    href: "/lawyers",
  },
];

const benefits = [
  { icon: Clock, text: "Documents in under 60 seconds" },
  { icon: Lock, text: "Bank-level encryption" },
  { icon: Shield, text: "US Law 2025 compliant" },
  { icon: Zap, text: "AI-powered accuracy" },
];

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Small Business Owner",
    content: "LegallyAI saved me thousands in legal fees. Generated my entire LLC operating agreement in minutes.",
    rating: 5,
  },
  {
    name: "James Cooper",
    role: "Freelance Developer",
    content: "Finally, contracts I can trust without hiring an expensive lawyer for every project.",
    rating: 5,
  },
  {
    name: "Maria Rodriguez",
    role: "Real Estate Agent",
    content: "The custody helper feature helped my clients navigate their divorce paperwork seamlessly.",
    rating: 5,
  },
];

export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        {/* Background Pattern */}
        <div className="absolute inset-0 legal-pattern opacity-30" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-legal-gold/10 to-transparent" />
        
        <div className="container mx-auto px-4 py-24 lg:py-32 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-legal-gold/10 border border-legal-gold/30 mb-8 animate-fade-up">
              <Sparkles className="h-4 w-4 text-legal-gold" />
              <span className="text-sm font-medium text-legal-gold">Trusted by 50,000+ Users</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Your AI-Powered{" "}
              <span className="text-legal-gold">Legal Assistant</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "0.2s" }}>
              Generate professional legal documents in seconds. NDAs, contracts, 
              wills, custody agreements, and more – powered by AI trained on US law.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <Link to="/generate">
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  Generate Document Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/chat">
                <Button variant="outline" size="xl" className="w-full sm:w-auto border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  Try AI Chat
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 animate-fade-up" style={{ animationDelay: "0.4s" }}>
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-primary-foreground/70">
                  <benefit.icon className="h-4 w-4 text-legal-gold" />
                  <span>{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need for Legal Documents
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From simple contracts to complex custody agreements, our AI handles it all.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <Link
                key={i}
                to={feature.href}
                className="group p-6 rounded-2xl bg-card border border-border shadow-card hover:shadow-lg hover:border-legal-gold/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-legal-gold/10 flex items-center justify-center mb-4 group-hover:bg-legal-gold/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-legal-gold" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
                <div className="mt-4 flex items-center text-legal-gold font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Get Started</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Legal Documents in 3 Simple Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Describe Your Need", desc: "Tell our AI what legal document you need in plain English." },
              { step: "2", title: "AI Generates", desc: "Our AI creates a professional, legally-accurate document instantly." },
              { step: "3", title: "Download & Use", desc: "Review, customize, and download your document as PDF or Word." },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-full bg-legal-gold text-legal-navy text-2xl font-bold flex items-center justify-center mx-auto mb-4 shadow-lg">
                  {item.step}
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Trusted by Thousands
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="p-6 rounded-2xl bg-card border border-border shadow-card">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} className="h-5 w-5 fill-legal-gold text-legal-gold" />
                  ))}
                </div>
                <p className="text-foreground mb-4">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Your Legal Document?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
            Join 50,000+ users who trust LegallyAI for their legal document needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/generate">
              <Button variant="hero" size="xl">
                Start Free – No Card Required
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline" size="xl" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
