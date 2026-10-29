import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

import { getAnthropicKey } from "../_shared/anthropic-key.ts";
import { consumePaidAIQuota, hasPaidAIQuota } from "../_shared/paid-ai-access.ts";
import { answerFromKnowledge, groundingNotes, needsSemanticMatch, detectState, isEmergency } from "../_shared/legal-knowledge.ts";
import { TOPIC_EMBEDDINGS } from "../_shared/legal-topic-embeddings.ts";
import { buildGroundedSystem, callFreeModel, FREE_AI_FOOTER, getFreeProviders } from "../_shared/free-ai.ts";
import { callGemini, composeAnswer, getGeminiConfig } from "../_shared/gemini.ts";
import { leeSystemPrompt, personaFor } from "../_shared/lee-personas.ts";
import { checkFreeQuestion, freeQuestionLimit } from "../_shared/free-question-gate.ts";

// Supabase Edge Runtime built-in AI (free, no API key). Undefined outside Supabase.
// deno-lint-ignore no-explicit-any
declare const Supabase: any;
// deno-lint-ignore no-explicit-any
let embeddingSession: any = null;
async function embedText(text: string): Promise<number[] | null> {
  try {
    if (typeof Supabase === "undefined" || !Supabase?.ai?.Session) return null;
    embeddingSession ??= new Supabase.ai.Session("gte-small");
    const output = await embeddingSession.run(text.slice(0, 2000), { mean_pool: true, normalize: true });
    return Array.from(output as ArrayLike<number>);
  } catch (error) {
    console.warn("built-in embedding unavailable", error instanceof Error ? error.message : error);
    return null;
  }
}
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 6_000;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const HUB_PROMPTS: Record<string, string> = {
  general:
    "You are Lee, an AI legal-information assistant for LegallyAI Nexus. " +
    "Provide clear, practical legal information, not legal advice, and do not claim to be a lawyer. " +
    "Identify the user's state or country when relevant and note where rules differ by jurisdiction. " +
    "Explain the issue, key deadlines or documents to locate, practical next steps, and what to verify with the relevant court or government agency. " +
    "Do not invent laws, citations, filing requirements, prices, or deadlines. State uncertainty clearly.",
  custody:
    "You are CustodiAI, an expert AI assistant for child custody matters. Help users understand custody types, " +
    "parental rights, parenting plans and schedules, child support basics, and court preparation. " +
    "Ask for or acknowledge the state/country, identify time-sensitive deadlines and documents, and suggest official court or child-support resources. " +
    "Reference any uploaded-document context the user provides.",
  parole:
    "You are RehabilitAI (also called ProbAI), a compassionate AI assistant helping people navigate probation, parole, " +
    "and reentry after incarceration. Cover compliance and modification requests, rights while supervised, reentry " +
    "resources, and support for family members helping a loved one. Be empathetic and non-judgmental. " +
    "Identify jurisdiction-specific reporting requirements and direct users to their supervising officer or official agency for verification.",
  defense:
    "You are Defendr, an AI legal assistant specializing in traffic tickets and criminal defense guidance. " +
    "Explain charges, potential defense strategies, court procedures, and rights in plain language. Help users " +
    "organize evidence and understand documents like tickets, citations, and police reports. Be non-judgmental. " +
    "Identify the state/country, response deadlines, court contact information, and when to consult a licensed defense attorney immediately.",
  workplace:
    "You are WorkplaceAI, an AI assistant specializing in employment law and worker rights (discrimination, " +
    "harassment, wage and hour, FMLA, OSHA safety, wrongful termination). Guide users on filing complaints with " +
    "EEOC/DOL/OSHA and help them document workplace issues properly. " +
    "Identify the state/country, applicable agency, filing deadlines, and records the user should preserve.",
  probono:
    "You are ProBonoAI. For attorneys, help them find pro bono opportunities and understand IRS rules for " +
    "deducting pro bono-related expenses (mileage, out-of-pocket costs - time/services are not deductible). " +
    "For people seeking help, explain eligibility for free legal aid, how to find local legal aid organizations, " +
    "and what to expect from volunteer representation.",
  support:
    "You are LegallyAI's customer support assistant. Help signed-in users navigate the product, troubleshoot " +
    "login and document-generation problems, and explain the published subscription and account settings. " +
    "Do not claim to inspect or change a user's account, process refunds, cancel subscriptions, reset passwords, " +
    "or access billing records. Direct users to Settings for subscription management or support@legallyai.ai " +
    "for account-specific help. Never request passwords, payment-card data, or confidential legal matter details. " +
    "Do not provide legal advice; direct legal questions to the legal-information assistant and link the user to /disclaimer. " +
    "If you are unsure, say so and give the support email rather than inventing product behavior.",
  marriage:
    "You are MaryAI, a general legal-information assistant for marriage and divorce topics. Explain common concepts, " +
    "help users prepare questions for an attorney, and avoid inventing jurisdiction-specific requirements or calculations. " +
    "Identify the state/country, residency or filing issues, key documents, and deadlines to verify with the local court.",
  lawyer:
    "You are Lawyer Assist, an AI workflow assistant for licensed attorneys, paralegals, and legal staff. " +
    "Help with case intake, issue spotting, jurisdiction and procedural checks, hearing preparation, client-question drafting, " +
    "and organizing facts, documents, and deadlines. Ask for the jurisdiction, matter type, procedural posture, key dates, " +
    "and client goals. Flag conflicts, missing facts, jurisdiction-specific requirements, and high-risk issues for attorney review. " +
    "Do not provide advice to clients without attorney review; do not invent statutes, citations, or filing requirements.",
};

