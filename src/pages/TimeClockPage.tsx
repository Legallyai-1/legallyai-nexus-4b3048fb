import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ensureUserOrganization, findUserOrganization } from "@/lib/organizations";
import { format, differenceInMinutes, differenceInHours } from "date-fns";
import { 
  Clock, ChevronLeft, Play, Square, MapPin, 
  Calendar, DollarSign, FileText, Timer
} from "lucide-react";

interface TimeEntry {
  id: string;
  case_id: string | null;
  clock_in: string;
  clock_out: string | null;
  description: string | null;
  case_name: string | null;
  billable: boolean;
  hourly_rate: number | null;
  clock_in_location: { lat: number; lng: number } | null;
  clock_out_location: { lat: number; lng: number } | null;
}

export default function TimeClockPage() {
  const navigate = useNavigate();
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [description, setDescription] = useState("");
  const [selectedCase, setSelectedCase] = useState("");
  const [isBillable, setIsBillable] = useState(true);
  const [hourlyRate, setHourlyRate] = useState("150");
  const [geoEnabled, setGeoEnabled] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userId, setUserId] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [cases, setCases] = useState<{ id: string; title: string }[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [busy, setBusy] = useState(false);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const caseTitle = (caseId: string | null) => cases.find((c) => c.id === caseId)?.title ?? null;

  const loadCases = async (orgId: string) => {
    const { data, error } = await supabase
      .from("cases")
      .select("id, title")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false })
      .limit(200);
    if (!error) setCases(data ?? []);
  };

  // Load the signed-in user's own time entries (RLS: users manage only their own rows).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/auth");
          return;
        }
        if (cancelled) return;
        setUserId(user.id);
        const orgId = await findUserOrganization(user.id).catch(() => null);
        if (cancelled) return;
        setOrganizationId(orgId);
        if (orgId) await loadCases(orgId);

        const { data, error } = await supabase
          .from("time_entries")
          .select("id, case_id, clock_in, clock_out, description, billable, hourly_rate, clock_in_location, clock_out_location")
          .eq("user_id", user.id)
          .order("clock_in", { ascending: false })
          .limit(100);
        if (error) throw error;
        if (cancelled) return;
        const rows = (data ?? []).map((r) => ({ ...r, case_name: null })) as unknown as TimeEntry[];
        const open = rows.find((r) => !r.clock_out) ?? null;
        setCurrentEntry(open);
        setIsClockedIn(!!open);
        if (open?.case_id) setSelectedCase(open.case_id);
        setEntries(rows.filter((r) => r.clock_out));
      } catch (error) {
        console.error("Time entries load error:", error);
        if (!cancelled) toast.error("Couldn't load your time entries");
      } finally {
        if (!cancelled) setLoadingEntries(false);
      }
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  const getLocation = (): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
      if (!geoEnabled || !navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null)
      );
    });
  };

  const clockIn = async () => {
    if (!userId || busy) return;
    const rate = parseFloat(hourlyRate);
    if (isBillable && !(rate >= 0)) {
      toast.error("Enter a valid hourly rate");
      return;
    }
    setBusy(true);
    try {
      // Clocking in is an explicit action, so it may set up the user's practice if needed.
      const orgId = organizationId ?? await ensureUserOrganization(userId);
      if (!organizationId) {
        setOrganizationId(orgId);
        void loadCases(orgId);
      }
      const location = await getLocation();
      const caseId = selectedCase && selectedCase !== "none" ? selectedCase : null;
      const { data, error } = await supabase
        .from("time_entries")
        .insert({
          user_id: userId,
          organization_id: orgId,
          case_id: caseId,
          clock_in: new Date().toISOString(),
          description: description || null,
          billable: isBillable,
          hourly_rate: isBillable ? rate : null,
          clock_in_location: location,
        })
        .select("id, case_id, clock_in, clock_out, description, billable, hourly_rate, clock_in_location, clock_out_location")
        .single();
      if (error) throw error;
      setCurrentEntry({ ...(data as unknown as TimeEntry), case_name: null });
      setIsClockedIn(true);
      toast.success("Clocked in" + (location ? " with location" : ""));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't clock in");
    } finally {
      setBusy(false);
    }
  };

  const clockOut = async () => {
    if (!currentEntry || busy) return;
    setBusy(true);
    try {
      const location = await getLocation();
      const update = {
        clock_out: new Date().toISOString(),
        description: description || currentEntry.description,
        clock_out_location: location,
      };
      const { data, error } = await supabase
        .from("time_entries")
        .update(update)
        .eq("id", currentEntry.id)
        .select("id");
      if (error) throw error;
      if (!data?.length) throw new Error("This time entry could not be updated");
      setEntries([{ ...currentEntry, ...update }, ...entries]);
      setCurrentEntry(null);
      setIsClockedIn(false);
      setDescription("");
      setSelectedCase("");
      toast.success("Clocked out");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't clock out");
    } finally {
      setBusy(false);
    }
  };

  const calculateDuration = (start: string, end: string | null) => {
    const endTime = end ? new Date(end) : new Date();
    const mins = differenceInMinutes(endTime, new Date(start));
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return `${hours}h ${minutes}m`;
  };

  const calculateEarnings = (entry: TimeEntry) => {
    if (!entry.billable || !entry.hourly_rate) return null;
    const endTime = entry.clock_out ? new Date(entry.clock_out) : new Date();
    const hours = differenceInMinutes(endTime, new Date(entry.clock_in)) / 60;
    return (hours * entry.hourly_rate).toFixed(2);
  };

  const todayTotal = entries
    .filter(e => new Date(e.clock_in).toDateString() === new Date().toDateString())
    .reduce((acc, e) => {
      const end = e.clock_out ? new Date(e.clock_out) : new Date();
      return acc + differenceInMinutes(end, new Date(e.clock_in));
    }, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Clock className="h-6 w-6 text-legal-gold" />
          <h1 className="text-xl font-display font-semibold">Time Clock</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Clock In/Out Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Time Tracker</CardTitle>
              <CardDescription>Track billable hours for cases</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Time Display */}
              <div className="text-center py-6 rounded-xl bg-legal-navy">
                <p className="text-4xl font-mono text-legal-gold font-bold">
                  {format(currentTime, "HH:mm:ss")}
                </p>
                <p className="text-muted-foreground mt-2">
                  {format(currentTime, "EEEE, MMMM d, yyyy")}
                </p>
                {isClockedIn && currentEntry && (
                  <div className="mt-4 p-3 bg-green-500/20 rounded-lg mx-4">
                    <p className="text-green-400 text-sm">Currently Working</p>
                    <p className="text-2xl font-mono text-foreground">
                      {calculateDuration(currentEntry.clock_in, null)}
                    </p>
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Link to Case (Optional)</Label>
                  <Select value={selectedCase} onValueChange={setSelectedCase}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a case" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No case</SelectItem>
                      {cases.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    placeholder="What are you working on?" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch checked={isBillable} onCheckedChange={setIsBillable} />
                    <Label>Billable</Label>
                  </div>
                  {isBillable && (
                    <div className="flex items-center gap-2">
                      <Label>$/hr</Label>
                      <Input 
                        type="number" 
                        value={hourlyRate} 
                        onChange={(e) => setHourlyRate(e.target.value)}
                        className="w-20"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch checked={geoEnabled} onCheckedChange={setGeoEnabled} />
                    <Label className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Geo Tracking
                    </Label>
                  </div>
                </div>
              </div>

              {/* Clock Button */}
              <Button 
                variant={isClockedIn ? "destructive" : "gold"} 
                size="lg"
                className="w-full h-14 text-lg"
                onClick={isClockedIn ? clockOut : clockIn}
                disabled={busy || !userId}
              >
                {isClockedIn ? (
                  <>
                    <Square className="h-5 w-5 mr-2" />
                    Clock Out
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Clock In
                  </>
                )}
              </Button>

              {/* Today's Summary */}
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Today's Total</span>
                  <span className="font-semibold">
                    {Math.floor(todayTotal / 60)}h {todayTotal % 60}m
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Entries List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Time Entries</CardTitle>
                  <CardDescription>Your tracked work sessions</CardDescription>
                </div>
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {entries.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Timer className="h-12 w-12 mx-auto mb-4" />
                  <p>{loadingEntries ? "Loading your time entries…" : "No time entries yet"}</p>
                  <p className="text-sm">Clock in to start tracking your time</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {entries.map((entry) => (
                    <div 
                      key={entry.id} 
                      className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold">
                            {format(new Date(entry.clock_in), "MMM d, yyyy")}
                          </span>
                          {entry.billable && (
                            <Badge className="bg-legal-gold/20 text-legal-gold">Billable</Badge>
                          )}
                          {entry.clock_in_location && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              Location
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {format(new Date(entry.clock_in), "h:mm a")} - 
                            {entry.clock_out ? format(new Date(entry.clock_out), " h:mm a") : " In Progress"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Timer className="h-4 w-4" />
                            {calculateDuration(entry.clock_in, entry.clock_out)}
                          </span>
                          {caseTitle(entry.case_id) && (
                            <span className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              {caseTitle(entry.case_id)}
                            </span>
                          )}
                        </div>
                        {entry.description && (
                          <p className="text-sm mt-2">{entry.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        {entry.billable && entry.hourly_rate && (
                          <>
                            <p className="text-sm text-muted-foreground">${entry.hourly_rate}/hr</p>
                            <p className="font-semibold text-legal-gold">
                              ${calculateEarnings(entry)}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
