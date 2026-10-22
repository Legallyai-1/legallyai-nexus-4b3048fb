export type ProtocolMessage = { role: "user" | "assistant"; content: string };
export type ProtocolMode = "paid" | "no-cost" | "in-house";

export function prepareChatMessages(messages: ProtocolMessage[]): ProtocolMessage[] {
  if (!Array.isArray(messages) || messages.length === 0) throw new Error("Enter a message before sending.");
  const recent = messages.slice(-20).map(message => {
    if (!message || !["user", "assistant"].includes(message.role) || typeof message.content !== "string") throw new Error("Invalid chat message.");
    const content = message.content.trim();
    if (!content || content.length > 6000) throw new Error("Each message must contain between 1 and 6,000 characters.");
    return { role: message.role, content };
  });
  if (recent[recent.length - 1].role !== "user") throw new Error("The conversation must end with your message.");
  const firstUser = recent.findIndex(message => message.role === "user");
  return recent.slice(firstUser);
}

export async function readLegalChatStream(
  body: ReadableStream<Uint8Array>,
  onDelta: (chunk: string) => void,
  onReviewerNote?: (note: string) => void,
): Promise<{ text: string; reviewed: boolean; mode: ProtocolMode }> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  let reviewed = false;
  let mode: ProtocolMode = "in-house";
  let completed = false;
  let succeeded = false;
  const processEvent = (event: string) => {
    const data = event.split(/\r\n|\r|\n/).filter(line => line.startsWith("data:")).map(line => line.slice(5).replace(/^ /, "")).join("\n").trim();
    if (!data) return;
    let value: unknown;
    try { value = JSON.parse(data); } catch { throw new Error("The AI service returned an unreadable stream event."); }
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid AI stream event.");
    const payload = value as Record<string, unknown>;
    if (typeof payload.error === "string") throw new Error(payload.error);
    if (completed) throw new Error("Unexpected AI content after completion.");
    if (typeof payload.delta === "string") {
      text += payload.delta;
      if (text.length > 200000) throw new Error("The AI response exceeded the supported size.");
      onDelta(payload.delta);
    }
    if (typeof payload.reviewer_note === "string") onReviewerNote?.(payload.reviewer_note);
    if (payload.done === true) {
      if (!["paid", "no-cost", "in-house"].includes(String(payload.mode))) throw new Error("The AI response omitted its completion mode.");
      mode = payload.mode as ProtocolMode;
      reviewed = payload.reviewed === true;
      const fq = payload.free_questions as { used?: unknown; limit?: unknown } | null | undefined;
      if (fq && typeof fq.used === "number" && typeof fq.limit === "number" && typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("legallyai:free-usage", { detail: { used: fq.used, limit: fq.limit } }));
      }
      completed = true;
    }
  };
  const drain = () => {
    let boundary: RegExpExecArray | null;
    while ((boundary = /\r\n\r\n|\n\n|\r\r/.exec(buffer)) !== null) {
      const event = buffer.slice(0, boundary.index);
      buffer = buffer.slice(boundary.index + boundary[0].length);
      processEvent(event);
    }
    if (buffer.length > 1048576) throw new Error("The AI stream event exceeded the supported size.");
  };
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      buffer += decoder.decode(chunk.value, { stream: true });
      drain();
    }
    buffer += decoder.decode();
    drain();
    if (buffer.trim()) processEvent(buffer);
    if (!completed) throw new Error("The AI connection ended before completion. Please retry.");
    if (!text.trim()) throw new Error("The AI service returned an empty response.");
    succeeded = true;
    return { text, reviewed, mode };
  } finally {
    if (!succeeded) await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}
