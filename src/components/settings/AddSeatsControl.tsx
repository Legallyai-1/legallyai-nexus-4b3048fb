import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type SeatStatus = {
  plan_name: string;
  included_seats: number;
  extra_seats: number;
  seat_limit: number;
  seats_used: number;
  max_extra_seats: number;
  price_per_seat_usd: number;
};

/** Firm/Enterprise owners: shows seats in use vs. the plan limit and changes the Extra seat quantity. */
export function AddSeatsControl({ onChanged }: { onChanged?: (seatLimit: number) => void }) {
  const [status, setStatus] = useState<SeatStatus | null>(null);
  const [extra, setExtra] = useState("0");
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // The function answers 403 for anyone who isn't the firm owner on an active Firm/Enterprise plan;
    // in that case the control stays hidden.
    supabase.functions.invoke("update-seats", { body: {} }).then(({ data, error }) => {
      if (!error && typeof data?.seat_limit === "number") {
        setStatus(data as SeatStatus);
        setExtra(String(data.extra_seats));
      }
    }).catch(() => { /* hidden on failure */ });
  }, []);

  if (!status) return null;

  const requested = Number(extra);
  const valid = /^\d{1,3}$/.test(extra) && requested >= 0 && requested <= status.max_extra_seats;
  const newLimit = status.included_seats + (valid ? requested : 0);
  const delta = valid ? requested - status.extra_seats : 0;
  const tooLow = valid && newLimit < status.seats_used;

  const save = async () => {
    setSaving(true);
    const { data, error } = await supabase.functions.invoke("update-seats", { body: { extraSeats: requested } });
    setSaving(false);
    setConfirming(false);
    if (error || typeof data?.seat_limit !== "number") {
      toast.error("Seats could not be updated. Please try again or contact support@legallyai.ai.");
      return;
    }
    setStatus(data as SeatStatus);
    setExtra(String(data.extra_seats));
    onChanged?.(data.seat_limit);
    toast.success(`Your ${data.plan_name} plan now has ${data.seat_limit} seats.`);
  };

  return (
    <div className="space-y-2 rounded-md border p-3" data-testid="add-seats">
      <p className="text-sm">
        Seats: <strong>{status.seats_used}</strong> of <strong>{status.seat_limit}</strong> in use
        <span className="text-muted-foreground"> ({status.included_seats} included + {status.extra_seats} extra)</span>
      </p>
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="extra-seats">Extra seats (0–{status.max_extra_seats})</Label>
          <Input id="extra-seats" type="number" inputMode="numeric" min={0} max={status.max_extra_seats} step={1}
            value={extra} onChange={(e) => setExtra(e.target.value)} />
        </div>
        <Button variant="outline" disabled={!valid || delta === 0 || tooLow || saving} onClick={() => setConfirming(true)}>
          Add seats
        </Button>
      </div>
      {tooLow && <p className="text-xs text-destructive">You have {status.seats_used} seats in use. Remove members or invites first.</p>}
      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change extra seats from {status.extra_seats} to {requested}?</AlertDialogTitle>
            <AlertDialogDescription>
              Extra seats are ${status.price_per_seat_usd}/seat/month, prorated for the rest of the current billing period
              on your next invoice. Your plan will have {newLimit} seats
              ({delta > 0 ? `+$${delta * status.price_per_seat_usd}` : `-$${Math.abs(delta) * status.price_per_seat_usd}`}/month).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={saving} onClick={(e) => { e.preventDefault(); void save(); }}>
              {saving ? "Updating…" : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
