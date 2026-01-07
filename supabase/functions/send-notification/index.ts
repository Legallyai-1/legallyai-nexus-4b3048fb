import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[NOTIFICATION] ${step}${detailsStr}`);
};

interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'loan' | 'custody' | 'defense' | 'workplace' | 'probono' | 'probation';
  hub?: string;
  referenceId?: string;
  referenceType?: string;
  sendEmail?: boolean;
  email?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    // Verify JWT and get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user: authUser }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !authUser) {
      logStep("Auth error", { error: authError?.message });
      throw new Error('Unauthorized - invalid token');
    }

    logStep("User authenticated", { userId: authUser.id });

    const payload: NotificationPayload = await req.json();
    const { userId, title, message, type, hub, referenceId, referenceType, sendEmail, email } = payload;

    if (!userId || !title || !message) {
      throw new Error("Missing required fields: userId, title, message");
    }

    // Authorization check: Users can only send notifications to themselves
    // Unless they have admin/owner role in an organization
    if (userId !== authUser.id) {
      const { data: roleData, error: roleError } = await supabaseClient
        .from('organization_members')
        .select('role')
        .eq('user_id', authUser.id)
        .in('role', ['admin', 'owner'])
        .limit(1);
      
      if (roleError || !roleData || roleData.length === 0) {
        logStep("Authorization denied - not admin", { callerUserId: authUser.id, targetUserId: userId });
        throw new Error('Not authorized to send notifications to other users');
      }
      
      logStep("Admin authorization granted", { role: roleData[0]?.role });
    }

    logStep("Creating notification", { userId, type, hub });

    // Insert in-app notification
    const { data: notification, error: notifError } = await supabaseClient
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        hub,
        reference_id: referenceId,
        reference_type: referenceType,
        is_read: false
      })
      .select()
      .single();

    if (notifError) {
      throw new Error(`Failed to create notification: ${notifError.message}`);
    }

    logStep("Notification created", { id: notification.id });

    // Send email if requested and Resend is configured
    let emailSent = false;
    if (sendEmail && email) {
      const resendKey = Deno.env.get("RESEND_API_KEY");
      if (resendKey) {
        try {
          const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${resendKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "LegallyAI <notifications@legallyai.ai>",
              to: [email],
              subject: title,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #1a365d;">${title}</h2>
                  <p style="color: #4a5568; line-height: 1.6;">${message}</p>
                  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                  <p style="color: #718096; font-size: 12px;">
                    This notification is from LegallyAI. 
                    <a href="https://legallyai.ai" style="color: #3182ce;">Visit our website</a>
                  </p>
                </div>
              `,
            }),
          });

          if (emailResponse.ok) {
            emailSent = true;
            logStep("Email sent", { to: email });
          } else {
            const errorData = await emailResponse.json();
            logStep("Email failed", { error: errorData });
          }
        } catch (emailError: any) {
          logStep("Email failed", { error: emailError.message });
        }
      } else {
        logStep("Resend API key not configured, skipping email");
      }
    }

    return new Response(JSON.stringify({
      success: true,
      notification,
      emailSent
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
