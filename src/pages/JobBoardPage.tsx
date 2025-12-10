import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Briefcase, MapPin, DollarSign, Clock, Search, 
  Filter, Building2, GraduationCap, Scale, ArrowRight,
  Heart, Share2, ExternalLink
} from "lucide-react";
import { FuturisticBackground } from "@/components/ui/FuturisticBackground";
import { AnimatedAIHead } from "@/components/ui/AnimatedAIHead";
import { toast } from "sonner";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "full-time" | "part-time" | "contract" | "internship";
  salary: string;
  posted: string;
  description: string;
  requirements: string[];
  practiceArea: string;
  experience: string;
}

const mockJobs: Job[] = [
  {
    id: "1",
    title: "Senior Corporate Attorney",
    company: "Smith & Associates",
    location: "New York, NY",
    type: "full-time",
    salary: "$180,000 - $250,000",
    posted: "2 days ago",
    description: "Looking for an experienced corporate attorney to lead M&A transactions and corporate governance matters.",
    requirements: ["JD from accredited law school", "7+ years corporate law experience", "NY Bar admission"],
    practiceArea: "Corporate Law",
    experience: "7+ years"
  },
  {
    id: "2",
    title: "Family Law Associate",
    company: "Johnson Family Law",
    location: "Los Angeles, CA",
    type: "full-time",
    salary: "$120,000 - $160,000",
    posted: "1 week ago",
    description: "Seeking a compassionate family law attorney to handle divorce, custody, and support matters.",
    requirements: ["JD required", "3+ years family law", "CA Bar admission", "Strong negotiation skills"],
    practiceArea: "Family Law",
    experience: "3+ years"
  },
  {
    id: "3",
    title: "Legal Intern - Summer 2025",
    company: "Davis Legal Group",
    location: "Chicago, IL",
    type: "internship",
    salary: "$25 - $35/hour",
    posted: "3 days ago",
    description: "Summer internship program for 2L students interested in litigation and trial practice.",
    requirements: ["Current 2L student", "Top 25% class rank", "Strong writing skills"],
    practiceArea: "Litigation",
    experience: "Law Student"
  },
  {
    id: "4",
    title: "Immigration Attorney",
    company: "Global Immigration Services",
    location: "Miami, FL (Remote)",
    type: "full-time",
    salary: "$100,000 - $140,000",
    posted: "5 days ago",
    description: "Join our growing immigration practice handling employment-based and family immigration cases.",
    requirements: ["JD required", "2+ years immigration law", "Bilingual Spanish preferred"],
    practiceArea: "Immigration",
    experience: "2+ years"
  },
  {
    id: "5",
    title: "Contract Attorney - Document Review",
    company: "LegalTech Solutions",
    location: "Remote",
    type: "contract",
    salary: "$45 - $65/hour",
    posted: "1 day ago",
    description: "Contract position for document review project. Expected duration 3-6 months.",
    requirements: ["JD and Bar admission", "Relativity experience preferred", "Attention to detail"],
    practiceArea: "eDiscovery",
    experience: "1+ years"
  },
];

const practiceAreas = ["All", "Corporate Law", "Family Law", "Litigation", "Immigration", "Criminal", "Real Estate", "IP"];
const jobTypes = ["All", "Full-time", "Part-time", "Contract", "Internship"];

