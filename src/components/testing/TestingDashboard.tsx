import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Bug, CheckCircle, XCircle, Clock, AlertTriangle, Users, BarChart3, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface BugReport {
  id: string;
  title: string;
  description: string;
  hub_name: string;
  severity: string;
  category: string;
  status: string;
  reporter_name: string;
  reporter_email: string;
  page_url: string;
  created_at: string;
  steps_to_reproduce: string;
  expected_behavior: string;
  actual_behavior: string;
}

interface TestStats {
  total_bugs: number;
  open_bugs: number;
  resolved_bugs: number;
  critical_bugs: number;
  bugs_by_hub: Record<string, number>;
  bugs_by_severity: Record<string, number>;
}

export const TestingDashboard = () => {
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [stats, setStats] = useState<TestStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchBugReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bug_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBugReports(data || []);
      
      // Calculate stats
      const bugs = data || [];
      const statsData: TestStats = {
        total_bugs: bugs.length,
        open_bugs: bugs.filter(b => b.status === 'open').length,
        resolved_bugs: bugs.filter(b => b.status === 'resolved').length,
        critical_bugs: bugs.filter(b => b.severity === 'critical').length,
        bugs_by_hub: {},
        bugs_by_severity: {}
      };

      bugs.forEach(bug => {
        if (bug.hub_name) {
          statsData.bugs_by_hub[bug.hub_name] = (statsData.bugs_by_hub[bug.hub_name] || 0) + 1;
        }
        statsData.bugs_by_severity[bug.severity] = (statsData.bugs_by_severity[bug.severity] || 0) + 1;
      });

      setStats(statsData);
    } catch (error) {
      console.error('Error fetching bug reports:', error);
      toast.error('Failed to load bug reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBugReports();
  }, []);

  const updateBugStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('bug_reports')
        .update({ 
          status,
          resolved_at: status === 'resolved' ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(`Bug marked as ${status}`);
      fetchBugReports();
    } catch (error) {
      console.error('Error updating bug:', error);
      toast.error('Failed to update bug status');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'in_progress': return <RefreshCw className="h-4 w-4 text-blue-500" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'closed': return <XCircle className="h-4 w-4 text-gray-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    }
  };

  const filteredBugs = bugReports.filter(bug => {
    if (filter === 'all') return true;
    return bug.status === filter;
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Testing Dashboard</h1>
        <Button onClick={fetchBugReports} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Bugs</p>
                <p className="text-3xl font-bold">{stats?.total_bugs || 0}</p>
              </div>
              <Bug className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Bugs</p>
                <p className="text-3xl font-bold text-yellow-500">{stats?.open_bugs || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-3xl font-bold text-green-500">{stats?.resolved_bugs || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-3xl font-bold text-red-500">{stats?.critical_bugs || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bugs by Hub */}
      {stats && Object.keys(stats.bugs_by_hub).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bugs by Hub</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.bugs_by_hub).map(([hub, count]) => (
                <Badge key={hub} variant="outline" className="text-sm">
                  {hub}: {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bug Reports List */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All ({bugReports.length})</TabsTrigger>
          <TabsTrigger value="open">Open ({bugReports.filter(b => b.status === 'open').length})</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress ({bugReports.filter(b => b.status === 'in_progress').length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({bugReports.filter(b => b.status === 'resolved').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-4">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredBugs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No bug reports found
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredBugs.map(bug => (
                <Card key={bug.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(bug.status)}
                          <h3 className="font-semibold">{bug.title}</h3>
                          <Badge className={getSeverityColor(bug.severity)}>
                            {bug.severity}
                          </Badge>
                          <Badge variant="outline">{bug.category}</Badge>
                          {bug.hub_name && (
                            <Badge variant="secondary">{bug.hub_name}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{bug.description}</p>
                        {bug.steps_to_reproduce && (
                          <div className="text-sm">
                            <strong>Steps:</strong> {bug.steps_to_reproduce}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          Page: {bug.page_url} | Reporter: {bug.reporter_name || 'Anonymous'} | 
                          {new Date(bug.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {bug.status === 'open' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => updateBugStatus(bug.id, 'in_progress')}>
                              Start
                            </Button>
                            <Button size="sm" onClick={() => updateBugStatus(bug.id, 'resolved')}>
                              Resolve
                            </Button>
                          </>
                        )}
                        {bug.status === 'in_progress' && (
                          <Button size="sm" onClick={() => updateBugStatus(bug.id, 'resolved')}>
                            Mark Resolved
                          </Button>
                        )}
                        {bug.status === 'resolved' && (
                          <Button size="sm" variant="outline" onClick={() => updateBugStatus(bug.id, 'closed')}>
                            Close
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
