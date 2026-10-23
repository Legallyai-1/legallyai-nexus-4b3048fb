import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarClock, FolderPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { ensureUserOrganization } from "@/lib/organizations";
import { toast } from "sonner";

interface Props {
  question: string;
  answer: string;
  hubType: string;
}

// Lets a signed-in user file a chat answer into their case file, with an optional deadline
// that also creates a calendar appointment. Visitors are sent to sign up (conversion).
export function SaveToCaseFile({ question, answer, hubType }: Props) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(question.slice(0, 80));
  const [deadline, setDeadline] = useState("");
  const [saving, setSaving] = useState(false);

  const start = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      toast.info("Create a free account to save answers to your case file.");
      navigate("/signup");
      return;
    }
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("Please sign in again.");
      const organizationId = await ensureUserOrganization(userId);
      const description = `Question:\n${question}\n\nLee's answer:\n${answer}`.slice(0, 20000);
      const { data: created, error } = await supabase
        .from("cases")
        .insert({
          title: title.trim() || question.slice(0, 80),
          description,
          status: "active",
          case_type: hubType,
          organization_id: organizationId,
          org_id: organizationId,
          user_id: userId,
          ...(deadline ? { next_deadline: new Date(`${deadline}T09:00:00`).toISOString() } : {}),
        } as never)
        .select("id")
        .single();
      if (error) throw error;
      if (deadline) {
        const startTime = new Date(`${deadline}T09:00:00`);
        const endTime = new Date(startTime.getTime() + 30 * 60000);
        const { error: apptError } = await supabase.from("appointments").insert({
          title: `Deadline: ${title.trim() || question.slice(0, 60)}`,
          description: "Deadline saved from Lee chat. Verify the exact date with the court or agency.",
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          organization_id: organizationId,
          org_id: organizationId,
          user_id: userId,
          case_id: created?.id ?? null,
          status: "scheduled",
          is_virtual: false,
          is_free: true,
        } as never);
        if (apptError) console.warn("deadline appointment not created", apptError.message);
      }
      toast.success(deadline ? "Saved to your case file with a deadline reminder" : "Saved to your case file");
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save to case file");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground" onClick={start}>
        <FolderPlus className="h-3.5 w-3.5 mr-1" /> Save to case file
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save to your case file</DialogTitle>
            <DialogDescription>Lee will keep this question and answer with your matter. Add a deadline to get it on your calendar.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="case-title">Matter title</Label>
              <Input id="case-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="case-deadline" className="flex items-center gap-1"><CalendarClock className="h-4 w-4" /> Deadline (optional)</Label>
              <Input id="case-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default SaveToCaseFile;
