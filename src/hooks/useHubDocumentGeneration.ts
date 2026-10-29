import { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { arePaymentsEnabled } from "@/lib/env";
import { openCheckoutInNewTab, readCheckoutError } from "@/lib/checkout";
import {
  DOCUMENT_EXPORT_CHECKOUT_MODE,
  DOCUMENT_EXPORT_PRICE_ID,
  invokeWithContentionRetry,
  parseGenerateDocumentResponse,
  type GenerateInvokeOutcome,
  type GeneratedDocumentResult,
} from "@/lib/document-export-entitlement";

export interface HubDocumentOutcome {
  /** Set on success; null with `error` on failure. */
  result: GeneratedDocumentResult | null;
  error: string | null;
  needsSignIn: boolean;
}

async function invokeGenerateDocument(body: Record<string, unknown>): Promise<GenerateInvokeOutcome> {
  const { data, error } = await supabase.functions.invoke("generate-document", { body });
  if (!error) return { data, status: 200, errorMessage: null };
  const context = (error as { context?: unknown }).context;
  const response = context instanceof Response ? context : null;
  const errorBody = response ? await response.clone().json().catch(() => null) : null;
  return {
    data: null,
    status: response?.status ?? null,
    errorMessage: typeof errorBody?.error === "string" ? errorBody.error : null,
  };
}

/** Calls generate-document (same function as /generate); entitlement comes from its response. */
export async function requestHubDocument(body: Record<string, unknown>): Promise<HubDocumentOutcome> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return { result: null, error: "Please sign in to generate documents", needsSignIn: true };

  const outcome = await invokeWithContentionRetry(() => invokeGenerateDocument(body));
  if (outcome.status === 401) {
    return { result: null, error: "Please sign in to generate documents", needsSignIn: true };
  }
  if (outcome.status !== 200) {
    return { result: null, error: outcome.errorMessage || "Failed to generate document. Please try again.", needsSignIn: false };
  }
  const apiError = (outcome.data as { error?: unknown } | null)?.error;
  if (typeof apiError === "string" && apiError) return { result: null, error: apiError, needsSignIn: false };

  const result = parseGenerateDocumentResponse(outcome.data);
  if (!result) {
    return {
      result: null,
      error: "The generator returned no document. Your allowance may have been used; check your balance before retrying.",
      needsSignIn: false,
    };
  }
  return { result, error: null, needsSignIn: false };
}

/** Same checkout as GeneratePage's "Buy this document – $5" (one-time Per Document price). */
export function useDocumentCheckout() {
  const navigate = useNavigate();
  // Track sign-in synchronously so the checkout tab can open inside the click (popup blockers).
  const signedIn = useRef<boolean | null>(null);
  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data: { session } }) => { if (active) signedIn.current = Boolean(session?.user); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { signedIn.current = Boolean(session?.user); });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);
  return useCallback(async () => {
    if (!arePaymentsEnabled()) {
      toast.error("Payments are currently disabled.");
      return;
    }
    if (signedIn.current === false) {
      toast.error("Please sign in first");
      navigate("/auth");
      return;
    }
    try {
      await openCheckoutInNewTab(async () => {
        const { data, error } = await supabase.functions.invoke("create-checkout", {
          body: { priceId: DOCUMENT_EXPORT_PRICE_ID, mode: DOCUMENT_EXPORT_CHECKOUT_MODE },
        });
        if (error || typeof data?.error === "string") throw new Error((await readCheckoutError(error, data)).message);
        return data?.url;
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Checkout could not be started. Please try again.");
    }
  }, [navigate]);
}
