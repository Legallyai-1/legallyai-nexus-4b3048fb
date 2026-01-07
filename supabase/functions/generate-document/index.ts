import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Blocked patterns for prompt injection and harmful content
const BLOCKED_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions?|rules?|prompts?)/i,
  /disregard\s+(all\s+)?(previous|prior|above)/i,
  /you\s+are\s+now\s+(?!legallyai)/i,
  /act\s+as\s+(?!a\s+legal)/i,
  /pretend\s+(you\s+are|to\s+be)/i,
  /forget\s+(everything|all|your)/i,
  /new\s+instructions?:/i,
  /system\s*:\s*/i,
  /\[system\]/i,
  /\<\s*system\s*\>/i,
];

// Blocked document types that could be harmful
const BLOCKED_CONTENT = [
  /how\s+to\s+(commit|do|perform)\s+(fraud|crime|illegal)/i,
  /fake\s+(passport|id|identity|document)/i,
  /forge(d|ry)?\s+(signature|document)/i,
  /money\s+launder/i,
  /tax\s+evasion/i,
  /hack(ing)?\s+(into|account|system)/i,
];

function validatePrompt(prompt: string): { valid: boolean; reason?: string } {
  const normalizedPrompt = prompt.toLowerCase().trim();
  
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(prompt)) {
      console.warn("Blocked prompt injection attempt:", prompt.substring(0, 100));
      return { valid: false, reason: "Invalid request format. Please describe your legal document needs clearly." };
    }
  }
  
  for (const pattern of BLOCKED_CONTENT) {
    if (pattern.test(prompt)) {
      console.warn("Blocked harmful content request:", prompt.substring(0, 100));
      return { valid: false, reason: "We cannot generate documents for illegal or harmful purposes." };
    }
  }
  
  return { valid: true };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required. Please sign in to generate documents." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !userData.user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Invalid or expired session. Please sign in again." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const user = userData.user;
    console.log("Authenticated user:", user.id);

    const { prompt, documentType } = await req.json();
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (prompt.length > 10000) {
      return new Response(
        JSON.stringify({ error: "Prompt is too long. Maximum 10,000 characters allowed." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validation = validatePrompt(prompt);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.reason }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use user's own OpenAI API key - no Lovable credits needed
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured. Please add your OpenAI API key." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are LegallyAI, a professional legal document generator. You create accurate, state-specific legal documents based on U.S. law (2025).

IMPORTANT RULES:
1. Generate COMPLETE, professional legal documents - not summaries or outlines
2. Include all standard legal clauses, definitions, and provisions
3. Use proper legal formatting with numbered sections
4. Include signature blocks and date fields
5. Add state-specific provisions when mentioned
6. Include standard legal boilerplate (severability, entire agreement, etc.)
7. Always end with: "DISCLAIMER: This document is a template for informational purposes only. This is not legal advice. Please consult a licensed attorney for your specific legal needs."
8. NEVER generate documents for illegal purposes, fraud, or harmful activities
9. If a request seems harmful or illegal, politely decline and explain why

Document types you can generate:
- NDAs (Non-Disclosure Agreements)
- Employment Contracts
- Independent Contractor Agreements
- Lease Agreements
- Service Agreements
- Partnership Agreements
- Operating Agreements (LLC)
- Terms of Service
- Privacy Policies
- Wills and Testaments
- Custody Agreements
- Prenuptial Agreements
- And more...

Generate the document based on the user's request. Make it comprehensive and legally sound.`;

    console.log("Generating document for user:", user.id, "prompt:", prompt.substring(0, 100));

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        max_tokens: 4000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ error: "Invalid OpenAI API key. Please check your configuration." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to generate document" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const document = data.choices?.[0]?.message?.content;

    if (!document) {
      console.error("No content in AI response:", data);
      return new Response(
        JSON.stringify({ error: "Failed to generate document content" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Document generated successfully for user:", user.id, "length:", document.length);

    return new Response(
      JSON.stringify({ document, success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-document:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
