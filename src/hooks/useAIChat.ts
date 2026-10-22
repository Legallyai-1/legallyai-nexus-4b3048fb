import { useState, useCallback, useRef, useEffect, type SetStateAction } from "react";
import { toast } from "sonner";
import { streamLegalChat, type HubType, type ChatMessage as LegalChatMessage } from "@/lib/legalChat";

export interface Message {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  reviewed?: boolean;
}
interface UseAIChatOptions {
  hubType: HubType;
  onError?: (error: Error) => void;
}

export function useAIChat({ hubType, onError }: UseAIChatOptions) {
  const [messages, setMessagesState] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesRef = useRef<Message[]>([]);
  const sessionIdRef = useRef<string>(crypto.randomUUID());
  const requestRef = useRef(0);
  const busyRef = useRef(false);
  const controllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  const setMessages = useCallback((update: SetStateAction<Message[]>) => {
    const next = typeof update === "function" ? update(messagesRef.current) : update;
    messagesRef.current = next;
    if (mountedRef.current) setMessagesState(next);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      requestRef.current += 1;
      controllerRef.current?.abort();
      controllerRef.current = null;
      busyRef.current = false;
    };
  }, []);

  const sendMessage = useCallback(async (userMessage: string) => {
    const content = userMessage.trim();
    if (!content || busyRef.current || !mountedRef.current) return;
    busyRef.current = true;
    const request = ++requestRef.current;
    const controller = new AbortController();
    controllerRef.current = controller;
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content };
    const assistantId = crypto.randomUUID();
    const history: LegalChatMessage[] = [...messagesRef.current, userMsg]
      .filter((message): message is Message & { role: "user" | "assistant" } => message.role !== "system" && Boolean(message.content.trim()))
      .map(message => ({ role: message.role, content: message.content }));
    const isCurrent = () => mountedRef.current && requestRef.current === request && !controller.signal.aborted;
    setMessages(previous => [...previous, userMsg, { id: assistantId, role: "assistant", content: "" }]);
    setIsLoading(true);
    try {
      let reviewerNote = "";
      const { text, reviewed } = await streamLegalChat({
        hubType,
        sessionId: sessionIdRef.current,
        messages: history,
        signal: controller.signal,
        onDelta: chunk => {
          if (!isCurrent()) return;
          setMessages(previous => previous.map(message => message.id === assistantId ? { ...message, content: message.content + chunk } : message));
        },
        onReviewerNote: note => { if (isCurrent()) reviewerNote = note; },
      });
      if (!isCurrent()) return;
      setMessages(previous => previous.map(message => message.id === assistantId ? {
        ...message,
        content: reviewerNote ? `${text}\n\n---\n⚠️ ${reviewerNote}` : text,
        reviewed,
      } : message));
      return text;
    } catch (error: unknown) {
      if (!isCurrent()) return;
      setMessages(previous => previous.filter(message => message.id !== assistantId));
      const failure = error instanceof Error ? error : new Error("Failed to get AI response");
      // The free-limit pop-up explains itself; other failures get a toast.
      if (failure.name !== "FreeLimitError") toast.error(failure.message);
      onError?.(failure);
      throw failure;
    } finally {
      if (mountedRef.current && requestRef.current === request) {
        busyRef.current = false;
        controllerRef.current = null;
        setIsLoading(false);
      }
    }
  }, [hubType, onError, setMessages]);

  const clearMessages = useCallback(() => {
    requestRef.current += 1;
    controllerRef.current?.abort();
    controllerRef.current = null;
    busyRef.current = false;
    setMessages([]);
    sessionIdRef.current = crypto.randomUUID();
    if (mountedRef.current) setIsLoading(false);
  }, [setMessages]);

  const addSystemMessage = useCallback((content: string) => {
    setMessages(previous => [...previous, { id: crypto.randomUUID(), role: "system", content }]);
  }, [setMessages]);

  return { messages, isLoading, sendMessage, clearMessages, addSystemMessage, setMessages };
}
