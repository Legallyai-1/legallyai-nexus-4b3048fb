import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Plug, Search, RefreshCw, CheckCircle, XCircle, 
  Calculator, FileSignature, Calendar, MessageCircle,
  Cloud, Briefcase, CreditCard, Zap, Users, BookOpen
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface IntegrationHubProps {
  organizationId: string;
}

const ICON_MAP: Record<string, any> = {
  calculator: Calculator,
  'file-signature': FileSignature,
  calendar: Calendar,
  'message-circle': MessageCircle,
  cloud: Cloud,
  briefcase: Briefcase,
  'credit-card': CreditCard,
  zap: Zap,
  users: Users,
  search: BookOpen
};

export function IntegrationHub({ organizationId }: IntegrationHubProps) {
  const [loading, setLoading] = useState(true);
  const [integrations, setIntegrations] = useState<any>({ connected: [], available: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [syncing, setSyncing] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/integration-hub`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'list',
          organization_id: organizationId
        })
      });

      const result = await response.json();
      if (result.error) throw new Error(result.error);

      setIntegrations(result);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const connectIntegration = async (integrationName: string) => {
    setConnecting(integrationName);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/integration-hub`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'connect',
          organization_id: organizationId,
          integration_name: integrationName
        })
      });

      const result = await response.json();
      if (result.error) throw new Error(result.error);

      toast.success('Integration connected successfully');
      fetchIntegrations();
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect integration');
    } finally {
      setConnecting(null);
    }
  };

  const disconnectIntegration = async (integrationName: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/integration-hub`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'disconnect',
          organization_id: organizationId,
          integration_name: integrationName
        })
      });

      const result = await response.json();
      if (result.error) throw new Error(result.error);

      toast.success('Integration disconnected');
      fetchIntegrations();
    } catch (error: any) {
      toast.error(error.message || 'Failed to disconnect');
    }
  };

  const syncIntegration = async (integrationName: string) => {
    setSyncing(integrationName);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/integration-hub`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'sync',
          organization_id: organizationId,
          integration_name: integrationName
        })
      });

      const result = await response.json();
      if (result.error) throw new Error(result.error);

      toast.success(`Synced ${result.records_synced} records`);
      fetchIntegrations();
    } catch (error: any) {
      toast.error(error.message || 'Sync failed');
    } finally {
      setSyncing(null);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, [organizationId]);

  const categories = ['all', 'accounting', 'document', 'calendar', 'communication', 'storage', 'legal', 'payments', 'automation', 'crm', 'research'];

  const filteredAvailable = integrations.available?.filter((int: any) => {
    const matchesSearch = int.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         int.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || int.type === activeCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Plug className="h-6 w-6 text-primary" />
            Integration Hub
          </h2>
          <p className="text-muted-foreground">Connect 50+ apps to supercharge your practice</p>
        </div>
        <Button onClick={fetchIntegrations} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Connected Integrations */}
      {integrations.connected?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Connected ({integrations.connected.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {integrations.connected.map((integration: any) => {
                const IconComponent = ICON_MAP[integration.icon] || Plug;
                return (
                  <Card key={integration.id} className="bg-green-500/5 border-green-500/30">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-500/20 rounded-lg">
                            <IconComponent className="h-5 w-5 text-green-500" />
                          </div>
                          <div>
                            <h4 className="font-medium">{integration.integration_name}</h4>
                            <p className="text-xs text-muted-foreground">{integration.integration_type}</p>
                          </div>
                        </div>
                        <Badge variant="default" className="bg-green-500">
                          Active
                        </Badge>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Last sync: {integration.last_sync_at ? new Date(integration.last_sync_at).toLocaleDateString() : 'Never'}
                        </span>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => syncIntegration(integration.integration_name)}
                            disabled={syncing === integration.integration_name}
                          >
                            {syncing === integration.integration_name ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              <RefreshCw className="h-3 w-3" />
                            )}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => disconnectIntegration(integration.integration_name)}
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Available Integrations</CardTitle>
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search integrations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="flex-wrap h-auto gap-2 bg-transparent p-0 mb-6">
              {categories.map(cat => (
                <TabsTrigger 
                  key={cat} 
                  value={cat}
                  className="capitalize data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAvailable.map((integration: any) => {
                const IconComponent = ICON_MAP[integration.icon] || Plug;
                const isConnecting = connecting === integration.name;
                
                return (
                  <Card key={integration.name} className="hover:border-primary/50 transition-colors">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-lg">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{integration.displayName}</h4>
                            <Badge variant="outline" className="mt-1 text-xs capitalize">
                              {integration.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-3">
                        {integration.description}
                      </p>
                      <Button 
                        className="w-full mt-4"
                        onClick={() => connectIntegration(integration.name)}
                        disabled={isConnecting}
                      >
                        {isConnecting ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Plug className="h-4 w-4 mr-2" />
                            Connect
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredAvailable.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Plug className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No integrations found matching your search.</p>
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
