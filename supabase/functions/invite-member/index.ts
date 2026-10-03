import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { corsHeaders } from "../_shared/cors.ts";
import {
  generateInviteToken,
  sendOrganizationInviteEmail,
  sha256Hex,
} from "../_shared/invite-email.ts";

const allowedRoles = ["owner", "admin", "manager", "lawyer", "paralegal", "employee", "client"] as const;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    const organizationId = body?.organizationId;
    const email = String(body?.email ?? "").trim().toLowerCase();
    const role = String(body?.role ?? "").trim().toLowerCase();

    if (!organizationId || !email || !allowedRoles.includes(role as typeof allowedRoles[number])) {
      return json({ error: "organizationId, email, and a valid role are required" }, 400);
    }

    if (!emailPattern.test(email)) {
      return json({ error: "A valid invitee email is required" }, 400);
    }

    const { data: actorRoles, error: actorRoleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .in("role", ["owner", "admin"]);

    if (actorRoleError) {
      throw actorRoleError;
    }

    const actorIsOwner = (actorRoles ?? []).some(({ role: actorRole }) => actorRole === "owner");
    const actorIsAdmin = actorIsOwner || (actorRoles ?? []).some(({ role: actorRole }) => actorRole === "admin");

    if (!actorIsAdmin) {
      return json({ error: "Only organization owners or admins can invite members" }, 403);
    }

    if (role === "owner" && !actorIsOwner) {
      return json({ error: "Only organization owners can invite owners" }, 403);
    }

    const { data: organization, error: organizationError } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", organizationId)
      .maybeSingle();

    if (organizationError) {
      throw organizationError;
    }

    if (!organization) {
      return json({ error: "Organization not found" }, 404);
    }

    const rawToken = generateInviteToken();
    const tokenHash = await sha256Hex(rawToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: invite, error: inviteError } = await supabase
      .from("organization_invites")
      .insert({
        organization_id: organizationId,
        email,
        role,
        token_hash: tokenHash,
        invited_by: user.id,
        expires_at: expiresAt,
      })
      .select("id, expires_at")
      .single();

    if (inviteError) {
      throw inviteError;
    }

    const { error: auditError } = await supabase.from("audit_logs").insert({
      org_id: organizationId,
      actor_user_id: user.id,
      action: "organization.invite_created",
      target_type: "organization_invite",
      target_id: invite.id,
      metadata: { email, role, expires_at: invite.expires_at },
    });

    if (auditError) {
      await supabase.from("organization_invites").delete().eq("id", invite.id);
      throw auditError;
    }

    const baseUrl = (Deno.env.get("INVITE_BASE_URL") ?? "https://legallyai.ai/accept-invite").replace(/\/+$/, "");
    const inviteLink = `${baseUrl}?token=${encodeURIComponent(rawToken)}`;

    const emailResult = await sendOrganizationInviteEmail({
      inviteeEmail: email,
      organizationName: organization.name,
      role,
      inviteLink,
      inviterName: user.user_metadata?.full_name ?? null,
    });

    const deliveryStatus = emailResult.sent
      ? "sent"
      : emailResult.reason === "RESEND_API_KEY not configured"
        ? "not_configured"
        : "failed";

    return json({
      success: true,
      inviteId: invite.id,
      expiresAt: invite.expires_at,
      emailSent: emailResult.sent,
      deliveryStatus,
      deliveryDetail: emailResult.sent ? null : emailResult.reason,
    });
  } catch (error) {
    console.error("[invite-member]", error);
    return json({ error: "Failed to create organization invite" }, 500);
  }
});
