import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { adminOrgIds, userInAnyOrg } from "../_shared/org-access.ts";

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
    const { userId, title, message, type, hub, referenceId, referenceType } = payload;

    if (!userId || !title || !message) {
      throw new Error("Missing required fields: userId, title, message");
    }

    // Authorization check: users can notify themselves. Notifying someone else requires being an
    // owner/admin of a firm the target also belongs to (no cross-firm messages).
    if (userId !== authUser.id) {
      const orgIds = await adminOrgIds(supabaseClient, authUser.id);
      if (!await userInAnyOrg(supabaseClient, userId, orgIds)) {
        logStep("Authorization denied - target not in caller's firm", { callerUserId: authUser.id });
        throw new Error('Not authorized to send notifications to other users');
      }
      logStep("Admin authorization granted");
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

    return new Response(JSON.stringify({
      success: true,
      notification,
      emailSent: false
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: /authorization|authenticat|unauthorized|invalid jwt|auth session/i.test(errorMessage) ? 401 : /no stripe customer|required|missing|not found/i.test(errorMessage) ? 400 : 500,
    });
  }
});
