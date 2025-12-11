import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, MicOff, X, Send, Loader2, Sparkles, Volume2, 
  Brain, FileText, Scale, Users, Briefcase, Heart,
  Car, Home, Shield, GraduationCap, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatedAIHead } from "@/components/ui/AnimatedAIHead";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
  action?: {
    type: "navigate" | "generate" | "search" | "analyze";
    target?: string;
    data?: any;
  };
}

const HUB_ROUTES: Record<string, { path: string; icon: any; name: string }> = {
  custody: { path: "/custody", icon: Users, name: "CustodiAI" },
  divorce: { path: "/custody", icon: Heart, name: "Mary" },
  dui: { path: "/dui-hub", icon: Car, name: "DriveSafeAI" },
  criminal: { path: "/tickets-defense", icon: Shield, name: "Defendr" },
  defense: { path: "/tickets-defense", icon: Shield, name: "Defendr" },
  will: { path: "/will-hub", icon: Home, name: "LegacyAI" },
  estate: { path: "/will-hub", icon: Home, name: "LegacyAI" },
  parole: { path: "/enhanced-parole", icon: Shield, name: "Freedom AI" },
  probation: { path: "/enhanced-parole", icon: Shield, name: "Freedom AI" },
  job: { path: "/jobs", icon: Briefcase, name: "Job Board" },
  career: { path: "/jobs", icon: Briefcase, name: "Job Board" },
  probono: { path: "/pro-bono", icon: Heart, name: "Pro Bono" },
  volunteer: { path: "/pro-bono", icon: Heart, name: "Pro Bono" },
  academy: { path: "/legal-academy", icon: GraduationCap, name: "ScholarAI" },
  learn: { path: "/legal-academy", icon: GraduationCap, name: "ScholarAI" },
  business: { path: "/business-hub", icon: Briefcase, name: "PraxisAI" },
  firm: { path: "/business-hub", icon: Briefcase, name: "PraxisAI" },
  generate: { path: "/generate", icon: FileText, name: "Document Generator" },
  document: { path: "/generate", icon: FileText, name: "Document Generator" },
};

