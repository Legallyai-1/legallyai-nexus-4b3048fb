import { supabase } from "@/integrations/supabase/client";
import { prepareChatMessages, readLegalChatStream } from "./legalChatProtocol";
import { announceFreeLimit, FreeLimitError, getDeviceId } from "@/lib/freeQuestions";

export const HUB_TYPES = ["general", "custody", "parole", "defense", "workplace", "probono", "support", "marriage", "lawyer"] as const;
export type HubType = typeof HUB_TYPES[number];
export type ChatMode = "paid" | "no-cost" | "in-house";
export interface ChatMessage { role: "user" | "assistant"; content: string }
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
export function isFreeAiMode(mode: ChatMode): boolean { return mode === "no-cost" || mode === "in-house"; }

export async function streamLegalChat({ hubType, sessionId, messages, onDelta, onReviewerNote, signal }: StreamLegalChatOptions): Promise<{ text: string; reviewed: boolean; mode: ChatMode }> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error("AI chat is not configured. Contact support.");
  if (!HUB_TYPES.includes(hubType)) throw new Error("Unsupported legal assistant.");
  if (!sessionId.trim() || sessionId.length > 128) throw new Error("Invalid chat session. Start a new conversation.");
  const requestMessages = prepareChatMessages(messages);
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw new Error("Your sign-in session could not be loaded. Please sign in again.");
  const response = await fetch(`${SUPABASE_URL}/functions/v1/legal-chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${session?.access_token ?? SUPABASE_ANON_KEY}` },
    body: JSON.stringify({ hub_type: hubType, session_id: sessionId, messages: requestMessages, device_id: getDeviceId() }),
    signal,
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    if (response.status === 402 && errorBody?.error === "free_limit_reached") {
      const detail = { limit: Number(errorBody.limit) || 5, used: Number(errorBody.used) || 0, signedIn: errorBody.signed_in === true };
      announceFreeLimit(detail);
      throw new FreeLimitError(detail, typeof errorBody.message === "string" ? errorBody.message : "You've used your free legal questions.");
    }
    if (response.status === 401) throw new Error("Please sign in again to use this assistant.");
    if (response.status === 429) throw new Error("The assistant is temporarily rate-limited. Please wait and retry.");
    throw new Error(typeof errorBody?.error === "string" ? errorBody.error : "The AI service could not complete this request.");
  }
  if (!response.body || !response.headers.get("content-type")?.toLowerCase().includes("text/event-stream")) throw new Error("The AI service did not return a valid response stream.");
  return readLegalChatStream(response.body, onDelta, onReviewerNote);
}
