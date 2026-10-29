// Plain-English legal guides at /guides. Pure data so seo.ts, the sitemap and tests can import it.
// Bodies live in src/content/guides/<slug>.md and are rendered by src/lib/guideMarkdown.tsx.
export interface Guide {
  slug: string;
  /** Page H1. */
  title: string;
  /** <title>, max 60 characters. */
  seoTitle: string;
  /** Meta description and index card summary, 50-160 characters. */
  description: string;
}

export const GUIDES: Guide[] = [
  {
    slug: "how-to-respond-to-an-eviction-notice",
    title: "How to Respond to an Eviction Notice",
    seoTitle: "How to Respond to an Eviction Notice: What to Do First",
    description: "Got an eviction notice? Learn the difference between a notice and a court case, deadlines to watch, possible defenses, and where to find rental help.",
  },
  {
    slug: "how-to-read-a-lease-before-signing",
    title: "How to Read a Lease Before Signing",
    seoTitle: "How to Read a Lease Before Signing: A Renter's Checklist",
    description: "A renter's checklist for reviewing a residential lease: rent and fees, deposits, repairs, entry, renewals, breaking the lease, and red flags.",
  },
  {
    slug: "small-claims-court-step-by-step",
    title: "Small Claims Court, Step by Step",
    seoTitle: "Small Claims Court Step by Step: A Plain-English Guide",
    description: "How small claims court works in the US: checking limits, sending a demand letter, filing, serving, preparing evidence, the hearing, and collecting.",
  },
  {
    slug: "how-to-fight-a-traffic-ticket",
    title: "How to Fight a Traffic Ticket",
    seoTitle: "How to Fight a Traffic Ticket: Options and Steps",
    description: "Your options after a traffic ticket: paying, traffic school, or contesting it. Deadlines, what to bring to court, and mistakes to avoid.",
  },
  {
    slug: "how-child-custody-is-decided",
    title: "How Child Custody Is Decided",
    seoTitle: "How Child Custody Is Decided: Best Interests Explained",
    description: "How US courts decide child custody: legal vs. physical custody, the best interests standard, parenting plans, mediation, and how to prepare.",
  },
  {
    slug: "how-to-file-for-divorce-without-a-lawyer",
    title: "How to File for Divorce Without a Lawyer",
    seoTitle: "How to File for Divorce Without a Lawyer | LegallyAI",
    description: "A plain-English walkthrough of filing for divorce on your own in the US: forms, filing, serving papers, disclosures, and common mistakes to avoid.",
  },
  {
    slug: "how-a-power-of-attorney-works",
    title: "How a Power of Attorney Works",
    seoTitle: "How a Power of Attorney Works: Types, Duties, and Risks",
    description: "What a power of attorney is, the main types, how to create and revoke one, an agent's duties, and how to reduce the risk of misuse.",
  },
];

export const guidePath = (slug: string) => `/guides/${slug}`;
