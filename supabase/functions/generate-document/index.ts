import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

import { getAnthropicKey } from "../_shared/anthropic-key.ts";
import {
  consumeDocumentCredit,
  hasSubscriptionEntitlement,
  refundDocumentCredit,
} from "../_shared/document-credits.ts";
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

function buildNoCostTemplate(prompt: string): string {
  const templates = [
    {
      keywords: ["nda", "non-disclosure"],
      title: "Confidentiality Agreement Worksheet",
      sections: ["Parties and effective date", "Confidential information", "Permitted use and safeguards", "Exclusions", "Term and return or destruction", "Governing law and dispute process"],
    },
    {
      keywords: ["employment contract", "employment agreement"],
      title: "Employment Agreement Worksheet",
      sections: ["Employer and role", "Duties and work location", "Compensation and benefits", "Term and termination", "Confidentiality and intellectual property", "Governing law and review"],
    },
    {
      keywords: ["freelancer", "independent contractor"],
      title: "Freelance Services Agreement Worksheet",
      sections: ["Parties and project", "Services and deliverables", "Schedule and acceptance", "Fees and expenses", "Ownership and confidentiality", "Changes and termination", "Governing law and review"],
    },
    {
      keywords: ["llc operating", "operating agreement"],
      title: "LLC Operating Agreement Worksheet",
      sections: ["Company and members", "Contributions and ownership", "Management and voting", "Allocations and distributions", "Transfers and withdrawal", "Dissolution and records"],
    },
    {
      keywords: ["lease"],
      title: "Lease Agreement Worksheet",
      sections: ["Parties and premises", "Term and possession", "Rent, deposit, and other charges", "Utilities and maintenance", "Use, notices, and entry", "Termination and governing law"],
    },
    {
      keywords: ["service agreement", "services agreement"],
      title: "Services Agreement Worksheet",
      sections: ["Parties and scope", "Deliverables and schedule", "Fees and expenses", "Confidentiality and ownership", "Warranties and limitations", "Changes and termination", "Governing law and review"],
    },
    {
      keywords: ["testament", "power of attorney", "trust", "estate plan", "draft a will", "create a will", "write a will", "simple will", "last will", "my will"],
      title: "Estate Planning Review Worksheet",
      sections: ["People and roles to discuss", "Assets and ownership", "Intended beneficiaries", "Decision-making and care preferences", "Questions about signing and witnesses", "Questions for a licensed estate-planning attorney"],
      worksheetOnly: true,
    },
  ];
  const lowerPrompt = prompt.toLowerCase();
  const template = templates.find(({ keywords }) => keywords.some((keyword) => lowerPrompt.includes(keyword)));
  const title = template?.title ?? "Legal Document Planning Worksheet";
  const sections = template?.sections ?? [
    "Parties and jurisdiction",
    "Purpose and scope",
    "Responsibilities and timing",
    "Payment or other consideration",
    "Confidentiality, ownership, and records",
    "Changes, termination, and dispute process",
    "Governing law and attorney review",
  ];
  const notice = template?.worksheetOnly
    ? "This worksheet is not a will, trust, power of attorney, or other legal instrument. Do not sign or rely on it as one."
    : "This is a fill-in planning template, not legal advice or a completed or enforceable agreement.";

  return [
    title,
    "",
    "NO-COST TEMPLATE MODE — no paid AI service or document-generation credits were used.",
    notice,
    "Fill in every bracketed field, remove provisions that do not apply, and have a licensed attorney review the final document before signing or relying on it.",
    "",
    "Request for this draft:",
    prompt,
    "",
    ...sections.flatMap((section, index) => [`${index + 1}. ${section}`, "[Add the agreed details here.]",
      ""]),
    "Jurisdiction: [State or country]",
    "Effective date: [Date]",
    "Names and signatures: [Complete only after legal review]",
  ].join("\n");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !supabaseAnonKey) {
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

    const { prompt } = await req.json();
    if (typeof prompt !== "string" || !prompt.trim() || prompt.length > 12000) {
      return new Response(
        JSON.stringify({ error: "Enter a document request under 12,000 characters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const normalizedPrompt = prompt.trim();
    const validation = validatePrompt(normalizedPrompt);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.reason }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const ANTHROPIC_API_KEY = Deno.env.get("ENABLE_PAID_AI") === "true" ? getAnthropicKey() : null;
    const ANTHROPIC_MODEL = Deno.env.get("ANTHROPIC_MODEL") || "claude-sonnet-4-20250514";
    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ document: buildNoCostTemplate(normalizedPrompt), success: true, mode: "template" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Entitlement: subscribers generate freely; a Per Document ($5) purchase buys exactly
    // one generated document, spent atomically before the paid AI call.
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Document generation is temporarily unavailable." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const userId = userData.user.id;
    const [
      { data: profile, error: profileError },
      { data: subscription, error: subscriptionError },
      { data: paymentRecords, error: paymentError },
    ] = await Promise.all([
      admin.from("profiles").select("subscription_tier").eq("id", userId).maybeSingle(),
      admin.from("subscriptions").select("status, tier").eq("user_id", userId).maybeSingle(),
      admin.from("payment_records").select("tier, status, expires_at").eq("user_id", userId),
    ]);
    if (profileError || subscriptionError || paymentError) {
      throw profileError || subscriptionError || paymentError;
    }

    let spentCreditRecordId: string | null = null;
    let documentsRemaining: number | null = null;
    const subscriber = hasSubscriptionEntitlement(profile?.subscription_tier, subscription, paymentRecords);
    if (!subscriber) {
      const credit = await consumeDocumentCredit(admin, userId);
      if (credit.ok) {
        spentCreditRecordId = credit.recordId;
        documentsRemaining = credit.remaining;
      } else if (credit.reason === "exhausted") {
        return new Response(
          JSON.stringify({
            error: "Your Per Document purchase has already been used for a document. Buy another document to generate a new one.",
            code: "document_credit_required",
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      } else if (credit.reason === "contention") {
        return new Response(
          JSON.stringify({ error: "Another document request is in progress. Please try again in a moment." }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      // reason === "no_purchase": unchanged preview flow; exports stay locked until purchase.
    }
    const exportUnlocked = subscriber || spentCreditRecordId !== null;
    const failGeneration = async (message: string, status: number) => {
      if (spentCreditRecordId) {
        const refunded = await refundDocumentCredit(admin, userId, spentCreditRecordId);
        if (!refunded) console.error("Document credit refund failed", { userId, recordId: spentCreditRecordId });
      }
      return new Response(
        JSON.stringify({ error: message }),
        { status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    };

    const systemPrompt = `You draft legal document templates for LegallyAI; you are not a lawyer and do not provide legal advice.\n\nBefore drafting, identify what is known and what is missing. If the request lacks jurisdiction, parties, purpose, key dates, payment terms, or required provisions, clearly mark those items as assumptions or bracketed placeholders rather than inventing them.\n\nProduce a structured, review-ready draft with:\n1. A clear title.\n2. A short "Information needed" list for missing facts.\n3. Numbered headings and complete clauses using bracketed placeholders such as [PARTY NAME], [STATE], and [DATE].\n4. Jurisdiction-specific or high-risk provisions flagged for attorney review.\n5. Signature blocks where appropriate.\n6. A final "Attorney review required" checklist covering jurisdiction, parties, dates, payment terms, termination, dispute resolution, and signing requirements.\n\nNever invent statutes, citations, filing requirements, or case-specific legal conclusions. Make clear that the draft is a template for review by a licensed attorney, not legal advice or an enforceable agreement.`;

    let response: Response | undefined;
    try {
      response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: ANTHROPIC_MODEL,
          max_tokens: 4096,
          system: systemPrompt,
          messages: [{ role: "user", content: normalizedPrompt }],
        }),
      });
    } catch (e) {
      console.error("Anthropic request error:", e);
    }

    if (!response || !response.ok) {
      return await failGeneration("Document generation failed. Please try again.", 502);
    }

    const data = await response.json().catch(() => null);
    const document = data?.content?.find((b: { type?: string }) => b.type === "text")?.text?.trim();
    if (!document) {
      return await failGeneration("No document was returned. Please try again.", 502);
    }

    return new Response(
      JSON.stringify({ document, success: true, exportUnlocked, documentsRemaining }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Document generation failed:", error);
    return new Response(
      JSON.stringify({ error: "Document generation failed. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
