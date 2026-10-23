// Gemini connector for LegallyAI with optional Google Search grounding.
// Secret: GEMINI_API_KEY (Supabase Edge Function secret). Optional: GEMINI_MODEL.
// If web search is not available on the key's plan, it retries without search,
// and the caller falls back to the in-house guide if Gemini fails entirely.

export interface WebSource { title: string; url: string }
export interface GeminiResult { text: string; sources: WebSource[]; searched: boolean; model: string }

type Env = { get(name: string): string | undefined };
type Msg = { role: "user" | "assistant"; content: string };

export function getGeminiConfig(env: Env): { apiKey: string; models: string[] } | null {
  // Accept the canonical name plus common dashboard spellings so a secret saved as "Gemini API Key" still works.
  const apiKey = ["GEMINI_API_KEY", "Gemini API Key", "GEMINI_KEY", "GOOGLE_AI_API_KEY", "GOOGLE_GENERATIVE_AI_API_KEY"]
    .map((name) => env.get(name)?.trim())
    .find((value) => value && value.length > 10);
  if (!apiKey) return null;
  const preferred = env.get("GEMINI_MODEL");
  // Current Gemini API model names (Oct 2026). Lite first: fast and within free-tier quota; 3.8 as a fallback.
  const models = [preferred, "gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-flash-lite-latest"].filter((m, i, a): m is string => !!m && a.indexOf(m) === i);
  return { apiKey, models };
}

export function parseGeminiResponse(data: unknown): { text: string; sources: WebSource[] } {
  // deno-lint-ignore no-explicit-any
  const candidate = (data as any)?.candidates?.[0];
  // deno-lint-ignore no-explicit-any
  const text = (candidate?.content?.parts ?? []).map((p: any) => (typeof p?.text === "string" ? p.text : "")).join("").trim();
  const seen = new Set<string>();
  const sources: WebSource[] = [];
  for (const chunk of candidate?.groundingMetadata?.groundingChunks ?? []) {
    const uri = chunk?.web?.uri;
    if (typeof uri !== "string" || !uri.startsWith("https://") || seen.has(uri)) continue;
    seen.add(uri);
    sources.push({ title: String(chunk.web.title || new URL(uri).hostname), url: uri });
  }
  return { text, sources: sources.slice(0, 8) };
}

export async function callGemini(
  config: { apiKey: string; models: string[] },
  system: string,
  messages: Msg[],
  fetchImpl: typeof fetch = fetch,
  timeoutMs = 20000,
): Promise<GeminiResult | null> {
  const contents = messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
  // Google Search grounding needs a billed Gemini project; on the free tier it returns 429. Once we see that,
  // stop requesting search for the rest of this call so the user is not kept waiting.
  let searchAvailable = true;
  for (const model of config.models) {
    for (const search of [true, false]) {
      if (search && !searchAvailable) continue;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetchImpl(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
          method: "POST",
          signal: controller.signal,
          headers: { "Content-Type": "application/json", "x-goog-api-key": config.apiKey },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: system }] },
            contents,
            ...(search ? { tools: [{ google_search: {} }] } : {}),
            generationConfig: { temperature: 0.3, maxOutputTokens: 1500 },
          }),
        });
        if (!response.ok) {
          console.warn(`gemini ${model} search=${search} status ${response.status}`);
          if (response.status === 404) break; // model not available: try next model
          if (response.status === 429 && search) searchAvailable = false; // grounding quota exhausted (free tier)
          continue;
        }
        const parsed = parseGeminiResponse(await response.json());
        if (parsed.text) return { ...parsed, searched: search, model };
      } catch (error) {
        console.warn(`gemini ${model} failed`, error instanceof Error ? error.message : error);
      } finally {
        clearTimeout(timer);
      }
    }
  }
  return null;
}

export function searchLinks(question: string): WebSource[] {
  const q = encodeURIComponent(question.slice(0, 200));
  return [
    { title: "Search the web for this question", url: `https://www.google.com/search?q=${q}` },
    { title: "Find explainer videos on YouTube", url: `https://www.youtube.com/results?search_query=${q}` },
  ];
}

export function composeAnswer(text: string, sources: WebSource[], question: string, footer: string): string {
  const parts = [text.trim()];
  if (sources.length) parts.push("### Sources", sources.map((s) => `- [${s.title.replace(/[[\]]/g, "")}](${s.url})`).join("\n"));
  parts.push("### Keep researching", searchLinks(question).map((s) => `- [${s.title}](${s.url})`).join("\n"));
  parts.push("---", footer);
  return parts.join("\n\n");
}
