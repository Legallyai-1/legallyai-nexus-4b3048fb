import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

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

// Document templates library
const DOCUMENT_TEMPLATES: Record<string, { title: string; content: string; variables: string[] }> = {
  nda: {
    title: "Non-Disclosure Agreement",
    content: `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into on {{date}} between:

Disclosing Party: {{party1_name}}
Address: {{party1_address}}

Receiving Party: {{party2_name}}
Address: {{party2_address}}

1. CONFIDENTIAL INFORMATION
The Disclosing Party agrees to disclose certain confidential information to the Receiving Party for the purpose of {{purpose}}.

2. OBLIGATIONS
The Receiving Party agrees to:
- Keep all confidential information strictly confidential
- Not disclose to any third parties without written consent
- Use information only for the stated purpose
- Return or destroy all materials upon request

3. TERM
This Agreement shall remain in effect for {{duration}} from the date of execution.

4. GOVERNING LAW
This Agreement shall be governed by the laws of {{state}}.

IN WITNESS WHEREOF, the parties have executed this Agreement.

_______________________          _______________________
{{party1_name}}                  {{party2_name}}
Date: ____________               Date: ____________

DISCLAIMER: This is a general template. Consult an attorney for specific legal advice.`,
    variables: ['date', 'party1_name', 'party1_address', 'party2_name', 'party2_address', 'purpose', 'duration', 'state']
  },
  
  lease: {
    title: "Residential Lease Agreement",
    content: `RESIDENTIAL LEASE AGREEMENT

This Lease Agreement is entered into on {{date}} between:

Landlord: {{landlord_name}}
Tenant: {{tenant_name}}

PROPERTY: {{property_address}}
TERM: {{lease_term}} beginning {{start_date}}
RENT: ${{monthly_rent}} per month, due on the {{due_day}} of each month

1. USE OF PREMISES
The premises shall be used solely as a private residence.

2. SECURITY DEPOSIT
Tenant shall pay ${{security_deposit}} as security deposit.

3. UTILITIES
Tenant is responsible for: {{tenant_utilities}}
Landlord is responsible for: {{landlord_utilities}}

4. MAINTENANCE
Tenant agrees to maintain the premises in good condition.

5. TERMINATION
Either party may terminate with {{notice_period}} days written notice.

Landlord Signature: _______________________  Date: ____________
Tenant Signature: _______________________    Date: ____________

DISCLAIMER: This is a general template. Consult an attorney for specific legal advice.`,
    variables: ['date', 'landlord_name', 'tenant_name', 'property_address', 'lease_term', 'start_date', 'monthly_rent', 'due_day', 'security_deposit', 'tenant_utilities', 'landlord_utilities', 'notice_period']
  },
  
  will: {
    title: "Last Will and Testament",
    content: `LAST WILL AND TESTAMENT OF {{testator_name}}

I, {{testator_name}}, residing at {{address}}, being of sound mind, do hereby declare this to be my Last Will and Testament.

1. REVOCATION
I revoke all prior wills and codicils.

2. EXECUTOR
I appoint {{executor_name}} as Executor of this Will.

3. BENEFICIARIES
I give, devise, and bequeath my estate as follows:
{{beneficiary_provisions}}

4. GUARDIAN
If I have minor children, I appoint {{guardian_name}} as their guardian.

5. RESIDUARY ESTATE
All remaining property shall be distributed to {{residuary_beneficiary}}.

Signed this {{date}} at {{city}}, {{state}}.

_______________________
{{testator_name}}, Testator

WITNESSES:
_______________________  _______________________
Witness 1                Witness 2

DISCLAIMER: This is a general template. Consult an attorney for estate planning advice.`,
    variables: ['testator_name', 'address', 'executor_name', 'beneficiary_provisions', 'guardian_name', 'residuary_beneficiary', 'date', 'city', 'state']
  },
  
  contract: {
    title: "Service Agreement",
    content: `SERVICE AGREEMENT

This Agreement is made on {{date}} between:

Service Provider: {{provider_name}}
Client: {{client_name}}

1. SERVICES
Provider agrees to perform: {{service_description}}

2. COMPENSATION
Client agrees to pay ${{payment_amount}} {{payment_terms}}.

3. TERM
This Agreement begins {{start_date}} and {{end_terms}}.

4. TERMINATION
Either party may terminate with {{notice_days}} days written notice.

5. CONFIDENTIALITY
Both parties agree to maintain confidentiality of proprietary information.

6. GOVERNING LAW
This Agreement is governed by the laws of {{state}}.

_______________________          _______________________
{{provider_name}}                {{client_name}}
Date: ____________               Date: ____________

DISCLAIMER: This is a general template. Consult an attorney for specific legal advice.`,
    variables: ['date', 'provider_name', 'client_name', 'service_description', 'payment_amount', 'payment_terms', 'start_date', 'end_terms', 'notice_days', 'state']
  }
};

