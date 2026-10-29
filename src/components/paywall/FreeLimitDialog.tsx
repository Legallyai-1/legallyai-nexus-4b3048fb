import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FREE_LIMIT_EVENT, type FreeLimitDetail } from "@/lib/freeQuestions";
import { Crown, LogIn } from "lucide-react";

// Global pop-up shown when a visitor runs out of today's free Ask Lee questions:
// subscribe to Premium, or sign in (anonymous visitors only).
export function FreeLimitDialog() {
  const navigate = useNavigate();
  const [detail, setDetail] = useState<FreeLimitDetail | null>(null);

  useEffect(() => {
    const onLimit = (event: Event) => setDetail((event as CustomEvent<FreeLimitDetail>).detail);
    window.addEventListener(FREE_LIMIT_EVENT, onLimit);
    return () => window.removeEventListener(FREE_LIMIT_EVENT, onLimit);
  }, []);

  const go = (path: string) => {
    setDetail(null);
    navigate(path);
  };

  return (
    <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
      <DialogContent className="sm:max-w-md glass-card">
        <DialogHeader className="space-y-3">
          <img src="/lee-mascot.png" alt="Lee" className="w-10 h-auto" />
          <DialogTitle className="text-xl font-display">
            You&apos;ve used today&apos;s {detail?.limit ?? 5} free questions
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Subscribe to Premium for $9.99/month to keep asking Lee without the daily limit and without ads.
            {detail?.signedIn ? "" : " Already subscribed? Sign in."} Or come back tomorrow for {detail?.limit ?? 5} more free questions.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2 flex-col sm:flex-row">
          <Button className="gold-tile border-0 font-semibold" onClick={() => go("/pricing")}>
            <Crown aria-hidden="true" className="mr-2 h-4 w-4" /> Subscribe to Premium
          </Button>
          {!detail?.signedIn && (
            <Button variant="outline" onClick={() => go("/login")}>
              <LogIn aria-hidden="true" className="mr-2 h-4 w-4" /> Sign in
            </Button>
          )}
          <Button variant="ghost" onClick={() => setDetail(null)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default FreeLimitDialog;
