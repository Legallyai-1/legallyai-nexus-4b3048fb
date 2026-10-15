import { supabase } from "@/integrations/supabase/client";

export const HUB_TYPES = ["general", "custody", "parole", "defense", "workplace", "probono", "support", "marriage"] as const;
export type HubType = typeof HUB_TYPES[number];
export type ChatMode = "paid" | "no-cost" | "in-house";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface StreamLegalChatOptions {
  hubType: HubType;
  sessionId: string;
  messages: ChatMessage[];
  onDelta: (chunk: string) => void;
  onReviewerNote?: (note: string) => void;
  signal?: AbortSignal;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export function isFreeAiMode(mode: ChatMode): boolean {
  return mode === "no-cost" || mode === "in-house";
}

export async function streamLegalChat({
  hubType,
  sessionId,
  messages,
  onDelta,
  onReviewerNote,
  signal,
}: StreamLegalChatOptions): Promise<{ text: string; reviewed: boolean; mode: ChatMode }> {
  if (!SUPABASE_URL) {
    throw new Error("AI chat is not configured: missing VITE_SUPABASE_URL.");
  }
  if (!SUPABASE_ANON_KEY) {
    throw new Error("AI chat is not configured: missing Supabase publishable key.");
  }

  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch(`${SUPABASE_URL}/functions/v1/legal-chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${session?.access_token ?? SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ hub_type: hubType, session_id: sessionId, messages }),
    signal,
  });

  if (!response.ok || !response.body) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody?.error || "The AI service could not complete this request.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullText = "";
  let reviewed = false;
  let mode: ChatMode = "in-house";

  const processEvent = (event: string) => {
    const line = event.split("\n").find((l) => l.startsWith("data:"));
    if (!line) return;
    const jsonStr = line.slice(5).trim();
    if (!jsonStr) return;

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(jsonStr);
    } catch {
      return;
    }

    if (typeof payload.delta === "string") {
      fullText += payload.delta;
      onDelta(payload.delta);
    } else if (typeof payload.reviewer_note === "string") {
      onReviewerNote?.(payload.reviewer_note);
    } else if (payload.done) {
      reviewed = Boolean(payload.reviewed);
      if (payload.mode === "paid" || payload.mode === "no-cost" || payload.mode === "in-house") {
        mode = payload.mode;
      }
    } else if (typeof payload.error === "string") {
      throw new Error(payload.error);
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";
    for (const event of events) processEvent(event);
  }

  buffer += decoder.decode();
  if (buffer.trim()) processEvent(buffer);

  return { text: fullText, reviewed, mode };
}
