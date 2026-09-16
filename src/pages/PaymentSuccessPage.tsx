import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { isPaidSubscriptionTier } from "@/lib/subscription";

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const [verified, setVerified] = useState(false);
  const [pending, setPending] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const verifyPayment = async () => {
      const sessionId = searchParams.get("session_id");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !sessionId) {
        if (!cancelled) setPending(false);
        return;
      }

      for (let attempt = 0; attempt < 6; attempt += 1) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("subscription_tier")
          .eq("id", user.id)
          .maybeSingle();

        if (isPaidSubscriptionTier(profile?.subscription_tier || null)) {
          if (!cancelled) {
            setVerified(true);
            setPending(false);
          }
          return;
        }

        const { data: paymentStatus } = await supabase.functions.invoke("verify-payment");
        if (paymentStatus?.hasPaid) {
          if (!cancelled) {
            setVerified(true);
            setPending(false);
          }
          return;
        }

        await new Promise((resolve) => window.setTimeout(resolve, 2000));
      }

      if (!cancelled) setPending(false);
    };

    void verifyPayment();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  return (
    <Layout>
      <div className="min-h-screen bg-background flex items-center justify-center py-16">
        <div className="container mx-auto px-4 max-w-lg">
          <Card className="bg-card border-border text-center">
            <CardContent className="p-12">
              <div className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className={`h-10 w-10 ${verified ? "text-green-500" : "text-yellow-500"}`} />
              </div>
              
              <h1 className="text-3xl font-bold text-foreground mb-4">
                {verified ? "Payment Verified" : pending ? "Confirming Payment" : "Payment Received"}
              </h1>
              <p className="text-muted-foreground mb-8">
                {verified
                  ? "Your payment is confirmed and your account access has been updated."
                  : pending
                    ? "Stripe is confirming your payment. This page will update when the webhook finishes processing."
                    : "Your payment was received, but account access is still pending confirmation. Please refresh shortly."}
              </p>

              <div className="space-y-3">
                <Link to="/dashboard">
                  <Button className="w-full bg-primary text-primary-foreground">
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/generate">
                  <Button variant="outline" className="w-full">
                    Generate a Document
                  </Button>
                </Link>
              </div>

              <p className="text-xs text-muted-foreground mt-8">
                A confirmation email has been sent to your registered email address.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentSuccessPage;
