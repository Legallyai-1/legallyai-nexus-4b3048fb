import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Blocked patterns for prompt injection attempts
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

// Local legal knowledge base
const LEGAL_KNOWLEDGE: Record<string, string> = {
  "tenant rights": "In most U.S. states, tenants have the right to: (1) A habitable living space meeting health and safety codes, (2) Privacy - landlords must give 24-48 hours notice before entry, (3) Return of security deposit within 14-30 days after moving out, (4) Protection from discrimination under Fair Housing Act, (5) Right to repair and deduct if landlord doesn't fix serious issues. State laws vary significantly.",
  
  "llc formation": "To form an LLC (Limited Liability Company): (1) Choose a unique business name ending in 'LLC', (2) File Articles of Organization with your state's Secretary of State ($50-500 fee), (3) Create an Operating Agreement (even if not required), (4) Get an EIN from the IRS (free), (5) Register for state taxes, (6) Open a business bank account. LLCs provide personal liability protection and pass-through taxation.",
  
  "contract": "A valid contract requires: (1) Offer - clear proposal, (2) Acceptance - agreement to exact terms, (3) Consideration - something of value exchanged, (4) Legal capacity - parties must be of sound mind and legal age, (5) Legal purpose - contract can't be for illegal activity. Contracts can be oral or written, but certain types (real estate, year+ employment) must be in writing under the Statute of Frauds.",
  
  "divorce": "Divorce requirements vary by state but typically include: (1) Residency requirement (6 months to 1 year), (2) Grounds - most states allow 'no-fault' divorce citing irreconcilable differences, (3) Property division - either community property (50/50 split) or equitable distribution, (4) Custody arrangements for children, (5) Possible spousal support/alimony. Uncontested divorces with agreements are faster and cheaper than contested ones.",
  
  "custody": "Child custody decisions are based on 'best interests of the child' considering: (1) Child's relationship with each parent, (2) Each parent's ability to provide care, (3) Child's adjustment to home/school/community, (4) Mental/physical health of all parties, (5) Child's wishes (if old enough), (6) Any history of domestic violence. Joint custody is increasingly common. Courts can order legal custody (decision-making) and/or physical custody (where child lives).",
  
  "will": "A valid will requires: (1) Testator must be 18+ and of sound mind, (2) Must be in writing, (3) Signed by testator, (4) Witnessed by 2-3 disinterested witnesses (depending on state). Wills should name: executor, beneficiaries, guardians for minor children, and detail asset distribution. Without a will, state intestacy laws determine distribution. Wills should be updated after major life events (marriage, divorce, births).",
  
  "employment law": "Federal employment laws include: (1) Fair Labor Standards Act - minimum wage ($7.25 federal), overtime pay for 40+ hours, (2) Title VII - prohibits discrimination based on race, color, religion, sex, national origin, (3) ADA - requires reasonable accommodations for disabilities, (4) FMLA - 12 weeks unpaid leave for medical/family reasons, (5) OSHA - workplace safety standards. Many states have additional protections. Most employment is 'at-will' but can't be terminated for illegal reasons.",
  
  "small claims": "Small claims court handles disputes under $2,500-$25,000 (varies by state). Process: (1) File complaint with court clerk, (2) Serve defendant, (3) Attend hearing (usually within 30-90 days), (4) Present evidence/witnesses, (5) Judge makes decision same day or within weeks. No lawyers needed (some states prohibit them). Good for: unpaid debts, property damage, broken contracts, security deposit disputes.",
  
  "dui": "DUI/DWI consequences: (1) Criminal penalties - fines ($500-$10,000+), jail time (up to 1 year for first offense), (2) License suspension (3-12 months), (3) Increased insurance rates, (4) Ignition interlock device requirement, (5) DUI school/treatment programs, (6) Permanent criminal record. BAC of 0.08%+ is illegal for adults (21+), 0.04%+ for commercial drivers, any amount for under 21. You have right to refuse tests but face automatic license suspension.",
  
  "personal injury": "Personal injury claims require proving: (1) Duty of care owed, (2) Breach of that duty, (3) Causation - breach caused injury, (4) Damages - actual harm suffered. Common claims: car accidents, slip and fall, medical malpractice, dog bites. Statute of limitations is typically 2-3 years from injury date. Damages can include: medical bills, lost wages, pain and suffering, emotional distress. Most cases settle before trial. Work with insurance companies or file lawsuit if needed.",
  
  "bankruptcy": "Chapter 7 (liquidation): Sells assets to pay debts, discharged in 3-6 months, means test required. Chapter 13 (reorganization): 3-5 year repayment plan, keep assets, for regular income earners. Both require credit counseling. Protections: automatic stay stops collection, foreclosure, repossession. Can't discharge: student loans (usually), recent taxes, child support, alimony, fraud debts. Stays on credit report 7-10 years but can rebuild credit.",
  
  "trademark": "Trademark protects brand names, logos, slogans. Rights established through: (1) Use in commerce (common law rights), or (2) Federal registration with USPTO (stronger protection). Registration process: (1) Search existing marks, (2) File application ($250-$350), (3) Examination (6-9 months), (4) Publication/opposition period, (5) Registration. Benefits: exclusive use, ® symbol, legal presumption of ownership, nationwide protection. Must renew every 10 years.",
  
  "non-disclosure agreement": "NDAs (Confidentiality Agreements) protect sensitive information. Key elements: (1) Definition of confidential information, (2) Obligations of receiving party, (3) Exclusions (public info, independently developed), (4) Duration (1-5 years common), (5) Consequences of breach. Unilateral (one-way) or mutual (two-way). Use before sharing: business plans, trade secrets, proprietary technology, customer lists. Enforceable if reasonable in scope and duration.",
  
  "eviction": "Landlord eviction process: (1) Valid reason - non-payment, lease violation, end of lease, (2) Proper notice (3-30 days depending on reason/state), (3) File unlawful detainer lawsuit if tenant doesn't leave, (4) Court hearing, (5) Sheriff enforces if landlord wins. Landlord can't: change locks, remove belongings, shut off utilities. Tenant defenses: improper notice, retaliation, discrimination, landlord breach, uninhabitable conditions. Process typically takes 2-8 weeks.",
  
  "power of attorney": "POA authorizes someone to act on your behalf. Types: (1) General - broad powers over finances/property, (2) Limited - specific purpose/timeframe, (3) Durable - continues if you become incapacitated, (4) Healthcare/Medical - medical decisions only, (5) Springing - becomes effective upon specific event. Requirements: (1) Principal must have mental capacity, (2) Written document, (3) Notarization (usually required), (4) Agent must be 18+. Can be revoked anytime if principal has capacity."
};

