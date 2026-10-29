import test from 'node:test';
import assert from 'node:assert/strict';
import { errorMessage, NoRowsAffectedError, requireAffectedRows } from '../src/lib/mutationResult.ts';

test('requireAffectedRows passes through affected rows', () => {
  assert.deepEqual(requireAffectedRows([{ id: 'a' }], 'deleted'), [{ id: 'a' }]);
});

test('requireAffectedRows rejects silent RLS no-ops', () => {
  assert.throws(() => requireAffectedRows([], 'deleted'), NoRowsAffectedError);
  assert.throws(() => requireAffectedRows(null, 'updated'), /Nothing was updated/);
});

test('errorMessage reads Error, PostgREST objects, and falls back', () => {
  assert.equal(errorMessage(new Error('boom'), 'x'), 'boom');
  assert.equal(errorMessage({ message: 'row-level security' }, 'x'), 'row-level security');
  assert.equal(errorMessage('weird', 'fallback'), 'fallback');
});
