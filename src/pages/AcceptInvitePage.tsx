import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Loader2, Users } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { buildInviteAcceptancePath } from "@/lib/invite";
import { setActiveOrganizationId } from "@/lib/organizations";

type AcceptanceStatus =
  | "already_accepted"
  | "email_mismatch"
  | "expired"
  | "invalid";

const statusMessages: Record<AcceptanceStatus, string> = {
  already_accepted: "This invitation has already been used.",
  email_mismatch: "Sign in with the email address that received this invitation.",
  expired: "This invitation has expired. Ask an organization owner to send a new one.",
  invalid: "This invitation link is invalid. Ask an organization owner to send a new one.",
};

const rolePaths: Record<string, string> = {
  owner: "/admin",
  admin: "/admin",
  manager: "/dashboard",
  lawyer: "/dashboard",
  paralegal: "/dashboard",
  employee: "/employee",
  client: "/client-portal",
};

export default function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token")?.trim() ?? "";
  const [checkingSession, setCheckingSession] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    void supabase.auth.getUser().then(({ data: { user } }) => {
      if (!active) return;
      setUserEmail(user?.email ?? null);
      setCheckingSession(false);
    }).catch(() => {
      if (!active) return;
      setUserEmail(null);
      setCheckingSession(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const handleAccept = async () => {
    if (!token || !userEmail) return;

    setIsAccepting(true);
    setMessage("");

    try {
      const { data, error } = await supabase.functions.invoke("accept-invite", {
        body: { token },
      });
      let result = data;

      if (error) {
        const response = error.context;
        if (response instanceof Response) {
          result = await response.clone().json().catch(() => null);
        }
      }

      if (result?.success && result.organizationId) {
        setActiveOrganizationId(result.organizationId);
        const destination = rolePaths[result.role] ?? "/dashboard";
        navigate(destination, { replace: true });
        return;
      }

      const failureMessage = statusMessages[result?.status as AcceptanceStatus];
      setMessage(failureMessage ?? "We couldn't accept this invitation. Please try again.");
    } catch {
      setMessage("We couldn't accept this invitation. Please try again.");
    } finally {
      setIsAccepting(false);
    }
  };

  const returnTo = buildInviteAcceptancePath(token);
  const loginPath = `/login?returnTo=${encodeURIComponent(returnTo)}`;
  const signupPath = `/signup?returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <Layout showFooter={false}>
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-background">
        <section className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-card">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-legal-gold/10">
            {isAccepting ? (
              <Loader2 className="h-7 w-7 animate-spin text-legal-gold" />
            ) : (
              <Users className="h-7 w-7 text-legal-gold" />
            )}
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Accept your organization invitation
          </h1>

          {!token ? (
            <p className="mt-4 text-sm text-muted-foreground">
              This link is missing its invitation token. Open the complete link from your invitation email.
            </p>
          ) : checkingSession ? (
            <p className="mt-4 text-sm text-muted-foreground">Checking your sign-in status…</p>
          ) : userEmail ? (
            <>
              <p className="mt-4 text-sm text-muted-foreground">
                Signed in as <strong>{userEmail}</strong>. Accept the invitation to join the organization.
              </p>
              {message && <p role="alert" className="mt-4 text-sm text-destructive">{message}</p>}
              <Button
                className="mt-6 w-full"
                variant="gold"
                onClick={handleAccept}
                disabled={isAccepting}
              >
                {isAccepting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Accept invitation
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <p className="mt-4 text-sm text-muted-foreground">
                Sign in or create an account using the email address that received this invitation.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <Button asChild variant="gold">
                  <Link to={loginPath}>Sign in to continue</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to={signupPath}>Create an account</Link>
                </Button>
              </div>
            </>
          )}
        </section>
      </main>
    </Layout>
  );
}
