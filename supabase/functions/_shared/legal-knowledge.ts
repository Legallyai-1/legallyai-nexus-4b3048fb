// In-house, no-cost legal-information engine for LegallyAI.
// Pure TypeScript with no runtime dependencies so it runs in Supabase Edge (Deno)
// and in Node-based regression tests. It never calls an external AI model.
//
// Content is general legal information, intentionally conservative, and always
// points users to official or nonprofit resources for verification.

export interface LegalTopic {
  id: string;
  title: string;
  hubs: string[];
  keywords: string[];
  overview: string;
  steps: string[];
  documents: string[];
  resources: { label: string; url: string }[];
  attorneyWhen: string;
}

export const LEGAL_TOPICS: LegalTopic[] = [
  {
    id: "custody",
    title: "Child custody and parenting time",
    hubs: ["custody", "marriage"],
    keywords: ["custody", "parenting plan", "parenting time", "visitation", "joint custody", "sole custody", "move away", "relocat"],
    overview:
      "Courts decide custody based on the child's best interests. Custody is usually split into legal custody (decision-making) and physical custody (where the child lives). Parents can agree on a parenting plan, and the court can approve it as an order.",
    steps: [
      "Confirm which state or county court has jurisdiction (usually where the child has lived for the last six months).",
      "Check whether any custody order already exists; changing an existing order usually requires a request to modify.",
      "Write a proposed parenting schedule covering school days, weekends, holidays, and exchanges.",
      "Ask the court about mandatory mediation or parenting classes, which many courts require before a hearing.",
      "Follow any current order exactly while a change is pending.",
    ],
    documents: ["Any existing custody or support orders", "The child's school and medical records", "A calendar of time spent with each parent", "Relevant messages kept factual and unedited"],
    resources: [
      { label: "California Courts self-help: custody", url: "https://selfhelp.courts.ca.gov/child-custody" },
      { label: "Find free legal aid (LSC)", url: "https://www.lsc.gov/find-legal-aid" },
      { label: "California Courts: getting legal help", url: "https://selfhelp.courts.ca.gov/getting-legal-help" },
    ],
    attorneyWhen: "There are safety concerns, a parent plans to move away with the child, the other parent has a lawyer, or a hearing date is already set.",
  },
  {
    id: "child-support",
    title: "Child support",
    hubs: ["custody", "marriage"],
    keywords: ["child support", "support payment", "arrears", "back support", "support order"],
    overview:
      "Each state uses a guideline formula based mainly on both parents' incomes and parenting time. Support stays at the ordered amount until a court modifies it, even if circumstances change.",
    steps: [
      "Contact your local child support agency; its services are generally free or low-cost.",
      "If income changed significantly, file a request to modify as soon as possible, because changes usually are not retroactive before the filing date.",
      "Keep records of every payment made or received.",
    ],
    documents: ["Pay stubs and tax returns", "Proof of childcare and health insurance costs", "Existing support order", "Payment history"],
    resources: [
      { label: "Federal Office of Child Support Services", url: "https://www.acf.hhs.gov/css" },
      { label: "California Courts self-help: child support", url: "https://selfhelp.courts.ca.gov/child-support" },
    ],
    attorneyWhen: "There is a large arrears balance, enforcement such as license suspension, or disputed self-employment income.",
  },
  {
    id: "divorce",
    title: "Divorce and legal separation",
    hubs: ["marriage"],
    keywords: ["divorce", "dissolution", "legal separation", "separat", "spousal support", "alimony", "community property", "prenup"],
    overview:
      "Divorce ends a marriage and divides property, debts, and support. States have residency requirements and some have waiting periods. Uncontested cases where spouses agree are usually faster and cheaper.",
    steps: [
      "Check your state's residency requirement before filing.",
      "List all assets and debts, including retirement accounts, and when each was acquired.",
      "Use your court's self-help forms or center to file the initial petition and serve your spouse.",
      "Complete the required financial disclosures.",
      "Try to negotiate or mediate a written settlement before trial.",
    ],
    documents: ["Marriage certificate", "Tax returns and pay stubs", "Bank, retirement, and loan statements", "Property deeds and vehicle titles"],
    resources: [
      { label: "California Courts self-help: divorce", url: "https://selfhelp.courts.ca.gov/divorce-california" },
      { label: "Find free legal aid (LSC)", url: "https://www.lsc.gov/find-legal-aid" },
    ],
    attorneyWhen: "There is a business, significant assets or debts, domestic violence, or a dispute over custody or spousal support.",
  },
  {
    id: "domestic-violence",
    title: "Domestic violence and restraining orders",
    hubs: ["custody", "marriage", "general"],
    keywords: ["restraining order", "protective order", "domestic violence", "abuse", "abusive", "stalking", "threatened me", "hit me"],
    overview:
      "Courts can issue emergency, temporary, and longer-term protective orders. Many courts let you request a temporary order the same day without paying a filing fee.",
    steps: [
      "If you are in immediate danger, call 911.",
      "Contact a domestic violence advocate for safety planning; advocates can help with forms at no cost.",
      "Ask the court clerk or self-help center for restraining-order forms.",
      "Write down incidents with dates and keep evidence such as photos, messages, and medical records in a safe place.",
    ],
    documents: ["Photos of injuries or damage", "Threatening messages or voicemails", "Police report numbers", "Medical records"],
    resources: [
      { label: "National Domestic Violence Hotline (1-800-799-7233)", url: "https://www.thehotline.org" },
      { label: "California Courts self-help: restraining orders", url: "https://selfhelp.courts.ca.gov/restraining-orders" },
    ],
    attorneyWhen: "Always consider an advocate or attorney, especially when children, firearms, or immigration status are involved.",
  },
  {
    id: "eviction",
    title: "Eviction and tenant rights",
    hubs: ["general"],
    keywords: ["evict", "eviction", "landlord", "tenant", "rent", "lease", "notice to quit", "3-day notice", "unlawful detainer", "lockout", "habitab", "repairs"],
    overview:
      "In most states a landlord must give proper written notice and win a court case before a tenant can be removed. Self-help evictions such as changing locks or shutting off utilities are generally illegal. Response deadlines after being served court papers are often very short.",
    steps: [
      "Read every notice or court paper carefully and note the date you received it.",
      "If you were served a court summons, find the response deadline immediately; missing it can result in a default judgment.",
      "Keep paying rent if you can, or keep the money set aside, and get receipts.",
      "Contact local legal aid or a tenant rights organization right away.",
      "Ask about rental-assistance and mediation programs in your area.",
    ],
    documents: ["Lease or rental agreement", "All notices from the landlord", "Rent receipts or bank records", "Photos of repair problems and repair requests"],
    resources: [
      { label: "HUD: tenant rights by state", url: "https://www.hud.gov/topics/rental_assistance/tenantrights" },
      { label: "California Courts self-help: eviction", url: "https://selfhelp.courts.ca.gov/eviction" },
      { label: "Find free legal aid (LSC)", url: "https://www.lsc.gov/find-legal-aid" },
    ],
    attorneyWhen: "You have been served court papers, the landlord locked you out, or you believe the eviction is retaliation or discrimination.",
  },
  {
    id: "security-deposit",
    title: "Security deposits",
    hubs: ["general"],
    keywords: ["security deposit", "deposit back", "deposit return", "move-out", "move out"],
    overview:
      "State law usually sets a deadline for a landlord to return a deposit or give an itemized list of deductions. Normal wear and tear generally cannot be deducted.",
    steps: [
      "Give your landlord a forwarding address in writing.",
      "Compare move-in and move-out photos.",
      "Send a written demand letter citing the itemization you received or did not receive.",
      "If unresolved, consider small claims court.",
    ],
    documents: ["Lease", "Move-in and move-out photos or checklists", "Deposit receipt", "Itemized deduction statement"],
    resources: [
      { label: "California Courts: small claims", url: "https://selfhelp.courts.ca.gov/small-claims-california" },
      { label: "HUD: tenant rights by state", url: "https://www.hud.gov/topics/rental_assistance/tenantrights" },
    ],
    attorneyWhen: "The amount is large or the landlord claims major damage.",
  },
  {
    id: "small-claims",
    title: "Small claims court",
    hubs: ["general"],
    keywords: ["small claims", "sue someone", "owes me money", "sue my", "demand letter", "contractor"],
    overview:
      "Small claims courts handle money disputes up to a state-set limit with simplified procedures. In many states attorneys usually cannot represent parties at the hearing.",
    steps: [
      "Check your state's dollar limit and filing deadline.",
      "Send a written demand letter first; some courts expect it.",
      "File in the correct county and arrange proper service on the other party.",
      "Organize evidence and a short timeline for the judge.",
    ],
    documents: ["Contracts, invoices, or receipts", "Photos", "Messages showing the agreement or the problem", "Your demand letter"],
    resources: [{ label: "California Courts: small claims", url: "https://selfhelp.courts.ca.gov/small-claims-california" }],
    attorneyWhen: "The amount exceeds the small claims limit or you are being sued for a large amount.",
  },
  {
    id: "traffic",
    title: "Traffic tickets",
    hubs: ["defense"],
    keywords: ["ticket", "citation", "speeding", "red light", "traffic court", "points on my license", "suspended license", "license suspended"],
    overview:
      "A traffic citation lists a deadline to respond. Common options are paying, contesting, requesting traffic school where eligible, or asking for a payment plan or fine reduction based on ability to pay.",
    steps: [
      "Find the response or appearance date on the citation and calendar it.",
      "Look up the case on the court's website using the citation number.",
      "Decide whether to pay, contest, or request traffic school or a fine reduction.",
      "If contesting, gather photos, diagrams, and witness information.",
    ],
    documents: ["The citation", "Photos of the location and signs", "Driver's license and registration", "Proof of correction for fix-it tickets"],
    resources: [{ label: "California Courts self-help: traffic", url: "https://selfhelp.courts.ca.gov/traffic" }],
    attorneyWhen: "The ticket could suspend your license, involves a commercial license, a crash with injuries, or a misdemeanor charge.",
  },
  {
    id: "criminal",
    title: "Arrests and criminal charges",
    hubs: ["defense"],
    keywords: ["arrest", "arrested", "criminal charge", "charged with", "dui", "dwi", "misdemeanor", "felony", "warrant", "arraignment", "bail", "public defender"],
    overview:
      "If you are charged with a crime that could lead to jail, you generally have the right to a lawyer, and a public defender may be appointed if you cannot afford one. You have the right to remain silent.",
    steps: [
      "Do not discuss the facts of the case with police, other people, or online without a lawyer.",
      "Write down your court date and appear on time; missing court can lead to a warrant.",
      "Ask for a public defender at your first appearance if you cannot afford a lawyer.",
      "Write down what happened while it is fresh, and share it only with your attorney.",
    ],
    documents: ["Citation, charging papers, or release paperwork", "Bail or bond documents", "Names of possible witnesses"],
    resources: [
      { label: "Find free legal aid (LSC)", url: "https://www.lsc.gov/find-legal-aid" },
      { label: "U.S. Courts: criminal cases", url: "https://www.uscourts.gov/about-federal-courts/types-cases/criminal-cases" },
    ],
    attorneyWhen: "Always. Any criminal charge, DUI, or warrant should be reviewed by a defense attorney or public defender.",
  },
  {
    id: "record-clearing",
    title: "Expungement and record clearing",
    hubs: ["parole", "defense"],
    keywords: ["expunge", "expungement", "seal my record", "record clearing", "clean slate", "criminal record", "background check", "dismiss conviction"],
    overview:
      "Many states let people dismiss, seal, or expunge certain convictions or arrests after conditions such as completing probation are met. Some states now clear eligible records automatically.",
    steps: [
      "Get a copy of your criminal record from your state's justice department or the court.",
      "Check eligibility for each case; rules depend on the offense, sentence, and time passed.",
      "File the petition in the court where each case was handled; fee waivers are often available.",
    ],
    documents: ["Case numbers and conviction dates", "Proof of completing probation, fines, and programs", "Your official record"],
    resources: [
      { label: "California Courts: clean your record", url: "https://selfhelp.courts.ca.gov/clean-your-record" },
      { label: "Find free legal aid (LSC)", url: "https://www.lsc.gov/find-legal-aid" },
    ],
    attorneyWhen: "You have multiple cases, felonies, immigration concerns, or a professional license at stake.",
  },
  {
    id: "supervision",
    title: "Probation, parole, and reentry",
    hubs: ["parole"],
    keywords: ["probation", "parole", "reentry", "re-entry", "released from prison", "supervision", "violation", "po meeting", "parole officer", "probation officer"],
    overview:
      "Supervision conditions are set by the court or parole authority and must be followed exactly. Some conditions can be modified, and early termination may be possible after compliance.",
    steps: [
      "Keep a written copy of all conditions and confirm anything unclear with your supervising officer in writing.",
      "Keep proof of check-ins, tests, payments, employment, and program completion.",
      "If you might miss a requirement, contact your officer before the deadline.",
      "If accused of a violation, ask for a lawyer right away.",
      "Contact reentry programs for help with ID, housing, and jobs.",
    ],
    documents: ["Conditions of supervision", "Program completion certificates", "Pay stubs or proof of employment", "Payment receipts"],
    resources: [
      { label: "Find free legal aid (LSC)", url: "https://www.lsc.gov/find-legal-aid" },
      { label: "CareerOneStop reentry job resources", url: "https://www.careeronestop.org/ResourcesFor/ExOffender/ex-offender.aspx" },
    ],
    attorneyWhen: "You are accused of a violation, arrested, or want to request early termination.",
  },
  {
    id: "wages",
    title: "Unpaid wages and overtime",
    hubs: ["workplace"],
    keywords: ["unpaid wage", "wage", "overtime", "not paid", "final paycheck", "minimum wage", "tips", "meal break", "rest break", "wage theft", "misclassif", "1099"],
    overview:
      "Federal law and state laws set minimum wage, overtime, and final-pay rules. State labor agencies accept wage claims without a lawyer. Claims have filing deadlines.",
    steps: [
      "Write down the dates and hours you worked and what you were paid.",
      "Save pay stubs, schedules, and messages about pay.",
      "File a wage claim with your state labor agency or the U.S. Department of Labor.",
      "Retaliation for complaining about pay is generally illegal; document any retaliation.",
    ],
    documents: ["Pay stubs and W-2 or 1099 forms", "Time records or your own log", "Messages about schedules or pay"],
    resources: [
      { label: "U.S. Department of Labor, Wage and Hour Division", url: "https://www.dol.gov/agencies/whd" },
      { label: "California Labor Commissioner", url: "https://www.dir.ca.gov/dlse/" },
    ],
    attorneyWhen: "Many coworkers are affected, the amount is large, or you were fired after complaining.",
  },
  {
    id: "discrimination",
    title: "Workplace discrimination, harassment, and wrongful termination",
    hubs: ["workplace"],
    keywords: ["discriminat", "harass", "wrongful termination", "fired", "terminated", "retaliat", "hostile work", "eeoc", "disability accommodation", "pregnan"],
    overview:
      "Federal and state laws prohibit discrimination and harassment based on protected traits and protect workers who report it. Many workers are at-will, but firing someone for an illegal reason is not allowed. Charges with the EEOC usually must be filed within 180 days, extended to 300 days in many states.",
    steps: [
      "Write a timeline of incidents with dates, people involved, and witnesses.",
      "Save copies of reviews, emails, and messages you are allowed to keep; do not take confidential company data.",
      "Report the issue internally in writing if it is safe to do so.",
      "Contact the EEOC or your state civil-rights agency promptly because deadlines are strict.",
    ],
    documents: ["Timeline of incidents", "Termination letter or write-ups", "Performance reviews", "Witness names"],
    resources: [
      { label: "EEOC: how to file a charge", url: "https://www.eeoc.gov/how-file-charge-employment-discrimination" },
      { label: "California Civil Rights Department", url: "https://calcivilrights.ca.gov" },
    ],
    attorneyWhen: "You were fired, offered a severance agreement to sign, or a filing deadline is approaching.",
  },
  {
    id: "safety",
    title: "Workplace safety",
    hubs: ["workplace"],
    keywords: ["osha", "unsafe", "workplace injury", "injured at work", "workers comp", "workers' comp", "workers compensation"],
    overview:
      "Employers must provide a workplace free from recognized serious hazards. Workers injured on the job are usually covered by workers' compensation, which has short reporting deadlines.",
    steps: [
      "Report a work injury to your employer in writing as soon as possible.",
      "Get medical care and tell the provider the injury happened at work.",
      "File an OSHA or state safety complaint for hazards.",
    ],
    documents: ["Injury report", "Medical records", "Photos of the hazard", "Witness names"],
    resources: [
      { label: "OSHA: file a complaint", url: "https://www.osha.gov/workers/file-complaint" },
      { label: "California Division of Workers' Compensation", url: "https://www.dir.ca.gov/dwc/" },
    ],
    attorneyWhen: "Your claim was denied, the injury is serious, or you faced retaliation for reporting.",
  },
  {
    id: "debt",
    title: "Debt collection",
    hubs: ["general"],
    keywords: ["debt collector", "collection agency", "collections", "garnish", "sued for debt", "credit card debt", "medical debt", "repossess"],
    overview:
      "Federal law limits what debt collectors can do and lets you request validation of a debt. If you are sued, responding by the deadline is critical to avoid a default judgment and wage garnishment.",
    steps: [
      "Send a written request asking the collector to validate the debt.",
      "Check whether the debt is past your state's statute of limitations before making any payment.",
      "If served with a lawsuit, file a response by the deadline.",
      "Report abusive collection practices to the CFPB.",
    ],
    documents: ["Collection letters", "Account statements", "Court papers if sued", "Payment records"],
    resources: [
      { label: "CFPB: debt collection", url: "https://www.consumerfinance.gov/consumer-tools/debt-collection/" },
      { label: "Find free legal aid (LSC)", url: "https://www.lsc.gov/find-legal-aid" },
    ],
    attorneyWhen: "You were sued, your wages are being garnished, or you are considering bankruptcy.",
  },
  {
    id: "scams",
    title: "Scams, fraud, and identity theft",
    hubs: ["general"],
    keywords: ["scam", "fraud", "identity theft", "stolen identity", "phishing", "scammed"],
    overview:
      "Acting quickly limits damage. Federal resources provide step-by-step recovery plans for identity theft and a place to report fraud.",
    steps: [
      "Contact your bank or card issuer immediately to stop payments.",
      "Report identity theft and get a recovery plan at IdentityTheft.gov.",
      "Place a fraud alert or credit freeze with the credit bureaus.",
      "Report the scam to the FTC and, if appropriate, local police.",
    ],
    documents: ["Transaction records", "Messages from the scammer", "Police or FTC report numbers"],
    resources: [
      { label: "IdentityTheft.gov", url: "https://www.identitytheft.gov" },
      { label: "Report fraud to the FTC", url: "https://reportfraud.ftc.gov" },
    ],
    attorneyWhen: "Large losses, a lawsuit, or criminal charges filed in your name.",
  },
  {
    id: "immigration",
    title: "Immigration",
    hubs: ["general"],
    keywords: ["immigration", "visa", "green card", "deport", "asylum", "uscis", "citizenship", "naturaliz", "daca", "ice "],
    overview:
      "Immigration law is federal and highly technical, and mistakes can have serious consequences. Be cautious of notarios or consultants who are not attorneys or accredited representatives.",
    steps: [
      "Check your case status and official forms only on USCIS.gov.",
      "Keep copies of every document you have filed or received.",
      "Consult a licensed immigration attorney or a DOJ-accredited representative before filing.",
    ],
    documents: ["Passport and I-94", "All USCIS notices", "Any immigration court papers"],
    resources: [
      { label: "USCIS", url: "https://www.uscis.gov" },
      { label: "DOJ list of free legal service providers", url: "https://www.justice.gov/eoir/list-pro-bono-legal-service-providers" },
    ],
    attorneyWhen: "Always, especially if you have immigration court papers, a past arrest, or a removal order.",
  },
  {
    id: "estate",
    title: "Wills, trusts, and estates",
    hubs: ["general"],
    keywords: ["will", "trust", "estate", "probate", "inherit", "power of attorney", "executor", "died without a will", "advance directive"],
    overview:
      "A will states who receives property and who manages the estate. Some assets pass outside a will through beneficiary designations or trusts. Probate is the court process that settles an estate.",
    steps: [
      "List assets and check beneficiary designations on retirement accounts and life insurance.",
      "Use your state's signing and witness requirements for a will to be valid.",
      "Consider a power of attorney and an advance health care directive.",
      "If handling a loved one's estate, check whether a small-estate procedure applies.",
    ],
    documents: ["List of assets and debts", "Existing wills or trusts", "Death certificate if settling an estate"],
    resources: [
      { label: "California Courts self-help: wills and estates", url: "https://selfhelp.courts.ca.gov/wills-estates-probate" },
      { label: "Find free legal aid (LSC)", url: "https://www.lsc.gov/find-legal-aid" },
    ],
    attorneyWhen: "There is real estate, a business, a blended family, or a dispute among heirs.",
  },
  {
    id: "business-formation",
    title: "Starting a business and forming an LLC",
    hubs: ["general", "business"],
    keywords: ["llc", "form a business", "start a business", "starting a business", "incorporat", "corporation", "sole proprietor", "partnership", "business structure", "ein", "register my business", "dba", "business license"],
    overview:
      "Common structures are sole proprietorships, partnerships, LLCs, and corporations. An LLC is formed by filing articles of organization with your state's business filing office, usually the Secretary of State, and generally separates business liabilities from personal assets when formalities are followed.",
    steps: [
      "Choose a structure based on liability protection, taxes, and paperwork; SBA's comparison guide is a good starting point.",
      "Check that your business name is available in your state's business-entity search.",
      "File formation documents with your state and appoint a registered agent.",
      "Get a free Employer Identification Number (EIN) from the IRS if you will have employees or a multi-member LLC, or if your bank requires one.",
      "Write an operating agreement, open a separate business bank account, and check state annual report and fee requirements.",
      "Ask your city or county about local business licenses and permits.",
    ],
    documents: ["Proposed business name and address", "Registered agent information", "Owner names and ownership percentages", "Operating agreement"],
    resources: [
      { label: "SBA: choose a business structure", url: "https://www.sba.gov/business-guide/launch-your-business/choose-business-structure" },
      { label: "SBA: register your business", url: "https://www.sba.gov/business-guide/launch-your-business/register-your-business" },
      { label: "IRS: get an EIN (free)", url: "https://www.irs.gov/businesses/small-businesses-self-employed/get-an-employer-identification-number" },
    ],
    attorneyWhen: "There are multiple owners, outside investors, a regulated industry, or significant liability risk.",
  },
  {
    id: "contracts",
    title: "Contracts and freelance agreements",
    hubs: ["general", "business"],
    keywords: ["contract", "freelance", "independent contractor agreement", "statement of work", "scope of work", "breach", "agreement", "nda", "non-disclosure", "terms of service", "invoice not paid", "client won't pay"],
    overview:
      "A contract is an enforceable agreement. Written contracts reduce disputes by clearly stating who does what, by when, and for how much. Some contracts must be in writing to be enforceable under state law.",
    steps: [
      "Name the parties and describe the scope of work or deliverables precisely.",
      "State the price, payment schedule, late fees, and how expenses are handled.",
      "Set deadlines, how changes to the scope are approved, and what counts as acceptance.",
      "Cover ownership of work product and intellectual property, confidentiality, and termination rights.",
      "Include how disputes are resolved, which state's law applies, and any liability limits.",
      "Get signatures from both parties and keep a copy; confirm changes in writing.",
    ],
    documents: ["Signed contract and any amendments", "Invoices and payment records", "Emails confirming scope or changes", "Proof of delivered work"],
    resources: [
      { label: "IRS: self-employed tax center", url: "https://www.irs.gov/businesses/small-businesses-self-employed/self-employed-individuals-tax-center" },
      { label: "SBA: local business assistance", url: "https://www.sba.gov/local-assistance" },
      { label: "California Courts: small claims", url: "https://selfhelp.courts.ca.gov/small-claims-california" },
    ],
    attorneyWhen: "The contract is high-value, involves intellectual property or non-competes, or the other side has breached and you are considering a lawsuit.",
  },
  {
    id: "pro-bono",
    title: "Finding free or low-cost legal help",
    hubs: ["probono", "general"],
    keywords: ["pro bono", "free lawyer", "free legal", "legal aid", "afford a lawyer", "cheap lawyer", "low cost lawyer"],
    overview:
      "Legal aid organizations provide free civil legal help to eligible low-income people. State bar lawyer referral services can connect you with attorneys for a reduced-fee first consultation.",
    steps: [
      "Search for legal aid in your area using LSC's directory or LawHelp.org.",
      "Contact your state bar's lawyer referral service.",
      "Ask your local court's self-help center for free form and procedure help.",
      "Law school clinics also take some cases.",
    ],
    documents: ["Proof of income for eligibility screening", "Any court papers or deadlines"],
    resources: [
      { label: "Find free legal aid (LSC)", url: "https://www.lsc.gov/find-legal-aid" },
      { label: "LawHelp.org", url: "https://www.lawhelp.org" },
      { label: "American Bar Association free legal help", url: "https://www.americanbar.org/groups/legal_services/flh-home/" },
    ],
    attorneyWhen: "Use these resources to reach one.",
  },
];

