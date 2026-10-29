import { useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { arePaymentsEnabled } from "@/lib/env";
import {
  canExportHubDocument,
  shouldOfferDocumentPurchase,
  type GeneratedDocumentResult,
} from "@/lib/document-export-entitlement";

/** Worksheet/AI label and the server-driven purchase offer, matching /generate. */
export function HubDocumentStatus({
  result,
  onBuy,
}: {
  result: GeneratedDocumentResult;
  onBuy: () => void;
}) {
  const paymentsEnabled = arePaymentsEnabled();
  const offerPurchase = shouldOfferDocumentPurchase(result, paymentsEnabled);
  const canExport = canExportHubDocument(result, paymentsEnabled);

  // The purchase buys the next generation, not this worksheet: after checkout, say so.
  useEffect(() => {
    if (!offerPurchase || typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel("legallyai-checkout");
    channel.onmessage = (event) => {
      if (event.data?.type === "payment-verified") {
        toast.success("Payment confirmed. Generate again to get your AI-drafted document.");
      }
    };
    return () => channel.close();
  }, [offerPurchase]);
  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-muted-foreground">
        {result.mode === "template"
          ? "Free planning worksheet – this is not the AI-drafted document."
          : "AI-drafted document – have a licensed attorney review it before use."}
      </p>
      {offerPurchase && (
        <div className="p-4 rounded-xl bg-gradient-to-br from-legal-gold/10 to-amber-500/10 border border-legal-gold/30">
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-legal-gold shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-foreground text-sm mb-1">Get the full AI-drafted document</p>
              <p className="text-xs text-muted-foreground mb-3">
                You received the free planning worksheet. $5 buys one AI-drafted document with download unlocked for it. After checkout, generate again to get it (this worksheet stays as-is).
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={onBuy} variant="gold" size="sm">Buy this document – $5</Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/pricing">See subscription plans</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {!canExport && (
        <p className="text-xs text-muted-foreground">
          {result.mode === "template"
            ? offerPurchase
              ? "Download and copy are available for AI-drafted documents you've paid for."
              : "Download and copy aren't available for this free worksheet."
            : "Download and copy aren't unlocked for this document."}
        </p>
      )}
    </div>
  );
}
