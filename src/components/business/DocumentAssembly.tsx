import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, Plus, Search, Sparkles, Download, Edit, Copy,
  Folder, Star, Clock, Check, ChevronRight, Wand2, Eye,
  FileSignature, Share2
} from "lucide-react";
import { toast } from "sonner";

interface Template {
  id: string;
  name: string;
  category: string;
  lastUsed: string;
  timesUsed: number;
  isFavorite: boolean;
  variables: number;
}

interface GeneratedDoc {
  id: string;
  name: string;
  template: string;
  createdAt: string;
  status: "draft" | "final" | "signed";
  client: string;
}

const mockTemplates: Template[] = [
  { id: "1", name: "Non-Disclosure Agreement (NDA)", category: "Corporate", lastUsed: "2024-01-10", timesUsed: 45, isFavorite: true, variables: 12 },
  { id: "2", name: "Employment Contract", category: "Employment", lastUsed: "2024-01-09", timesUsed: 32, isFavorite: true, variables: 18 },
  { id: "3", name: "Retainer Agreement", category: "General", lastUsed: "2024-01-08", timesUsed: 89, isFavorite: true, variables: 15 },
  { id: "4", name: "Property Purchase Agreement", category: "Real Estate", lastUsed: "2024-01-07", timesUsed: 23, isFavorite: false, variables: 25 },
  { id: "5", name: "Divorce Petition", category: "Family Law", lastUsed: "2024-01-06", timesUsed: 18, isFavorite: false, variables: 20 },
  { id: "6", name: "LLC Operating Agreement", category: "Corporate", lastUsed: "2024-01-05", timesUsed: 41, isFavorite: true, variables: 22 },
  { id: "7", name: "Lease Agreement", category: "Real Estate", lastUsed: "2024-01-04", timesUsed: 56, isFavorite: false, variables: 30 },
  { id: "8", name: "Power of Attorney", category: "Estate", lastUsed: "2024-01-03", timesUsed: 27, isFavorite: false, variables: 8 },
];

const mockGeneratedDocs: GeneratedDoc[] = [
  { id: "1", name: "NDA - ABC Corp & XYZ Inc", template: "Non-Disclosure Agreement", createdAt: "2024-01-12", status: "signed", client: "ABC Corporation" },
  { id: "2", name: "Employment Contract - John Smith", template: "Employment Contract", createdAt: "2024-01-11", status: "final", client: "TechCo Industries" },
  { id: "3", name: "Retainer - Williams Family", template: "Retainer Agreement", createdAt: "2024-01-10", status: "draft", client: "Williams Family" },
];

const categories = ["All", "Corporate", "Employment", "Real Estate", "Family Law", "Estate", "General"];

export function DocumentAssembly() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeTab, setActiveTab] = useState("templates");

  const filteredTemplates = mockTemplates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAssemble = (template: Template) => {
    toast.success(`Opening document assembly wizard for "${template.name}"`);
  };

  const statusColors = {
    draft: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    final: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    signed: "bg-green-500/20 text-green-400 border-green-500/30",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/20">
              <Wand2 className="h-8 w-8 text-purple-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                Document Assembly
                <Badge className="bg-purple-500/20 text-purple-400">Smart Templates</Badge>
              </h2>
              <p className="text-muted-foreground">
                Generate professional legal documents from intelligent templates with auto-fill
              </p>
            </div>
            <Button variant="gold">
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mockTemplates.length}</p>
              <p className="text-xs text-muted-foreground">Templates</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Check className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mockGeneratedDocs.length}</p>
              <p className="text-xs text-muted-foreground">Generated This Week</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Star className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mockTemplates.filter(t => t.isFavorite).length}</p>
              <p className="text-xs text-muted-foreground">Favorites</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Sparkles className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">AI</p>
              <p className="text-xs text-muted-foreground">Auto-Fill Enabled</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="templates">Template Library</TabsTrigger>
          <TabsTrigger value="generated">Generated Documents</TabsTrigger>
          <TabsTrigger value="clauses">Clause Library</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4 mt-4">
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search templates..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className={template.isFavorite ? "text-yellow-400" : "text-muted-foreground"}
                    >
                      <Star className="h-4 w-4" fill={template.isFavorite ? "currentColor" : "none"} />
                    </Button>
                  </div>
                  <h3 className="font-semibold mb-1">{template.name}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline">{template.category}</Badge>
                    <span className="text-xs text-muted-foreground">{template.variables} variables</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(template.lastUsed).toLocaleDateString()}
                    </span>
                    <span>Used {template.timesUsed}x</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1"
                      onClick={() => handleAssemble(template)}
                    >
                      <Wand2 className="h-4 w-4 mr-2" />
                      Assemble
                    </Button>
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="generated" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recently Generated Documents</CardTitle>
              <CardDescription>Documents created from templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockGeneratedDocs.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{doc.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{doc.template}</span>
                          <span>•</span>
                          <span>{doc.client}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                      <Badge className={statusColors[doc.status]}>{doc.status}</Badge>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <FileSignature className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clauses" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Clause Library</CardTitle>
              <CardDescription>Reusable legal clauses with risk scoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "Standard Indemnification", risk: "low", category: "General" },
                  { name: "Limitation of Liability", risk: "medium", category: "Corporate" },
                  { name: "Confidentiality Clause", risk: "low", category: "NDA" },
                  { name: "Force Majeure", risk: "low", category: "General" },
                  { name: "Non-Compete Agreement", risk: "high", category: "Employment" },
                  { name: "Arbitration Clause", risk: "medium", category: "Dispute" },
                ].map((clause, i) => (
                  <div key={i} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{clause.name}</h4>
                        <p className="text-sm text-muted-foreground">{clause.category}</p>
                      </div>
                      <Badge className={
                        clause.risk === "low" ? "bg-green-500/20 text-green-400" :
                        clause.risk === "medium" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-red-500/20 text-red-400"
                      }>
                        {clause.risk} risk
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
