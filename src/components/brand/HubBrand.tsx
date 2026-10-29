import { Link } from "react-router-dom";
import { GlowScales } from "@/components/brand/GlowScales";
import { cn } from "@/lib/utils";

// "legallyai.ai" wordmark with the scales mark, as in the hub mockup (navy text, gold "ai").
export function HubBrand({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link to="/" aria-label="LegallyAI home" className={cn("flex items-center gap-2 font-display font-bold tracking-tight", className)}>
      <GlowScales className="h-6 w-6" sparkles={false} />
      {!compact && (
        <span className="text-lg text-foreground">
          legally<span className="text-[hsl(38_90%_40%)]">ai</span>.ai
        </span>
      )}
    </Link>
  );
}

export default HubBrand;
