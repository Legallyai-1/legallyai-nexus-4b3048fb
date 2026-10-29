import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { corsHeaders } from "../_shared/cors.ts";
import { sha256Hex } from "../_shared/invite-email.ts";
import { getOrganizationSeats, hasFreeSeat, isSeatLimitDbError, PRICING_URL } from "../_shared/organization-seats.ts";

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

    // Seat check: a new staff member must fit the firm owner's plan. Only active members count here
    // (this invite already held a seat while pending). Clients and existing members are not blocked.
    const { data: pending, error: pendingError } = await supabase
      .from("organization_invites")
      .select("organization_id, role, accepted_at, expires_at")
      .eq("token_hash", tokenHash)
      .maybeSingle();
    if (pendingError) throw pendingError;
    if (pending && !pending.accepted_at && new Date(pending.expires_at) > new Date() && pending.role !== "client") {
      const { data: existing, error: existingError } = await supabase
        .from("organization_members")
        .select("is_active")
        .eq("organization_id", pending.organization_id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (existingError) throw existingError;
      if (existing?.is_active !== true) {
        const seats = await getOrganizationSeats(supabase, pending.organization_id, { countPendingInvites: false });
        if (!hasFreeSeat(seats)) {
          return json({
            success: false,
            status: "seat_limit",
            error: `This firm has no free seats right now. Ask the firm owner to add a seat (${PRICING_URL}), then open this invite link again.`,
            planName: seats.planName,
            pricingUrl: PRICING_URL,
          }, 409);
        }
      }
    }

    const { data, error } = await supabase.rpc("accept_organization_invite", {
      p_token_hash: tokenHash,
      p_actor_user_id: user.id,
      p_actor_email: user.email,
    });

    if (error) {
      // The database seat-limit trigger is the backstop for races with the check above.
      if (isSeatLimitDbError(error)) {
        return json({
          success: false,
          status: "seat_limit",
          error: `This firm has no free seats right now. Ask the firm owner to add a seat in Settings (${PRICING_URL}), then open this invite link again.`,
          pricingUrl: PRICING_URL,
        }, 409);
      }
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