export function FloatingLeeAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { isListening, isProcessing: isVoiceProcessing, toggleListening } = useVoiceInput({
    onTranscript: (text) => {
      setInput(text);
      handleSend(text);
    },
  });

  useEffect(() => {
    checkPremiumStatus();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const checkPremiumStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Check subscription status
        const { data } = await supabase.functions.invoke("check-subscription");
        setIsPremium(data?.subscribed || false);
      }
    } catch (error) {
      console.error("Error checking premium status:", error);
    }
  };

  const parseCommand = (text: string): { hub?: string; action?: string; query: string } => {
    const lowerText = text.toLowerCase();
    let hub: string | undefined;
    let action: string | undefined;

    // Detect hub keywords
    for (const [keyword, route] of Object.entries(HUB_ROUTES)) {
      if (lowerText.includes(keyword)) {
        hub = keyword;
        break;
      }
    }

    // Detect action keywords
    if (lowerText.includes("generate") || lowerText.includes("create") || lowerText.includes("draft")) {
      action = "generate";
    } else if (lowerText.includes("search") || lowerText.includes("find") || lowerText.includes("research")) {
      action = "search";
    } else if (lowerText.includes("analyze") || lowerText.includes("predict") || lowerText.includes("outcome")) {
      action = "analyze";
    } else if (lowerText.includes("go to") || lowerText.includes("open") || lowerText.includes("navigate")) {
      action = "navigate";
    }

    return { hub, action, query: text };
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    if (!isPremium) {
      setShowUpgrade(true);
      return;
    }

    const userMessage: Message = { role: "user", content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    try {
      const { hub, action, query } = parseCommand(messageText);

      // Call AI for response
      const { data, error } = await supabase.functions.invoke("legal-chat", {
        body: {
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          stream: false,
          context: `You are Lee, an advanced AI legal assistant. The user asked: "${query}". 
          ${hub ? `They seem interested in ${HUB_ROUTES[hub]?.name || hub}.` : ""}
          ${action ? `They want to ${action}.` : ""}
          Provide helpful legal guidance and suggest next steps. Be concise but thorough.`,
        },
      });

      if (error) throw error;

      let responseContent = data?.response || data?.text || "I'm here to help with your legal needs.";
      
      // Build action based on parsed command
      let responseAction: Message["action"] | undefined;
      if (hub && HUB_ROUTES[hub]) {
        responseAction = {
          type: action === "navigate" ? "navigate" : (action as any) || "navigate",
          target: HUB_ROUTES[hub].path,
          data: { hub: HUB_ROUTES[hub].name },
        };
        responseContent += `\n\nWould you like me to take you to ${HUB_ROUTES[hub].name}?`;
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: responseContent,
        action: responseAction,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Lee error:", error);
      toast.error("Sorry, I encountered an error. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAction = (action: Message["action"]) => {
    if (!action) return;
    
    if (action.type === "navigate" && action.target) {
      navigate(action.target);
      setIsOpen(false);
      toast.success(`Navigating to ${action.data?.hub || action.target}`);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className="fixed bottom-24 left-4 lg:bottom-8 lg:left-8 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
      >
        <button
          onClick={() => setIsOpen(true)}
          className="relative group"
          aria-label="Ask Lee AI Assistant"
        >
          {/* Glow effects */}
          <div className="absolute inset-0 bg-neon-cyan/30 rounded-full blur-xl animate-pulse scale-150" />
          <div className="absolute inset-0 bg-neon-purple/20 rounded-full blur-md scale-125 group-hover:scale-150 transition-transform duration-500" />
          
          {/* Orbiting particles */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: "4s" }}>
            <div className="absolute -top-1 left-1/2 w-2 h-2 bg-neon-cyan rounded-full shadow-[0_0_8px_hsl(var(--neon-cyan))]" />
          </div>
          
          {/* Main button */}
          <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-neon-cyan via-neon-purple to-neon-pink shadow-[0_0_30px_hsl(var(--neon-cyan)/0.5)] flex items-center justify-center transition-all duration-300 group-hover:scale-110">
            <Brain className="h-6 w-6 text-white" />
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-neon-green animate-pulse" />
          </div>

          {/* Label */}
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
            <div className="bg-background/90 backdrop-blur-sm border border-neon-cyan/30 rounded-lg px-3 py-2 whitespace-nowrap">
              <span className="text-sm font-medium text-foreground">Ask Lee</span>
              <Badge className="ml-2 bg-neon-green/20 text-neon-green text-xs">10/10</Badge>
            </div>
          </div>
        </button>
      </motion.div>

      {/* Assistant Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-4 left-4 right-4 lg:left-8 lg:right-auto lg:w-[420px] z-50"
          >
            <div className="glass-card rounded-2xl border border-neon-cyan/30 shadow-[0_0_40px_hsl(var(--neon-cyan)/0.2)] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-neon-cyan/20 via-neon-purple/20 to-neon-pink/20 p-4 border-b border-border/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <AnimatedAIHead variant="cyan" size="sm" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                        Ask Lee
                        <Badge className="bg-neon-green/20 text-neon-green text-xs">Premium</Badge>
                      </h3>
                      <p className="text-xs text-muted-foreground">Site-wide AI • Exceeds Siri/Bixby for Law</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {[
                    { label: "Generate Doc", icon: FileText, path: "/generate" },
                    { label: "Custody", icon: Users, path: "/custody" },
                    { label: "Defense", icon: Shield, path: "/tickets-defense" },
                    { label: "Jobs", icon: Briefcase, path: "/jobs" },
                  ].map((action) => (
                    <Button
                      key={action.label}
                      variant="outline"
                      size="sm"
                      className="shrink-0 text-xs gap-1 bg-background/50"
                      onClick={() => {
                        if (isPremium) {
                          navigate(action.path);
                          setIsOpen(false);
                        } else {
                          setShowUpgrade(true);
                        }
                      }}
                    >
                      <action.icon className="h-3 w-3" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Upgrade Prompt */}
              {showUpgrade && !isPremium && (
                <div className="p-4 bg-neon-gold/10 border-b border-neon-gold/30">
                  <p className="text-sm text-foreground mb-2">
                    <Sparkles className="inline h-4 w-4 text-neon-gold mr-1" />
                    Unlock site-wide Lee access with Premium
                  </p>
                  <Button
                    variant="neon"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate("/pricing")}
                  >
                    Upgrade to Premium
                  </Button>
                </div>
              )}

              {/* Messages */}
              <ScrollArea className="h-[300px] p-4" ref={scrollRef}>
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 text-neon-cyan/50 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm mb-2">
                      Hi! I'm Lee, your AI legal assistant.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Try: "Draft a custody agreement" or "Research DUI defenses"
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg, i) => (
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
                          {msg.action && (
                            <Button
                              variant="neon"
                              size="sm"
                              className="mt-2 w-full text-xs"
                              onClick={() => handleAction(msg.action)}
                            >
                              Go to {msg.action.data?.hub || msg.action.target}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    {isProcessing && (
                      <div className="flex justify-start">
                        <div className="bg-muted/50 rounded-xl px-4 py-2">
                          <Loader2 className="h-4 w-4 animate-spin text-neon-cyan" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t border-border/30 bg-background/50">
                <div className="flex gap-2">
                  <Button
                    variant={isListening ? "destructive" : "outline"}
                    size="icon"
                    onClick={toggleListening}
                    disabled={isVoiceProcessing || !isPremium}
                    className={isListening ? "animate-pulse" : ""}
                  >
                    {isVoiceProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isListening ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder={isPremium ? "Ask Lee anything..." : "Upgrade for full access"}
                    disabled={!isPremium}
                    className="flex-1"
                  />
                  <Button
                    variant="neon"
                    size="icon"
                    onClick={() => handleSend()}
                    disabled={isProcessing || !input.trim() || !isPremium}
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Voice commands: "Lee, draft a will" • "Research custody laws in CA"
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
