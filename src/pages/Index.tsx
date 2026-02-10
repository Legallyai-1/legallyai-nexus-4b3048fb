import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AnimatedAIHead } from "@/components/ui/AnimatedAIHead";
import { FuturisticBackground } from "@/components/ui/FuturisticBackground";
import { ScrollArea } from "@/components/ui/scroll-area";
import AdBanner from "@/components/ads/AdBanner";
import AdContainer from "@/components/ads/AdContainer";
import AdMobBanner, { ADMOB_AD_UNITS } from "@/components/ads/AdMobBanner";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Scale, Sparkles, FileText, MessageSquare, Heart, Shield, 
  Briefcase, GraduationCap, Users, Gavel, Car, Building2,
  Home, Zap, Star, ArrowRight, Check, Send, Loader2, Mic, Brain
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

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function Index() {
  const navigate = useNavigate();
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("legal-chat", {
        body: {
          messages: [...chatMessages, userMessage].map(m => ({ role: m.role, content: m.content })),
          stream: false,
        },
      });

      if (error) throw error;

      const responseContent = data?.response || data?.text || "I'm here to help with your legal questions. How can I assist you today?";
      setChatMessages(prev => [...prev, { role: "assistant", content: responseContent }]);
    } catch (error: any) {
      console.error("Chat error:", error);
      toast.error("Unable to get response. Please try again.");
      setChatMessages(prev => [...prev, { role: "assistant", content: "I apologize, but I'm having trouble connecting. Please try again or visit our full chat page for more options." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <FuturisticBackground>
        {/* Hero Section with Ask Lee */}
        <section className="relative min-h-[90vh] flex items-center justify-center px-4 py-12">
          <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Left - Hero Content */}
              <div className="text-center lg:text-left">
                <Badge className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30 mb-6 animate-fade-in">
                  <Sparkles className="w-3 h-3 mr-1" /> AI-Powered Legal Intelligence
                </Badge>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
                  <span className="text-foreground">Your AI </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-purple">
                    Legal Assistant
                  </span>
                </h1>
                
                <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
                  Generate legal documents, get instant answers, and access specialized AI assistants for every legal need. Free chat, premium features.
                </p>
                
                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in" style={{ animationDelay: "300ms" }}>
                  <Link to="/generate">
                    <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-neon-gold/50 text-neon-gold hover:bg-neon-gold/10">
                      <FileText className="mr-2 h-5 w-5" />
                      Generate Document
                    </Button>
                  </Link>
                  <Link to="/ai-assistants">
                    <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                      <Brain className="mr-2 h-5 w-5" />
                      All AI Hubs
                    </Button>
                  </Link>
                </div>
                
                {/* Trust Badges */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-8 animate-fade-in" style={{ animationDelay: "400ms" }}>
                  <Badge variant="outline" className="text-muted-foreground">
                    <Check className="w-3 h-3 mr-1 text-neon-green" /> 50,000+ Documents Generated
                  </Badge>
                  <Badge variant="outline" className="text-muted-foreground">
                    <Star className="w-3 h-3 mr-1 text-neon-gold" /> 4.9/5 User Rating
                  </Badge>
                </div>
              </div>

              {/* Right - Ask Lee Chat Panel */}
              <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
                <div className="glass-card rounded-2xl border-2 border-neon-cyan/40 shadow-[0_0_40px_hsl(var(--neon-cyan)/0.3)] overflow-hidden">
                  {/* Chat Header */}
                  <div className="bg-gradient-to-r from-neon-cyan/20 via-neon-purple/20 to-neon-pink/20 p-4 border-b border-border/30">
                    <div className="flex items-center gap-3">
                      <AnimatedAIHead variant="cyan" size="md" />
                      <div>
                        <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                          Ask Lee
                          <Badge className="bg-neon-green/20 text-neon-green text-xs">Free</Badge>
                        </h3>
                        <p className="text-xs text-muted-foreground">Your AI Legal Assistant • Ask anything</p>
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <ScrollArea className="h-[280px] p-4" ref={scrollRef}>
                    {chatMessages.length === 0 ? (
                      <div className="text-center py-8">
                        <Brain className="h-12 w-12 text-neon-cyan/50 mx-auto mb-3" />
                        <p className="text-foreground text-sm mb-2">
                          Hi! I'm Lee, your AI legal assistant.
                        </p>
                        <p className="text-xs text-muted-foreground mb-4">
                          Ask me about legal documents, rights, or any legal question.
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {["Draft an NDA", "Custody rights", "Tenant rights"].map((suggestion) => (
                            <Button
                              key={suggestion}
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => setChatInput(suggestion)}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {chatMessages.map((msg, i) => (
                          <div
                            key={i}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[85%] rounded-xl px-4 py-2 ${
                                msg.role === "user"
                                  ? "bg-neon-cyan/20 text-foreground"
                                  : "bg-muted/50 text-foreground"
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            </div>
                          </div>
                        ))}
                        {isLoading && (
                          <div className="flex justify-start">
                            <div className="bg-muted/50 rounded-xl px-4 py-2">
                              <Loader2 className="h-4 w-4 animate-spin text-neon-cyan" />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </ScrollArea>

                  {/* Chat Input */}
                  <div className="p-4 border-t border-border/30 bg-background/50">
                    <div className="flex gap-2">
                      <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        placeholder="Ask Lee about any legal question..."
                        className="flex-1"
                      />
                      <Button
                        variant="neon"
                        size="icon"
                        onClick={handleSendMessage}
                        disabled={isLoading || !chatInput.trim()}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground">
                        Free unlimited chat • No signup required
                      </p>
                      <Link to="/chat" className="text-xs text-neon-cyan hover:underline">
                        Full Chat →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
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
                Industry-leading AI assistants for all your legal needs. Choose your specialized assistant.
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
                      <Star className="w-2 h-2 mr-1" /> Premium
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
