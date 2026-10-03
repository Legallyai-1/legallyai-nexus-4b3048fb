import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { resolveSubscriptionAccess } from "../_shared/subscription-access.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BLOCKED_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions?|rules?|prompts?)/i,
  /disregard\s+(all\s+)?(previous|prior|above)/i,
  /you\s+are\s+now/i,
  /pretend\s+(you\s+are|to\s+be)/i,
  /forget\s+(everything|all|your)/i,
];

function validatePrompt(prompt: string): { valid: boolean; reason?: string } {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(prompt)) {
      return { valid: false, reason: "Invalid request format." };
    }
  }
  return { valid: true };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let usageCharged = false;
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Document generation is temporarily unavailable." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    const { data: userData, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !userData.user) {
      return new Response(
        JSON.stringify({ error: "Invalid session." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const user = userData.user;
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { prompt } = await req.json();
    if (typeof prompt !== "string" || !prompt.trim() || prompt.length > 12000) {
      return new Response(
        JSON.stringify({ error: "Enter a document request under 12,000 characters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedPrompt = prompt.trim();
    const validation = validatePrompt(normalizedPrompt);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.reason }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!LOVABLE_API_KEY && !OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Document generation is temporarily unavailable." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const [
      { data: profile, error: profileError },
      { data: subscription, error: subscriptionError },
      { data: paymentRecords, error: paymentError },
    ] = await Promise.all([
      supabaseAdmin.from("profiles").select("credits, subscription_tier").eq("id", user.id).maybeSingle(),
      supabaseAdmin.from("subscriptions").select("status, tier, current_period_end, cancel_at_period_end").eq("user_id", user.id).maybeSingle(),
      supabaseAdmin.from("payment_records").select("tier, payment_method, expires_at, status, metadata, verified_at").eq("user_id", user.id).order("verified_at", { ascending: false }),
    ]);

    if (profileError || subscriptionError || paymentError) {
      console.error("Failed to verify document access", { userId: user.id });
      return new Response(
        JSON.stringify({ error: "Unable to verify your account. Please try again." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!profile) {
      return new Response(
        JSON.stringify({ error: "Your account is still being set up. Please try again." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const access = resolveSubscriptionAccess(profile.subscription_tier || "free", subscription, paymentRecords);
    const hasPaidPlan = access.entitled && access.plan !== "document";
    const hasDocumentEntitlement = access.activePaymentRecord?.tier === "document";
    if (!hasPaidPlan && Number(profile.credits ?? 0) < 1 && !hasDocumentEntitlement) {
      return new Response(
        JSON.stringify({ error: "Your AI credits are exhausted. Upgrade to continue." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!hasPaidPlan) {
      const { data: deduction, error: deductionError } = await supabaseUser.rpc("deduct_ai_credits", {
        p_user_id: user.id,
        p_cost: 1,
        p_reason: "document_generation",
      });
      const result = Array.isArray(deduction) ? deduction[0] : deduction;

      if (deductionError) {
        console.error("Document credit deduction failed", { userId: user.id });
        return new Response(
          JSON.stringify({ error: "Unable to confirm your document credit. Please try again." }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      if (!result?.success) {
        return new Response(
          JSON.stringify({ error: "Your AI credits are exhausted. Upgrade to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      usageCharged = true;
    }

    const systemPrompt = `You draft legal document templates; you are not a lawyer and do not provide legal advice. Prepare a clear first draft based only on the user's facts. Do not claim that a document is complete, legally accurate, or enforceable. Never invent statutes or citations. If jurisdiction or key facts are missing, clearly mark assumptions and identify what needs confirmation. Flag jurisdiction-specific or high-risk provisions for review by a licensed attorney. Include appropriate signature blocks and a concise review disclaimer.`;

    let response;
    let usedLovable = false;

    if (LOVABLE_API_KEY) {
      try {
        response = await fetch("https://api.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [{ role: "system", content: systemPrompt }, { role: "user", content: normalizedPrompt }],
          }),
        });
        if (response.ok) usedLovable = true;
      } catch (e) { console.error("Lovable error:", e); }
    }

    if (!usedLovable && OPENAI_API_KEY) {
      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "system", content: systemPrompt }, { role: "user", content: normalizedPrompt }],
        }),
      });
    }

    if (!response || !response.ok) {
      return new Response(
        JSON.stringify({ error: usageCharged ? "Document generation failed after your document allowance was used. Check your balance before retrying." : "Document generation failed. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await response.json();
    const document = data.choices?.[0]?.message?.content?.trim();
    if (!document) {
      return new Response(
        JSON.stringify({ error: usageCharged ? "No document was returned after your document allowance was used. Check your balance before retrying." : "No document was returned. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ document, success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Document generation failed:", error);
    return new Response(
      JSON.stringify({ error: usageCharged ? "Document generation failed after your document allowance was used. Check your balance before retrying." : "Document generation failed. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
