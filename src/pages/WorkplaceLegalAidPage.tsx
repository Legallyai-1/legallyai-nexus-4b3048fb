import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Briefcase, Shield, AlertTriangle, FileText, Phone, 
  Scale, Search, ChevronRight, ExternalLink, 
  Users, Clock, DollarSign, Heart, Building2
} from "lucide-react";
import { FuturisticBackground } from "@/components/ui/FuturisticBackground";
import { AnimatedAIHead } from "@/components/ui/AnimatedAIHead";
import { useNavigate } from "react-router-dom";

const topics = [
  {
    id: "discrimination",
    title: "Workplace Discrimination",
    icon: Shield,
    description: "Learn about protected classes, filing EEOC complaints, and your rights against discrimination.",
    color: "neon-orange",
    articles: ["What is workplace discrimination?", "How to file an EEOC complaint", "Proving discrimination in court"]
  },
  {
    id: "harassment",
    title: "Harassment & Hostile Work Environment",
    icon: AlertTriangle,
    description: "Understand sexual harassment laws, hostile work environments, and reporting procedures.",
    color: "neon-pink",
    articles: ["Types of workplace harassment", "Documenting harassment incidents", "Employer liability"]
  },
  {
    id: "wages",
    title: "Wages & Overtime",
    icon: DollarSign,
    description: "Know your rights regarding minimum wage, overtime pay, and wage theft recovery.",
    color: "neon-green",
    articles: ["Federal minimum wage laws", "Overtime eligibility", "Filing a wage claim"]
  },
  {
    id: "termination",
    title: "Wrongful Termination",
    icon: Briefcase,
    description: "Understand at-will employment, wrongful termination claims, and severance negotiations.",
    color: "neon-cyan",
    articles: ["At-will employment explained", "Signs of wrongful termination", "Negotiating severance"]
  },
  {
    id: "leave",
    title: "Family & Medical Leave",
    icon: Heart,
    description: "Learn about FMLA rights, medical leave protections, and accommodation requirements.",
    color: "neon-purple",
    articles: ["FMLA eligibility requirements", "Requesting medical leave", "Returning from leave"]
  },
  {
    id: "safety",
    title: "Workplace Safety (OSHA)",
    icon: Building2,
    description: "Know your OSHA rights, how to report unsafe conditions, and retaliation protections.",
    color: "neon-blue",
    articles: ["Your OSHA rights", "Reporting safety violations", "Whistleblower protections"]
  },
];

const stateResources = [
  { state: "California", agency: "DIR - Division of Labor Standards", phone: "(844) 522-6734" },
  { state: "New York", agency: "NY Department of Labor", phone: "(888) 469-7365" },
  { state: "Texas", agency: "Texas Workforce Commission", phone: "(800) 832-9243" },
  { state: "Florida", agency: "FL Department of Economic Opportunity", phone: "(800) 204-2418" },
  { state: "Illinois", agency: "IL Department of Labor", phone: "(312) 793-2800" },
];

const faqs = [
  {
    question: "Can my employer fire me for filing a complaint?",
    answer: "No. Federal and state laws protect employees from retaliation for filing complaints about discrimination, harassment, wage violations, or safety concerns. If you experience retaliation, you may have grounds for an additional claim."
  },
  {
    question: "How long do I have to file a workplace complaint?",
    answer: "Time limits vary by claim type. EEOC discrimination charges must typically be filed within 180-300 days. Wage claims vary by state, often 2-3 years. OSHA complaints should be filed within 30 days. Act quickly to preserve your rights."
  },
  {
    question: "Do I need a lawyer for a workplace dispute?",
    answer: "Not always, but legal representation is recommended for complex cases. Many employment attorneys offer free consultations and work on contingency (no fee unless you win). Government agencies can also help without a lawyer."
  },
];

