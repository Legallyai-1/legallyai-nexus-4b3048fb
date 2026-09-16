import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { streamLegalChat, type HubType, type ChatMessage as LegalChatMessage } from "@/lib/legalChat";

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  reviewed?: boolean;
}

interface UseAIChatOptions {
  hubType: HubType;
  onError?: (error: Error) => void;
}

export function useAIChat({ hubType, onError }: UseAIChatOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const sessionIdRef = useRef<string>(crypto.randomUUID());

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: userMessage.trim() };
    const history: LegalChatMessage[] = [...messages, userMsg]
      .filter((m): m is Message & { role: "user" | "assistant" } => m.role !== "system")
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages(prev => [...prev, userMsg, { role: "assistant", content: "" }]);
    setIsLoading(true);

    try {
      let reviewerNote = "";
      const { text, reviewed } = await streamLegalChat({
        hubType,
        sessionId: sessionIdRef.current,
        messages: history,
        onDelta: (chunk) => {
          setMessages(prev => {
            const next = [...prev];
            next[next.length - 1] = { ...next[next.length - 1], content: next[next.length - 1].content + chunk };
            return next;
          });
        },
        onReviewerNote: (note) => {
          reviewerNote = note;
        },
      });

      setMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = {
          role: "assistant",
          content: reviewerNote ? `${text}\n\n---\n⚠️ ${reviewerNote}` : text,
          reviewed,
        };
        return next;
      });

      return text;
    } catch (error: any) {
      setMessages(prev => prev.slice(0, -2));
      const err = new Error(error.message || "Failed to get AI response");
      toast.error(err.message);
      onError?.(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [messages, hubType, isLoading, onError]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    sessionIdRef.current = crypto.randomUUID();
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

