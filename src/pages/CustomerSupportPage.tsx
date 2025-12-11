import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { FuturisticBackground } from "@/components/ui/FuturisticBackground";
import { AnimatedAIHead } from "@/components/ui/AnimatedAIHead";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { 
  Headphones, 
  MessageSquare, 
  Send, 
  HelpCircle,
  CreditCard,
  FileText,
  Settings,
  Shield,
  Zap,
  CheckCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const quickActions = [
  { id: "billing", name: "Billing & Payments", icon: CreditCard, desc: "Subscriptions, refunds, payment issues" },
  { id: "account", name: "Account Help", icon: Settings, desc: "Profile, settings, password reset" },
  { id: "documents", name: "Document Issues", icon: FileText, desc: "Generation, downloads, formatting" },
  { id: "security", name: "Security Concerns", icon: Shield, desc: "Account security, privacy, data" },
];

const faqItems = [
  { q: "How do I cancel my subscription?", a: "Go to Settings > Subscription > Cancel. Your access continues until the billing period ends." },
  { q: "Can I get a refund?", a: "Refunds are available within 7 days of purchase. ServeAI can process this for you." },
  { q: "How do I download my documents?", a: "After generation, click the Download button. Documents are saved as PDF files." },
  { q: "Is my data secure?", a: "Yes! We use end-to-end encryption and comply with HIPAA, GDPR, and industry standards." },
];

export default function CustomerSupportPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const systemPrompt = `You are ServeAI, the fully autonomous customer support AI for LegallyAI platform. 

      YOUR CAPABILITIES (Full Autonomy):
      - Answer any questions about LegallyAI services
      - Process refund requests (within policy)
      - Help with account issues and settings
      - Troubleshoot document generation problems
      - Explain subscription plans and billing
      - Detect and flag potential scam/fraud attempts
      - Escalate complex issues to human support when needed

      COMMUNICATION STYLE:
      - Friendly, helpful, and professional
      - Clear and concise responses
      - Proactive in offering solutions
      - Acknowledge frustration with empathy

      GUIDELINES:
      - Always verify user identity before making account changes
      - Follow company refund policy (7 days)
      - Detect suspicious activity and protect users
      - Provide accurate information about services
      - Offer alternatives when primary solution isn't available

      AVAILABLE ACTIONS:
      - Check subscription status
      - Process refunds (with user confirmation)
      - Reset passwords (send reset link)
      - Explain features and pricing
      - Submit feedback to product team
      - Escalate to human agent

      Be helpful, efficient, and make users feel heard!`;

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

  const handleQuickAction = (actionId: string) => {
    setSelectedAction(actionId);
    const action = quickActions.find(a => a.id === actionId);
    if (action) {
      setMessage(`I need help with ${action.name.toLowerCase()}: `);
    }
  };

  return (
    <Layout>
      <FuturisticBackground>
        <div className="min-h-screen py-12 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <AnimatedAIHead variant="cyan" size="lg" isActive={isLoading} />
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-green">ServeAI</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                24/7 AI Customer Support - Instant Help, Real Solutions
              </p>
              <div className="flex items-center justify-center gap-2 mt-2 text-sm text-neon-green">
                <Zap className="w-4 h-4" />
                <span>Fully Autonomous Support</span>
                <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              </div>
            </div>

            {/* Quick Actions */}
            {messages.length === 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {quickActions.map((action) => (
                  <Card
                    key={action.id}
                    onClick={() => handleQuickAction(action.id)}
                    className="cursor-pointer p-4 bg-background/30 backdrop-blur-xl border-border/50 hover:border-neon-cyan/60 hover:shadow-glow-sm transition-all duration-300 text-center"
                  >
                    <action.icon className="w-8 h-8 text-neon-cyan mx-auto mb-2" />
                    <h3 className="text-sm font-medium text-foreground mb-1">{action.name}</h3>
                    <p className="text-xs text-muted-foreground">{action.desc}</p>
                  </Card>
                ))}
              </div>
            )}

            {/* Chat Area */}
            <Card className="glass-card border-neon-cyan/30 p-6 mb-8">
              {/* Messages */}
              <div className="min-h-[350px] max-h-[500px] overflow-y-auto mb-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <Headphones className="w-12 h-12 text-neon-cyan/30 mx-auto mb-4" />
                    <p className="text-foreground font-medium mb-2">Hi! I'm ServeAI, your support assistant.</p>
                    <p className="text-muted-foreground text-sm">
                      Select a quick action above or describe what you need help with.
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
                            ? "bg-neon-cyan/20 border border-neon-cyan/30"
                            : "bg-background/50 border border-border/50"
                        }`}
                      >
                        {msg.role === "assistant" && (
                          <div className="flex items-center gap-2 mb-2">
                            <AnimatedAIHead variant="cyan" size="sm" />
                            <span className="text-sm font-medium text-neon-cyan">ServeAI</span>
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
                        <AnimatedAIHead variant="cyan" size="sm" isActive />
                        <span className="text-sm text-muted-foreground animate-pulse">ServeAI is helping...</span>
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
                  placeholder="Describe your issue or question..."
                  className="flex-1 min-h-[60px] bg-background/30 border-neon-cyan/30 focus:border-neon-cyan/60"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  variant="neon"
                  size="lg"
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isLoading}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </Card>

            {/* FAQ Section */}
            <Card className="glass-card p-6 border-neon-purple/30">
              <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-neon-purple" /> Frequently Asked Questions
              </h3>
              <div className="space-y-3">
                {faqItems.map((faq, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-background/30 border border-border/50">
                    <p className="font-medium text-foreground mb-1 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-neon-green" /> {faq.q}
                    </p>
                    <p className="text-sm text-muted-foreground pl-6">{faq.a}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Contact Options */}
            <div className="mt-8 grid md:grid-cols-3 gap-4 text-center">
              <div className="glass-card p-4 rounded-xl">
                <MessageSquare className="w-6 h-6 text-neon-cyan mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">Live Chat</p>
                <p className="text-xs text-muted-foreground">Instant AI support</p>
              </div>
              <div className="glass-card p-4 rounded-xl">
                <Headphones className="w-6 h-6 text-neon-purple mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">Email Support</p>
                <p className="text-xs text-neon-purple">support@legallyai.ai</p>
              </div>
              <div className="glass-card p-4 rounded-xl">
                <Shield className="w-6 h-6 text-neon-green mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">Emergency</p>
                <p className="text-xs text-muted-foreground">Critical issues only</p>
              </div>
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
