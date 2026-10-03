import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { corsHeaders } from "../_shared/cors.ts";
import { sha256Hex } from "../_shared/invite-email.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Authorization header required" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user?.email) {
      return json({ error: "Unauthorized" }, 401);
    }

    const body = await req.json();
    const rawToken = String(body?.token ?? "").trim();

    if (!rawToken) {
      return json({ error: "Invite token is required" }, 400);
    }

    const tokenHash = await sha256Hex(rawToken);
    const { data, error } = await supabase.rpc("accept_organization_invite", {
      p_token_hash: tokenHash,
      p_actor_user_id: user.id,
      p_actor_email: user.email,
    });

    if (error) {
      throw error;
    }

    const result = data?.[0];
    if (!result) {
      return json({ error: "Invite acceptance did not return a result" }, 500);
    }

    switch (result.status) {
      case "accepted":
        return json({ success: true, status: result.status, organizationId: result.organization_id, role: result.assigned_role });
      case "already_member":
        return json({ success: true, status: result.status, organizationId: result.organization_id, role: result.assigned_role });
      case "already_accepted":
        return json({ success: false, status: result.status, organizationId: result.organization_id, role: result.assigned_role }, 409);
      case "expired":
        return json({ success: false, status: result.status, organizationId: result.organization_id, role: result.assigned_role }, 410);
      case "email_mismatch":
        return json({ success: false, status: result.status, organizationId: result.organization_id, role: result.assigned_role }, 403);
      case "invalid":
        return json({ success: false, status: result.status }, 404);
      default:
        return json({ success: false, status: result.status }, 400);
    }
  } catch (error) {
    console.error("[accept-invite]", error);
    return json({ error: "Failed to accept organization invite" }, 500);
  }
});
