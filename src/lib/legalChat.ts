import { supabase } from "@/integrations/supabase/client";

export const HUB_TYPES = ["general", "custody", "parole", "defense", "workplace", "probono"] as const;
export type HubType = typeof HUB_TYPES[number];

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

// Streams a legal-chat reply via SSE. Returns the full assistant text once the stream ends.
export async function streamLegalChat({
  hubType,
  sessionId,
  messages,
  onDelta,
  onReviewerNote,
  signal,
}: StreamLegalChatOptions): Promise<{ text: string; reviewed: boolean }> {
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

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const event of events) {
      const line = event.split("\n").find((l) => l.startsWith("data:"));
      if (!line) continue;
      const jsonStr = line.slice(5).trim();
      if (!jsonStr) continue;

      let payload: Record<string, unknown>;
      try {
        payload = JSON.parse(jsonStr);
      } catch {
        continue; // ignore malformed/partial chunk
      }

      if (typeof payload.delta === "string") {
        fullText += payload.delta;
        onDelta(payload.delta);
      } else if (typeof payload.reviewer_note === "string") {
        onReviewerNote?.(payload.reviewer_note);
      } else if (payload.done) {
        reviewed = Boolean(payload.reviewed);
      } else if (typeof payload.error === "string") {
        throw new Error(payload.error);
      }
    }
  }

  return { text: fullText, reviewed };
}
