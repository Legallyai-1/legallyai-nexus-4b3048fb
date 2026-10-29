import { useState, useEffect } from "react";
import { LeeAvatar } from "@/components/brand/LeeAvatar";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FileText, Users, Clock, Lock, Shield, Loader2, ArrowRight, Check, FolderOpen, FileSearch,
  BookOpenCheck, Receipt, CalendarClock, KeyRound, CreditCard, Building2, Mail,
} from "lucide-react";
import { toast } from "sonner";
import { GlowScales } from "@/components/brand/GlowScales";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { loginSchema, lawyerSignupSchema } from "@/lib/validations/auth";

// Every capability listed here is a working part of the app.
const features = [
  { icon: FolderOpen, title: "Case files & AI analysis", description: "Matters, notes, documents and AI summaries in one workspace" },
  { icon: Users, title: "Clients & client portal", description: "Client records, intake and a secure portal for clients" },
  { icon: FileText, title: "AI document drafting", description: "First drafts of letters, motions and agreements" },
  { icon: FileSearch, title: "Contract redline", description: "Clause-level risk flags and suggested redlines" },
  { icon: BookOpenCheck, title: "Legal research", description: "Plain-English research answers" },
  { icon: Receipt, title: "Billing & trust accounting", description: "Time, invoices and trust ledgers in the Business Hub" },
  { icon: CalendarClock, title: "Deadlines & calendar", description: "Court dates and appointments with reminders" },
  { icon: Clock, title: "Time tracking", description: "Clock time against matters for accurate billing" },
];

// Plans by firm size. Prices match the published pricing; checkout lives on /pricing.
const plans = [
  { name: "Solo", price: "$29", period: "/month", seats: "1 seat for one attorney or paralegal", points: ["Case workspace", "Client portal", "AI drafting & hearing prep"], cta: "Start 7-day free trial", to: "/pricing?plan=solo" },
  { name: "Firm", price: "$99", period: "/month", seats: "3 seats included, extra seats $25/month", points: ["Case files & client portal", "AI drafting, redlines & research", "Billing & trust accounting"], cta: "Start 7-day free trial", to: "/pricing?plan=firm", highlight: true },
  { name: "Enterprise", price: "$299", period: "/month", seats: "10 seats included, extra seats $25/month", points: ["Everything in Firm", "Room for larger teams", "Same 7-day first-subscription trial"], cta: "Start 7-day free trial", to: "/pricing?plan=enterprise" },
];

// Factual statements about how the app handles data today. No certifications are claimed.
const security = [
  { icon: Building2, title: "Data isolated per organization", description: "Database row-level security policies keep each firm's records separate." },
  { icon: KeyRound, title: "Role-based access", description: "Owner, admin and staff roles control who sees which hub features." },
  { icon: Lock, title: "Encrypted in transit", description: "All traffic to legallyai.ai is served over HTTPS." },
  { icon: CreditCard, title: "Payments by Stripe", description: "Card details go to Stripe Checkout; LegallyAI never stores card numbers." },
];

const DEMO_MAILTO = "mailto:support@legallyai.ai?subject=LegallyAI%20firm%20demo";

