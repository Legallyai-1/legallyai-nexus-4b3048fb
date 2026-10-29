// Generative AI providers for LegallyAI. Free providers are always tried first.
// Every provider here uses the OpenAI-compatible chat completions API.
// Configure any of these Supabase secrets; they are tried in this order and the first one that works is used:
//   GROQ_API_KEY        free plan, open-source models (default model: openai/gpt-oss-120b)
//   OPENROUTER_API_KEY  free ":free" model variants (set OPENROUTER_MODEL to a :free model)
//   FREE_AI_API_KEY + FREE_AI_BASE_URL + FREE_AI_MODEL  any other OpenAI-compatible endpoint
//   XAI_API_KEY / GROK_API_KEY  OPTIONAL PAID fallback (xAI Grok, billed per token; default model grok-3-mini).
//                       Only used when no free provider is configured or all free providers fail.
//                       Leave it unset to keep the chat at $0.
// If no key is set, or every provider fails or hits its daily limit, callers fall back
// to the in-house legal guide, so the chat keeps working at $0 without the paid xAI key.

export interface FreeProvider {
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
}

type Env = { get(name: string): string | undefined };

export function getFreeProviders(env: Env): FreeProvider[] {
  const providers: FreeProvider[] = [];
  const groq = env.get("GROQ_API_KEY");
  if (groq) {
    providers.push({ name: "groq", baseUrl: "https://api.groq.com/openai/v1", apiKey: groq, model: env.get("GROQ_MODEL") || "openai/gpt-oss-120b" });
  }
  const openrouter = env.get("OPENROUTER_API_KEY");
  const openrouterModel = env.get("OPENROUTER_MODEL");
  if (openrouter && openrouterModel) {
    providers.push({ name: "openrouter", baseUrl: "https://openrouter.ai/api/v1", apiKey: openrouter, model: openrouterModel });
  }
  const genericKey = env.get("FREE_AI_API_KEY");
  const genericUrl = env.get("FREE_AI_BASE_URL");
  const genericModel = env.get("FREE_AI_MODEL");
  if (genericKey && genericUrl && genericModel && genericUrl.startsWith("https://")) {
    providers.push({ name: "custom", baseUrl: genericUrl.replace(/\/+$/, ""), apiKey: genericKey, model: genericModel });
  }
  // xAI Grok is a paid API, so it is tried only after every free provider above.
  const xai = ["XAI_API_KEY", "GROK_API_KEY", "Grok API Key", "xAI API Key"]
    .map((name) => env.get(name)?.trim())
    .find((value) => value && value.length > 0);
  if (xai) {
    const xaiBase = (env.get("XAI_BASE_URL") || "https://api.x.ai/v1").replace(/\/+$/, "");
    if (xaiBase.startsWith("https://")) {
      providers.push({
        name: "xai",
        baseUrl: xaiBase,
        apiKey: xai,
        model: env.get("XAI_MODEL") || env.get("GROK_MODEL") || "grok-3-mini",
      });
    }
  }
  return providers;
}

export interface FreeChatResult {
  text: string;
  provider: string;
}

export async function callFreeModel(
  providers: FreeProvider[],
  system: string,
  messages: { role: "user" | "assistant"; content: string }[],
  fetchImpl: typeof fetch = fetch,
  timeoutMs = 25000,
): Promise<FreeChatResult | null> {
  for (const provider of providers) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(`${provider.baseUrl}/chat/completions`, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${provider.apiKey}`,
          ...(provider.name === "openrouter" ? { "HTTP-Referer": "https://www.legallyai.ai", "X-Title": "LegallyAI" } : {}),
        },
        body: JSON.stringify({
          model: provider.model,
          temperature: 0.2,
          max_tokens: 1200,
          messages: [{ role: "system", content: system }, ...messages],
        }),
      });
      if (!response.ok) {
        console.warn(`free-ai ${provider.name} returned ${response.status}`);
        continue;
      }
      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content;
      if (typeof text === "string" && text.trim()) return { text: text.trim(), provider: provider.name };
    } catch (error) {
      console.warn(`free-ai ${provider.name} failed`, error instanceof Error ? error.message : error);
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
}

export function buildGroundedSystem(baseSystem: string, notes: string, stateName: string | null): string {
  return [
    baseSystem,
    "",
    "You are LegallyAI's free legal-information assistant. Give clear, practical, plain-English general information.",
    "Rules: Do not invent statutes, case names, citations, fees, or deadlines. If you are not sure, say so and point to the official resource.",
    "Prefer the official resources in the verified notes below and include them as Markdown links. Use short headings and numbered steps.",
    "Never claim to be a lawyer or to create an attorney-client relationship. Recommend a licensed attorney for case-specific decisions.",
    stateName ? `The user appears to be in ${stateName}; mention that rules vary and point to ${stateName} official sources.` : "Ask which state the user is in if it matters.",
    notes ? `\nVERIFIED LEGALLYAI GUIDE NOTES:\n${notes}` : "",
  ].join("\n");
}

export const FREE_AI_FOOTER =
  "General legal information generated by a free AI model and grounded in LegallyAI's legal guide. It is not legal advice and may contain mistakes; verify deadlines with the court or agency, and avoid sharing names, case numbers, or confidential documents here.";
