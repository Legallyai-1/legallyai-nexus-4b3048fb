import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const PaymentSuccessPage = () => {
  useEffect(() => {
    // Could verify session here if needed
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-background flex items-center justify-center py-16">
        <div className="container mx-auto px-4 max-w-lg">
          <Card className="bg-card border-border text-center">
            <CardContent className="p-12">
              <div className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
              
              <h1 className="text-3xl font-bold text-foreground mb-4">Payment Successful!</h1>
              <p className="text-muted-foreground mb-8">
                Thank you for your purchase. Your account has been upgraded and you now have access to all premium features.
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
