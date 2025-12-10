import { useState, useRef, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Sparkles, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response (will be replaced with real AI when backend is connected)
    setTimeout(() => {
      const responses = [
        "That's a great question about legal matters. Based on current US law (2025), here's what you should know...\n\nThis is a preview response. When the full AI is connected, you'll receive detailed, accurate legal information tailored to your specific situation.\n\n**Disclaimer:** This is general information only and should not be considered legal advice. Please consult with a licensed attorney for specific legal matters.",
        "I understand you're asking about legal processes. Let me explain the key points...\n\nIn the full version, I'll provide comprehensive guidance with relevant statutes, case law references, and practical steps you can take.\n\n**Remember:** Always verify legal information with a qualified attorney.",
        "Thank you for your question. This is an important legal topic that affects many people...\n\nThe AI-powered response system will provide detailed analysis of your situation once connected to the backend.\n\n**Note:** Legal requirements vary by state and individual circumstances.",
      ];

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <Layout showFooter={false}>
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card px-4 py-3">
          <div className="container mx-auto flex items-center gap-3">
            <div className="p-2 rounded-lg bg-legal-gold/10">
              <Bot className="h-5 w-5 text-legal-gold" />
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold text-foreground">
                AI Legal Assistant
              </h1>
              <p className="text-sm text-muted-foreground">
                Ask questions about US law
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-legal-gold" />
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
                  <div className="shrink-0 p-2 rounded-lg bg-legal-gold/10 h-fit">
                    <Bot className="h-5 w-5 text-legal-gold" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  )}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </p>
                  <span className="text-xs opacity-60 mt-2 block">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {message.role === "user" && (
                  <div className="shrink-0 p-2 rounded-lg bg-primary h-fit">
                    <User className="h-5 w-5 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="shrink-0 p-2 rounded-lg bg-legal-gold/10 h-fit">
                  <Bot className="h-5 w-5 text-legal-gold" />
                </div>
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Suggested Questions */}
        {messages.length === 1 && (
          <div className="border-t border-border bg-muted/50 px-4 py-4">
            <div className="container mx-auto max-w-3xl">
              <p className="text-sm text-muted-foreground mb-3">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="px-3 py-2 text-sm rounded-lg bg-background border border-border hover:border-legal-gold/50 hover:bg-legal-gold/5 transition-colors text-left"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-border bg-card px-4 py-4">
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
                className="flex-1 h-12 text-base"
                disabled={isTyping}
              />
              <Button
                type="submit"
                variant="gold"
                size="lg"
                disabled={!input.trim() || isTyping}
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              This is AI-generated information, not legal advice. Consult a licensed attorney.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
