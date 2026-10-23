import { useCallback, useEffect, useState } from "react";
import { History, Loader2, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import type { Message } from "@/hooks/useAIChat";

interface SavedConversation {
  id: string;
  session_id: string;
  hub_type: string;
  messages: Message[];
  updated_at: string;
}

interface Props {
  userId: string | null;
  /** Changes whenever a reply finishes so the list refreshes. */
  refreshKey: number;
  onSelect: (sessionId: string, messages: Message[]) => void;
}

function titleFor(messages: Message[]): string {
  const first = messages.find((m) => m.role === "user")?.content ?? "Conversation";
  return first.length > 70 ? `${first.slice(0, 70)}…` : first;
}

// Past conversations for the signed-in user, saved server-side by the legal-chat function.
export function ChatHistoryDrawer({ userId, refreshKey, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<SavedConversation[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("ai_chat_history")
      .select("id, session_id, hub_type, messages, updated_at")
      .eq("user_id", userId)
      .eq("is_archived", false)
      .order("updated_at", { ascending: false })
      .limit(50);
    setLoading(false);
    if (error) { toast.error("Could not load chat history"); return; }
    setItems(((data ?? []) as unknown as SavedConversation[]).filter((c) => Array.isArray(c.messages) && c.messages.length > 0));
  }, [userId]);

  useEffect(() => { if (open) void load(); }, [open, load, refreshKey]);

  const remove = async (id: string) => {
    const { error } = await supabase.from("ai_chat_history").update({ is_archived: true }).eq("id", id);
    if (error) { toast.error("Could not delete conversation"); return; }
    setItems((prev) => prev.filter((c) => c.id !== id));
  };

  if (!userId) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2"><History className="h-4 w-4" aria-hidden="true" /> History</Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[320px] sm:w-[380px] p-0">
        <SheetHeader className="p-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2"><History className="h-4 w-4" /> Your conversations</SheetTitle>
          <SheetDescription>Pick one to continue where you left off.</SheetDescription>
        </SheetHeader>
        <div className="overflow-y-auto h-[calc(100dvh-6rem)] p-2">
          {loading && <div className="flex justify-center p-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>}
          {!loading && items.length === 0 && <p className="p-4 text-sm text-muted-foreground">No saved conversations yet. Ask Lee something and it will appear here.</p>}
          {items.map((c) => (
            <div key={c.id} className="group flex items-start gap-2 rounded-lg px-2 py-2 hover:bg-muted/40">
              <button type="button" onClick={() => { onSelect(c.session_id, c.messages.filter((m) => m.role !== "system")); setOpen(false); }} className="flex min-w-0 flex-1 items-start gap-2 text-left">
                <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-neon-cyan" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block truncate text-sm">{titleFor(c.messages)}</span>
                  <span className="block text-xs text-muted-foreground">{c.hub_type !== "general" ? `${c.hub_type} · ` : ""}{formatDistanceToNow(new Date(c.updated_at), { addSuffix: true })}</span>
                </span>
              </button>
              <Button variant="ghost" size="icon" className="h-7 w-7 opacity-60 hover:opacity-100" aria-label="Delete conversation" onClick={() => remove(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default ChatHistoryDrawer;
