import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Video, VideoOff, Mic, MicOff, Phone, PhoneOff, 
  Maximize2, Minimize2, Settings, Users, MessageSquare 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoCallProps {
  roomId: string;
  participantName: string;
  onEndCall: () => void;
}

export const VideoCall = ({ roomId, participantName, onEndCall }: VideoCallProps) => {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize local media stream
  const initializeMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: { echoCancellation: true, noiseSuppression: true }
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      setIsConnecting(false);
      setIsConnected(true);
      
      toast({
        title: "Connected",
        description: "Video call started successfully",
      });
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast({
        title: "Camera/Microphone Error",
        description: "Please allow access to your camera and microphone",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  }, [toast]);

  // Setup WebRTC peer connection
  const setupPeerConnection = useCallback(() => {
    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ]
    };
    
    const pc = new RTCPeerConnection(configuration);
    
    // Add local stream tracks to peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }
    
    // Handle incoming remote stream
    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };
    
    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        // In production, send this to signaling server
        console.log('ICE candidate:', event.candidate);
      }
    };
    
    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
    };
    
    peerConnectionRef.current = pc;
  }, []);

  useEffect(() => {
    initializeMedia().then(() => {
      setupPeerConnection();
    });
    
    return () => {
      // Cleanup
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [initializeMedia, setupPeerConnection]);

  // Call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleEndCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    onEndCall();
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Badge className="bg-green-500/20 text-green-400">
            {isConnecting ? "Connecting..." : "Connected"}
          </Badge>
          <span className="text-sm text-muted-foreground">Room: {roomId}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono text-foreground">{formatDuration(callDuration)}</span>
          <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Remote Video (Main) */}
        <Card className="relative overflow-hidden bg-muted/20">
          <CardContent className="p-0 h-full flex items-center justify-center min-h-[300px] lg:min-h-[400px]">
            <video 
              ref={remoteVideoRef}
              autoPlay 
              playsInline
              className="w-full h-full object-cover"
            />
            {!isConnected && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Waiting for {participantName}...</p>
                </div>
              </div>
            )}
            <div className="absolute bottom-4 left-4">
              <Badge variant="secondary">{participantName}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Local Video (Self) */}
        <Card className="relative overflow-hidden bg-muted/20">
          <CardContent className="p-0 h-full flex items-center justify-center min-h-[300px] lg:min-h-[400px]">
            {!isVideoOff ? (
              <video 
                ref={localVideoRef}
                autoPlay 
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
            ) : (
              <div className="flex items-center justify-center">
                <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center">
                  <VideoOff className="h-12 w-12 text-primary" />
                </div>
              </div>
            )}
            <div className="absolute bottom-4 left-4">
              <Badge variant="secondary">You</Badge>
            </div>
            {isMuted && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-red-500/20 text-red-400">
                  <MicOff className="h-3 w-3 mr-1" />
                  Muted
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="p-6 border-t border-border">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={isMuted ? "destructive" : "outline"}
            size="lg"
            className="rounded-full h-14 w-14"
            onClick={toggleMute}
          >
            {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>
          
          <Button
            variant={isVideoOff ? "destructive" : "outline"}
            size="lg"
            className="rounded-full h-14 w-14"
            onClick={toggleVideo}
          >
            {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
          </Button>
          
          <Button
            variant="destructive"
            size="lg"
            className="rounded-full h-14 w-14"
            onClick={handleEndCall}
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="rounded-full h-14 w-14"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="rounded-full h-14 w-14"
          >
            <Settings className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
