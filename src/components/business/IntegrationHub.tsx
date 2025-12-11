import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Globe, Search, Check, Plus, Settings, ExternalLink, 
  Zap, RefreshCw, AlertCircle, Clock, ArrowRight
} from "lucide-react";
import { toast } from "sonner";

interface Integration {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  connected: boolean;
  lastSync?: string;
  status: "active" | "disconnected" | "error";
}

const integrationCategories = [
  "All",
  "Accounting",
  "Calendar",
  "Communication",
  "Storage",
  "E-Signature",
  "CRM",
  "Payment",
  "Legal Research",
  "Court Filing",
];

const mockIntegrations: Integration[] = [
  { id: "1", name: "Stripe", category: "Payment", description: "Accept credit card payments", icon: "💳", connected: true, lastSync: "2024-01-12", status: "active" },
  { id: "2", name: "QuickBooks", category: "Accounting", description: "Sync invoices and expenses", icon: "📊", connected: true, lastSync: "2024-01-12", status: "active" },
  { id: "3", name: "DocuSign", category: "E-Signature", description: "Electronic signatures", icon: "✍️", connected: true, lastSync: "2024-01-11", status: "active" },
  { id: "4", name: "Microsoft 365", category: "Communication", description: "Email and calendar sync", icon: "📧", connected: true, lastSync: "2024-01-12", status: "active" },
  { id: "5", name: "Google Workspace", category: "Communication", description: "Gmail and Drive integration", icon: "📁", connected: false, status: "disconnected" },
  { id: "6", name: "Dropbox", category: "Storage", description: "Cloud document storage", icon: "📦", connected: true, lastSync: "2024-01-10", status: "active" },
  { id: "7", name: "Zoom", category: "Communication", description: "Video conferencing", icon: "📹", connected: true, lastSync: "2024-01-12", status: "active" },
  { id: "8", name: "Slack", category: "Communication", description: "Team messaging", icon: "💬", connected: true, lastSync: "2024-01-12", status: "active" },
  { id: "9", name: "Salesforce", category: "CRM", description: "Customer relationship management", icon: "☁️", connected: false, status: "disconnected" },
  { id: "10", name: "HubSpot", category: "CRM", description: "Marketing and sales CRM", icon: "🎯", connected: false, status: "disconnected" },
  { id: "11", name: "Xero", category: "Accounting", description: "Accounting software", icon: "📈", connected: false, status: "disconnected" },
  { id: "12", name: "Box", category: "Storage", description: "Enterprise cloud storage", icon: "📂", connected: false, status: "disconnected" },
  { id: "13", name: "Westlaw", category: "Legal Research", description: "Legal research database", icon: "⚖️", connected: true, lastSync: "2024-01-11", status: "active" },
  { id: "14", name: "LexisNexis", category: "Legal Research", description: "Legal research and analytics", icon: "📚", connected: false, status: "disconnected" },
  { id: "15", name: "PACER", category: "Court Filing", description: "Federal court records", icon: "🏛️", connected: true, lastSync: "2024-01-10", status: "active" },
  { id: "16", name: "Calendly", category: "Calendar", description: "Appointment scheduling", icon: "📅", connected: true, lastSync: "2024-01-12", status: "active" },
];

export function IntegrationHub() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [integrations, setIntegrations] = useState(mockIntegrations);

  const filteredIntegrations = integrations.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || i.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const connectedCount = integrations.filter(i => i.connected).length;

  const toggleConnection = (id: string) => {
    setIntegrations(prev => prev.map(i => {
      if (i.id === id) {
        const newConnected = !i.connected;
        toast.success(newConnected ? `Connected to ${i.name}` : `Disconnected from ${i.name}`);
        return {
          ...i,
          connected: newConnected,
          status: newConnected ? "active" : "disconnected",
          lastSync: newConnected ? new Date().toISOString().split('T')[0] : undefined
        };
      }
      return i;
    }));
  };

  const statusColors = {
    active: "bg-green-500/20 text-green-400",
    disconnected: "bg-gray-500/20 text-gray-400",
    error: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/20">
              <Globe className="h-8 w-8 text-blue-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                Integration Hub
                <Badge className="bg-blue-500/20 text-blue-400">250+ Apps</Badge>
              </h2>
              <p className="text-muted-foreground">
                Connect your favorite tools for seamless workflow automation
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-400">{connectedCount}</p>
              <p className="text-sm text-muted-foreground">Connected</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Check className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{connectedCount}</p>
              <p className="text-xs text-muted-foreground">Active Integrations</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Zap className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">1,247</p>
              <p className="text-xs text-muted-foreground">Syncs Today</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <RefreshCw className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">Real-time</p>
              <p className="text-xs text-muted-foreground">Sync Status</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">Issues</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search integrations..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {integrationCategories.slice(0, 6).map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
          <Button variant="outline" size="sm">
            More <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIntegrations.map((integration) => (
          <Card key={integration.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{integration.icon}</div>
                  <div>
                    <h3 className="font-semibold">{integration.name}</h3>
                    <Badge variant="outline" className="text-xs">{integration.category}</Badge>
                  </div>
                </div>
                <Switch
                  checked={integration.connected}
                  onCheckedChange={() => toggleConnection(integration.id)}
                />
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">{integration.description}</p>
              
              <div className="flex items-center justify-between">
                <Badge className={statusColors[integration.status]}>
                  {integration.status}
                </Badge>
                {integration.lastSync && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Synced {integration.lastSync}
                  </span>
                )}
              </div>

              {integration.connected && (
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Settings className="h-3 w-3 mr-1" />
                    Configure
                  </Button>
                  <Button variant="ghost" size="icon">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Request New Integration */}
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <Plus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg mb-2">Need a Different Integration?</h3>
          <p className="text-muted-foreground mb-4">
            We support 250+ integrations. Request a new one or use our API.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline">Request Integration</Button>
            <Button>View API Docs</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
