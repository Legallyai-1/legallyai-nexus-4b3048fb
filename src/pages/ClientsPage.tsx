import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, Search, Plus, Phone, Mail, FileText, ArrowLeft } from "lucide-react";
import { FuturisticBackground } from "@/components/ui/FuturisticBackground";
import { Layout } from "@/components/layout/Layout";
import type { User } from "@supabase/supabase-js";

interface Client {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
}

export default function ClientsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  // Mock clients for demo (replace with actual Supabase query when org is set up)
  const mockClients: Client[] = [
    { id: "1", full_name: "John Smith", email: "john.smith@email.com", phone: "(555) 123-4567", notes: "Corporate client - merger case", created_at: "2024-01-15" },
    { id: "2", full_name: "Sarah Williams", email: "sarah.w@email.com", phone: "(555) 234-5678", notes: "Family law - custody case", created_at: "2024-02-20" },
    { id: "3", full_name: "Michael Brown", email: "mbrown@company.com", phone: "(555) 345-6789", notes: "Real estate transactions", created_at: "2024-03-10" },
    { id: "4", full_name: "Emily Davis", email: "emily.davis@email.com", phone: "(555) 456-7890", notes: "Personal injury case", created_at: "2024-04-05" },
    { id: "5", full_name: "Robert Johnson", email: "rjohnson@corp.com", phone: "(555) 567-8901", notes: "Employment dispute", created_at: "2024-05-12" },
    { id: "6", full_name: "Jennifer Martinez", email: "jmartinez@email.com", phone: "(555) 678-9012", notes: "Estate planning", created_at: "2024-06-01" },
  ];

  const filteredClients = mockClients.filter(client =>
    client.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-neon-cyan">Loading...</div>
      </div>
    );
  }

  return (
    <Layout>
      <FuturisticBackground>
        <div className="min-h-screen py-8 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-display font-bold flex items-center gap-3">
                  <Users className="h-8 w-8 text-neon-cyan" />
                  <span>Clients</span>
                </h1>
                <p className="text-muted-foreground mt-1">Manage your client relationships</p>
              </div>
              <Button variant="neon">
                <Plus className="h-4 w-4 mr-2" />
                Add Client
              </Button>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clients by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50 border-neon-cyan/30"
                />
              </div>
            </div>

            {/* Clients Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClients.map((client) => (
                <Card key={client.id} className="glass-card hover:border-neon-cyan/50 transition-all cursor-pointer">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-neon-cyan/20 flex items-center justify-center">
                        <span className="text-neon-cyan font-bold">
                          {client.full_name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      {client.full_name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {client.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span>{client.email}</span>
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                      {client.notes && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          <span className="truncate">{client.notes}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Added {new Date(client.created_at).toLocaleDateString()}
                      </span>
                      <Button variant="ghost" size="sm" className="text-neon-cyan">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredClients.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No clients found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      </FuturisticBackground>
    </Layout>
  );
}
