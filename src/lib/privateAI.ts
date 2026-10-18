// Private AI: an open-source model (Llama 3.2 1B) that runs entirely in the visitor's
// browser with WebGPU through WebLLM. No API key, no server cost, and the question
// never leaves the device for this step. It rewrites LegallyAI's verified guide answer
// into a direct reply to the user's question.
import type { MLCEngineInterface, InitProgressReport } from "@mlc-ai/web-llm";

export const PRIVATE_AI_MODEL_F16 = "Llama-3.2-1B-Instruct-q4f16_1-MLC";
export const PRIVATE_AI_MODEL_F32 = "Llama-3.2-1B-Instruct-q4f32_1-MLC";
export const PRIVATE_AI_LABEL = "Llama 3.2 1B (open source, runs on your device)";
export const PRIVATE_AI_STORAGE_KEY = "legallyai.privateAI.enabled";

type GPUNavigator = Navigator & { gpu?: { requestAdapter(): Promise<{ features: Set<string> } | null> } };

export async function detectWebGPU(): Promise<{ supported: boolean; f16: boolean }> {
  try {
    const gpu = typeof navigator !== "undefined" ? (navigator as GPUNavigator).gpu : undefined;
    if (!gpu) return { supported: false, f16: false };
    const adapter = await gpu.requestAdapter();
    if (!adapter) return { supported: false, f16: false };
    return { supported: true, f16: adapter.features.has("shader-f16") };
  } catch {
    return { supported: false, f16: false };
  }
}

let enginePromise: Promise<MLCEngineInterface> | null = null;

export function loadPrivateAI(onProgress: (progress: number, text: string) => void): Promise<MLCEngineInterface> {
  if (!enginePromise) {
    enginePromise = (async () => {
      const { f16 } = await detectWebGPU();
      const webllm = await import("@mlc-ai/web-llm");
      return webllm.CreateMLCEngine(f16 ? PRIVATE_AI_MODEL_F16 : PRIVATE_AI_MODEL_F32, {
        initProgressCallback: (report: InitProgressReport) => onProgress(report.progress, report.text),
      });
    })().catch((error) => {
      enginePromise = null;
      throw error;
    });
  }
  return enginePromise;
}

const LINK = /\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/g;
const FOOTER_START = /\n-{3,}\n|This is general legal information from LegallyAI/;

export function extractLinks(markdown: string): { label: string; url: string }[] {
  const seen = new Set<string>();
  const links: { label: string; url: string }[] = [];
  for (const match of markdown.matchAll(LINK)) {
    if (seen.has(match[2])) continue;
    seen.add(match[2]);
    links.push({ label: match[1], url: match[2] });
  }
  return links;
}

export function isCrisisAnswer(guideText: string): boolean {
  return /call 911 now|988 Suicide/i.test(guideText);
}

export function isNoMatchAnswer(guideText: string): boolean {
  return /could not match your question/i.test(guideText);
}

export function buildPrivatePrompt(question: string, guideText: string): { system: string; user: string } {
  const notes = guideText.split(FOOTER_START)[0].trim();
  const system = [
    "You are LegallyAI's private legal-information assistant. You are not a lawyer and do not give legal advice.",
    "Answer the user's question directly in plain English, in under 220 words, using short Markdown headings or numbered steps.",
    "Use ONLY facts from the VERIFIED GUIDE below. Do not invent laws, statute numbers, case names, fees, or deadlines.",
    "If the guide does not answer part of the question, say so and suggest the official resources or a licensed attorney.",
    "Do not include links; official links are added after your answer.",
    "",
    "VERIFIED GUIDE:",
    notes,
  ].join("\n");
  return { system, user: question };
}

export function finalizePrivateAnswer(modelText: string, guideText: string): string {
  const links = extractLinks(guideText);
  const parts = [modelText.trim()];
  if (links.length) parts.push("### Official resources", links.map((l) => `- [${l.label}](${l.url})`).join("\n"));
  parts.push(
    "---",
    `Written on your device by ${PRIVATE_AI_LABEL} from LegallyAI's verified legal guide. General legal information only, not legal advice, and it may contain mistakes. Verify deadlines with the court or agency.`,
  );
  return parts.join("\n\n");
}

export async function generatePrivateAnswer(
  engine: MLCEngineInterface,
  question: string,
  guideText: string,
  onDelta: (textSoFar: string) => void,
  signal?: AbortSignal,
): Promise<string | null> {
  if (isCrisisAnswer(guideText) || isNoMatchAnswer(guideText)) return null;
  const { system, user } = buildPrivatePrompt(question, guideText);
  const chunks = await engine.chat.completions.create({
    messages: [{ role: "system", content: system }, { role: "user", content: user }],
    temperature: 0.2,
    max_tokens: 450,
    stream: true,
  });
  let text = "";
  for await (const chunk of chunks) {
    if (signal?.aborted) {
      await engine.interruptGenerate();
      return null;
    }
    text += chunk.choices[0]?.delta?.content ?? "";
    onDelta(text);
  }
  return text.trim() ? finalizePrivateAnswer(text, guideText) : null;
}
