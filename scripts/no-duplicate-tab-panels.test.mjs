// A Tabs block must not contain two TabsContent panels with the same value: both render at once
// (this caused two AI chats on the Custody hub).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? files(p) : p.endsWith('.tsx') ? [p] : [];
  });
}

test('no Tabs block has duplicate TabsContent values', () => {
  const problems = [];
  for (const file of files(new URL('../src', import.meta.url).pathname)) {
    const src = readFileSync(file, 'utf8');
    if (!src.includes('TabsContent')) continue;
    const stack = [];
    for (const m of src.matchAll(/<Tabs\b[^>]*?(?<!\/)>|<\/Tabs>|<TabsContent\s+value="([^"]+)"/g)) {
      if (m[0].startsWith('</Tabs')) {
        const seen = stack.pop() ?? new Map();
        for (const [value, count] of seen) if (count > 1) problems.push(`${file}: "${value}" x${count}`);
      } else if (m[0].startsWith('<TabsContent')) {
        const top = stack.at(-1);
        if (top) top.set(m[1], (top.get(m[1]) ?? 0) + 1);
      } else stack.push(new Map());
    }
  }
  assert.deepEqual(problems, []);
});
