import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Briefcase, MapPin, DollarSign, Clock, Search, 
  Filter, Building2, GraduationCap, Scale, ArrowRight,
  Heart, Share2, ExternalLink, Brain, Bell, Star, Sparkles, Loader2, RefreshCw
} from "lucide-react";
import { FuturisticBackground } from "@/components/ui/FuturisticBackground";
import { AnimatedAIHead } from "@/components/ui/AnimatedAIHead";
import { AIJobMatcher } from "@/components/job/AIJobMatcher";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  posted: string;
  description: string;
  requirements: string[];
  practiceArea: string;
  experience: string;
  applyUrl?: string;
  source?: string;
  logo?: string;
}

const practiceAreas = ["All", "Corporate Law", "Family Law", "Litigation", "Immigration", "Criminal", "Real Estate", "IP", "Tax Law"];
const jobTypes = ["All", "Full-time", "Part-time", "Contract", "Internship"];

export default function JobBoardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [locationFilter, setLocationFilter] = useState("");
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("browse");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalJobs, setTotalJobs] = useState(0);
  const [sources, setSources] = useState<string[]>([]);
  const [alertKeywords, setAlertKeywords] = useState("");
  const [alertLocation, setAlertLocation] = useState("");

  // Fetch jobs from API
  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('job-search', {
        body: {
          query: searchTerm || undefined,
          location: locationFilter || undefined,
          practiceArea: selectedArea !== "All" ? selectedArea : undefined,
          jobType: selectedType !== "All" ? selectedType : undefined,
          page: 1
        }
      });

      if (error) throw error;

      setJobs(data.jobs || []);
      setTotalJobs(data.total || 0);
      setSources(data.sources || []);
      
      if (data.sources?.length > 0) {
        toast.success(`Found ${data.total} jobs from ${data.sources.join(', ')}`);
      }
    } catch (err: any) {
      console.error("Job fetch error:", err);
      toast.error("Failed to fetch jobs. Using cached results.");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchJobs();
  }, []);

  // Search handler
  const handleSearch = () => {
    fetchJobs();
  };

  // Filter jobs locally
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchTerm || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea = selectedArea === "All" || job.practiceArea === selectedArea;
    const matchesType = selectedType === "All" || job.type.toLowerCase().includes(selectedType.toLowerCase());
    const matchesLocation = !locationFilter || job.location.toLowerCase().includes(locationFilter.toLowerCase());
    return matchesSearch && matchesArea && matchesType && matchesLocation;
  });

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs(prev => 
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
    toast.success(savedJobs.includes(jobId) ? "Job removed from saved" : "Job saved!");
  };

  const applyToJob = (job: Job) => {
    if (job.applyUrl && job.applyUrl !== '#') {
      window.open(job.applyUrl, '_blank');
      toast.success(`Opening application for ${job.title}`);
    } else {
      toast.success(`Application started for ${job.title} at ${job.company}`);
    }
  };

  const shareJob = (job: Job) => {
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: `Check out this job: ${job.title} at ${job.company}`,
        url: job.applyUrl || window.location.href
      });
    } else {
      navigator.clipboard.writeText(`${job.title} at ${job.company} - ${job.applyUrl || window.location.href}`);
      toast.success("Job link copied to clipboard!");
    }
  };

  const createAlert = () => {
    if (!alertKeywords && !alertLocation) {
      toast.error("Please enter keywords or location for your alert");
      return;
    }
    toast.success(`Job alert created for "${alertKeywords || 'Legal jobs'}" in "${alertLocation || 'All locations'}"`);
    setAlertKeywords("");
    setAlertLocation("");
  };

  const typeColor = (type: string) => {
    const typeLower = type.toLowerCase();
    if (typeLower.includes('full')) return "bg-neon-green/20 text-neon-green border-neon-green/30";
    if (typeLower.includes('part')) return "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30";
    if (typeLower.includes('contract')) return "bg-neon-purple/20 text-neon-purple border-neon-purple/30";
    if (typeLower.includes('intern')) return "bg-neon-orange/20 text-neon-orange border-neon-orange/30";
    return "bg-muted text-muted-foreground";
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

              <div className="flex items-center gap-2 justify-center mb-4">
                <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
                  <Star className="w-3 h-3 mr-1" /> Live Job Feed
                </Badge>
                <Badge className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30">
                  Indeed • LinkedIn • Glassdoor • ZipRecruiter
                </Badge>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 mb-6">
                <Briefcase className="h-4 w-4 text-neon-cyan" />
                <span className="text-sm font-medium text-neon-cyan">Legal Job Marketplace • Real-Time Aggregation</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-foreground">
                Find Your <span className="text-neon-cyan">Legal Career</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Aggregating jobs from Indeed, LinkedIn, Glassdoor, ZipRecruiter, USAJobs & more.
                {totalJobs > 0 && <span className="text-neon-green"> {totalJobs} live openings.</span>}
              </p>
              {sources.length > 0 && (
                <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                  {sources.map(source => (
                    <Badge key={source} variant="outline" className="text-xs">
                      {source}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Main Tabs */}
        <section className="py-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid grid-cols-4 glass-card p-1">
                <TabsTrigger value="browse" className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan gap-2">
                  <Search className="w-4 h-4" /> Browse Jobs
                </TabsTrigger>
                <TabsTrigger value="ai-match" className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple gap-2">
                  <Brain className="w-4 h-4" /> AI Matching
                </TabsTrigger>
                <TabsTrigger value="saved" className="data-[state=active]:bg-neon-pink/20 data-[state=active]:text-neon-pink gap-2">
                  <Heart className="w-4 h-4" /> Saved ({savedJobs.length})
                </TabsTrigger>
                <TabsTrigger value="alerts" className="data-[state=active]:bg-neon-green/20 data-[state=active]:text-neon-green gap-2">
                  <Bell className="w-4 h-4" /> Job Alerts
                </TabsTrigger>
              </TabsList>

              {/* AI Matching Tab */}
              <TabsContent value="ai-match">
                <AIJobMatcher jobs={jobs} />
              </TabsContent>

              {/* Saved Jobs Tab */}
              <TabsContent value="saved">
                <Card className="glass-card p-6">
                  <h3 className="font-display text-xl font-semibold text-foreground mb-4">
                    Saved Jobs ({savedJobs.length})
                  </h3>
                  {savedJobs.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No saved jobs yet. Browse jobs and click the heart icon to save.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {jobs.filter(j => savedJobs.includes(j.id)).map(job => (
                        <div key={job.id} className="p-4 rounded-lg bg-background/30 flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-foreground">{job.title}</h4>
                            <p className="text-sm text-muted-foreground">{job.company} • {job.location}</p>
                            <p className="text-sm text-neon-green">{job.salary}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="neon" size="sm" onClick={() => applyToJob(job)}>
                              Apply
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => toggleSaveJob(job.id)}>
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </TabsContent>

              {/* Job Alerts Tab */}
              <TabsContent value="alerts">
                <Card className="glass-card p-6">
                  <h3 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-neon-green" />
                    Smart Job Alerts
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Get notified when new jobs match your criteria. We'll scan Indeed, LinkedIn, Glassdoor & more.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <Input 
                      placeholder="Keywords (e.g., Corporate, M&A)" 
                      value={alertKeywords}
                      onChange={(e) => setAlertKeywords(e.target.value)}
                    />
                    <Input 
                      placeholder="Location (e.g., New York)" 
                      value={alertLocation}
                      onChange={(e) => setAlertLocation(e.target.value)}
                    />
                  </div>
                  <Button variant="neon-green" className="w-full gap-2" onClick={createAlert}>
                    <Bell className="w-4 h-4" /> Create Alert
                  </Button>
                </Card>
              </TabsContent>

              {/* Browse Jobs Tab */}
              <TabsContent value="browse">
                {/* Search & Filters */}
                <div className="container mx-auto px-4">
                  <div className="glass-card p-6 rounded-2xl border-neon-cyan/20 max-w-5xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          placeholder="Search jobs, companies, skills..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                          className="pl-10 h-12"
                        />
                      </div>
                      <div className="relative flex-1">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          placeholder="Location (city, state, or remote)"
                          value={locationFilter}
                          onChange={(e) => setLocationFilter(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                          className="pl-10 h-12"
                        />
                      </div>
                      <Button variant="neon" size="lg" className="gap-2" onClick={handleSearch} disabled={isLoading}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        Search
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

                    {/* Job Listings */}
                    <div className="py-6">
                      <div className="flex items-center justify-between mb-6">
                        <p className="text-muted-foreground">
                          <span className="font-semibold text-foreground">{filteredJobs.length}</span> jobs found
                          {sources.length > 0 && <span className="text-xs ml-2">from {sources.join(', ')}</span>}
                        </p>
                        <Button variant="ghost" className="gap-2" onClick={fetchJobs} disabled={isLoading}>
                          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                          Refresh
                        </Button>
                      </div>

                      {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                          <div className="text-center">
                            <Loader2 className="h-12 w-12 animate-spin text-neon-cyan mx-auto mb-4" />
                            <p className="text-muted-foreground">Searching Indeed, LinkedIn, Glassdoor...</p>
                          </div>
                        </div>
                      ) : filteredJobs.length === 0 ? (
                        <div className="text-center py-20">
                          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No jobs found. Try adjusting your filters.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {filteredJobs.map((job) => (
                            <Card key={job.id} className="glass-card-hover border-border/30 hover:border-neon-cyan/30 transition-all">
                              <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-start gap-4">
                                      <div className="w-12 h-12 rounded-lg bg-neon-cyan/10 flex items-center justify-center shrink-0 overflow-hidden">
                                        {job.logo ? (
                                          <img src={job.logo} alt={job.company} className="w-full h-full object-cover" />
                                        ) : (
                                          <Building2 className="h-6 w-6 text-neon-cyan" />
                                        )}
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                          <h3 className="font-semibold text-lg text-foreground">{job.title}</h3>
                                          <Badge className={typeColor(job.type)}>{job.type}</Badge>
                                          {job.source && (
                                            <Badge variant="outline" className="text-xs">{job.source}</Badge>
                                          )}
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
                                        className={savedJobs.includes(job.id) ? "text-neon-pink border-neon-pink/30" : ""}
                                      >
                                        <Heart className={`h-4 w-4 ${savedJobs.includes(job.id) ? "fill-current" : ""}`} />
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="icon"
                                        onClick={() => shareJob(job)}
                                      >
                                        <Share2 className="h-4 w-4" />
                                      </Button>
                                      {job.applyUrl && job.applyUrl !== '#' && (
                                        <Button 
                                          variant="outline" 
                                          size="icon"
                                          onClick={() => window.open(job.applyUrl, '_blank')}
                                        >
                                          <ExternalLink className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <Card className="glass-card p-4 text-center">
                <div className="text-3xl font-bold text-neon-cyan">{totalJobs}+</div>
                <div className="text-sm text-muted-foreground">Live Jobs</div>
              </Card>
              <Card className="glass-card p-4 text-center">
                <div className="text-3xl font-bold text-neon-green">6</div>
                <div className="text-sm text-muted-foreground">Job Sources</div>
              </Card>
              <Card className="glass-card p-4 text-center">
                <div className="text-3xl font-bold text-neon-purple">95%</div>
                <div className="text-sm text-muted-foreground">AI Match Accuracy</div>
              </Card>
              <Card className="glass-card p-4 text-center">
                <div className="text-3xl font-bold text-neon-orange">Free</div>
                <div className="text-sm text-muted-foreground">Job Posting</div>
              </Card>
            </div>
          </div>
        </section>
      </FuturisticBackground>
    </Layout>
  );
}