const STATES: [string, string][] = [
  ["alabama", "AL"], ["alaska", "AK"], ["arizona", "AZ"], ["arkansas", "AR"], ["california", "CA"], ["colorado", "CO"],
  ["connecticut", "CT"], ["delaware", "DE"], ["florida", "FL"], ["georgia", "GA"], ["hawaii", "HI"], ["idaho", "ID"],
  ["illinois", "IL"], ["indiana", "IN"], ["iowa", "IA"], ["kansas", "KS"], ["kentucky", "KY"], ["louisiana", "LA"],
  ["maine", "ME"], ["maryland", "MD"], ["massachusetts", "MA"], ["michigan", "MI"], ["minnesota", "MN"],
  ["mississippi", "MS"], ["missouri", "MO"], ["montana", "MT"], ["nebraska", "NE"], ["nevada", "NV"],
  ["new hampshire", "NH"], ["new jersey", "NJ"], ["new mexico", "NM"], ["new york", "NY"], ["north carolina", "NC"],
  ["north dakota", "ND"], ["ohio", "OH"], ["oklahoma", "OK"], ["oregon", "OR"], ["pennsylvania", "PA"],
  ["rhode island", "RI"], ["south carolina", "SC"], ["south dakota", "SD"], ["tennessee", "TN"], ["texas", "TX"],
  ["utah", "UT"], ["vermont", "VT"], ["virginia", "VA"], ["washington", "WA"], ["west virginia", "WV"],
  ["wisconsin", "WI"], ["wyoming", "WY"], ["district of columbia", "DC"],
];

