import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 6_000;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Server-side persona registry: the client only ever selects one of these keys.
// Free-text system prompts from the client are never trusted (prevents prompt injection/jailbreaks).
const HUB_PROMPTS: Record<string, string> = {
  general:
    "You are Lee, an AI legal-information assistant for LegallyAI Nexus. " +
    "Provide general educational information, not legal advice, and do not claim to be a lawyer. " +
    "Do not invent laws, citations, filing requirements, prices, or deadlines. State uncertainty clearly.",
  custody:
    "You are CustodiAI, an expert AI assistant for child custody matters. Help users understand custody types, " +
    "parental rights, parenting plans and schedules, child support basics, and court preparation. " +
    "Reference any uploaded-document context the user provides.",
  parole:
    "You are RehabilitAI (also called ProbAI), a compassionate AI assistant helping people navigate probation, parole, " +
    "and reentry after incarceration. Cover compliance and modification requests, rights while supervised, reentry " +
    "resources, and support for family members helping a loved one. Be empathetic and non-judgmental.",
  defense:
    "You are Defendr, an AI legal assistant specializing in traffic tickets and criminal defense guidance. " +
    "Explain charges, potential defense strategies, court procedures, and rights in plain language. Help users " +
    "organize evidence and understand documents like tickets, citations, and police reports. Be non-judgmental.",
  workplace:
    "You are WorkplaceAI, an AI assistant specializing in employment law and worker rights (discrimination, " +
    "harassment, wage and hour, FMLA, OSHA safety, wrongful termination). Guide users on filing complaints with " +
    "EEOC/DOL/OSHA and help them document workplace issues properly.",
  probono:
    "You are ProBonoAI. For attorneys, help them find pro bono opportunities and understand IRS rules for " +
    "deducting pro bono-related expenses (mileage, out-of-pocket costs - time/services are not deductible). " +
    "For people seeking help, explain eligibility for free legal aid, how to find local legal aid organizations, " +
    "and what to expect from volunteer representation.",
};

const SAFETY_SUFFIX =
  " Encourage the user to consult a licensed attorney for advice, deadlines, filings, emergencies, or high-stakes " +
  "decisions. Do not request sensitive personal data beyond what is necessary for a general answer.";

// Free heuristic "router agent": only used when the client didn't already pin a hub
// (e.g. the floating assistant on a generic page). No LLM call - keeps cost at zero.
const ROUTER_KEYWORDS: Record<string, string[]> = {
  custody: ["custody", "parenting plan", "child support", "visitation"],
  parole: ["parole", "probation", "reentry", "incarcerat"],
  defense: ["ticket", "citation", "dui", "dwi", "criminal charge", "arrest"],
  workplace: ["fired", "workplace", "harassment", "discrimination", "eeoc", "wage", "overtime"],
  probono: ["pro bono", "free legal", "legal aid"],
};

function routeHub(requestedHub: string | undefined, lastUserMessage: string): string {
  if (requestedHub && HUB_PROMPTS[requestedHub]) return requestedHub;
  const text = lastUserMessage.toLowerCase();
  for (const [hub, keywords] of Object.entries(ROUTER_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) return hub;
  }
  return "general";
}

// Cost-gated "reviewer agent": only runs a second LLM pass when the draft looks
// risky (dates, money, citations) or is long enough to warrant a fact-check.
const REVIEW_TRIGGER = /\$\d|\bdeadline\b|\bstatute\b|\bv\.\s|\d{1,2}\/\d{1,2}\/\d{2,4}|\bcite|\bcase law\b|\bcode section\b/i;

function needsReview(draft: string): boolean {
  return draft.length > 400 || REVIEW_TRIGGER.test(draft);
}

function isMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;
  const m = value as Record<string, unknown>;
  return (m.role === "user" || m.role === "assistant")
    && typeof m.content === "string"
    && m.content.trim().length > 0
    && m.content.length <= MAX_MESSAGE_LENGTH;
}

