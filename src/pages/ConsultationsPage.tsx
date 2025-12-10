import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Video, Calendar as CalendarIcon, Clock, DollarSign, User, MapPin, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ConsultationsPage = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [consultationType, setConsultationType] = useState("");

  const availableTimes = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM"
  ];

  const lawyers = [
    { name: "John Smith", specialty: "Contract Law", rate: 250, rating: 4.9, available: true },
    { name: "Sarah Johnson", specialty: "Employment Law", rate: 300, rating: 4.8, available: true },
    { name: "Michael Chen", specialty: "Family Law", rate: 200, rating: 4.7, available: false },
    { name: "Emily Davis", specialty: "Criminal Defense", rate: 350, rating: 5.0, available: true },
  ];

  const upcomingConsultations = [
    { 
      lawyer: "John Smith", 
      date: "Dec 15, 2024", 
      time: "2:00 PM", 
      type: "Virtual",
      topic: "Contract Review",
      fee: 250
    },
  ];

  const handleBook = () => {
    if (!selectedDate || !selectedTime || !consultationType) {
      toast({
        title: "Missing Information",
        description: "Please select a date, time, and consultation type",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Consultation Booked",
      description: "Your consultation has been scheduled. You will receive a confirmation email.",
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Virtual Consultations</h1>
            <p className="text-muted-foreground mt-2">Schedule virtual meetings with attorneys</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Available Attorneys</CardTitle>
                  <CardDescription>Select an attorney for your consultation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {lawyers.map((lawyer, index) => (
                    <div
                      key={index}
                      className={`p-4 border border-border rounded-lg ${
                        lawyer.available ? "hover:bg-muted/30 cursor-pointer" : "opacity-50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                            <User className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{lawyer.name}</h3>
                            <p className="text-sm text-muted-foreground">{lawyer.specialty}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-sm text-primary font-medium">
                                ${lawyer.rate}/hr
                              </span>
                              <span className="text-sm text-yellow-400">
                                ★ {lawyer.rating}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge
                            className={
                              lawyer.available
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }
                          >
                            {lawyer.available ? "Available" : "Unavailable"}
                          </Badge>
                          {lawyer.available && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" className="bg-primary text-primary-foreground">
                                  <Video className="h-4 w-4 mr-1" />
                                  Book
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md bg-card">
                                <DialogHeader>
                                  <DialogTitle>Book Consultation with {lawyer.name}</DialogTitle>
                                  <DialogDescription>
                                    Schedule a virtual consultation - ${lawyer.rate}/hour
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <Label>Consultation Type</Label>
                                    <Select onValueChange={setConsultationType}>
                                      <SelectTrigger className="bg-background">
                                        <SelectValue placeholder="Select type" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="initial">Initial Consultation (30 min) - ${lawyer.rate / 2}</SelectItem>
                                        <SelectItem value="standard">Standard (1 hour) - ${lawyer.rate}</SelectItem>
                                        <SelectItem value="extended">Extended (2 hours) - ${lawyer.rate * 2}</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Select Date</Label>
                                    <Calendar
                                      mode="single"
                                      selected={selectedDate}
                                      onSelect={setSelectedDate}
                                      className="rounded-md border border-border"
                                      disabled={(date) => date < new Date()}
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Select Time</Label>
                                    <Select onValueChange={setSelectedTime}>
                                      <SelectTrigger className="bg-background">
                                        <SelectValue placeholder="Select time" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {availableTimes.map((time) => (
                                          <SelectItem key={time} value={time}>
                                            {time}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Brief Description of Your Legal Matter</Label>
                                    <Textarea
                                      placeholder="Describe your legal question or concern..."
                                      className="bg-background"
                                    />
                                  </div>

                                  <Button
                                    className="w-full bg-primary text-primary-foreground"
                                    onClick={handleBook}
                                  >
                                    <CalendarIcon className="h-4 w-4 mr-2" />
                                    Confirm Booking
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>How It Works</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                        <CalendarIcon className="h-6 w-6 text-primary" />
                      </div>
                      <h4 className="font-semibold text-foreground">1. Schedule</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Choose an available time slot with your preferred attorney
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                        <DollarSign className="h-6 w-6 text-primary" />
                      </div>
                      <h4 className="font-semibold text-foreground">2. Pay</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Secure payment processed before your consultation
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                        <Video className="h-6 w-6 text-primary" />
                      </div>
                      <h4 className="font-semibold text-foreground">3. Meet</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Join your virtual consultation via secure video call
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    Upcoming Consultations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingConsultations.length > 0 ? (
                    upcomingConsultations.map((consultation, index) => (
                      <div key={index} className="p-4 border border-border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-foreground">{consultation.lawyer}</h4>
                          <Badge className="bg-green-500/20 text-green-400">{consultation.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{consultation.topic}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <CalendarIcon className="h-3 w-3" />
                            {consultation.date}
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {consultation.time}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" className="flex-1 bg-primary text-primary-foreground">
                            <Video className="h-4 w-4 mr-1" />
                            Join
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            Reschedule
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      No upcoming consultations
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Free Consultation</CardTitle>
                  <CardDescription>Get a free 15-minute initial consultation</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Not sure if you need legal help? Schedule a free 15-minute call to discuss your situation.
                  </p>
                  <Button className="w-full" variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    Request Free Consultation
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-primary/10 border-primary/20">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-foreground mb-2">Need Immediate Help?</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    For urgent legal matters, some attorneys offer same-day consultations.
                  </p>
                  <Button className="w-full bg-primary text-primary-foreground">
                    Find Available Now
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ConsultationsPage;
