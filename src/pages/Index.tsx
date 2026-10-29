import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FuturisticBackground } from "@/components/ui/FuturisticBackground";
import { ScrollArea } from "@/components/ui/scroll-area";
import AdContainer from "@/components/ads/AdContainer";
import { AD_SLOTS } from "@/lib/adSlots";
import { streamLegalChat } from "@/lib/legalChat";
import { toast } from "sonner";
import {
  Sparkles, FileText, MessageSquare, Heart, Shield, Briefcase, Users, Gavel, Car, Building2,
  Home, ArrowRight, Check, Send, Loader2, FolderOpen, CalendarClock, Landmark, Lock, ChevronDown,
} from "lucide-react";
import { ChatMarkdown } from "@/components/chat/ChatMarkdown";
import { CompetitorVersusTable } from "@/components/legal/CompetitorVersusTable";
import { ToolLauncher } from "@/components/layout/ToolLauncher";
import { TOOL_ICONS } from "@/components/layout/toolIcons";
import { featuredTools } from "@/lib/toolCatalog";
import { LeeAvatar, GoldWave } from "@/components/brand/LeeAvatar";

const hubs = [
  { id: "chat", name: "Lee Legal AI", icon: MessageSquare, color: "cyan", path: "/chat", description: "General legal assistant" },
  { id: "custody", name: "CustodiAI", icon: Heart, color: "purple", path: "/custody", description: "AI assistant for child custody" },
  { id: "marriage", name: "MaryAI", icon: Heart, color: "pink", path: "/marriage-divorce", description: "AI assistant for marriage & divorce" },
  { id: "defense", name: "DefendrAI", icon: Gavel, color: "rose", path: "/tickets-defense", description: "Criminal defense" },
  { id: "dui", name: "DriveSafeAI", icon: Car, color: "orange", path: "/dui-hub", description: "AI assistant for DUI cases" },
  { id: "probation", name: "Freedom AI", icon: Users, color: "green", path: "/probation-parole", description: "Probation & parole guide" },
  { id: "will", name: "LegacyAI", icon: Home, color: "blue", path: "/will-hub", description: "Wills & estate planning" },
  { id: "workplace", name: "WorkAI", icon: Building2, color: "orange", path: "/workplace-legal-aid", description: "Employment rights" },
];

// The self-help workspace for people handling their own case. All of these are existing features:
// answers saved from chat land in the case file, deadlines become calendar reminders.
const myCases = [
  { title: "Case file", description: "Save Lee's answers, notes and facts in one place", icon: FolderOpen, path: "/cases" },
  { title: "Deadlines", description: "Court dates and reminders on your calendar", icon: CalendarClock, path: "/appointments" },
  { title: "Documents", description: "Draft letters, motions and agreements", icon: FileText, path: "/generate" },
  { title: "Court prep", description: "Find your court and its official forms", icon: Landmark, path: "/court-records" },
];