const SAFETY_SUFFIX =
  " Encourage the user to consult a licensed attorney for advice, deadlines, filings, emergencies, or high-stakes " +
  "decisions. Do not request sensitive personal data beyond what is necessary for a general answer. " +
  "When jurisdiction is unknown, ask for the state or country before giving jurisdiction-specific guidance.";

const ROUTER_KEYWORDS: Record<string, string[]> = {
  custody: ["custody", "parenting plan", "child support", "visitation"],
  parole: ["parole", "probation", "reentry", "incarcerat"],
  defense: ["ticket", "citation", "dui", "dwi", "criminal charge", "arrest"],
  workplace: ["fired", "workplace", "harassment", "discrimination", "eeoc", "wage", "overtime"],
  probono: ["pro bono", "free legal", "legal aid"],
  lawyer: ["attorney", "lawyer", "hearing", "client", "case intake", "paralegal"],
};

function routeHub(requestedHub: string | undefined, lastUserMessage: string): string {
  if (requestedHub && HUB_PROMPTS[requestedHub]) return requestedHub;
  const text = lastUserMessage.toLowerCase();
  for (const [hub, keywords] of Object.entries(ROUTER_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) return hub;
  }
  return "general";
}

const REVIEW_TRIGGER = /\$\d|\bdeadline\b|\bstatute\b|\bv\.\s|\d{1,2}\/\d{1,2}\/\d{2,4}|\bcite|\bcase law\b|\bcode section\b/i;

function needsReview(draft: string): boolean {
  return draft.length > 400 || REVIEW_TRIGGER.test(draft);
}

function buildNoCostGuidance(hubType: string): string {
  if (hubType === "support") {
    return [
      "No-cost customer-support mode is active; no paid AI model was called.",
      "For sign-in help, use the sign-in page at /auth. For subscription settings, open Settings or visit /pricing.",
      "I can’t access accounts, reset passwords, process refunds, or change billing. For account-specific help, email support@legallyai.ai.",
      "Please don’t share passwords, payment-card details, or confidential legal matter information here.",
    ].join("\n\n");
  }

  return [
    "No-cost legal-information mode is active; no paid AI model was called. I can’t research or answer case-specific legal questions, predict an outcome, or confirm a deadline.",
    "For useful next steps, identify the state or country involved, write down important dates, and collect relevant documents without sharing confidential details here.",
    "Verify procedures and deadlines with the relevant court or government agency. In the U.S., you can find free legal-aid organizations at https://www.lsc.gov/find-legal-aid.",
    "Please avoid sharing names, case numbers, or confidential documents here. For advice about your situation, consult a licensed attorney.",
  ].join("\n\n");
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
  name: "anthropic";
  apiKey: string;
  model: string;
}

