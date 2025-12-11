import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, TrendingUp, TrendingDown, DollarSign, Clock, 
  Users, Briefcase, Target, Award, ArrowUpRight, ArrowDownRight,
  Calendar, Download, Sparkles, Brain
} from "lucide-react";

interface MetricCard {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: any;
}

const keyMetrics: MetricCard[] = [
  { title: "Revenue YTD", value: "$2.4M", change: 12.5, changeLabel: "vs last year", icon: DollarSign },
  { title: "Billable Utilization", value: "78%", change: 5.2, changeLabel: "vs target 75%", icon: Target },
  { title: "Realization Rate", value: "92%", change: -2.1, changeLabel: "vs last quarter", icon: BarChart3 },
  { title: "Average Matter Value", value: "$45,200", change: 8.7, changeLabel: "vs benchmark", icon: Briefcase },
  { title: "Client Acquisition", value: "24", change: 15.0, changeLabel: "new this quarter", icon: Users },
  { title: "Collection Rate", value: "95%", change: 3.2, changeLabel: "vs last year", icon: Award },
];

const practiceAreaPerformance = [
  { area: "Corporate M&A", revenue: 850000, matters: 12, utilization: 85, growth: 15 },
  { area: "Litigation", revenue: 620000, matters: 28, utilization: 72, growth: 8 },
  { area: "Real Estate", revenue: 420000, matters: 35, utilization: 80, growth: 22 },
  { area: "Employment", revenue: 310000, matters: 18, utilization: 75, growth: -5 },
  { area: "IP/Patent", revenue: 280000, matters: 8, utilization: 88, growth: 12 },
];

const attorneyPerformance = [
  { name: "Sarah Johnson", role: "Partner", billable: 1840, target: 1800, realization: 94, revenue: 460000 },
  { name: "Michael Chen", role: "Senior Associate", billable: 1920, target: 1900, realization: 91, revenue: 288000 },
  { name: "Emily Davis", role: "Associate", billable: 1780, target: 1850, realization: 88, revenue: 178000 },
  { name: "James Wilson", role: "Partner", billable: 1650, target: 1800, realization: 96, revenue: 412500 },
  { name: "Lisa Brown", role: "Associate", billable: 1890, target: 1850, realization: 85, revenue: 170100 },
];

const aiInsights = [
  { type: "opportunity", message: "Real Estate practice showing 22% growth - consider expanding team", priority: "high" },
  { type: "risk", message: "Employment practice underperforming by 5% - review pricing strategy", priority: "medium" },
  { type: "trend", message: "Client acquisition up 15% this quarter - marketing ROI is strong", priority: "info" },
  { type: "prediction", message: "Projected Q2 revenue: $680K based on current pipeline", priority: "info" },
];

