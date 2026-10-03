import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const TABLE = Deno.env.get("SUPABASE_TABLE_CASES") ?? "cases_imported";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function verifyAuth(req: Request): Promise<{ userId: string } | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    console.error('Auth verification failed:', error?.message);
    return null;
  }
  
  return { userId: user.id };
}

async function callAnthropic(messages: { role: string; content: string }[], maxTokens = 2048): Promise<string | null> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) return null;
  const system = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
  const convo = messages.filter((m) => m.role !== "system");
  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: Deno.env.get("ANTHROPIC_MODEL") || "claude-sonnet-4-20250514",
        max_tokens: maxTokens,
        ...(system ? { system } : {}),
        messages: convo,
      }),
    });
    if (!resp.ok) return null;
    const json = await resp.json();
    return json.content?.find((b: { type?: string }) => b.type === "text")?.text ?? null;
  } catch (e) {
    console.error("Anthropic request failed:", e);
    return null;
  }
}

async function callAI(head: string, messages: { role: string; content: string }[]) {
  console.log(`Calling AI for: ${head}`);
  const content = await callAnthropic(messages);
  if (content) return content;
  return `Analysis for ${head} is temporarily unavailable. Please try again later.`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const auth = await verifyAuth(req);
  if (!auth) {
    console.error('Unauthorized access attempt to process-case-ai');
    return new Response(JSON.stringify({ error: "Unauthorized - authentication required" }), { 
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  console.log(`Authenticated user ${auth.userId} accessing process-case-ai`);

  try {
    const body = await req.json().catch(() => ({}));
    const courtlistener_id = body.courtlistener_id;
    
    if (!courtlistener_id) {
      console.error("Missing courtlistener_id");
      return new Response(JSON.stringify({ error: "Missing courtlistener_id" }), { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const caseId = parseInt(courtlistener_id, 10);
    if (isNaN(caseId) || caseId <= 0) {
      return new Response(JSON.stringify({ error: "Invalid courtlistener_id format" }), { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log(`Processing case: ${courtlistener_id}`);
    
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("courtlistener_id", courtlistener_id)
      .single();
    
    if (error || !data) {
      console.error(`Case not found: ${courtlistener_id}`);
      return new Response(JSON.stringify({ error: "Case not found" }), { 
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const caseText = JSON.stringify(data.raw || {}).slice(0, 10000);
    const caseTitle = data.title || "Unknown Case";

    // DEFENDR: Defense strategy
    console.log("Running Defendr analysis...");
    const defendrMsg = [
      { 
        role: "system", 
        content: "You are Defendr, a criminal defense AI assistant. Analyze the case and provide: 1) Defense checklist with specific tasks, 2) Probable case outcomes with percentages, 3) Immediate next steps for the defense team, 4) Key weaknesses in prosecution's case if apparent." 
      },
      { role: "user", content: `Case: ${caseTitle}\n\nCase data: ${caseText}` }
    ];
    const defensePlan = await callAI("Defendr", defendrMsg);

    // LEXI: Client-friendly summary
    console.log("Running Lexi analysis...");
    const lexiMsg = [
      { 
        role: "system", 
        content: "You are Lexi, a client-friendly legal assistant. Explain the case in plain English that a non-lawyer can understand. Include: • What the case is about, • What it means for the client, • Key dates and deadlines, • What actions the client needs to take." 
      },
      { role: "user", content: `Case: ${caseTitle}\n\nCase data: ${caseText}` }
    ];
    const clientSummary = await callAI("Lexi", lexiMsg);

    // CUSTODIA: Custody analysis
    console.log("Running CustodiAI analysis...");
    const custodyMsg = [
      { 
        role: "system", 
        content: "You are CustodiAI, a child custody specialist. If this case involves family law or custody issues, provide: 1) Required documents checklist, 2) Court preparation steps, 3) Best interests factors analysis, 4) Recommended parenting plan elements. If the case does not involve custody, state 'No custody issues detected' and provide general family law considerations." 
      },
      { role: "user", content: `Case: ${caseTitle}\n\nCase data: ${caseText}` }
    ];
    const custodyNotes = await callAI("CustodiAI", custodyMsg);

    console.log("Storing AI analysis results...");
    const { error: updateError } = await supabase
      .from(TABLE)
      .update({ 
        defense_plan: defensePlan, 
        client_summary: clientSummary, 
        custody_notes: custodyNotes,
        updated_at: new Date().toISOString()
      })
      .eq("courtlistener_id", courtlistener_id);

    if (updateError) {
      console.error(`Update error: ${updateError.message}`);
      throw updateError;
    }

    console.log(`Successfully processed case: ${courtlistener_id}`);
    return new Response(JSON.stringify({ 
      ok: true, 
      courtlistener_id,
      defensePlan: !!defensePlan,
      clientSummary: !!clientSummary,
      custodyNotes: !!custodyNotes
    }), { 
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("Process error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), { 
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
