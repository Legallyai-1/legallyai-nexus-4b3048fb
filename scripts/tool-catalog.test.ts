import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TOOL_CATALOG, TOOL_GROUPS, featuredTools } from '../src/lib/toolCatalog.ts';

const routes = new Set(
  [...readFileSync(new URL('../src/components/AnimatedRoutes.tsx', import.meta.url), 'utf8').matchAll(/path="([^"]+)"/g)].map((m) => m[1]),
);

test('every launcher entry points at a real route', () => {
  for (const tool of TOOL_CATALOG) assert.ok(routes.has(tool.path), `${tool.title} -> ${tool.path} has no route`);
});

test('the relocated home tools have their own routes', () => {
  for (const path of ['/contract-review', '/settlement-estimator', '/research']) assert.ok(routes.has(path), path);
});

test('catalog has unique paths, known groups and a compact featured row', () => {
  assert.equal(new Set(TOOL_CATALOG.map((t) => t.path)).size, TOOL_CATALOG.length);
  for (const t of TOOL_CATALOG) assert.ok(TOOL_GROUPS.includes(t.group), t.group);
  const featured = featuredTools().length;
  assert.ok(featured >= 4 && featured <= 6, `featured=${featured}`);
});
