import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User, Sparkles, AlertCircle, Loader2, Mic } from "lucide-react";
import { VoiceInputButton } from "@/components/ui/VoiceInputButton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AnimatedAIHead } from "@/components/ui/AnimatedAIHead";
import AdBanner from "@/components/ads/AdBanner";
import AdContainer from "@/components/ads/AdContainer";
import AdMobBanner, { ADMOB_AD_UNITS } from "@/components/ads/AdMobBanner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const suggestedQuestions = [
  "What are my rights as a tenant in California?",
  "How do I form an LLC in Texas?",
  "What should be included in a freelance contract?",
  "How does child custody work in New York?",
  "What is the difference between a will and a trust?",
];

export default function ChatPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your AI legal assistant. I can help you understand legal concepts, answer questions about US law, and guide you through legal processes. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setIsCheckingAuth(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    // Allow chat for all users (free tier includes AI chat)
    // Authentication only required for document generation

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsTyping(true);

    try {
      if (!user) {
        toast.error("Please sign in to use AI chat.");
        navigate("/login", { state: { from: "/chat" } });
        return;
      }

      const apiMessages = messages
        .filter(m => m.id !== "welcome")
        .map(m => ({ role: m.role, content: m.content }));
      apiMessages.push({ role: "user", content: currentInput });

      const { data, error } = await supabase.functions.invoke("legal-chat", {
        body: { messages: apiMessages },
      });
      if (error) throw error;

      const assistantContent = data?.response ?? data?.text;
      if (typeof assistantContent !== "string" || !assistantContent.trim()) {
        throw new Error("The AI service returned an empty response.");
      }
      const assistantMessageId = (Date.now() + 1).toString();

      setMessages(prev => [...prev, {
        id: assistantMessageId,
        role: "assistant",
        content: assistantContent,
        timestamp: new Date(),
      }]);

    } catch (error) {
      console.error("Chat error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to get response");
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  if (isCheckingAuth) {
    return (
      <Layout showFooter={false}>
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="flex flex-col items-center gap-4">
            <AnimatedAIHead variant="cyan" size="lg" />
            <Loader2 className="h-6 w-6 animate-spin text-neon-cyan" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFooter={false}>
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
        {/* Authentication banner */}
        {!user && (
          <div className="bg-gradient-to-r from-neon-cyan/10 to-neon-purple/10 border-b border-neon-cyan/30 px-4 py-3">
            <div className="container mx-auto flex items-center justify-center gap-2 text-foreground">
              <Sparkles className="h-4 w-4 text-neon-cyan" />
              <span className="text-sm"><button onClick={() => navigate("/auth")} className="underline font-medium text-neon-cyan hover:text-neon-purple transition-colors">Create an account</button> or sign in to use AI chat.</span>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div className="border-b border-border glass-card px-4 py-3">
          <div className="container mx-auto flex items-center gap-3">
            <AnimatedAIHead variant="cyan" size="sm" />
            <div>
              <h1 className="font-display text-lg font-semibold text-foreground">
                AI Legal Assistant
              </h1>
              <p className="text-sm text-muted-foreground">
                Ask questions about US law
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-neon-cyan animate-pulse" />
              <span className="text-muted-foreground">Powered by AI</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="container mx-auto max-w-3xl space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="shrink-0">
                    <AnimatedAIHead variant="cyan" size="sm" isActive={isTyping && message.content === ""} />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3",
                    message.role === "user"
                      ? "bg-gradient-to-r from-neon-cyan to-neon-blue text-background"
                      : "glass-card border-neon-cyan/20"
                  )}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content || (isTyping && message.role === "assistant" ? "..." : "")}
                  </p>
                  <span className="text-xs opacity-60 mt-2 block">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {message.role === "user" && (
                  <div className="shrink-0 p-2 rounded-xl bg-gradient-to-r from-neon-purple to-neon-pink h-fit">
                    <User className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex gap-3 justify-start">
                <div className="shrink-0">
                  <AnimatedAIHead variant="cyan" size="sm" isActive={true} />
                </div>
                <div className="glass-card border-neon-cyan/20 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-neon-cyan animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-neon-cyan animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <span className="w-2 h-2 rounded-full bg-neon-cyan animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Suggested Questions */}
        {messages.length === 1 && (
          <div className="border-t border-border glass-card px-4 py-4">
            <div className="container mx-auto max-w-3xl">
              <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-neon-purple" />
                Suggested questions:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="px-3 py-2 text-sm rounded-xl glass-card border-neon-cyan/20 hover:border-neon-cyan/50 hover:shadow-glow-sm transition-all text-left"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-border glass-card px-4 py-4">
          <div className="container mx-auto max-w-3xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-3"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about legal matters..."
                className="flex-1 h-12 text-base bg-muted/50 border-border/50 focus:border-neon-cyan/50 focus:shadow-glow-sm transition-all rounded-xl"
                disabled={isTyping}
              />
              <VoiceInputButton
                onTranscript={(text) => setInput(prev => prev ? `${prev} ${text}` : text)}
                className="h-12 w-12 rounded-xl"
              />
              <Button
                type="submit"
                variant="neon"
                size="lg"
                disabled={!input.trim() || isTyping}
                className="rounded-xl"
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
              <AlertCircle className="h-3 w-3 text-neon-purple" />
              This is AI-generated information, not legal advice. Consult a licensed attorney.
            </p>
            
            <AdContainer position="bottom" className="mt-4">
              <AdBanner slot="7335134262" format="horizontal" />
            </AdContainer>
            <AdMobBanner adUnitId={ADMOB_AD_UNITS.CHAT_BANNER} size="banner" className="mt-2" />
          </div>
        </div>
      </div>
    </Layout>
  );
}
