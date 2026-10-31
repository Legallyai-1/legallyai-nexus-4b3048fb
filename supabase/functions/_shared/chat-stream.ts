export const LEGAL_INFORMATION_NOTICE =
  "LegallyAI is not a law firm and Lee is not a lawyer. This is legal information, not legal advice, " +
  "and is not a substitute for an attorney. It can be wrong; check deadlines with the court.";

export function legalNoticeSuffix(text: string): string {
  return text.includes(LEGAL_INFORMATION_NOTICE) ? "" : `\n\n---\n\n${LEGAL_INFORMATION_NOTICE}`;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export interface StreamingProvider {
  apiKey: string;
  model: string;
}

interface StreamingOptions {
  provider: StreamingProvider;
  system: string;
  messages: ReadonlyArray<{ role: "user" | "assistant"; content: string }>;
  onDelta: (text: string) => void;
  signal?: AbortSignal;
  fetcher?: typeof fetch;
}

/** Parse provider SSE without logging prompts, credentials, or upstream response bodies. */
export async function streamAnthropicCompletion({
  provider, system, messages, onDelta, signal, fetcher = fetch,
}: StreamingOptions): Promise<string> {
  const response = await fetcher("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": provider.apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({ model: provider.model, max_tokens: 1024, system, messages, stream: true }),
    signal: signal
      ? AbortSignal.any([signal, AbortSignal.timeout(60_000)])
      : AbortSignal.timeout(60_000),
  });
  if (!response.ok || !response.body) {
    await response.body?.cancel();
    throw new Error(`AI provider returned HTTP ${response.status}.`);
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullText = "";
  let stopped = false;

  const processEvent = (block: string) => {
    const data = block.split(/\r?\n/)
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trimStart()).join("\n");
    if (!data) return;
    let event: unknown;
    try {
      event = JSON.parse(data);
    } catch {
      throw new Error("AI provider returned malformed stream data.");
    }
    if (!isRecord(event)) throw new Error("AI provider returned invalid stream data.");
    if (event.type === "error") throw new Error("AI provider interrupted the response.");
    if (event.type === "message_stop") stopped = true;
    if (!stopped && event.type === "content_block_delta" && isRecord(event.delta)
      && event.delta.type === "text_delta") {
      if (typeof event.delta.text !== "string") throw new Error("AI provider returned invalid text.");
      fullText += event.delta.text;
      onDelta(event.delta.text);
    }
  };
  try {
    while (!stopped) {
      const { value, done } = await reader.read();
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
      let boundary = /\r?\n\r?\n/.exec(buffer);
      while (boundary) {
        processEvent(buffer.slice(0, boundary.index));
        buffer = buffer.slice(boundary.index + boundary[0].length);
        if (stopped) break;
        boundary = /\r?\n\r?\n/.exec(buffer);
      }
      if (buffer.length > 1_000_000) throw new Error("AI provider stream event exceeded the limit.");
      if (done) {
        if (!stopped && buffer.trim()) processEvent(buffer);
        break;
      }
    }
    if (!stopped) throw new Error("AI provider stream ended before completion.");
    if (!fullText.trim()) throw new Error("AI provider returned an empty response.");
    return fullText;
  } finally {
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}
