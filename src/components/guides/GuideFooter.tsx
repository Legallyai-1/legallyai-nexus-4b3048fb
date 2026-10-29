import { Link } from "react-router-dom";
import { ArrowRight, Info, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Shared close for /guides pages: Ask Lee call to action plus the standard disclaimer. */
export function GuideFooter() {
  return (
    <div className="mt-10 grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="metal-card rounded-3xl p-6 flex flex-col">
        <span className="metal-icon-well h-10 w-10"><MessageSquare className="h-5 w-5" aria-hidden="true" /></span>
        <h2 className="mt-3 font-display text-xl font-bold">Have a question about your situation?</h2>
        <p className="mt-1 text-sm text-[hsl(218_22%_30%)]">Ask Lee in plain English and get general information and next steps to check.</p>
        <Button asChild className="mt-4 gold-tile border-0 font-semibold w-full sm:w-auto self-start">
          <Link to="/chat">Ask Lee a question <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" /></Link>
        </Button>
      </div>
      <aside className="glass-panel rounded-3xl p-6 border-l-4 border-l-[hsl(43_95%_52%)]" aria-label="Legal disclaimer">
        <h2 className="font-display text-lg font-bold flex items-center gap-2">
          <Info className="metal-icon h-5 w-5" aria-hidden="true" /> Legal information, not legal advice
        </h2>
        <p className="mt-2 text-sm text-foreground/90">
          Our guides are general legal information, not legal advice. LegallyAI is not a law firm, and reading a guide
          or using Lee does not create an attorney-client relationship. Rules vary by state; check with your local court
          or a licensed attorney before you act.
        </p>
        <p className="mt-3 text-sm">
          Read the full <Link to="/disclaimer" className="underline font-medium">Legal Disclaimer</Link>.
        </p>
      </aside>
    </div>
  );
}
