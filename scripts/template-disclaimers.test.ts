import test from 'node:test';
import assert from 'node:assert/strict';
import { TEMPLATE_DISCLAIMER, getTemplateNotices, withTemplateNotices } from '../src/lib/template-disclaimers.ts';

test('every template gets the general disclaimer', () => {
  for (const id of ['1', '2', '5', '8', '14', '15', '17']) assert.equal(getTemplateNotices(id)[0], TEMPLATE_DISCLAIMER);
});

test('high-risk templates get specific notes', () => {
  assert.match(getTemplateNotices('8')[1], /approved by a court/);
  assert.match(getTemplateNotices('5')[1], /Security deposit/);
  assert.match(getTemplateNotices('14')[1], /witness and notarization/);
  assert.match(getTemplateNotices('15')[1], /witness and notarization/);
  assert.equal(getTemplateNotices('1').length, 2);
});

test('downloaded files start with the notice', () => {
  const file = withTemplateNotices('8', 'CHILD CUSTODY AGREEMENT');
  assert.ok(file.startsWith(`IMPORTANT: ${TEMPLATE_DISCLAIMER}`));
  assert.ok(file.endsWith('CHILD CUSTODY AGREEMENT'));
});
