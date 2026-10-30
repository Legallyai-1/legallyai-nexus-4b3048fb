// Guards for the Oct 29 2026 mobile/desktop layout sweep fixes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = (p) => fs.readFileSync(new URL('../' + p, import.meta.url), 'utf8');

test('grid tab bars scroll sideways instead of squashing labels on phones', () => {
  const css = read('src/index.css');
  assert.match(css, /\[role="tablist"\]\.grid\s*\{[^}]*display:\s*flex[^}]*overflow-x:\s*auto/);
  assert.match(css, /\[role="tablist"\]\.grid > \[role="tab"\]\s*\{\s*flex:\s*1 0 auto/);
});

test('dashboard grid uses a shrinkable single column below xl', () => {
  assert.match(read('src/pages/DashboardPage.tsx'), /className="grid grid-cols-1 gap-6 xl:grid-cols-/);
  assert.match(read('src/components/dashboard/AskLeePanel.tsx'), /lee-partner min-w-0/);
});

test('sidebar nav scroll area can shrink so it never runs under Settings/Logout', () => {
  assert.match(read('src/components/layout/AppSidebar.tsx'), /<ScrollArea className="min-h-0 flex-1/);
});
