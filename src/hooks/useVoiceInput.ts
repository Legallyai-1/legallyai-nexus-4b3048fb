import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UseVoiceInputOptions {
  onTranscript?: (text: string) => void;
  onError?: (error: string) => void;
}

export function useVoiceInput(options: UseVoiceInputOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsListening(false);
        setIsProcessing(true);

        try {
          const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
          
          // Convert blob to base64
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          
          reader.onloadend = async () => {
            const base64Audio = (reader.result as string).split(",")[1];
            
            // Call edge function for transcription
            const { data, error } = await supabase.functions.invoke("voice-to-text", {
              body: { audio: base64Audio },
            });

            if (error) {
              throw new Error(error.message);
            }

            if (data?.text) {
              setTranscript(data.text);
              options.onTranscript?.(data.text);
              toast.success("Voice transcribed successfully!");
            }
          };
        } catch (error: any) {
          console.error("Transcription error:", error);
          const errorMessage = error.message || "Failed to transcribe audio";
          toast.error(errorMessage);
          options.onError?.(errorMessage);
        } finally {
          setIsProcessing(false);
          // Stop all tracks
          stream.getTracks().forEach((track) => track.stop());
        }
      };

      mediaRecorder.start();
      setIsListening(true);
      toast.info("Listening... Click again to stop.");
    } catch (error: any) {
      console.error("Microphone error:", error);
      const errorMessage = error.name === "NotAllowedError" 
        ? "Microphone permission denied" 
        : "Failed to access microphone";
      toast.error(errorMessage);
      options.onError?.(errorMessage);
    }
  }, [options]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
    }
  }, [isListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const clearTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  return {
    isListening,
    isProcessing,
    transcript,
    startListening,
    stopListening,
    toggleListening,
    clearTranscript,
  };
}
