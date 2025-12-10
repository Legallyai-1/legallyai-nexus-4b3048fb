import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Building2, Users, MapPin, Phone, Mail, Globe, 
  ArrowRight, ArrowLeft, Check, Loader2, Scale
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FuturisticBackground } from "@/components/ui/FuturisticBackground";

const steps = [
  { id: 1, title: "Firm Details", icon: Building2 },
  { id: 2, title: "Contact Info", icon: Phone },
  { id: 3, title: "Team Setup", icon: Users },
  { id: 4, title: "Confirmation", icon: Check },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firmName: "",
    description: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
    website: "",
    teamSize: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in first");
        navigate("/lawyers");
        return;
      }

      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .insert({
          name: formData.firmName,
          description: formData.description,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          phone: formData.phone,
          email: formData.email,
          website: formData.website,
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Add the user as owner
      const { error: memberError } = await supabase
        .from("organization_members")
        .insert({
          organization_id: org.id,
          user_id: user.id,
          job_title: "Owner",
          department: "Management",
        });

      if (memberError) throw memberError;

      // Add owner role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: user.id,
          organization_id: org.id,
          role: "owner",
        });

      if (roleError) throw roleError;

      toast.success("Law firm created successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to create organization");
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
    else handleSubmit();
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <Layout>
      <FuturisticBackground>
        <div className="min-h-screen py-12">
          <div className="container mx-auto px-4 max-w-3xl">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-green/10 border border-neon-green/30 mb-4">
                <Scale className="h-4 w-4 text-neon-green" />
                <span className="text-sm font-medium text-neon-green">Law Firm Onboarding</span>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                Set Up Your <span className="text-neon-green">Law Firm</span>
              </h1>
              <p className="text-muted-foreground">Complete these steps to get started with LegallyAI</p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2 mb-12">
              {steps.map((step, i) => (
                <div key={step.id} className="flex items-center">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      currentStep >= step.id 
                        ? "bg-neon-green text-background" 
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-16 h-1 mx-2 rounded ${
                      currentStep > step.id ? "bg-neon-green" : "bg-muted"
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Form Card */}
            <div className="glass-card p-8 rounded-2xl border-neon-green/20">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-neon-green" />
                    Firm Details
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="firmName">Law Firm Name *</Label>
                      <Input
                        id="firmName"
                        name="firmName"
                        value={formData.firmName}
                        onChange={handleChange}
                        placeholder="Smith & Associates Law Firm"
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Tell us about your practice areas and specialties..."
                        className="mt-1 min-h-[100px]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-neon-green" />
                    Contact Information
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="address">Street Address</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="123 Legal Ave, Suite 100"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="New York"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="NY"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        placeholder="10001"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="(555) 123-4567"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="contact@lawfirm.com"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://lawfirm.com"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
                    <Users className="h-5 w-5 text-neon-green" />
                    Team Setup
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="teamSize">How many team members do you have?</Label>
                      <Input
                        id="teamSize"
                        name="teamSize"
                        type="number"
                        value={formData.teamSize}
                        onChange={handleChange}
                        placeholder="5"
                        className="mt-1"
                      />
                    </div>
                    <div className="glass-card p-4 rounded-lg bg-neon-green/5 border-neon-green/20">
                      <p className="text-sm text-muted-foreground">
                        You can invite team members after setup is complete. Each member will receive 
                        an email invitation to join your firm on LegallyAI.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
                    <Check className="h-5 w-5 text-neon-green" />
                    Confirm Details
                  </h2>
                  <div className="space-y-4">
                    <div className="glass-card p-4 rounded-lg">
                      <h3 className="font-semibold text-foreground mb-2">{formData.firmName || "Your Law Firm"}</h3>
                      {formData.description && (
                        <p className="text-sm text-muted-foreground mb-3">{formData.description}</p>
                      )}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {formData.address && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {formData.address}
                          </div>
                        )}
                        {formData.phone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            {formData.phone}
                          </div>
                        )}
                        {formData.email && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            {formData.email}
                          </div>
                        )}
                        {formData.website && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Globe className="h-4 w-4" />
                            {formData.website}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-border/30">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  variant="neon-green"
                  onClick={nextStep}
                  disabled={isLoading || (currentStep === 1 && !formData.firmName)}
                  className="gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : currentStep === 4 ? (
                    <>
                      Create Firm
                      <Check className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </FuturisticBackground>
    </Layout>
  );
}
