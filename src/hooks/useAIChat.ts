import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface UseAIChatOptions {
  systemPrompt: string;
  onError?: (error: Error) => void;
}

export function useAIChat({ systemPrompt, onError }: UseAIChatOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: userMessage.trim() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('legal-chat', {
        body: {
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
            userMsg
          ]
        }
      });

      if (error) throw error;

      const assistantMsg: Message = { role: "assistant", content: data.response };
      setMessages(prev => [...prev, assistantMsg]);
      
      return data.response;
    } catch (error: any) {
      const err = new Error(error.message || "Failed to get AI response");
      toast.error(err.message);
      onError?.(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [messages, systemPrompt, isLoading, onError]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const addSystemMessage = useCallback((content: string) => {
    setMessages(prev => [...prev, { role: "system", content }]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    addSystemMessage,
    setMessages
  };
}
