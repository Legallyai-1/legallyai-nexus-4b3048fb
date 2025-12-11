import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Scale, Building2, User, KeyRound, Briefcase, Users, GraduationCap } from "lucide-react";
import { loginSchema, signupSchema } from "@/lib/validations/auth";
import { useRoleBasedRedirect } from "@/hooks/useRoleBasedRedirect";

type UserType = "individual" | "lawyer" | "lawfirm" | "employee" | "student";

export default function AuthPage() {
  const navigate = useNavigate();
  const { redirectToHub } = useRoleBasedRedirect();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [userType, setUserType] = useState<UserType>("individual");
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});
  const [signupErrors, setSignupErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const path = await redirectToHub();
        navigate(path);
      }
    };
    checkSession();
  }, [navigate, redirectToHub]);

  const validateLoginField = (field: "email" | "password", value: string) => {
    const result = loginSchema.shape[field].safeParse(value);
    if (!result.success) {
      setLoginErrors(prev => ({ ...prev, [field]: result.error.errors[0].message }));
    } else {
      setLoginErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateSignupField = (field: "name" | "email" | "password", value: string) => {
    const result = signupSchema.shape[field].safeParse(value);
    if (!result.success) {
      setSignupErrors(prev => ({ ...prev, [field]: result.error.errors[0].message }));
    } else {
      setSignupErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      validation.error.errors.forEach(err => {
        const field = err.path[0] as keyof typeof fieldErrors;
        if (!fieldErrors[field]) {
          fieldErrors[field] = err.message;
        }
      });
      setLoginErrors(fieldErrors);
      toast.error("Please fix the form errors");
      return;
    }

    setIsLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }
    
    toast.success("Logged in successfully!");
    const path = await redirectToHub();
    navigate(path);
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = signupSchema.safeParse({ name: fullName, email, password });
    if (!validation.success) {
      const fieldErrors: { name?: string; email?: string; password?: string } = {};
      validation.error.errors.forEach(err => {
        const field = err.path[0] as keyof typeof fieldErrors;
        if (!fieldErrors[field]) {
          fieldErrors[field] = err.message;
        }
      });
      setSignupErrors(fieldErrors);
      toast.error("Please fix the form errors");
      return;
    }

    setIsLoading(true);
    
    // Determine redirect based on user type
    const typeToPath: Record<UserType, string> = {
      individual: "/ai-assistants",
      lawyer: "/dashboard",
      lawfirm: "/admin",
      employee: "/employee",
      student: "/legal-academy",
    };
    
    const redirectPath = typeToPath[userType];
    const redirectUrl = `${window.location.origin}${redirectPath}`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          user_type: userType,
        }
      }
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Account created! Redirecting...");
      // Auto-login for immediate access
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (!signInError) {
        navigate(redirectPath);
      }
    }
    setIsLoading(false);
  };

  const userTypes: { type: UserType; icon: any; label: string; description: string }[] = [
    { type: "individual", icon: User, label: "Individual", description: "Get legal help" },
    { type: "lawyer", icon: Briefcase, label: "Lawyer", description: "Manage practice" },
    { type: "lawfirm", icon: Building2, label: "Law Firm", description: "Full firm management" },
    { type: "employee", icon: Users, label: "Employee", description: "Staff portal" },
    { type: "student", icon: GraduationCap, label: "Student", description: "Legal academy" },
  ];

  return (
    <div className="min-h-screen bg-legal-navy flex items-center justify-center p-4">
      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              backgroundColor: i % 3 === 0 
                ? 'hsl(45 93% 58% / 0.6)' 
                : i % 3 === 1 
                  ? 'hsl(187 100% 42% / 0.5)' 
                  : 'hsl(0 0% 100% / 0.3)',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${Math.random() * 4 + 4}s`,
            }}
          />
        ))}
      </div>

      <Card className="w-full max-w-md relative z-10 bg-card/95 backdrop-blur-xl border-border/50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-legal-gold/10 rounded-xl">
              <Scale className="h-8 w-8 text-legal-gold" />
            </div>
          </div>
          <CardTitle className="text-2xl font-display">LegallyAI</CardTitle>
          <CardDescription>Access your law firm management portal</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (loginErrors.email) validateLoginField("email", e.target.value);
                    }}
                    onBlur={() => validateLoginField("email", email)}
                    placeholder="your@email.com"
                    className={loginErrors.email ? "border-destructive" : ""}
                    aria-invalid={!!loginErrors.email}
                  />
                  {loginErrors.email && (
                    <p className="text-sm text-destructive">{loginErrors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (loginErrors.password) validateLoginField("password", e.target.value);
                    }}
                    onBlur={() => validateLoginField("password", password)}
                    placeholder="••••••••"
                    className={loginErrors.password ? "border-destructive" : ""}
                    aria-invalid={!!loginErrors.password}
                  />
                  {loginErrors.password && (
                    <p className="text-sm text-destructive">{loginErrors.password}</p>
                  )}
                </div>
                <Button type="submit" variant="gold" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
                <Link to="/forgot-password" className="block mt-3">
                  <Button variant="ghost" type="button" className="w-full text-sm text-muted-foreground hover:text-legal-gold gap-2">
                    <KeyRound className="h-4 w-4" />
                    Forgot Password?
                  </Button>
                </Link>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (signupErrors.name) validateSignupField("name", e.target.value);
                    }}
                    onBlur={() => validateSignupField("name", fullName)}
                    placeholder="John Doe"
                    className={signupErrors.name ? "border-destructive" : ""}
                    aria-invalid={!!signupErrors.name}
                  />
                  {signupErrors.name && (
                    <p className="text-sm text-destructive">{signupErrors.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (signupErrors.email) validateSignupField("email", e.target.value);
                    }}
                    onBlur={() => validateSignupField("email", email)}
                    placeholder="your@email.com"
                    className={signupErrors.email ? "border-destructive" : ""}
                    aria-invalid={!!signupErrors.email}
                  />
                  {signupErrors.email && (
                    <p className="text-sm text-destructive">{signupErrors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (signupErrors.password) validateSignupField("password", e.target.value);
                    }}
                    onBlur={() => validateSignupField("password", password)}
                    placeholder="••••••••"
                    className={signupErrors.password ? "border-destructive" : ""}
                    aria-invalid={!!signupErrors.password}
                  />
                  {signupErrors.password && (
                    <p className="text-sm text-destructive">{signupErrors.password}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Min 8 chars with uppercase, lowercase, and number
                  </p>
                </div>
                
                {/* User Type Selector */}
                <div className="space-y-2">
                  <Label>I am a...</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {userTypes.map((ut) => (
                      <button
                        key={ut.type}
                        type="button"
                        onClick={() => setUserType(ut.type)}
                        className={`flex items-center gap-2 p-3 rounded-lg border transition-all text-left ${
                          userType === ut.type 
                            ? "border-legal-gold bg-legal-gold/10 text-legal-gold" 
                            : "border-border hover:border-legal-gold/50"
                        }`}
                      >
                        <ut.icon className="h-4 w-4" />
                        <div>
                          <span className="text-sm font-medium">{ut.label}</span>
                          <p className="text-xs text-muted-foreground">{ut.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <Button type="submit" variant="gold" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 pt-6 border-t border-border/50">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Each account type has a dedicated portal:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <User className="h-3 w-3 text-legal-cyan" />
                <span>AI Assistants Hub</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <Briefcase className="h-3 w-3 text-legal-gold" />
                <span>Lawyer Dashboard</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <Building2 className="h-3 w-3 text-purple-400" />
                <span>Admin Panel</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <Users className="h-3 w-3 text-green-400" />
                <span>Employee Portal</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
