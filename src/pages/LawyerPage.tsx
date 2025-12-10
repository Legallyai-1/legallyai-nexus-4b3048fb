import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Scale, FileText, Users, BarChart3, Clock, 
  CheckCircle, ArrowRight, Lock, Shield, Loader2, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FuturisticBackground } from "@/components/ui/FuturisticBackground";
import { AnimatedAIHead } from "@/components/ui/AnimatedAIHead";
import { loginSchema, lawyerSignupSchema } from "@/lib/validations/auth";

const features = [
  {
    icon: FileText,
    title: "Document Templates",
    description: "Access 100+ professional legal document templates",
    color: "neon-green",
  },
  {
    icon: Users,
    title: "Client Management",
    description: "Organize clients, cases, and documents in one place",
    color: "neon-cyan",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track billable hours, case progress, and revenue",
    color: "neon-blue",
  },
  {
    icon: Clock,
    title: "Time Tracking",
    description: "Automatic time tracking for billing accuracy",
    color: "neon-purple",
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
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        navigate("/dashboard");
      }
    };
    checkAuth();
  }, [navigate]);

  const validateField = (field: "email" | "password", value: string) => {
    const schema = isLogin ? loginSchema : lawyerSignupSchema;
    const result = schema.shape[field].safeParse(value);
    if (!result.success) {
      setErrors(prev => ({ ...prev, [field]: result.error.errors[0].message }));
    } else {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const schema = isLogin ? loginSchema : lawyerSignupSchema;
    const validation = schema.safeParse({ email, password });
    if (!validation.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      validation.error.errors.forEach(err => {
        const field = err.path[0] as keyof typeof fieldErrors;
        if (!fieldErrors[field]) {
          fieldErrors[field] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast.error("Please fix the form errors");
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              role: "lawyer",
            },
          },
        });
        if (error) throw error;
        toast.success("Account created! You can now sign in.");
        setIsLogin(true);
        setErrors({});
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <FuturisticBackground>
        {/* Hero */}
        <section className="relative py-20 overflow-hidden">
          <div className="container mx-auto px-4 relative">
            <div className="max-w-4xl mx-auto text-center">
              {/* Animated AI Head */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-neon-green/20 blur-3xl rounded-full scale-150" />
                  <AnimatedAIHead variant="green" size="lg" />
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-green/10 border border-neon-green/30 mb-6">
                <Scale className="h-4 w-4 text-neon-green" />
                <span className="text-sm font-medium text-neon-green">For Legal Professionals</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-6 text-foreground">
                Lawyer <span className="text-neon-green">Portal</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Streamline your practice with AI-powered document generation, 
                client management, and legal research tools.
              </p>
            </div>
          </div>
        </section>

        <div className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Left Column - Features */}
              <div>
                <h2 className="font-display text-3xl font-bold text-foreground mb-8">
                  Built for <span className="text-neon-green">Modern</span> Law Practices
                </h2>

                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  {features.map((feature, i) => (
                    <div 
                      key={i} 
                      className="glass-card-hover p-5 rounded-xl"
                    >
                      <div className={`w-10 h-10 rounded-xl bg-${feature.color}/10 flex items-center justify-center mb-3`}>
                        <feature.icon className={`h-5 w-5 text-${feature.color}`} />
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  ))}
                </div>

                <div className="glass-card p-6 rounded-xl border-neon-green/20 bg-gradient-to-br from-neon-green/5 to-neon-cyan/5">
                  <h3 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-neon-green" />
                    Why Lawyers Choose LegallyAI
                  </h3>
                  <ul className="space-y-3">
                    {benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-neon-green shrink-0" />
                        <span className="text-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Column - Login Form */}
              <div className="lg:pl-8">
                <div className="glass-card p-8 rounded-2xl border-neon-green/20">
                  <div className="flex items-center gap-2 mb-6">
                    <Lock className="h-5 w-5 text-neon-green" />
                    <h2 className="font-display text-2xl font-semibold text-foreground">
                      {isLogin ? "Lawyer Login" : "Create Account"}
                    </h2>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) validateField("email", e.target.value);
                        }}
                        onBlur={() => validateField("email", email)}
                        placeholder="you@lawfirm.com"
                        className={`bg-muted/50 border-border/50 focus:border-neon-green/50 focus:shadow-glow-green transition-all ${errors.email ? "border-destructive" : ""}`}
                        aria-invalid={!!errors.email}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-foreground">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password) validateField("password", e.target.value);
                        }}
                        onBlur={() => validateField("password", password)}
                        placeholder="••••••••"
                        className={`bg-muted/50 border-border/50 focus:border-neon-green/50 focus:shadow-glow-green transition-all ${errors.password ? "border-destructive" : ""}`}
                        aria-invalid={!!errors.password}
                      />
                      {errors.password && (
                        <p className="text-sm text-destructive">{errors.password}</p>
                      )}
                      {!isLogin && (
                        <p className="text-xs text-muted-foreground">
                          Min 8 chars with uppercase, lowercase, and number
                        </p>
                      )}
                    </div>

                    {!isLogin && (
                      <div className="space-y-2">
                        <Label htmlFor="bar" className="text-foreground">Bar Number (Optional)</Label>
                        <Input
                          id="bar"
                          placeholder="Your state bar number"
                          className="bg-muted/50 border-border/50 focus:border-neon-green/50 focus:shadow-glow-green transition-all"
                        />
                      </div>
                    )}

                    <Button type="submit" variant="neon-green" size="lg" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          {isLogin ? "Sign In" : "Create Account"}
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(!isLogin);
                        setErrors({});
                      }}
                      className="text-sm text-muted-foreground hover:text-neon-green transition-colors"
                    >
                      {isLogin
                        ? "Don't have an account? Sign up"
                        : "Already have an account? Sign in"}
                    </button>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border/30">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4 text-neon-green" />
                      <span>HIPAA & Attorney-Client Privilege Compliant</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Need help? Contact{" "}
                    <a href="mailto:lawyers@legallyai.ai" className="text-neon-green hover:underline">
                      lawyers@legallyai.ai
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FuturisticBackground>
    </Layout>
  );
}
