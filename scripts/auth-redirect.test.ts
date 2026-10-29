import test from 'node:test';
import assert from 'node:assert/strict';
import { buildInviteAcceptancePath, getInviteAcceptanceReturnTo } from '../src/lib/invite.ts';

const origin = 'https://www.legallyai.ai';

test('pricing return is accepted without starting a purchase', () => {
  assert.equal(getInviteAcceptanceReturnTo('/pricing', origin), '/pricing');
  assert.equal(getInviteAcceptanceReturnTo(`${origin}/pricing`, origin), '/pricing');
});

test('external origins are rejected', () => {
  assert.equal(getInviteAcceptanceReturnTo('https://example.com/pricing', origin), null);
  assert.equal(getInviteAcceptanceReturnTo('//example.com/pricing', origin), null);
});

test('non-web URL schemes are rejected', () => {
  assert.equal(getInviteAcceptanceReturnTo('javascript:alert(1)', origin), null);
  assert.equal(getInviteAcceptanceReturnTo('data:text/plain,hello', origin), null);
});

test('pricing query strings and fragments are rejected', () => {
  assert.equal(getInviteAcceptanceReturnTo('/pricing?checkout=true', origin), null);
  assert.equal(getInviteAcceptanceReturnTo('/pricing#checkout', origin), null);
});

test('invitation tokens are encoded and survive the validated return', () => {
  const path = buildInviteAcceptancePath('sample/token?value=1');
  assert.equal(path, '/accept-invite?token=sample%2Ftoken%3Fvalue%3D1');
  assert.equal(getInviteAcceptanceReturnTo(path, origin), path);
});

test('invitation destination without a token is rejected', () => {
  assert.equal(getInviteAcceptanceReturnTo('/accept-invite', origin), null);
});

test('missing and unrelated destinations are rejected', () => {
  assert.equal(getInviteAcceptanceReturnTo(null, origin), null);
  assert.equal(getInviteAcceptanceReturnTo('', origin), null);
  assert.equal(getInviteAcceptanceReturnTo('/dashboard', origin), null);
});

test('pricing return may preselect a known plan, nothing else', () => {
  assert.equal(getInviteAcceptanceReturnTo('/pricing?plan=firm', origin), '/pricing?plan=firm');
  assert.equal(getInviteAcceptanceReturnTo('/pricing?plan=premium', origin), '/pricing?plan=premium');
  assert.equal(getInviteAcceptanceReturnTo('/pricing?plan=enterprise', origin), '/pricing?plan=enterprise');
  assert.equal(getInviteAcceptanceReturnTo('/pricing?plan=solo', origin), '/pricing?plan=solo');
  assert.equal(getInviteAcceptanceReturnTo('/pricing?plan=free', origin), null);
  assert.equal(getInviteAcceptanceReturnTo('/pricing?plan=firm&checkout=true', origin), null);
  assert.equal(getInviteAcceptanceReturnTo('/pricing?plan=firm#x', origin), null);
});
