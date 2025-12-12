import { useState, useEffect } from "react";
import { Bell, CheckCircle2, AlertCircle, Info, DollarSign, 
         Scale, Shield, Briefcase, Heart, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  hub: string | null;
  reference_id: string | null;
  reference_type: string | null;
  is_read: boolean;
  created_at: string;
}

interface HubNotificationsProps {
  hubFilter?: string;
  colorVariant?: 'cyan' | 'purple' | 'pink' | 'green' | 'orange' | 'blue';
}

const hubIcons: Record<string, typeof Bell> = {
  custody: Scale,
  defense: Shield,
  workplace: Briefcase,
  probono: Heart,
  probation: Clock,
};

const hubColors: Record<string, string> = {
  custody: 'text-neon-purple',
  defense: 'text-neon-pink',
  workplace: 'text-neon-orange',
  probono: 'text-neon-cyan',
  probation: 'text-neon-blue',
};

export function HubNotifications({ hubFilter, colorVariant = 'cyan' }: HubNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
    
    // Subscribe to realtime notifications
    const channel = supabase
      .channel('hub-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          if (!hubFilter || newNotif.hub === hubFilter) {
            setNotifications(prev => [newNotif, ...prev]);
            setUnreadCount(prev => prev + 1);
            toast({
              title: newNotif.title,
              description: newNotif.message,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [hubFilter]);

  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (hubFilter) {
      query = query.eq('hub', hubFilter);
    }

    const { data, error } = await query;

    if (!error && data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
  };

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (!error) {
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let query = supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (hubFilter) {
      query = query.eq('hub', hubFilter);
    }

    const { error } = await query;

    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  };

  const getIcon = (type: string) => {
    const IconComponent = hubIcons[type] || Bell;
    const colorClass = hubColors[type] || `text-neon-${colorVariant}`;
    return <IconComponent className={`w-4 h-4 ${colorClass}`} />;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-neon-green" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-neon-orange" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-destructive" />;
      default: return <Info className="w-4 h-4 text-neon-cyan" />;
    }
  };

  const colorClasses: Record<string, string> = {
    cyan: 'text-neon-cyan border-neon-cyan/30 bg-neon-cyan/10',
    purple: 'text-neon-purple border-neon-purple/30 bg-neon-purple/10',
    pink: 'text-neon-pink border-neon-pink/30 bg-neon-pink/10',
    green: 'text-neon-green border-neon-green/30 bg-neon-green/10',
    orange: 'text-neon-orange border-neon-orange/30 bg-neon-orange/10',
    blue: 'text-neon-blue border-neon-blue/30 bg-neon-blue/10',
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className={`w-5 h-5 text-neon-${colorVariant}`} />
          {unreadCount > 0 && (
            <Badge 
              className={`absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs ${colorClasses[colorVariant]}`}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 glass-card border-border/50" align="end">
        <div className="flex items-center justify-between p-3 border-b border-border/50">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <Bell className={`w-4 h-4 text-neon-${colorVariant}`} />
            {hubFilter ? `${hubFilter.charAt(0).toUpperCase() + hubFilter.slice(1)} Notifications` : 'Notifications'}
          </h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
              Mark all read
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {notifications.map((notif) => (
                <div 
                  key={notif.id}
                  className={`p-3 hover:bg-background/50 transition-colors cursor-pointer ${
                    !notif.is_read ? 'bg-background/30' : ''
                  }`}
                  onClick={() => markAsRead(notif.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {notif.hub ? getIcon(notif.hub) : getTypeIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">
                          {notif.title}
                        </p>
                        {!notif.is_read && (
                          <span className={`w-2 h-2 rounded-full bg-neon-${colorVariant}`} />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {notif.message}
                      </p>
                      <p className="text-xs text-muted-foreground/50 mt-1">
                        {new Date(notif.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
