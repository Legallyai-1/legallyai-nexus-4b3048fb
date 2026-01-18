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

// Local document generation - NO external API calls
function generateLocalDocument(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();
  const date = new Date().toLocaleDateString("en-US", { 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  });
  
  // NDA Template
  if (lowerPrompt.includes('nda') || lowerPrompt.includes('non-disclosure')) {
    return `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into as of ${date} ("Effective Date") by and between:

**DISCLOSING PARTY:** [Party Name]

**RECEIVING PARTY:** [Party Name]

WHEREAS, the Disclosing Party possesses certain confidential and proprietary information; and

WHEREAS, the Receiving Party desires to receive such confidential information for the purpose of evaluating a potential business relationship;

NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, the parties agree as follows:

1. **DEFINITION OF CONFIDENTIAL INFORMATION**
   "Confidential Information" means any and all technical and non-technical information disclosed by Disclosing Party, including but not limited to: business plans, financial information, customer lists, trade secrets, inventions, know-how, techniques, designs, specifications, and other proprietary information.

2. **OBLIGATIONS OF RECEIVING PARTY**
   The Receiving Party agrees to:
   a) Hold all Confidential Information in strict confidence;
   b) Not disclose Confidential Information to any third parties without prior written consent;
   c) Use Confidential Information solely for the purpose stated above;
   d) Protect Confidential Information with the same degree of care used to protect its own confidential information.

3. **TERM**
   This Agreement shall remain in effect for 2 years from the Effective Date.

4. **RETURN OF MATERIALS**
   Upon request or termination, Receiving Party shall promptly return or destroy all Confidential Information.

5. **GOVERNING LAW**
   This Agreement shall be governed by applicable state law.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the Effective Date.

_______________________________________________

DISCLAIMER: This document is provided for informational purposes only and does not constitute legal advice. Consult with a licensed attorney before using this agreement.`;
  }
  
  // LLC Operating Agreement
  if (lowerPrompt.includes('llc') || lowerPrompt.includes('operating agreement')) {
    return `OPERATING AGREEMENT

This Operating Agreement ("Agreement") is entered into as of ${date}.

Company Name: [Your LLC Name]
State of Formation: [State]

**ARTICLE I - ORGANIZATION**
The Company has been organized as a Limited Liability Company under state law.

**ARTICLE II - MEMBERS**
Initial Members and ownership percentages:
- [Member Name] - [Percentage]%

**ARTICLE III - MANAGEMENT**
The Company shall be managed by its members.

**ARTICLE IV - CAPITAL CONTRIBUTIONS**
Each member has made or shall make initial capital contributions as agreed upon.

**ARTICLE V - DISTRIBUTIONS**
Distributions shall be made to members in proportion to their ownership percentages.

**ARTICLE VI - DISSOLUTION**
The Company shall dissolve upon vote of members or other events as required by law.

IN WITNESS WHEREOF, the members have executed this Agreement.

_______________________________________________

DISCLAIMER: This document is provided for informational purposes only and does not constitute legal advice. Consult with a licensed attorney before using this agreement.`;
  }
  
  // Employment Contract
  if (lowerPrompt.includes('employment') || lowerPrompt.includes('hire') || lowerPrompt.includes('job')) {
    return `EMPLOYMENT AGREEMENT

This Employment Agreement is made as of ${date} between:

**EMPLOYER:** [Company Name]
**EMPLOYEE:** [Employee Name]

1. **POSITION AND DUTIES**
Employee is hired for the position of [Job Title]. Employee agrees to perform all duties assigned by the Company.

2. **COMPENSATION**
The Company shall pay Employee an annual salary of $[Amount], payable in accordance with Company's standard payroll practices.

3. **TERM**
This Agreement shall commence on [Start Date] and continue as at-will employment.

4. **CONFIDENTIALITY**
Employee agrees to maintain strict confidentiality regarding all Company proprietary information.

5. **GOVERNING LAW**
This Agreement shall be governed by applicable state law.

IN WITNESS WHEREOF, the parties have executed this Agreement.

_______________________________________________

DISCLAIMER: This document is provided for informational purposes only and does not constitute legal advice. Consult with a licensed attorney before using this agreement.`;
  }
  
  // Will / Testament
  if (lowerPrompt.includes('will') || lowerPrompt.includes('testament')) {
    return `LAST WILL AND TESTAMENT

I, [Your Name], being of sound mind and memory, do hereby make, publish, and declare this to be my Last Will and Testament.

**ARTICLE I - FAMILY**
[Describe family status]

**ARTICLE II - EXECUTOR**
I nominate and appoint [Executor Name] as Executor of this Will.

**ARTICLE III - DEBTS AND EXPENSES**
I direct my Executor to pay all my just debts, funeral expenses, and costs of estate administration from my estate.

**ARTICLE IV - BEQUESTS**
I give, devise, and bequeath my estate as follows:
[List beneficiaries and their shares]

Date: ${date}

____________________________
Testator Signature

WITNESSES:
[Witness signatures required]

_______________________________________________

DISCLAIMER: This document is provided for informational purposes only and does not constitute legal advice. Estate planning laws vary by state. Consult with a licensed attorney before using this document.`;
  }
  
  // Lease Agreement
  if (lowerPrompt.includes('lease') || lowerPrompt.includes('rental')) {
    return `RESIDENTIAL LEASE AGREEMENT

This Lease Agreement is entered into on ${date} between:

**LANDLORD:** [Landlord Name]
**TENANT:** [Tenant Name]
**PROPERTY:** [Property Address]

1. **TERM**
This Lease shall commence on [Start Date] and continue for [Duration].

2. **RENT**
Tenant shall pay Landlord rent of $[Amount] per month, due on the 1st day of each month.

3. **SECURITY DEPOSIT**
Tenant has deposited $[Amount] as security for performance of obligations.

4. **USE OF PREMISES**
The Property shall be used solely as a residential dwelling.

5. **MAINTENANCE**
Landlord shall maintain the Property in habitable condition. Tenant shall keep the Property clean and report needed repairs promptly.

6. **GOVERNING LAW**
This Lease shall be governed by applicable landlord-tenant laws.

IN WITNESS WHEREOF, the parties have executed this Lease.

_______________________________________________

DISCLAIMER: This document is provided for informational purposes only and does not constitute legal advice. Consult with a licensed attorney before using this agreement.`;
  }
  
  // Generic fallback
  return `LEGAL DOCUMENT

Date: ${date}

Document Request: ${prompt}

This is a template document based on your request. To create a customized legal document:

1. Visit our Generate page
2. Select the document type that best matches your needs
3. Fill in the specific details
4. Download your personalized document

**Available Document Types:**
- Non-Disclosure Agreement (NDA)
- LLC Operating Agreement
- Employment Contract
- Last Will and Testament
- Residential Lease Agreement
- Power of Attorney
- And many more...

If you need a document type not listed, please describe your specific needs and we'll help you create the appropriate document.

_______________________________________________

DISCLAIMER: This is a general template provided for informational purposes only and does not constitute legal advice. Legal requirements vary by jurisdiction. Consult with a licensed attorney to ensure this document meets all legal requirements and properly reflects your specific situation.`;
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

    // Use local template library - NO external API calls
    const document = generateLocalDocument(prompt);

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