function validateMessage(content: string): { valid: boolean; reason?: string } {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(content)) {
      console.warn("Blocked prompt injection attempt in chat:", content.substring(0, 100));
      return { valid: false, reason: "Invalid request format. Please ask your legal question clearly." };
    }
  }
  return { valid: true };
}

function getLocalAIResponse(message: string): string {
  const lower = message.toLowerCase();
  
  // Keyword matching
  for (const [key, answer] of Object.entries(LEGAL_KNOWLEDGE)) {
    if (lower.includes(key)) {
      return answer + "\n\n**Remember: This is general legal information, not legal advice. For your specific situation, consult a licensed attorney.**";
    }
  }
  
  // Default response
  return `I'm LegallyAI, your legal information assistant. I can help you understand legal concepts in these areas:

• **Tenant Rights** - landlord/tenant law, evictions, security deposits
• **Business Formation** - LLC, corporations, partnerships
• **Contracts** - requirements, enforcement, breaches
• **Family Law** - divorce, custody, wills, power of attorney
• **Employment Law** - workplace rights, discrimination, wages
• **Small Claims** - dispute resolution under $10,000
• **Criminal Law** - DUI, basic rights, defense options
• **Personal Injury** - accidents, liability, claims
• **Bankruptcy** - Chapter 7 vs 13, debt relief
• **Intellectual Property** - trademarks, copyrights basics

Please ask a specific question about any of these topics!

**Remember: This is general legal information, not legal advice. For your specific situation, consult a licensed attorney.**`;
}

// Helper function to create SSE fallback stream
function createSSEFallbackStream(message: string): ReadableStream {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: message } }] })}\n\n`));
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    }
  });
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

    let userId = "anonymous";
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: authError } = await supabaseClient.auth.getUser(token);
      
      if (!authError && userData.user) {
        userId = userData.user.id;
        console.log("Authenticated user for chat:", userId);
      }
    }
    console.log("Chat request from:", userId);

    const { messages, stream = false } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (messages.length > 50) {
      return new Response(
        JSON.stringify({ error: "Too many messages in conversation. Please start a new chat." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const totalContentLength = messages.reduce((acc: number, m: any) => acc + (m.content?.length || 0), 0);
    if (totalContentLength > 50000) {
      return new Response(
        JSON.stringify({ error: "Conversation too long. Please start a new chat." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    for (const message of messages) {
      if (message.content) {
        const validation = validateMessage(message.content);
        if (!validation.valid) {
          return new Response(
            JSON.stringify({ error: validation.reason }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    console.log("Chat request from:", userId, "with", messages.length, "messages");

    // Get the last user message
    const lastUserMessage = messages.filter((m: any) => m.role === "user").pop();
    const userQuery = lastUserMessage?.content || "";

    // Generate response from local knowledge base
    const responseContent = getLocalAIResponse(userQuery);

    // Handle streaming responses
    if (stream) {
      console.log("Streaming response from local knowledge base");
      
      return new Response(
        createSSEFallbackStream(responseContent),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
          },
        }
      );
    }

    // Non-streaming response
    console.log("Response generated from local knowledge, length:", responseContent.length);
    
    return new Response(
      JSON.stringify({ response: responseContent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in legal-chat:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
