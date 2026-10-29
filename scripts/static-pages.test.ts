import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renderStaticPage, staticPageFiles, NOT_FOUND_SEO } from "../src/lib/staticPages.ts";

const template = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const routes = [...readFileSync(new URL("../src/components/AnimatedRoutes.tsx", import.meta.url), "utf8").matchAll(/path="([^"]+)"/g)]
  .map((m) => m[1]).filter((p) => p !== "*" && p !== "/");

test("static pricing page carries its own meta and readable content", () => {
  const html = renderStaticPage(template, "/pricing");
  assert.match(html, /<title>Pricing – individuals and law firms \| LegallyAI<\/title>/);
  assert.match(html, /<link rel="canonical" href="https:\/\/www\.legallyai\.ai\/pricing" \/>/);
  assert.match(html, /<meta property="og:url" content="https:\/\/www\.legallyai\.ai\/pricing" \/>/);
  assert.match(html, /<meta name="robots" content="index, follow" \/>/);
  assert.match(html, /<h1[^>]*>Pricing – individuals and law firms<\/h1>/);
  assert.match(html, /<script type="module"/, "SPA entry must remain");
  assert.equal((html.match(/<div id="root">/g) ?? []).length, 1);
});

test("404 page is noindex without a canonical", () => {
  const html = renderStaticPage(template, "/404", NOT_FOUND_SEO);
  assert.match(html, /noindex, follow/);
  assert.doesNotMatch(html, /rel="canonical"/);
  assert.ok(staticPageFiles().some((f) => f.file === "404.html"));
});

test("vercel.json rewrites only known app routes, so unknown paths get a real 404", () => {
  const vercel = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));
  const spa = vercel.rewrites.find((r: { destination: string }) => r.destination === "/index.html");
  const re = new RegExp(`^${spa.source}$`);
  for (const r of routes) assert.ok(re.test(r), `route ${r} not rewritten`);
  for (const bad of ["/sitemap.xml", "/robots.txt", "/ads.txt", "/does-not-exist", "/pricingx"]) assert.ok(!re.test(bad), bad);
});
