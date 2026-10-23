import { Scale } from "lucide-react";
import { cn } from "@/lib/utils";

// LegallyAI logo mark: glowing gold scales of justice with drifting sparkles (new brand).
// Drop-in replacement for lucide's <Scale />: accepts className for size/colour.
export function GlowScales({ className, sparkles = true }: { className?: string; sparkles?: boolean }) {
  return (
    <span className={cn("relative inline-flex items-center justify-center shrink-0", className)} aria-hidden="true">
      <span className="absolute inset-[-25%] rounded-full bg-[radial-gradient(circle,hsl(45_95%_60%/0.45)_0%,transparent_65%)] animate-pulse" />
      <Scale className="relative h-full w-full text-[hsl(45_95%_62%)] drop-shadow-[0_0_6px_hsl(45_95%_60%/0.9)]" strokeWidth={2.2} />
      {sparkles && (
        <>
          <span className="lai-sparkle" style={{ top: "-10%", left: "8%", animationDelay: "0s" }} />
          <span className="lai-sparkle" style={{ top: "15%", right: "-12%", animationDelay: "0.7s" }} />
          <span className="lai-sparkle" style={{ bottom: "-8%", left: "45%", animationDelay: "1.3s" }} />
          <span className="lai-sparkle" style={{ top: "40%", left: "-14%", animationDelay: "1.9s" }} />
        </>
      )}
    </span>
  );
}

// Full-screen loading screen: glowing scales with sparkles.
export function GlowScalesLoader({ label = "Loading LegallyAI…" }: { label?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4" role="status" aria-live="polite">
      <GlowScales className="h-16 w-16" />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

export default GlowScales;
