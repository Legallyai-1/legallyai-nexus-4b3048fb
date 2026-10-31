import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

test("application strict checks are required before every production build", () => {
  const config = ts.readConfigFile("tsconfig.app.json", ts.sys.readFile);
  assert.equal(config.config.compilerOptions.strict, true);
  assert.equal(config.config.compilerOptions.noImplicitAny, true);
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  assert.match(pkg.scripts.build, /^npm run typecheck && vite build$/);
  assert.match(pkg.scripts.typecheck, /tsconfig\.app\.json/);
  assert.match(pkg.scripts.typecheck, /tsconfig\.stripe-webhook\.json/);
});

test("every declared static router path has a deep-link rewrite", () => {
  const routes = readFileSync("src/components/AnimatedRoutes.tsx", "utf8");
  const config = JSON.parse(readFileSync("vercel.json", "utf8"));
  const rewrites = config.rewrites.map((rule) => new RegExp(`^${rule.source}$`));
  const paths = [...routes.matchAll(/<Route path="([^"]+)"/g)]
    .map((match) => match[1]).filter((path) => path !== "/" && path !== "*" && !path.includes(":"));
  assert.ok(paths.length > 50);
  for (const path of paths) {
    assert.ok(rewrites.some((rewrite) => rewrite.test(path)), `Missing rewrite for ${path}`);
  }
});
