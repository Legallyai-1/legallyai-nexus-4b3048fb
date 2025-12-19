import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  MessageSquare, Search, Send, ChevronLeft, Loader2, Paperclip
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface Conversation {
  id: string;
  other_user_id: string;
  other_user_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export default function MessagesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUserId(session.user.id);
      await fetchConversations(session.user.id);
    };
    init();
  }, [navigate]);

  const fetchConversations = async (uid: string) => {
    setLoading(true);
    try {
      // Get unique conversations from messages table
      const { data: sentMessages } = await supabase
        .from('messages')
        .select('recipient_id, content, created_at, is_read')
        .eq('sender_id', uid)
        .order('created_at', { ascending: false });

      const { data: receivedMessages } = await supabase
        .from('messages')
        .select('sender_id, content, created_at, is_read')
        .eq('recipient_id', uid)
        .order('created_at', { ascending: false });

      // Build conversation list from message partners
      const partnersMap = new Map<string, Conversation>();

      sentMessages?.forEach(msg => {
        if (!partnersMap.has(msg.recipient_id)) {
          partnersMap.set(msg.recipient_id, {
            id: msg.recipient_id,
            other_user_id: msg.recipient_id,
            other_user_name: 'Loading...',
            last_message: msg.content,
            last_message_time: new Date(msg.created_at).toLocaleString(),
            unread_count: 0
          });
        }
      });

      receivedMessages?.forEach(msg => {
        const existing = partnersMap.get(msg.sender_id);
        if (!existing) {
          partnersMap.set(msg.sender_id, {
            id: msg.sender_id,
            other_user_id: msg.sender_id,
            other_user_name: 'Loading...',
            last_message: msg.content,
            last_message_time: new Date(msg.created_at).toLocaleString(),
            unread_count: msg.is_read ? 0 : 1
          });
        } else if (!msg.is_read) {
          existing.unread_count++;
        }
      });

      // Get profile names for all partners
      const partnerIds = Array.from(partnersMap.keys());
      if (partnerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', partnerIds);

        profiles?.forEach(profile => {
          const conv = partnersMap.get(profile.id);
          if (conv) {
            conv.other_user_name = profile.full_name || 'Unknown User';
          }
        });
      }

      setConversations(Array.from(partnersMap.values()));
    } catch (error: any) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId},recipient_id.eq.${conversation.other_user_id}),and(sender_id.eq.${conversation.other_user_id},recipient_id.eq.${userId})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', conversation.other_user_id)
        .eq('recipient_id', userId);

    } catch (error: any) {
      console.error("Error loading messages:", error);
      toast.error("Failed to load conversation");
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !userId) return;
    
    setIsSending(true);
    try {
      // Get user's organization first
      const { data: orgMember } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', userId)
        .single();

      if (!orgMember) throw new Error("No organization found");

      const { data, error } = await supabase
        .from('messages')
        .insert([{
          sender_id: userId,
          recipient_id: selectedConversation.other_user_id,
          content: newMessage.trim(),
          is_read: false,
          organization_id: orgMember.organization_id,
          subject: 'Message'
        }])
        .select()
        .single();

      if (error) throw error;

      setMessages([...messages, data]);
      setNewMessage("");
      toast.success("Message sent");
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const filteredConversations = conversations.filter(c =>
    c.other_user_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <MessageSquare className="h-6 w-6 text-neon-gold" />
            <h1 className="text-xl font-display font-semibold">Messages</h1>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
            <Card className="lg:col-span-1 flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Conversations</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search conversations..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full">
                  <div className="space-y-1 px-4 pb-4">
                    {filteredConversations.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No conversations yet</p>
                      </div>
                    ) : (
                      filteredConversations.map((conv) => (
                        <div
                          key={conv.id}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedConversation?.id === conv.id 
                              ? "bg-neon-gold/10 border border-neon-gold/30" 
                              : "hover:bg-muted/50"
                          }`}
                          onClick={() => loadMessages(conv)}
                        >
                          <Avatar>
                            <AvatarFallback className="bg-card text-neon-gold">
                              {conv.other_user_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-medium truncate">{conv.other_user_name}</span>
                              <span className="text-xs text-muted-foreground">{conv.last_message_time}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-muted-foreground truncate">{conv.last_message}</p>
                              {conv.unread_count > 0 && (
                                <Badge className="bg-neon-gold text-background text-xs h-5 min-w-[20px]">
                                  {conv.unread_count}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 flex flex-col">
              {selectedConversation ? (
                <>
                  <CardHeader className="border-b border-border pb-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-card text-neon-gold">
                          {selectedConversation.other_user_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{selectedConversation.other_user_name}</h3>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 overflow-hidden p-0">
                    <ScrollArea className="h-full p-4">
                      <div className="space-y-4">
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.sender_id === userId ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                msg.sender_id === userId
                                  ? "bg-neon-gold text-background"
                                  : "bg-muted"
                              }`}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <span className={`text-xs mt-1 block ${
                                msg.sender_id === userId ? "text-background/70" : "text-muted-foreground"
                              }`}>
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>

                  <div className="border-t border-border p-4">
                    <div className="flex items-center gap-3">
                      <Textarea
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="min-h-[40px] max-h-[120px] resize-none"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                      />
                      <Button 
                        variant="gold" 
                        size="icon" 
                        onClick={sendMessage} 
                        disabled={!newMessage.trim() || isSending}
                      >
                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                    <p>Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </main>
      </div>
    </Layout>
  );
}
