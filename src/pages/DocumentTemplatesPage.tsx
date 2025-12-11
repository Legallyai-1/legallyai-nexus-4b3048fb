import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  FileText, Search, Download, Eye, Star, 
  Filter, ArrowRight, Briefcase, Home, Users,
  Scale, Shield, Heart, Building2, Car, DollarSign, X
} from "lucide-react";
import { FuturisticBackground } from "@/components/ui/FuturisticBackground";
import { AnimatedAIHead } from "@/components/ui/AnimatedAIHead";
import { toast } from "sonner";

interface Template {
  id: string;
  title: string;
  category: string;
  description: string;
  downloads: number;
  rating: number;
  isPremium: boolean;
}

const categories = [
  { id: "all", name: "All Templates", icon: FileText },
  { id: "business", name: "Business", icon: Briefcase },
  { id: "real-estate", name: "Real Estate", icon: Home },
  { id: "family", name: "Family Law", icon: Users },
  { id: "employment", name: "Employment", icon: Building2 },
  { id: "personal", name: "Personal", icon: Shield },
  { id: "financial", name: "Financial", icon: DollarSign },
];

const templatePreviews: Record<string, string> = {
  "1": `NON-DISCLOSURE AGREEMENT (NDA)

This Non-Disclosure Agreement ("Agreement") is entered into as of [DATE] by and between:

DISCLOSING PARTY: [PARTY A NAME]
RECEIVING PARTY: [PARTY B NAME]

1. DEFINITION OF CONFIDENTIAL INFORMATION
"Confidential Information" means any non-public information disclosed by either party...

2. OBLIGATIONS OF RECEIVING PARTY
The Receiving Party agrees to:
(a) Hold the Confidential Information in strict confidence...
(b) Not disclose Confidential Information to any third parties...

3. TERM
This Agreement shall remain in effect for a period of [X] years...`,
  "5": `RESIDENTIAL LEASE AGREEMENT

This Lease Agreement is made on [DATE] between:

LANDLORD: [NAME], hereinafter referred to as "Landlord"
TENANT: [NAME], hereinafter referred to as "Tenant"

PROPERTY ADDRESS: [ADDRESS]

1. TERM OF LEASE
The lease term begins on [START DATE] and ends on [END DATE]...

2. RENT
Monthly rent shall be $[AMOUNT], due on the [DAY] of each month...

3. SECURITY DEPOSIT
Tenant shall pay a security deposit of $[AMOUNT]...`,
  "8": `CHILD CUSTODY AGREEMENT

This Agreement is entered into by and between:
PARENT 1: [NAME]
PARENT 2: [NAME]

For the benefit of the minor child(ren): [CHILD NAME(S)]

1. LEGAL CUSTODY
[Joint/Sole] legal custody shall be awarded to [PARENT(S)]...

2. PHYSICAL CUSTODY
Primary residence shall be with [PARENT]...

3. VISITATION SCHEDULE
The non-custodial parent shall have visitation as follows...`,
};

const templates: Template[] = [
  // Business
  { id: "1", title: "Non-Disclosure Agreement (NDA)", category: "business", description: "Mutual NDA for business discussions and partnerships.", downloads: 15420, rating: 4.9, isPremium: false },
  { id: "2", title: "Independent Contractor Agreement", category: "business", description: "Contract for hiring freelancers and contractors.", downloads: 12350, rating: 4.8, isPremium: false },
  { id: "3", title: "LLC Operating Agreement", category: "business", description: "Operating agreement for Limited Liability Companies.", downloads: 8920, rating: 4.7, isPremium: true },
  { id: "4", title: "Partnership Agreement", category: "business", description: "Agreement between business partners.", downloads: 6780, rating: 4.6, isPremium: true },
  
  // Real Estate
  { id: "5", title: "Residential Lease Agreement", category: "real-estate", description: "Standard lease for residential property rentals.", downloads: 22100, rating: 4.9, isPremium: false },
  { id: "6", title: "Commercial Lease Agreement", category: "real-estate", description: "Lease agreement for commercial properties.", downloads: 5430, rating: 4.7, isPremium: true },
  { id: "7", title: "Property Sale Contract", category: "real-estate", description: "Contract for buying/selling real property.", downloads: 9870, rating: 4.8, isPremium: true },
  
  // Family
  { id: "8", title: "Child Custody Agreement", category: "family", description: "Parenting plan and custody arrangement.", downloads: 18900, rating: 4.9, isPremium: false },
  { id: "9", title: "Divorce Settlement Agreement", category: "family", description: "Agreement for division of assets in divorce.", downloads: 14200, rating: 4.8, isPremium: true },
  { id: "10", title: "Prenuptial Agreement", category: "family", description: "Pre-marriage financial agreement.", downloads: 7650, rating: 4.6, isPremium: true },
  
  // Employment
  { id: "11", title: "Employment Offer Letter", category: "employment", description: "Formal job offer letter template.", downloads: 11200, rating: 4.7, isPremium: false },
  { id: "12", title: "Employee Handbook", category: "employment", description: "Company policies and procedures handbook.", downloads: 4320, rating: 4.5, isPremium: true },
  { id: "13", title: "Severance Agreement", category: "employment", description: "Separation agreement for departing employees.", downloads: 6890, rating: 4.7, isPremium: true },
  
  // Personal
  { id: "14", title: "Last Will and Testament", category: "personal", description: "Basic will for estate planning.", downloads: 25600, rating: 4.9, isPremium: false },
  { id: "15", title: "Power of Attorney", category: "personal", description: "General power of attorney document.", downloads: 19300, rating: 4.8, isPremium: false },
  { id: "16", title: "Living Will (Healthcare Directive)", category: "personal", description: "Medical wishes and end-of-life instructions.", downloads: 13400, rating: 4.8, isPremium: false },
  
  // Financial
  { id: "17", title: "Promissory Note", category: "financial", description: "Loan agreement between parties.", downloads: 16700, rating: 4.8, isPremium: false },
  { id: "18", title: "Personal Guarantee", category: "financial", description: "Personal guarantee for business obligations.", downloads: 4560, rating: 4.5, isPremium: true },
];

