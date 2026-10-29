import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { ContractRedlineStudio } from "@/components/legal/ContractRedlineStudio";
import { SettlementEstimator } from "@/components/legal/SettlementEstimator";
import { PerplexityLegalSearch } from "@/components/legal/PerplexityLegalSearch";

// Tools that used to be stacked on the home page now have their own pages, reachable from the
// tools launcher and the home page's featured row. The components themselves are unchanged.
function ToolShell({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <Layout>
      <div className="container mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Home
        </Link>
        <h1 className="mt-3 text-2xl sm:text-3xl font-display font-bold break-words">{title}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{intro}</p>
        <div className="mt-6 min-w-0">{children}</div>
      </div>
    </Layout>
  );
}

export function ContractReviewPage() {
  return (
    <ToolShell title="Contract Redline & Risk Analyzer" intro="Paste a contract and Lee flags risky clauses, explains them in plain language and suggests redlines.">
      <ContractRedlineStudio />
    </ToolShell>
  );
}

export function SettlementEstimatorPage() {
  return (
    <ToolShell title="Settlement & Damages Estimator" intro="Get a rough range for a claim's value based on the facts you enter. Legal information, not legal advice.">
      <SettlementEstimator />
    </ToolShell>
  );
}

export function LegalResearchPage() {
  return (
    <ToolShell title="Legal Research" intro="Ask a legal question and get a plain-English answer. Check key points with official sources.">
      <PerplexityLegalSearch />
    </ToolShell>
  );
}
