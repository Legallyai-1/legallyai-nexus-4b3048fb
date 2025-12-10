import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { cn } from "@/lib/utils";

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost" | "neon";
}

export function VoiceInputButton({ 
  onTranscript, 
  className,
  size = "icon",
  variant = "outline"
}: VoiceInputButtonProps) {
  const { isListening, isProcessing, toggleListening } = useVoiceInput({
    onTranscript,
  });

  return (
    <Button
      type="button"
      variant={isListening ? "destructive" : variant}
      size={size}
      onClick={toggleListening}
      disabled={isProcessing}
      className={cn(
        "relative transition-all",
        isListening && "animate-pulse ring-2 ring-destructive ring-offset-2 ring-offset-background",
        className
      )}
      title={isListening ? "Stop recording" : "Start voice input"}
    >
      {isProcessing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isListening ? (
        <MicOff className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
      {isListening && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-ping" />
      )}
    </Button>
  );
}
