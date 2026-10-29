import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidAdSlot, resolveAdSlots } from '../src/lib/adSlots.ts';

test('only numeric AdSense unit ids are rendered', () => {
  assert.equal(isValidAdSlot('9777464779'), true);
  for (const bad of ['CASES_SIDEBAR_SLOT', 'DASHBOARD_SIDEBAR_SLOT', '', '  ', undefined, null, '12ab34567']) {
    assert.equal(isValidAdSlot(bad as string | undefined), false, String(bad));
  }
});

test('slot map: AI_ASSISTANTS has no fallback, home slots fall back to current units', () => {
  const empty = resolveAdSlots({});
  assert.equal(empty.AI_ASSISTANTS, undefined);
  assert.equal(empty.HOME_MID, '9777464779');
  assert.equal(empty.HOME_LOWER, '3466389052');
  assert.notEqual(empty.AI_ASSISTANTS, '5824691357');
});

test('slot map: numeric env values win, junk values are ignored', () => {
  const set = resolveAdSlots({
    VITE_ADSENSE_SLOT_AI_ASSISTANTS: ' 1234567890 ',
    VITE_ADSENSE_SLOT_HOME_MID: '1111111111',
    VITE_ADSENSE_SLOT_HOME_LOWER: 'HOME_LOWER_SLOT',
  });
  assert.equal(set.AI_ASSISTANTS, '1234567890');
  assert.equal(set.HOME_MID, '1111111111');
  assert.equal(set.HOME_LOWER, '3466389052');
  assert.equal(resolveAdSlots({ VITE_ADSENSE_SLOT_AI_ASSISTANTS: 'x' }).AI_ASSISTANTS, undefined);
});

test('the failing unit 5824691357 is not hard-coded in any page', async () => {
  const { readFileSync, readdirSync } = await import('node:fs');
  for (const f of readdirSync('src/pages', { recursive: true }) as string[]) {
    if (!/\.tsx?$/.test(f)) continue;
    assert.ok(!readFileSync(`src/pages/${f}`, 'utf8').includes('5824691357'), f);
  }
});