// Plans match /pricing and /lawyers.
const pricingTiers = [
  { name: "Premium", price: "$9.99", period: "/month", features: ["7-day free trial on your first subscription", "More Ask Lee answers", "Document drafting", "Ad-free experience"], cta: "Start 7-day free trial", path: "/pricing?plan=premium", popular: true, audience: "individual" },
  { name: "Solo", price: "$29", period: "/month", features: [], cta: "", path: "/lawyers#plans", popular: false, audience: "firm" },
  { name: "Firm", price: "$99", period: "/month", features: [], cta: "", path: "/lawyers#plans", popular: false, audience: "firm" },
  { name: "Enterprise", price: "$299", period: "/month", features: [], cta: "", path: "/lawyers#plans", popular: false, audience: "firm" },
];

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function Index() {
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef(crypto.randomUUID());

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
      const { text } = await streamLegalChat({
        hubType: "general",
        sessionId: sessionIdRef.current,
        messages: [...chatMessages, userMessage],
        onDelta: () => {},
      });
      if (!text.trim()) throw new Error("The legal assistant returned an empty response.");
      setChatMessages(prev => [...prev, { role: "assistant", content: text }]);
    } catch (error: any) {
      console.error("Chat error:", error);
      toast.error("Unable to get response. Please try again.");
      setChatMessages(prev => [...prev, { role: "assistant", content: "I apologize, but I'm having trouble connecting. Please try again or visit our full chat page for more options." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const individualTiers = pricingTiers.filter((t) => t.audience === "individual");
  const firmTiers = pricingTiers.filter((t) => t.audience === "firm");

  return (
    <Layout>
      <FuturisticBackground>
        {/* Hero: one promise, two clear paths (people who need help / law firms) + live Ask Lee chat. */}
        <section className="dash-bg relative flex items-center px-4 py-10 sm:py-14 overflow-x-clip">
          <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] gap-8 lg:gap-10 items-center">
              <div className="min-w-0 text-center lg:text-left">
                {/* One Lee only: the big floating Lee lives in the Ask Lee panel (shown on all screen sizes). */}
                <div className="flex items-center justify-center lg:justify-start mb-4">
                  <Badge className="bg-legal-gold/15 text-legal-gold border-legal-gold/40 px-3 py-1 text-xs sm:text-sm">
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" /> Meet Lee, your AI legal partner
                  </Badge>
                </div>

                <h1 className="text-[2rem] leading-tight sm:text-5xl lg:text-[3.4rem] font-display font-bold mb-5 break-words">
                  <span className="text-foreground">Legal help that </span>
                  <span className="gold-text">works for you</span>
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-7">
                  Handling your own case? Lee explains your options in plain English and keeps your case file, deadlines and documents together. Running a practice? One AI workspace from solo attorney to full firm.
                </p>

                <div className="grid sm:grid-cols-2 gap-3 max-w-xl mx-auto lg:mx-0 text-left">
                  <button
                    type="button"
                    onClick={() => document.getElementById("hero-chat-input")?.focus()}
                    className="group rounded-2xl gold-tile p-4 sm:p-5 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-75"><Users className="h-3.5 w-3.5" aria-hidden="true" /> For individuals</span>
                    <span className="mt-1.5 flex items-center justify-between gap-2 font-display text-lg font-bold">Get legal help <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
                    <span className="mt-1 block text-sm opacity-80">5 free questions a day, no sign-up needed</span>
                  </button>
                  <Link
                    to="/lawyers"
                    className="group rounded-2xl silver-tile p-4 sm:p-5 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-75"><Briefcase className="h-3.5 w-3.5" aria-hidden="true" /> For law firms</span>
                    <span className="mt-1.5 flex items-center justify-between gap-2 font-display text-lg font-bold">Explore the firm hub <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
                    <span className="mt-1 block text-sm opacity-80">Solo, firm and enterprise plans</span>
                  </Link>
                </div>

                <ul className="flex flex-wrap justify-center lg:justify-start gap-x-5 gap-y-2 mt-6 text-sm text-muted-foreground">
                  <li className="flex items-center gap-1.5"><Check className="w-4 h-4 text-neon-green" aria-hidden="true" /> Official state court links</li>
                  <li className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-neon-green" aria-hidden="true" /> No names or case numbers needed</li>
                  <li className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-legal-gold" aria-hidden="true" /> Legal information, not legal advice</li>
                </ul>
              </div>

              {/* Ask Lee chat: roomy on phones (chips wrap, full-width input). */}
              <div className="min-w-0">
                <div className="lee-partner rounded-3xl overflow-hidden">
                  <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-white/70">
                    <div className="min-w-0">
                      <h2 className="font-display text-lg font-bold text-foreground flex flex-wrap items-center gap-2">
                        Ask Lee <span className="text-muted-foreground">·</span> <span className="lee-partner-title-accent">AI Partner</span> <Badge className="bg-neon-green/20 text-neon-green text-xs">Free</Badge>
                      </h2>
                      <p className="text-xs text-muted-foreground">Legal information · sign in for your case file</p>
                    </div>
                  </div>

                  {/* Empty state: top padding lives inside the scroll viewport so Lee's float never clips his head. */}
                  <ScrollArea className={chatMessages.length === 0 ? "px-4 pb-4" : "h-[300px] sm:h-[340px] p-4"} ref={scrollRef}>
                    {chatMessages.length === 0 ? (
                      <div className="pt-4 pb-2 text-center flex flex-col items-center">
                        <LeeAvatar heightClass="h-32 sm:h-40" alt="Lee, the LegallyAI assistant" priority />
                        <p className="relative mt-2 font-display text-base font-bold text-foreground">How can I help with your legal situation today?</p>
                        <p className="relative text-xs text-muted-foreground mb-4">Verify deadlines and court rules for your state.</p>
                        <div className="relative flex flex-wrap gap-2 justify-center">
                          {["Custody rights", "Fight a ticket", "Tenant rights", "Draft an NDA"].map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              className="lee-chip"
                              onClick={() => { setChatInput(suggestion); document.getElementById("hero-chat-input")?.focus(); }}
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                        <GoldWave className="mt-4" />
                      </div>
                    ) : (
                      <div className="space-y-4" aria-live="polite">
                        {chatMessages.map((msg, i) => (
                          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[88%] rounded-xl px-4 py-2 ${msg.role === "user" ? "bg-legal-gold/20 text-foreground" : "bg-muted/50 text-foreground"}`}>
                              <ChatMarkdown content={msg.content} />
                            </div>
                          </div>
                        ))}
                        {isLoading && (
                          <div className="flex justify-start">
                            <div className="bg-muted/50 rounded-xl px-4 py-2">
                              <Loader2 className="h-4 w-4 animate-spin text-legal-gold" aria-label="Lee is typing" />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </ScrollArea>

                  <form className="p-3 sm:p-4 border-t border-white/70" onSubmit={(e) => { e.preventDefault(); void handleSendMessage(); }}>
                    <div className="flex gap-2">
                      <Input
                        id="hero-chat-input"
                        aria-label="Ask Lee a legal question"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask a legal question..."
                        className="lee-partner-input h-11 min-w-0 flex-1 rounded-full text-base sm:text-sm"
                      />
                      <Button type="submit" size="icon" className="h-11 w-11 shrink-0 rounded-full gold-tile border-0" disabled={isLoading || !chatInput.trim()} aria-label="Send question">
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-2">
                      <p className="text-xs text-muted-foreground">Free · no credit card</p>
                      <Link to="/chat" className="text-xs font-medium text-legal-gold hover:underline">Open full chat →</Link>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Individuals: the self-help workspace + featured tools. */}
        <section className="py-12 sm:py-16 px-4" aria-labelledby="my-cases-heading">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-legal-gold">For people handling their own case</p>
                <h2 id="my-cases-heading" className="mt-1 text-2xl sm:text-3xl font-display font-bold">Your case, organized</h2>
                <p className="mt-1 text-muted-foreground max-w-2xl">Everything Lee helps you with can be saved to My Cases, with a free account.</p>
              </div>
              <Button asChild variant="outline" className="self-start sm:self-auto border-legal-gold/50 text-legal-gold hover:bg-legal-gold/10">
                <Link to="/cases">Open My Cases <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {myCases.map((item) => (
                <Link key={item.title} to={item.path} className="metal-card rounded-2xl p-4">
                  <span className="metal-icon-well h-10 w-10"><item.icon className="h-5 w-5" aria-hidden="true" /></span>
                  <h3 className="mt-3 font-semibold">{item.title}</h3>
                  <p className="mt-0.5 text-sm text-[hsl(218_22%_30%)]">{item.description}</p>
                </Link>
              ))}
            </div>

            <div className="mt-10 flex items-center justify-between gap-3">
              <h2 className="text-xl sm:text-2xl font-display font-bold">Popular tools</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="hidden sm:inline">All tools</span>
                <ToolLauncher />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
              {featuredTools().map((tool) => {
                const Icon = TOOL_ICONS[tool.icon];
                return (
                  <Link key={tool.path} to={tool.path} className="metal-card rounded-2xl p-4 flex items-start gap-3">
                    <span className="metal-icon-well h-10 w-10 shrink-0"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                    <span className="min-w-0">
                      <span className="block font-semibold leading-tight">{tool.title}</span>
                      <span className="mt-0.5 block text-sm text-[hsl(218_22%_30%)]">{tool.description}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <AdContainer slot={AD_SLOTS.HOME_MID} className="my-8" />

        {/* Topic hubs: every hub is Lee focused on one area of law. */}
        <section className="py-12 sm:py-16 px-4" aria-labelledby="hubs-heading">
          <div className="container mx-auto max-w-6xl">
            <h2 id="hubs-heading" className="text-2xl sm:text-3xl font-display font-bold">Lee&apos;s legal hubs</h2>
            <p className="mt-1 mb-6 text-muted-foreground max-w-2xl">Lee, focused on your situation: custody, defense, work, estate planning and more.</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {hubs.map((hub) => (
                <Link key={hub.id} to={hub.path} className="metal-card group rounded-2xl p-4 flex flex-col justify-between min-h-[112px]">
                  <span className="flex items-start justify-between gap-2">
                    <span className="min-w-0">
                      <span className="block font-display font-bold leading-tight break-words">{hub.name}</span>
                      <span className="mt-1 block text-xs text-[hsl(218_22%_30%)]">{hub.description}</span>
                    </span>
                    <hub.icon className="metal-icon h-5 w-5 shrink-0" aria-hidden="true" />
                  </span>
                  <span className="mt-3 flex items-center gap-1 text-sm font-semibold">Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
                </Link>
              ))}
            </div>
            <div className="text-center mt-6">
              <Button asChild variant="outline"><Link to="/ai-assistants">View all AI assistants <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
            </div>
          </div>
        </section>

        {/* Law firms: short pitch, primary CTA goes to the firm landing page. */}
        <AdContainer slot={AD_SLOTS.HOME_LOWER} size="rectangle" className="my-8" />

        <section className="py-12 sm:py-16 px-4" aria-labelledby="firms-heading">
          <div className="container mx-auto max-w-6xl">
            <div className="glass-card rounded-3xl p-6 sm:p-10 border border-legal-gold/30">
              <div className="grid lg:grid-cols-[minmax(0,1fr)_auto] gap-6 items-center">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-legal-gold">For law firms</p>
                  <h2 id="firms-heading" className="mt-1 text-2xl sm:text-3xl font-display font-bold">One AI workspace, from solo attorney to full firm</h2>
                  <p className="mt-2 text-muted-foreground max-w-2xl">Case files, clients, drafting, contract review, research, billing and trust accounting, with client data isolated per organization.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild size="lg" className="font-semibold"><Link to="/lawyers">Explore the firm hub</Link></Button>
                  <Button asChild size="lg" variant="outline"><a href="mailto:support@legallyai.ai?subject=LegallyAI%20firm%20demo">Book a demo</a></Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 px-4" aria-labelledby="pricing-heading">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-8">
              <h2 id="pricing-heading" className="text-2xl sm:text-4xl font-display font-bold mb-3">Start free, upgrade when ready</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Free for everyone, no sign-up needed: 5 Ask Lee questions a day and every self-help hub, supported by ads. Premium and Firm include a 7-day free trial on your first subscription only.</p>
            </div>
            <h3 className="sr-only">Plans for individuals</h3>
            <div className="grid gap-5 max-w-md mx-auto">
              {individualTiers.map((tier) => (
                <div key={tier.name} className={`glass-card p-6 rounded-2xl relative ${tier.popular ? "border-2 border-legal-gold/70" : "border border-border/50"}`}>
                  {tier.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gold-tile border-0">Most popular</Badge>}
                  <h4 className="text-xl font-bold mb-2">{tier.name}</h4>
                  <p className="mb-4"><span className="text-4xl font-bold">{tier.price}</span><span className="text-muted-foreground">{tier.period}</span></p>
                  <ul className="space-y-2 mb-6">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2"><Check className="h-4 w-4 text-neon-green shrink-0" aria-hidden="true" />{feature}</li>
                    ))}
                  </ul>
                  <Button asChild className={`w-full ${tier.popular ? "gold-tile border-0 font-semibold" : ""}`} variant={tier.popular ? "default" : "outline"}>
                    <Link to={tier.path}>{tier.cta}</Link>
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-6 grid sm:grid-cols-3 gap-3 max-w-4xl mx-auto">
              {firmTiers.map((tier) => (
                <Link key={tier.name} to="/lawyers#plans" className="glass-card rounded-2xl border border-border/50 p-4 hover:border-legal-gold/60">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Law firms</p>
                  <p className="font-semibold">{tier.name}</p>
                  <p><span className="text-2xl font-bold">{tier.price}</span> <span className="text-sm text-muted-foreground">{tier.period}</span></p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison: collapsed by default to keep the page short. */}
        <section className="pb-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <details className="group glass-card rounded-2xl border border-border/50">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 font-display font-semibold [&::-webkit-details-marker]:hidden">
                Compare LegallyAI with other legal tools
                <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <div className="border-t border-border/40 p-2 sm:p-4">
                <CompetitorVersusTable />
              </div>
            </details>
          </div>
        </section>

        <section className="py-12 sm:py-16 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <div className="glass-card p-8 sm:p-12 rounded-3xl border border-legal-gold/30">
              <LeeAvatar heightClass="h-24" imageSize="sm" className="mx-auto mb-4" />
              <h2 className="text-2xl sm:text-3xl font-display font-bold mb-3">Ready when you are</h2>
              <p className="text-muted-foreground mb-7">Ask Lee your first question free, no credit card required.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" className="font-semibold"><Link to="/chat"><MessageSquare className="mr-2 h-5 w-5" />Get legal help</Link></Button>
                <Button asChild size="lg" variant="outline"><Link to="/lawyers"><Briefcase className="mr-2 h-5 w-5" />For law firms</Link></Button>
              </div>
            </div>
          </div>
        </section>

      </FuturisticBackground>
    </Layout>
  );
}
