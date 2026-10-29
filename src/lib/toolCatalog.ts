// Every tool and hub reachable from the "dots" launcher and the home page's featured row.
// Pure data (no React) so a node test can check each path against the app's real routes.
export type ToolIconKey =
  | "chat" | "generate" | "redline" | "settlement" | "research" | "templates" | "assistants"
  | "custody" | "tickets" | "parole" | "workplace" | "dui" | "will" | "marriage" | "records"
  | "academy" | "probono" | "lawyer" | "business" | "dashboard" | "cases" | "clients" | "jobs"
  | "pricing" | "support";

export interface ToolEntry {
  title: string;
  path: string;
  icon: ToolIconKey;
  description: string;
  group: "Ask Lee" | "Documents & analysis" | "Legal help hubs" | "Learn & find help" | "Firm & business";
  featured?: boolean;
}

export const TOOL_CATALOG: ToolEntry[] = [
  { title: "Ask Lee", path: "/chat", icon: "chat", description: "Chat with your AI legal partner", group: "Ask Lee", featured: true },
  { title: "AI Assistants", path: "/ai-assistants", icon: "assistants", description: "An AI assistant for each topic", group: "Ask Lee" },
  { title: "Document Generator", path: "/generate", icon: "generate", description: "Letters, motions, agreements", group: "Documents & analysis", featured: true },
  { title: "Contract Redline", path: "/contract-review", icon: "redline", description: "Spot risky clauses and get redlines", group: "Documents & analysis", featured: true },
  { title: "Settlement Estimator", path: "/settlement-estimator", icon: "settlement", description: "Estimate damages and claim value", group: "Documents & analysis", featured: true },
  { title: "Legal Research", path: "/research", icon: "research", description: "Plain-English legal research", group: "Documents & analysis", featured: true },
  { title: "Templates", path: "/templates", icon: "templates", description: "Ready-to-use legal forms", group: "Documents & analysis", featured: true },
  { title: "Court Records", path: "/court-records", icon: "records", description: "Find dockets and court sites", group: "Documents & analysis" },
  { title: "Custody Helper", path: "/custody", icon: "custody", description: "Parenting plans and custody prep", group: "Legal help hubs" },
  { title: "Tickets Defense", path: "/tickets-defense", icon: "tickets", description: "Fight traffic tickets", group: "Legal help hubs" },
  { title: "DUI Hub", path: "/dui-hub", icon: "dui", description: "DUI process and defense prep", group: "Legal help hubs" },
  { title: "Probation & Parole", path: "/probation-parole", icon: "parole", description: "Conditions, check-ins, rights", group: "Legal help hubs" },
  { title: "Workplace Rights", path: "/workplace-legal-aid", icon: "workplace", description: "Wages, leave, discrimination", group: "Legal help hubs" },
  { title: "Wills & Estates", path: "/will-hub", icon: "will", description: "Wills and estate planning", group: "Legal help hubs" },
  { title: "Marriage & Divorce", path: "/marriage-divorce", icon: "marriage", description: "Divorce and family law", group: "Legal help hubs" },
  { title: "Legal Academy", path: "/legal-academy", icon: "academy", description: "Learn the law step by step", group: "Learn & find help" },
  { title: "Pro Bono", path: "/pro-bono", icon: "probono", description: "Free legal aid near you", group: "Learn & find help" },
  { title: "Support", path: "/support", icon: "support", description: "Get help with LegallyAI", group: "Learn & find help" },
  { title: "Lawyer Hub", path: "/lawyers", icon: "lawyer", description: "Portal for attorneys", group: "Firm & business" },
  { title: "Dashboard", path: "/dashboard", icon: "dashboard", description: "Your AI workspace", group: "Firm & business" },
  { title: "Business Hub", path: "/business-hub", icon: "business", description: "Practice, billing, trust", group: "Firm & business" },
  { title: "Cases", path: "/cases", icon: "cases", description: "Case files and analysis", group: "Firm & business" },
  { title: "Clients", path: "/clients", icon: "clients", description: "Firm overview", group: "Firm & business" },
  { title: "Pricing", path: "/pricing", icon: "pricing", description: "Plans for people and firms", group: "Firm & business" },
];

export const TOOL_GROUPS: ToolEntry["group"][] = [
  "Ask Lee", "Documents & analysis", "Legal help hubs", "Learn & find help", "Firm & business",
];

export const featuredTools = () => TOOL_CATALOG.filter((t) => t.featured);
