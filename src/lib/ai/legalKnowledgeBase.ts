// Local AI Knowledge Base - No External APIs Required
// This provides intelligent responses without calling OpenAI or other AI services

export interface KnowledgeEntry {
  keywords: string[];
  response: string;
  category: string;
}

export const LEGAL_KNOWLEDGE_BASE: KnowledgeEntry[] = [
  // General Legal
  {
    keywords: ['what is', 'define', 'meaning of', 'contract'],
    category: 'contract-law',
    response: `A **contract** is a legally binding agreement between two or more parties. For a contract to be valid, it must have:
1. **Offer** - A clear proposal
2. **Acceptance** - Agreement to the terms
3. **Consideration** - Something of value exchanged
4. **Mutual Intent** - Both parties intend to be bound
5. **Capacity** - Parties are legally able to contract
6. **Legality** - The contract purpose must be legal

Remember: This is general legal information, not legal advice. For your specific situation, consult a licensed attorney.`
  },
  {
    keywords: ['nda', 'non-disclosure', 'confidentiality agreement'],
    category: 'contract-law',
    response: `A **Non-Disclosure Agreement (NDA)** is a legal contract that protects confidential information. Key points:
- **Unilateral NDA**: One party shares confidential info
- **Mutual NDA**: Both parties share confidential info
- **Typical Duration**: 1-5 years (negotiable)
- **Must Include**: Definition of confidential info, obligations, exceptions, term, and remedies

You can generate an NDA on our Generate page!

Remember: This is general legal information, not legal advice. For your specific situation, consult a licensed attorney.`
  },
  {
    keywords: ['llc', 'limited liability company', 'business formation'],
    category: 'business-law',
    response: `An **LLC (Limited Liability Company)** combines corporate liability protection with pass-through taxation. Benefits:
- **Limited Liability**: Personal assets protected from business debts
- **Tax Flexibility**: Can be taxed as sole proprietor, partnership, S-corp, or C-corp
- **Fewer Formalities**: Less paperwork than corporations
- **Management Flexibility**: Can be member-managed or manager-managed

Steps to form:
1. Choose a business name
2. File Articles of Organization with your state
3. Create an Operating Agreement
4. Get an EIN from the IRS
5. Register for state taxes

Check our Business Hub for LLC formation assistance!

Remember: This is general legal information, not legal advice. For your specific situation, consult a licensed attorney.`
  },
  {
    keywords: ['custody', 'child custody', 'parenting time'],
    category: 'family-law',
    response: `**Child custody** determines who makes decisions for a child and where they live. Types:
- **Legal Custody**: Right to make major decisions (education, healthcare, religion)
- **Physical Custody**: Where the child primarily lives
- **Joint Custody**: Shared between both parents
- **Sole Custody**: One parent has primary rights

Courts consider the **"best interests of the child"** standard, including:
- Child's age and health
- Parent-child relationship
- Parent's ability to care for child
- Child's preference (if old enough)
- Stability of home environment

Visit our Custody Hub for detailed guidance and document generation!

Remember: This is general legal information, not legal advice. For your specific situation, consult a licensed attorney.`
  },
  {
    keywords: ['divorce', 'dissolution', 'end marriage'],
    category: 'family-law',
    response: `**Divorce** legally ends a marriage. Key aspects:

**Types:**
- **No-Fault**: Based on irreconcilable differences
- **Fault**: Based on grounds like adultery, abuse, abandonment

**Issues to Resolve:**
1. Property division
2. Debt allocation
3. Spousal support (alimony)
4. Child custody and support (if applicable)

**Process:**
1. File petition in family court
2. Serve spouse with papers
3. Respond to petition
4. Discovery (exchange information)
5. Negotiation or mediation
6. Trial (if can't settle)
7. Final decree

Each state has different laws regarding residency requirements, waiting periods, and property division.

Check our Marriage & Divorce page for state-specific guidance!

Remember: This is general legal information, not legal advice. For your specific situation, consult a licensed attorney.`
  },
  {
    keywords: ['employment', 'wrongful termination', 'fired', 'at-will'],
    category: 'employment-law',
    response: `**Employment Law** governs the employer-employee relationship.

**At-Will Employment:** Most U.S. employment is "at-will," meaning either party can end the relationship anytime for any legal reason.

**Exceptions to At-Will:**
- Discrimination (race, gender, age, disability, religion, etc.)
- Retaliation for protected activities (whistleblowing, filing complaints)
- Violation of public policy
- Breach of employment contract
- Violation of implied covenant of good faith

**Protected Rights:**
- Minimum wage and overtime (FLSA)
- Safe workplace (OSHA)
- Freedom from discrimination (Title VII, ADA, ADEA)
- Family and medical leave (FMLA)
- Workers' compensation for injuries

If you believe you were wrongfully terminated, document everything and consult an employment attorney immediately.

Remember: This is general legal information, not legal advice. For your specific situation, consult a licensed attorney.`
  },
  {
    keywords: ['dui', 'dwi', 'drunk driving', 'impaired driving'],
    category: 'criminal-law',
    response: `**DUI/DWI** (Driving Under the Influence/Driving While Intoxicated) is a serious criminal offense.

**Legal Limits:**
- 0.08% BAC for drivers 21+
- 0.04% BAC for commercial drivers
- 0.00-0.02% for drivers under 21 (zero tolerance laws)

**Penalties vary by state but may include:**
- License suspension
- Fines ($1,000-$10,000+)
- Jail time
- Mandatory alcohol education
- Ignition interlock device
- Increased insurance rates

**First offense vs. Multiple offenses:**
- First DUI: Often reduced penalties, possible diversion programs
- Repeat DUI: Enhanced penalties, longer jail time, felony charges possible

**What to do if arrested:**
1. Exercise your right to remain silent
2. Request an attorney immediately
3. Document everything you remember
4. Request DMV hearing within deadline (often 10 days)

Visit our DUI Hub for comprehensive guidance!

Remember: This is general legal information, not legal advice. For your specific situation, consult a licensed attorney.`
  },
  {
    keywords: ['will', 'last will', 'testament', 'estate planning'],
    category: 'estate-law',
    response: `A **Will** (Last Will and Testament) is a legal document that specifies how your assets should be distributed after death.

**Essential Elements:**
- Testator (you) must be 18+ and of sound mind
- Must be in writing
- Signed by testator
- Witnessed (typically 2 witnesses who don't benefit)

**What a Will Can Do:**
- Name beneficiaries for property
- Designate guardian for minor children
- Name executor to manage estate
- Specify funeral wishes
- Create trusts

**What a Will Cannot Do:**
- Control assets in joint tenancy
- Control assets with named beneficiaries (life insurance, 401k)
- Avoid probate entirely

**Without a Will:** State intestacy laws determine who inherits, which may not match your wishes.

Create your will on our Will Hub page!

Remember: This is general legal information, not legal advice. For your specific situation, consult a licensed attorney.`
  },
  {
    keywords: ['lease', 'rental agreement', 'tenant', 'landlord'],
    category: 'real-estate',
    response: `A **Lease Agreement** is a contract between landlord and tenant for rental property.

**Key Terms:**
- **Rent Amount**: Monthly payment due
- **Lease Term**: Duration (month-to-month or fixed term)
- **Security Deposit**: Typically 1-2 months rent (state limits apply)
- **Maintenance Responsibilities**: Who fixes what
- **Utilities**: Who pays for what
- **Pets**: Allowed or prohibited
- **Subletting**: Whether permitted

**Tenant Rights:**
- Habitable living conditions
- Privacy (landlord must give notice before entry)
- No discrimination
- Return of deposit (minus lawful deductions)
- No retaliation for asserting rights

**Landlord Rights:**
- Timely rent payment
- Property maintained in good condition
- Access for repairs (with notice)
- Eviction for lease violations

**Breaking a Lease:** May result in penalties, but some states allow early termination for military deployment, domestic violence, uninhabitable conditions.

Generate a lease agreement on our Generate page!

Remember: This is general legal information, not legal advice. For your specific situation, consult a licensed attorney.`
  },
  {
    keywords: ['power of attorney', 'poa', 'attorney-in-fact'],
    category: 'estate-law',
    response: `**Power of Attorney (POA)** authorizes someone to act on your behalf.

**Types:**
- **General POA**: Broad authority over financial/legal matters
- **Limited/Special POA**: Authority for specific tasks only
- **Durable POA**: Remains valid if you become incapacitated
- **Springing POA**: Takes effect only upon a triggering event
- **Medical/Healthcare POA**: Healthcare decisions only

**Common Uses:**
- Managing finances during absence
- Real estate transactions
- Healthcare decisions
- Business operations

**Important Notes:**
- Principal (you) must be of sound mind when signing
- Can be revoked at any time while you're competent
- Automatically ends at death (executor/personal representative takes over)
- Agent (attorney-in-fact) has fiduciary duty to act in your best interest

**Choose Your Agent Carefully:** This person will have significant power over your affairs.

Remember: This is general legal information, not legal advice. For your specific situation, consult a licensed attorney.`
  },
  {
    keywords: ['trademark', 'copyright', 'patent', 'intellectual property', 'ip'],
    category: 'ip-law',
    response: `**Intellectual Property (IP)** protects creative works and inventions.

**Three Main Types:**

**1. Copyright**
- Protects original works (books, music, art, software)
- Automatic upon creation
- Lasts life of author + 70 years
- Registration needed to sue for infringement

**2. Trademark**
- Protects brand names, logos, slogans
- Distinguishes your goods/services from others
- Can last indefinitely if maintained
- Register with USPTO for federal protection

**3. Patent**
- Protects inventions and processes
- Must be novel, non-obvious, useful
- 20 years from filing date
- Expensive and complex process

**Trade Secrets:** Confidential business information (Coca-Cola formula) protected by keeping it secret.

**Fair Use:** Limited use of copyrighted material for criticism, comment, news, teaching, research.

IP law is complex - consult a specialized attorney for protection strategy.

Remember: This is general legal information, not legal advice. For your specific situation, consult a licensed attorney.`
  },
  {
    keywords: ['small claims', 'sue', 'court', 'lawsuit'],
    category: 'litigation',
    response: `**Small Claims Court** resolves disputes involving smaller amounts of money (typically $2,500-$10,000 depending on state).

**Advantages:**
- No attorney needed
- Simplified procedures
- Faster resolution
- Lower filing fees

**Common Cases:**
- Unpaid debts
- Property damage
- Breach of contract
- Security deposit disputes
- Minor negligence claims

**Process:**
1. Determine if you have jurisdiction
2. Send demand letter first
3. File complaint with court clerk
4. Serve defendant
5. Prepare evidence and witnesses
6. Attend hearing
7. Present your case
8. Judge renders decision
9. Collect judgment (if you win)

**Tips for Success:**
- Organize all documents chronologically
- Bring multiple copies of evidence
- Practice your presentation
- Be professional and stick to facts
- Bring witnesses if available

**Collecting Your Judgment:** Winning is different from collecting. May need garnishment or liens.

Remember: This is general legal information, not legal advice. For your specific situation, consult a licensed attorney.`
  },
  {
    keywords: ['bankruptcy', 'chapter 7', 'chapter 13', 'debt relief'],
    category: 'bankruptcy',
    response: `**Bankruptcy** is a legal process to discharge or reorganize debts you can't pay.

**Chapter 7 - Liquidation**
- Discharge most unsecured debts
- Non-exempt assets may be sold
- Completed in 3-6 months
- Must pass means test

**Chapter 13 - Reorganization**
- Keep assets, repay debts over 3-5 years
- For individuals with regular income
- Can save home from foreclosure
- More expensive but protects more property

**What Can Be Discharged:**
- Credit card debt
- Medical bills
- Personal loans
- Utility bills

**What Cannot Be Discharged:**
- Most student loans
- Child support/alimony
- Recent taxes
- Court fines/penalties
- Debts from fraud

**Consequences:**
- Credit score impact (7-10 years on report)
- Difficulty getting credit
- May affect employment in some fields
- Public record

**Alternatives:** Debt consolidation, credit counseling, debt settlement, negotiation with creditors.

Bankruptcy is a serious decision - consult a bankruptcy attorney.

Remember: This is general legal information, not legal advice. For your specific situation, consult a licensed attorney.`
  },
  // Help and Navigation
  {
    keywords: ['help', 'how to use', 'features', 'what can you do'],
    category: 'general',
    response: `**Welcome to LegallyAI!** I'm here to help with your legal questions. Here's what I can do:

**💬 Legal Chat (You're here!)**
- Answer legal questions
- Explain legal concepts
- Provide general legal information

**📄 Generate Documents**
- NDA, contracts, wills, operating agreements
- Custody agreements, leases, and more
- Visit the Generate page

**⚖️ Specialized Hubs**
- Custody Hub - Child custody guidance
- DUI Hub - DUI defense information
- Will Hub - Estate planning
- Business Hub - Business formation
- And many more!

**🔍 Court Records Search**
- Look up court cases
- Access public records

**👔 Job Board**
- Legal job listings
- Career opportunities

**Ask me any legal question, and I'll provide helpful information!** Just remember, this is general information, not legal advice.

What would you like to know?`
  },
  {
    keywords: ['document', 'generate', 'create', 'template'],
    category: 'general',
    response: `**Document Generation** - I can help you create legal documents!

To generate a document:
1. Visit the **Generate** page (navigation menu)
2. Choose your document type or describe what you need
3. Fill in the required details
4. Get your professionally formatted document

**Available Documents:**
- Contracts (NDA, employment, service agreements)
- Business documents (LLC operating agreement, bylaws)
- Real estate (lease, purchase agreement)
- Estate planning (will, power of attorney)
- Family law (custody agreement, separation agreement)
- And many more!

You can also ask me here: "Generate a [document type] for [purpose]" and I'll guide you through the process.

What type of document do you need?`
  },
  {
    keywords: ['lawyer', 'attorney', 'find lawyer', 'need lawyer'],
    category: 'general',
    response: `**Finding a Lawyer**

While I provide general legal information, you may need a licensed attorney for:
- Court representation
- Complex legal matters
- Personalized legal advice
- Reviewing important documents

**How to Find a Lawyer:**
1. **State Bar Association** - Lawyer referral services
2. **Legal Aid** - Free services if you qualify (check our Pro Bono page!)
3. **Specialized Directories** - Avvo, Martindale-Hubbell, FindLaw
4. **Online Platforms** - LegalZoom, Rocket Lawyer (for simple matters)

**Questions to Ask:**
- Experience with your type of case?
- Fee structure? (hourly, flat fee, contingency)
- Who will handle your case?
- Expected timeline?

**Our Pro Bono page** connects you with free legal resources for those who qualify.

Would you like help with anything else I can assist with?`
  },
  {
    keywords: ['free', 'cost', 'price', 'how much'],
    category: 'general',
    response: `**LegallyAI Pricing**

**✅ Free Tier (No credit card needed!)**
- Unlimited AI chat with me
- Access to all specialized AI assistants
- 1 document generation per day
- Document previews
- All legal hubs and resources

**⭐ Premium - $9.99/month**
- Everything in Free
- Unlimited document generation
- Download documents as PDF
- Priority support
- Advanced features

**👔 Pro (For Lawyers) - $99/month**
- Everything in Premium
- Client management tools
- Case tracking
- Document templates library
- Billing and time tracking

**💼 Enterprise - Custom pricing**
- For law firms and organizations
- Custom integrations
- Dedicated support
- Team collaboration tools

Visit our **Pricing** page to upgrade or start with our free tier today!

The AI chat you're using right now is completely free! How can I help you?`
  },
  // Fallback responses
  {
    keywords: ['thank', 'thanks', 'appreciate'],
    category: 'general',
    response: `You're very welcome! I'm here to help anytime you have legal questions.

Is there anything else I can assist you with today?

Remember: This is general legal information, not legal advice. For your specific situation, consult a licensed attorney.`
  }
];

export function findBestMatch(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Check for exact keyword matches
  for (const entry of LEGAL_KNOWLEDGE_BASE) {
    for (const keyword of entry.keywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        return entry.response;
      }
    }
  }
  
  // Default response if no match found
  return `I understand you're asking about: "${message.substring(0, 100)}..."

While I don't have a specific pre-programmed response for that exact question, I'm here to help with:

📋 **Contract Law** - NDAs, agreements, terms
🏢 **Business Law** - LLC formation, partnerships, corporate law
👨‍👩‍👧 **Family Law** - Custody, divorce, adoption
💼 **Employment Law** - Wrongful termination, discrimination, wages
🚗 **Criminal Law** - DUI, traffic violations, defense
🏠 **Real Estate** - Leases, property, landlord-tenant
📜 **Estate Planning** - Wills, trusts, power of attorney
⚡ **Intellectual Property** - Trademarks, copyrights, patents

**Try asking your question differently**, or visit our specialized hubs for more detailed assistance!

For document generation, visit our **Generate** page.
For specific legal advice, please consult a licensed attorney.

What specific legal topic can I help you with?`;
}

export function getAIResponse(message: string): string {
  return findBestMatch(message);
}
