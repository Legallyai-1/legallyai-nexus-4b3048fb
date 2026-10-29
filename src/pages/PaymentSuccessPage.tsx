import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { trackPurchaseConversion } from "@/lib/googleAds";
import { getPurchaseConversion } from "@/lib/purchaseConversion";

type VerificationState = "checking" | "active" | "pending" | "error" | "signin" | "missing";

export default function PaymentSuccessPage() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [state, setState] = useState<VerificationState>("checking");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    setState("checking");

    async function poll() {
      if (cancelled) return;
      try {
        attempts += 1;
        const { data, error } = await supabase.functions.invoke("verify-payment", { body: { session_id: sessionId } });
        if (cancelled) return;
        if (error || data?.error) { setState("error"); return; }
        if (data?.hasPaid === true && data?.isActive === true) {
          setState("active");
          const conversion = getPurchaseConversion(sessionId, data?.checkout);
          if (conversion) trackPurchaseConversion(conversion);
          return;
        }
        if (attempts >= 6) { setState("pending"); return; }
        timer = setTimeout(() => { void poll(); }, 2000);
      } catch {
        if (!cancelled) setState("error");
      }
    }

    async function start() {
      if (!sessionId) { if (!cancelled) setState("missing"); return; }
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (cancelled) return;
        if (error || !user) { setState("signin"); return; }
        await poll();
      } catch {
        if (!cancelled) setState("error");
      }
    }
    void start();
    return () => { cancelled = true; if (timer !== undefined) clearTimeout(timer); };
  }, [sessionId, retry]);

  const titles: Record<VerificationState, string> = {
    checking: "Checking account access", active: "Account access is active", pending: "Access is not yet confirmed",
    error: "Unable to check account access", signin: "Sign in to check your account", missing: "No checkout reference provided",
  };
  const descriptions: Record<VerificationState, string> = {
    checking: "Checking your signed-in account's current access on the server. This does not confirm a new charge.",
    active: "The server reports active paid or trial access for this account. This result does not verify the specific checkout reference or prove a new payment was collected.",
    pending: "The server has not reported active access yet. Checkout may be incomplete, canceled, or still processing. Check again before attempting another purchase.",
    error: "We could not obtain a reliable account-access result. Do not assume a payment succeeded or failed based on this page.",
    signin: "Use the account associated with your checkout, then return to this page and check again.",
    missing: "This page has no checkout reference. It cannot confirm a purchase. Review your account or contact support if you need billing help.",
  };

  return (
    <Layout>
      <section className="container mx-auto max-w-xl px-4 py-20">
        <div className="glass-card rounded-2xl p-6 md:p-10 space-y-6" aria-busy={state === "checking"}>
          <h1 className="text-3xl font-bold" role="status" aria-live="polite">{titles[state]}</h1>
          <p className="text-muted-foreground">{descriptions[state]}</p>
          <div className="flex flex-col gap-3">
            {state === "signin" && <Button asChild><Link to="/login">Sign in</Link></Button>}
            {state !== "checking" && state !== "missing" && <Button variant="outline" onClick={() => setRetry(value => value + 1)}>Check access again</Button>}
            <Button asChild variant="outline"><Link to="/settings">Account settings</Link></Button>
            <Button asChild variant="outline"><Link to="/dashboard">Go to dashboard</Link></Button>
          </div>
          <p className="text-sm text-muted-foreground">We have not verified email delivery. For receipts, charges, or unresolved access, contact <a className="underline" href="mailto:support@legallyai.ai">support@legallyai.ai</a>. Do not send card details, passwords, or API keys.</p>
        </div>
      </section>
    </Layout>
  );
}