export default function LawyerPage() {
  const navigate = useNavigate();
  const { hash } = useLocation();

  // BrowserRouter doesn't scroll to #anchors after client-side navigation (e.g. /lawyers#plans).
  useEffect(() => {
    if (!hash) return;
    const id = decodeURIComponent(hash.slice(1));
    const frame = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
    return () => cancelAnimationFrame(frame);
  }, [hash]);
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
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            // Same metadata key the main signup (AuthPage) uses for the account type.
            data: {
              user_type: "lawyer",
            },
          },
        });
        if (error) throw error;
        if (data.session) {
          toast.success("Account created! Welcome to LegallyAI.");
          navigate("/dashboard");
          return;
        }
        toast.success("Check your email to confirm your account, then sign in.");
        setIsLogin(true);
        setErrors({});
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error && error.message ? error.message : "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const startTrial = () => {
    setIsLogin(false);
    setErrors({});
    document.getElementById("account")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Layout>
      <div className="hub-theme hub-bg text-foreground">
        {/* Hero: one line of value, two CTAs. */}
        <section className="px-4 pt-10 pb-12 sm:pt-16">
          <div className="container mx-auto max-w-6xl grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] gap-8 items-center">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 rounded-full metal-card px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                <GlowScales className="h-4 w-4" sparkles={false} /> For law firms
              </p>
              <h1 className="mt-4 font-display text-3xl sm:text-5xl font-bold leading-tight break-words">
                The AI workspace for your practice, <span className="gold-text">from solo to enterprise</span>
              </h1>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
                Draft faster, review contracts, research with sources, and run cases, clients, billing and trust accounting in one place, with Lee as your AI partner.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button size="lg" onClick={startTrial} className="font-semibold">Create firm account <ArrowRight className="ml-1.5 h-4 w-4" /></Button>
                <Button asChild size="lg" variant="outline" className="bg-white/70"><a href={DEMO_MAILTO}><Mail className="mr-1.5 h-4 w-4" />Book a demo</a></Button>
              </div>
            </div>
            <LeeAvatar heightClass="h-80" alt="Lee, the LegallyAI assistant, holding the scales of justice" className="hidden lg:flex mx-auto" />
          </div>
        </section>

        <section className="px-4 py-10" aria-labelledby="features-heading">
          <div className="container mx-auto max-w-6xl">
            <h2 id="features-heading" className="font-display text-2xl sm:text-3xl font-bold">Built for how firms work</h2>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {features.map((feature) => (
                <div key={feature.title} className="metal-card rounded-2xl p-4">
                  <span className="metal-icon-well h-10 w-10"><feature.icon className="h-5 w-5" aria-hidden="true" /></span>
                  <h3 className="mt-3 font-semibold">{feature.title}</h3>
                  <p className="mt-1 text-sm text-[hsl(218_22%_30%)]">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="plans" className="px-4 py-10 scroll-mt-20" aria-labelledby="plans-heading">
          <div className="container mx-auto max-w-6xl">
            <h2 id="plans-heading" className="font-display text-2xl sm:text-3xl font-bold">Plans by firm size</h2>
            <p className="mt-1 text-muted-foreground">Firm includes a 7-day free trial on your first subscription only. Prices in USD before tax.</p>
            <div className="mt-6 grid md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <div key={plan.name} className="metal-card rounded-3xl p-6 flex flex-col" data-active={plan.highlight ? "true" : undefined}>
                  <h3 className="font-display text-xl font-bold">{plan.name}</h3>
                  <p className="mt-2"><span className="text-4xl font-bold">{plan.price}</span> <span className="text-sm text-[hsl(218_22%_30%)]">{plan.period}</span></p>
                  <p className="mt-1 text-sm font-medium">{plan.seats}</p>
                  <ul className="mt-4 space-y-2 flex-1">
                    {plan.points.map((point) => (
                      <li key={point} className="flex items-center gap-2 text-sm"><Check className="metal-icon h-4 w-4 shrink-0" aria-hidden="true" />{point}</li>
                    ))}
                  </ul>
                  <Button asChild className={`mt-5 ${plan.highlight ? "gold-tile border-0 font-semibold" : ""}`} variant={plan.highlight ? "default" : "outline"}>
                    <Link to={plan.to}>{plan.cta}</Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-10" aria-labelledby="security-heading">
          <div className="container mx-auto max-w-6xl">
            <h2 id="security-heading" className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-2"><Shield className="metal-icon h-7 w-7" aria-hidden="true" /> Security & data handling</h2>
            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {security.map((item) => (
                <div key={item.title} className="glass-panel rounded-2xl p-4">
                  <item.icon className="metal-icon h-5 w-5" aria-hidden="true" />
                  <h3 className="mt-2 font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Lee provides legal information to support your work; attorneys remain responsible for advice given to clients.</p>
          </div>
        </section>

        <section id="account" className="px-4 py-12 scroll-mt-20">
          <div className="container mx-auto max-w-md">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl">
              <div className="flex items-center gap-2 mb-6">
                <Lock className="metal-icon h-5 w-5" aria-hidden="true" />
                <h2 className="font-display text-2xl font-semibold">{isLogin ? "Lawyer sign in" : "Create your firm account"}</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) validateField("email", e.target.value);
                    }}
                    onBlur={() => validateField("email", email)}
                    placeholder="you@lawfirm.com"
                    className={`bg-white/80 ${errors.email ? "border-destructive" : ""}`}
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) validateField("password", e.target.value);
                    }}
                    onBlur={() => validateField("password", password)}
                    placeholder="••••••••"
                    className={`bg-white/80 ${errors.password ? "border-destructive" : ""}`}
                    aria-invalid={!!errors.password}
                  />
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  {!isLogin && <p className="text-xs text-muted-foreground">Min 8 chars with uppercase, lowercase, and number</p>}
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="bar">Bar number (optional)</Label>
                    <Input id="bar" placeholder="Your state bar number" className="bg-white/80" />
                  </div>
                )}

                <Button type="submit" size="lg" className="w-full gold-tile border-0 font-semibold" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{isLogin ? "Sign in" : "Create account"} <ArrowRight className="h-4 w-4" /></>}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setErrors({});
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>
            </div>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Questions? <a href="mailto:lawyers@legallyai.ai" className="font-medium text-[hsl(36_85%_30%)] hover:underline">lawyers@legallyai.ai</a>
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
}
