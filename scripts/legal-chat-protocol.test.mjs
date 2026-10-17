import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../src/lib/legalChatProtocol.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } });
const { prepareChatMessages, readLegalChatStream } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const event = value => `data: ${JSON.stringify(value)}\n\n`;
const finish = event({ done: true, mode: 'no-cost', reviewed: false });
function stream(text, bytesPerChunk = 7) {
  const bytes = new TextEncoder().encode(text);
  return new ReadableStream({ start(controller) {
    for (let index = 0; index < bytes.length; index += bytesPerChunk) controller.enqueue(bytes.slice(index, index + bytesPerChunk));
    controller.close();
  } });
}
const read = (text, size) => readLegalChatStream(stream(text, size), () => {});

test('retains a bounded history ending with the newest user message', () => {
  const history = Array.from({ length: 41 }, (_, i) => ({ role: i % 2 === 0 ? 'user' : 'assistant', content: String(i) }));
  const recent = prepareChatMessages(history);
  assert.ok(recent.length <= 20);
  assert.equal(recent[0].role, 'user');
  assert.equal(recent.at(-1).content, '40');
  assert.equal(history.length, 41);
});
test('rejects empty, oversized, and assistant-ended requests', () => {
  assert.throws(() => prepareChatMessages([]));
  assert.throws(() => prepareChatMessages([{ role: 'user', content: ' ' }]));
  assert.throws(() => prepareChatMessages([{ role: 'user', content: 'x'.repeat(6001) }]));
  assert.throws(() => prepareChatMessages([{ role: 'assistant', content: 'Hello' }]));
});
test('handles split UTF-8 and split CRLF delimiters', async () => {
  const result = await read((event({ delta: 'Legal ⚖ information' }) + finish).replaceAll('\n', '\r\n'), 1);
  assert.equal(result.text, 'Legal ⚖ information');
  assert.equal(result.mode, 'no-cost');
});
test('handles multiline data and a final event without a blank separator', async () => {
  const result = await read('data: {"delta":\ndata: "Hello"}\n\n' + finish.trimEnd());
  assert.equal(result.text, 'Hello');
});
test('delivers deltas and reviewer notes', async () => {
  const deltas = [], notes = [];
  const result = await readLegalChatStream(stream(': heartbeat\n\n' + event({ delta: 'Hello' }) + event({ reviewer_note: 'Verify locally.' }) + event({ done: true, mode: 'paid', reviewed: true })), value => deltas.push(value), value => notes.push(value));
  assert.deepEqual(deltas, ['Hello']);
  assert.deepEqual(notes, ['Verify locally.']);
  assert.equal(result.reviewed, true);
});
test('rejects interrupted, malformed, empty, and failed streams', async () => {
  await assert.rejects(read(event({ delta: 'Partial' })), /before completion/);
  await assert.rejects(read('data: invalid\n\n'), /unreadable/);
  await assert.rejects(read(finish), /empty response/);
  await assert.rejects(read(event({ error: 'Service unavailable' })), /Service unavailable/);
  await assert.rejects(read(event({ delta: 'Hello' }) + event({ done: true })), /completion mode/);
});
test('rejects content after completion', async () => {
  await assert.rejects(read(event({ delta: 'Hello' }) + finish + event({ delta: 'Extra' })), /after completion/);
});
