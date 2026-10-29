import { useState } from "react";
import { Link } from "react-router-dom";
import { Grip } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TOOL_CATALOG, TOOL_GROUPS } from "@/lib/toolCatalog";
import { TOOL_ICONS } from "./toolIcons";
import { cn } from "@/lib/utils";

interface ToolLauncherProps {
  className?: string;
}

// Google-apps-style "dots" launcher: one button that opens every tool and hub as an icon grid.
// Radix Popover gives focus management, Esc and outside-click closing.
export function ToolLauncher({ className }: ToolLauncherProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label="All tools and hubs"
        className={cn(
          "relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-background/40 text-foreground transition-colors hover:border-legal-gold/70 hover:bg-background/70 data-[state=open]:border-legal-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
      >
        <Grip className="h-5 w-5" aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        collisionPadding={8}
        className="hub-theme launcher-panel w-[min(92vw,380px)] max-h-[min(75dvh,620px)] overflow-y-auto rounded-3xl p-4"
      >
        <nav aria-label="All tools and hubs">
          <div className="flex items-center justify-between px-1">
            <p className="font-display text-sm font-semibold text-foreground">All tools</p>
            <span className="text-xs text-muted-foreground">{TOOL_CATALOG.length} available</span>
          </div>
          {TOOL_GROUPS.map((group) => {
            const items = TOOL_CATALOG.filter((tool) => tool.group === group);
            return (
              <section key={group} className="mt-3" aria-label={group}>
                <h3 className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{group}</h3>
                <ul className="mt-1.5 grid grid-cols-3 gap-1.5">
                  {items.map((tool) => {
                    const Icon = TOOL_ICONS[tool.icon];
                    return (
                      <li key={tool.path}>
                        <Link
                          to={tool.path}
                          onClick={() => setOpen(false)}
                          title={tool.description}
                          className="group flex h-full flex-col items-center gap-1.5 rounded-2xl px-1.5 py-2.5 text-center text-xs font-medium text-foreground transition-colors hover:bg-white/70 focus-visible:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <span className="launcher-icon flex h-10 w-10 items-center justify-center rounded-2xl">
                            <Icon className="h-5 w-5" aria-hidden="true" />
                          </span>
                          <span className="leading-tight">{tool.title}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </nav>
      </PopoverContent>
    </Popover>
  );
}

export default ToolLauncher;
