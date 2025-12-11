import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IntegrationRequest {
  action: 'list' | 'connect' | 'disconnect' | 'sync' | 'webhook_test' | 'get_available';
  integration_name?: string;
  organization_id: string;
  config?: Record<string, any>;
  webhook_url?: string;
}

const AVAILABLE_INTEGRATIONS = [
  { name: 'quickbooks', type: 'accounting', displayName: 'QuickBooks', description: 'Sync billing and invoices', icon: 'calculator' },
  { name: 'xero', type: 'accounting', displayName: 'Xero', description: 'Cloud accounting integration', icon: 'calculator' },
  { name: 'docusign', type: 'document', displayName: 'DocuSign', description: 'E-signatures and document management', icon: 'file-signature' },
  { name: 'adobe_sign', type: 'document', displayName: 'Adobe Sign', description: 'Enterprise e-signatures', icon: 'file-signature' },
  { name: 'google_calendar', type: 'calendar', displayName: 'Google Calendar', description: 'Sync appointments and deadlines', icon: 'calendar' },
  { name: 'outlook', type: 'calendar', displayName: 'Microsoft Outlook', description: 'Calendar and email integration', icon: 'calendar' },
  { name: 'slack', type: 'communication', displayName: 'Slack', description: 'Team notifications and updates', icon: 'message-circle' },
  { name: 'teams', type: 'communication', displayName: 'Microsoft Teams', description: 'Enterprise communication', icon: 'message-circle' },
  { name: 'dropbox', type: 'storage', displayName: 'Dropbox', description: 'Cloud file storage', icon: 'cloud' },
  { name: 'google_drive', type: 'storage', displayName: 'Google Drive', description: 'Document storage and sharing', icon: 'cloud' },
  { name: 'box', type: 'storage', displayName: 'Box', description: 'Enterprise file management', icon: 'cloud' },
  { name: 'clio', type: 'legal', displayName: 'Clio', description: 'Practice management sync', icon: 'briefcase' },
  { name: 'mycase', type: 'legal', displayName: 'MyCase', description: 'Legal practice management', icon: 'briefcase' },
  { name: 'lawpay', type: 'payments', displayName: 'LawPay', description: 'Legal payments processing', icon: 'credit-card' },
  { name: 'stripe', type: 'payments', displayName: 'Stripe', description: 'Payment processing', icon: 'credit-card' },
  { name: 'zapier', type: 'automation', displayName: 'Zapier', description: 'Workflow automation', icon: 'zap' },
  { name: 'make', type: 'automation', displayName: 'Make (Integromat)', description: 'Advanced automation', icon: 'zap' },
  { name: 'salesforce', type: 'crm', displayName: 'Salesforce', description: 'CRM integration', icon: 'users' },
  { name: 'hubspot', type: 'crm', displayName: 'HubSpot', description: 'Marketing and CRM', icon: 'users' },
  { name: 'lexisnexis', type: 'research', displayName: 'LexisNexis', description: 'Legal research integration', icon: 'search' },
  { name: 'westlaw', type: 'research', displayName: 'Westlaw', description: 'Legal research database', icon: 'search' },
  { name: 'courtlistener', type: 'research', displayName: 'CourtListener', description: 'Court records API', icon: 'search' },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !userData.user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: IntegrationRequest = await req.json();
    const { action, integration_name, organization_id, config, webhook_url } = body;

    let result: any = null;

    switch (action) {
      case 'get_available':
        result = {
          integrations: AVAILABLE_INTEGRATIONS,
          categories: [...new Set(AVAILABLE_INTEGRATIONS.map(i => i.type))]
        };
        break;

      case 'list':
        const { data: configs } = await supabase
          .from('integration_configs')
          .select('*')
          .eq('organization_id', organization_id);

        result = {
          connected: configs || [],
          available: AVAILABLE_INTEGRATIONS.filter(
            ai => !configs?.find(c => c.integration_name === ai.name)
          )
        };
        break;

      case 'connect':
        if (!integration_name) {
          throw new Error('Integration name required');
        }

        const integrationInfo = AVAILABLE_INTEGRATIONS.find(i => i.name === integration_name);
        if (!integrationInfo) {
          throw new Error('Unknown integration');
        }

        const { data: newConfig, error: insertError } = await supabase
          .from('integration_configs')
          .insert({
            organization_id,
            integration_name,
            integration_type: integrationInfo.type,
            settings: config || {},
            is_active: true,
            sync_status: 'connected'
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Log the connection
        await supabase.from('integration_logs').insert({
          integration_id: newConfig.id,
          action: 'connect',
          status: 'success',
          request_data: config
        });

        result = { success: true, integration: newConfig };
        break;

      case 'disconnect':
        if (!integration_name) {
          throw new Error('Integration name required');
        }

        const { data: existingConfig } = await supabase
          .from('integration_configs')
          .select('id')
          .eq('organization_id', organization_id)
          .eq('integration_name', integration_name)
          .single();

        if (existingConfig) {
          await supabase.from('integration_logs').insert({
            integration_id: existingConfig.id,
            action: 'disconnect',
            status: 'success'
          });

          await supabase
            .from('integration_configs')
            .delete()
            .eq('id', existingConfig.id);
        }

        result = { success: true };
        break;

      case 'sync':
        if (!integration_name) {
          throw new Error('Integration name required');
        }

        const { data: syncConfig } = await supabase
          .from('integration_configs')
          .select('*')
          .eq('organization_id', organization_id)
          .eq('integration_name', integration_name)
          .single();

        if (!syncConfig) {
          throw new Error('Integration not connected');
        }

        // Simulate sync operation
        await supabase
          .from('integration_configs')
          .update({ 
            last_sync_at: new Date().toISOString(),
            sync_status: 'synced'
          })
          .eq('id', syncConfig.id);

        await supabase.from('integration_logs').insert({
          integration_id: syncConfig.id,
          action: 'sync',
          status: 'success',
          response_data: { records_synced: Math.floor(Math.random() * 50) + 10 }
        });

        result = { 
          success: true, 
          last_sync: new Date().toISOString(),
          records_synced: Math.floor(Math.random() * 50) + 10
        };
        break;

      case 'webhook_test':
        if (!webhook_url) {
          throw new Error('Webhook URL required');
        }

        try {
          const testPayload = {
            event: 'test',
            timestamp: new Date().toISOString(),
            organization_id,
            data: { message: 'Webhook test from LegallyAI' }
          };

          await fetch(webhook_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testPayload)
          });

          result = { success: true, message: 'Webhook test sent successfully' };
        } catch (webhookError) {
          result = { success: false, error: 'Failed to reach webhook URL' };
        }
        break;
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Integration Hub error:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
