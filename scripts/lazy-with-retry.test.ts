import test from 'node:test';
import assert from 'node:assert/strict';
import { isChunkLoadError, loadWithRetry } from '../src/lib/lazyWithRetry.ts';

const pending = async (p: Promise<unknown>) =>
  (await Promise.race([p.then(() => 'settled', () => 'settled'), new Promise((r) => setTimeout(() => r('pending'), 30))]));

test('returns the module when the chunk loads', async () => {
  const mod = { default: () => null };
  assert.equal(await loadWithRetry(async () => mod), mod);
});

test('chunk error with reload started keeps loading instead of throwing', async () => {
  const p = loadWithRetry(async () => { throw new TypeError('Failed to fetch dynamically imported module: /assets/x.js'); }, () => true);
  assert.equal(await pending(p), 'pending');
});

test('chunk error when reload is not allowed is rethrown for the error boundary', async () => {
  await assert.rejects(loadWithRetry(async () => { throw new TypeError('Failed to fetch dynamically imported module'); }, () => false));
});

test('undefined module (preload error prevented) never reaches React as undefined', async () => {
  // No reload started in this process, so it must surface as a chunk error, not "reading 'default'".
  await assert.rejects(loadWithRetry(async () => undefined as never), (e) => isChunkLoadError(e));
});

test('non-chunk errors are rethrown', async () => {
  await assert.rejects(loadWithRetry(async () => { throw new Error('boom'); }, () => true), /boom/);
});
