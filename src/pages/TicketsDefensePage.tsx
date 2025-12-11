import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { FuturisticBackground } from "@/components/ui/FuturisticBackground";
import { AnimatedAIHead } from "@/components/ui/AnimatedAIHead";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { 
  Gavel, 
  Car, 
  AlertTriangle, 
  FileText, 
  Send, 
  ArrowRight,
  Shield,
  Scale,
  Clock,
  DollarSign
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const defenseCategories = [
  {
    id: "traffic",
    name: "Traffic Tickets",
    icon: Car,
    description: "Speeding, red lights, parking violations",
    color: "cyan",
    examples: ["Speeding ticket defense", "Red light camera", "Parking violations"]
  },
  {
    id: "misdemeanor",
    name: "Misdemeanors",
    icon: AlertTriangle,
    description: "Minor criminal offenses",
    color: "orange",
    examples: ["Petty theft", "Simple assault", "DUI/DWI first offense"]
  },
  {
    id: "felony",
    name: "Felony Guidance",
    icon: Gavel,
    description: "Serious criminal charges",
    color: "pink",
    examples: ["Understanding charges", "Rights overview", "Finding representation"]
  },
  {
    id: "court-prep",
    name: "Court Preparation",
    icon: Scale,
    description: "Get ready for your court date",
    color: "purple",
    examples: ["What to wear", "What to say", "Required documents"]
  }
];

export default function TicketsDefensePage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const systemPrompt = `You are Defendr, an AI legal assistant specializing in traffic tickets and criminal defense guidance for U.S. law (2025). 
      You help users understand their charges, potential defenses, court procedures, and rights.
      
      IMPORTANT GUIDELINES:
      - Provide general information about legal processes and rights
      - Explain potential defense strategies in understandable terms
      - Guide users on court preparation and procedures
      - Always recommend consulting with a licensed attorney for specific legal advice
      - Be compassionate and non-judgmental
      - Focus on empowering users with knowledge
      
      DISCLAIMER: Always remind users this is informational guidance, not legal advice. Recommend licensed counsel for serious matters.`;

      const { data, error } = await supabase.functions.invoke('legal-chat', {
        body: { 
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
            { role: "user", content: userMessage }
          ],
          stream: false
        }
      });

      if (error) throw error;

      setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to get response",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const category = defenseCategories.find(c => c.id === categoryId);
    if (category) {
      setMessage(`I need help with ${category.name.toLowerCase()}. `);
    }
  };

  return (
    <Layout>
      <FuturisticBackground>
        <div className="min-h-screen py-12 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <AnimatedAIHead variant="pink" size="lg" isActive={isLoading} />
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-neon-orange">Defendr</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                AI-powered guidance for traffic tickets and criminal defense. Understand your rights and prepare for court.
              </p>
            </div>

            {/* Category Selection */}
            {!selectedCategory && messages.length === 0 && (
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {defenseCategories.map((category) => (
                  <Card
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`
                      cursor-pointer p-6 bg-background/30 backdrop-blur-xl 
                      border-neon-${category.color}/30 hover:border-neon-${category.color}/60
                      hover:shadow-[0_0_30px_rgba(var(--neon-${category.color}),0.2)]
                      transition-all duration-300
                    `}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl bg-neon-${category.color}/20`}>
                        <category.icon className={`w-6 h-6 text-neon-${category.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-display font-semibold text-foreground mb-1">
                          {category.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {category.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {category.examples.map((example, idx) => (
                            <span
                              key={idx}
                              className={`text-xs px-2 py-1 rounded-full bg-neon-${category.color}/10 text-neon-${category.color}/80`}
                            >
                              {example}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Quick Tips */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              {[
                { icon: Clock, label: "Time Limits", desc: "Know your deadlines" },
                { icon: DollarSign, label: "Fines & Fees", desc: "Understand costs" },
                { icon: Shield, label: "Your Rights", desc: "Protected by law" },
                { icon: FileText, label: "Documents", desc: "What to bring" }
              ].map((tip, idx) => (
                <div key={idx} className="glass-card p-4 rounded-xl text-center">
                  <tip.icon className="w-6 h-6 text-neon-pink mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">{tip.label}</p>
                  <p className="text-xs text-muted-foreground">{tip.desc}</p>
                </div>
              ))}
            </div>

            {/* Chat Area */}
            <Card className="glass-card border-neon-pink/30 p-6">
              {/* Messages */}
              <div className="min-h-[300px] max-h-[500px] overflow-y-auto mb-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <Gavel className="w-12 h-12 text-neon-pink/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Select a category above or describe your legal situation to get started.
                    </p>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] p-4 rounded-2xl ${
                          msg.role === "user"
                            ? "bg-neon-pink/20 border border-neon-pink/30"
                            : "bg-background/50 border border-border/50"
                        }`}
                      >
                        {msg.role === "assistant" && (
                          <div className="flex items-center gap-2 mb-2">
                            <AnimatedAIHead variant="pink" size="sm" />
                            <span className="text-sm font-medium text-neon-pink">Defendr</span>
                          </div>
                        )}
                        <p className="text-foreground whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-background/50 border border-border/50 p-4 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <AnimatedAIHead variant="pink" size="sm" isActive />
                        <span className="text-sm text-muted-foreground animate-pulse">Defendr is analyzing...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="flex gap-3">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your situation or ask about your rights..."
                  className="flex-1 min-h-[60px] bg-background/30 border-neon-pink/30 focus:border-neon-pink/60"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  variant="neon-purple"
                  size="lg"
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isLoading}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </Card>

            {/* Disclaimer */}
            <div className="mt-8 glass-card rounded-xl p-4 border-neon-orange/30">
              <p className="text-sm text-muted-foreground text-center">
                ⚠️ <strong>Important:</strong> Defendr provides general legal information only, not legal advice. 
                For criminal matters, always consult with a licensed attorney. Your rights matter.
              </p>
            </div>

            {/* Back Button */}
            <div className="text-center mt-6">
              <Button variant="ghost" onClick={() => navigate("/ai-assistants")}>
                ← Back to AI Assistants
              </Button>
            </div>
          </div>
        </div>
      </FuturisticBackground>
    </Layout>
  );
}
