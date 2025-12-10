import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, Scale, Users, DollarSign, FileText, 
  MapPin, Clock, ArrowRight, Search, ExternalLink,
  GraduationCap, Building2, CheckCircle
} from "lucide-react";
import { FuturisticBackground } from "@/components/ui/FuturisticBackground";
import { AnimatedAIHead } from "@/components/ui/AnimatedAIHead";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const proBonoOpportunities = [
  {
    id: "1",
    title: "Family Law Assistance",
    organization: "Legal Aid Society",
    location: "New York, NY",
    type: "Ongoing",
    hours: "10+ hours/month",
    description: "Help low-income families with custody, divorce, and domestic violence matters.",
    skills: ["Family Law", "Client Interviews", "Court Filings"],
    taxDeductible: true
  },
  {
    id: "2",
    title: "Immigration Clinic",
    organization: "Immigrant Defense Project",
    location: "Remote / Nationwide",
    type: "Project-based",
    hours: "5-10 hours/case",
    description: "Assist asylum seekers with applications, interviews, and court representation.",
    skills: ["Immigration Law", "Spanish/Other Languages", "Asylum Procedures"],
    taxDeductible: true
  },
  {
    id: "3",
    title: "Small Business Legal Clinic",
    organization: "Volunteer Lawyers for the Arts",
    location: "Los Angeles, CA",
    type: "Weekly",
    hours: "4 hours/week",
    description: "Provide transactional legal services to artists, musicians, and creative entrepreneurs.",
    skills: ["Contract Law", "Business Formation", "IP Basics"],
    taxDeductible: true
  },
  {
    id: "4",
    title: "Expungement Project",
    organization: "Clean Slate Initiative",
    location: "Chicago, IL",
    type: "Event-based",
    hours: "Full day events",
    description: "Help eligible individuals clear their criminal records at community expungement clinics.",
    skills: ["Criminal Law", "Record Review", "Client Counseling"],
    taxDeductible: true
  },
];

const taxBenefits = [
  {
    title: "Mileage Deduction",
    description: "Deduct travel to and from pro bono work at the IRS standard rate.",
    rate: "$0.67/mile (2024)"
  },
  {
    title: "Out-of-Pocket Expenses",
    description: "Deduct court fees, copying costs, and other expenses you pay for pro bono clients.",
    rate: "100% deductible"
  },
  {
    title: "CLE Credits",
    description: "Many states offer CLE credit for pro bono service hours.",
    rate: "Varies by state"
  },
];

const helpSeekers = [
  {
    title: "Legal Aid Societies",
    description: "Free legal help for low-income individuals. Income limits apply.",
    action: "Find Local Legal Aid"
  },
  {
    title: "Law School Clinics",
    description: "Free representation by law students under attorney supervision.",
    action: "Find Law School Clinics"
  },
  {
    title: "Bar Association Referrals",
    description: "Many bar associations offer free consultations and reduced-fee programs.",
    action: "Contact Your Bar"
  },
];

