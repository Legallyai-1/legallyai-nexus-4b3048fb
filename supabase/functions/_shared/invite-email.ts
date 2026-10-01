const encoder = new TextEncoder();

const toHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

export const sha256Hex = async (value: string) => {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return toHex(digest);
};

export const generateInviteToken = () => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return toHex(bytes.buffer);
};

interface InviteEmailArgs {
  inviteeEmail: string;
  organizationName: string;
  role: string;
  inviteLink: string;
  inviterName?: string | null;
}

export const sendOrganizationInviteEmail = async ({
  inviteeEmail,
  organizationName,
  role,
  inviteLink,
  inviterName,
}: InviteEmailArgs) => {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) {
    return {
      sent: false,
      reason: "RESEND_API_KEY not configured",
    };
  }

  const from = Deno.env.get("INVITE_FROM_EMAIL") ?? "LegallyAI <notifications@legallyai.ai>";
  const inviterLabel = inviterName?.trim() ? `${inviterName.trim()} ` : "";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + resendKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [inviteeEmail],
      subject: `Join ${organizationName} on LegallyAI`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
          <h2 style="color: #1a365d;">You're invited to join ${organizationName}</h2>
          <p style="color: #4a5568; line-height: 1.6;">
            ${inviterLabel}invited you to join <strong>${organizationName}</strong> as <strong>${role}</strong>.
          </p>
          <p style="margin: 24px 0;">
            <a
              href="${inviteLink}"
              style="background: #0f766e; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px; display: inline-block;"
            >
              Accept invite
            </a>
          </p>
          <p style="color: #718096; font-size: 12px; line-height: 1.5;">
            If the button does not work, copy and paste this link into your browser:<br />
            <a href="${inviteLink}">${inviteLink}</a>
          </p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return {
      sent: false,
      reason: `Resend error: ${errorText}`,
    };
  }

  return { sent: true as const };
};
