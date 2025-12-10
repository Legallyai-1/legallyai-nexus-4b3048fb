import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { FuturisticBackground } from "@/components/ui/FuturisticBackground";
import { AnimatedAIHead } from "@/components/ui/AnimatedAIHead";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Phone, 
  PhoneCall, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  MessageSquare,
  Clock,
  FileText,
  User,
  History,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CallRecord {
  id: string;
  number: string;
  name?: string;
  duration: string;
  date: string;
  type: "incoming" | "outgoing" | "missed";
  transcription?: string;
}

const mockCallHistory: CallRecord[] = [
  { id: "1", number: "+1 (555) 123-4567", name: "Client - John Doe", duration: "12:34", date: "Today, 2:30 PM", type: "outgoing", transcription: "Discussion about custody case..." },
  { id: "2", number: "+1 (555) 987-6543", name: "Attorney Smith", duration: "5:21", date: "Today, 11:15 AM", type: "incoming", transcription: "Case update regarding settlement..." },
  { id: "3", number: "+1 (555) 456-7890", duration: "0:00", date: "Yesterday, 4:45 PM", type: "missed" },
];

export default function TelephonyPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [activeTab, setActiveTab] = useState("dialer");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isInCall) {
      intervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setCallDuration(0);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isInCall]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDialPad = (digit: string) => {
    setPhoneNumber(prev => prev + digit);
  };

  const handleCall = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Enter a phone number",
        description: "Please enter a valid phone number to call.",
        variant: "destructive"
      });
      return;
    }

    // Browser calling simulation - in production would use WebRTC or similar
    setIsInCall(true);
    setIsTranscribing(true);
    toast({
      title: "CallAI Connected",
      description: `Connected to ${phoneNumber}. AI transcription & analysis active.`,
    });

    // Simulate AI-powered transcription
    setTimeout(() => {
      setTranscription("🎙️ CallAI is transcribing...\n\n[00:00] Call connected. AI listening and analyzing conversation...\n\n[00:02] Waiting for speech input...");
    }, 1000);

    // Simulate real-time transcription updates
    setTimeout(() => {
      setTranscription(prev => prev + "\n\n[00:05] \"Hello, this is regarding your case inquiry...\" - Caller");
    }, 4000);
  };

  const handleEndCall = () => {
    setIsInCall(false);
    setIsTranscribing(false);
    toast({
      title: "Call Ended",
      description: `Call duration: ${formatDuration(callDuration)}. Transcription saved.`,
    });
    setTranscription("");
  };

  const dialPadButtons = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["*", "0", "#"]
  ];

  return (
    <Layout>
      <FuturisticBackground>
        <div className="min-h-screen py-12 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <AnimatedAIHead variant="cyan" size="lg" isActive={isInCall} />
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-blue">CallAI</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                AI-Powered Legal Telephony - Calls, Transcription & Case Integration
              </p>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-8 glass-card">
                <TabsTrigger value="dialer" className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan">
                  <Phone className="w-4 h-4 mr-2" /> Dialer
                </TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple">
                  <History className="w-4 h-4 mr-2" /> History
                </TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-neon-orange/20 data-[state=active]:text-neon-orange">
                  <Settings className="w-4 h-4 mr-2" /> Settings
                </TabsTrigger>
              </TabsList>

              {/* Dialer Tab */}
              <TabsContent value="dialer">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Dial Pad */}
                  <Card className="glass-card p-6 border-neon-cyan/30">
                    <Input
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Enter phone number"
                      className="text-center text-2xl font-mono mb-6 bg-background/30 border-neon-cyan/30"
                      disabled={isInCall}
                    />
                    
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      {dialPadButtons.flat().map((digit) => (
                        <Button
                          key={digit}
                          variant="outline"
                          className="h-14 text-xl font-mono hover:bg-neon-cyan/20 hover:border-neon-cyan/50"
                          onClick={() => handleDialPad(digit)}
                          disabled={isInCall}
                        >
                          {digit}
                        </Button>
                      ))}
                    </div>

                    {!isInCall ? (
                      <Button
                        variant="neon-green"
                        size="lg"
                        className="w-full"
                        onClick={handleCall}
                      >
                        <PhoneCall className="w-5 h-5 mr-2" /> Start Call
                      </Button>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-center">
                          <p className="text-3xl font-mono text-neon-green mb-2">
                            {formatDuration(callDuration)}
                          </p>
                          <p className="text-sm text-muted-foreground animate-pulse">
                            Call in progress...
                          </p>
                        </div>
                        
                        <div className="flex justify-center gap-4">
                          <Button
                            variant={isMuted ? "destructive" : "outline"}
                            size="icon"
                            onClick={() => setIsMuted(!isMuted)}
                          >
                            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                          </Button>
                          <Button
                            variant={isSpeakerOn ? "outline" : "secondary"}
                            size="icon"
                            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                          >
                            {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                          </Button>
                        </div>

                        <Button
                          variant="destructive"
                          size="lg"
                          className="w-full"
                          onClick={handleEndCall}
                        >
                          <PhoneOff className="w-5 h-5 mr-2" /> End Call
                        </Button>
                      </div>
                    )}
                  </Card>

                  {/* Transcription Panel */}
                  <Card className="glass-card p-6 border-neon-purple/30">
                    <div className="flex items-center gap-2 mb-4">
                      <MessageSquare className="w-5 h-5 text-neon-purple" />
                      <h3 className="font-display font-semibold text-foreground">Live Transcription</h3>
                      {isTranscribing && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-neon-green/20 text-neon-green animate-pulse">
                          Active
                        </span>
                      )}
                    </div>
                    
                    <div className="min-h-[300px] bg-background/30 rounded-xl p-4 border border-border/50">
                      {transcription ? (
                        <p className="text-sm text-foreground whitespace-pre-wrap">{transcription}</p>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <FileText className="w-12 h-12 text-muted-foreground/30 mb-4" />
                          <p className="text-muted-foreground text-sm">
                            {isInCall 
                              ? "AI is transcribing the conversation..." 
                              : "Start a call to see live transcription"}
                          </p>
                        </div>
                      )}
                    </div>

                    {transcription && (
                      <div className="mt-4 flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          Save to Case
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          Export PDF
                        </Button>
                      </div>
                    )}
                  </Card>
                </div>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history">
                <Card className="glass-card p-6">
                  <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                    <History className="w-5 h-5 text-neon-purple" /> Call History
                  </h3>
                  <div className="space-y-3">
                    {mockCallHistory.map((call) => (
                      <div
                        key={call.id}
                        className="p-4 rounded-xl bg-background/30 border border-border/50 hover:border-neon-cyan/50 transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${
                              call.type === "outgoing" ? "bg-neon-green/20" :
                              call.type === "incoming" ? "bg-neon-cyan/20" :
                              "bg-destructive/20"
                            }`}>
                              <Phone className={`w-4 h-4 ${
                                call.type === "outgoing" ? "text-neon-green" :
                                call.type === "incoming" ? "text-neon-cyan" :
                                "text-destructive"
                              }`} />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{call.name || call.number}</p>
                              <p className="text-xs text-muted-foreground">{call.number}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">{call.date}</p>
                            <p className="text-xs text-neon-cyan">{call.duration}</p>
                          </div>
                        </div>
                        {call.transcription && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-1">
                            📝 {call.transcription}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings">
                <Card className="glass-card p-6">
                  <h3 className="font-display font-semibold text-foreground mb-6">Telephony Settings</h3>
                  <div className="space-y-4">
                    {[
                      { label: "Auto-transcription", desc: "Automatically transcribe all calls", enabled: true },
                      { label: "AI Call Assistant", desc: "Get AI help during calls", enabled: true },
                      { label: "Link to Cases", desc: "Automatically link calls to open cases", enabled: false },
                      { label: "Call Recording", desc: "Record calls for review", enabled: true },
                    ].map((setting, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-background/30 border border-border/50">
                        <div>
                          <p className="font-medium text-foreground">{setting.label}</p>
                          <p className="text-xs text-muted-foreground">{setting.desc}</p>
                        </div>
                        <Button
                          variant={setting.enabled ? "neon" : "outline"}
                          size="sm"
                        >
                          {setting.enabled ? "Enabled" : "Disabled"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Back Button */}
            <div className="text-center mt-8">
              <Button variant="ghost" onClick={() => navigate("/ai-assistants")}>
                ← Back to AI Assistants
              </Button>
            </div>
          </div>
        </div>
      </FuturisticBackground>
    </Layout>
  );
}
