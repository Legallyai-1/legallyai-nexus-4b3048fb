// Build-time static HTML for public routes, so crawlers and ad reviewers get real per-route
// title, description, canonical, share tags and readable content before JavaScript runs.
// React replaces the #root content on load (createRoot), so this is the same content users see.
import { ROUTE_SEO, SITEMAP_PATHS, SITE_URL, getRouteSeo, type RouteSeo } from "./seo.ts";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const NAV_LINKS: Array<[string, string]> = [
  ["/chat", "Ask Lee"], ["/lawyers", "For law firms"], ["/generate", "Documents"], ["/contract-review", "Contract review"],
  ["/research", "Research"], ["/ai-assistants", "AI assistants"], ["/pricing", "Pricing"], ["/support", "Support"],
];

export const NOT_FOUND_SEO: RouteSeo = {
  title: "Page not found | LegallyAI",
  description: "This page does not exist. Ask Lee a legal question or browse LegallyAI's tools from the home page.",
  indexable: false,
};

function setTag(html: string, pattern: RegExp, replacement: string): string {
  if (!pattern.test(html)) throw new Error(`static pages: tag not found ${pattern}`);
  return html.replace(pattern, replacement);
}

export function renderStaticPage(template: string, path: string, seoOverride?: RouteSeo): string {
  const base = getRouteSeo(path);
  const seo = seoOverride ? { ...seoOverride, canonical: base.canonical } : base;
  const title = esc(seo.title);
  const description = esc(seo.description);
  let html = template;
  html = setTag(html, /<title>[^<]*<\/title>/, `<title>${title}</title>`);
  html = setTag(html, /<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${description}" />\n    <meta name="robots" content="${seo.indexable ? "index, follow" : "noindex, follow"}" />`);
  html = setTag(html, /<link rel="canonical" href="[^"]*" \/>/, seoOverride ? "" : `<link rel="canonical" href="${seo.canonical}" />`);
  html = setTag(html, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${title}" />`);
  html = setTag(html, /<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${description}" />`);
  html = setTag(html, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${seo.canonical}" />`);
  html = setTag(html, /<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${title}" />`);
  html = setTag(html, /<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${description}" />`);

  const heading = esc(seo.title.replace(/\s*\|\s*LegallyAI$/, ""));
  const nav = NAV_LINKS.map(([href, label]) => `<a href="${href}" style="color:#f5c542;text-decoration:none">${label}</a>`).join(" · ");
  const body = `<div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:24px;text-align:center;background:linear-gradient(160deg,#0b1730,#12274a 50%,#173563);font-family:system-ui,sans-serif">`
    + `<a href="/" style="color:#fff;font-weight:700;font-size:20px;text-decoration:none">legally<span style="color:#f5c542">ai</span>.ai</a>`
    + `<h1 style="margin:0;color:#fff;font-size:28px;max-width:720px">${heading}</h1>`
    + `<p style="margin:0;color:#c9d6ea;font-size:16px;max-width:620px;line-height:1.5">${description}</p>`
    + `<nav aria-label="LegallyAI" style="font-size:14px;max-width:620px;line-height:1.8">${nav}</nav>`
    + `<span style="color:#8fa3c2;font-size:13px">Loading LegallyAI…</span></div>`;
  html = setTag(html, /<div id="root">[\s\S]*?<\/div><\/div>/, `<div id="root">${body}</div>`);
  return html;
}

/** Output file → path for every static page the build writes. */
export function staticPageFiles(): Array<{ file: string; path: string; notFound?: boolean }> {
  const pages = SITEMAP_PATHS.map((p) => ({ file: p === "/" ? "index.html" : `${p.slice(1)}/index.html`, path: p }));
  return [...pages, { file: "404.html", path: "/404", notFound: true }];
}

export { ROUTE_SEO, SITE_URL };
