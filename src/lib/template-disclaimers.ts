// Legal notices shown on template previews and written at the top of every
// downloaded template file. Keep this the single source of truth.

export const TEMPLATE_DISCLAIMER =
  "This template is general information, not legal advice. Laws vary by state; consult a licensed attorney before signing or filing.";

const SIGNING_FORMALITIES_NOTE =
  "Signing, witness and notarization requirements vary by state. A document that is not signed and witnessed correctly may be invalid.";

export const TEMPLATE_SPECIFIC_NOTES: Record<string, string> = {
  // NDA
  "1": "Enforceability of confidentiality terms, including their length and scope, depends on your state's law.",
  // Residential Lease Agreement
  "5": "Security deposit limits, required disclosures and landlord-tenant rules vary by state and sometimes by city.",
  // Child Custody Agreement
  "8": "Custody and parenting-time terms must be approved by a court to be enforceable, and state rules vary. Courts decide custody based on the child's best interests.",
  // Last Will and Testament
  "14": SIGNING_FORMALITIES_NOTE,
  // Power of Attorney
  "15": SIGNING_FORMALITIES_NOTE,
};

/** Notice lines for a template: the general disclaimer plus any template-specific note. */
export function getTemplateNotices(templateId: string): string[] {
  const note = TEMPLATE_SPECIFIC_NOTES[templateId];
  return note ? [TEMPLATE_DISCLAIMER, note] : [TEMPLATE_DISCLAIMER];
}

/** Text for a downloaded template file, with the notices at the top. */
export function withTemplateNotices(templateId: string, content: string): string {
  const header = getTemplateNotices(templateId).map((line) => `IMPORTANT: ${line}`).join("\n");
  return `${header}\n\n${"-".repeat(60)}\n\n${content}`;
}
