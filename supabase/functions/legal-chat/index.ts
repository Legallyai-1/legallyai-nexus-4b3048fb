import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 6_000;
const MAX_CONTEXT_LENGTH = 2_000;

interface Message {
  role: "user" | "assistant";
  content: string;
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isMessage(value: unknown): value is Message {
  if (!value || typeof value !== "object") return false;
  const message = value as Record<string, unknown>;
  return (message.role === "user" || message.role === "assistant")
    && typeof message.content === "string"
    && message.content.trim().length > 0
    && message.content.length <= MAX_MESSAGE_LENGTH;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const payload = await req.json();
    const messages = payload?.messages;
    const context = typeof payload?.context === "string" ? payload.context.slice(0, MAX_CONTEXT_LENGTH) : "";

    if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES || !messages.every(isMessage)) {
      return json({ error: "Provide between 1 and 20 valid user or assistant messages." }, 400);
    }

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      console.error("ANTHROPIC_API_KEY is not configured");
      return json({ error: "AI chat is not configured. Please contact support." }, 503);
    }

    // The model is configurable so deployments can select an Anthropic model
    // available to their account without changing client code.
    const model = Deno.env.get("ANTHROPIC_MODEL") || "claude-sonnet-4-20250514";
    const system = [
      "You are Lee, an AI legal-information assistant.",
      "Provide general educational information, not legal advice, and do not claim to be a lawyer.",
      "Do not invent laws, citations, filing requirements, prices, or deadlines. State uncertainty clearly.",
      "Encourage the user to consult a licensed attorney for advice, deadlines, filings, emergencies, or high-stakes decisions.",
      "Do not request sensitive personal data beyond what is necessary for a general answer.",
      context,
    ].filter(Boolean).join(" ");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({ model, max_tokens: 1024, system, messages }),
    });

    const result = await response.json();
    if (!response.ok) {
      console.error("Anthropic request failed", response.status, result);
      return json({ error: "The AI service could not complete this request. Please try again later." }, 502);
    }

    const text = result?.content?.find((block: { type?: string }) => block.type === "text")?.text;
    if (typeof text !== "string" || !text.trim()) {
      console.error("Anthropic returned no text content", result);
      return json({ error: "The AI service returned an empty response. Please try again." }, 502);
    }

    return json({ response: text, text });
  } catch (error) {
    console.error("legal-chat failed", error);
    return json({ error: "Unable to process the request. Please try again." }, 500);
  }
});
