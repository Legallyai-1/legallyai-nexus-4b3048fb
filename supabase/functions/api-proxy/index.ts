import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-target-url, x-api-key-header",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const targetUrl = req.headers.get("x-target-url");
    
    if (!targetUrl) {
      return new Response(
        JSON.stringify({ error: "Missing x-target-url header" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the body if present
    let body = null;
    if (req.method !== "GET" && req.method !== "HEAD") {
      body = await req.text();
    }

    // Build headers for the target request
    const targetHeaders: Record<string, string> = {
      "Content-Type": req.headers.get("content-type") || "application/json",
    };

    // Check which API key to use based on the target URL
    if (targetUrl.includes("api.openai.com")) {
      targetHeaders["Authorization"] = `Bearer ${Deno.env.get("OPENAI_API_KEY")}`;
    } else if (targetUrl.includes("api.stripe.com")) {
      targetHeaders["Authorization"] = `Bearer ${Deno.env.get("STRIPE_SECRET_KEY")}`;
    } else if (targetUrl.includes("courtlistener.com")) {
      targetHeaders["Authorization"] = `Token ${Deno.env.get("COURTLISTENER_TOKEN")}`;
    }

    // Allow custom API key header name via x-api-key-header
    const customKeyHeader = req.headers.get("x-api-key-header");
    if (customKeyHeader) {
      const customKeyValue = req.headers.get(customKeyHeader);
      if (customKeyValue) {
        targetHeaders[customKeyHeader] = customKeyValue;
      }
    }

    console.log(`Proxying ${req.method} request to: ${targetUrl}`);

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: targetHeaders,
      body: body,
    });

    const responseData = await response.text();
    
    return new Response(responseData, {
      status: response.status,
      headers: {
        ...corsHeaders,
        "Content-Type": response.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
