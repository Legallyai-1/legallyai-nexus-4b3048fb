import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { GlowScalesLoader } from "@/components/brand/GlowScales";

// Route guard for app pages that don't do their own session check.
export function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [state, setState] = useState<"loading" | "in" | "out">("loading");

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active) setState(session?.user ? "in" : "out");
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setState(session?.user ? "in" : "out");
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  if (state === "loading") return <GlowScalesLoader />;
  if (state === "out") return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}