function getProvider(): ModelProvider | null {
  const anthropicKey = getAnthropicKey();
  if (anthropicKey) {
    return { name: "anthropic", apiKey: anthropicKey, model: Deno.env.get("ANTHROPIC_MODEL") || "claude-sonnet-4-20250514" };
  }
  return null;
}

async function streamCompletion(
  provider: ModelProvider,
  system: string,
  messages: ChatMessage[],
  onDelta: (chunk: string) => void,
): Promise<string> {
  let fullText = "";

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
  let sawMessageStop = false;

  const processChunk = (chunk: string) => {
    const dataLine = chunk.split("\n").find((line) => line.startsWith("data:"));
    if (!dataLine) return;
    let event: Record<string, any>;
    try {
      event = JSON.parse(dataLine.slice(5).trim());
    } catch {
      return;
    }
    if (event.type === "error") {
      throw new Error("Anthropic stream returned an error event.");
    }
    if (event.type === "message_stop") {
      sawMessageStop = true;
    }
    if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
      fullText += event.delta.text;
      onDelta(event.delta.text);
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() ?? "";
    for (const chunk of chunks) {
      processChunk(chunk);
    }
  }

  buffer += decoder.decode();
  if (buffer.trim()) processChunk(buffer);
  if (!sawMessageStop) throw new Error("Anthropic stream ended before completion.");

  return fullText;
}

