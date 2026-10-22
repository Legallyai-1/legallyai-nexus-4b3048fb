import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Code2, Copy, KeyRound, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase as typedSupabase } from "@/integrations/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

// The api_keys table and its functions are newer than the generated types; use an untyped handle for them.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = typedSupabase as unknown as SupabaseClient<any, "public", any>;
import { getSupabaseBrowserConfig } from "@/lib/env";
import { toast } from "sonner";

interface ApiKeyRow {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  requests_total: number;
  revoked_at: string | null;
}

export function ApiKeysCard() {
  const navigate = useNavigate();
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("My app");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState<boolean | null>(null);
  const endpoint = `${getSupabaseBrowserConfig().url}/functions/v1/legal-chat`;

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: rows }, { data: userData }] = await Promise.all([
      supabase.from("api_keys").select("id, name, key_prefix, created_at, last_used_at, requests_total, revoked_at").is("revoked_at", null).order("created_at", { ascending: false }),
      supabase.auth.getUser(),
    ]);
    setKeys((rows ?? []) as ApiKeyRow[]);
    if (userData.user) {
      const { data } = await supabase.rpc("has_api_subscription", { p_user: userData.user.id });
      setSubscribed(data === true);
    }
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const create = async () => {
    setCreating(true);
    const { data, error } = await supabase.rpc("create_api_key", { p_name: name });
    setCreating(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    const row = Array.isArray(data) ? data[0] : data;
    if (row?.key) {
      setNewKey(row.key as string);
      toast.success("API key created. Copy it now; it will not be shown again.");
      void load();
    }
  };

  const revoke = async (id: string) => {
    const { error } = await supabase.from("api_keys").update({ revoked_at: new Date().toISOString() }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("API key revoked"); void load(); }
  };

  const copy = async (value: string) => {
    try { await navigator.clipboard.writeText(value); toast.success("Copied"); } catch { toast.error("Copy failed"); }
  };

  const example = `curl -X POST "${endpoint}" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${newKey ?? "lai_live_..."}" \\
  -d '{"hub_type":"general","messages":[{"role":"user","content":"How do I respond to an eviction notice in California?"}]}'`;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5 text-neon-cyan" /> Developer API</CardTitle>
        <CardDescription>Build your own apps on Lee, LegallyAI's legal AI. An active subscription or free trial is required. Keys allow 500 requests per day.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : subscribed === false ? (
          <div className="rounded-lg border border-border p-4 text-sm space-y-3">
            <p>API access is included with every LegallyAI plan, including the free trial. Subscribe to create your first key.</p>
            <Button variant="neon" onClick={() => navigate("/pricing")}>View plans and start free trial</Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Key name" aria-label="API key name" maxLength={60} />
              <Button variant="neon" onClick={create} disabled={creating || keys.length >= 5}>
                {creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <KeyRound className="h-4 w-4 mr-2" />} Create key
              </Button>
            </div>
            {newKey && (
              <div className="rounded-lg border border-neon-cyan/40 bg-neon-cyan/5 p-3 text-sm space-y-2">
                <p className="font-medium">Your new API key (shown once):</p>
                <div className="flex items-center gap-2">
                  <code className="break-all text-xs flex-1">{newKey}</code>
                  <Button size="sm" variant="outline" onClick={() => copy(newKey)} aria-label="Copy API key"><Copy className="h-4 w-4" /></Button>
                </div>
              </div>
            )}
            {keys.length === 0 ? <p className="text-sm text-muted-foreground">No API keys yet.</p> : (
              <ul className="divide-y divide-border rounded-lg border border-border">
                {keys.map((k) => (
                  <li key={k.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                    <div>
                      <p className="font-medium">{k.name} <Badge variant="outline" className="ml-2">{k.key_prefix}…</Badge></p>
                      <p className="text-xs text-muted-foreground">{k.requests_total} requests · created {new Date(k.created_at).toLocaleDateString()}{k.last_used_at ? ` · last used ${new Date(k.last_used_at).toLocaleDateString()}` : ""}</p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => revoke(k.id)} aria-label={`Revoke ${k.name}`}><Trash2 className="h-4 w-4" /></Button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        <details className="text-sm">
          <summary className="cursor-pointer font-medium flex items-center gap-2"><Code2 className="h-4 w-4" /> Quick start</summary>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 text-xs whitespace-pre-wrap">{example}</pre>
          <p className="mt-2 text-muted-foreground">
            Send up to 20 messages. Hubs: general, custody, marriage, defense, parole, workplace, probono. The reply is JSON with <code>answer</code> (Markdown), <code>persona</code>, and <code>session_id</code>. Answers are general legal information, not legal advice.
          </p>
        </details>
      </CardContent>
    </Card>
  );
}

export default ApiKeysCard;
