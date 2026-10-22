import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FREE_LIMIT_EVENT, type FreeLimitDetail } from "@/lib/freeQuestions";

// Global pop-up shown when a visitor runs out of free legal questions.
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>You've used your {detail?.limit ?? 5} free legal questions</DialogTitle>
          <DialogDescription>
            {detail?.signedIn
              ? "Start your free trial to keep asking Lee, save your case file, track deadlines and appointments, and get web-researched answers with sources."
              : "Create a free account to start your free trial. Lee will keep researching your questions, save your case file, and track your deadlines and appointments."}
          </DialogDescription>
        </DialogHeader>
        <ul className="text-sm space-y-1 text-muted-foreground list-disc pl-5">
          <li>Unlimited questions across every LegallyAI hub</li>
          <li>Answers with links to official sources, forms, and videos</li>
          <li>Your case file, documents, and appointments in one place</li>
        </ul>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setDetail(null)}>Not now</Button>
          {detail?.signedIn ? (
            <Button onClick={() => go("/pricing")}>Start free trial</Button>
          ) : (
            <Button onClick={() => go("/signup")}>Sign up free</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default FreeLimitDialog;