function sseEvent(payload: Record<string, unknown>): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(payload)}\n\n`);
}

interface ModelProvider {
  name: "anthropic" | "gateway";
  apiKey: string;
  model: string;
}

function getProvider(): ModelProvider | null {
  const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (anthropicKey) {
    return { name: "anthropic", apiKey: anthropicKey, model: Deno.env.get("ANTHROPIC_MODEL") || "claude-sonnet-4-20250514" };
  }
  const gatewayKey = Deno.env.get("VERCEL_AI_GATEWAY_KEY");
  if (gatewayKey) {
    return { name: "gateway", apiKey: gatewayKey, model: Deno.env.get("AI_GATEWAY_MODEL") || "anthropic/claude-sonnet-4-20250514" };
  }
  return null;
}

// Streams text deltas from the chosen provider, invoking onDelta for each chunk.
async function streamCompletion(
  provider: ModelProvider,
  system: string,
  messages: ChatMessage[],
  onDelta: (chunk: string) => void,
): Promise<string> {
  let fullText = "";

  if (provider.name === "anthropic") {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": provider.apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({ model: provider.model, max_tokens: 1024, system, messages, stream: true }),
    });
    if (!response.ok || !response.body) {
      const errText = await response.text().catch(() => "");
      throw new Error(`Anthropic request failed: ${response.status} ${errText}`);
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const chunks = buffer.split("\n\n");
      buffer = chunks.pop() ?? "";
      for (const chunk of chunks) {
        const dataLine = chunk.split("\n").find((l) => l.startsWith("data:"));
        if (!dataLine) continue;
        try {
          const evt = JSON.parse(dataLine.slice(5).trim());
          if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") {
            fullText += evt.delta.text;
            onDelta(evt.delta.text);
          }
        } catch {
          // ignore malformed/partial SSE fragment
        }
      }
    }
    return fullText;
  }

  // Vercel AI Gateway - OpenAI-compatible chat completions endpoint.
  const response = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${provider.apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      model: provider.model,
      max_tokens: 1024,
      stream: true,
      messages: [{ role: "system", content: system }, ...messages],
    }),
  });
  if (!response.ok || !response.body) {
    const errText = await response.text().catch(() => "");
    throw new Error(`AI Gateway request failed: ${response.status} ${errText}`);
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() ?? "";
    for (const chunk of chunks) {
      const dataLine = chunk.split("\n").find((l) => l.startsWith("data:"));
      if (!dataLine) continue;
      const raw = dataLine.slice(5).trim();
      if (raw === "[DONE]") continue;
      try {
        const evt = JSON.parse(raw);
        const delta = evt.choices?.[0]?.delta?.content;
        if (typeof delta === "string" && delta) {
          fullText += delta;
          onDelta(delta);
        }
      } catch {
        // ignore malformed/partial SSE fragment
      }
    }
  }
  return fullText;
}

async function callOnce(provider: ModelProvider, system: string, userText: string): Promise<string> {
  if (provider.name === "anthropic") {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": provider.apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: provider.model,
        max_tokens: 150,
        system,
        messages: [{ role: "user", content: userText }],
      }),
    });
    if (!response.ok) return "";
    const result = await response.json();
    return result?.content?.find((b: { type?: string }) => b.type === "text")?.text?.trim() ?? "";
  }

  const response = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${provider.apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      model: provider.model,
      max_tokens: 150,
      messages: [{ role: "system", content: system }, { role: "user", content: userText }],
    }),
  });
  if (!response.ok) return "";
  const result = await response.json();
  return result?.choices?.[0]?.message?.content?.trim() ?? "";
}

async function persistHistory(
  userId: string,
  hubType: string,
  sessionId: string,
  messages: ChatMessage[],
  reviewed: boolean,
) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return;

  const client = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const searchableText = messages.map((m) => m.content).join(" ").slice(0, 8000);

  const { data: existing } = await client
    .from("ai_chat_history")
    .select("id")
    .eq("user_id", userId)
    .eq("session_id", sessionId)
    .maybeSingle();

  if (existing?.id) {
    await client
      .from("ai_chat_history")
      .update({ messages, searchable_text: searchableText, metadata: { reviewed }, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
  } else {
    await client.from("ai_chat_history").insert({
      user_id: userId,
      hub_type: hubType,
      session_id: sessionId,
      messages,
      searchable_text: searchableText,
      metadata: { reviewed },
    });
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let payload: { messages?: unknown; hub_type?: unknown; session_id?: unknown };
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const messages = payload.messages;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES || !messages.every(isMessage)) {
    return new Response(JSON.stringify({ error: "Provide between 1 and 20 valid user or assistant messages." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const provider = getProvider();
  if (!provider) {
    return new Response(JSON.stringify({ error: "AI chat is not configured. Please contact support." }), {
      status: 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const requestedHub = typeof payload.hub_type === "string" ? payload.hub_type : undefined;
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const hubType = routeHub(requestedHub, lastUserMessage);
  const system = HUB_PROMPTS[hubType] + SAFETY_SUFFIX;
  const sessionId = typeof payload.session_id === "string" && payload.session_id ? payload.session_id : crypto.randomUUID();

  // Resolve the caller (optional - chat still works signed-out, we just skip history persistence).
  let userId: string | null = null;
  const authHeader = req.headers.get("Authorization");
  if (authHeader) {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (supabaseUrl && serviceKey) {
      const authClient = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
      const { data } = await authClient.auth.getUser(authHeader.replace("Bearer ", ""));
      userId = data?.user?.id ?? null;
    }
  }

  const stream = new ReadableStream({
    async start(controller) {
      let fullText = "";
      try {
        fullText = await streamCompletion(provider, system, messages, (chunk) => {
          controller.enqueue(sseEvent({ delta: chunk }));
        });

        let reviewed = false;
        if (fullText.trim() && needsReview(fullText)) {
          const reviewerSystem =
            "You are a legal-accuracy reviewer. Given a draft answer from another AI assistant, reply with exactly " +
            "'OK' if it is accurate and appropriately hedged, or otherwise a corrective note under 60 words " +
            "flagging overconfident claims, missing disclaimers, or inaccuracies. Do not repeat the whole answer.";
          const note = await callOnce(provider, reviewerSystem, fullText);
          reviewed = true;
          if (note && !/^ok\.?$/i.test(note.trim())) {
            controller.enqueue(sseEvent({ reviewer_note: note }));
          }
        }

        controller.enqueue(sseEvent({ done: true, hub_type: hubType, session_id: sessionId, reviewed }));
      } catch (error) {
        console.error("legal-chat pipeline failed", error);
        controller.enqueue(sseEvent({ error: "The AI service could not complete this request. Please try again later." }));
      } finally {
        if (userId && fullText.trim()) {
          const finalMessages: ChatMessage[] = [...messages, { role: "assistant", content: fullText }];
          try {
            await persistHistory(userId, hubType, sessionId, finalMessages, needsReview(fullText));
          } catch (error) {
            console.error("legal-chat history persistence failed", error);
          }
        }
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
});
