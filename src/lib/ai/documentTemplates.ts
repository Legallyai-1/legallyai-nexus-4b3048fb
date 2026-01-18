// Document Template Library - No External APIs Required
// Comprehensive legal document templates with variable replacement

export interface DocumentTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  variables: string[];
  content: string;
}

export const DOCUMENT_TEMPLATES: Record<string, DocumentTemplate> = {
  nda: {
    id: 'nda',
    title: 'Non-Disclosure Agreement (NDA)',
    description: 'Protect confidential information shared between parties',
    category: 'Business',
    variables: ['party1_name', 'party2_name', 'effective_date', 'state', 'term_years'],
    content: `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into as of {{effective_date}} ("Effective Date") by and between:

**DISCLOSING PARTY:** {{party1_name}}

**RECEIVING PARTY:** {{party2_name}}

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
   d) Protect Confidential Information with the same degree of care used to protect its own confidential information, but in no case less than reasonable care.

3. **EXCEPTIONS**
   This Agreement does not apply to information that:
   a) Was publicly known at the time of disclosure;
   b) Becomes publicly known through no breach of this Agreement;
   c) Was rightfully received from a third party without breach;
   d) Was independently developed without use of Confidential Information;
   e) Is required to be disclosed by law or court order.

4. **TERM**
   This Agreement shall remain in effect for {{term_years}} years from the Effective Date.

5. **RETURN OF MATERIALS**
   Upon request or termination of this Agreement, Receiving Party shall promptly return or destroy all Confidential Information and certify such destruction in writing.

6. **NO LICENSE**
   Nothing in this Agreement grants any license or rights to the Receiving Party except as expressly stated herein.

7. **GOVERNING LAW**
   This Agreement shall be governed by the laws of the State of {{state}}.

8. **ENTIRE AGREEMENT**
   This Agreement constitutes the entire agreement between the parties concerning confidentiality and supersedes all prior agreements.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the Effective Date.

**DISCLOSING PARTY:**
{{party1_name}}

Signature: _______________________
Date: ___________________________

**RECEIVING PARTY:**
{{party2_name}}

Signature: _______________________
Date: ___________________________

---
DISCLAIMER: This document is provided for informational purposes only and does not constitute legal advice. Consult with a licensed attorney before using this agreement.`
  },

  llc_operating_agreement: {
    id: 'llc_operating_agreement',
    title: 'LLC Operating Agreement',
    description: 'Define ownership and operating procedures for an LLC',
    category: 'Business',
    variables: ['company_name', 'state', 'effective_date', 'member1_name', 'member1_percentage', 'registered_agent'],
    content: `OPERATING AGREEMENT OF {{company_name}}

This Operating Agreement ("Agreement") of {{company_name}}, a {{state}} Limited Liability Company ("Company"), is entered into and effective as of {{effective_date}}.

**ARTICLE I - ORGANIZATION**

1.1 Formation. The Company has been organized as a Limited Liability Company under the laws of the State of {{state}}.

1.2 Name. The name of the Company is {{company_name}}.

1.3 Registered Agent. The registered agent for service of process is {{registered_agent}}.

1.4 Purpose. The Company is organized for the purpose of engaging in any lawful business activity.

**ARTICLE II - MEMBERS**

2.1 Initial Members. The initial member(s) of the Company are:
    - {{member1_name}} - {{member1_percentage}}% ownership

2.2 Limited Liability. No member shall be personally liable for the debts, obligations, or liabilities of the Company.

**ARTICLE III - CAPITAL CONTRIBUTIONS**

3.1 Initial Contributions. Each member has made or shall make initial capital contributions as agreed upon.

3.2 Additional Contributions. No member shall be required to make additional capital contributions without unanimous consent.

**ARTICLE IV - DISTRIBUTIONS**

4.1 Distributions shall be made to members in proportion to their ownership percentages at such times as determined by the members.

**ARTICLE V - MANAGEMENT**

5.1 Member-Managed. The Company shall be managed by its members.

5.2 Voting. Each member shall have voting rights in proportion to their ownership percentage.

5.3 Decisions. Major decisions require majority vote; fundamental changes require unanimous consent.

**ARTICLE VI - MEETINGS**

6.1 Annual Meetings. The members shall meet at least annually.

6.2 Special Meetings. Special meetings may be called by any member with reasonable notice.

**ARTICLE VII - BOOKS AND RECORDS**

7.1 The Company shall maintain complete and accurate books and records at its principal place of business.

7.2 Each member shall have the right to inspect and copy Company records upon reasonable notice.

**ARTICLE VIII - DISSOLUTION**

8.1 The Company shall dissolve upon:
    a) Vote of members holding majority of ownership interests;
    b) Entry of a decree of judicial dissolution;
    c) Any other event requiring dissolution under state law.

**ARTICLE IX - MISCELLANEOUS**

9.1 Governing Law. This Agreement shall be governed by the laws of the State of {{state}}.

9.2 Amendments. This Agreement may be amended only by written consent of all members.

9.3 Severability. If any provision is held invalid, the remaining provisions shall continue in full force.

9.4 Entire Agreement. This Agreement constitutes the entire agreement among the members.

IN WITNESS WHEREOF, the member(s) have executed this Agreement as of the date first written above.

**MEMBER:**
{{member1_name}}

Signature: _______________________
Date: ___________________________

---
DISCLAIMER: This document is provided for informational purposes only and does not constitute legal advice. Consult with a licensed attorney before using this agreement.`
  },

  employment_contract: {
    id: 'employment_contract',
    title: 'Employment Contract',
    description: 'Standard employment agreement between employer and employee',
    category: 'Employment',
    variables: ['company_name', 'employee_name', 'position', 'start_date', 'salary', 'state'],
    content: `EMPLOYMENT AGREEMENT

This Employment Agreement ("Agreement") is made as of {{start_date}} between:

**EMPLOYER:** {{company_name}} ("Company")

**EMPLOYEE:** {{employee_name}} ("Employee")

**1. POSITION AND DUTIES**
Employee is hired for the position of {{position}}. Employee agrees to perform all duties assigned by the Company and devote their full professional time and attention to Company business.

**2. COMPENSATION**
The Company shall pay Employee an annual salary of ${{salary}}, payable in accordance with Company's standard payroll practices.

**3. BENEFITS**
Employee shall be entitled to participate in Company benefit programs available to similarly situated employees, subject to the terms of those programs.

**4. TERM**
This Agreement shall commence on {{start_date}} and continue as at-will employment, meaning either party may terminate the relationship at any time with or without cause or notice.

**5. CONFIDENTIALITY**
Employee agrees to maintain strict confidentiality regarding all Company proprietary information, trade secrets, and confidential business information both during and after employment.

**6. NON-COMPETE**
During employment and for 12 months thereafter, Employee agrees not to engage in any business that directly competes with the Company within a 50-mile radius.

**7. INTELLECTUAL PROPERTY**
All work product, inventions, and intellectual property created by Employee during employment shall be the exclusive property of the Company.

**8. TERMINATION**
Either party may terminate this Agreement at any time with or without cause. Upon termination, Employee shall:
- Return all Company property
- Cease using all Company confidential information
- Receive final compensation for time worked

**9. GOVERNING LAW**
This Agreement shall be governed by the laws of the State of {{state}}.

**10. ENTIRE AGREEMENT**
This Agreement constitutes the entire agreement between the parties and supersedes all prior understandings.

IN WITNESS WHEREOF, the parties have executed this Agreement.

**EMPLOYER:**
{{company_name}}

By: _______________________
Name:
Title:
Date: ___________________________

**EMPLOYEE:**
{{employee_name}}

Signature: _______________________
Date: ___________________________

---
DISCLAIMER: This document is provided for informational purposes only and does not constitute legal advice. Employment laws vary by state. Consult with a licensed attorney before using this agreement.`
  },

  will: {
    id: 'will',
    title: 'Last Will and Testament',
    description: 'Basic will for estate planning',
    category: 'Estate Planning',
    variables: ['testator_name', 'state', 'executor_name', 'beneficiary1_name', 'beneficiary1_share', 'date'],
    content: `LAST WILL AND TESTAMENT

I, {{testator_name}}, of the State of {{state}}, being of sound mind and memory, do hereby make, publish, and declare this to be my Last Will and Testament, hereby revoking all former Wills and Codicils made by me.

**ARTICLE I - FAMILY**
I am currently [married/single/divorced/widowed]. [If applicable: My spouse's name is ________.]

**ARTICLE II - EXECUTOR**
I nominate and appoint {{executor_name}} as Executor of this Will. If {{executor_name}} is unable or unwilling to serve, I nominate _____________ as alternate Executor.

I direct that my Executor serve without bond and have full authority to manage my estate, including the power to sell property, pay debts, and distribute assets.

**ARTICLE III - DEBTS AND EXPENSES**
I direct my Executor to pay all my just debts, funeral expenses, and costs of estate administration from my estate.

**ARTICLE IV - SPECIFIC BEQUESTS**
[List any specific items you want to leave to specific people]

**ARTICLE V - RESIDUARY ESTATE**
I give, devise, and bequeath all the rest, residue, and remainder of my estate, both real and personal, of whatever kind and wherever situated, to:

{{beneficiary1_name}} - {{beneficiary1_share}}%

**ARTICLE VI - GUARDIANSHIP**
[If you have minor children: I nominate _____________ as guardian of my minor children.]

**ARTICLE VII - SIMULTANEOUS DEATH**
If any beneficiary and I die simultaneously or under circumstances making it difficult to determine who died first, it shall be presumed that I survived such beneficiary.

**ARTICLE VIII - CONTEST CLAUSE**
If any beneficiary contests this Will, that person shall receive nothing from my estate.

**ARTICLE IX - GOVERNING LAW**
This Will shall be governed by and construed in accordance with the laws of the State of {{state}}.

IN WITNESS WHEREOF, I have set my hand to this Last Will and Testament on {{date}}.

____________________________
{{testator_name}}, Testator

**WITNESSES:**

We, the undersigned, being first duly sworn, declare to the undersigned authority that the testator signed this instrument as their Last Will and Testament, that they signed willingly, and that each of us, in the presence of the testator and each other, hereby signs this Will as witness, believing the testator to be of sound mind and memory.

Witness #1:
Name: _______________________
Address: ____________________
Signature: ___________________
Date: _______________________

Witness #2:
Name: _______________________
Address: ____________________
Signature: ___________________
Date: _______________________

**NOTARY ACKNOWLEDGMENT**

State of {{state}}
County of ___________

On this ____ day of ________, 20__, before me personally appeared {{testator_name}}, known to me to be the person whose name is subscribed to the foregoing instrument, and acknowledged that they executed the same as their free act and deed.

____________________________
Notary Public
My Commission Expires: ________

---
DISCLAIMER: This document is provided for informational purposes only and does not constitute legal advice. Estate planning laws vary by state. This will should be reviewed by a licensed attorney to ensure it meets all legal requirements and reflects your wishes accurately.`
  },

  lease_agreement: {
    id: 'lease_agreement',
    title: 'Residential Lease Agreement',
    description: 'Rental agreement for residential property',
    category: 'Real Estate',
    variables: ['landlord_name', 'tenant_name', 'property_address', 'rent_amount', 'lease_start', 'lease_term', 'deposit_amount', 'state'],
    content: `RESIDENTIAL LEASE AGREEMENT

This Lease Agreement ("Lease") is entered into on {{lease_start}} between:

**LANDLORD:** {{landlord_name}}
**TENANT:** {{tenant_name}}
**PROPERTY:** {{property_address}}

**1. TERM**
This Lease shall commence on {{lease_start}} and continue for a term of {{lease_term}} months.

**2. RENT**
Tenant shall pay Landlord rent of ${{rent_amount}} per month, due on the 1st day of each month. Rent shall be paid to Landlord at the address specified or as otherwise directed.

Late Fee: If rent is not received by the 5th of the month, a late fee of $50 shall apply.

**3. SECURITY DEPOSIT**
Tenant has deposited ${{deposit_amount}} as security for performance of obligations under this Lease. The deposit shall be returned within 30 days of lease termination, less any lawful deductions.

**4. USE OF PREMISES**
The Property shall be used solely as a residential dwelling for Tenant and immediate family. No commercial use is permitted.

**5. UTILITIES**
Tenant shall be responsible for payment of: [electricity, gas, water, internet, etc.]
Landlord shall be responsible for: [specify]

**6. MAINTENANCE AND REPAIRS**
Landlord shall maintain the Property in habitable condition and make necessary repairs to:
- Structural elements
- Plumbing, heating, and electrical systems
- Appliances provided by Landlord

Tenant shall:
- Keep the Property clean and sanitary
- Dispose of garbage properly
- Not damage the Property
- Report needed repairs promptly
- Be responsible for damage caused by Tenant's negligence

**7. ALTERATIONS**
Tenant shall not make alterations or improvements without Landlord's written consent.

**8. PETS**
[No pets allowed] OR [Pets allowed with additional deposit of $____]

**9. SMOKING**
Smoking is [prohibited / permitted] on the Property.

**10. ACCESS**
Landlord may enter the Property:
- In emergencies without notice
- For repairs, inspections, or showings with 24 hours notice
- With Tenant's consent at any time

**11. SUBLETTING**
Tenant shall not sublet the Property or assign this Lease without Landlord's written consent.

**12. TERMINATION**
Either party may terminate a month-to-month lease with 30 days written notice. For fixed-term leases, early termination may result in penalties as specified below.

**13. DEFAULT**
If Tenant fails to pay rent or violates any lease term, Landlord may:
- Terminate the Lease
- Pursue eviction
- Seek damages

**14. GOVERNING LAW**
This Lease shall be governed by the landlord-tenant laws of the State of {{state}}.

**15. ENTIRE AGREEMENT**
This Lease constitutes the entire agreement between the parties.

IN WITNESS WHEREOF, the parties have executed this Lease.

**LANDLORD:**
{{landlord_name}}

Signature: _______________________
Date: ___________________________

**TENANT:**
{{tenant_name}}

Signature: _______________________
Date: ___________________________

---
DISCLAIMER: This document is provided for informational purposes only and does not constitute legal advice. Landlord-tenant laws vary by state and locality. Consult with a licensed attorney before using this agreement.`
  },

  power_of_attorney: {
    id: 'power_of_attorney',
    title: 'General Power of Attorney',
    description: 'Grant authority to another person to act on your behalf',
    category: 'Estate Planning',
    variables: ['principal_name', 'agent_name', 'effective_date', 'state'],
    content: `GENERAL POWER OF ATTORNEY

KNOW ALL MEN BY THESE PRESENTS:

I, {{principal_name}}, of the State of {{state}} ("Principal"), hereby appoint {{agent_name}} ("Agent" or "Attorney-in-Fact") to act as my true and lawful attorney-in-fact.

**POWERS GRANTED**

Effective {{effective_date}}, I grant my Agent full power and authority to act on my behalf in all matters, including but not limited to:

1. **Financial Transactions:** Manage bank accounts, investments, and financial affairs
2. **Real Property:** Buy, sell, lease, or manage real estate
3. **Personal Property:** Buy, sell, or manage personal property
4. **Business Operations:** Operate my business interests
5. **Legal Matters:** Engage attorneys and represent me in legal proceedings
6. **Tax Matters:** File tax returns and represent me before tax authorities
7. **Insurance:** Purchase, modify, or cancel insurance policies
8. **Government Benefits:** Apply for and manage government benefits
9. **Digital Assets:** Access and manage digital accounts and assets
10. **All Other Acts:** Perform any other acts that I could perform if personally present

**LIMITATIONS**

This Power of Attorney does NOT grant authority to:
- Make healthcare decisions (requires separate Healthcare POA)
- Change my will or estate plan
- Make gifts in excess of $_____ per year
- [Any other specific limitations]

**DURABILITY**

This Power of Attorney shall remain in full force and effect even if I become incapacitated or disabled. This is a DURABLE Power of Attorney.

**EFFECTIVE DATE**

This Power of Attorney is effective immediately and shall continue until:
- I revoke it in writing
- I die
- A court determines I am incapacitated (unless durable)
- [Specific end date if applicable: ________]

**THIRD PARTY RELIANCE**

Any third party who receives a copy of this document may rely upon and act under it. I agree to indemnify any third party for claims arising from reliance on this Power of Attorney during its validity.

**SUCCESSOR AGENT**

If {{agent_name}} is unable or unwilling to serve, I appoint _____________ as successor Agent.

**REVOCATION**

I may revoke this Power of Attorney at any time by providing written notice to my Agent and any third parties who have relied upon it.

**GOVERNING LAW**

This Power of Attorney shall be governed by the laws of the State of {{state}}.

IN WITNESS WHEREOF, I have executed this Power of Attorney on {{effective_date}}.

**PRINCIPAL:**
{{principal_name}}

Signature: _______________________
Date: ___________________________

**STATE OF {{state}}**
**COUNTY OF ____________**

On this ____ day of ________, 20__, before me personally appeared {{principal_name}}, known to me to be the person whose name is subscribed to the foregoing instrument, and acknowledged that they executed the same as their free act and deed.

____________________________
Notary Public
My Commission Expires: ________

**ACCEPTANCE BY AGENT**

I, {{agent_name}}, accept appointment as Attorney-in-Fact and agree to act in the Principal's best interest, with due care and diligence.

Agent Signature: _______________________
Date: ___________________________

---
DISCLAIMER: This document is provided for informational purposes only and does not constitute legal advice. Power of Attorney laws vary by state. Consult with a licensed attorney before using this document.`
  }
};

