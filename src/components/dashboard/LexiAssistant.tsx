import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedAIHead } from "@/components/ui/AnimatedAIHead";
import { Button } from "@/components/ui/button";
import { X, Sparkles, ArrowRight, Lightbulb, Target, Zap } from "lucide-react";

interface LexiTip {
  id: string;
  title: string;
  description: string;
  action?: { label: string; href: string };
  icon: React.ReactNode;
}

interface LexiAssistantProps {
  userType?: "individual" | "lawyer" | "student" | "probation" | "business";
  userName?: string;
}

export function LexiAssistant({ userType = "individual", userName = "there" }: LexiAssistantProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const tips: Record<string, LexiTip[]> = {
    individual: [
      {
        id: "1",
        title: "Generate Your First Document",
        description: "Describe your legal need and I'll create a professional document in seconds.",
        action: { label: "Start Generating", href: "/generate" },
        icon: <Sparkles className="w-5 h-5 text-neon-cyan" />
      },
      {
        id: "2", 
        title: "Get Legal Guidance",
        description: "Ask me any legal question and I'll provide clear, helpful guidance.",
        action: { label: "Chat with AI", href: "/chat" },
        icon: <Lightbulb className="w-5 h-5 text-neon-purple" />
      },
      {
        id: "3",
        title: "Explore AI Assistants",
        description: "Each legal area has a specialized AI assistant ready to help you.",
        action: { label: "View Assistants", href: "/ai-assistants" },
        icon: <Target className="w-5 h-5 text-neon-green" />
      }
    ],
    lawyer: [
      {
        id: "1",
        title: "Set Up Your Firm",
        description: "Configure your law firm profile and start managing cases efficiently.",
        action: { label: "Firm Settings", href: "/lawyers" },
        icon: <Sparkles className="w-5 h-5 text-neon-cyan" />
      },
      {
        id: "2",
        title: "Manage Client Cases",
        description: "Track cases, appointments, and documents all in one place.",
        action: { label: "View Cases", href: "/cases" },
        icon: <Target className="w-5 h-5 text-neon-green" />
      },
      {
        id: "3",
        title: "AI-Powered Documents",
        description: "Generate legal documents instantly with BarristerAI assistance.",
        action: { label: "Generate Docs", href: "/generate" },
        icon: <Zap className="w-5 h-5 text-neon-orange" />
      }
    ],
    student: [
      {
        id: "1",
        title: "Start Your Legal Journey",
        description: "Access courses, bar exam prep, and AI tutoring through Legal Academy.",
        action: { label: "Open Academy", href: "/legal-academy" },
        icon: <Sparkles className="w-5 h-5 text-neon-cyan" />
      },
      {
        id: "2",
        title: "Practice with AI",
        description: "Get hands-on experience with AI-assisted legal document drafting.",
        action: { label: "Try Drafting", href: "/generate" },
        icon: <Lightbulb className="w-5 h-5 text-neon-purple" />
      },
      {
        id: "3",
        title: "Find Pro Bono Work",
        description: "Build experience while helping those in need with pro bono cases.",
        action: { label: "Pro Bono", href: "/pro-bono" },
        icon: <Target className="w-5 h-5 text-neon-pink" />
      }
    ],
    probation: [
      {
        id: "1",
        title: "Know Your Rights",
        description: "RehabilitAI can help you understand your probation/parole rights.",
        action: { label: "Get Help", href: "/probation-parole" },
        icon: <Sparkles className="w-5 h-5 text-neon-green" />
      },
      {
        id: "2",
        title: "Track Important Dates",
        description: "Never miss a check-in, court date, or important deadline.",
        action: { label: "View Calendar", href: "/appointments" },
        icon: <Target className="w-5 h-5 text-neon-cyan" />
      },
      {
        id: "3",
        title: "Reentry Resources",
        description: "Find jobs, housing, and support for successful reintegration.",
        action: { label: "Explore Resources", href: "/probation-parole" },
        icon: <Zap className="w-5 h-5 text-neon-orange" />
      }
    ],
    business: [
      {
        id: "1",
        title: "Manage Your Firm",
        description: "BarristerAI handles cases, clients, billing, and staff management.",
        action: { label: "Open Dashboard", href: "/dashboard" },
        icon: <Sparkles className="w-5 h-5 text-neon-purple" />
      },
      {
        id: "2",
        title: "Track Revenue",
        description: "PayAI monitors subscriptions, payments, and revenue analytics.",
        action: { label: "View Analytics", href: "/monetization" },
        icon: <Target className="w-5 h-5 text-neon-green" />
      },
      {
        id: "3",
        title: "Hire Legal Talent",
        description: "Post jobs and find qualified legal professionals.",
        action: { label: "Job Board", href: "/jobs" },
        icon: <Zap className="w-5 h-5 text-neon-cyan" />
      }
    ]
  };

  const currentTips = tips[userType] || tips.individual;
  const currentTip = currentTips[currentTipIndex];

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % currentTips.length);
  };

  if (!isExpanded) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-24 right-4 z-40 glass-card p-3 rounded-full border border-neon-cyan/30 hover:border-neon-cyan/60 transition-all hover:shadow-glow-sm"
      >
        <AnimatedAIHead variant="cyan" size="sm" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="glass-card rounded-2xl p-6 border border-neon-cyan/30 relative overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 via-transparent to-neon-purple/5 pointer-events-none" />
      
      {/* Close button */}
      <button
        onClick={() => setIsExpanded(false)}
        className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Header */}
      <div className="flex items-center gap-4 mb-4 relative z-10">
        <div className="relative">
          <div className="absolute inset-0 bg-neon-cyan/20 blur-xl rounded-full" />
          <AnimatedAIHead variant="cyan" size="md" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-lg">
            Hi {userName}! I'm <span className="text-neon-cyan">Lexi</span>
          </h3>
          <p className="text-sm text-muted-foreground">Your personal legal assistant</p>
        </div>
      </div>

      {/* Tip Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTip.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-background/30 rounded-xl p-4 border border-border/30 relative z-10"
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 rounded-lg bg-background/50">
              {currentTip.icon}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-foreground mb-1">{currentTip.title}</h4>
              <p className="text-sm text-muted-foreground">{currentTip.description}</p>
            </div>
          </div>
          
          {currentTip.action && (
            <Button
              variant="neon"
              size="sm"
              className="w-full"
              onClick={() => window.location.href = currentTip.action!.href}
            >
              {currentTip.action.label}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation dots */}
      <div className="flex items-center justify-center gap-2 mt-4 relative z-10">
        {currentTips.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentTipIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentTipIndex 
                ? "bg-neon-cyan w-6" 
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
          />
        ))}
        <button
          onClick={nextTip}
          className="ml-2 text-xs text-neon-cyan hover:text-neon-cyan/80 transition-colors"
        >
          Next tip →
        </button>
      </div>
    </motion.div>
  );
}
