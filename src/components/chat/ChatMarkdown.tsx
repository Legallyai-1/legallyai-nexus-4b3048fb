import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// Minimal, safe Markdown renderer for chat answers.
// Supports headings (#, ##, ###), ordered and unordered lists, horizontal rules,
// **bold**, and [label](https://url) links. It never injects raw HTML.

const INLINE = /\*\*([^*]+)\*\*|\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let index = 0;
  for (const match of text.matchAll(INLINE)) {
    const start = match.index ?? 0;
    if (start > last) out.push(text.slice(last, start));
    if (match[1]) {
      out.push(<strong key={`${keyPrefix}-b${index}`}>{match[1]}</strong>);
    } else {
      out.push(
        <a
          key={`${keyPrefix}-a${index}`}
          href={match[3]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-neon-cyan underline underline-offset-2 hover:text-neon-purple"
        >
          {match[2]}
        </a>,
      );
    }
    last = start + match[0].length;
    index += 1;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

type Block =
  | { kind: "h"; level: number; text: string }
  | { kind: "p"; text: string }
  | { kind: "ul" | "ol"; items: string[] }
  | { kind: "hr" };

function parse(content: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  const flush = () => {
    if (paragraph.length) blocks.push({ kind: "p", text: paragraph.join("\n") });
    paragraph = [];
  };
  for (const raw of content.split("\n")) {
    const line = raw.trimEnd();
    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    const bullet = /^\s*[-*]\s+(.*)$/.exec(line);
    const numbered = /^\s*\d+[.)]\s+(.*)$/.exec(line);
    if (!line.trim()) {
      flush();
    } else if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) {
      flush();
      blocks.push({ kind: "hr" });
    } else if (heading) {
      flush();
      blocks.push({ kind: "h", level: heading[1].length, text: heading[2] });
    } else if (bullet || numbered) {
      flush();
      const kind = bullet ? "ul" : "ol";
      const item = (bullet ?? numbered)![1];
      const prev = blocks[blocks.length - 1];
      if (prev && prev.kind === kind) prev.items.push(item);
      else blocks.push({ kind, items: [item] });
    } else {
      paragraph.push(line);
    }
  }
  flush();
  return blocks;
}

export function ChatMarkdown({ content, className }: { content: string; className?: string }) {
  const blocks = parse(content);
  return (
    <div className={cn("space-y-2 text-sm leading-relaxed break-words", className)}>
      {blocks.map((block, i) => {
        const key = `b${i}`;
        switch (block.kind) {
          case "h":
            return block.level <= 2 ? (
              <h3 key={key} className="pt-1 text-base font-semibold">{renderInline(block.text, key)}</h3>
            ) : (
              <h4 key={key} className="pt-1 font-semibold">{renderInline(block.text, key)}</h4>
            );
          case "ul":
            return (
              <ul key={key} className="list-disc space-y-1 pl-5">
                {block.items.map((item, j) => <li key={`${key}-${j}`}>{renderInline(item, `${key}-${j}`)}</li>)}
              </ul>
            );
          case "ol":
            return (
              <ol key={key} className="list-decimal space-y-1 pl-5">
                {block.items.map((item, j) => <li key={`${key}-${j}`}>{renderInline(item, `${key}-${j}`)}</li>)}
              </ol>
            );
          case "hr":
            return <hr key={key} className="border-border" />;
          default:
            return (
              <p key={key} className="whitespace-pre-wrap">
                {block.text.split("\n").map((line, j, arr) => (
                  <Fragment key={`${key}-${j}`}>
                    {renderInline(line, `${key}-${j}`)}
                    {j < arr.length - 1 && <br />}
                  </Fragment>
                ))}
              </p>
            );
        }
      })}
    </div>
  );
}

export default ChatMarkdown;
