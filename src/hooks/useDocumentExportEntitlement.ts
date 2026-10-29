import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { arePaymentsEnabled } from "@/lib/env";
import {
  DOCUMENT_EXPORT_CHECKOUT_MODE,
  DOCUMENT_EXPORT_PRICE_ID,
  canExportDocument,
} from "@/lib/document-export-entitlement";

/**
 * Same export entitlement /generate uses: server-side verify-payment for the
 * signed-in user, refreshed after checkout (BroadcastChannel / window focus),
 * and the same create-checkout price when the user is not entitled.
 */
export function useDocumentExportEntitlement() {
  const navigate = useNavigate();
  const paymentsEnabled = arePaymentsEnabled();
  const [user, setUser] = useState<User | null>(null);
  const [hasPaid, setHasPaid] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyPayment = useCallback(async () => {
    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-payment");
      setHasPaid(!error && data?.hasPaid === true);
    } catch (error) {
      console.error("Error verifying payment:", error);
      setHasPaid(false);
    } finally {
      setIsVerifying(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      setUser(session?.user ?? null);
      if (session?.user && paymentsEnabled) void verifyPayment();
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user && paymentsEnabled) void verifyPayment();
      else setHasPaid(false);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [paymentsEnabled, verifyPayment]);

  const userId = user?.id;
  useEffect(() => {
    if (!userId || !paymentsEnabled) return;
    const channel = typeof BroadcastChannel === "undefined"
      ? null
      : new BroadcastChannel("legallyai-checkout");
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === "payment-verified") void verifyPayment();
    };
    const onFocus = () => void verifyPayment();
    channel?.addEventListener("message", onMessage);
    window.addEventListener("focus", onFocus);
    return () => {
      channel?.removeEventListener("message", onMessage);
      channel?.close();
      window.removeEventListener("focus", onFocus);
    };
  }, [userId, paymentsEnabled, verifyPayment]);

  const canExport = canExportDocument({ paymentsEnabled, hasPaid });

  const startCheckout = useCallback(async () => {
    if (!paymentsEnabled) {
      toast.error("Payments are currently disabled.");
      return;
    }
    if (!user) {
      toast.error("Please sign in first");
      navigate("/auth");
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: DOCUMENT_EXPORT_PRICE_ID, mode: DOCUMENT_EXPORT_CHECKOUT_MODE },
      });
      if (error) {
        console.error("Checkout error:", error);
        toast.error("Failed to start checkout. Please try again.");
        return;
      }
      if (data?.url) window.open(data.url, "_blank");
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred. Please try again.");
    }
  }, [paymentsEnabled, user, navigate]);

  /** Runs `onAllowed` only when entitled; otherwise routes to the /generate checkout. */
  const requireExport = useCallback(
    (onAllowed: () => void) => {
      if (canExport) {
        onAllowed();
        return;
      }
      if (isVerifying) {
        toast.info("Checking your purchase, please try again in a moment.");
        return;
      }
      toast.info("Downloading documents costs $5. Opening checkout…");
      void startCheckout();
    },
    [canExport, isVerifying, startCheckout],
  );

  return { canExport, isVerifying, paymentsEnabled, startCheckout, requireExport };
}
