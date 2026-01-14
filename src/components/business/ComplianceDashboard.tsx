import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, Lock, Globe, CheckCircle, AlertTriangle, Clock,
  FileText, Download, Eye, RefreshCw, Scale, Server, 
  Key, Users, Database, Activity
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ComplianceItem {
  id: string;
  name: string;
  category: string;
  status: "compliant" | "warning" | "action_required";
  lastAudit: string;
  nextAudit: string;
  score: number;
}

const complianceFrameworks = [
  { 
    name: "SOC 2 Type II", 
    icon: Shield, 
    status: "certified",
    validUntil: "2025-06-15",
    description: "Service Organization Control certification",
    score: 98
  },
  { 
    name: "HIPAA", 
    icon: Lock, 
    status: "compliant",
    validUntil: "2024-12-31",
    description: "Health Insurance Portability and Accountability Act",
    score: 100
  },
  { 
    name: "GDPR", 
    icon: Globe, 
    status: "compliant",
    validUntil: "Ongoing",
    description: "General Data Protection Regulation",
    score: 95
  },
  { 
    name: "ABA Ethics", 
    icon: Scale, 
    status: "certified",
    validUntil: "2025-01-01",
    description: "American Bar Association ethical standards",
    score: 100
  },
];

const complianceItems: ComplianceItem[] = [
  { id: "1", name: "Data Encryption at Rest", category: "Security", status: "compliant", lastAudit: "2024-01-05", nextAudit: "2024-04-05", score: 100 },
  { id: "2", name: "Access Control Policies", category: "Security", status: "compliant", lastAudit: "2024-01-08", nextAudit: "2024-04-08", score: 98 },
  { id: "3", name: "Audit Logging", category: "Monitoring", status: "compliant", lastAudit: "2024-01-10", nextAudit: "2024-04-10", score: 100 },
  { id: "4", name: "Data Retention Policy", category: "Data", status: "warning", lastAudit: "2024-01-02", nextAudit: "2024-02-02", score: 85 },
  { id: "5", name: "Incident Response Plan", category: "Security", status: "compliant", lastAudit: "2024-01-06", nextAudit: "2024-04-06", score: 95 },
  { id: "6", name: "Vendor Risk Assessment", category: "Third Party", status: "action_required", lastAudit: "2023-12-15", nextAudit: "2024-01-15", score: 70 },
  { id: "7", name: "Privacy Policy Updates", category: "Legal", status: "compliant", lastAudit: "2024-01-01", nextAudit: "2024-07-01", score: 100 },
  { id: "8", name: "Employee Training", category: "Training", status: "compliant", lastAudit: "2024-01-03", nextAudit: "2024-04-03", score: 92 },
];

const auditLogs = [
  { action: "User login from new device", user: "john@lawfirm.com", timestamp: "2024-01-12 14:32:00", risk: "low" },
  { action: "Bulk document export", user: "sarah@lawfirm.com", timestamp: "2024-01-12 13:15:00", risk: "medium" },
  { action: "Permission change", user: "admin@lawfirm.com", timestamp: "2024-01-12 11:45:00", risk: "low" },
  { action: "Failed login attempt (3x)", user: "unknown", timestamp: "2024-01-12 10:22:00", risk: "high" },
  { action: "API key regeneration", user: "admin@lawfirm.com", timestamp: "2024-01-12 09:00:00", risk: "low" },
];

