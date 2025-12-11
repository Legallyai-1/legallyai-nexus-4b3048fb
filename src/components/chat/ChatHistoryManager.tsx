import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, Download, Trash2, Archive, Clock, 
  MessageSquare, Filter, Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ChatSession {
  id: string;
  hub_type: string;
  session_id: string;
  messages: any[];
  metadata: any;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

interface ChatHistoryManagerProps {
  userId?: string;
  hubFilter?: string;
}

export const ChatHistoryManager = ({ userId, hubFilter }: ChatHistoryManagerProps) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHub, setSelectedHub] = useState(hubFilter || "all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchChatHistory();
  }, [userId, selectedHub]);

  const fetchChatHistory = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('ai_chat_history')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (selectedHub !== "all") {
        query = query.eq('hub_type', selectedHub);
      }

      const { data, error } = await query;
      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  const archiveSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('ai_chat_history')
        .update({ is_archived: true })
        .eq('id', sessionId);

      if (error) throw error;
      toast({ title: "Session archived" });
      fetchChatHistory();
    } catch (error) {
      toast({ title: "Error archiving session", variant: "destructive" });
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('ai_chat_history')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
      toast({ title: "Session deleted" });
      fetchChatHistory();
    } catch (error) {
      toast({ title: "Error deleting session", variant: "destructive" });
    }
  };

  const exportSession = (session: ChatSession) => {
    const exportData = {
      hub: session.hub_type,
      created: session.created_at,
      messages: session.messages,
      metadata: session.metadata
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${session.hub_type}-${format(new Date(session.created_at), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Chat exported" });
  };

  const filteredSessions = sessions.filter(session => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    const messagesText = JSON.stringify(session.messages).toLowerCase();
    return messagesText.includes(searchLower) || session.hub_type.toLowerCase().includes(searchLower);
  });

  const hubTypes = ["all", "general", "custody", "dui", "will", "parole", "defense", "workplace"];

  const getHubColor = (hub: string) => {
    const colors: Record<string, string> = {
      general: "cyan",
      custody: "purple",
      dui: "red",
      will: "blue",
      parole: "green",
      defense: "orange",
      workplace: "yellow"
    };
    return colors[hub] || "gray";
  };

  return (
    <Card className="bg-card/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chat History Archive
          </span>
          <Badge variant="outline">{sessions.length} sessions</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-1">
            {hubTypes.map(hub => (
              <Button
                key={hub}
                variant={selectedHub === hub ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedHub(hub)}
                className="capitalize"
              >
                {hub === "all" ? "All" : hub}
              </Button>
            ))}
          </div>
        </div>

        {/* Sessions List */}
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredSessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No chat sessions found
              </div>
            ) : (
              filteredSessions.map((session) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border ${
                    session.is_archived ? "bg-muted/20 opacity-60" : "bg-muted/30"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          variant="outline" 
                          className={`text-${getHubColor(session.hub_type)}-400 border-${getHubColor(session.hub_type)}-400`}
                        >
                          {session.hub_type}
                        </Badge>
                        {session.is_archived && (
                          <Badge variant="secondary">Archived</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(session.created_at), 'MMM d, yyyy h:mm a')}
                        <span>•</span>
                        <MessageSquare className="h-3 w-3" />
                        {Array.isArray(session.messages) ? session.messages.length : 0} messages
                      </div>
                      {Array.isArray(session.messages) && session.messages.length > 0 && (
                        <p className="text-sm mt-2 line-clamp-2 text-muted-foreground">
                          {session.messages[0]?.content?.substring(0, 100)}...
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => exportSession(session)}
                        title="Export"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {!session.is_archived && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => archiveSession(session.id)}
                          title="Archive"
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteSession(session.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* GDPR Compliance Notice */}
        <div className="p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground">
          <p>
            <strong>Privacy Notice:</strong> All chat data is stored securely and encrypted. 
            You can export or delete your data at any time in compliance with GDPR regulations.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatHistoryManager;
