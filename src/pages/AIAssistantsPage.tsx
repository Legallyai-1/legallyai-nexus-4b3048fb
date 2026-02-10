import { useNavigate } from "react-router-dom";
import { FuturisticBackground } from "@/components/ui/FuturisticBackground";
import { AnimatedAIHead } from "@/components/ui/AnimatedAIHead";
import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Heart, Shield, Scale, Briefcase, Building2, FileText, Gavel, GraduationCap, Phone, Headphones, Users, DollarSign, BarChart3, Car, Home, Star, Sparkles } from "lucide-react";
import AdBanner from "@/components/ads/AdBanner";
import AdContainer from "@/components/ads/AdContainer";
import AdMobBanner, { ADMOB_AD_UNITS } from "@/components/ads/AdMobBanner";

const assistants = [
  {
    id: "general",
    name: "Lee - Legal AI",
    description: "Your advanced AI legal assistant with site-wide access. Voice commands, multi-step workflows, 95% accuracy.",
    icon: MessageSquare,
    variant: "cyan" as const,
    path: "/chat",
    gradient: "from-cyan-500/20 to-blue-500/20",
    border: "border-cyan-500/30",
    glow: "shadow-[0_0_30px_rgba(0,255,255,0.2)]",
    iconBg: "bg-cyan-500/20",
    questions: ["What are my rights?", "How do I file a case?", "Legal processes"],
    premium: true
  },
  {
    id: "custody",
    name: "CustodiAI - Child Custody",
    description: "Comprehensive custody hub: Intake forms, support calculations, enforcement logs, secure co-parent messaging, court reports. Vs. OFW 4.7/5.",
    icon: Heart,
    variant: "purple" as const,
    path: "/custody",
    gradient: "from-purple-500/20 to-pink-500/20",
    border: "border-purple-500/30",
    glow: "shadow-[0_0_30px_rgba(168,85,247,0.2)]",
    iconBg: "bg-purple-500/20",
    questions: ["Custody arrangements", "Support calculator", "Parenting plans"]
  },
  {
    id: "marriage",
    name: "MaryAI - Marriage & Divorce",
    description: "Full lifecycle: Marriage licenses, vows, name changes, divorce filings, alimony calculators, mediation simulations. Vs. Rocket Lawyer 4.3/5.",
    icon: Heart,
    variant: "pink" as const,
    path: "/marriage-divorce",
    gradient: "from-pink-500/20 to-rose-500/20",
    border: "border-pink-500/30",
    glow: "shadow-[0_0_30px_rgba(236,72,153,0.2)]",
    iconBg: "bg-pink-500/20",
    questions: ["Marriage license", "Divorce filing", "Name change"]
  },
  {
    id: "defense",
    name: "DefendrAI - Criminal Defense",
    description: "Comprehensive defense: Plea outcome simulations, client portals, violation trackers, e-filing, sentencing guidance. Vs. Clio 4.7/5.",
    icon: Gavel,
    variant: "pink" as const,
    path: "/tickets-defense",
    gradient: "from-rose-500/20 to-red-500/20",
    border: "border-rose-500/30",
    glow: "shadow-[0_0_30px_rgba(244,63,94,0.2)]",
    iconBg: "bg-rose-500/20",
    questions: ["Plea simulator", "Defense strategy", "Court prep"]
  },
  {
    id: "dui",
    name: "DriveSafeAI - DUI Defense",
    description: "DUI specialists: Breathalyzer data parsers, hearing simulations, lead matching, contingency billing. Vs. MyCase 4.5/5.",
    icon: Car,
    variant: "orange" as const,
    path: "/dui-hub",
    gradient: "from-orange-500/20 to-amber-500/20",
    border: "border-orange-500/30",
    glow: "shadow-[0_0_30px_rgba(249,115,22,0.2)]",
    iconBg: "bg-orange-500/20",
    questions: ["BAC analysis", "DMV hearing", "License restoration"]
  },
  {
    id: "probation",
    name: "Freedom AI - Probation/Parole",
    description: "Comprehensive reentry: Geo-fencing alerts, recidivism predictions, rehab plan automation, caseload dashboards. Vs. Tyler 4.3/5.",
    icon: Users,
    variant: "green" as const,
    path: "/probation-parole",
    gradient: "from-green-500/20 to-emerald-500/20",
    border: "border-green-500/30",
    glow: "shadow-[0_0_30px_rgba(34,197,94,0.2)]",
    iconBg: "bg-green-500/20",
    questions: ["Probation terms", "Parole hearings", "Reentry support"]
  },
  {
    id: "will",
    name: "LegacyAI - Living Will & Estate",
    description: "Estate planning: Health scenario sims, advance directives, asset trackers, inheritance calculators, e-sign. Vs. Trust & Will 4.6/5.",
    icon: Home,
    variant: "blue" as const,
    path: "/will-hub",
    gradient: "from-blue-500/20 to-indigo-500/20",
    border: "border-blue-500/30",
    glow: "shadow-[0_0_30px_rgba(59,130,246,0.2)]",
    iconBg: "bg-blue-500/20",
    questions: ["Create will", "Living directive", "Estate plan"]
  },
  {
    id: "workplace",
    name: "WorkAI - Employment Rights",
    description: "Comprehensive workplace: HR contract generation, termination risk simulations, EEOC compliance, payroll integrations. Vs. Gusto 4.5/5.",
    icon: Building2,
    variant: "orange" as const,
    path: "/workplace-legal-aid",
    gradient: "from-orange-500/20 to-yellow-500/20",
    border: "border-orange-500/30",
    glow: "shadow-[0_0_30px_rgba(249,115,22,0.2)]",
    iconBg: "bg-orange-500/20",
    questions: ["Workplace discrimination", "EEOC filing", "Wrongful termination"]
  },
  {
    id: "academy",
    name: "ScholarAI - Legal Academy",
    description: "Comprehensive academy: Micro-certifications, AI tutors, live simulations, bar exam prep, ABA-approved paths. Vs. Lawline 4.5/5.",
    icon: GraduationCap,
    variant: "blue" as const,
    path: "/legal-academy",
    gradient: "from-blue-500/20 to-indigo-500/20",
    border: "border-blue-500/30",
    glow: "shadow-[0_0_30px_rgba(59,130,246,0.2)]",
    iconBg: "bg-blue-500/20",
    questions: ["Law courses", "Bar exam prep", "Legal certificates"]
  },
  {
    id: "telephony",
    name: "CallAI - Telephony",
    description: "AI-powered calling with live transcription and case integration.",
    icon: Phone,
    variant: "cyan" as const,
    path: "/telephony",
    gradient: "from-cyan-500/20 to-teal-500/20",
    border: "border-cyan-500/30",
    glow: "shadow-[0_0_30px_rgba(0,255,255,0.2)]",
    iconBg: "bg-cyan-500/20",
    questions: ["Make calls", "Transcription", "Call history"]
  },
  {
    id: "support",
    name: "ServeAI - Customer Support",
    description: "24/7 autonomous support. Billing, accounts, refunds, and troubleshooting.",
    icon: Headphones,
    variant: "green" as const,
    path: "/support",
    gradient: "from-green-500/20 to-cyan-500/20",
    border: "border-green-500/30",
    glow: "shadow-[0_0_30px_rgba(34,197,94,0.2)]",
    iconBg: "bg-green-500/20",
    questions: ["Billing help", "Refund request", "Account issues"]
  },
  {
    id: "document",
    name: "DocuAI - Documents",
    description: "Draft, review, sign, and store legal documents with AI assistance.",
    icon: FileText,
    variant: "blue" as const,
    path: "/generate",
    gradient: "from-blue-500/20 to-indigo-500/20",
    border: "border-blue-500/30",
    glow: "shadow-[0_0_30px_rgba(59,130,246,0.2)]",
    iconBg: "bg-blue-500/20",
    questions: ["Draft NDA", "Create contract", "Review agreement"]
  },
  {
    id: "business",
    name: "PraxisAI - Law Firm Ops",
    description: "Comprehensive firm management: 250+ integrations, trust reconciliation, unified workflows, AI cash-flow predictions. Vs. Clio 4.7/5.",
    icon: Briefcase,
    variant: "purple" as const,
    path: "/business-hub",
    gradient: "from-purple-500/20 to-pink-500/20",
    border: "border-purple-500/30",
    glow: "shadow-[0_0_30px_rgba(168,85,247,0.2)]",
    iconBg: "bg-purple-500/20",
    questions: ["Case management", "Client intake", "Firm billing"]
  },
  {
    id: "jobs",
    name: "JobAI - Legal Careers",
    description: "Comprehensive job board: AI resume/job matching, free postings, alerts. Vs. LinkedIn 4.7/5, LawJobs 4.5/5.",
    icon: Briefcase,
    variant: "cyan" as const,
    path: "/job-board",
    gradient: "from-cyan-500/20 to-blue-500/20",
    border: "border-cyan-500/30",
    glow: "shadow-[0_0_30px_rgba(0,255,255,0.2)]",
    iconBg: "bg-cyan-500/20",
    questions: ["Find jobs", "Resume match", "Career advice"]
  },
  {
    id: "probono",
    name: "ProBonoAI - Volunteer Matching",
    description: "Comprehensive pro bono: AI case-volunteer pairing, intake forms, progress trackers. Vs. Paladin 4.8/5.",
    icon: Heart,
    variant: "green" as const,
    path: "/pro-bono",
    gradient: "from-green-500/20 to-emerald-500/20",
    border: "border-green-500/30",
    glow: "shadow-[0_0_30px_rgba(34,197,94,0.2)]",
    iconBg: "bg-green-500/20",
    questions: ["Volunteer", "Get free help", "Tax benefits"]
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
              Choose your specialized AI assistant. Compared to industry leaders (Clio, OFW, LinkedIn, Paladin).
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <Badge className="bg-neon-purple/20 text-neon-purple border-neon-purple/30">
                Premium Voice Access
              </Badge>
            </div>
          </div>

          {/* Assistants Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Rating Badge */}
                <div className="absolute top-3 right-3 z-10">
                  <Badge className="bg-neon-green/30 text-neon-green border-neon-green/50 text-xs">
                    <Star className="w-3 h-3 mr-1" /> {assistant.rating}
                  </Badge>
                </div>

                {/* Premium Badge */}
                {assistant.premium && (
                  <div className="absolute top-3 left-3 z-10">
                    <Badge className="bg-neon-gold/30 text-neon-gold border-neon-gold/50 text-xs">
                      Premium
                    </Badge>
                  </div>
                )}
                
                {/* Animated background effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative p-5">
                  <div className="flex items-start gap-3">
                    {/* Animated AI Head */}
                    <div className="flex-shrink-0">
                      <AnimatedAIHead variant={assistant.variant} size="sm" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1.5 rounded-lg ${assistant.iconBg}`}>
                          <assistant.icon className="w-4 h-4 text-foreground" />
                        </div>
                        <h3 className="text-lg font-display font-semibold text-foreground truncate">
                          {assistant.name}
                        </h3>
                      </div>
                      
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {assistant.description}
                      </p>

                      {/* Common Questions */}
                      <div className="flex flex-wrap gap-1">
                        {assistant.questions.slice(0, 2).map((question, qIndex) => (
                          <span
                            key={qIndex}
                            className={`
                              text-xs px-2 py-0.5 rounded-full
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

                  {/* Start Chat indicator */}
                  <div className={`
                    absolute bottom-3 right-3 
                    px-2 py-1 rounded-full
                    bg-background/50 border ${assistant.border}
                    text-xs font-medium text-foreground/80
                    opacity-0 group-hover:opacity-100
                    transform translate-y-2 group-hover:translate-y-0
                    transition-all duration-300
                  `}>
                    Chat →
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Ad Banner - Web */}
          <AdContainer position="inline" className="mt-8">
            <AdBanner slot="5824691357" format="horizontal" />
          </AdContainer>
          {/* Ad Banner - Mobile */}
          <AdMobBanner adUnitId={ADMOB_AD_UNITS.ASSISTANTS_BANNER} size="banner" className="mt-2" />

          {/* Bottom CTA */}
          <div className="mt-8 text-center">
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
