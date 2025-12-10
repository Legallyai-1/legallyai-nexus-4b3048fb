import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { FuturisticBackground } from "@/components/ui/FuturisticBackground";
import { AnimatedAIHead } from "@/components/ui/AnimatedAIHead";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { 
  Users, 
  FileCheck, 
  Calendar, 
  MapPin, 
  Send, 
  Shield,
  Bell,
  Home,
  Briefcase,
  Heart
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const supportCategories = [
  {
    id: "probation",
    name: "Probation Support",
    icon: FileCheck,
    description: "Understanding probation terms and compliance",
    color: "green",
    topics: ["Check-in requirements", "Travel restrictions", "Condition modifications"]
  },
  {
    id: "parole",
    name: "Parole Guidance",
    icon: Shield,
    description: "Parole requirements and reentry support",
    color: "cyan",
    topics: ["Parole hearings", "Supervision terms", "Early discharge"]
  },
  {
    id: "incarceration",
    name: "Incarceration Help",
    icon: Users,
    description: "Rights and resources for incarcerated individuals",
    color: "purple",
    topics: ["Inmate rights", "Transfer requests", "Family communication"]
  },
  {
    id: "reentry",
    name: "Reentry Resources",
    icon: Home,
    description: "Successfully transitioning back to society",
    color: "orange",
    topics: ["Housing assistance", "Job placement", "Record expungement"]
  }
];

const quickResources = [
  { icon: Calendar, label: "Court Dates", desc: "Track important dates" },
  { icon: MapPin, label: "Check-In Locations", desc: "Find your officer" },
  { icon: Briefcase, label: "Job Resources", desc: "Employment help" },
  { icon: Heart, label: "Family Connect", desc: "Stay in touch" }
];

export default function ProbationParolePage() {
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
      const systemPrompt = `You are RehabilitAI (also called ProbAI), a compassionate AI assistant helping individuals navigate probation, parole, and incarceration in the U.S. legal system (2025).

      YOUR MISSION:
      - Provide clear, empathetic guidance on probation/parole requirements
      - Help users understand their rights while incarcerated or supervised
      - Offer resources for successful reentry into society
      - Support family members seeking to help loved ones
      - Guide users through complex legal processes

      KEY AREAS OF SUPPORT:
      1. Probation compliance and modification requests
      2. Parole hearing preparation and requirements
      3. Inmate rights and prison procedures
      4. Transfer requests and facility issues
      5. Reentry resources: housing, employment, expungement
      6. Family communication and visitation guidance

      COMMUNICATION STYLE:
      - Be compassionate and non-judgmental
      - Use clear, simple language
      - Acknowledge the challenges users face
      - Provide actionable next steps
      - Offer hope while being realistic

      IMPORTANT: Always remind users to verify information with their supervising officer or attorney. Provide general guidance, not specific legal advice.`;

      const { data, error } = await supabase.functions.invoke('legal-chat', {
        body: { 
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
            { role: "user", content: userMessage }
          ]
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
    const category = supportCategories.find(c => c.id === categoryId);
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
                <AnimatedAIHead variant="green" size="lg" isActive={isLoading} />
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-neon-cyan">RehabilitAI</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Compassionate support for probation, parole, and reentry. You deserve a second chance.
              </p>
            </div>

            {/* Category Selection */}
            {!selectedCategory && messages.length === 0 && (
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {supportCategories.map((category) => (
                  <Card
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className="cursor-pointer p-6 bg-background/30 backdrop-blur-xl border-border/50 hover:border-neon-green/60 hover:shadow-[0_0_30px_rgba(34,197,94,0.2)] transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-neon-green/20">
                        <category.icon className="w-6 h-6 text-neon-green" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-display font-semibold text-foreground mb-1">
                          {category.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {category.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {category.topics.map((topic, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 rounded-full bg-neon-green/10 text-neon-green/80"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Quick Resources */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {quickResources.map((resource, idx) => (
                <div key={idx} className="glass-card p-4 rounded-xl text-center hover:border-neon-green/50 transition-all cursor-pointer">
                  <resource.icon className="w-6 h-6 text-neon-green mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">{resource.label}</p>
                  <p className="text-xs text-muted-foreground">{resource.desc}</p>
                </div>
              ))}
            </div>

            {/* Chat Area */}
            <Card className="glass-card border-neon-green/30 p-6">
              {/* Messages */}
              <div className="min-h-[300px] max-h-[500px] overflow-y-auto mb-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <Shield className="w-12 h-12 text-neon-green/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Select a topic above or share what you need help with. We're here to support you.
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
                            ? "bg-neon-green/20 border border-neon-green/30"
                            : "bg-background/50 border border-border/50"
                        }`}
                      >
                        {msg.role === "assistant" && (
                          <div className="flex items-center gap-2 mb-2">
                            <AnimatedAIHead variant="green" size="sm" />
                            <span className="text-sm font-medium text-neon-green">RehabilitAI</span>
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
                        <AnimatedAIHead variant="green" size="sm" isActive />
                        <span className="text-sm text-muted-foreground animate-pulse">RehabilitAI is here to help...</span>
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
                  placeholder="Share what you need help with. All conversations are confidential..."
                  className="flex-1 min-h-[60px] bg-background/30 border-neon-green/30 focus:border-neon-green/60"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  variant="neon-green"
                  size="lg"
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isLoading}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </Card>

            {/* Support Notice */}
            <div className="mt-8 glass-card rounded-xl p-4 border-neon-green/30">
              <p className="text-sm text-muted-foreground text-center">
                💚 <strong>You're not alone.</strong> RehabilitAI is here to help you navigate your journey. 
                Remember to always verify information with your probation/parole officer or attorney.
              </p>
            </div>

            {/* Emergency Resources */}
            <div className="mt-4 grid md:grid-cols-3 gap-4">
              <div className="glass-card p-3 rounded-lg text-center">
                <Bell className="w-5 h-5 text-neon-cyan mx-auto mb-1" />
                <p className="text-xs text-foreground">24/7 Reentry Hotline</p>
                <p className="text-xs text-neon-cyan">1-844-516-5730</p>
              </div>
              <div className="glass-card p-3 rounded-lg text-center">
                <Users className="w-5 h-5 text-neon-purple mx-auto mb-1" />
                <p className="text-xs text-foreground">Family Support</p>
                <p className="text-xs text-neon-purple">Find resources</p>
              </div>
              <div className="glass-card p-3 rounded-lg text-center">
                <Briefcase className="w-5 h-5 text-neon-orange mx-auto mb-1" />
                <p className="text-xs text-foreground">Employment Help</p>
                <p className="text-xs text-neon-orange">Job placement</p>
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
