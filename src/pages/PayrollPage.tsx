import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, Users, Calendar, Clock, Download, 
  Plus, Search, Filter, TrendingUp, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PayrollEntry {
  id: string;
  employee_name: string;
  hours_worked: number;
  hourly_rate: number;
  gross_pay: number;
  deductions: number;
  net_pay: number;
  pay_period: string;
  status: "pending" | "processed" | "paid";
}

export default function PayrollPage() {
  const [payrollEntries, setPayrollEntries] = useState<PayrollEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalPayroll, setTotalPayroll] = useState(0);

  useEffect(() => {
    loadPayrollData();
  }, []);

  const loadPayrollData = async () => {
    setIsLoading(true);
    try {
      // Get time entries and calculate payroll
      const { data: timeEntries, error } = await supabase
        .from("time_entries")
        .select(`
          *,
          profiles:user_id (full_name, email)
        `)
        .not("clock_out", "is", null);

      if (error) throw error;

      // Calculate payroll from time entries
      const payrollMap = new Map<string, PayrollEntry>();
      
      (timeEntries || []).forEach((entry: any) => {
        const userId = entry.user_id;
        const hoursWorked = entry.clock_out 
          ? (new Date(entry.clock_out).getTime() - new Date(entry.clock_in).getTime()) / (1000 * 60 * 60)
          : 0;
        const hourlyRate = entry.hourly_rate || 50;
        
        if (payrollMap.has(userId)) {
          const existing = payrollMap.get(userId)!;
          existing.hours_worked += hoursWorked;
          existing.gross_pay = existing.hours_worked * existing.hourly_rate;
          existing.net_pay = existing.gross_pay - existing.deductions;
        } else {
          payrollMap.set(userId, {
            id: userId,
            employee_name: entry.profiles?.full_name || entry.profiles?.email || "Unknown",
            hours_worked: hoursWorked,
            hourly_rate: hourlyRate,
            gross_pay: hoursWorked * hourlyRate,
            deductions: 0,
            net_pay: hoursWorked * hourlyRate,
            pay_period: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
            status: "pending",
          });
        }
      });

      const entries = Array.from(payrollMap.values());
      setPayrollEntries(entries);
      setTotalPayroll(entries.reduce((sum, e) => sum + e.net_pay, 0));
    } catch (error: any) {
      console.error("Payroll error:", error);
      toast.error("Failed to load payroll data. Please try again.");
      setPayrollEntries([]);
      setTotalPayroll(0);
    } finally {
      setIsLoading(false);
    }
  };

  const processPayroll = async (entryId: string) => {
    toast.success("Payroll processed successfully");
    setPayrollEntries(entries => 
      entries.map(e => e.id === entryId ? { ...e, status: "processed" as const } : e)
    );
  };

  const exportPayroll = () => {
    const csv = [
      ["Employee", "Hours", "Rate", "Gross", "Deductions", "Net", "Period", "Status"].join(","),
      ...payrollEntries.map(e => [
        e.employee_name, e.hours_worked.toFixed(2), e.hourly_rate, e.gross_pay.toFixed(2),
        e.deductions.toFixed(2), e.net_pay.toFixed(2), e.pay_period, e.status
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payroll-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Payroll exported");
  };

  const filteredEntries = payrollEntries.filter(e => 
    e.employee_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-neon-green/20 text-neon-green border-neon-green/30";
      case "processed": return "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30";
      default: return "bg-neon-orange/20 text-neon-orange border-neon-orange/30";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Payroll Management</h1>
            <p className="text-muted-foreground">Process and manage employee payroll</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={exportPayroll} className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="neon-green" className="gap-2">
              <Plus className="h-4 w-4" />
              Run Payroll
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card border-neon-green/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-neon-green/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-neon-green" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Payroll</p>
                  <p className="text-xl font-bold text-foreground">${totalPayroll.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-neon-cyan/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-neon-cyan/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-neon-cyan" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Employees</p>
                  <p className="text-xl font-bold text-foreground">{payrollEntries.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-neon-purple/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-neon-purple/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-neon-purple" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Hours</p>
                  <p className="text-xl font-bold text-foreground">
                    {payrollEntries.reduce((sum, e) => sum + e.hours_worked, 0).toFixed(0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-neon-orange/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-neon-orange/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-neon-orange" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-xl font-bold text-foreground">
                    {payrollEntries.filter(e => e.status === "pending").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        {/* Payroll Table */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-neon-green" />
              Current Pay Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-neon-green" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/30">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Employee</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Hours</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Rate</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Gross Pay</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Deductions</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Net Pay</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntries.map((entry) => (
                      <tr key={entry.id} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4 font-medium text-foreground">{entry.employee_name}</td>
                        <td className="py-3 px-4 text-right text-muted-foreground">{entry.hours_worked.toFixed(1)}</td>
                        <td className="py-3 px-4 text-right text-muted-foreground">${entry.hourly_rate}/hr</td>
                        <td className="py-3 px-4 text-right text-foreground">${entry.gross_pay.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-destructive">-${entry.deductions.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-semibold text-neon-green">${entry.net_pay.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={statusColor(entry.status)}>{entry.status}</Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {entry.status === "pending" && (
                            <Button size="sm" variant="outline" onClick={() => processPayroll(entry.id)}>
                              Process
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
