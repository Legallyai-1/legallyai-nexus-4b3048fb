import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const COURT_BASE = Deno.env.get("COURTLISTENER_API") ?? "https://www.courtlistener.com/api/rest/v3";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const TABLE = Deno.env.get("SUPABASE_TABLE_CASES") ?? "cases_imported";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function searchCourtListener(q: string, page = 1) {
  const url = `${COURT_BASE}/search/?q=${encodeURIComponent(q)}&page=${page}`;
  console.log(`Searching CourtListener: ${url}`);
  const res = await fetch(url, { headers: { Accept: "application/json" }});
  if (!res.ok) {
    const errorText = await res.text();
    console.error(`CourtListener search failed: ${res.status} - ${errorText}`);
    throw new Error(`CourtListener search failed: ${res.status}`);
  }
  return await res.json();
}

async function fetchOpinion(url: string) {
  const fullUrl = url.startsWith("http") ? url : `${COURT_BASE}${url}`;
  console.log(`Fetching opinion: ${fullUrl}`);
  const res = await fetch(fullUrl, { headers: { Accept: "application/json" }});
  if (!res.ok) return null;
  return await res.json();
}

async function upsertCaseToSupabase(row: any) {
  const payload = {
    source: "courtlistener",
    courtlistener_id: row.id,
    title: row.caseName ?? row.name ?? row.title ?? null,
    date_filed: row.dateFiled ?? row.date_filed ?? row.date ?? null,
    citation: row.citation ?? null,
    url: row.absolute_url ?? row.html_url ?? row.url ?? null,
    raw: row
  };
  console.log(`Upserting case: ${payload.courtlistener_id} - ${payload.title}`);
  const { error } = await supabase.from(TABLE).upsert(payload, { onConflict: "courtlistener_id" });
  if (error) {
    console.error(`Upsert error: ${error.message}`);
    throw error;
  }
  return payload;
}

async function summarizeWithAI(text: string) {
  if (!text || text.length === 0) return null;
  console.log(`Summarizing text (${text.length} chars) with AI...`);
  
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${LOVABLE_API_KEY}` },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "You are a legal summarizer. Produce: short summary (2-3 sentences), key legal issues, relevant statutes (if any), and action items for legal professionals." },
        { role: "user", content: text.slice(0, 12000) }
      ]
    })
  });
  
  if (!resp.ok) {
    const errorText = await resp.text();
    console.error(`AI summarization failed: ${resp.status} - ${errorText}`);
    return null;
  }
  
  const json = await resp.json();
  return json.choices?.[0]?.message?.content ?? null;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const q = (body.query || body.q || "").toString().trim();
    
    if (!q) {
      console.error("Missing query parameter");
      return new Response(JSON.stringify({ error: "Missing query parameter" }), { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    console.log(`Starting CourtListener import for query: "${q}"`);
    const search = await searchCourtListener(q, 1);
    const results = [];

    console.log(`Found ${search.results?.length || 0} results`);

    for (const item of (search.results || [])) {
      try {
        const full = await fetchOpinion(item.absolute_url || item.url || "");
        const inserted = await upsertCaseToSupabase(full || item);
        
        const text = (full?.plain_text ?? full?.html ?? item.snippet ?? item.caseName ?? item.name ?? "").toString();
        const summary = await summarizeWithAI(text);
        
        if (summary) {
          await supabase.from(TABLE).update({ summary }).eq("courtlistener_id", item.id);
        }
        
        results.push({ 
          id: item.id, 
          title: item.caseName ?? item.name ?? item.title, 
          summary: summary?.slice(0, 200) + "..." 
        });
      } catch (e) {
        console.error(`Error processing item ${item.id}:`, e);
      }
    }

    console.log(`Successfully imported ${results.length} cases`);
    return new Response(JSON.stringify({ 
      ok: true, 
      count: results.length, 
      results 
    }), { 
      status: 200, 
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("Import error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});
