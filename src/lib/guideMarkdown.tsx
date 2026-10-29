import { Fragment, type ReactNode } from "react";

// Tiny renderer for the guide markdown subset: ## headings, paragraphs, "-" and "1." lists,
// **bold**, and "Label: https://..." source lines. Builds React elements, never raw HTML.
const URL_LINE = /^(.+?):\s+(https:\/\/\S+)$/;

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|https:\/\/\S+)/g).filter(Boolean).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
    if (part.startsWith("https://")) return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="guide-link break-all">{part}</a>;
    return <Fragment key={i}>{part}</Fragment>;
  });
}

function listItem(text: string, key: number): ReactNode {
  const src = text.match(URL_LINE);
  if (src) {
    return (
      <li key={key}>
        <a href={src[2]} target="_blank" rel="noopener noreferrer" className="guide-link">{src[1]}</a>
      </li>
    );
  }
  return <li key={key}>{inline(text)}</li>;
}

export const headingId = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function guideHeadings(markdown: string): string[] {
  return [...markdown.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
}

export function renderGuideMarkdown(markdown: string): ReactNode[] {
  const out: ReactNode[] = [];
  let para: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  const flush = () => {
    if (para.length) out.push(<p key={out.length}>{inline(para.join(" "))}</p>);
    para = [];
    if (list) {
      const items = list.items.map(listItem);
      out.push(list.ordered ? <ol key={out.length}>{items}</ol> : <ul key={out.length}>{items}</ul>);
    }
    list = null;
  };
  for (const raw of markdown.split("\n")) {
    const line = raw.trim();
    if (!line) { flush(); continue; }
    const h2 = line.match(/^##\s+(.+)$/);
    if (h2) { flush(); out.push(<h2 key={out.length} id={headingId(h2[1])} className="font-display">{h2[1]}</h2>); continue; }
    const li = line.match(/^(-|\d+\.)\s+(.+)$/);
    if (li) {
      const ordered = li[1] !== "-";
      if (para.length || (list && list.ordered !== ordered)) flush();
      list ??= { ordered, items: [] };
      list.items.push(li[2]);
      continue;
    }
    if (list) list.items[list.items.length - 1] += ` ${line}`;
    else para.push(line);
  }
  flush();
  return out;
}
