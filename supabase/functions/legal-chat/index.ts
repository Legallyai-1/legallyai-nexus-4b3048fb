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

function validateMessage(content: string): { valid: boolean; reason?: string } {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(content)) {
      console.warn("Blocked prompt injection attempt in chat:", content.substring(0, 100));
      return { valid: false, reason: "Invalid request format. Please ask your legal question clearly." };
    }
  }
  return { valid: true };
}

// Local AI Knowledge Base - No External APIs
function getLocalAIResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Contract Law
  if (lowerMessage.includes('contract') || lowerMessage.includes('agreement')) {
    return `A **contract** is a legally binding agreement between two or more parties. For a contract to be valid, it must have:\n1. **Offer** - A clear proposal\n2. **Acceptance** - Agreement to the terms\n3. **Consideration** - Something of value exchanged\n4. **Mutual Intent** - Both parties intend to be bound\n5. **Capacity** - Parties are legally able to contract\n6. **Legality** - The contract purpose must be legal\n\nRemember: This is general legal information, not legal advice. For your specific situation, consult a licensed attorney.`;
  }
  
  if (lowerMessage.includes('nda') || lowerMessage.includes('non-disclosure')) {
    return `A **Non-Disclosure Agreement (NDA)** protects confidential information. Key points:\n- **Unilateral NDA**: One party shares confidential info\n- **Mutual NDA**: Both parties share confidential info\n- **Typical Duration**: 1-5 years (negotiable)\n- **Must Include**: Definition of confidential info, obligations, exceptions, term, and remedies\n\nYou can generate an NDA on our Generate page!\n\nRemember: This is general legal information, not legal advice. For your specific situation, consult a licensed attorney.`;
  }
  
  // Business Law
  if (lowerMessage.includes('llc') || lowerMessage.includes('limited liability')) {
    return `An **LLC (Limited Liability Company)** combines corporate liability protection with pass-through taxation. Benefits:\n- **Limited Liability**: Personal assets protected from business debts\n- **Tax Flexibility**: Can be taxed as sole proprietor, partnership, S-corp, or C-corp\n- **Fewer Formalities**: Less paperwork than corporations\n- **Management Flexibility**: Can be member-managed or manager-managed\n\nSteps to form:\n1. Choose a business name\n2. File Articles of Organization\n3. Create an Operating Agreement\n4. Get an EIN from the IRS\n5. Register for state taxes\n\nCheck our Business Hub for LLC formation assistance!\n\nRemember: This is general legal information, not legal advice.`;
  }
  
  // Family Law
  if (lowerMessage.includes('custody') || lowerMessage.includes('child custody')) {
    return `**Child custody** determines who makes decisions for a child and where they live. Types:\n- **Legal Custody**: Right to make major decisions\n- **Physical Custody**: Where child primarily lives\n- **Joint Custody**: Shared between both parents\n- **Sole Custody**: One parent has primary rights\n\nCourts consider the **"best interests of the child"** standard.\n\nVisit our Custody Hub for detailed guidance!\n\nRemember: This is general legal information, not legal advice.`;
  }
  
  if (lowerMessage.includes('divorce')) {
    return `**Divorce** legally ends a marriage. Key aspects:\n\n**Types:**\n- **No-Fault**: Based on irreconcilable differences\n- **Fault**: Based on grounds like adultery, abuse\n\n**Issues to Resolve:**\n1. Property division\n2. Debt allocation\n3. Spousal support\n4. Child custody and support\n\nCheck our Marriage & Divorce page for state-specific guidance!\n\nRemember: This is general legal information, not legal advice.`;
  }
  
  // Criminal Law
  if (lowerMessage.includes('dui') || lowerMessage.includes('dwi')) {
    return `**DUI/DWI** (Driving Under the Influence) is a serious criminal offense.\n\n**Legal Limits:**\n- 0.08% BAC for drivers 21+\n- 0.04% BAC for commercial drivers\n- 0.00-0.02% for drivers under 21\n\n**Penalties may include:**\n- License suspension\n- Fines ($1,000-$10,000+)\n- Jail time\n- Mandatory alcohol education\n\nVisit our DUI Hub for comprehensive guidance!\n\nRemember: This is general legal information, not legal advice.`;
  }
  
  // Estate Planning
  if (lowerMessage.includes('will') || lowerMessage.includes('testament')) {
    return `A **Will** (Last Will and Testament) specifies how your assets should be distributed after death.\n\n**Essential Elements:**\n- Testator must be 18+ and of sound mind\n- Must be in writing\n- Signed by testator\n- Witnessed (typically 2 witnesses)\n\n**What a Will Can Do:**\n- Name beneficiaries for property\n- Designate guardian for minor children\n- Name executor to manage estate\n\nCreate your will on our Will Hub page!\n\nRemember: This is general legal information, not legal advice.`;
  }
  
  // Help and Navigation
  if (lowerMessage.includes('help') || lowerMessage.includes('how to use')) {
    return `**Welcome to LegallyAI!** I'm here to help with your legal questions. Here's what I can do:\n\n**💬 Legal Chat (You're here!)**\n- Answer legal questions\n- Explain legal concepts\n- Provide general legal information\n\n**📄 Generate Documents**\n- NDA, contracts, wills, operating agreements\n- Visit the Generate page\n\n**⚖️ Specialized Hubs**\n- Custody Hub, DUI Hub, Will Hub, Business Hub, and more!\n\nAsk me any legal question, and I'll provide helpful information!`;
  }
  
  if (lowerMessage.includes('document') || lowerMessage.includes('generate')) {
    return `**Document Generation** - I can help you create legal documents!\n\nTo generate a document:\n1. Visit the **Generate** page (navigation menu)\n2. Choose your document type or describe what you need\n3. Fill in the required details\n4. Get your professionally formatted document\n\n**Available Documents:**\n- Contracts (NDA, employment, service agreements)\n- Business documents (LLC operating agreement)\n- Real estate (lease agreements)\n- Estate planning (will, power of attorney)\n- And many more!\n\nWhat type of document do you need?`;
  }
  
  // Generic fallback
  return `I understand you're asking about legal matters. While I don't have a specific pre-programmed response for that exact question, I'm here to help with:\n\n📋 **Contract Law** - NDAs, agreements, terms\n🏢 **Business Law** - LLC formation, partnerships\n👨‍👩‍👧 **Family Law** - Custody, divorce\n💼 **Employment Law** - Wrongful termination, discrimination\n🚗 **Criminal Law** - DUI, traffic violations\n🏠 **Real Estate** - Leases, property\n📜 **Estate Planning** - Wills, trusts, power of attorney\n\n**Try asking your question differently**, or visit our specialized hubs for more detailed assistance!\n\nFor document generation, visit our **Generate** page.\nFor specific legal advice, please consult a licensed attorney.\n\nWhat specific legal topic can I help you with?`;
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
    const userMessage = messages[messages.length - 1]?.content || "";
    
    // Use local AI knowledge base - NO external API calls
    const localResponse = getLocalAIResponse(userMessage);
    
    console.log("Generated local response, length:", localResponse.length);
    
    if (stream) {
      return new Response(
        createSSEFallbackStream(localResponse),
        { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } }
      );
    }
    
    return new Response(
      JSON.stringify({ response: localResponse }),
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