// Helper function to replace variables in template
export function fillTemplate(templateId: string, variables: Record<string, string>): string {
  const template = DOCUMENT_TEMPLATES[templateId];
  if (!template) {
    throw new Error(`Template ${templateId} not found`);
  }

  let content = template.content;
  
  // Replace all variables in the format {{variable_name}}
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    content = content.split(placeholder).join(value);
  }

  return content;
}

// Helper function to generate document from text prompt
export function generateFromPrompt(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();
  
  // Try to match prompt to a template
  if (lowerPrompt.includes('nda') || lowerPrompt.includes('non-disclosure')) {
    return DOCUMENT_TEMPLATES.nda.content;
  }
  if (lowerPrompt.includes('llc') || lowerPrompt.includes('operating agreement')) {
    return DOCUMENT_TEMPLATES.llc_operating_agreement.content;
  }
  if (lowerPrompt.includes('employment') || lowerPrompt.includes('hire') || lowerPrompt.includes('job contract')) {
    return DOCUMENT_TEMPLATES.employment_contract.content;
  }
  if (lowerPrompt.includes('will') || lowerPrompt.includes('testament')) {
    return DOCUMENT_TEMPLATES.will.content;
  }
  if (lowerPrompt.includes('lease') || lowerPrompt.includes('rental')) {
    return DOCUMENT_TEMPLATES.lease_agreement.content;
  }
  if (lowerPrompt.includes('power of attorney') || lowerPrompt.includes('poa')) {
    return DOCUMENT_TEMPLATES.power_of_attorney.content;
  }

  // Generic fallback document
  const date = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return `LEGAL DOCUMENT
${'='.repeat(70)}

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

---
DISCLAIMER: This is a general template provided for informational purposes only and does not constitute legal advice. Legal requirements vary by jurisdiction. Consult with a licensed attorney in your area to ensure this document meets all legal requirements and properly reflects your specific situation.

For specific legal advice tailored to your circumstances, please consult a licensed attorney.`;
}

export function getTemplateList(): Array<{id: string; title: string; description: string; category: string}> {
  return Object.values(DOCUMENT_TEMPLATES).map(t => ({
    id: t.id,
    title: t.title,
    description: t.description,
    category: t.category
  }));
}
