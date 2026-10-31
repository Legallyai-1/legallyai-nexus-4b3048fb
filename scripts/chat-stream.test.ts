import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  streamAnthropicCompletion, legalNoticeSuffix, LEGAL_INFORMATION_NOTICE,
} from "../supabase/functions/_shared/chat-stream.ts";

const event = (payload: unknown) => `data: ${JSON.stringify(payload)}\n\n`;
const delta = (text: string) => event({ type: "content_block_delta", delta: { type: "text_delta", text } });
const stop = event({ type: "message_stop" });
const options = {
  provider: { apiKey: "isolated-test-key", model: "test-model" },
  system: "test", messages: [{ role: "user" as const, content: "test" }],
};
const responseFrom = (text: string, chunkSize = 3) => {
  const bytes = new TextEncoder().encode(text);
  return new Response(new ReadableStream<Uint8Array>({
    start(controller) {
      for (let i = 0; i < bytes.length; i += chunkSize) controller.enqueue(bytes.slice(i, i + chunkSize));
      controller.close();
    },
  }));
};

test("streams UTF-8 deltas exactly once with fragmented CRLF and ping events", async () => {
  const chunks: string[] = [];
  const text = (event({ type: "ping" }) + delta("Résumé ") + delta("information") + stop).replaceAll("\n", "\r\n");
  const answer = await streamAnthropicCompletion({
    ...options, onDelta: (s) => chunks.push(s), fetcher: async () => responseFrom(text, 1),
  });
  assert.equal(answer, "Résumé information");
  assert.deepEqual(chunks, ["Résumé ", "information"]);
});

test("delivers first token before upstream completion", async () => {
  let upstream: ReadableStreamDefaultController<Uint8Array> | undefined;
  let firstToken: (() => void) | undefined;
  const first = new Promise<void>((resolve) => { firstToken = resolve; });
  const completion = streamAnthropicCompletion({
    ...options, onDelta: () => firstToken?.(),
    fetcher: async () => new Response(new ReadableStream<Uint8Array>({
      start(controller) { upstream = controller; controller.enqueue(new TextEncoder().encode(delta("First"))); },
    })),
  });
  await first;
  upstream?.enqueue(new TextEncoder().encode(stop));
  upstream?.close();
  assert.equal(await completion, "First");
});

test("rejects truncated and empty successful streams", async () => {
  for (const text of [delta("Partial"), stop]) {
    await assert.rejects(streamAnthropicCompletion({
      ...options, onDelta: () => undefined, fetcher: async () => responseFrom(text),
    }), /before completion|empty response/);
  }
});

test("in-band errors fail without exposing provider details", async () => {
  await assert.rejects(streamAnthropicCompletion({
    ...options, onDelta: () => undefined,
    fetcher: async () => responseFrom(event({ type: "error", error: { message: "private-prompt" } })),
  }), (error: unknown) => error instanceof Error && !error.message.includes("private-prompt"));
});

test("validates JSON and text-delta shape", async () => {
  for (const text of ["data: not-json\n\n", event({ type: "content_block_delta", delta: { type: "text_delta", text: 5 } })]) {
    await assert.rejects(streamAnthropicCompletion({
      ...options, onDelta: () => undefined, fetcher: async () => responseFrom(text),
    }), /malformed|invalid/);
  }
});

test("HTTP errors never include upstream body or key", async () => {
  await assert.rejects(streamAnthropicCompletion({
    ...options, onDelta: () => undefined, fetcher: async () => new Response("secret-body", { status: 429 }),
  }), { message: "AI provider returned HTTP 429." });
});

test("forwards cancellation and sets a timeout signal", async () => {
  const abort = new AbortController();
  abort.abort();
  await assert.rejects(streamAnthropicCompletion({
    ...options, signal: abort.signal, onDelta: () => undefined,
    fetcher: async (_url, init) => {
      assert.equal(init?.signal?.aborted, true);
      throw new DOMException("Aborted", "AbortError");
    },
  }), { name: "AbortError" });
});

test("legal notice is appended once for every answer", () => {
  const answer = "General information";
  assert.equal(legalNoticeSuffix(answer), `\n\n---\n\n${LEGAL_INFORMATION_NOTICE}`);
  assert.equal(legalNoticeSuffix(answer + legalNoticeSuffix(answer)), "");
});

test("legal chat confirms quota before streaming and attaches notice before done", () => {
  const source = readFileSync("supabase/functions/legal-chat/index.ts", "utf8");
  assert.ok(source.indexOf("await consumePaidAIQuota(paidAIQuotaOptions)") < source.indexOf("await streamAnthropicCompletion({"));
  assert.match(source, /onDelta:\s*\(chunk\)\s*=>/);
  assert.ok(source.indexOf("legalNoticeSuffix(fullText)") < source.indexOf("done: true"));
  assert.match(source, /if \(!paidStreamed\) controller\.enqueue/);
  assert.doesNotMatch(source, /streamCompletion\(provider, system, messages, \(\) => \{\}\)/);
});
