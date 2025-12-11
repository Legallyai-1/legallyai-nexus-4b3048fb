import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, Scale, FileText, Calendar, MapPin, User, 
  Building2, Gavel, ExternalLink, Clock, Filter,
  BookOpen, AlertCircle, CheckCircle2, Loader2, Database
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CourtRecord {
  id: string;
  caseNumber: string;
  title: string;
  court: string;
  state: string;
  type: string;
  status: "active" | "closed" | "pending" | "appealed";
  filingDate: string;
  parties: string[];
  judge?: string;
  summary?: string;
  source?: string;
  url?: string | null;
}

const CourtRecordsPage = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedSource, setSelectedSource] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<CourtRecord[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const states = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
    "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
    "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
    "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
    "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
    "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
    "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
    "Wisconsin", "Wyoming"
  ];

  const caseTypes = [
    "Civil", "Criminal", "Family", "Probate", "Bankruptcy", 
    "Immigration", "Tax", "Appellate", "Federal", "Traffic"
  ];

  const statusColors: Record<string, string> = {
    active: "bg-green-500/20 text-green-400",
    closed: "bg-gray-500/20 text-gray-400",
    pending: "bg-yellow-500/20 text-yellow-400",
    appealed: "bg-purple-500/20 text-purple-400"
  };

  const sourceLabels: Record<string, string> = {
    courtlistener: "CourtListener",
    pacer: "PACER",
    demo: "Demo Data",
    all: "All Sources"
  };

  const handleSearch = async () => {
    if (!searchQuery && !selectedState && !selectedType) {
      toast({
        title: "Search Required",
        description: "Please enter a search term or select filters",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const { data, error } = await supabase.functions.invoke('court-records-search', {
        body: {
          query: searchQuery,
          state: selectedState,
          caseType: selectedType,
          source: selectedSource
        }
      });

      if (error) throw error;

      setSearchResults(data.results || []);
      
      toast({
        title: "Search Complete",
        description: `Found ${data.count || 0} court record(s) from ${data.sources?.join(', ') || 'available sources'}`,
      });
    } catch (error) {
      console.error('Court records search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search court records. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const federalCourts = [
    { name: "U.S. Supreme Court", link: "https://www.supremecourt.gov/", cases: "Highest appellate court" },
    { name: "PACER", link: "https://pacer.uscourts.gov/", cases: "Federal case search" },
    { name: "U.S. Court of Appeals", link: "https://www.uscourts.gov/about-federal-courts/court-role-and-structure/about-us-courts-appeals", cases: "Circuit courts" },
    { name: "U.S. District Courts", link: "https://www.uscourts.gov/about-federal-courts/court-role-and-structure/about-us-district-courts", cases: "Trial courts" },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Scale className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Court Records Search</h1>
            </div>
            <p className="text-muted-foreground">
              Search public court records across federal and state jurisdictions
            </p>
          </div>

          <Tabs defaultValue="search" className="space-y-6">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="search">Search Records</TabsTrigger>
              <TabsTrigger value="federal">Federal Courts</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="space-y-6">
              {/* Search Form */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-primary" />
                    Search Court Records
                  </CardTitle>
                  <CardDescription>
                    Search by case number, party name, or keywords
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <Label>Search Query</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Case number, party name, or keywords..."
                          className="pl-10"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Select value={selectedState} onValueChange={setSelectedState}>
                        <SelectTrigger>
                          <SelectValue placeholder="All States" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All States</SelectItem>
                          {states.map(state => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Case Type</Label>
                      <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Types</SelectItem>
                          {caseTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Data Source</Label>
                      <Select value={selectedSource} onValueChange={setSelectedSource}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Sources" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Sources</SelectItem>
                          <SelectItem value="courtlistener">CourtListener (Free)</SelectItem>
                          <SelectItem value="pacer">PACER (Federal)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button onClick={handleSearch} disabled={isSearching} className="bg-primary text-primary-foreground">
                      {isSearching ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Database className="h-4 w-4 mr-2" />
                          Search Court Records
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedState("");
                        setSelectedType("");
                        setSelectedSource("all");
                        setSearchResults([]);
                        setHasSearched(false);
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Search Results */}
              {hasSearched && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">
                      Search Results ({searchResults.length})
                    </h2>
                  </div>

                  {searchResults.length === 0 ? (
                    <Card className="bg-card border-border">
                      <CardContent className="py-12 text-center">
                        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">No Records Found</h3>
                        <p className="text-muted-foreground">
                          Try adjusting your search criteria or filters
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {searchResults.map(record => (
                        <Card key={record.id} className="bg-card border-border hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                  <h3 className="font-semibold text-lg text-foreground">{record.title}</h3>
                                  <Badge className={statusColors[record.status]}>
                                    {record.status}
                                  </Badge>
                                  {record.source && (
                                    <Badge variant="outline" className="text-xs">
                                      {sourceLabels[record.source] || record.source}
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                                  <span className="flex items-center gap-1">
                                    <FileText className="h-4 w-4" />
                                    {record.caseNumber}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Building2 className="h-4 w-4" />
                                    {record.court}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {record.state}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    Filed: {new Date(record.filingDate).toLocaleDateString()}
                                  </span>
                                </div>

                                <div className="mb-3">
                                  <p className="text-sm text-muted-foreground">
                                    <strong>Parties:</strong> {record.parties.join(" | ")}
                                  </p>
                                  {record.judge && (
                                    <p className="text-sm text-muted-foreground">
                                      <strong>Judge:</strong> {record.judge}
                                    </p>
                                  )}
                                </div>

                                {record.summary && (
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {record.summary}
                                  </p>
                                )}
                              </div>
                              
                              <div className="flex flex-col gap-2">
                                {record.url ? (
                                  <Button size="sm" className="bg-primary text-primary-foreground" asChild>
                                    <a href={record.url} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="h-4 w-4 mr-1" />
                                      View Record
                                    </a>
                                  </Button>
                                ) : (
                                  <Button size="sm" className="bg-primary text-primary-foreground">
                                    <FileText className="h-4 w-4 mr-1" />
                                    View Details
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="federal" className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gavel className="h-5 w-5 text-primary" />
                    Federal Court Resources
                  </CardTitle>
                  <CardDescription>
                    Access federal court systems and case databases
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {federalCourts.map((court, index) => (
                      <Card key={index} className="bg-muted/30 border-border">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-foreground">{court.name}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{court.cases}</p>
                            </div>
                            <Button size="sm" variant="outline" asChild>
                              <a href={court.link} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary/10 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="h-6 w-6 text-primary flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">PACER Account Required</h4>
                      <p className="text-sm text-muted-foreground">
                        To access federal court electronic records, you'll need a PACER (Public Access to Court Electronic Records) account. 
                        Registration is free, but there are fees for accessing documents (currently $0.10 per page, capped at $3.00 per document).
                      </p>
                      <Button className="mt-4" variant="outline" asChild>
                        <a href="https://pacer.uscourts.gov/register-account" target="_blank" rel="noopener noreferrer">
                          Register for PACER
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Legal Research Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">
                        Start with the case number if known - it's the most accurate search method
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">
                        Use exact party names when possible, including middle initials
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">
                        Narrow results by selecting specific state and case type
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">
                        Check both federal and state courts for comprehensive coverage
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Record Availability
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Court records availability varies by jurisdiction:
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• <strong>Federal courts:</strong> Most records available through PACER</li>
                      <li>• <strong>State courts:</strong> Varies by state; some offer free online access</li>
                      <li>• <strong>Sealed records:</strong> Not publicly accessible</li>
                      <li>• <strong>Expunged records:</strong> Removed from public databases</li>
                      <li>• <strong>Older records:</strong> May require in-person courthouse visit</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-yellow-500/10 border-yellow-500/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="h-6 w-6 text-yellow-500 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Legal Disclaimer</h4>
                      <p className="text-sm text-muted-foreground">
                        The information provided through this search is for informational purposes only and should not be considered legal advice. 
                        Court records may contain errors or be incomplete. Always verify information with the appropriate court clerk's office. 
                        For legal matters, consult with a licensed attorney in your jurisdiction.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default CourtRecordsPage;
