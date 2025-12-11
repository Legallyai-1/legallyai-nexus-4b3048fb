import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { AnimatedAIHead } from "@/components/ui/AnimatedAIHead";
import { Send, Upload, FileText, Mic, MicOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  attachments?: { name: string; type: string }[];
}

interface HubAssistantProps {
  assistantName: string;
  variant: "cyan" | "purple" | "pink" | "green" | "orange" | "blue";
  systemPrompt: string;
  placeholder?: string;
  welcomeMessage?: string;
}

export function HubAssistant({
  assistantName,
  variant,
  systemPrompt,
  placeholder = "Ask me anything about your case...",
  welcomeMessage
}: HubAssistantProps) {
  const [messages, setMessages] = useState<Message[]>(
    welcomeMessage ? [{ role: "assistant", content: welcomeMessage }] : []
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = async () => {
    if (!input.trim() && attachedFiles.length === 0) return;
    if (isLoading) return;

    const userMessage = input.trim();
    const fileNames = attachedFiles.map(f => f.name);
    
    setInput("");
    setAttachedFiles([]);
    
    const newUserMessage: Message = {
      role: "user",
      content: userMessage || `[Uploaded ${fileNames.length} file(s): ${fileNames.join(", ")}]`,
      attachments: attachedFiles.map(f => ({ name: f.name, type: f.type }))
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      let contextMessage = userMessage;
      if (fileNames.length > 0) {
        contextMessage = `User uploaded files: ${fileNames.join(", ")}. ${userMessage}`;
      }

      const { data, error } = await supabase.functions.invoke('legal-chat', {
        body: {
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: contextMessage }
          ],
          stream: false
        }
      });

      if (error) throw error;

      setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch (error: any) {
      toast.error(error.message || "Failed to get response");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setAttachedFiles(prev => [...prev, ...files]);
      toast.success(`${files.length} file(s) attached`);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleVoiceInput = async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Voice input not supported in this browser");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      return;
    }

    setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + " " + transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error("Voice input failed");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const colorClasses = {
    cyan: "neon-cyan",
    purple: "neon-purple",
    pink: "neon-pink",
    green: "neon-green",
    orange: "neon-orange",
    blue: "neon-cyan"
  };

  const colorClass = colorClasses[variant];

  return (
    <Card className={`glass-card border-${colorClass}/30 p-4`}>
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border/30">
        <AnimatedAIHead variant={variant} size="sm" isActive={isLoading} />
        <div>
          <h3 className={`font-display font-semibold text-${colorClass}`}>{assistantName}</h3>
          <p className="text-xs text-muted-foreground">Your AI Legal Assistant</p>
        </div>
      </div>

      {/* Messages */}
      <div className="min-h-[200px] max-h-[400px] overflow-y-auto space-y-3 mb-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-xl text-sm ${
                msg.role === "user"
                  ? `bg-${colorClass}/20 border border-${colorClass}/30`
                  : "bg-background/50 border border-border/50"
              }`}
            >
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {msg.attachments.map((file, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-muted rounded-full flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {file.name}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-foreground whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-background/50 border border-border/50 p-3 rounded-xl">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{assistantName} is thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Attached Files Preview */}
      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {attachedFiles.map((file, idx) => (
            <span key={idx} className="text-xs px-2 py-1 bg-muted rounded-full flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {file.name}
              <button 
                onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== idx))}
                className="ml-1 text-destructive hover:text-destructive/80"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          multiple
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.mp4,.mov"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0"
        >
          <Upload className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleVoiceInput}
          className={`shrink-0 ${isListening ? "text-destructive animate-pulse" : ""}`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </Button>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className={`flex-1 min-h-[60px] max-h-[120px] bg-background/30 border-${colorClass}/30 focus:border-${colorClass}/60 resize-none`}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <Button
          variant="neon-purple"
          size="icon"
          onClick={handleSendMessage}
          disabled={(!input.trim() && attachedFiles.length === 0) || isLoading}
          className="shrink-0 self-end"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
