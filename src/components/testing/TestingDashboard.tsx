import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Bug, CheckCircle, XCircle, Clock, AlertTriangle, Users, BarChart3, RefreshCw, Play, Loader2, Bot, Database, Zap } from 'lucide-react';
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

interface AutomatedTestResult {
  test: string;
  status: "pass" | "fail" | "skip";
  message: string;
  duration_ms: number;
}

interface DatabaseStats {
  profiles: number;
  organizations: number;
  clients: number;
  cases: number;
  appointments: number;
  chats: number;
}

export const TestingDashboard = () => {
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [stats, setStats] = useState<TestStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [runningTests, setRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<AutomatedTestResult[]>([]);
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);

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

  const fetchDatabaseStats = async () => {
    try {
      const [profiles, orgs, clients, cases, appointments, chats] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('organizations').select('id', { count: 'exact', head: true }),
        supabase.from('clients').select('id', { count: 'exact', head: true }),
        supabase.from('cases').select('id', { count: 'exact', head: true }),
        supabase.from('appointments').select('id', { count: 'exact', head: true }),
        supabase.from('ai_chat_history').select('id', { count: 'exact', head: true }),
      ]);

      setDbStats({
        profiles: profiles.count || 0,
        organizations: orgs.count || 0,
        clients: clients.count || 0,
        cases: cases.count || 0,
        appointments: appointments.count || 0,
        chats: chats.count || 0,
      });
    } catch (error) {
      console.error('Error fetching DB stats:', error);
    }
  };

  const runAutomatedTests = async () => {
    setRunningTests(true);
    setTestResults([]);
    toast.info('Starting automated test suite...');

    try {
      const { data, error } = await supabase.functions.invoke('run-automated-tests');

      if (error) throw error;

      if (data?.results) {
        setTestResults(data.results);
        const passed = data.results.filter((r: AutomatedTestResult) => r.status === 'pass').length;
        const failed = data.results.filter((r: AutomatedTestResult) => r.status === 'fail').length;
        
        if (failed === 0) {
          toast.success(`All ${passed} tests passed!`);
        } else {
          toast.warning(`${passed} passed, ${failed} failed`);
        }
      }

      // Refresh data after tests
      await fetchBugReports();
      await fetchDatabaseStats();
    } catch (error: any) {
      console.error('Error running tests:', error);
      toast.error('Failed to run automated tests: ' + error.message);
    } finally {
      setRunningTests(false);
    }
  };

  useEffect(() => {
    fetchBugReports();
    fetchDatabaseStats();
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
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bot className="h-8 w-8 text-primary" />
          Internal Testing System
        </h1>
        <div className="flex gap-2">
          <Button 
            onClick={runAutomatedTests} 
            variant="default"
            disabled={runningTests}
            className="bg-neon-green hover:bg-neon-green/90"
          >
            {runningTests ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Automated Tests
              </>
            )}
          </Button>
          <Button onClick={() => { fetchBugReports(); fetchDatabaseStats(); }} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Database Stats */}
      {dbStats && (
        <Card className="border-neon-cyan/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-neon-cyan" />
              Live Database Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-neon-cyan">{dbStats.profiles}</p>
                <p className="text-xs text-muted-foreground">Profiles</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-neon-purple">{dbStats.organizations}</p>
                <p className="text-xs text-muted-foreground">Organizations</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-neon-pink">{dbStats.clients}</p>
                <p className="text-xs text-muted-foreground">Clients</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-neon-green">{dbStats.cases}</p>
                <p className="text-xs text-muted-foreground">Cases</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-neon-gold">{dbStats.appointments}</p>
                <p className="text-xs text-muted-foreground">Appointments</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-foreground">{dbStats.chats}</p>
                <p className="text-xs text-muted-foreground">Chat Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card className="border-neon-green/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-neon-green" />
              Automated Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {testResults.map((result, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/30">
                  <div className="flex items-center gap-2">
                    {result.status === 'pass' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : result.status === 'fail' ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="font-medium">{result.test}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{result.duration_ms}ms</span>
                    <Badge variant={result.status === 'pass' ? 'default' : 'destructive'}>
                      {result.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
