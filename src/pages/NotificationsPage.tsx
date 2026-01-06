import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Bell, Check, Trash2, Send, Loader2, 
  MessageSquare, Calendar, FileText, DollarSign, AlertCircle 
} from "lucide-react";
import { FuturisticBackground } from "@/components/ui/FuturisticBackground";
import { formatDistanceToNow } from "date-fns";
import type { User } from "@supabase/supabase-js";

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  hub?: string;
  reference_id?: string;
  reference_type?: string;
}

const notificationIcons: Record<string, any> = {
  message: MessageSquare,
  appointment: Calendar,
  case: FileText,
  invoice: DollarSign,
  system: AlertCircle,
};

const notificationColors: Record<string, string> = {
  message: "text-blue-400 bg-blue-400/20",
  appointment: "text-green-400 bg-green-400/20",
  case: "text-neon-gold bg-neon-gold/20",
  invoice: "text-emerald-400 bg-emerald-400/20",
  system: "text-orange-400 bg-orange-400/20",
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      fetchNotifications(session.user.id);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session?.user) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchNotifications(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Set up realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          toast.success(newNotification.title);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchNotifications = async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success("Notification deleted");
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const sendTestNotification = async () => {
    if (!user) return;
    
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-notification', {
        body: {
          userId: user.id,
          type: 'system',
          title: 'Test Notification',
          message: 'This is a test notification sent via the edge function.',
          sendEmail: false
        }
      });

      if (error) throw error;
      toast.success("Test notification sent!");
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error("Failed to send test notification");
    } finally {
      setSending(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-neon-cyan" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <FuturisticBackground>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold flex items-center gap-3">
                <Bell className="h-8 w-8 text-neon-cyan" />
                Notifications
              </h1>
              <p className="text-muted-foreground mt-1">
                {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={sendTestNotification}
                disabled={sending}
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                Send Test
              </Button>
              {unreadCount > 0 && (
                <Button variant="neon" onClick={markAllAsRead}>
                  <Check className="h-4 w-4 mr-2" />
                  Mark All Read
                </Button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-16 text-center">
                <Bell className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No notifications yet</h3>
                <p className="text-muted-foreground mb-4">
                  You'll receive notifications here when there's activity on your account.
                </p>
                <Button variant="outline" onClick={sendTestNotification} disabled={sending}>
                  {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                  Send Test Notification
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => {
                const Icon = notificationIcons[notification.type] || AlertCircle;
                const colorClass = notificationColors[notification.type] || notificationColors.system;
                
                return (
                  <Card 
                    key={notification.id} 
                    className={`glass-card transition-all ${!notification.is_read ? 'border-neon-cyan/50 bg-neon-cyan/5' : ''}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${colorClass}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-semibold text-foreground flex items-center gap-2">
                                {notification.title}
                                {!notification.is_read && (
                                  <Badge className="bg-neon-cyan text-background text-xs">New</Badge>
                                )}
                              </h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground/70 mt-2">
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              {!notification.is_read && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => markAsRead(notification.id)}
                                  title="Mark as read"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteNotification(notification.id)}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </FuturisticBackground>
    </Layout>
  );
}