import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

import { getAnthropicKey } from "../_shared/anthropic-key.ts";
import { handleGenerateDocument } from "../_shared/generate-document-handler.ts";

serve((req) =>
  handleGenerateDocument(req, {
    env: (name) => Deno.env.get(name),
    createClient: (url, key, options) => createClient(url, key, options),
    anthropicKey: () => (Deno.env.get("ENABLE_PAID_AI") === "true" ? getAnthropicKey() : undefined),
    fetch: (input, init) => fetch(input, init),
  })
);
