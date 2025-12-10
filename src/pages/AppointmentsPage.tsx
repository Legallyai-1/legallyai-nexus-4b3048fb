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
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  Scale, Plus, Search, Calendar as CalendarIcon, Clock, Video, 
  MapPin, DollarSign, ChevronLeft, User, Phone
} from "lucide-react";
import { cn } from "@/lib/utils";
import DashboardLayout from "@/components/layout/DashboardLayout";

type AppointmentStatus = "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";

interface Appointment {
  id: string;
  title: string;
  client_name: string;
  start_time: string;
  end_time: string;
  is_virtual: boolean;
  location: string | null;
  meeting_link: string | null;
  fee: number | null;
  is_free: boolean;
  status: AppointmentStatus;
  description: string | null;
}

export default function AppointmentsPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    title: "",
    isVirtual: false,
    isFree: false,
    fee: "",
  });

  const statusColors: Record<AppointmentStatus, string> = {
    scheduled: "bg-blue-500/20 text-blue-400",
    confirmed: "bg-green-500/20 text-green-400",
    completed: "bg-gray-500/20 text-gray-400",
    cancelled: "bg-red-500/20 text-red-400",
    no_show: "bg-orange-500/20 text-orange-400",
  };

  useEffect(() => {
    // Demo data
    setAppointments([
      {
        id: "1",
        title: "Initial Consultation",
        client_name: "John Smith",
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 3600000).toISOString(),
        is_virtual: true,
        location: null,
        meeting_link: "https://meet.google.com/abc-defg-hij",
        fee: 150,
        is_free: false,
        status: "scheduled",
        description: "Initial consultation for personal injury case"
      },
      {
        id: "2",
        title: "Contract Review",
        client_name: "ABC Corporation",
        start_time: new Date(Date.now() + 7200000).toISOString(),
        end_time: new Date(Date.now() + 10800000).toISOString(),
        is_virtual: false,
        location: "123 Main St, Suite 400",
        meeting_link: null,
        fee: 300,
        is_free: false,
        status: "confirmed",
        description: "Review merger contract documents"
      },
      {
        id: "3",
        title: "Pro Bono Consultation",
        client_name: "Sarah Williams",
        start_time: new Date(Date.now() + 86400000).toISOString(),
        end_time: new Date(Date.now() + 90000000).toISOString(),
        is_virtual: true,
        location: null,
        meeting_link: "https://zoom.us/j/123456789",
        fee: null,
        is_free: true,
        status: "scheduled",
        description: "Free legal consultation"
      },
    ]);
    setLoading(false);
  }, []);

  const todaysAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.start_time).toDateString();
    return aptDate === selectedDate.toDateString();
  });

  return (
    <DashboardLayout adSlot="APPOINTMENTS_SIDEBAR_SLOT">
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <CalendarIcon className="h-6 w-6 text-legal-gold" />
          <h1 className="text-xl font-display font-semibold">Appointments & Scheduling</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Sidebar */}
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
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input 
                        placeholder="e.g., Initial Consultation" 
                        value={newAppointment.title}
                        onChange={(e) => setNewAppointment({...newAppointment, title: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Client</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">+ Add New Client</SelectItem>
                          <SelectItem value="client1">John Smith</SelectItem>
                          <SelectItem value="client2">ABC Corporation</SelectItem>
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
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({length: 18}, (_, i) => i + 6).map(hour => (
                              <SelectItem key={hour} value={`${hour}:00`}>
                                {hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}
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
                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea placeholder="Additional details..." />
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                      <Button type="submit" variant="gold">Schedule</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Appointments List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </h2>
              <Badge variant="outline">{todaysAppointments.length} appointments</Badge>
            </div>

            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading appointments...</div>
            ) : todaysAppointments.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No appointments for this day</p>
                  <Button variant="gold" className="mt-4" onClick={() => setIsCreateOpen(true)}>
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
                            <span className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {apt.client_name}
                            </span>
                            {apt.is_virtual ? (
                              <span className="flex items-center gap-1 text-legal-cyan">
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
                              <span className="flex items-center gap-1 text-legal-gold">
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
                          {apt.is_virtual && apt.meeting_link && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={apt.meeting_link} target="_blank" rel="noopener noreferrer">
                                <Video className="h-4 w-4 mr-2" />
                                Join Call
                              </a>
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            Edit
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
