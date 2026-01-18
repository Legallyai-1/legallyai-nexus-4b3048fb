import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FuturisticBackground } from "@/components/ui/FuturisticBackground";
import { AnimatedAIHead } from "@/components/ui/AnimatedAIHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DollarSign, TrendingUp, Users, FileText, CreditCard, 
  BarChart3, PieChart, ArrowUpRight, ArrowDownRight,
  Zap, Gift, Target, Sparkles
} from "lucide-react";

export default function MonetizationPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<"day" | "week" | "month">("week");
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<{
    totalRevenue: number;
    subscriptions: number;
    documentsThisMonth: number;
    revenueStreams: { name: string; amount: number; percentage: number }[];
    recentTransactions: { id: string; type: string; user: string; amount: number; time: string; status: string }[];
  } | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-stripe-analytics');
      if (error) throw error;
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Could not load analytics. Using demo data.');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { 
      label: "Total Revenue", 
      value: "$12,450", 
      change: "+23.5%", 
      trend: "up",
      icon: DollarSign,
      color: "neon-green"
    },
    { 
      label: "Subscriptions", 
      value: "156", 
      change: "+12", 
      trend: "up",
      icon: Users,
      color: "neon-cyan"
    },
    { 
      label: "Documents Sold", 
      value: "892", 
      change: "+45", 
      trend: "up",
      icon: FileText,
      color: "neon-purple"
    },
    { 
      label: "Ad Revenue", 
      value: "$1,230", 
      change: "-5.2%", 
      trend: "down",
      icon: BarChart3,
      color: "neon-orange"
    },
  ];

  const revenueStreams = [
    { name: "Lawyer Pro Subscriptions", amount: "$9,900", percentage: 79.5, color: "bg-neon-cyan" },
    { name: "Document Purchases", amount: "$4,460", percentage: 35.8, color: "bg-neon-purple" },
    { name: "AdSense Revenue", amount: "$1,230", percentage: 9.9, color: "bg-neon-orange" },
    { name: "Enterprise Plans", amount: "$2,500", percentage: 20.1, color: "bg-neon-green" },
  ];

  const recentTransactions = [
    { type: "subscription", user: "Smith & Associates", amount: "$99", time: "2 hours ago" },
    { type: "document", user: "John Davis", amount: "$5", time: "4 hours ago" },
    { type: "subscription", user: "Legal Eagles LLC", amount: "$99", time: "Yesterday" },
    { type: "document", user: "Sarah Williams", amount: "$5", time: "Yesterday" },
    { type: "enterprise", user: "BigLaw Corp", amount: "$499", time: "2 days ago" },
  ];

  const optimizationTips = [
    { 
      title: "Upsell Opportunity",
      description: "45 free users hit document limit. Target with Pro upgrade.",
      action: "Send Campaign",
      icon: Target
    },
    { 
      title: "Loyalty Credits",
      description: "Reward top 10 subscribers with bonus features.",
      action: "Configure",
      icon: Gift
    },
    { 
      title: "Ad Optimization",
      description: "Adjust placement for 15% higher engagement.",
      action: "Optimize",
      icon: Zap
    },
  ];

  return (
    <FuturisticBackground variant="default">
      <div className="relative z-10 min-h-screen px-4 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-neon-green/20 blur-xl rounded-full" />
            <AnimatedAIHead variant="green" size="lg" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold">
              <span className="text-neon-green">PayAI</span> Dashboard
            </h1>
            <p className="text-muted-foreground">Monetization & Revenue Analytics</p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 mb-6">
          {(["day", "week", "month"] as const).map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "neon-green" : "ghost"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className="capitalize"
            >
              This {period}
            </Button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="glass-card border-border/30 hover:border-neon-cyan/30 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg bg-${stat.color}/10`}>
                      <stat.icon className={`w-5 h-5 text-${stat.color}`} />
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${
                      stat.trend === "up" ? "text-neon-green" : "text-red-400"
                    }`}>
                      {stat.trend === "up" ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      {stat.change}
                    </div>
                  </div>
                  <p className="text-2xl font-bold mb-1">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Streams */}
          <Card className="glass-card border-border/30 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-neon-cyan" />
                Revenue Streams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueStreams.map((stream, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{stream.name}</span>
                      <span className="font-medium">{stream.amount}</span>
                    </div>
                    <div className="h-2 bg-background/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stream.percentage}%` }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        className={`h-full ${stream.color} rounded-full`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="glass-card border-border/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-neon-purple" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions.map((tx, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-background/30">
                    <div>
                      <p className="text-sm font-medium">{tx.user}</p>
                      <p className="text-xs text-muted-foreground capitalize">{tx.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-neon-green">{tx.amount}</p>
                      <p className="text-xs text-muted-foreground">{tx.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Optimization Tips */}
        <Card className="glass-card border-border/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-neon-orange" />
              PayAI Optimization Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {optimizationTips.map((tip, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 rounded-xl bg-background/30 border border-border/30 hover:border-neon-orange/30 transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <tip.icon className="w-5 h-5 text-neon-orange" />
                    <h4 className="font-medium">{tip.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{tip.description}</p>
                  <Button variant="neon-outline" size="sm" className="w-full">
                    {tip.action}
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment System Status */}
        <div className="mt-8 glass-card rounded-xl p-6 border border-neon-green/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-neon-green/10 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-neon-green" />
              </div>
              <div>
                <h3 className="font-semibold">Payment System Active</h3>
                <p className="text-sm text-muted-foreground">Database-Powered • Processing payments</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              <span className="text-sm text-neon-green">Live</span>
            </div>
          </div>
        </div>
      </div>
    </FuturisticBackground>
  );
}
