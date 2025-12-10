import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Scale, FileText, Users, BarChart3, Clock, 
  CheckCircle, ArrowRight, Lock, Shield
} from "lucide-react";
import { toast } from "sonner";

const features = [
  {
    icon: FileText,
    title: "Document Templates",
    description: "Access 100+ professional legal document templates",
  },
  {
    icon: Users,
    title: "Client Management",
    description: "Organize clients, cases, and documents in one place",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track billable hours, case progress, and revenue",
  },
  {
    icon: Clock,
    title: "Time Tracking",
    description: "Automatic time tracking for billing accuracy",
  },
];

const benefits = [
  "50% faster document drafting",
  "AI-powered research assistance",
  "State-specific compliance checks",
  "Secure client portal",
  "E-signature integration",
  "Court deadline reminders",
];

export default function LawyerPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info("Lawyer portal authentication will be available once backend is connected");
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-20 bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 legal-pattern opacity-20" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-legal-gold/10 border border-legal-gold/30 mb-6">
              <Scale className="h-4 w-4 text-legal-gold" />
              <span className="text-sm font-medium text-legal-gold">For Legal Professionals</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Lawyer Portal
            </h1>
            <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              Streamline your practice with AI-powered document generation, 
              client management, and legal research tools.
            </p>
          </div>
        </div>
      </section>

      <div className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Left Column - Features */}
            <div>
              <h2 className="font-display text-3xl font-bold text-foreground mb-8">
                Built for Modern Law Practices
              </h2>

              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                {features.map((feature, i) => (
                  <div key={i} className="p-5 rounded-xl bg-muted border border-border">
                    <div className="w-10 h-10 rounded-lg bg-legal-gold/10 flex items-center justify-center mb-3">
                      <feature.icon className="h-5 w-5 text-legal-gold" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                ))}
              </div>

              <div className="p-6 rounded-xl bg-gradient-to-br from-legal-gold/10 to-amber-500/5 border border-legal-gold/20">
                <h3 className="font-display text-xl font-semibold text-foreground mb-4">
                  Why Lawyers Choose LegallyAI
                </h3>
                <ul className="space-y-3">
                  {benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-legal-gold shrink-0" />
                      <span className="text-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column - Login Form */}
            <div className="lg:pl-8">
              <div className="p-8 rounded-2xl bg-card border border-border shadow-card">
                <div className="flex items-center gap-2 mb-6">
                  <Lock className="h-5 w-5 text-legal-gold" />
                  <h2 className="font-display text-2xl font-semibold text-foreground">
                    {isLogin ? "Lawyer Login" : "Create Account"}
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@lawfirm.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="bar">Bar Number (Optional)</Label>
                      <Input
                        id="bar"
                        placeholder="Your state bar number"
                      />
                    </div>
                  )}

                  <Button type="submit" variant="gold" size="lg" className="w-full">
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm text-muted-foreground hover:text-legal-gold transition-colors"
                  >
                    {isLogin
                      ? "Don't have an account? Sign up"
                      : "Already have an account? Sign in"}
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>HIPAA & Attorney-Client Privilege Compliant</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Need help? Contact{" "}
                  <a href="mailto:lawyers@legallyai.ai" className="text-legal-gold hover:underline">
                    lawyers@legallyai.ai
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
