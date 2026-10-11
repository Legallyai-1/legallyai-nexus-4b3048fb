import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export function AIVolunteerMatcher() {
  return (
    <Card className="glass-card border-neon-orange/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <AlertTriangle className="w-5 h-5 text-neon-orange" />
          Volunteer Matching Unavailable
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Automated matching is paused until verified, currently open pro bono opportunities are available. Contact your local bar association or legal aid organization to confirm current volunteer openings.
      </CardContent>
    </Card>
  );
}
