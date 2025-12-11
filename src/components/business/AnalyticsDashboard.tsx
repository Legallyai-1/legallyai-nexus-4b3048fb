import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, TrendingUp, TrendingDown, Users, DollarSign, 
  Clock, Briefcase, Award, Download, RefreshCw, Target
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AnalyticsDashboardProps {
  organizationId: string;
}

export function AnalyticsDashboard({ organizationId }: AnalyticsDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [badges, setBadges] = useState<any>(null);
  const [dateRange, setDateRange] = useState('30');

  const COLORS = ['#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444'];

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const [dashboardRes, insightsRes, badgesRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analytics-engine`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            action: 'dashboard',
            organization_id: organizationId,
            date_range: { start: new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString(), end: new Date().toISOString() }
          })
        }),
        fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analytics-engine`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            action: 'insights',
            organization_id: organizationId
          })
        }),
        fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analytics-engine`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            action: 'badges',
            organization_id: organizationId
          })
        })
      ]);

      const [dashboard, insightsData, badgesData] = await Promise.all([
        dashboardRes.json(),
        insightsRes.json(),
        badgesRes.json()
      ]);

      setDashboardData(dashboard);
      setInsights(insightsData);
      setBadges(badgesData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [organizationId, dateRange]);

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
            <BarChart3 className="h-6 w-6 text-primary" />
            Firm Analytics
          </h2>
          <p className="text-muted-foreground">Real-time insights powered by AI</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      {dashboardData?.overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <DollarSign className="h-8 w-8 text-primary" />
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <div className="mt-2">
                <p className="text-2xl font-bold">${dashboardData.overview.total_revenue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <Briefcase className="h-8 w-8 text-green-500" />
                <Badge variant="secondary">{dashboardData.overview.active_cases}</Badge>
              </div>
              <div className="mt-2">
                <p className="text-2xl font-bold">{dashboardData.overview.active_matters}</p>
                <p className="text-sm text-muted-foreground">Active Matters</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <Clock className="h-8 w-8 text-cyan-500" />
                <span className="text-sm text-cyan-500">
                  {(dashboardData.overview.utilization_rate * 100).toFixed(0)}%
                </span>
              </div>
              <div className="mt-2">
                <Progress value={dashboardData.overview.utilization_rate * 100} className="h-2 mb-1" />
                <p className="text-sm text-muted-foreground">Utilization Rate</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <Target className="h-8 w-8 text-yellow-500" />
                <span className="text-sm text-green-500">
                  {(dashboardData.overview.collection_rate * 100).toFixed(0)}%
                </span>
              </div>
              <div className="mt-2">
                <p className="text-2xl font-bold">${dashboardData.overview.unbilled_time_value.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Unbilled Time</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Revenue Trends</TabsTrigger>
          <TabsTrigger value="practice">Practice Areas</TabsTrigger>
          <TabsTrigger value="attorneys">Attorney Performance</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="badges">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={dashboardData?.trends?.revenue_trend || []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(v) => `$${(v/1000)}k`} />
                    <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']} />
                    <Area type="monotone" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Cases Opened vs Closed</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dashboardData?.trends?.cases_trend || []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="opened" fill="#22c55e" name="Opened" />
                    <Bar dataKey="closed" fill="#8b5cf6" name="Closed" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="practice">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Revenue by Practice Area</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dashboardData?.practice_areas || []}
                      dataKey="revenue"
                      nameKey="area"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ area, percent }) => `${area}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {(dashboardData?.practice_areas || []).map((_: any, index: number) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Practice Area Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(dashboardData?.practice_areas || []).map((area: any, i: number) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{area.area}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{area.cases} cases</Badge>
                          <span className="text-sm text-muted-foreground">
                            ${area.revenue.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={area.utilization * 100} className="flex-1 h-2" />
                        <span className="text-xs text-muted-foreground w-12">
                          {(area.utilization * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attorneys">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Attorney Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Attorney</th>
                      <th className="text-right py-3 px-4 font-medium">Billable Hours</th>
                      <th className="text-right py-3 px-4 font-medium">Revenue</th>
                      <th className="text-right py-3 px-4 font-medium">Utilization</th>
                      <th className="text-right py-3 px-4 font-medium">Realization</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(dashboardData?.attorney_performance || []).map((attorney: any, i: number) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {attorney.name}
                          </div>
                        </td>
                        <td className="text-right py-3 px-4">{attorney.billable_hours}h</td>
                        <td className="text-right py-3 px-4">${attorney.revenue.toLocaleString()}</td>
                        <td className="text-right py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Progress value={attorney.utilization * 100} className="w-16 h-2" />
                            <span className="text-sm">{(attorney.utilization * 100).toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4">
                          <Badge variant={attorney.realization >= 0.9 ? 'default' : 'secondary'}>
                            {(attorney.realization * 100).toFixed(0)}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <div className="space-y-4">
            {insights?.insights?.map((insight: any, i: number) => (
              <Card key={i} className={`border-l-4 ${
                insight.type === 'opportunity' ? 'border-l-green-500' :
                insight.type === 'risk' ? 'border-l-red-500' :
                insight.type === 'efficiency' ? 'border-l-yellow-500' :
                'border-l-primary'
              }`}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          insight.type === 'opportunity' ? 'default' :
                          insight.type === 'risk' ? 'destructive' :
                          'secondary'
                        }>
                          {insight.type}
                        </Badge>
                        <h4 className="font-medium">{insight.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {insight.action_items.map((action: string, j: number) => (
                          <Badge key={j} variant="outline" className="text-xs">
                            {action}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {(insight.impact_score * 100).toFixed(0)}
                      </p>
                      <p className="text-xs text-muted-foreground">Impact Score</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="badges">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges?.badges?.map((badge: any, i: number) => (
              <Card key={i} className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="pt-4 text-center">
                  <Award className="h-12 w-12 mx-auto text-primary mb-2" />
                  <h4 className="font-bold">{badge.badge_name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Earned {new Date(badge.earned_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
            {badges?.available_badges?.filter((ab: any) => !badges.badges?.find((b: any) => b.badge_type === ab.type)).map((badge: any, i: number) => (
              <Card key={`available-${i}`} className="border-dashed opacity-60">
                <CardContent className="pt-4 text-center">
                  <Award className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <h4 className="font-medium text-muted-foreground">{badge.name}</h4>
                  <p className="text-sm text-muted-foreground">{badge.requirement}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
