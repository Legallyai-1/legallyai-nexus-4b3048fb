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
    "You are LegallyAI's legal-information assistant. You are not a lawyer.",
    "Write a SHORT ANSWER of 2 to 4 plain-English sentences that speaks directly to the user's situation, using ONLY facts stated in the GUIDE.",
    "Never mention statute numbers, code sections, case names, dollar amounts, or day counts. Never include links or URLs.",
    "If the GUIDE does not answer the question, say that the rules depend on the state and the details, and recommend the resources below or a licensed attorney.",
    "Output only the short answer, with no headings and no lists.",
    "",
    "GUIDE:",
    notes,
  ].join("\n");
  return { system, user: question };
}

// Removes sentences containing likely-invented legal specifics that the guide does not contain.
const RISKY = /(\bsection\b|§|\bcode\b|\bstatute\b|\bu\.s\.c\b|\bv\.\s|https?:\/\/|www\.|\$\s?\d|\b\d+\b)/i;
export function filterUnverified(modelText: string, guideText: string): string {
  const guideLower = guideText.toLowerCase();
  const sentences = modelText.replace(/\s+/g, " ").trim().split(/(?<=[.!?])\s+/).filter(Boolean);
  const kept = sentences.filter((sentence) => {
    const match = sentence.match(RISKY);
    if (!match) return true;
    return guideLower.includes(sentence.trim().toLowerCase());
  });
  return kept.join(" ").replace(/\s+/g, " ").trim();
}

export function finalizePrivateAnswer(modelText: string, guideText: string): string {
  const shortAnswer = filterUnverified(modelText, guideText);
  if (!shortAnswer) return guideText;
  return [
    "### Short answer",
    shortAnswer,
    `This short answer was written on your device by ${PRIVATE_AI_LABEL} and may contain mistakes. The details below are from LegallyAI's verified legal guide.`,
    "---",
    guideText,
  ].join("\n\n");
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
    max_tokens: 180,
    stream: true,
  });
  // Show the verified guide right away; never stream unfiltered model text.
  onDelta(`Writing a short answer on your device…\n\n---\n\n${guideText}`);
  let text = "";
  for await (const chunk of chunks) {
    if (signal?.aborted) {
      await engine.interruptGenerate();
      return null;
    }
    text += chunk.choices[0]?.delta?.content ?? "";
  }
  return text.trim() ? finalizePrivateAnswer(text, guideText) : null;
}
