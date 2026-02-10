import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  User, FileText, Calendar, MessageSquare, Bell, 
  Clock, CheckCircle, AlertTriangle, Upload, Download,
  Video, Phone, Star
} from "lucide-react";
import { toast } from "sonner";

interface CaseUpdate {
  id: string;
  date: string;
  title: string;
  description: string;
  type: "milestone" | "document" | "hearing" | "message";
}

interface Document {
  id: string;
  name: string;
  type: string;
  date: string;
  status: "pending" | "signed" | "review";
}

export function ClientPortal() {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data
  const caseUpdates: CaseUpdate[] = [
    {
      id: "1",
      date: "Dec 11, 2025",
      title: "Discovery Documents Received",
      description: "Prosecution has submitted discovery materials. Attorney reviewing.",
      type: "document"
    },
    {
      id: "2",
      date: "Dec 10, 2025",
      title: "Pre-Trial Hearing Scheduled",
      description: "Hearing set for January 15, 2026 at 9:00 AM",
      type: "hearing"
    },
    {
      id: "3",
      date: "Dec 8, 2025",
      title: "Case Filed",
      description: "Your case has been officially filed. Case number assigned.",
      type: "milestone"
    }
  ];

  const documents: Document[] = [
    {
      id: "1",
      name: "Retainer Agreement",
      type: "PDF",
      date: "Dec 8, 2025",
      status: "signed"
    },
    {
      id: "2",
      name: "Discovery Packet",
      type: "PDF",
      date: "Dec 11, 2025",
      status: "review"
    },
    {
      id: "3",
      name: "Character Reference Form",
      type: "DOCX",
      date: "Dec 9, 2025",
      status: "pending"
    }
  ];

  const upcomingEvents = [
    {
      date: "Jan 15, 2026",
      time: "9:00 AM",
      title: "Pre-Trial Hearing",
      location: "County Courthouse, Room 203"
    },
    {
      date: "Jan 10, 2026",
      time: "2:00 PM",
      title: "Attorney Consultation",
      location: "Video Call"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "signed": return "bg-neon-green/20 text-neon-green border-neon-green/30";
      case "pending": return "bg-neon-orange/20 text-neon-orange border-neon-orange/30";
      default: return "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "document": return <FileText className="w-4 h-4" />;
      case "hearing": return <Calendar className="w-4 h-4" />;
      case "message": return <MessageSquare className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card border-neon-purple/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-neon-purple/20 flex items-center justify-center">
                <User className="w-6 h-6 text-neon-purple" />
              </div>
              <div>
                <CardTitle className="text-foreground">Client Portal</CardTitle>
                <p className="text-sm text-muted-foreground">Case #2025-CR-12345</p>
              </div>
            </div>
            <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
              <Star className="w-3 h-3 mr-1" /> Secure Portal
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-lg bg-background/30">
              <p className="text-2xl font-bold text-neon-cyan">45%</p>
              <p className="text-xs text-muted-foreground">Case Progress</p>
            </div>
            <div className="p-3 rounded-lg bg-background/30">
              <p className="text-2xl font-bold text-neon-green">3</p>
              <p className="text-xs text-muted-foreground">Documents</p>
            </div>
            <div className="p-3 rounded-lg bg-background/30">
              <p className="text-2xl font-bold text-neon-orange">2</p>
              <p className="text-xs text-muted-foreground">Upcoming Events</p>
            </div>
            <div className="p-3 rounded-lg bg-background/30">
              <p className="text-2xl font-bold text-neon-pink">1</p>
              <p className="text-xs text-muted-foreground">Action Needed</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Case Progress</span>
              <span className="text-sm font-medium text-foreground">45%</span>
            </div>
            <Progress value={45} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 glass-card p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-neon-purple/20 gap-2">
            <Bell className="w-4 h-4" /> Updates
          </TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-neon-cyan/20 gap-2">
            <FileText className="w-4 h-4" /> Documents
          </TabsTrigger>
          <TabsTrigger value="calendar" className="data-[state=active]:bg-neon-green/20 gap-2">
            <Calendar className="w-4 h-4" /> Calendar
          </TabsTrigger>
          <TabsTrigger value="messages" className="data-[state=active]:bg-neon-pink/20 gap-2">
            <MessageSquare className="w-4 h-4" /> Messages
          </TabsTrigger>
          <TabsTrigger value="billing" className="data-[state=active]:bg-neon-orange/20 gap-2">
            <Clock className="w-4 h-4" /> Billing
          </TabsTrigger>
        </TabsList>

        {/* Updates Tab */}
        <TabsContent value="overview">
          <Card className="glass-card p-6">
            <h3 className="font-display text-xl font-semibold text-foreground mb-4">
              Case Timeline
            </h3>
            <div className="space-y-4">
              {caseUpdates.map((update, idx) => (
                <div key={update.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      idx === 0 ? "bg-neon-purple/20 text-neon-purple" : "bg-muted text-muted-foreground"
                    }`}>
                      {getTypeIcon(update.type)}
                    </div>
                    {idx < caseUpdates.length - 1 && (
                      <div className="w-0.5 h-full bg-border my-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-xs text-muted-foreground mb-1">{update.date}</p>
                    <h4 className="font-medium text-foreground">{update.title}</h4>
                    <p className="text-sm text-muted-foreground">{update.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-semibold text-foreground">
                Case Documents
              </h3>
              <Button variant="outline" size="sm" className="gap-2">
                <Upload className="w-4 h-4" /> Upload
              </Button>
            </div>
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-background/30 border border-border/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-neon-cyan/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-neon-cyan" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.type} • {doc.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(doc.status)}>{doc.status}</Badge>
                    <Button variant="ghost" size="icon">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar">
          <Card className="glass-card p-6">
            <h3 className="font-display text-xl font-semibold text-foreground mb-4">
              Upcoming Events
            </h3>
            <div className="space-y-4">
              {upcomingEvents.map((event, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-background/30 border border-neon-green/20">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-neon-green" />
                        <span className="text-sm font-medium text-foreground">{event.date}</span>
                        <span className="text-sm text-muted-foreground">at {event.time}</span>
                      </div>
                      <h4 className="font-semibold text-foreground">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">{event.location}</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      {event.location.includes("Video") ? (
                        <><Video className="w-4 h-4" /> Join</>
                      ) : (
                        <><Clock className="w-4 h-4" /> Remind</>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages">
          <Card className="glass-card p-6">
            <h3 className="font-display text-xl font-semibold text-foreground mb-4">
              Secure Messaging
            </h3>
            <div className="space-y-4 mb-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-neon-purple/20 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-neon-purple" />
                </div>
                <div className="p-3 rounded-lg bg-neon-purple/10 max-w-[80%]">
                  <p className="text-sm text-foreground">I've received the discovery documents. Let's schedule a call to discuss strategy.</p>
                  <p className="text-xs text-muted-foreground mt-1">Attorney Smith • 2 hours ago</p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <div className="p-3 rounded-lg bg-neon-cyan/10 max-w-[80%]">
                  <p className="text-sm text-foreground">Thank you. I'm available Friday afternoon.</p>
                  <p className="text-xs text-muted-foreground mt-1">You • 1 hour ago</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-neon-cyan/20 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-neon-cyan" />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Input placeholder="Type your message..." className="flex-1" />
              <Button variant="neon-purple">Send</Button>
            </div>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <Card className="glass-card p-6">
            <h3 className="font-display text-xl font-semibold text-foreground mb-4">
              Billing & Payments
            </h3>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-background/30 text-center">
                <p className="text-2xl font-bold text-neon-green">$2,500</p>
                <p className="text-sm text-muted-foreground">Retainer Paid</p>
              </div>
              <div className="p-4 rounded-xl bg-background/30 text-center">
                <p className="text-2xl font-bold text-neon-cyan">$1,200</p>
                <p className="text-sm text-muted-foreground">Billed to Date</p>
              </div>
              <div className="p-4 rounded-xl bg-background/30 text-center">
                <p className="text-2xl font-bold text-neon-orange">$1,300</p>
                <p className="text-sm text-muted-foreground">Remaining</p>
              </div>
            </div>
            <Button variant="neon-green" className="w-full">
              Make a Payment
            </Button>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
          <Video className="w-5 h-5 text-neon-purple" />
          <span>Schedule Video Call</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
          <Phone className="w-5 h-5 text-neon-cyan" />
          <span>Call Attorney</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
          <Upload className="w-5 h-5 text-neon-green" />
          <span>Upload Documents</span>
        </Button>
      </div>
    </div>
  );
}
