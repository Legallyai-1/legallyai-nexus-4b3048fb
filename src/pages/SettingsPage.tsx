import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Settings, User, Bell, Shield, Palette, ArrowLeft, Save, Moon, Sun, Loader2, Phone, MapPin, Clock, DollarSign } from "lucide-react";
import { FuturisticBackground } from "@/components/ui/FuturisticBackground";
import { Layout } from "@/components/layout/Layout";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  location: string | null;
  timezone: string | null;
}

const timezones = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "America/Anchorage",
  "Pacific/Honolulu",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [timezone, setTimezone] = useState("");
  const [email, setEmail] = useState("");
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    marketing: false,
  });
  const [darkMode, setDarkMode] = useState(true);
  
  // Earnings state
  const [earnings, setEarnings] = useState({ balance: 0, lifetime: 0 });
  const [payoutRequests, setPayoutRequests] = useState<any[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      setEmail(session.user.email || "");
      await fetchProfile(session.user.id);
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile(data);
        setDisplayName(data.full_name || "");
        setPhone(data.phone || "");
        setLocation(data.location || "");
        setTimezone(data.timezone || "America/New_York");
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: displayName }
      });
      if (authError) throw authError;

      // Update or insert profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email || '',
          full_name: displayName,
          phone: phone || null,
          location: location || null,
          timezone: timezone || null,
        });

      if (profileError) throw profileError;

      toast.success("Settings saved successfully");
    } catch (error) {
      console.error('Save error:', error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!email) return;
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      toast.success("Password reset email sent!");
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error("Failed to send password reset email");
    }
  };

  // Fetch earnings data
  useEffect(() => {
    const fetchEarnings = async () => {
      if (!user) return;
      
      // Fetch credits/earnings (this table may not exist, so we'll handle gracefully)
      const { data: credits } = await supabase
        .from('user_credits')
        .select('balance, lifetime_earned')
        .eq('user_id', user.id)
        .single();
      
      if (credits) {
        setEarnings({
          balance: credits.balance / 100,
          lifetime: credits.lifetime_earned / 100
        });
      }

      // Fetch payout requests
      const { data: payouts } = await supabase
        .from('payout_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (payouts) setPayoutRequests(payouts);
    };

    fetchEarnings();
  }, [user]);

  const requestPayout = async () => {
    if (earnings.balance < 100) {
      toast.error('Minimum payout is $100');
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('request-payout', {
        body: {
          amount: earnings.balance,
          bank_account_info: { last4: '1234' } // Get from user input in production
        }
      });

      if (!error) {
        toast.success('Payout requested! Processing within 3-5 business days.');
        // Refresh earnings
        if (user) {
          const { data: credits } = await supabase
            .from('user_credits')
            .select('balance, lifetime_earned')
            .eq('user_id', user.id)
            .single();
          
          if (credits) {
            setEarnings({
              balance: credits.balance / 100,
              lifetime: credits.lifetime_earned / 100
            });
          }
        }
      } else {
        toast.error('Failed to request payout');
      }
    } catch (error) {
      console.error('Payout error:', error);
      toast.error('Failed to request payout');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-neon-cyan" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <FuturisticBackground>
        <div className="min-h-screen py-8 px-4">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-display font-bold flex items-center gap-3">
                <Settings className="h-8 w-8 text-neon-cyan" />
                <span>Settings</span>
              </h1>
              <p className="text-muted-foreground mt-1">Manage your account preferences</p>
            </div>

            <div className="space-y-6">
              {/* Profile Settings */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-neon-cyan" />
                    Profile Settings
                  </CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Full Name</Label>
                      <Input
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="bg-background/50 border-neon-cyan/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={email}
                        disabled
                        className="bg-background/30 border-border/50"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" /> Phone
                      </Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(555) 123-4567"
                        className="bg-background/50 border-neon-cyan/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> Location
                      </Label>
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="City, State"
                        className="bg-background/50 border-neon-cyan/30"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" /> Timezone
                    </Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger className="bg-background/50 border-neon-cyan/30">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map((tz) => (
                          <SelectItem key={tz} value={tz}>{tz.replace('_', ' ')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-neon-purple" />
                    Notifications
                  </CardTitle>
                  <CardDescription>Configure how you receive updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive updates via email</p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive in-app notifications</p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, push: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Marketing Emails</p>
                      <p className="text-sm text-muted-foreground">Receive product updates and offers</p>
                    </div>
                    <Switch
                      checked={notifications.marketing}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, marketing: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Appearance */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-neon-green" />
                    Appearance
                  </CardTitle>
                  <CardDescription>Customize your viewing experience</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                      <div>
                        <p className="font-medium">Dark Mode</p>
                        <p className="text-sm text-muted-foreground">Use dark theme throughout the app</p>
                      </div>
                    </div>
                    <Switch
                      checked={darkMode}
                      onCheckedChange={(checked) => {
                        setDarkMode(checked);
                        if (checked) {
                          document.documentElement.classList.add('dark');
                        } else {
                          document.documentElement.classList.remove('dark');
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Security */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-neon-pink" />
                    Security
                  </CardTitle>
                  <CardDescription>Manage your account security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start" onClick={handleChangePassword}>
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => toast.info("Two-factor authentication coming soon")}>
                    Two-Factor Authentication
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-destructive" onClick={() => toast.error("Please contact support to delete your account")}>
                    Delete Account
                  </Button>
                </CardContent>
              </Card>

              {/* Earnings & Payouts */}
              <Card className="glass-card border-border/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-neon-green" />
                    Earnings & Payouts
                  </CardTitle>
                  <CardDescription>View your earnings and request payouts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-background/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">Available Balance</p>
                      <p className="text-2xl font-bold text-neon-green">${earnings.balance.toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-background/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">Lifetime Earnings</p>
                      <p className="text-2xl font-bold text-neon-cyan">${earnings.lifetime.toFixed(2)}</p>
                    </div>
                  </div>

                  <Button 
                    onClick={requestPayout} 
                    disabled={earnings.balance < 100}
                    className="w-full"
                    variant="outline"
                  >
                    Request Payout (Min $100)
                  </Button>

                  <div className="space-y-2">
                    <h4 className="font-medium">Recent Payouts</h4>
                    {payoutRequests.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No payout requests yet</p>
                    ) : (
                      payoutRequests.slice(0, 5).map((payout: any) => (
                        <div key={payout.id} className="flex justify-between p-2 bg-background/30 rounded">
                          <span className="text-sm">${(payout.amount / 100).toFixed(2)}</span>
                          <Badge variant={payout.status === 'completed' ? 'default' : 'outline'}>
                            {payout.status}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <Button 
                variant="neon" 
                className="w-full" 
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </FuturisticBackground>
    </Layout>
  );
}