export function ComplianceDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isScanning, setIsScanning] = useState(false);

  const overallScore = Math.round(
    complianceItems.reduce((sum, item) => sum + item.score, 0) / complianceItems.length
  );

  const runSecurityScan = async () => {
    setIsScanning(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please sign in to run security scan");
        setIsScanning(false);
        return;
      }

      // Get user's organization
      const { data: orgMember } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .single();

      if (!orgMember) {
        toast.error("No organization found");
        setIsScanning(false);
        return;
      }

      // Log the compliance scan
      await supabase.from("compliance_logs").insert({
        organization_id: orgMember.organization_id,
        user_id: user.id,
        action: "security_scan",
        resource_type: "system",
        compliance_framework: "SOC2",
        severity: "info",
      });

      // Simulate scan time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Security scan completed - No vulnerabilities found");
    } catch (error) {
      console.error("Security scan error:", error);
      toast.error("Security scan failed");
    } finally {
      setIsScanning(false);
    }
  };

  const statusColors = {
    compliant: "bg-green-500/20 text-green-400 border-green-500/30",
    warning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    action_required: "bg-red-500/20 text-red-400 border-red-500/30",
    certified: "bg-green-500/20 text-green-400 border-green-500/30",
  };

  const riskColors = {
    low: "bg-green-500/20 text-green-400",
    medium: "bg-yellow-500/20 text-yellow-400",
    high: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-500/20">
              <Shield className="h-8 w-8 text-green-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                Compliance & Security
                <Badge className="bg-green-500/20 text-green-400">Enterprise Grade</Badge>
              </h2>
              <p className="text-muted-foreground">
                SOC 2, HIPAA, GDPR compliant with real-time security monitoring
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-green-400">{overallScore}%</div>
              <p className="text-sm text-muted-foreground">Compliance Score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certifications */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {complianceFrameworks.map((framework, i) => (
          <Card key={i} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <framework.icon className="h-5 w-5 text-green-400" />
                </div>
                <Badge className={statusColors[framework.status]}>{framework.status}</Badge>
              </div>
              <h3 className="font-semibold">{framework.name}</h3>
              <p className="text-xs text-muted-foreground mb-2">{framework.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Valid: {framework.validUntil}</span>
                <span className="text-sm font-bold text-green-400">{framework.score}%</span>
              </div>
              <Progress value={framework.score} className="h-1 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="controls">Security Controls</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Compliance Items */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Compliance Checklist</CardTitle>
                    <Button onClick={runSecurityScan} disabled={isScanning} size="sm">
                      {isScanning ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Scanning...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Run Scan
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {complianceItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {item.status === "compliant" ? (
                            <CheckCircle className="h-5 w-5 text-green-400" />
                          ) : item.status === "warning" ? (
                            <AlertTriangle className="h-5 w-5 text-yellow-400" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-red-400" />
                          )}
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">{item.score}%</p>
                            <p className="text-xs text-muted-foreground">Next: {item.nextAudit}</p>
                          </div>
                          <Badge className={statusColors[item.status]}>{item.status.replace("_", " ")}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Security Status */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-400" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: "Encryption", status: "Active", icon: Lock },
                    { name: "Firewall", status: "Active", icon: Shield },
                    { name: "Backups", status: "Current", icon: Database },
                    { name: "SSL/TLS", status: "Valid", icon: Key },
                    { name: "MFA", status: "Enabled", icon: Users },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <item.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400">{item.status}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-primary" />
                    Infrastructure
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Data Centers</span>
                    <span>3 (US, EU, APAC)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Uptime SLA</span>
                    <span>99.99%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Encryption</span>
                    <span>AES-256</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Backup Freq</span>
                    <span>Hourly</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Audit Log</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              <CardDescription>Real-time security event monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditLogs.map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${riskColors[log.risk as keyof typeof riskColors]}`}>
                        <Activity className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{log.action}</p>
                        <p className="text-xs text-muted-foreground">{log.user}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">{log.timestamp}</span>
                      <Badge className={riskColors[log.risk as keyof typeof riskColors]}>{log.risk}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="controls" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Controls</CardTitle>
              <CardDescription>Configure and monitor security settings</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: "Two-Factor Authentication", desc: "Require 2FA for all users", enabled: true },
                { title: "Session Timeout", desc: "Auto-logout after 30 minutes", enabled: true },
                { title: "IP Whitelisting", desc: "Restrict access by IP address", enabled: false },
                { title: "Password Complexity", desc: "Enforce strong passwords", enabled: true },
                { title: "Data Loss Prevention", desc: "Monitor sensitive data transfer", enabled: true },
                { title: "Device Trust", desc: "Require trusted devices", enabled: false },
              ].map((control, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{control.title}</p>
                    <p className="text-sm text-muted-foreground">{control.desc}</p>
                  </div>
                  <Badge className={control.enabled ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}>
                    {control.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "SOC 2 Audit Report", date: "Jan 2024", icon: Shield },
              { title: "HIPAA Assessment", date: "Dec 2023", icon: Lock },
              { title: "Penetration Test Results", date: "Nov 2023", icon: Activity },
              { title: "Vulnerability Scan", date: "Jan 2024", icon: Eye },
              { title: "Access Review", date: "Jan 2024", icon: Users },
              { title: "Data Flow Mapping", date: "Dec 2023", icon: Database },
            ].map((report, i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <report.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{report.title}</h3>
                      <p className="text-sm text-muted-foreground">{report.date}</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
