import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scale, Sparkles, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { signupSchema } from "@/lib/validations/auth";

const benefits = [
  "Generate unlimited legal documents",
  "AI-powered legal chat assistant",
  "50+ document templates",
  "State-specific compliance",
];

export default function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        navigate("/dashboard");
      }
    };
    checkAuth();
  }, [navigate]);

  const validateField = (field: "name" | "email" | "password", value: string) => {
    const result = signupSchema.shape[field].safeParse(value);
    if (!result.success) {
      setErrors(prev => ({ ...prev, [field]: result.error.errors[0].message }));
    } else {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = signupSchema.safeParse({ name, email, password });
    if (!validation.success) {
      const fieldErrors: { name?: string; email?: string; password?: string } = {};
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
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: name,
          },
        },
      });
      if (error) throw error;
      toast.success("Account created successfully! You can now sign in.");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Sign up failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-4rem)] flex">
        {/* Left Side - Form */}
        <div className="flex-1 flex items-center justify-center p-8 bg-background">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <Link to="/" className="inline-flex items-center gap-2 mb-6">
                <Scale className="h-8 w-8 text-legal-gold" />
                <span className="font-display text-2xl font-bold">
                  <span className="text-foreground">Legally</span>
                  <span className="text-legal-gold">AI</span>
                </span>
              </Link>
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                Create Your Account
              </h1>
              <p className="text-muted-foreground">
                Start generating legal documents in seconds
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) validateField("name", e.target.value);
                  }}
                  onBlur={() => validateField("name", name)}
                  placeholder="John Doe"
                  className={`h-12 ${errors.name ? "border-destructive" : ""}`}
                  aria-invalid={!!errors.name}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) validateField("email", e.target.value);
                  }}
                  onBlur={() => validateField("email", email)}
                  placeholder="you@example.com"
                  className={`h-12 ${errors.email ? "border-destructive" : ""}`}
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
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
                  className={`h-12 ${errors.password ? "border-destructive" : ""}`}
                  aria-invalid={!!errors.password}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Min 8 characters with uppercase, lowercase, and number
                </p>
              </div>

              <Button
                type="submit"
                variant="gold"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  <>
                    Create Account
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-legal-gold font-medium hover:underline">
                Sign in
              </Link>
            </p>

            <p className="mt-8 text-center text-xs text-muted-foreground">
              By signing up, you agree to our{" "}
              <Link to="/terms" className="text-legal-gold hover:underline">Terms</Link>
              {" "}and{" "}
              <Link to="/privacy" className="text-legal-gold hover:underline">Privacy Policy</Link>
            </p>
          </div>
        </div>

        {/* Right Side - Benefits */}
        <div className="hidden lg:flex flex-1 bg-primary text-primary-foreground p-12 items-center justify-center">
          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-legal-gold/10 border border-legal-gold/30 mb-8">
              <Sparkles className="h-4 w-4 text-legal-gold" />
              <span className="text-sm font-medium text-legal-gold">Free to Start</span>
            </div>

            <h2 className="font-display text-3xl font-bold mb-6">
              Get Professional Legal Documents Instantly
            </h2>

            <ul className="space-y-4 mb-8">
              {benefits.map((benefit, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-legal-gold shrink-0" />
                  <span className="text-primary-foreground/90">{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="p-6 rounded-xl bg-primary-foreground/5 border border-primary-foreground/10">
              <p className="text-primary-foreground/80 italic">
                "LegallyAI saved me hours of work. The documents are professional 
                and legally sound. Highly recommend!"
              </p>
              <p className="mt-3 font-semibold text-legal-gold">
                — Sarah M., Small Business Owner
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
