import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export function PleaSimulator() {
  return (
    <Card className="glass-card border-neon-pink/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <AlertTriangle className="w-5 h-5 text-neon-orange" />
          Plea Outcome Simulation Unavailable
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        No validated, jurisdiction-specific outcome model is configured. Do not rely on automated predictions; discuss your case with a licensed attorney.
      </CardContent>
    </Card>
  );
}
