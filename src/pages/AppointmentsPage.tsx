import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  Plus, Calendar as CalendarIcon, Clock, Video, 
  MapPin, DollarSign, ChevronLeft, User, Loader2, Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import DashboardLayout from "@/components/layout/DashboardLayout";
import type { Database } from "@/integrations/supabase/types";

type AppointmentStatus = Database["public"]["Enums"]["appointment_status"];

interface Appointment {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  is_virtual: boolean | null;
  location: string | null;
  meeting_link: string | null;
  fee: number | null;
  is_free: boolean | null;
  status: AppointmentStatus;
  description: string | null;
  client_id: string | null;
  clients?: { full_name: string } | null;
}

interface Client {
  id: string;
  full_name: string;
}

export default function AppointmentsPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [newAppointment, setNewAppointment] = useState({
    title: "",
    client_id: "",
    time: "09:00",
    duration: "60",
    isVirtual: false,
    isFree: false,
    fee: "",
    location: "",
    description: ""
  });

  const statusColors: Record<AppointmentStatus, string> = {
    scheduled: "bg-blue-500/20 text-blue-400",
    confirmed: "bg-green-500/20 text-green-400",
    completed: "bg-gray-500/20 text-gray-400",
    cancelled: "bg-red-500/20 text-red-400",
    no_show: "bg-orange-500/20 text-orange-400",
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      await fetchData(session.user.id);
    };
    init();
  }, [navigate]);

  const fetchData = async (userId: string) => {
    setLoading(true);
    try {
      let { data: orgMember } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', userId)
        .single();

      if (!orgMember) {
        const { data: newOrg } = await supabase
          .from('organizations')
          .insert({ name: 'My Law Practice', owner_id: userId })
          .select()
          .single();

        if (newOrg) {
          await supabase.from('organization_members').insert({
            organization_id: newOrg.id,
            user_id: userId,
            role: 'owner'
          });
          orgMember = { organization_id: newOrg.id };
        }
      }

      if (orgMember) {
        setOrganizationId(orgMember.organization_id);

        const { data: apptData, error: apptError } = await supabase
          .from('appointments')
          .select('*, clients(full_name)')
          .eq('organization_id', orgMember.organization_id)
          .order('start_time', { ascending: true });

        if (apptError) throw apptError;
        setAppointments(apptData || []);

        const { data: clientsData } = await supabase
          .from('clients')
          .select('id, full_name')
          .eq('organization_id', orgMember.organization_id)
          .order('full_name');

        setClients(clientsData || []);
      }
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppointment.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const [hours, minutes] = newAppointment.time.split(':').map(Number);
      const startTime = new Date(selectedDate);
      startTime.setHours(hours, minutes, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + parseInt(newAppointment.duration));

      const { error } = await supabase.from('appointments').insert({
        title: newAppointment.title,
        client_id: newAppointment.client_id || null,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        is_virtual: newAppointment.isVirtual,
        is_free: newAppointment.isFree,
        fee: newAppointment.isFree ? null : (parseFloat(newAppointment.fee) || null),
        location: newAppointment.isVirtual ? null : (newAppointment.location || null),
        description: newAppointment.description || null,
        organization_id: organizationId,
        status: 'scheduled' as AppointmentStatus
      });

      if (error) throw error;

      toast.success("Appointment scheduled");
      setNewAppointment({
        title: "", client_id: "", time: "09:00", duration: "60",
        isVirtual: false, isFree: false, fee: "", location: "", description: ""
      });
      setIsCreateOpen(false);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) fetchData(session.user.id);
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      toast.error(error.message || "Failed to schedule appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!confirm("Delete this appointment?")) return;
    try {
      const { error } = await supabase.from('appointments').delete().eq('id', id);
      if (error) throw error;
      toast.success("Appointment deleted");
      setAppointments(appointments.filter(a => a.id !== id));
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    try {
      const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
      if (error) throw error;
      setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update");
    }
  };

  const todaysAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.start_time).toDateString();
    return aptDate === selectedDate.toDateString();
  });

  return (
    <DashboardLayout adSlot="APPOINTMENTS_SIDEBAR_SLOT">
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <CalendarIcon className="h-6 w-6 text-neon-gold" />
            <h1 className="text-xl font-display font-semibold">Appointments</h1>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Select Date</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                />
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                  <DialogTrigger asChild>
                    <Button variant="gold" className="w-full mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      New Appointment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Schedule Appointment</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateAppointment} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Title *</Label>
                        <Input 
                          placeholder="e.g., Initial Consultation" 
                          value={newAppointment.title}
                          onChange={(e) => setNewAppointment({...newAppointment, title: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Client</Label>
                        <Select 
                          value={newAppointment.client_id}
                          onValueChange={(v) => setNewAppointment({...newAppointment, client_id: v})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select client (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            {clients.map(c => (
                              <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start">
                                <CalendarIcon className="h-4 w-4 mr-2" />
                                {format(selectedDate, "PPP")}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => date && setSelectedDate(date)}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="space-y-2">
                          <Label>Time</Label>
                          <Select 
                            value={newAppointment.time}
                            onValueChange={(v) => setNewAppointment({...newAppointment, time: v})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({length: 18}, (_, i) => i + 6).map(hour => (
                                <SelectItem key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                                  {hour > 12 ? `${hour - 12}:00 PM` : hour === 12 ? '12:00 PM' : `${hour}:00 AM`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={newAppointment.isVirtual}
                            onCheckedChange={(checked) => setNewAppointment({...newAppointment, isVirtual: checked})}
                          />
                          <Label>Virtual Meeting</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={newAppointment.isFree}
                            onCheckedChange={(checked) => setNewAppointment({...newAppointment, isFree: checked})}
                          />
                          <Label>Free Consultation</Label>
                        </div>
                      </div>
                      {!newAppointment.isFree && (
                        <div className="space-y-2">
                          <Label>Consultation Fee ($)</Label>
                          <Input 
                            type="number" 
                            placeholder="150" 
                            value={newAppointment.fee}
                            onChange={(e) => setNewAppointment({...newAppointment, fee: e.target.value})}
                          />
                        </div>
                      )}
                      {!newAppointment.isVirtual && (
                        <div className="space-y-2">
                          <Label>Location</Label>
                          <Input 
                            placeholder="123 Main St, Suite 100" 
                            value={newAppointment.location}
                            onChange={(e) => setNewAppointment({...newAppointment, location: e.target.value})}
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea 
                          placeholder="Additional details..."
                          value={newAppointment.description}
                          onChange={(e) => setNewAppointment({...newAppointment, description: e.target.value})}
                        />
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" variant="gold" disabled={isSubmitting}>
                          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Schedule"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </h2>
                <Badge variant="outline">{todaysAppointments.length} appointments</Badge>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-neon-cyan" />
                </div>
              ) : todaysAppointments.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No appointments for this day</p>
                    <Button variant="gold" onClick={() => setIsCreateOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Appointment
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {todaysAppointments.map((apt) => (
                    <Card key={apt.id} className="hover:shadow-card transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{apt.title}</h3>
                              <Badge className={statusColors[apt.status]}>
                                {apt.status}
                              </Badge>
                              {apt.is_free && (
                                <Badge className="bg-green-500/20 text-green-400">Pro Bono</Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {format(new Date(apt.start_time), "h:mm a")} - {format(new Date(apt.end_time), "h:mm a")}
                              </span>
                              {apt.clients && (
                                <span className="flex items-center gap-1">
                                  <User className="h-4 w-4" />
                                  {apt.clients.full_name}
                                </span>
                              )}
                              {apt.is_virtual ? (
                                <span className="flex items-center gap-1 text-neon-cyan">
                                  <Video className="h-4 w-4" />
                                  Virtual
                                </span>
                              ) : apt.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {apt.location}
                                </span>
                              )}
                              {!apt.is_free && apt.fee && (
                                <span className="flex items-center gap-1 text-neon-gold">
                                  <DollarSign className="h-4 w-4" />
                                  ${apt.fee}
                                </span>
                              )}
                            </div>
                            {apt.description && (
                              <p className="text-sm text-muted-foreground mt-2">
                                {apt.description}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {apt.status === 'scheduled' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleStatusChange(apt.id, 'confirmed')}
                              >
                                Confirm
                              </Button>
                            )}
                            {apt.status === 'confirmed' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleStatusChange(apt.id, 'completed')}
                              >
                                Complete
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteAppointment(apt.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}
