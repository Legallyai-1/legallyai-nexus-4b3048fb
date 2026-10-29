// Regenerates public/sitemap.xml from src/lib/seo.ts: node --experimental-strip-types scripts/generate-sitemap.ts
import { writeFileSync } from "node:fs";
import { SITEMAP_PATHS, SITE_URL } from "../src/lib/seo.ts";

export function buildSitemap(): string {
  const urls = SITEMAP_PATHS.map((p) => `  <url><loc>${SITE_URL}${p}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  writeFileSync(new URL("../public/sitemap.xml", import.meta.url), buildSitemap());
}
