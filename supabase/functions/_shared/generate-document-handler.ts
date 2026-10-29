// Request handler for the generate-document edge function. It lives in _shared with
// injected dependencies (env, Supabase client factory, fetch) so the entitlement and
// credit-refund paths can be unit tested under Node; index.ts only wires in Deno.
//
// Entitlement rule: the paid AI runs ONLY for subscribers (active/trialing) or users who
// spend an unspent Per Document ($5) credit. Everyone else gets the no-cost worksheet,
// never the paid-AI output, with purchaseRequired so the UI can offer the purchase.

import {
  consumeDocumentCredit,
  hasSubscriptionEntitlement,
  refundDocumentCredit,
} from "./document-credits.ts";

// deno-lint-ignore no-explicit-any
type Db = any;

export type GenerateDocumentDeps = {
  env: (name: string) => string | undefined;
  createClient: (url: string, key: string, options: Record<string, unknown>) => Db;
  /** Anthropic key when paid AI is enabled for this deployment, else undefined. */
  anthropicKey: () => string | undefined;
  fetch: typeof fetch;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

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

export function buildNoCostTemplate(prompt: string): string {
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

const SYSTEM_PROMPT = `You draft legal document templates for LegallyAI; you are not a lawyer and do not provide legal advice.\n\nBefore drafting, identify what is known and what is missing. If the request lacks jurisdiction, parties, purpose, key dates, payment terms, or required provisions, clearly mark those items as assumptions or bracketed placeholders rather than inventing them.\n\nProduce a structured, review-ready draft with:\n1. A clear title.\n2. A short "Information needed" list for missing facts.\n3. Numbered headings and complete clauses using bracketed placeholders such as [PARTY NAME], [STATE], and [DATE].\n4. Jurisdiction-specific or high-risk provisions flagged for attorney review.\n5. Signature blocks where appropriate.\n6. A final "Attorney review required" checklist covering jurisdiction, parties, dates, payment terms, termination, dispute resolution, and signing requirements.\n\nNever invent statutes, citations, filing requirements, or case-specific legal conclusions. Make clear that the draft is a template for review by a licensed attorney, not legal advice or an enforceable agreement.`;

export async function handleGenerateDocument(req: Request, deps: GenerateDocumentDeps): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Hoisted so the outer catch can return a credit spent before an unexpected throw.
  let admin: Db = null;
  let userId: string | null = null;
  let spentCreditRecordId: string | null = null;
  const refundSpentCredit = async () => {
    const recordId = spentCreditRecordId;
    spentCreditRecordId = null; // refund at most once
    if (!recordId || !admin || !userId) return;
    const refunded = await refundDocumentCredit(admin, userId, recordId).catch(() => false);
    if (!refunded) console.error("Document credit refund failed", { userId, recordId });
  };

  try {
    const supabaseUrl = deps.env("SUPABASE_URL");
    const supabaseAnonKey = deps.env("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !supabaseAnonKey) {
      return json({ error: "Document generation is temporarily unavailable." }, 503);
    }

    const supabaseClient = deps.createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Authentication required." }, 401);
    }

    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    const { data: userData, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !userData?.user) {
      return json({ error: "Invalid session." }, 401);
    }

    const { prompt } = await req.json();
    if (typeof prompt !== "string" || !prompt.trim() || prompt.length > 12000) {
      return json({ error: "Enter a document request under 12,000 characters." }, 400);
    }

    const normalizedPrompt = prompt.trim();
    const validation = validatePrompt(normalizedPrompt);
    if (!validation.valid) {
      return json({ error: validation.reason }, 400);
    }

    const anthropicKey = deps.anthropicKey();
    const anthropicModel = deps.env("ANTHROPIC_MODEL") || "claude-sonnet-4-20250514";
    if (!anthropicKey) {
      // Paid AI is off for this deployment: everyone gets the worksheet; nothing to buy.
      return json({
        document: buildNoCostTemplate(normalizedPrompt),
        success: true,
        mode: "template",
        exportUnlocked: false,
        purchaseRequired: false,
      });
    }

    // Entitlement: subscribers generate freely; a Per Document ($5) purchase buys exactly
    // one generated document, spent atomically before the paid AI call.
    const serviceRoleKey = deps.env("SUPABASE_SERVICE_ROLE_KEY");
    if (!serviceRoleKey) {
      return json({ error: "Document generation is temporarily unavailable." }, 503);
    }
    admin = deps.createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
    userId = userData.user.id as string;
    const [
      { data: subscription, error: subscriptionError },
      { data: paymentRecords, error: paymentError },
    ] = await Promise.all([
      admin.from("subscriptions").select("status, tier").eq("user_id", userId).maybeSingle(),
      admin.from("payment_records").select("tier, status, expires_at").eq("user_id", userId),
    ]);
    if (subscriptionError || paymentError) {
      throw subscriptionError || paymentError;
    }

    let documentsRemaining: number | null = null;
    const subscriber = hasSubscriptionEntitlement(subscription, paymentRecords);
    if (!subscriber) {
      const credit = await consumeDocumentCredit(admin, userId);
      if (credit.ok) {
        spentCreditRecordId = credit.recordId;
        documentsRemaining = credit.remaining;
      } else if (credit.reason === "contention") {
        return json({ error: "Another document request is in progress. Please try again in a moment." }, 409);
      } else {
        // Not entitled (no purchase, or every purchase already spent): never call the paid
        // AI and never return its output. Serve the no-cost worksheet instead.
        return json({
          document: buildNoCostTemplate(normalizedPrompt),
          success: true,
          mode: "template",
          exportUnlocked: false,
          purchaseRequired: true,
          reason: credit.reason, // "no_purchase" | "exhausted"
        });
      }
    }

    let response: Response | undefined;
    try {
      response = await deps.fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: anthropicModel,
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: normalizedPrompt }],
        }),
      });
    } catch (e) {
      console.error("Anthropic request error:", e);
    }

    if (!response || !response.ok) {
      await refundSpentCredit();
      return json({ error: "Document generation failed. Please try again." }, 502);
    }

    const data = await response.json().catch(() => null);
    const document = data?.content?.find((b: { type?: string }) => b.type === "text")?.text?.trim();
    if (!document) {
      await refundSpentCredit();
      return json({ error: "No document was returned. Please try again." }, 502);
    }

    const result = json({ document, success: true, mode: "ai", exportUnlocked: true, purchaseRequired: false, documentsRemaining });
    spentCreditRecordId = null; // delivered: the credit is now legitimately spent
    return result;
  } catch (error) {
    console.error("Document generation failed:", error);
    await refundSpentCredit();
    return json({ error: "Document generation failed. Please try again." }, 500);
  }
}
