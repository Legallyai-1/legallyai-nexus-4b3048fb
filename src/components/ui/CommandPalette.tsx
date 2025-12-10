import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Home,
  FileText,
  Bot,
  Scale,
  Briefcase,
  DollarSign,
  LogIn,
  UserPlus,
  MessageSquare,
  Settings,
  HelpCircle,
  Zap,
} from "lucide-react";

const pages = [
  { name: "Home", path: "/", icon: Home, group: "Navigation" },
  { name: "Generate Document", path: "/generate", icon: FileText, group: "Features" },
  { name: "AI Assistants", path: "/ai-assistants", icon: Bot, group: "Features" },
  { name: "Legal Chat", path: "/chat", icon: MessageSquare, group: "Features" },
  { name: "Child Custody Helper", path: "/custody", icon: Scale, group: "Features" },
  { name: "For Lawyers", path: "/lawyers", icon: Briefcase, group: "Navigation" },
  { name: "Pricing", path: "/pricing", icon: DollarSign, group: "Navigation" },
  { name: "Sign In", path: "/login", icon: LogIn, group: "Account" },
  { name: "Sign Up", path: "/signup", icon: UserPlus, group: "Account" },
  { name: "Dashboard", path: "/dashboard", icon: Settings, group: "Account" },
];

const quickActions = [
  { name: "Generate NDA", action: "/generate?type=nda", icon: Zap },
  { name: "Generate Contract", action: "/generate?type=contract", icon: Zap },
  { name: "Ask Legal Question", action: "/chat", icon: HelpCircle },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const groupedPages = pages.reduce((acc, page) => {
    if (!acc[page.group]) acc[page.group] = [];
    acc[page.group].push(page);
    return acc;
  }, {} as Record<string, typeof pages>);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." className="border-none focus:ring-0" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Quick Actions">
          {quickActions.map((action) => (
            <CommandItem
              key={action.action}
              onSelect={() => handleSelect(action.action)}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="p-1.5 rounded-md bg-legal-gold/10 text-legal-gold">
                <action.icon className="h-4 w-4" />
              </div>
              <span>{action.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {Object.entries(groupedPages).map(([group, items]) => (
          <CommandGroup key={group} heading={group}>
            {items.map((page) => (
              <CommandItem
                key={page.path}
                onSelect={() => handleSelect(page.path)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div className="p-1.5 rounded-md bg-muted">
                  <page.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <span>{page.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {page.path}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
      
      {/* Footer hint */}
      <div className="border-t border-border p-2 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">↑↓</kbd>
        <span>Navigate</span>
        <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">↵</kbd>
        <span>Select</span>
        <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Esc</kbd>
        <span>Close</span>
      </div>
    </CommandDialog>
  );
}
