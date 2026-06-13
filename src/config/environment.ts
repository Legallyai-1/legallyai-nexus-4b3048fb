/**
 * PRODUCTION-READY ENVIRONMENT CONFIGURATION
 * Centralized environment variable management for all deployment targets
 * Supports: Local Dev, Vercel, Supabase Cloud, Docker, etc.
 */

interface EnvironmentConfig {
  supabase: {
    url: string;
    anonKey: string;
    projectId: string;
  };
  ai: {
    vercelGatewayKey: string;
    model: 'claude-3-5-sonnet-20240620';
  };
  payments: {
    enabled: boolean;
    provider: 'paypost';
    merchantId?: string;
    apiKey?: string;
    apiSecret?: string;
    webhookSecret?: string;
    environment: 'sandbox' | 'production';
  };
  adsense: {
    enabled: boolean;
    clientId: string;
  };
  deployment: {
    environment: 'development' | 'staging' | 'production';
    url: string;
    nodeEnv: 'development' | 'production';
    debugMode: boolean;
  };
}

const validateRequiredEnvVar = (name: string, value: string | undefined): string => {
  if (!value || value === 'undefined') {
    throw new Error(
      `[CONFIG ERROR] Missing required environment variable: ${name}\n` +
      `Configure in Vercel > Project Settings > Environment Variables\n` +
      `or set locally in .env / .env.local`
    );
  }
  return value;
};

const getEnvironmentConfig = (): EnvironmentConfig => {
  const nodeEnv = import.meta.env.MODE as 'development' | 'production';
  const isProduction = nodeEnv === 'production';
  const isDevelopment = nodeEnv === 'development';

  // SUPABASE (REQUIRED everywhere)
  const supabaseUrl = validateRequiredEnvVar('VITE_SUPABASE_URL', import.meta.env.VITE_SUPABASE_URL);
  const supabaseAnonKey = validateRequiredEnvVar('VITE_SUPABASE_ANON_KEY', import.meta.env.VITE_SUPABASE_ANON_KEY);
  const supabaseProjectId = validateRequiredEnvVar('VITE_SUPABASE_PROJECT_ID', import.meta.env.VITE_SUPABASE_PROJECT_ID);

  // VERCEL AI GATEWAY (REQUIRED everywhere)
  const vercelAiKey = validateRequiredEnvVar('VERCEL_AI_GATEWAY_KEY', import.meta.env.VERCEL_AI_GATEWAY_KEY);

  // PAYMENTS (REQUIRED in production, optional in development)
  const paymentsEnabled = import.meta.env.VITE_ENABLE_PAYMENTS === 'true' && isProduction;
  if (paymentsEnabled) {
    validateRequiredEnvVar('PAYPOST_MERCHANT_ID', import.meta.env.PAYPOST_MERCHANT_ID);
    validateRequiredEnvVar('PAYPOST_API_KEY', import.meta.env.PAYPOST_API_KEY);
    validateRequiredEnvVar('PAYPOST_API_SECRET', import.meta.env.PAYPOST_API_SECRET);
    validateRequiredEnvVar('PAYPOST_WEBHOOK_SECRET', import.meta.env.PAYPOST_WEBHOOK_SECRET);
  }

  // ADSENSE (REQUIRED in production, optional in development)
  const adsenseEnabled = import.meta.env.VITE_ENABLE_ADSENSE === 'true' && isProduction;
  const adsenseClientId = import.meta.env.VITE_ADSENSE_CLIENT_ID || '';

  const config: EnvironmentConfig = {
    supabase: {
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
      projectId: supabaseProjectId,
    },
    ai: {
      vercelGatewayKey: vercelAiKey,
      model: 'claude-3-5-sonnet-20240620',
    },
    payments: {
      enabled: paymentsEnabled,
      provider: 'paypost',
      merchantId: paymentsEnabled ? import.meta.env.PAYPOST_MERCHANT_ID : undefined,
      apiKey: paymentsEnabled ? import.meta.env.PAYPOST_API_KEY : undefined,
      apiSecret: paymentsEnabled ? import.meta.env.PAYPOST_API_SECRET : undefined,
      webhookSecret: paymentsEnabled ? import.meta.env.PAYPOST_WEBHOOK_SECRET : undefined,
      environment: (import.meta.env.PAYPOST_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
    },
    adsense: {
      enabled: adsenseEnabled,
      clientId: adsenseClientId,
    },
    deployment: {
      environment: isProduction ? 'production' : isDevelopment ? 'development' : 'staging',
      url: import.meta.env.VERCEL_URL || 'http://localhost:5173',
      nodeEnv,
      debugMode: import.meta.env.VITE_DEBUG_MODE === 'true' || isDevelopment,
    },
  };

  // Log configuration on startup (development only)
  if (config.deployment.debugMode) {
    console.log('[CONFIG] LegallyAI Nexus Environment:', {
      deployment: config.deployment.environment,
      supabase: `${config.supabase.projectId}`,
      ai: `Claude ${config.ai.model}`,
      payments: `${config.payments.enabled ? 'ENABLED' : 'DISABLED'}`,
      adsense: config.adsense.enabled ? 'ENABLED' : 'DISABLED',
    });
  }

  return config;
};

export const config = getEnvironmentConfig();
export const supabaseConfig = config.supabase;
export const aiConfig = config.ai;
export const paymentsConfig = config.payments;
export const adsenseConfig = config.adsense;
export const deploymentConfig = config.deployment;
