import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationPayload {
  user_id: string;
  title: string;
  message: string;
  notification_type: string;
  reference_id?: string;
  reference_type?: string;
  scheduled_for?: string;
}

const logStep = (step: string, details?: any) => {
  console.log(`[NOTIFICATION-SCHEDULER] ${step}`, details ? JSON.stringify(details) : "");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action } = await req.json();
    logStep("Processing action", { action });

    // Check for case deadlines
    if (action === "check_deadlines" || action === "check_all") {
      logStep("Checking case deadlines...");
      
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      // Get upcoming court dates
      const { data: upcomingCases, error: casesError } = await supabase
        .from("cases")
        .select("id, title, court_date, client_id, assigned_lawyer_id")
        .gte("court_date", today.toISOString())
        .lte("court_date", nextWeek.toISOString())
        .eq("status", "active");

      if (casesError) {
        logStep("Error fetching cases", casesError);
      } else if (upcomingCases && upcomingCases.length > 0) {
        logStep(`Found ${upcomingCases.length} upcoming court dates`);
        
        for (const caseItem of upcomingCases) {
          if (caseItem.assigned_lawyer_id) {
            const daysUntil = Math.ceil(
              (new Date(caseItem.court_date!).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            );
            
            await supabase.from("notifications").insert({
              user_id: caseItem.assigned_lawyer_id,
              title: `Court Date Reminder: ${caseItem.title}`,
              message: `You have a court date in ${daysUntil} day(s) for case "${caseItem.title}"`,
              type: "court_reminder",
              reference_id: caseItem.id,
              reference_type: "case",
              is_read: false,
            });
            
            logStep("Created court reminder notification", { caseId: caseItem.id });
          }
        }
      }
    }

    // Check for case task deadlines
    if (action === "check_tasks" || action === "check_all") {
      logStep("Checking task deadlines...");
      
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: dueTasks, error: tasksError } = await supabase
        .from("case_tasks")
        .select("id, title, due_date, assigned_to, case_id")
        .gte("due_date", today.toISOString())
        .lte("due_date", tomorrow.toISOString())
        .eq("status", "pending");

      if (tasksError) {
        logStep("Error fetching tasks", tasksError);
      } else if (dueTasks && dueTasks.length > 0) {
        logStep(`Found ${dueTasks.length} tasks due soon`);
        
        for (const task of dueTasks) {
          if (task.assigned_to) {
            await supabase.from("notifications").insert({
              user_id: task.assigned_to,
              title: `Task Due: ${task.title}`,
              message: `Task "${task.title}" is due tomorrow`,
              type: "task_reminder",
              reference_id: task.id,
              reference_type: "task",
              is_read: false,
            });
            
            logStep("Created task reminder notification", { taskId: task.id });
          }
        }
      }
    }

    // Check for payment reminders (custody payments)
    if (action === "check_payments" || action === "check_all") {
      logStep("Checking payment deadlines...");
      
      const today = new Date();
      const nextThreeDays = new Date(today);
      nextThreeDays.setDate(nextThreeDays.getDate() + 3);

      const { data: duePayments, error: paymentsError } = await supabase
        .from("custody_payments")
        .select("id, amount, due_date, payer_id, custody_case_id")
        .gte("due_date", today.toISOString())
        .lte("due_date", nextThreeDays.toISOString())
        .eq("status", "pending");

      if (paymentsError) {
        logStep("Error fetching payments", paymentsError);
      } else if (duePayments && duePayments.length > 0) {
        logStep(`Found ${duePayments.length} payments due soon`);
        
        for (const payment of duePayments) {
          if (payment.payer_id) {
            const daysUntil = Math.ceil(
              (new Date(payment.due_date!).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            );
            
            await supabase.from("notifications").insert({
              user_id: payment.payer_id,
              title: "Payment Reminder",
              message: `Child support payment of $${payment.amount} is due in ${daysUntil} day(s)`,
              type: "payment_reminder",
              reference_id: payment.id,
              reference_type: "payment",
              is_read: false,
            });
            
            logStep("Created payment reminder notification", { paymentId: payment.id });
          }
        }
      }
    }

    // Check for appointment reminders
    if (action === "check_appointments" || action === "check_all") {
      logStep("Checking appointment reminders...");
      
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: upcomingAppointments, error: appointmentsError } = await supabase
        .from("appointments")
        .select("id, title, start_time, client_id, lawyer_id")
        .gte("start_time", today.toISOString())
        .lte("start_time", tomorrow.toISOString())
        .eq("status", "scheduled");

      if (appointmentsError) {
        logStep("Error fetching appointments", appointmentsError);
      } else if (upcomingAppointments && upcomingAppointments.length > 0) {
        logStep(`Found ${upcomingAppointments.length} upcoming appointments`);
        
        for (const apt of upcomingAppointments) {
          // Notify lawyer
          if (apt.lawyer_id) {
            await supabase.from("notifications").insert({
              user_id: apt.lawyer_id,
              title: `Appointment Reminder: ${apt.title}`,
              message: `You have an appointment "${apt.title}" scheduled for tomorrow`,
              type: "appointment_reminder",
              reference_id: apt.id,
              reference_type: "appointment",
              is_read: false,
            });
          }
          
          // Notify client
          if (apt.client_id) {
            await supabase.from("notifications").insert({
              user_id: apt.client_id,
              title: `Appointment Reminder: ${apt.title}`,
              message: `Your consultation "${apt.title}" is scheduled for tomorrow`,
              type: "appointment_reminder",
              reference_id: apt.id,
              reference_type: "appointment",
              is_read: false,
            });
          }
          
          logStep("Created appointment reminder notifications", { appointmentId: apt.id });
        }
      }
    }

    // Check for document deadlines
    if (action === "check_documents" || action === "check_all") {
      logStep("Checking document deadlines...");
      
      // Check case timeline events that are document-related
      const today = new Date();
      const nextThreeDays = new Date(today);
      nextThreeDays.setDate(nextThreeDays.getDate() + 3);

      const { data: upcomingEvents, error: eventsError } = await supabase
        .from("case_timelines")
        .select("id, event_title, event_date, event_type, case_id, created_by")
        .gte("event_date", today.toISOString())
        .lte("event_date", nextThreeDays.toISOString())
        .in("event_type", ["document_deadline", "filing_deadline", "discovery_deadline"]);

      if (eventsError) {
        logStep("Error fetching document deadlines", eventsError);
      } else if (upcomingEvents && upcomingEvents.length > 0) {
        logStep(`Found ${upcomingEvents.length} document deadlines`);
        
        for (const event of upcomingEvents) {
          if (event.created_by) {
            const daysUntil = Math.ceil(
              (new Date(event.event_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            );
            
            await supabase.from("notifications").insert({
              user_id: event.created_by,
              title: `Document Deadline: ${event.event_title}`,
              message: `Deadline "${event.event_title}" is due in ${daysUntil} day(s)`,
              type: "document_deadline",
              reference_id: event.id,
              reference_type: "timeline_event",
              is_read: false,
            });
            
            logStep("Created document deadline notification", { eventId: event.id });
          }
        }
      }
    }

    // Log the scheduler run
    logStep("Notification scheduler completed successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Notification scheduler completed",
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logStep("Error in notification scheduler", { error: errorMessage });
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
