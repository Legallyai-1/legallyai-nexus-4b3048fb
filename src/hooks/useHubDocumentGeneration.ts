import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { arePaymentsEnabled } from "@/lib/env";
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
  return useCallback(async () => {
    if (!arePaymentsEnabled()) {
      toast.error("Payments are currently disabled.");
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
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
  }, [navigate]);
}
