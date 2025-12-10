import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scale, Sparkles, ArrowRight, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const benefits = [
  "Generate unlimited legal documents",
  "AI-powered legal chat assistant",
  "50+ document templates",
  "State-specific compliance",
];

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate signup (will be replaced with real auth when backend is connected)
    setTimeout(() => {
      toast.info("Sign up will be available once authentication is connected");
      setIsLoading(false);
    }, 1500);
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
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="h-12"
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
                  className="h-12"
                />
              </div>

              <Button
                type="submit"
                variant="gold"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
                <ArrowRight className="h-4 w-4" />
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