// Two-letter codes that are also common English words are only accepted in uppercase.
const AMBIGUOUS_CODES = new Set(["IN", "OR", "ME", "OK", "HI", "OH", "LA", "MA", "PA", "DE", "AL", "CO", "ID", "MD", "MI", "MO", "MS", "MT", "NE", "SC", "VA", "WA"]);
const CALIFORNIA_CITIES = ["sacramento", "los angeles", "san diego", "san francisco", "san jose", "fresno", "oakland", "long beach", "bakersfield", "riverside", "stockton", "elk grove", "roseville", "modesto"];

export function detectState(text: string): { name: string; code: string } | null {
  const lower = ` ${text.toLowerCase().replace(/[^a-z]+/g, " ")} `;
  // Prefer longer names first so "west virginia" wins over "virginia".
  const byLength = [...STATES].sort((a, b) => b[0].length - a[0].length);
  for (const [name, code] of byLength) {
    if (lower.includes(` ${name} `)) return { name: titleCase(name), code };
  }
  if (CALIFORNIA_CITIES.some((city) => lower.includes(` ${city} `))) return { name: "California", code: "CA" };
  const tokens = text.match(/\b[A-Za-z]{2}\b/g) ?? [];
  for (const token of tokens) {
    const upper = token.toUpperCase();
    const match = STATES.find(([, code]) => code === upper);
    if (!match) continue;
    if (AMBIGUOUS_CODES.has(upper) && token !== upper) continue;
    return { name: titleCase(match[0]), code: upper };
  }
  return null;
}

