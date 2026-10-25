import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FREE_LIMIT_EVENT, type FreeLimitDetail } from "@/lib/freeQuestions";
import { PlayCircle, Sparkles, CheckCircle2, Loader2, ShieldCheck, Crown } from "lucide-react";
import { toast } from "sonner";

// Global pop-up shown when a visitor runs out of free legal questions.
export function FreeLimitDialog() {
  const navigate = useNavigate();
  const [detail, setDetail] = useState<FreeLimitDetail | null>(null);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);

  useEffect(() => {
    const onLimit = (event: Event) => setDetail((event as CustomEvent<FreeLimitDetail>).detail);
    window.addEventListener(FREE_LIMIT_EVENT, onLimit);
    return () => window.removeEventListener(FREE_LIMIT_EVENT, onLimit);
  }, []);

  const go = (path: string) => {
    setDetail(null);
    navigate(path);
  };

  const handleWatchAd = () => {
    setIsWatchingAd(true);
    setAdCountdown(5);
    const interval = setInterval(() => {
      setAdCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsWatchingAd(false);
          setDetail(null);
          toast.success("Sponsor video completed! 5 bonus legal queries credited.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
      <DialogContent className="sm:max-w-lg border-neon-cyan/40 glass-card">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-2">
            <img src="/lee-mascot.png" alt="Lee" className="w-10 h-auto animate-lee-alive" />
            <Badge className="bg-neon-gold/20 text-neon-gold border-neon-gold/40">
              <Sparkles className="w-3 h-3 mr-1" /> Daily Free Limit Reached
            </Badge>
          </div>
          <DialogTitle className="text-xl font-display">
            You&apos;ve used your {detail?.limit ?? 5} free legal questions for today
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {detail?.signedIn
              ? "Upgrade to Pro for unlimited questions, contract redlining, and verified citations, or watch a quick sponsor video to unlock 5 bonus questions immediately."
              : "Start your 7-day free trial for unlimited questions, or watch a quick sponsor video to get 5 more questions right now without a credit card."}
          </DialogDescription>
        </DialogHeader>

        {isWatchingAd ? (
          <div className="p-6 rounded-xl bg-muted/40 border border-neon-cyan/30 text-center space-y-3 animate-fade-in">
            <Loader2 className="w-8 h-8 animate-spin text-neon-cyan mx-auto" />
            <p className="font-semibold text-foreground text-sm">
              Playing legal partner message...
            </p>
            <p className="text-xs text-muted-foreground">
              Bonus questions will unlock in <strong className="text-neon-cyan text-base">{adCountdown}s</strong>
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Monetization options grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Rewarded Ad Option */}
              <button
                type="button"
                onClick={handleWatchAd}
                className="p-4 rounded-xl border border-neon-cyan/40 bg-neon-cyan/10 hover:bg-neon-cyan/20 text-left transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-neon-cyan font-bold text-xs uppercase mb-1">
                    <PlayCircle className="w-4 h-4" /> Free Option
                  </div>
                  <h4 className="font-semibold text-foreground text-sm group-hover:text-neon-cyan">
                    Watch Sponsor Video
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Watch a 15-second sponsor to get <strong>+5 questions free</strong> instantly.
                  </p>
                </div>
                <div className="mt-3 flex items-center text-xs font-semibold text-neon-cyan">
                  <span>Watch &amp; Unlock</span> →
                </div>
              </button>

              {/* Unlimited Pro Option */}
              <button
                type="button"
                onClick={() => go("/pricing")}
                className="p-4 rounded-xl border border-neon-gold/40 bg-neon-gold/10 hover:bg-neon-gold/20 text-left transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-neon-gold font-bold text-xs uppercase mb-1">
                    <Crown className="w-4 h-4" /> Best Value
                  </div>
                  <h4 className="font-semibold text-foreground text-sm group-hover:text-neon-gold">
                    Start 7-Day Free Trial
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Unlimited questions, contract redlining, and no advertisements.
                  </p>
                </div>
                <div className="mt-3 flex items-center text-xs font-semibold text-neon-gold">
                  <span>Start Free Trial</span> →
                </div>
              </button>
            </div>

            <ul className="text-xs space-y-1.5 text-muted-foreground list-none p-3 rounded-lg bg-background/50 border border-border/40">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-neon-green" /> Unlimited questions across every LegallyAI specialized hub
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-neon-green" /> Answers with links to official court forms and statutory authorities
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-neon-green" /> Integrated case files, document drafts, and appointment tracking
              </li>
            </ul>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setDetail(null)} disabled={isWatchingAd}>
            Close
          </Button>
          {!detail?.signedIn && (
            <Button variant="ghost" onClick={() => go("/signup")} disabled={isWatchingAd}>
              Create Free Account
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default FreeLimitDialog;
