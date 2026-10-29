import test from 'node:test';
import assert from 'node:assert/strict';
import { NO_ROLE_PATH, pathForRole } from '../src/lib/postLoginPath.ts';

test('users with no role land on the home page, not /ai-assistants', () => {
  assert.equal(NO_ROLE_PATH, '/');
  assert.equal(pathForRole(null), '/');
  assert.equal(pathForRole(undefined), '/');
  assert.equal(pathForRole(''), '/');
  assert.equal(pathForRole('unknown-role'), '/');
  assert.equal(pathForRole('toString'), '/');
});

test('known roles keep their hub', () => {
  for (const role of ['owner', 'admin', 'manager', 'lawyer', 'paralegal']) {
    assert.equal(pathForRole(role), '/dashboard');
  }
  assert.equal(pathForRole('employee'), '/employee');
  assert.equal(pathForRole('client'), '/client-portal');
});