function extractTemplateType(prompt: string): string | null {
  const lower = prompt.toLowerCase();
  if (lower.includes('nda') || lower.includes('non-disclosure') || lower.includes('confidentiality agreement')) return 'nda';
  if (lower.includes('lease') || lower.includes('rental agreement')) return 'lease';
  if (lower.includes('will') || lower.includes('testament')) return 'will';
  if (lower.includes('contract') || lower.includes('service agreement')) return 'contract';
  return null;
}

function extractVariables(prompt: string, templateType: string): Record<string, string> {
  const template = DOCUMENT_TEMPLATES[templateType];
  const variables: Record<string, string> = {};
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  
  // Set default values
  for (const varName of template.variables) {
    if (varName === 'date') {
      variables[varName] = today;
    } else if (varName === 'state') {
      variables[varName] = 'California';
    } else if (varName.includes('duration')) {
      variables[varName] = '2 years';
    } else if (varName.includes('notice')) {
      variables[varName] = '30';
    } else {
      variables[varName] = `[${varName.replace(/_/g, ' ').toUpperCase()}]`;
    }
  }
  
  return variables;
}

function generateFromTemplate(templateType: string, prompt: string): string {
  const template = DOCUMENT_TEMPLATES[templateType];
  const variables = extractVariables(prompt, templateType);
  
  let doc = template.content;
  for (const [key, value] of Object.entries(variables)) {
    doc = doc.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  
  return doc;
}

function generateFallbackDocument(prompt: string): string {
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  
  // Try to match template type
  const templateType = extractTemplateType(prompt);
  if (templateType) {
    return generateFromTemplate(templateType, prompt);
  }
  
  // Generic document
  return `LEGAL DOCUMENT
${"=".repeat(60)}

Date: ${date}

Document Request: ${prompt}

This document template is based on your request. Please customize the following sections with your specific information:

1. PARTIES INVOLVED
   - Party 1: [NAME AND ADDRESS]
   - Party 2: [NAME AND ADDRESS]

2. PURPOSE
   [Describe the purpose of this document]

3. TERMS AND CONDITIONS
   [List specific terms, obligations, and conditions]

4. DURATION
   This agreement shall be effective from [START DATE] to [END DATE OR ONGOING].

5. GOVERNING LAW
   This document is governed by the laws of [STATE].

6. SIGNATURES
   
   _______________________          Date: ____________
   [PARTY 1 NAME]
   
   _______________________          Date: ____________
   [PARTY 2 NAME]

${"=".repeat(60)}

IMPORTANT DISCLAIMER: This is a general template for informational purposes only. This does NOT constitute legal advice. For documents with legal implications, please consult a licensed attorney in your jurisdiction to ensure the document meets your specific needs and complies with applicable laws.

For professional document preparation, consider:
- Consulting with a lawyer
- Using state-specific forms when available
- Having documents notarized when required
- Keeping copies of all signed documents

LegallyAI provides information only - not legal representation.`;
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
        JSON.stringify({ error: "Authentication required." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !userData.user) {
      return new Response(
        JSON.stringify({ error: "Invalid session." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { prompt } = await req.json();
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
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

    // Generate document from template
    const document = generateFallbackDocument(prompt);

    return new Response(
      JSON.stringify({ document, success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