export default function ProBonoPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [userType, setUserType] = useState<"lawyer" | "client">("lawyer");

  const filteredOpportunities = proBonoOpportunities.filter(opp =>
    opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opp.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opp.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSignUp = (oppId: string) => {
    toast.success("Interest submitted! The organization will contact you soon.");
  };

  const handleFindHelp = () => {
    navigate("/chat?topic=probono");
  };

  return (
    <Layout>
      <FuturisticBackground>
        {/* Hero */}
        <section className="relative py-16 overflow-hidden">
          <div className="container mx-auto px-4 relative">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-neon-pink/20 blur-3xl rounded-full scale-150" />
                  <AnimatedAIHead variant="pink" size="lg" />
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-pink/10 border border-neon-pink/30 mb-6">
                <Heart className="h-4 w-4 text-neon-pink" />
                <span className="text-sm font-medium text-neon-pink">Pro Bono Legal Services</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-foreground">
                Legal Help for <span className="text-neon-pink">Everyone</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Connecting lawyers who want to give back with people who need legal help.
                Pro bono work benefits everyone.
              </p>

              {/* User Type Toggle */}
              <div className="inline-flex rounded-full p-1 bg-muted/50">
                <button
                  onClick={() => setUserType("lawyer")}
                  className={`px-6 py-2 rounded-full transition-all ${
                    userType === "lawyer" 
                      ? "bg-neon-pink text-background" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  I'm a Lawyer
                </button>
                <button
                  onClick={() => setUserType("client")}
                  className={`px-6 py-2 rounded-full transition-all ${
                    userType === "client" 
                      ? "bg-neon-pink text-background" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  I Need Help
                </button>
              </div>
            </div>
          </div>
        </section>

        {userType === "lawyer" ? (
          <>
            {/* Tax Benefits */}
            <section className="py-12 bg-muted/20">
              <div className="container mx-auto px-4">
                <div className="max-w-5xl mx-auto">
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2 text-center">
                    Tax Benefits of Pro Bono Work
                  </h2>
                  <p className="text-muted-foreground text-center mb-8">
                    Your generosity can also benefit you at tax time
                  </p>
                  <div className="grid md:grid-cols-3 gap-6">
                    {taxBenefits.map((benefit, i) => (
                      <Card key={i} className="glass-card border-neon-green/20">
                        <CardContent className="p-6">
                          <div className="w-10 h-10 rounded-lg bg-neon-green/10 flex items-center justify-center mb-3">
                            <DollarSign className="h-5 w-5 text-neon-green" />
                          </div>
                          <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{benefit.description}</p>
                          <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
                            {benefit.rate}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Search */}
            <section className="py-8">
              <div className="container mx-auto px-4 max-w-3xl">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search pro bono opportunities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-14 text-lg"
                  />
                </div>
              </div>
            </section>

            {/* Opportunities */}
            <section className="py-12">
              <div className="container mx-auto px-4">
                <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">
                  Pro Bono Opportunities
                </h2>
                <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                  {filteredOpportunities.map((opp) => (
                    <Card key={opp.id} className="glass-card-hover border-neon-pink/20">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-foreground mb-1">{opp.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">{opp.organization}</p>
                          </div>
                          {opp.taxDeductible && (
                            <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
                              Tax Deductible
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{opp.description}</p>
                        <div className="flex flex-wrap gap-3 text-sm mb-4">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-4 w-4" /> {opp.location}
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-4 w-4" /> {opp.hours}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {opp.skills.map((skill, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        <Button 
                          variant="neon-purple" 
                          className="w-full gap-2"
                          onClick={() => handleSignUp(opp.id)}
                        >
                          Express Interest <ArrowRight className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* New Lawyer Support */}
            <section className="py-12 bg-muted/20">
              <div className="container mx-auto px-4">
                <div className="glass-card p-8 rounded-2xl border-neon-cyan/20 max-w-4xl mx-auto">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-neon-cyan/10 flex items-center justify-center shrink-0">
                      <GraduationCap className="h-6 w-6 text-neon-cyan" />
                    </div>
                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground mb-2">
                        New Lawyer? Start Here
                      </h2>
                      <p className="text-muted-foreground mb-4">
                        Pro bono work is a great way to gain experience while giving back. 
                        Many opportunities provide mentorship and CLE credits.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {["Mentored Cases", "Training Provided", "CLE Credits", "Build Your Portfolio"].map((item, i) => (
                          <Badge key={i} className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30 gap-1">
                            <CheckCircle className="h-3 w-3" /> {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          <>
            {/* Help Resources */}
            <section className="py-12">
              <div className="container mx-auto px-4">
                <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">
                  Find Free Legal Help
                </h2>
                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                  {helpSeekers.map((resource, i) => (
                    <Card key={i} className="glass-card-hover border-neon-pink/20">
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 rounded-xl bg-neon-pink/10 flex items-center justify-center mx-auto mb-4">
                          {i === 0 ? <Scale className="h-6 w-6 text-neon-pink" /> :
                           i === 1 ? <GraduationCap className="h-6 w-6 text-neon-pink" /> :
                           <Building2 className="h-6 w-6 text-neon-pink" />}
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">{resource.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>
                        <Button variant="outline" className="gap-2">
                          {resource.action} <ExternalLink className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* AI Help */}
            <section className="py-12 bg-muted/20">
              <div className="container mx-auto px-4">
                <div className="glass-card p-8 rounded-2xl border-neon-pink/20 bg-gradient-to-r from-neon-pink/5 to-neon-purple/5 max-w-4xl mx-auto text-center">
                  <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                    Not Sure Where to Start?
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Our AI legal assistant can help you understand your legal issue 
                    and find the right resources for free help.
                  </p>
                  <Button variant="neon-purple" size="lg" onClick={handleFindHelp} className="gap-2">
                    <Scale className="h-4 w-4" />
                    Talk to AI Legal Assistant
                  </Button>
                </div>
              </div>
            </section>

            {/* What to Expect */}
            <section className="py-12">
              <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto">
                  <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">
                    What to Expect from Pro Bono Help
                  </h2>
                  <div className="space-y-4">
                    {[
                      "Free legal representation from a licensed attorney",
                      "Same quality service as paid clients",
                      "Confidential attorney-client relationship",
                      "Help with documents, court appearances, and negotiations",
                      "Referrals to other resources if needed"
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-4 glass-card rounded-lg">
                        <CheckCircle className="h-5 w-5 text-neon-green shrink-0" />
                        <span className="text-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </FuturisticBackground>
    </Layout>
  );
}
