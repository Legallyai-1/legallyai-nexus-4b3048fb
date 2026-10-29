import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { updateSeatsHandler } from "../_shared/update-seats-handler.ts";

serve(updateSeatsHandler({
  env: (name) => Deno.env.get(name),
  createClient,
  createStripe: (key) => new Stripe(key, { apiVersion: "2025-08-27.basil" }),
}));