export function PracticeAnalytics() {
  const [dateRange, setDateRange] = useState("quarter");
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/20">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  Practice Analytics
                  <Badge className="bg-primary/20 text-primary">AI-Powered</Badge>
                </h2>
                <p className="text-muted-foreground">
                  Real-time insights and predictive analytics for your practice
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {keyMetrics.map((metric, i) => (
          <Card key={i} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <metric.icon className="h-5 w-5 text-primary" />
                {metric.change >= 0 ? (
                  <div className="flex items-center text-green-400 text-xs">
                    <ArrowUpRight className="h-3 w-3" />
                    {metric.change}%
                  </div>
                ) : (
                  <div className="flex items-center text-red-400 text-xs">
                    <ArrowDownRight className="h-3 w-3" />
                    {Math.abs(metric.change)}%
                  </div>
                )}
              </div>
              <p className="text-2xl font-bold">{metric.value}</p>
              <p className="text-xs text-muted-foreground">{metric.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{metric.changeLabel}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="practice-areas">Practice Areas</TabsTrigger>
          <TabsTrigger value="attorneys">Attorney Performance</TabsTrigger>
          <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* AI Insights */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  AI-Powered Insights
                </CardTitle>
                <CardDescription>Intelligent recommendations based on your data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {aiInsights.map((insight, i) => (
                  <div 
                    key={i} 
                    className={`p-4 rounded-lg border ${
                      insight.priority === "high" ? "border-green-500/30 bg-green-500/5" :
                      insight.priority === "medium" ? "border-yellow-500/30 bg-yellow-500/5" :
                      "border-primary/30 bg-primary/5"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Brain className={`h-5 w-5 mt-0.5 ${
                        insight.priority === "high" ? "text-green-400" :
                        insight.priority === "medium" ? "text-yellow-400" :
                        "text-primary"
                      }`} />
                      <div>
                        <Badge variant="outline" className="mb-1 capitalize">{insight.type}</Badge>
                        <p className="text-sm">{insight.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Revenue Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-end gap-2">
                  {[65, 78, 82, 75, 88, 92, 85, 95, 88, 102, 98, 110].map((val, i) => (
                    <div 
                      key={i} 
                      className="flex-1 bg-primary/20 rounded-t transition-all hover:bg-primary/40"
                      style={{ height: `${val}%` }}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Jan</span>
                  <span>Dec</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="practice-areas" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Practice Area Performance</CardTitle>
              <CardDescription>Revenue and utilization by practice area</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {practiceAreaPerformance.map((area, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{area.area}</h4>
                        <p className="text-sm text-muted-foreground">{area.matters} active matters</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">${(area.revenue / 1000).toFixed(0)}K</p>
                        <div className={`flex items-center text-sm ${area.growth >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {area.growth >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                          {area.growth >= 0 ? "+" : ""}{area.growth}%
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Utilization</span>
                          <span>{area.utilization}%</span>
                        </div>
                        <Progress value={area.utilization} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attorneys" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Attorney Performance</CardTitle>
              <CardDescription>Individual attorney metrics and goals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attorneyPerformance.map((attorney, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{attorney.name}</h4>
                        <p className="text-sm text-muted-foreground">{attorney.role}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">${(attorney.revenue / 1000).toFixed(0)}K</p>
                        <p className="text-sm text-muted-foreground">Revenue Generated</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Billable Hours</span>
                          <span className={attorney.billable >= attorney.target ? "text-green-400" : "text-yellow-400"}>
                            {attorney.billable}/{attorney.target}
                          </span>
                        </div>
                        <Progress value={(attorney.billable / attorney.target) * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Realization</span>
                          <span>{attorney.realization}%</span>
                        </div>
                        <Progress value={attorney.realization} className="h-2" />
                      </div>
                      <div className="text-right">
                        <Badge className={attorney.billable >= attorney.target ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}>
                          {attorney.billable >= attorney.target ? "On Track" : "Below Target"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-400" />
                  Revenue Forecast
                </CardTitle>
                <CardDescription>AI-predicted revenue for next quarter</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-4xl font-bold text-green-400">$720K</p>
                  <p className="text-muted-foreground mt-2">Projected Q2 Revenue</p>
                  <Badge className="mt-4 bg-green-500/20 text-green-400">85% confidence</Badge>
                </div>
                <div className="space-y-3 mt-6">
                  <div className="flex justify-between text-sm">
                    <span>Best Case</span>
                    <span className="font-semibold">$820K</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Expected</span>
                    <span className="font-semibold">$720K</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Worst Case</span>
                    <span className="font-semibold">$620K</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Win Probability Analysis
                </CardTitle>
                <CardDescription>Predicted outcomes for active matters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { matter: "Corporate Merger - ABC Corp", probability: 85, value: "$250K" },
                    { matter: "Patent Litigation - TechCo", probability: 65, value: "$175K" },
                    { matter: "Real Estate - 500 Main St", probability: 92, value: "$85K" },
                    { matter: "Employment Dispute", probability: 45, value: "$45K" },
                  ].map((item, i) => (
                    <div key={i} className="p-3 border rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-sm">{item.matter}</span>
                        <span className="text-sm text-muted-foreground">{item.value}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={item.probability} className="flex-1 h-2" />
                        <span className={`text-sm font-semibold ${
                          item.probability >= 70 ? "text-green-400" :
                          item.probability >= 50 ? "text-yellow-400" :
                          "text-red-400"
                        }`}>
                          {item.probability}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
