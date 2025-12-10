import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  MessageSquare, Search, Send, ChevronLeft, Plus, 
  Users, User, Paperclip, MoreVertical
} from "lucide-react";

interface Message {
  id: string;
  sender_name: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface Conversation {
  id: string;
  participant_name: string;
  participant_role: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  avatar?: string;
}

export default function MessagesPage() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Demo conversations
    setConversations([
      {
        id: "1",
        participant_name: "John Smith",
        participant_role: "Client",
        last_message: "Thank you for the update on my case.",
        last_message_time: "10:30 AM",
        unread_count: 2,
      },
      {
        id: "2",
        participant_name: "Sarah Johnson",
        participant_role: "Paralegal",
        last_message: "Documents are ready for review.",
        last_message_time: "Yesterday",
        unread_count: 0,
      },
      {
        id: "3",
        participant_name: "Michael Brown",
        participant_role: "Attorney",
        last_message: "Let's discuss the settlement offer.",
        last_message_time: "Yesterday",
        unread_count: 1,
      },
      {
        id: "4",
        participant_name: "ABC Corporation",
        participant_role: "Corporate Client",
        last_message: "When can we schedule the contract signing?",
        last_message_time: "Dec 8",
        unread_count: 0,
      },
    ]);
  }, []);

  const loadMessages = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    // Demo messages
    setMessages([
      {
        id: "1",
        sender_name: conversation.participant_name,
        sender_id: "other",
        content: "Hello, I wanted to follow up on the status of my case.",
        created_at: new Date(Date.now() - 3600000).toISOString(),
        is_read: true,
      },
      {
        id: "2",
        sender_name: "You",
        sender_id: "me",
        content: "Hi! I've been working on gathering all the necessary documents. We should have everything ready by next week.",
        created_at: new Date(Date.now() - 3500000).toISOString(),
        is_read: true,
      },
      {
        id: "3",
        sender_name: conversation.participant_name,
        sender_id: "other",
        content: "That sounds great. Is there anything you need from me?",
        created_at: new Date(Date.now() - 1800000).toISOString(),
        is_read: true,
      },
      {
        id: "4",
        sender_name: conversation.participant_name,
        sender_id: "other",
        content: "Thank you for the update on my case.",
        created_at: new Date(Date.now() - 900000).toISOString(),
        is_read: false,
      },
    ]);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    const message: Message = {
      id: Date.now().toString(),
      sender_name: "You",
      sender_id: "me",
      content: newMessage,
      created_at: new Date().toISOString(),
      is_read: true,
    };
    
    setMessages([...messages, message]);
    setNewMessage("");
    toast.success("Message sent");
  };

  const filteredConversations = conversations.filter(c =>
    c.participant_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <MessageSquare className="h-6 w-6 text-legal-gold" />
          <h1 className="text-xl font-display font-semibold">Messages</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
          {/* Conversations List */}
          <Card className="lg:col-span-1 flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-3">
                <CardTitle className="text-lg">Conversations</CardTitle>
                <Button size="icon" variant="ghost">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
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
                  {filteredConversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedConversation?.id === conv.id 
                          ? "bg-legal-gold/10 border border-legal-gold/30" 
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => loadMessages(conv)}
                    >
                      <Avatar>
                        <AvatarImage src={conv.avatar} />
                        <AvatarFallback className="bg-legal-navy text-legal-gold">
                          {conv.participant_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate">{conv.participant_name}</span>
                          <span className="text-xs text-muted-foreground">{conv.last_message_time}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground truncate">{conv.last_message}</p>
                          {conv.unread_count > 0 && (
                            <Badge className="bg-legal-gold text-legal-navy text-xs h-5 min-w-[20px]">
                              {conv.unread_count}
                            </Badge>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs mt-1">{conv.participant_role}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Messages Area */}
          <Card className="lg:col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Conversation Header */}
                <CardHeader className="border-b border-border pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-legal-navy text-legal-gold">
                          {selectedConversation.participant_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{selectedConversation.participant_name}</h3>
                        <p className="text-sm text-muted-foreground">{selectedConversation.participant_role}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-hidden p-0">
                  <ScrollArea className="h-full p-4">
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender_id === "me" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              msg.sender_id === "me"
                                ? "bg-legal-gold text-legal-navy"
                                : "bg-muted"
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <span className={`text-xs mt-1 block ${
                              msg.sender_id === "me" ? "text-legal-navy/70" : "text-muted-foreground"
                            }`}>
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>

                {/* Message Input */}
                <div className="border-t border-border p-4">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon">
                      <Paperclip className="h-4 w-4" />
                    </Button>
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
                    <Button variant="gold" size="icon" onClick={sendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
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
  );
}