export default function JobBoardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  const filteredJobs = mockJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea = selectedArea === "All" || job.practiceArea === selectedArea;
    const matchesType = selectedType === "All" || job.type.toLowerCase() === selectedType.toLowerCase();
    return matchesSearch && matchesArea && matchesType;
  });

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs(prev => 
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
    toast.success(savedJobs.includes(jobId) ? "Job removed from saved" : "Job saved!");
  };

  const applyToJob = (job: Job) => {
    toast.success(`Application started for ${job.title} at ${job.company}`);
  };

  const typeColor = (type: string) => {
    switch (type) {
      case "full-time": return "bg-neon-green/20 text-neon-green border-neon-green/30";
      case "part-time": return "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30";
      case "contract": return "bg-neon-purple/20 text-neon-purple border-neon-purple/30";
      case "internship": return "bg-neon-orange/20 text-neon-orange border-neon-orange/30";
      default: return "bg-muted text-muted-foreground";
    }
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
                  <div className="absolute inset-0 bg-neon-cyan/20 blur-3xl rounded-full scale-150" />
                  <AnimatedAIHead variant="cyan" size="lg" />
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 mb-6">
                <Briefcase className="h-4 w-4 text-neon-cyan" />
                <span className="text-sm font-medium text-neon-cyan">Legal Job Marketplace</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-foreground">
                Find Your <span className="text-neon-cyan">Legal Career</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Connect with top law firms and legal employers. 
                Discover opportunities that match your expertise.
              </p>
            </div>
          </div>
        </section>

        {/* Search & Filters */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="glass-card p-6 rounded-2xl border-neon-cyan/20 max-w-5xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search jobs, companies, locations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
                <Button variant="neon" size="lg" className="gap-2">
                  <Search className="h-4 w-4" />
                  Search Jobs
                </Button>
              </div>

              {/* Filter Pills */}
              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Practice Area</p>
                  <div className="flex flex-wrap gap-2">
                    {practiceAreas.map(area => (
                      <button
                        key={area}
                        onClick={() => setSelectedArea(area)}
                        className={`px-3 py-1 rounded-full text-sm transition-all ${
                          selectedArea === area
                            ? "bg-neon-cyan text-background"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Job Type</p>
                  <div className="flex flex-wrap gap-2">
                    {jobTypes.map(type => (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`px-3 py-1 rounded-full text-sm transition-all ${
                          selectedType === type
                            ? "bg-neon-cyan text-background"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Job Listings */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">{filteredJobs.length}</span> jobs found
              </p>
              <Button variant="ghost" className="gap-2">
                <Filter className="h-4 w-4" />
                More Filters
              </Button>
            </div>

            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="glass-card-hover border-border/30 hover:border-neon-cyan/30 transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-neon-cyan/10 flex items-center justify-center shrink-0">
                            <Building2 className="h-6 w-6 text-neon-cyan" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="font-semibold text-lg text-foreground">{job.title}</h3>
                              <Badge className={typeColor(job.type)}>{job.type}</Badge>
                            </div>
                            <p className="text-muted-foreground">{job.company}</p>
                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <MapPin className="h-4 w-4" /> {job.location}
                              </span>
                              <span className="flex items-center gap-1 text-neon-green">
                                <DollarSign className="h-4 w-4" /> {job.salary}
                              </span>
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-4 w-4" /> {job.posted}
                              </span>
                            </div>
                            <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                            <div className="flex flex-wrap gap-2 mt-3">
                              <Badge variant="outline" className="text-xs">
                                <Scale className="h-3 w-3 mr-1" /> {job.practiceArea}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                <GraduationCap className="h-3 w-3 mr-1" /> {job.experience}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex md:flex-col gap-2">
                        <Button variant="neon" onClick={() => applyToJob(job)} className="gap-2">
                          Apply Now <ArrowRight className="h-4 w-4" />
                        </Button>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => toggleSaveJob(job.id)}
                            className={savedJobs.includes(job.id) ? "text-red-500 border-red-500/30" : ""}
                          >
                            <Heart className={`h-4 w-4 ${savedJobs.includes(job.id) ? "fill-current" : ""}`} />
                          </Button>
                          <Button variant="outline" size="icon">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredJobs.length === 0 && (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No jobs found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="glass-card p-8 rounded-2xl border-neon-green/20 bg-gradient-to-r from-neon-green/5 to-neon-cyan/5 max-w-4xl mx-auto text-center">
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                Are You Hiring?
              </h2>
              <p className="text-muted-foreground mb-6">
                Post your legal job openings and connect with qualified candidates
              </p>
              <Button variant="neon-green" size="lg" className="gap-2">
                Post a Job <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </FuturisticBackground>
    </Layout>
  );
}
