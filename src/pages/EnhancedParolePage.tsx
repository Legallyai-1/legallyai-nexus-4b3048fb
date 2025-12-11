import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, Brain, MapPin, Calendar, Users, 
  AlertTriangle, CheckCircle, Target, TrendingUp,
  Bell, Clock, Award, Activity, FileText, Video
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { AnimatedAIHead } from "@/components/ui/AnimatedAIHead";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const EnhancedParolePage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [complianceScore, setComplianceScore] = useState(87);
  const [recidivismRisk, setRecidivismRisk] = useState(12);
  const { toast } = useToast();

  const checkIns = [
    { id: 1, date: "Dec 10", type: "In-Person", status: "completed", location: "Probation Office" },
    { id: 2, date: "Dec 17", type: "Virtual", status: "upcoming", location: "Video Call" },
    { id: 3, date: "Dec 24", type: "Phone", status: "scheduled", location: "Phone Check-in" },
  ];

  const conditions = [
    { id: 1, condition: "Weekly check-ins", status: "compliant", streak: 12 },
    { id: 2, condition: "Drug testing", status: "compliant", streak: 8 },
    { id: 3, condition: "Employment verification", status: "compliant", streak: 6 },
    { id: 4, condition: "Curfew (10 PM)", status: "warning", streak: 0 },
    { id: 5, condition: "Geo-restriction (LA County)", status: "compliant", streak: 45 },
  ];

  const rehabSessions = [
    { id: 1, type: "Individual Therapy", date: "Dec 12", time: "2:00 PM", progress: 75 },
    { id: 2, type: "Group Therapy", date: "Dec 14", time: "4:00 PM", progress: 60 },
    { id: 3, type: "Substance Abuse", date: "Dec 16", time: "10:00 AM", progress: 80 },
  ];

  const gamificationBadges = [
    { name: "Perfect Month", icon: "🏆", earned: true },
    { name: "10 Check-ins", icon: "✅", earned: true },
    { name: "Drug Free 30", icon: "💪", earned: true },
    { name: "Employment Star", icon: "⭐", earned: false },
    { name: "Community Helper", icon: "🤝", earned: false },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-background p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto space-y-6"
        >
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-teal-500/20 border border-green-500/30">
              <Shield className="h-8 w-8 text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Parole & Probation Hub</h1>
              <p className="text-muted-foreground">RehabilitAI - Complete supervision management with ML predictions</p>
            </div>
            <div className="ml-auto">
              <AnimatedAIHead variant="green" size="sm" />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-7 w-full">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="checkins">Check-ins</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="rehab">Rehab Plan</TabsTrigger>
              <TabsTrigger value="geo">Geo-Alerts</TabsTrigger>
              <TabsTrigger value="gamification">Progress</TabsTrigger>
              <TabsTrigger value="dui-link">DUI Link</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-card/50 border-green-500/20">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-400">{complianceScore}%</div>
                    <Progress value={complianceScore} className="mt-2" />
                  </CardContent>
                </Card>

                <Card className="bg-card/50 border-blue-500/20">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Recidivism Risk</CardTitle>
                    <Brain className="h-4 w-4 text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-400">{recidivismRisk}%</div>
                    <p className="text-xs text-muted-foreground">95% ML accuracy</p>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 border-purple-500/20">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Days Remaining</CardTitle>
                    <Clock className="h-4 w-4 text-purple-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">287</div>
                    <p className="text-xs text-muted-foreground">Est. completion: Sep 2025</p>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 border-yellow-500/20">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Points Earned</CardTitle>
                    <Award className="h-4 w-4 text-yellow-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1,250</div>
                    <p className="text-xs text-muted-foreground">3 badges earned</p>
                  </CardContent>
                </Card>
              </div>

              {/* AI Insights */}
              <Card className="bg-gradient-to-br from-green-500/10 to-teal-500/10 border-green-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-green-400" />
                    RehabAI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <AnimatedAIHead variant="green" size="sm" />
                    <div className="space-y-2">
                      <p className="text-sm">
                        <strong>Positive Trend:</strong> Your compliance has improved 15% over the past month. 
                        Keep maintaining your check-in schedule.
                      </p>
                      <p className="text-sm">
                        <strong>Recommendation:</strong> Consider joining the community service program 
                        to earn additional points and reduce your supervision level.
                      </p>
                      <p className="text-sm text-yellow-400">
                        <strong>Alert:</strong> Curfew violation detected on Dec 8. Please discuss with your officer.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming */}
              <Card className="bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {checkIns.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            item.status === "completed" ? "bg-green-500/20" :
                            item.status === "upcoming" ? "bg-blue-500/20" : "bg-muted"
                          }`}>
                            {item.type === "Virtual" ? <Video className="h-5 w-5" /> :
                             item.type === "In-Person" ? <Users className="h-5 w-5" /> :
                             <Bell className="h-5 w-5" />}
                          </div>
                          <div>
                            <p className="font-medium">{item.type} Check-in</p>
                            <p className="text-sm text-muted-foreground">{item.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm">{item.date}</span>
                          <Badge variant={item.status === "completed" ? "default" : "secondary"}>
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="checkins" className="space-y-6">
              <Card className="bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Check-in Management
                    </span>
                    <Button size="sm">Schedule Check-in</Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="bg-muted/30">
                      <CardContent className="pt-4 text-center">
                        <p className="text-3xl font-bold text-green-400">12</p>
                        <p className="text-sm text-muted-foreground">Completed</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/30">
                      <CardContent className="pt-4 text-center">
                        <p className="text-3xl font-bold text-blue-400">3</p>
                        <p className="text-sm text-muted-foreground">Upcoming</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/30">
                      <CardContent className="pt-4 text-center">
                        <p className="text-3xl font-bold text-red-400">1</p>
                        <p className="text-sm text-muted-foreground">Missed</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-3">
                    {[...checkIns, 
                      { id: 4, date: "Dec 3", type: "In-Person", status: "completed", location: "Probation Office" },
                      { id: 5, date: "Nov 26", type: "Virtual", status: "completed", location: "Video Call" },
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${
                            item.status === "completed" ? "bg-green-500" :
                            item.status === "upcoming" ? "bg-blue-500" : "bg-yellow-500"
                          }`} />
                          <div>
                            <p className="font-medium">{item.date} - {item.type}</p>
                            <p className="text-sm text-muted-foreground">{item.location}</p>
                          </div>
                        </div>
                        <Badge variant={item.status === "completed" ? "default" : "secondary"}>
                          {item.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-6">
              <Card className="bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Compliance Tracker
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {conditions.map((c) => (
                    <div key={c.id} className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            c.status === "compliant" ? "bg-green-500" : "bg-yellow-500"
                          }`} />
                          <span className="font-medium">{c.condition}</span>
                        </div>
                        <Badge variant={c.status === "compliant" ? "default" : "destructive"}>
                          {c.status}
                        </Badge>
                      </div>
                      {c.streak > 0 && (
                        <p className="text-sm text-muted-foreground ml-6">
                          🔥 {c.streak} day streak
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rehab" className="space-y-6">
              <Card className="bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Personalized Rehab Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {rehabSessions.map((session) => (
                    <div key={session.id} className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">{session.type}</p>
                          <p className="text-sm text-muted-foreground">
                            {session.date} at {session.time}
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          <Video className="mr-1 h-4 w-4" />
                          Join
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={session.progress} className="flex-1" />
                        <span className="text-sm text-muted-foreground">{session.progress}%</span>
                      </div>
                    </div>
                  ))}

                  <Button className="w-full">
                    <Users className="mr-2 h-4 w-4" />
                    Schedule Group Therapy
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="geo" className="space-y-6">
              <Card className="bg-card/50 border-red-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-red-400" />
                    Geo-Restriction Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Map integration pending</p>
                      <p className="text-sm text-muted-foreground">Google Places API</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-green-500/10 border-green-500/30">
                      <CardContent className="pt-4">
                        <p className="font-medium">Allowed Zone</p>
                        <p className="text-sm text-muted-foreground">Los Angeles County</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-red-500/10 border-red-500/30">
                      <CardContent className="pt-4">
                        <p className="font-medium">Restricted</p>
                        <p className="text-sm text-muted-foreground">Schools, Bars within 1000ft</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium text-yellow-500">Recent Alerts</span>
                    </div>
                    <p className="text-sm">Dec 8, 10:15 PM - Curfew boundary approach detected</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gamification" className="space-y-6">
              <Card className="bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-400" />
                    Progress Gamification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-yellow-400">1,250</p>
                    <p className="text-muted-foreground">Total Points</p>
                    <Progress value={62} className="mt-4" />
                    <p className="text-sm mt-2">750 points to next level</p>
                  </div>

                  <div className="grid grid-cols-5 gap-4">
                    {gamificationBadges.map((badge, i) => (
                      <div 
                        key={i}
                        className={`text-center p-4 rounded-lg ${
                          badge.earned ? "bg-yellow-500/10 border border-yellow-500/30" : "bg-muted/30 opacity-50"
                        }`}
                      >
                        <span className="text-3xl">{badge.icon}</span>
                        <p className="text-xs mt-2">{badge.name}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-semibold mb-2">Next Rewards</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• 1,500 pts: Reduced check-in frequency</li>
                      <li>• 2,000 pts: Early supervision review eligibility</li>
                      <li>• 3,000 pts: Community recognition certificate</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dui-link" className="space-y-6">
              <Card className="bg-card/50 border-red-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-red-400" />
                    DUI Case Integration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-lg border border-red-500/20">
                    <div className="flex items-center gap-4">
                      <AnimatedAIHead variant="orange" size="sm" />
                      <div>
                        <p className="font-medium">Linked DUI Case: #2024-DUI-001</p>
                        <p className="text-sm text-muted-foreground">
                          DUI probation conditions integrated with parole supervision
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-medium mb-2">DUI-Specific Conditions</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Ignition interlock device</li>
                        <li>• AA meeting attendance (2x/week)</li>
                        <li>• Zero BAC tolerance</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-medium mb-2">Combined Timeline</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Parole end: Sep 2025</li>
                        <li>• DUI probation end: Dec 2025</li>
                        <li>• License restoration: Mar 2025</li>
                      </ul>
                    </div>
                  </div>

                  <Button className="w-full" variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    View Full DUI Case Details
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default EnhancedParolePage;