function titleCase(value: string): string {
  return value.replace(/\b\w/g, (c) => c.toUpperCase());
}

const EMERGENCY_PATTERN = /\b(kill myself|suicid|end my life|hurt myself|in danger right now|going to kill|he has a gun|she has a gun)\b/i;

export function isEmergency(text: string): boolean {
  return EMERGENCY_PATTERN.test(text);
}

export function scoreTopics(text: string, hubType: string): { topic: LegalTopic; score: number }[] {
  const lower = text.toLowerCase();
  return LEGAL_TOPICS.map((topic) => {
    let score = 0;
    for (const kw of topic.keywords) {
      if (kw === "will") {
        if (/\b(my|a|the) will\b|\bwill and testament\b/.test(lower)) score += 2;
        continue;
      }
      if (lower.includes(kw)) score += kw.includes(" ") ? 3 : 2;
    }
    if (score > 0 && topic.hubs.includes(hubType)) score += 1;
    return { topic, score };
  })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);
}

function formatTopic(topic: LegalTopic, state: { name: string; code: string } | null): string {
  const resources = topic.resources.filter((r) => {
    if (!state || state.code === "CA") return true;
    // Hide California-specific links when the user named another state.
    return !/california|\.ca\.gov/i.test(r.label + r.url);
  });
  if (resources.length === 0) resources.push({ label: "Find free legal aid (LSC)", url: "https://www.lsc.gov/find-legal-aid" });
  const lines = [
    `## ${topic.title}`,
    topic.overview,
    "",
    "### Practical next steps",
    ...topic.steps.map((step, index) => `${index + 1}. ${step}`),
    "",
    "### Documents to gather",
    ...topic.documents.map((doc) => `- ${doc}`),
    "",
    "### Official and nonprofit resources",
    ...resources.map((r) => `- [${r.label}](${r.url})`),
  ];
  if (state && state.code !== "CA") {
    lines.push(`- Search for the ${state.name} courts self-help center for state-specific forms and rules.`);
  }
  lines.push("", `### When to talk to a lawyer`, topic.attorneyWhen);
  return lines.join("\n");
}