async function callOnce(provider: ModelProvider, system: string, userText: string): Promise<string> {
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

  let payload: { messages?: unknown; hub_type?: unknown; session_id?: unknown; stream?: unknown };
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

  const requestedHub = typeof payload.hub_type === "string" ? payload.hub_type : undefined;
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const hubType = routeHub(requestedHub, lastUserMessage);
  const system = HUB_PROMPTS[hubType] + SAFETY_SUFFIX;
  const sessionId = typeof payload.session_id === "string" && payload.session_id ? payload.session_id : crypto.randomUUID();

  let userId: string | null = null;
  const authHeader = req.headers.get("Authorization");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (authToken && supabaseUrl && serviceKey) {
    const authClient = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { data } = await authClient.auth.getUser(authToken);
    userId = data?.user?.id ?? null;
  }

  if (hubType === "support" && !userId) {
    return new Response(JSON.stringify({ error: "Sign in to use AI customer support." }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Developer API: x-api-key header (subscription required; counted per key per day).
  const apiKey = req.headers.get("x-api-key");
  let apiUserId: string | null = null;
  if (apiKey && supabaseUrl && serviceKey) {
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const dailyLimit = Number(Deno.env.get("API_DAILY_LIMIT")) || 500;
    const { data, error } = await admin.rpc("use_api_key", { p_key: apiKey, p_daily_limit: dailyLimit });
    const row = Array.isArray(data) ? data[0] : data;
    if (error || !row) {
      return new Response(JSON.stringify({ error: "invalid_api_key", message: "API key is invalid or revoked." }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!row.allowed) {
      return new Response(JSON.stringify({ error: "api_limit_or_subscription", message: "Daily API limit reached or subscription inactive.", used_today: row.used_today, daily_limit: dailyLimit }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    apiUserId = row.user_id;
    userId = userId ?? apiUserId;
  }

  // Free-question limit (default 5) before sign-up / free trial.
  let gate: { used: number; limit: number; subscriber: boolean } | null = null;
  if (hubType !== "support" && supabaseUrl && serviceKey && !apiUserId) {
    const result = await checkFreeQuestion({ req, userId, supabaseUrl, serviceKey, limit: freeQuestionLimit(Deno.env) });
    if (!result.allowed) {
      return new Response(JSON.stringify({
        error: "free_limit_reached",
        message: userId
          ? `You've used your ${result.limit} free legal questions. Start your free trial to keep going.`
          : `You've used your ${result.limit} free legal questions. Create a free account to start your free trial.`,
        limit: result.limit,
        used: result.used,
        signed_in: !!userId,
      }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    gate = result;
  }

  const paidAIQuotaOptions = userId && authHeader && supabaseUrl && serviceKey
    ? {
        userId,
        authorization: authHeader,
        supabaseUrl,
        serviceRoleKey: serviceKey,
        anonKey: Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        reason: "legal_chat",
      }
    : null;
  let provider: ModelProvider | null = null;
  if (paidAIQuotaOptions && Deno.env.get("ENABLE_PAID_AI") === "true") {
    const configuredProvider = getProvider();
    if (configuredProvider && await hasPaidAIQuota(paidAIQuotaOptions)) {
      provider = configuredProvider;
    }
  }

  const stream = new ReadableStream({
    async start(controller) {
      let fullText = "";
      let reviewed = false;
      let completed = false;
      let engine = "paid";
      let paidUsed = false;
      try {
        if (provider) {
          // Paid model first; if it fails or quota cannot be recorded, fall back to the free path below
          // instead of failing the whole request.
          try {
            const paidText = await streamCompletion(provider, system, messages, () => {});
            if (paidText.trim() && paidAIQuotaOptions && await consumePaidAIQuota(paidAIQuotaOptions)) {
              fullText = paidText;
              paidUsed = true;
            } else {
              console.warn("legal-chat paid AI unavailable after completion; using free path");
            }
          } catch (error) {
            console.warn("legal-chat paid AI failed; using free path", error instanceof Error ? error.message : error);
          }
        }
        if (paidUsed) {
          // answered by the paid model
        } else if (hubType === "support") {
          fullText = buildNoCostGuidance(hubType);
        } else {
          // Free path. 1) Built-in Supabase AI understands everyday wording.
          const queryEmbedding = needsSemanticMatch(messages, hubType) ? await embedText(lastUserMessage) : null;
          const guide = answerFromKnowledge(messages, hubType, { queryEmbedding, topicEmbeddings: TOPIC_EMBEDDINGS });
          fullText = guide.text;
          engine = queryEmbedding ? "guide+embeddings" : "guide";
          const stateNameForAI = detectState(messages.filter((m) => m.role === "user").map((m) => m.content).join("\n"))?.name ?? null;
          // 2) Gemini with Google Search (if GEMINI_API_KEY is set): web sources, documents, videos.
          const gemini = getGeminiConfig(Deno.env);
          let answered = false;
          if (gemini && !guide.emergency && !isEmergency(lastUserMessage)) {
            const result = await callGemini(gemini, leeSystemPrompt(hubType, stateNameForAI, groundingNotes(guide.topics)), messages)
              .catch((error) => { console.warn("legal-chat gemini failed", error instanceof Error ? error.message : error); return null; });
            if (result) {
              const footer = `${personaFor(hubType).name} is LegallyAI's legal-information AI. This is general information, not legal advice, and it may contain mistakes. Check sources and deadlines with the court or agency.`;
              fullText = composeAnswer(result.text, result.sources, lastUserMessage, footer);
              engine = `gemini:${result.model}${result.searched ? "+search" : ""}`;
              answered = true;
            }
          }
          // 3) Optional other free generative model, grounded in the verified guide notes.
          const freeProviders = answered ? [] : getFreeProviders(Deno.env);
          if (freeProviders.length && !guide.emergency && !isEmergency(lastUserMessage)) {
            const stateName = detectState(messages.filter((m) => m.role === "user").map((m) => m.content).join("\n"))?.name ?? null;
            const freeSystem = buildGroundedSystem(system, groundingNotes(guide.topics), stateName);
            const result = await callFreeModel(freeProviders, freeSystem, messages)
              .catch((error) => { console.warn("legal-chat free model failed", error instanceof Error ? error.message : error); return null; });
            if (result) {
              fullText = `${result.text}\n\n---\n\n${FREE_AI_FOOTER}`;
              engine = `free-model:${result.provider}`;
            }
          }
        }

        if (!fullText.trim()) {
          fullText = "I couldn't put together an answer just now. Please rephrase your question or try again in a minute. " +
            "For anything urgent or with a deadline, contact the court clerk, a local legal aid office, or a licensed attorney.";
          engine = "fallback";
        }
        controller.enqueue(sseEvent({ delta: fullText }));
        completed = true;

        if (paidUsed && provider && fullText.trim() && needsReview(fullText)) {
          const reviewerSystem =
            "You are a legal-accuracy reviewer. Given a draft answer from another AI assistant, reply with exactly " +
            "'OK' if it is accurate and appropriately hedged, or otherwise a corrective note under 60 words " +
            "flagging overconfident claims, missing disclaimers, or inaccuracies. Do not repeat the whole answer.";
          const note = await callOnce(provider, reviewerSystem, fullText);
          reviewed = Boolean(note);
          if (note && !/^ok\.?$/i.test(note.trim())) {
            controller.enqueue(sseEvent({ reviewer_note: note }));
          }
        }

        controller.enqueue(sseEvent({
          done: true,
          hub_type: hubType,
          session_id: sessionId,
          reviewed,
          mode: paidUsed ? "paid" : hubType === "support" ? "no-cost" : "in-house",
          engine: paidUsed ? "paid" : hubType === "support" ? "no-cost" : engine,
          persona: personaFor(hubType).name,
          free_questions: gate && !gate.subscriber ? { used: gate.used, limit: gate.limit } : null,
        }));
      } catch (error) {
        console.error("legal-chat pipeline failed", error);
        controller.enqueue(sseEvent({ error: "The AI service could not complete this request. Please try again later." }));
      } finally {
        if (completed && userId && fullText.trim()) {
          const finalMessages: ChatMessage[] = [...messages, { role: "assistant", content: fullText }];
          try {
            await persistHistory(userId, hubType, sessionId, finalMessages, reviewed);
          } catch (error) {
            console.error("legal-chat history persistence failed", error);
          }
        }
        controller.close();
      }
    },
  });

  // Developer API and non-streaming clients: collect the stream into one JSON reply.
  if (apiUserId || payload.stream === false) {
    const decoder = new TextDecoder();
    let buffer = "";
    let answer = "";
    let done: Record<string, unknown> = {};
    const reader = stream.getReader();
    while (true) {
      const { value, done: finished } = await reader.read();
      if (finished) break;
      buffer += decoder.decode(value, { stream: true });
      for (const line of buffer.split("\n\n").slice(0, -1)) {
        if (!line.startsWith("data: ")) continue;
        let event: Record<string, unknown>;
        try { event = JSON.parse(line.slice(6)); } catch { continue; }
        if (typeof event.delta === "string") answer += event.delta;
        if (event.done) done = event;
        if (typeof event.error === "string") return new Response(JSON.stringify({ error: event.error }), { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      // Keep any partial event; lastIndexOf returns -1 when no complete event arrived yet.
      const cut = buffer.lastIndexOf("\n\n");
      if (cut >= 0) buffer = buffer.slice(cut + 2);
    }
    return new Response(JSON.stringify({ answer, hub_type: hubType, session_id: sessionId, persona: done.persona ?? personaFor(hubType).name, mode: done.mode ?? null, engine: done.engine ?? null, free_questions: done.free_questions ?? null }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
});
