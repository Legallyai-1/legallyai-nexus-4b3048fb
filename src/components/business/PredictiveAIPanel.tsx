import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PredictiveAIPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Predictive analysis unavailable
        </CardTitle>
        <CardDescription>
          No validated legal-outcome model is configured for this application.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        No win probabilities, settlement estimates, deadlines, or strategy recommendations are generated. Discuss case-specific questions with a licensed attorney.
      </CardContent>
    </Card>
  );
}
