import { useState, useRef, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAIChat } from "@/hooks/useAIChat";
import { AnimatedAIHead } from "@/components/ui/AnimatedAIHead";
import AdBanner from "@/components/ads/AdBanner";
import AdContainer from "@/components/ads/AdContainer";
import AdMobBanner, { ADMOB_AD_UNITS } from "@/components/ads/AdMobBanner";
import { ChatMarkdown } from "@/components/chat/ChatMarkdown";
import { SaveToCaseFile } from "@/components/chat/SaveToCaseFile";
import { ChatHistoryDrawer } from "@/components/chat/ChatHistoryDrawer";
import { LeeGreeting } from "@/components/chat/LeeGreeting";

const suggestedQuestions = [
  "What are my rights as a tenant in California?",
  "How do I form an LLC in Texas?",
  "What should be included in a freelance contract?",
  "How does child custody work in New York?",
  "What is the difference between a will and a trust?",
];

export default function ChatPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [input, setInput] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const { messages, isLoading, sendMessage, clearMessages, loadConversation } = useAIChat({ hubType: "general" });
  const [historyKey, setHistoryKey] = useState(0);
  useEffect(() => { if (!isLoading) setHistoryKey((k) => k + 1); }, [isLoading]);
  const accountRef = useRef<string | null | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    let revision = 0;
    const apply = (nextUser: SupabaseUser | null, failed = false) => {
      if (disposed) return;
      const account = nextUser?.id ?? null;
      if (accountRef.current !== account) {
        clearMessages();
        setInput("");
        accountRef.current = account;
      }
      setUser(nextUser);
      setAuthError(failed);
      setCheckingAuth(false);
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      revision += 1;
      apply(session?.user ?? null);
    });
    const initialRevision = revision;
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!disposed && revision === initialRevision) apply(data.session?.user ?? null, Boolean(error));
    }).catch(() => {
      if (!disposed && revision === initialRevision) apply(null, true);
    });
    return () => { disposed = true; subscription.unsubscribe(); };
  }, [clearMessages]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "auto" }); }, [messages]);

  // Questions handed off from the dashboard ("Ask Lee") arrive as ?q= and are sent once ready.
  useEffect(() => {
    const q = searchParams.get("q")?.trim();
    if (!q || checkingAuth || isLoading) return;
    setSearchParams({}, { replace: true });
    void sendMessage(q.slice(0, 2000)).catch(() => { /* error shown by the hook */ });
  }, [searchParams, checkingAuth, isLoading, sendMessage, setSearchParams]);

  async function submit() {
    const text = input.trim();
    if (!text || isLoading || checkingAuth) return;
    setInput("");
    try { await sendMessage(text); }
    catch { /* The shared hook displays the error and keeps the user's message. */ }
  }

  return (
    <Layout showFooter={false}>
      <div className="flex flex-col min-h-[calc(100dvh-4rem)] bg-background">
        <header className="border-b border-border glass-card px-4 py-4">
          <div className="container mx-auto max-w-4xl flex flex-wrap items-center gap-3">
            <AnimatedAIHead variant="cyan" size="sm" />
            <div className="flex-1 min-w-[12rem]">
              <h1 className="font-display text-lg font-semibold">Ask Lee <span className="text-white/50">·</span> <span className="gold-text">AI Partner</span></h1>
              <p className="text-sm text-muted-foreground">Legal research with official sources for your state.</p>
            </div>
            <ChatHistoryDrawer userId={user?.id ?? null} refreshKey={historyKey} onSelect={(sid, saved) => { loadConversation(sid, saved); setInput(""); }} />
            <Button variant="outline" onClick={() => { clearMessages(); setInput(""); }} disabled={checkingAuth}>New conversation</Button>
          </div>
        </header>
        <div className="container mx-auto max-w-4xl px-4 pt-4">
          {checkingAuth ? <p role="status" className="text-sm text-muted-foreground">Checking your session…</p> : authError ? (
            <p role="alert" className="text-sm">Your session could not be checked. <Link to="/login" className="underline">Sign in again</Link>.</p>
          ) : !user ? <p className="text-sm text-muted-foreground"><Link to="/login" className="underline">Sign in</Link> for account-linked chat. Anonymous access, if available, may provide limited no-cost guidance rather than a model-generated answer.</p> : null}
        </div>
        <section aria-label="Conversation" aria-busy={isLoading} className="flex-1 container mx-auto max-w-4xl px-4 py-6 space-y-5">
          {messages.length === 0 && <div className="glass-card rounded-2xl p-5 space-y-3">
            <LeeGreeting />
            <p>Ask a legal-information question and include your state or country when relevant. Avoid names, case numbers, and confidential documents. Verify important answers with official sources or a licensed attorney.</p>
            <p className="text-sm text-muted-foreground">Answers come from Lee, the LegallyAI legal AI, with official links for your state. Save any answer to your case file to track deadlines and appointments.</p>
            <div className="flex flex-wrap gap-2">{suggestedQuestions.map(question => <button key={question} type="button" onClick={() => setInput(question)} className="rounded-xl border border-border px-3 py-2 text-left text-sm focus-visible:outline focus-visible:outline-2">{question}</button>)}</div>
          </div>}
          {messages.map((message, index) => <div key={message.id ?? index} className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}>
            {message.role !== "user" && <AnimatedAIHead variant="cyan" size="sm" isActive={isLoading && !message.content} />}
            <div className={cn("min-w-0 max-w-[85%] rounded-2xl px-4 py-3 break-words", message.role === "user" ? "bg-neon-cyan/20" : "glass-card border border-border")}>
              {message.role === "user" || !message.content ? <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content || (isLoading ? "Preparing response…" : "")}</p> : <ChatMarkdown content={message.content} />}
              {message.reviewed && <p className="mt-2 text-xs text-muted-foreground">Secondary AI review performed; accuracy is not independently verified.</p>}
              {message.role === "assistant" && message.content && !(isLoading && index === messages.length - 1) && (
                <div className="mt-2 flex justify-end">
                  <SaveToCaseFile question={[...messages].slice(0, index).reverse().find(m => m.role === "user")?.content ?? "Legal question"} answer={message.content} hubType="general" />
                </div>
              )}
            </div>
            {message.role === "user" && <User aria-hidden="true" className="h-5 w-5 shrink-0" />}
          </div>)}
          <div ref={messagesEndRef} />
        </section>
        <div className="border-t border-border px-4 py-4">
          <div className="container mx-auto max-w-4xl">
            <form className="flex gap-3" onSubmit={event => { event.preventDefault(); void submit(); }}>
              <label htmlFor="legal-chat-input" className="sr-only">Your legal-information question</label>
              <Input id="legal-chat-input" value={input} onChange={event => setInput(event.target.value)} maxLength={6000} placeholder="Ask a legal-information question…" className="flex-1 min-w-0 h-12" disabled={checkingAuth || isLoading} />
              <Button type="submit" variant="neon" disabled={checkingAuth || isLoading || !input.trim()} aria-label="Send question">{isLoading ? <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" /> : <Send aria-hidden="true" className="h-5 w-5" />}</Button>
            </form>
            <p role="status" className="mt-2 text-sm text-muted-foreground">{isLoading ? "Waiting for a response. New conversation cancels this request and clears the chat." : ""}</p>
            <p className="mt-3 text-xs text-muted-foreground"><AlertCircle aria-hidden="true" className="inline h-3 w-3 mr-1" />AI-generated information is not legal advice. Review important information with a licensed attorney.</p>
            <AdContainer position="bottom" className="mt-4"><AdBanner slot="7335134262" format="horizontal" /></AdContainer>
            <AdMobBanner adUnitId={ADMOB_AD_UNITS.CHAT_BANNER} size="banner" className="mt-2" />
          </div>
        </div>
      </div>
    </Layout>
  );
}
