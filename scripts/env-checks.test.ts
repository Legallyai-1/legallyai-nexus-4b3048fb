import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { checkClientEnv, checkDeploymentEnv } from './env-checks.ts';

test('client checks accept the repo variables as GitHub stores them (trailing newline)', () => {
  const r = checkClientEnv({ VITE_SUPABASE_URL: 'https://whdljtbtqisoszbrzdwq.supabase.co\n', VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_x', VITE_ENABLE_PAYMENTS: 'true' });
  assert.deepEqual(r.errors, []);
});

test('missing optional client values only warn; malformed values fail', () => {
  assert.deepEqual(checkClientEnv({}).errors, []);
  assert.ok(checkClientEnv({}).warnings.length >= 3);
  assert.equal(checkClientEnv({ VITE_SUPABASE_URL: 'http://x.supabase.co' }).errors.length, 1);
  assert.equal(checkClientEnv({ VITE_ENABLE_PAYMENTS: 'yes' }).errors.length, 1);
});

test('deployment checks require only the Vercel token and validate a set project id', () => {
  assert.deepEqual(checkDeploymentEnv({ VERCEL_TOKEN: 't' }).errors, []);
  assert.equal(checkDeploymentEnv({}).errors.length, 1);
  assert.deepEqual(checkDeploymentEnv({ VERCEL_TOKEN: 't', VERCEL_PROJECT_ID: 'prj_KSzIDIhU2EzZo8Fr24KQOMogqEmZ\n' }).errors, []);
  assert.equal(checkDeploymentEnv({ VERCEL_TOKEN: 't', VERCEL_PROJECT_ID: 'my project' }).errors.length, 1);
});

test('workflow never forces payments off and falls back to the known project id', () => {
  const wf = readFileSync(new URL('../.github/workflows/vercel-deploy.yml', import.meta.url), 'utf8');
  assert.ok(!/VITE_ENABLE_PAYMENTS[^\n]*\|\|\s*'false'/.test(wf), 'no false default for payments');
  assert.ok(wf.includes("|| 'prj_KSzIDIhU2EzZo8Fr24KQOMogqEmZ'"));
  assert.ok(!wf.includes('.env.validation'));
  for (const f of ['validate-env.ts', 'validate-secrets.ts']) {
    assert.ok(!readFileSync(new URL(`./${f}`, import.meta.url), 'utf8').includes('.env.validation'), f);
  }
});
