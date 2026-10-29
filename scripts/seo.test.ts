import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ROUTE_SEO, SITEMAP_PATHS, getRouteSeo, SITE_URL } from "../src/lib/seo.ts";
import { buildSitemap } from "./generate-sitemap.ts";

const routes = new Set(
  [...readFileSync(new URL("../src/components/AnimatedRoutes.tsx", import.meta.url), "utf8").matchAll(/path="([^"]+)"/g)].map((m) => m[1]),
);

test("every SEO entry is a real route", () => {
  for (const path of Object.keys(ROUTE_SEO)) assert.ok(routes.has(path), `missing route ${path}`);
});

test("titles and descriptions fit search snippets", () => {
  for (const [path, seo] of Object.entries(ROUTE_SEO)) {
    assert.ok(seo.title.length <= 60, `${path} title is ${seo.title.length} chars`);
    assert.ok(seo.description.length >= 50 && seo.description.length <= 160, `${path} description is ${seo.description.length} chars`);
  }
});

test("canonical URLs use www and drop trailing slashes", () => {
  assert.equal(getRouteSeo("/").canonical, `${SITE_URL}/`);
  assert.equal(getRouteSeo("/pricing/").canonical, `${SITE_URL}/pricing`);
  assert.equal(getRouteSeo("/unknown").indexable, false);
});

test("public/sitemap.xml is up to date and excludes private screens", () => {
  const xml = readFileSync(new URL("../public/sitemap.xml", import.meta.url), "utf8");
  assert.equal(xml, buildSitemap(), "run scripts/generate-sitemap.ts");
  for (const p of ["/dashboard", "/cases", "/business-hub"]) assert.ok(!SITEMAP_PATHS.includes(p));
});

test("robots.txt points at the sitemap", () => {
  assert.match(readFileSync(new URL("../public/robots.txt", import.meta.url), "utf8"), /Sitemap: https:\/\/www\.legallyai\.ai\/sitemap\.xml/);
});
