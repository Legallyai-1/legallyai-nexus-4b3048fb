import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Users, FileText, Calendar, MessageSquare, Clock, 
  DollarSign, ChevronRight, Send, CreditCard
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { MainLayout } from "@/components/layout/MainLayout";
import { LexiAssistant } from "@/components/dashboard/LexiAssistant";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        if (!session?.user) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-legal-gold">Loading...</div>
        </div>
      </MainLayout>
    );
  }

  const quickActions = [
    { icon: FileText, label: "Cases", href: "/cases", color: "text-legal-gold" },
    { icon: Users, label: "Clients", href: "/clients", color: "text-legal-cyan" },
    { icon: Calendar, label: "Appointments", href: "/appointments", color: "text-green-400" },
    { icon: MessageSquare, label: "Messages", href: "/messages", color: "text-purple-400" },
    { icon: Clock, label: "Time Clock", href: "/timeclock", color: "text-orange-400" },
    { icon: DollarSign, label: "Invoices", href: "/invoices", color: "text-emerald-400" },
    { icon: CreditCard, label: "Client Financing", href: "/loans?tab=lawyer", color: "text-cyan-400" },
  ];

  const stats = [
    { label: "Active Cases", value: "24", change: "+3 this week" },
    { label: "Clients", value: "156", change: "+12 this month" },
    { label: "Upcoming Appointments", value: "8", change: "Next: Today 2:00 PM" },
    { label: "Pending Invoices", value: "$45,200", change: "5 overdue" },
  ];

  return (
    <MainLayout>
      <div className="p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">
            Welcome back, {user?.user_metadata?.full_name || "User"}
          </h1>
          <p className="text-muted-foreground">Here's what's happening with your law practice today.</p>
        </div>

        {/* Lexi Assistant */}
        <div className="mb-8">
          <LexiAssistant 
            userType="lawyer" 
            userName={user?.user_metadata?.full_name?.split(' ')[0] || "there"} 
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <Card key={i} className="bg-card hover:shadow-card transition-shadow">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-bold mb-1">{stat.value}</p>
                <p className="text-xs text-legal-cyan">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action, i) => (
              <Card 
                key={i} 
                className="bg-card hover:bg-muted/50 transition-colors cursor-pointer group"
                onClick={() => navigate(action.href)}
              >
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <action.icon className={`h-8 w-8 ${action.color} mb-3 group-hover:scale-110 transition-transform`} />
                  <span className="text-sm font-medium">{action.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates from your practice</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: "New document uploaded", case: "Smith vs. Johnson", time: "2 hours ago" },
                  { action: "Appointment scheduled", case: "Williams Divorce Case", time: "4 hours ago" },
                  { action: "Invoice paid", case: "Corporate Merger - ABC Corp", time: "Yesterday" },
                  { action: "Case status updated", case: "Real Estate Transaction #234", time: "Yesterday" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-medium text-sm">{item.action}</p>
                      <p className="text-xs text-muted-foreground">{item.case}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>Your appointments for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { time: "9:00 AM", client: "John Smith", type: "Consultation" },
                  { time: "11:30 AM", client: "Sarah Williams", type: "Case Review" },
                  { time: "2:00 PM", client: "ABC Corporation", type: "Contract Signing" },
                  { time: "4:30 PM", client: "Michael Brown", type: "Initial Meeting" },
                ].map((apt, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border/50">
                    <div className="text-center min-w-[60px]">
                      <span className="text-sm font-semibold text-legal-gold">{apt.time}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{apt.client}</p>
                      <p className="text-xs text-muted-foreground">{apt.type}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={() => navigate("/appointments")}>
                View All Appointments
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
