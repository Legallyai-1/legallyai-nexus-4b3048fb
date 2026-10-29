import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidAdSlot } from '../src/lib/adSlots.ts';

test('only numeric AdSense unit ids are rendered', () => {
  assert.equal(isValidAdSlot('9777464779'), true);
  for (const bad of ['CASES_SIDEBAR_SLOT', 'DASHBOARD_SIDEBAR_SLOT', '', '  ', undefined, null, '12ab34567']) {
    assert.equal(isValidAdSlot(bad as string | undefined), false, String(bad));
  }
});