export default function WorkplaceLegalAidPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const filteredTopics = topics.filter(topic =>
    topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChatWithAI = () => {
    navigate("/chat?topic=workplace");
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
                  <div className="absolute inset-0 bg-neon-orange/20 blur-3xl rounded-full scale-150" />
                  <AnimatedAIHead variant="orange" size="lg" />
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-orange/10 border border-neon-orange/30 mb-6">
                <Briefcase className="h-4 w-4 text-neon-orange" />
                <span className="text-sm font-medium text-neon-orange">Workplace Legal Aid</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-foreground">
                Know Your <span className="text-neon-orange">Worker Rights</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Free legal information and resources to protect yourself at work. 
                Understand your rights, file complaints, and get help.
              </p>
              <Button variant="neon" size="lg" onClick={handleChatWithAI} className="gap-2">
                <Scale className="h-4 w-4" />
                Chat with AI Legal Assistant
              </Button>
            </div>
          </div>
        </section>

        {/* Search */}
        <section className="py-8">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search workplace legal topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-lg"
              />
            </div>
          </div>
        </section>

        {/* Topics Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">
              Common Workplace Issues
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {filteredTopics.map((topic) => (
                <Card 
                  key={topic.id} 
                  className={`glass-card-hover cursor-pointer border-${topic.color}/20 hover:border-${topic.color}/50 transition-all`}
                  onClick={() => setSelectedTopic(selectedTopic === topic.id ? null : topic.id)}
                >
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-xl bg-${topic.color}/10 flex items-center justify-center mb-3`}>
                      <topic.icon className={`h-6 w-6 text-${topic.color}`} />
                    </div>
                    <CardTitle className="text-foreground">{topic.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{topic.description}</p>
                    {selectedTopic === topic.id && (
                      <div className="space-y-2 border-t border-border/30 pt-4 mt-4">
                        {topic.articles.map((article, i) => (
                          <button
                            key={i}
                            className="flex items-center gap-2 text-sm text-foreground hover:text-neon-orange transition-colors w-full text-left"
                          >
                            <ChevronRight className="h-4 w-4" />
                            {article}
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* State Labor Boards */}
        <section className="py-12 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2 text-center">
                State Labor Board Contacts
              </h2>
              <p className="text-muted-foreground text-center mb-8">
                File complaints and get help from your state's labor department
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stateResources.map((resource) => (
                  <Card key={resource.state} className="glass-card">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground mb-1">{resource.state}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{resource.agency}</p>
                      <a 
                        href={`tel:${resource.phone}`}
                        className="flex items-center gap-2 text-sm text-neon-orange hover:underline"
                      >
                        <Phone className="h-4 w-4" />
                        {resource.phone}
                      </a>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="text-center mt-6">
                <Button variant="outline" className="gap-2">
                  View All States <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <Card key={i} className="glass-card">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                      <p className="text-sm text-muted-foreground">{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Federal Resources */}
        <section className="py-12 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">
                Federal Resources
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="glass-card-hover">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-xl bg-neon-green/10 flex items-center justify-center mx-auto mb-3">
                      <Scale className="h-6 w-6 text-neon-green" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">EEOC</h3>
                    <p className="text-sm text-muted-foreground mb-4">Equal Employment Opportunity Commission</p>
                    <Button variant="outline" size="sm" className="gap-2">
                      eeoc.gov <ExternalLink className="h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
                <Card className="glass-card-hover">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-xl bg-neon-cyan/10 flex items-center justify-center mx-auto mb-3">
                      <Shield className="h-6 w-6 text-neon-cyan" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">OSHA</h3>
                    <p className="text-sm text-muted-foreground mb-4">Occupational Safety & Health Admin</p>
                    <Button variant="outline" size="sm" className="gap-2">
                      osha.gov <ExternalLink className="h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
                <Card className="glass-card-hover">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-xl bg-neon-purple/10 flex items-center justify-center mx-auto mb-3">
                      <DollarSign className="h-6 w-6 text-neon-purple" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">DOL</h3>
                    <p className="text-sm text-muted-foreground mb-4">Department of Labor - Wage & Hour</p>
                    <Button variant="outline" size="sm" className="gap-2">
                      dol.gov <ExternalLink className="h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="glass-card p-8 rounded-2xl border-neon-orange/20 bg-gradient-to-r from-neon-orange/5 to-neon-pink/5 max-w-4xl mx-auto text-center">
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                Need Personalized Help?
              </h2>
              <p className="text-muted-foreground mb-6">
                Chat with our AI legal assistant for guidance specific to your situation
              </p>
              <Button variant="neon" size="lg" onClick={handleChatWithAI} className="gap-2">
                <Scale className="h-4 w-4" />
                Start Free Consultation
              </Button>
            </div>
          </div>
        </section>
      </FuturisticBackground>
    </Layout>
  );
}
