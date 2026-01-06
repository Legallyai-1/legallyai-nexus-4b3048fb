import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Users, FileText, Calendar, MessageSquare, Clock, 
  DollarSign, ChevronRight, Loader2
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { MainLayout } from "@/components/layout/MainLayout";
import { LexiAssistant } from "@/components/dashboard/LexiAssistant";
import { formatDistanceToNow } from "date-fns";

interface DashboardStats {
  activeCases: number;
  clients: number;
  upcomingAppointments: number;
  pendingInvoices: number;
}

interface RecentActivity {
  id: string;
  action: string;
  case_title: string;
  time: string;
}

interface UpcomingAppointment {
  id: string;
  time: string;
  client: string;
  type: string;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    activeCases: 0,
    clients: 0,
    upcomingAppointments: 0,
    pendingInvoices: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [appointments, setAppointments] = useState<UpcomingAppointment[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

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
      } else {
        fetchDashboardData();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchDashboardData = async () => {
    setStatsLoading(true);
    try {
      // Fetch active cases count
      const { count: casesCount } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Fetch clients count
      const { count: clientsCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

      // Fetch upcoming appointments
      const today = new Date().toISOString();
      const { data: appointmentsData, count: appointmentsCount } = await supabase
        .from('appointments')
        .select('id, title, start_time, clients(full_name)', { count: 'exact' })
        .gte('start_time', today)
        .order('start_time', { ascending: true })
        .limit(5);

      // Fetch pending invoices total
      const { data: invoicesData } = await supabase
        .from('invoices')
        .select('amount')
        .eq('status', 'pending');

      const pendingTotal = invoicesData?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;

      // Fetch recent case activity
      const { data: recentCases } = await supabase
        .from('cases')
        .select('id, title, status, updated_at')
        .order('updated_at', { ascending: false })
        .limit(4);

      setStats({
        activeCases: casesCount || 0,
        clients: clientsCount || 0,
        upcomingAppointments: appointmentsCount || 0,
        pendingInvoices: pendingTotal,
      });

      setAppointments(
        (appointmentsData || []).map((apt: any) => ({
          id: apt.id,
          time: new Date(apt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          client: apt.clients?.full_name || 'Unknown Client',
          type: apt.title || 'Appointment',
        }))
      );

      setRecentActivity(
        (recentCases || []).map((c: any) => ({
          id: c.id,
          action: `Case status: ${c.status}`,
          case_title: c.title,
          time: formatDistanceToNow(new Date(c.updated_at), { addSuffix: true }),
        }))
      );
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-legal-gold" />
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
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

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
          <Card className="bg-card hover:shadow-card transition-shadow">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Active Cases</p>
              {statsLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <p className="text-2xl font-bold mb-1">{stats.activeCases}</p>
                  <p className="text-xs text-legal-cyan">Total active</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card className="bg-card hover:shadow-card transition-shadow">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Clients</p>
              {statsLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <p className="text-2xl font-bold mb-1">{stats.clients}</p>
                  <p className="text-xs text-legal-cyan">Total clients</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card className="bg-card hover:shadow-card transition-shadow">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Upcoming Appointments</p>
              {statsLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <p className="text-2xl font-bold mb-1">{stats.upcomingAppointments}</p>
                  <p className="text-xs text-legal-cyan">Scheduled</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card className="bg-card hover:shadow-card transition-shadow">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Pending Invoices</p>
              {statsLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <p className="text-2xl font-bold mb-1">{formatCurrency(stats.pendingInvoices)}</p>
                  <p className="text-xs text-legal-cyan">Outstanding</p>
                </>
              )}
            </CardContent>
          </Card>
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
              {statsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : recentActivity.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No recent activity</p>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div>
                        <p className="font-medium text-sm">{item.action}</p>
                        <p className="text-xs text-muted-foreground">{item.case_title}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{item.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>Your upcoming appointments</CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : appointments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No upcoming appointments</p>
              ) : (
                <div className="space-y-3">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50">
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
              )}
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