export default function DocumentTemplatesPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    const matchesPremium = !showPremiumOnly || template.isPremium;
    return matchesSearch && matchesCategory && matchesPremium;
  });

  const handleUseTemplate = (template: Template) => {
    navigate(`/generate?template=${encodeURIComponent(template.title)}`);
  };

  const handlePreview = (template: Template) => {
    setPreviewTemplate(template);
  };

  const handleDownload = (template: Template) => {
    if (template.isPremium) {
      toast.error("Premium template - Please upgrade to download");
      navigate("/pricing");
    } else {
      toast.success(`Downloading "${template.title}"...`);
      // Create a simple text download
      const content = templatePreviews[template.id] || `${template.title}\n\n${template.description}\n\n[Template content would appear here]`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template.title.replace(/\s+/g, '_')}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.icon || FileText;
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
                  <div className="absolute inset-0 bg-neon-blue/20 blur-3xl rounded-full scale-150" />
                  <AnimatedAIHead variant="blue" size="lg" />
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-blue/10 border border-neon-blue/30 mb-6">
                <FileText className="h-4 w-4 text-neon-blue" />
                <span className="text-sm font-medium text-neon-blue">Legal Document Templates</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-foreground">
                Professional <span className="text-neon-blue">Legal Templates</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                100+ attorney-drafted legal document templates. 
                Customize with AI or download ready-to-use.
              </p>
            </div>
          </div>
        </section>

        {/* Search & Filter */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="glass-card p-6 rounded-2xl border-neon-blue/20 max-w-5xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
                <Button 
                  variant={showPremiumOnly ? "neon" : "outline"} 
                  onClick={() => setShowPremiumOnly(!showPremiumOnly)}
                  className="gap-2"
                >
                  <Star className="h-4 w-4" />
                  Premium Only
                </Button>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
                      selectedCategory === category.id
                        ? "bg-neon-blue text-background"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <category.icon className="h-4 w-4" />
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Templates Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6 max-w-5xl mx-auto">
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">{filteredTemplates.length}</span> templates found
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {filteredTemplates.map((template) => {
                const CategoryIcon = getCategoryIcon(template.category);
                return (
                  <Card 
                    key={template.id} 
                    className="glass-card-hover border-border/30 hover:border-neon-blue/30 transition-all group"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-lg bg-neon-blue/10 flex items-center justify-center">
                          <CategoryIcon className="h-5 w-5 text-neon-blue" />
                        </div>
                        {template.isPremium && (
                          <Badge className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-500/30">
                            <Star className="h-3 w-3 mr-1 fill-current" /> Premium
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-foreground mb-2 group-hover:text-neon-blue transition-colors">
                        {template.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <Download className="h-4 w-4" /> {template.downloads.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {template.rating}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="neon" 
                          size="sm" 
                          className="flex-1 gap-1"
                          onClick={() => handleUseTemplate(template)}
                        >
                          Use Template <ArrowRight className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handlePreview(template)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownload(template)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No templates found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="glass-card p-8 rounded-2xl border-neon-blue/20 bg-gradient-to-r from-neon-blue/5 to-neon-cyan/5 max-w-4xl mx-auto text-center">
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                Can't Find What You Need?
              </h2>
              <p className="text-muted-foreground mb-6">
                Our AI can generate custom legal documents tailored to your specific needs
              </p>
              <Button variant="neon" size="lg" onClick={() => navigate("/generate")} className="gap-2">
                <Scale className="h-4 w-4" />
                Generate Custom Document
              </Button>
            </div>
          </div>
        </section>

        {/* Preview Dialog */}
        <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{previewTemplate?.title}</span>
                {previewTemplate?.isPremium && (
                  <Badge className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-500/30">
                    <Star className="h-3 w-3 mr-1 fill-current" /> Premium
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-4">{previewTemplate?.description}</p>
              <div className="bg-muted/30 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap border border-border/50">
                {previewTemplate && (templatePreviews[previewTemplate.id] || `${previewTemplate.title}\n\n${previewTemplate.description}\n\n[Full template content available upon use or download]`)}
              </div>
              <div className="flex gap-3 mt-6">
                <Button 
                  variant="neon" 
                  className="flex-1"
                  onClick={() => {
                    if (previewTemplate) handleUseTemplate(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                >
                  Use This Template
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    if (previewTemplate) handleDownload(previewTemplate);
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </FuturisticBackground>
    </Layout>
  );
}
