import { useState, useEffect } from "react";
import { Bell, X, Check, Calendar, FileText, MessageSquare, DollarSign, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: "message" | "appointment" | "case" | "invoice" | "system";
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

const notificationIcons = {
  message: MessageSquare,
  appointment: Calendar,
  case: FileText,
  invoice: DollarSign,
  system: AlertCircle,
};

const notificationColors = {
  message: "text-blue-400",
  appointment: "text-green-400",
  case: "text-legal-gold",
  invoice: "text-emerald-400",
  system: "text-orange-400",
};

interface NotificationRow {
  id: string;
  title: string;
  message: string | null;
  type: string | null;
  is_read: boolean | null;
  created_at: string;
}

const KNOWN_TYPES = new Set<Notification["type"]>(["message", "appointment", "case", "invoice", "system"]);

function toNotification(row: NotificationRow): Notification {
  const type = (row.type ?? "system") as Notification["type"];
  return {
    id: row.id,
    type: KNOWN_TYPES.has(type) ? type : "system",
    title: row.title,
    description: row.message ?? "",
    timestamp: new Date(row.created_at),
    read: row.is_read === true,
  };
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId || cancelled) return;

      // RLS limits notifications to the signed-in user's own rows.
      const { data, error } = await supabase
        .from("notifications")
        .select("id, title, message, type, is_read, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (cancelled) return;
      if (error) {
        console.error("Notifications load error:", error);
      } else {
        setNotifications((data ?? []).map(toNotification));
      }

      channel = supabase
        .channel(`notifications-${userId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
          (payload) => setNotifications((prev) => [toNotification(payload.new as NotificationRow), ...prev]),
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const persistRead = async (ids: string[]) => {
    if (!ids.length) return;
    const { error } = await supabase.from("notifications").update({ is_read: true }).in("id", ids);
    if (error) console.error("Could not mark notifications read:", error);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    void persistRead([id]);
  };

  const markAllAsRead = () => {
    const unread = notifications.filter(n => !n.read).map(n => n.id);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    void persistRead(unread);
  };

  // Dismissing hides the item here and marks it read; notifications aren't deleted.
  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    void persistRead([id]);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-legal-gold text-legal-navy text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-96">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-legal-gold" />
              Notifications
            </SheetTitle>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                <Check className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-120px)]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => {
                const Icon = notificationIcons[notification.type];
                const iconColor = notificationColors[notification.type];
                
                return (
                  <div
                    key={notification.id}
                    className={`
                      relative p-4 rounded-lg border transition-all cursor-pointer
                      ${notification.read 
                        ? "bg-card border-border" 
                        : "bg-legal-gold/5 border-legal-gold/20"
                      }
                      hover:bg-muted/50
                    `}
                    onClick={() => {
                      markAsRead(notification.id);
                      if (notification.actionUrl) {
                        window.location.href = notification.actionUrl;
                        setOpen(false);
                      }
                    }}
                  >
                    <div className="flex gap-3">
                      <div className={`p-2 rounded-lg bg-background ${iconColor}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium ${!notification.read && "text-foreground"}`}>
                            {notification.title}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearNotification(notification.id);
                            }}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.description}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-2">
                          {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="absolute top-4 right-12 w-2 h-2 rounded-full bg-legal-gold" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