export interface KnowledgeAnswer {
  text: string;
  topics: string[];
  state: string | null;
  emergency: boolean;
}

export function answerFromKnowledge(messages: { role: string; content: string }[], hubType: string): KnowledgeAnswer {
  const userText = messages.filter((m) => m.role === "user").map((m) => m.content).join("\n");
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const state = detectState(userText);

  if (isEmergency(lastUser)) {
    return {
      emergency: true,
      topics: [],
      state: state?.code ?? null,
      text: [
        "If you or someone else is in immediate danger, call 911 now.",
        "If you are thinking about suicide or self-harm, call or text 988 to reach the 988 Suicide & Crisis Lifeline, available 24/7.",
        "For domestic violence support, call the National Domestic Violence Hotline at 1-800-799-7233 or visit [thehotline.org](https://www.thehotline.org).",
        "When you are safe, I can help you understand protective orders and next steps.",
      ].join("\n\n"),
    };
  }

  // Score the latest message first; fall back to the whole conversation for follow-ups.
  let ranked = scoreTopics(lastUser, hubType);
  if (ranked.length === 0) ranked = scoreTopics(userText, hubType);
  const chosen = ranked.slice(0, 2).filter((entry, index) => index === 0 || entry.score >= ranked[0].score - 1);

  const intro = state
    ? `Here is general legal information. I noted ${state.name}; rules vary by state, so confirm details with official ${state.name} sources.`
    : "Here is general legal information. Rules vary by state; tell me your state for more specific resources.";

  const footer =
    "This is general legal information from LegallyAI's built-in legal guide, not legal advice, and no attorney-client relationship is created. Verify deadlines with the court or agency, and avoid sharing names, case numbers, or confidential documents here.";

  if (chosen.length === 0) {
    const menu = LEGAL_TOPICS.map((t) => `- ${t.title}`).join("\n");
    return {
      emergency: false,
      topics: [],
      state: state?.code ?? null,
      text: [
        intro,
        "I could not match your question to a topic in the built-in legal guide yet. Try describing it with a few key words, for example \"landlord gave me an eviction notice in California\". Topics I can help with:",
        menu,
        "You can also find free legal aid near you through [LSC](https://www.lsc.gov/find-legal-aid).",
        footer,
      ].join("\n\n"),
    };
  }

  return {
    emergency: false,
    topics: chosen.map((c) => c.topic.id),
    state: state?.code ?? null,
    text: [intro, ...chosen.map((c) => formatTopic(c.topic, state)), "---", footer].join("\n\n"),
  };
}
