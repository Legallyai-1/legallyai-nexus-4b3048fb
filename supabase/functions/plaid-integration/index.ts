import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[PLAID] ${step}`, details ? JSON.stringify(details) : "");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check for Plaid credentials
    const plaidClientId = Deno.env.get("PLAID_CLIENT_ID");
    const plaidSecret = Deno.env.get("PLAID_SECRET");
    
    if (!plaidClientId || !plaidSecret) {
      logStep("Plaid credentials not configured");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Plaid integration not configured. Please add PLAID_CLIENT_ID and PLAID_SECRET.",
          configured: false
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, accessToken, startDate, endDate } = await req.json();
    logStep("Processing Plaid action", { action, userId: user.id });

    const plaidBaseUrl = "https://sandbox.plaid.com"; // Use production.plaid.com for production

    // Create Link Token for initializing Plaid Link
    if (action === "create_link_token") {
      logStep("Creating Plaid Link token");
      
      const response = await fetch(`${plaidBaseUrl}/link/token/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: plaidClientId,
          secret: plaidSecret,
          user: {
            client_user_id: user.id,
          },
          client_name: "LegallyAI",
          products: ["transactions", "auth"],
          country_codes: ["US"],
          language: "en",
        }),
      });

      const data = await response.json();
      
      if (data.error_code) {
        throw new Error(data.error_message);
      }

      return new Response(
        JSON.stringify({ success: true, link_token: data.link_token }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Exchange public token for access token
    if (action === "exchange_token") {
      const { publicToken } = await req.json();
      logStep("Exchanging public token");
      
      const response = await fetch(`${plaidBaseUrl}/item/public_token/exchange`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: plaidClientId,
          secret: plaidSecret,
          public_token: publicToken,
        }),
      });

      const data = await response.json();
      
      if (data.error_code) {
        throw new Error(data.error_message);
      }

      // Store the access token securely (in production, encrypt this)
      await supabase.from("integration_configs").upsert({
        organization_id: user.id, // Using user_id as org for personal accounts
        integration_type: "banking",
        integration_name: "Plaid",
        credentials_encrypted: data.access_token, // Should be encrypted in production
        is_active: true,
      });

      return new Response(
        JSON.stringify({ success: true, item_id: data.item_id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get transactions
    if (action === "get_transactions") {
      logStep("Fetching transactions");
      
      if (!accessToken) {
        throw new Error("Access token required");
      }

      const response = await fetch(`${plaidBaseUrl}/transactions/get`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: plaidClientId,
          secret: plaidSecret,
          access_token: accessToken,
          start_date: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          end_date: endDate || new Date().toISOString().split("T")[0],
        }),
      });

      const data = await response.json();
      
      if (data.error_code) {
        throw new Error(data.error_message);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          transactions: data.transactions,
          accounts: data.accounts,
          total_transactions: data.total_transactions
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get account balances
    if (action === "get_balances") {
      logStep("Fetching account balances");
      
      if (!accessToken) {
        throw new Error("Access token required");
      }

      const response = await fetch(`${plaidBaseUrl}/accounts/balance/get`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: plaidClientId,
          secret: plaidSecret,
          access_token: accessToken,
        }),
      });

      const data = await response.json();
      
      if (data.error_code) {
        throw new Error(data.error_message);
      }

      return new Response(
        JSON.stringify({ success: true, accounts: data.accounts }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if Plaid is configured
    if (action === "check_status") {
      return new Response(
        JSON.stringify({ 
          success: true, 
          configured: true,
          message: "Plaid integration is configured and ready"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logStep("Error", { error: errorMessage });
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
