import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // SUPABASE_SERVICE_ROLE_KEY is automatically injected by Supabase Edge Functions runtime
    // This key bypasses Row Level Security and should only be used server-side
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const payload = await req.json()
    console.log('Received webhook payload:', payload)

    // Store webhook data in Supabase
    const { data, error } = await supabaseClient
      .from('webhook_logs')
      .insert({
        payload: payload,
        source: 'github-actions'
      })

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed', data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
