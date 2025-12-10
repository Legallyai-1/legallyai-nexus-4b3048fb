import { useNavigate } from "react-router-dom";
import { FuturisticBackground } from "@/components/ui/FuturisticBackground";
import { AnimatedAIHead } from "@/components/ui/AnimatedAIHead";
import { Layout } from "@/components/layout/Layout";
import { MessageSquare, Heart, Shield, Scale, Briefcase, Building2, FileText, Gavel } from "lucide-react";

const assistants = [
  {
    id: "general",
    name: "General Legal Chat",
    description: "Get answers to your general legal questions. Our AI can help you understand legal concepts, processes, and your rights.",
    icon: MessageSquare,
    variant: "cyan" as const,
    path: "/chat",
    gradient: "from-cyan-500/20 to-blue-500/20",
    border: "border-cyan-500/30",
    glow: "shadow-[0_0_30px_rgba(0,255,255,0.2)]",
    iconBg: "bg-cyan-500/20",
    questions: ["What are my tenant rights?", "How do I file a small claims case?", "What is a power of attorney?"]
  },
  {
    id: "custody",
    name: "Child Custody Helper",
    description: "Navigate child custody matters with AI guidance. Get help understanding custody types, visitation rights, and parenting plans.",
    icon: Heart,
    variant: "purple" as const,
    path: "/custody",
    gradient: "from-purple-500/20 to-pink-500/20",
    border: "border-purple-500/30",
    glow: "shadow-[0_0_30px_rgba(168,85,247,0.2)]",
    iconBg: "bg-purple-500/20",
    questions: ["Types of custody arrangements", "How to modify custody orders", "Best interests of the child"]
  },
  {
    id: "restraining",
    name: "Restraining Order Helper",
    description: "Learn about protective orders and restraining orders. Understand the process, requirements, and your legal protections.",
    icon: Shield,
    variant: "pink" as const,
    path: "/chat?type=restraining",
    gradient: "from-pink-500/20 to-rose-500/20",
    border: "border-pink-500/30",
    glow: "shadow-[0_0_30px_rgba(236,72,153,0.2)]",
    iconBg: "bg-pink-500/20",
    questions: ["How to file a restraining order", "Types of protective orders", "What evidence do I need?"]
  },
  {
    id: "divorce",
    name: "Divorce Helper",
    description: "Get guidance through the divorce process. Understand property division, spousal support, and legal requirements.",
    icon: Scale,
    variant: "orange" as const,
    path: "/chat?type=divorce",
    gradient: "from-orange-500/20 to-amber-500/20",
    border: "border-orange-500/30",
    glow: "shadow-[0_0_30px_rgba(249,115,22,0.2)]",
    iconBg: "bg-orange-500/20",
    questions: ["Contested vs uncontested divorce", "How is property divided?", "What about child support?"]
  },
  {
    id: "workplace",
    name: "Workplace Legal Aid",
    description: "Know your rights as an employee. Get help with workplace discrimination, harassment, wages, and labor law questions.",
    icon: Building2,
    variant: "orange" as const,
    path: "/workplace-legal-aid",
    gradient: "from-orange-500/20 to-yellow-500/20",
    border: "border-orange-500/30",
    glow: "shadow-[0_0_30px_rgba(249,115,22,0.2)]",
    iconBg: "bg-orange-500/20",
    questions: ["Workplace discrimination", "Overtime and wage laws", "Wrongful termination"]
  },
  {
    id: "lawyer-case",
    name: "Lawyer Case Assistant",
    description: "AI-powered case analysis for legal professionals. Research case law, analyze arguments, and get strategic insights.",
    icon: Gavel,
    variant: "green" as const,
    path: "/chat?type=lawyer",
    gradient: "from-green-500/20 to-emerald-500/20",
    border: "border-green-500/30",
    glow: "shadow-[0_0_30px_rgba(34,197,94,0.2)]",
    iconBg: "bg-green-500/20",
    questions: ["Case law research", "Argument analysis", "Legal strategy"]
  },
  {
    id: "document",
    name: "Document Assistant",
    description: "Get help drafting and reviewing legal documents. From contracts to agreements, get AI assistance with your documents.",
    icon: FileText,
    variant: "blue" as const,
    path: "/generate",
    gradient: "from-blue-500/20 to-indigo-500/20",
    border: "border-blue-500/30",
    glow: "shadow-[0_0_30px_rgba(59,130,246,0.2)]",
    iconBg: "bg-blue-500/20",
    questions: ["Draft NDA", "Create lease agreement", "Review contract"]
  },
  {
    id: "business",
    name: "Business Legal Helper",
    description: "Start and protect your business. Get help with formation, contracts, IP, and compliance matters.",
    icon: Briefcase,
    variant: "cyan" as const,
    path: "/chat?type=business",
    gradient: "from-cyan-500/20 to-teal-500/20",
    border: "border-cyan-500/30",
    glow: "shadow-[0_0_30px_rgba(0,255,255,0.2)]",
    iconBg: "bg-cyan-500/20",
    questions: ["LLC vs Corporation", "Trademark basics", "Business contracts"]
  }
];

export default function AIAssistantsPage() {
  const navigate = useNavigate();

  return (
    <Layout>
    <FuturisticBackground>
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <AnimatedAIHead variant="cyan" size="lg" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              AI Legal <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-blue">Assistants</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Choose your specialized AI assistant for personalized legal guidance. Each assistant is trained to help with specific legal matters.
            </p>
          </div>

          {/* Assistants Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {assistants.map((assistant, index) => (
              <div
                key={assistant.id}
                onClick={() => navigate(assistant.path)}
                className={`
                  group cursor-pointer relative overflow-hidden rounded-2xl
                  bg-gradient-to-br ${assistant.gradient}
                  backdrop-blur-xl border ${assistant.border}
                  ${assistant.glow} hover:scale-[1.02]
                  transition-all duration-500 ease-out
                  animate-fade-in
                `}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Animated background effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative p-6">
                  <div className="flex items-start gap-4">
                    {/* Animated AI Head */}
                    <div className="flex-shrink-0">
                      <AnimatedAIHead variant={assistant.variant} size="md" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1.5 rounded-lg ${assistant.iconBg}`}>
                          <assistant.icon className="w-4 h-4 text-foreground" />
                        </div>
                        <h3 className="text-xl font-display font-semibold text-foreground">
                          {assistant.name}
                        </h3>
                      </div>
                      
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {assistant.description}
                      </p>

                      {/* Common Questions */}
                      <div className="space-y-2">
                        <span className="text-xs text-muted-foreground/70 uppercase tracking-wider">
                          Common questions
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {assistant.questions.map((question, qIndex) => (
                            <span
                              key={qIndex}
                              className={`
                                text-xs px-2 py-1 rounded-full
                                bg-background/30 border ${assistant.border}
                                text-foreground/80
                              `}
                            >
                              {question}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Start Chat indicator */}
                  <div className={`
                    absolute bottom-4 right-4 
                    px-3 py-1.5 rounded-full
                    bg-background/50 border ${assistant.border}
                    text-xs font-medium text-foreground/80
                    opacity-0 group-hover:opacity-100
                    transform translate-y-2 group-hover:translate-y-0
                    transition-all duration-300
                  `}>
                    Start Chat →
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground text-sm mb-4">
              All AI assistants include mandatory legal disclaimers. This is not legal advice.
            </p>
            <button
              onClick={() => navigate("/")}
              className="text-neon-cyan hover:text-neon-blue transition-colors text-sm"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </FuturisticBackground>
    </Layout>
  );
}
