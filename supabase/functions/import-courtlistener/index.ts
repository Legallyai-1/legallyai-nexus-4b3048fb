import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const COURTLISTENER_TOKEN = Deno.env.get("COURTLISTENER_TOKEN");
const TABLE = "cases_imported";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Verify user authentication from JWT
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

// Generate realistic sample cases for testing and demo
function generateSampleCases(query: string) {
  const caseBases = [
    {
      id: 1001,
      caseName: "Rodriguez v. Immigration & Naturalization Service",
      court: "9th Circuit Court of Appeals",
      date_filed: "2021-03-15",
      docket_number: "No. 20-72156",
      snippet: "Petition for review of Board of Immigration Appeals decision denying asylum claim. Petitioner fled persecution in Guatemala. Court found substantial evidence supported well-founded fear of persecution based on political opinion.",
      court_citation_string: "9th Cir. 2021"
    },
    {
      id: 1002,
      caseName: "Martinez-Garcia v. Garland",
      court: "9th Circuit Court of Appeals",
      date_filed: "2021-06-22",
      docket_number: "No. 19-71234",
      snippet: "Immigration case involving withholding of removal. Petitioner established nexus between feared persecution and protected ground. Board erred in finding petitioner could safely relocate within home country.",
      court_citation_string: "9th Cir. 2021"
    },
    {
      id: 1003,
      caseName: "Chen v. United States Citizenship & Immigration Services",
      court: "9th Circuit Court of Appeals", 
      date_filed: "2021-09-08",
      docket_number: "No. 20-35678",
      snippet: "Challenge to denial of adjustment of status application. USCIS applied incorrect legal standard for hardship determination. Remanded for reconsideration under proper framework.",
      court_citation_string: "9th Cir. 2021"
    },
    {
      id: 1004,
      caseName: "United States v. Lopez-Mendoza",
      court: "9th Circuit Court of Appeals",
      date_filed: "2021-11-30",
      docket_number: "No. 20-10234",
      snippet: "Criminal immigration case involving illegal reentry after deportation. Defendant argued ineffective assistance of counsel in prior removal proceedings. Court examined whether procedural defects rendered prior deportation fundamentally unfair.",
      court_citation_string: "9th Cir. 2021"
    },
    {
      id: 1005,
      caseName: "Hernandez-Ortiz v. Mayorkas",
      court: "9th Circuit Court of Appeals",
      date_filed: "2021-04-12",
      docket_number: "No. 19-72890",
      snippet: "Class action challenging expedited removal procedures at southern border. Plaintiffs alleged due process violations in credible fear determinations. Court addressed scope of judicial review over immigration enforcement decisions.",
      court_citation_string: "9th Cir. 2021"
    }
  ];

  // Filter based on query terms
  const queryLower = query.toLowerCase();
  return caseBases.filter(c => 
    c.caseName.toLowerCase().includes(queryLower) ||
    c.snippet.toLowerCase().includes(queryLower) ||
    c.court.toLowerCase().includes(queryLower) ||
    queryLower.includes('immigration') ||
    queryLower.includes('9th circuit')
  );
}

async function searchCourtListenerAPI(query: string) {
  if (!COURTLISTENER_TOKEN) {
    console.log("No CourtListener API token - using sample data");
    return null;
  }

  const baseUrl = 'https://www.courtlistener.com/api/rest/v3/search/';
  const params = new URLSearchParams();
  params.append('q', query);
  params.append('type', 'o');
  params.append('order_by', 'score desc');
  
  console.log(`Searching CourtListener API: ${baseUrl}?${params.toString()}`);
  
  const response = await fetch(`${baseUrl}?${params.toString()}`, {
    headers: { 
      'Accept': 'application/json',
      'Authorization': `Token ${COURTLISTENER_TOKEN}`
    }
  });

  if (!response.ok) {
    console.error(`CourtListener API error: ${response.status}`);
    return null;
  }

  const data = await response.json();
  return data.results || [];
}

async function upsertCaseToSupabase(item: any) {
  const payload = {
    source: COURTLISTENER_TOKEN ? "courtlistener" : "sample",
    courtlistener_id: item.id,
    title: item.caseName || item.case_name || "Unknown Case",
    date_filed: item.date_filed || item.dateArgued || null,
    citation: item.docket_number || item.citation?.[0] || null,
    url: item.absolute_url ? `https://www.courtlistener.com${item.absolute_url}` : null,
    raw: item
  };
  
  console.log(`Upserting case: ${payload.courtlistener_id} - ${payload.title}`);
  
  const { error } = await supabase.from(TABLE).upsert(payload, { 
    onConflict: "courtlistener_id",
    ignoreDuplicates: false 
  });
  
  if (error) {
    console.error(`Upsert error: ${error.message}`);
    throw error;
  }
  return payload;
}

async function summarizeWithAI(text: string, title: string) {
  if (!text || text.length < 20) return null;
  
  console.log(`Summarizing "${title}" with AI...`);
  
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json", 
      "Authorization": `Bearer ${LOVABLE_API_KEY}` 
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { 
          role: "system", 
          content: "You are a legal case summarizer. Analyze the case and provide: 1) Brief overview (2-3 sentences), 2) Key legal issues, 3) Relevant statutes/precedents mentioned, 4) Potential action items for attorneys. Be concise and professional." 
        },
        { role: "user", content: `Case: ${title}\n\nDetails: ${text.slice(0, 8000)}` }
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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Verify authentication
  const auth = await verifyAuth(req);
  if (!auth) {
    console.error('Unauthorized access attempt to import-courtlistener');
    return new Response(JSON.stringify({ error: "Unauthorized - authentication required" }), { 
      status: 401, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }

  console.log(`Authenticated user ${auth.userId} accessing import-courtlistener`);

  try {
    const body = await req.json().catch(() => ({}));
    const query = (body.query || body.q || "").toString().trim();
    
    if (!query) {
      return new Response(JSON.stringify({ error: "Missing query parameter" }), { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // Validate query length to prevent abuse
    if (query.length > 500) {
      return new Response(JSON.stringify({ error: "Query too long (max 500 characters)" }), { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    console.log(`Starting case import for: "${query}"`);
    
    // Try CourtListener API first, fall back to sample data
    let searchResults = await searchCourtListenerAPI(query);
    let usingSampleData = false;
    
    if (!searchResults || searchResults.length === 0) {
      console.log("Using sample case data for demo/testing");
      searchResults = generateSampleCases(query);
      usingSampleData = true;
    }

    console.log(`Processing ${searchResults.length} cases`);
    const results = [];

    for (const item of searchResults.slice(0, 10)) {
      try {
        await upsertCaseToSupabase(item);
        
        const textToSummarize = item.snippet || item.syllabus || item.caseName || "";
        const summary = await summarizeWithAI(textToSummarize, item.caseName || item.case_name || "Case");
        
        if (summary) {
          await supabase.from(TABLE).update({ summary }).eq("courtlistener_id", item.id);
        }
        
        results.push({ 
          id: item.id, 
          title: item.caseName || item.case_name, 
          court: item.court || item.court_citation_string,
          date: item.date_filed,
          summaryGenerated: !!summary
        });
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : "Unknown error";
        console.error(`Error processing case ${item.id}: ${errorMsg}`);
      }
    }

    console.log(`Successfully imported ${results.length} cases`);
    
    return new Response(JSON.stringify({ 
      ok: true, 
      count: results.length,
      source: usingSampleData ? "sample_data" : "courtlistener_api",
      note: usingSampleData ? "Add COURTLISTENER_TOKEN secret to use live API" : undefined,
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
