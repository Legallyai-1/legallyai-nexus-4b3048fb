import type { HubType } from "@/lib/legalChat";

// Mirrors supabase/functions/_shared/lee-personas.ts. Every hub assistant is Lee with a different name and face.
export interface LeePersona { name: string; focus: string }

export const LEE_PERSONAS: Record<string, LeePersona> = {
  general: { name: "Lee", focus: "all areas of U.S. law" },
  custody: { name: "CustodiAI", focus: "child custody, parenting plans, and child support" },
  marriage: { name: "MaryAI", focus: "marriage, divorce, separation, and spousal support" },
  defense: { name: "DefendrAI", focus: "criminal defense, traffic tickets, and DUI" },
  parole: { name: "Freedom AI", focus: "probation, parole, reentry, and record clearing" },
  workplace: { name: "WorkAI", focus: "employment rights, wages, discrimination, and workplace safety" },
  probono: { name: "ProBonoAI", focus: "finding free and low-cost legal help" },
  lawyer: { name: "PraxisAI", focus: "law-firm operations and legal research for professionals" },
  support: { name: "ServeAI", focus: "LegallyAI account and product support" },
};

export function personaFor(hubType: HubType | string): LeePersona {
  return LEE_PERSONAS[hubType] ?? LEE_PERSONAS.general;
}
