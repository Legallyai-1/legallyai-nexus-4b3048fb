import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "./Layout";
import { MainLayout } from "./MainLayout";

// Pages reachable both signed out and signed in: signed-in users get the app shell
// (sidebar + app header) instead of the public "Sign in / Start free" navbar.
export function AuthAwareLayout({ children }: { children: ReactNode }) {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active) setSignedIn(Boolean(session?.user));
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setSignedIn(Boolean(session?.user));
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  if (signedIn) return <MainLayout>{children}</MainLayout>;
  return <Layout>{children}</Layout>;
}
