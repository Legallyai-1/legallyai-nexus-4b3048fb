import { z } from 'zod';

const booleanFlag = z.enum(['true', 'false']);
const nonEmptyString = z.string().trim().min(1);
const urlString = z.string().trim().url();

function coerceEnv(input: Record<string, string | undefined | null>) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => typeof value === 'string' && value.length > 0),
  );
}

export const clientEnvSchema = z.object({
  VITE_SUPABASE_URL: urlString,
  VITE_SUPABASE_ANON_KEY: nonEmptyString.optional(),
  VITE_SUPABASE_PUBLISHABLE_KEY: nonEmptyString.optional(),
  VITE_SUPABASE_PROJECT_ID: nonEmptyString,
  VITE_ADSENSE_CLIENT_ID: nonEmptyString.optional(),
  VITE_ENABLE_ADSENSE: booleanFlag.default('true'),
  VITE_ENABLE_PAYMENTS: booleanFlag.default('true'),
}).superRefine((env, ctx) => {
  if (!env.VITE_SUPABASE_ANON_KEY && !env.VITE_SUPABASE_PUBLISHABLE_KEY) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Set VITE_SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_KEY.',
      path: ['VITE_SUPABASE_ANON_KEY'],
    });
  }

  if (env.VITE_ENABLE_ADSENSE === 'true' && !env.VITE_ADSENSE_CLIENT_ID) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'VITE_ADSENSE_CLIENT_ID is required when VITE_ENABLE_ADSENSE=true.',
      path: ['VITE_ADSENSE_CLIENT_ID'],
    });
  }
}).transform((env) => ({
  ...env,
  VITE_SUPABASE_PUBLIC_KEY: env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
}));

export const serverEnvSchema = z.object({
  SUPABASE_URL: urlString.optional(),
  SUPABASE_SECRET_KEY: nonEmptyString.optional(),
  SUPABASE_SERVICE_ROLE_KEY: nonEmptyString.optional(),
  STRIPE_SECRET_KEY: nonEmptyString.optional(),
  STRIPE_WEBHOOK_SECRET: nonEmptyString.optional(),
  SUPABASE_ACCESS_TOKEN: nonEmptyString.optional(),
  VERCEL_TOKEN: nonEmptyString.optional(),
  VERCEL_ORG_ID: nonEmptyString.optional(),
  VERCEL_PROJECT_ID: nonEmptyString.optional(),
}).superRefine((env, ctx) => {
  if ((env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY) && !env.SUPABASE_URL) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'SUPABASE_URL is required when Supabase server credentials are configured.',
      path: ['SUPABASE_URL'],
    });
  }
});

export const stripeWebhookEnvSchema = z.object({
  STRIPE_SECRET_KEY: nonEmptyString,
  STRIPE_WEBHOOK_SECRET: nonEmptyString,
  SUPABASE_URL: urlString,
  SUPABASE_SECRET_KEY: nonEmptyString.optional(),
  SUPABASE_SERVICE_ROLE_KEY: nonEmptyString.optional(),
}).superRefine((env, ctx) => {
  if (!env.SUPABASE_SECRET_KEY && !env.SUPABASE_SERVICE_ROLE_KEY) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Set SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY for Stripe webhook writes.',
      path: ['SUPABASE_SECRET_KEY'],
    });
  }
}).transform((env) => ({
  ...env,
  SUPABASE_SERVER_KEY: env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || '',
}));

export const deploymentEnvSchema = clientEnvSchema.and(z.object({
  SUPABASE_URL: urlString,
  STRIPE_SECRET_KEY: nonEmptyString,
  STRIPE_WEBHOOK_SECRET: nonEmptyString,
  VERCEL_TOKEN: nonEmptyString,
  VERCEL_ORG_ID: nonEmptyString,
  VERCEL_PROJECT_ID: nonEmptyString,
  SUPABASE_ACCESS_TOKEN: nonEmptyString.optional(),
  SUPABASE_SECRET_KEY: nonEmptyString.optional(),
  SUPABASE_SERVICE_ROLE_KEY: nonEmptyString.optional(),
})).superRefine((env, ctx) => {
  if (!env.SUPABASE_SECRET_KEY && !env.SUPABASE_SERVICE_ROLE_KEY) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Set SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY for production deployment.',
      path: ['SUPABASE_SECRET_KEY'],
    });
  }
});

export type ClientEnv = z.output<typeof clientEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type StripeWebhookEnv = z.output<typeof stripeWebhookEnvSchema>;
export type DeploymentEnv = z.infer<typeof deploymentEnvSchema>;

export const requiredGitHubVariables = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_PROJECT_ID',
  'VITE_ENABLE_ADSENSE',
  'VITE_ENABLE_PAYMENTS',
  'VERCEL_ORG_ID',
  'VERCEL_PROJECT_ID',
] as const;

export const requiredGitHubSecrets = [
  'VERCEL_TOKEN',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'SUPABASE_URL',
] as const;

export function formatZodIssues(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
    return `- ${path}${issue.message}`;
  });
}

export function safeValidateClientEnv(env: Record<string, string | undefined | null>) {
  return clientEnvSchema.safeParse(coerceEnv(env));
}

export function validateClientEnv(env: Record<string, string | undefined | null>) {
  return clientEnvSchema.parse(coerceEnv(env));
}

export function safeValidateServerEnv(env: Record<string, string | undefined | null>) {
  return serverEnvSchema.safeParse(coerceEnv(env));
}

export function validateServerEnv(env: Record<string, string | undefined | null>) {
  return serverEnvSchema.parse(coerceEnv(env));
}

export function safeValidateStripeWebhookEnv(env: Record<string, string | undefined | null>) {
  return stripeWebhookEnvSchema.safeParse(coerceEnv(env));
}

export function validateStripeWebhookEnv(env: Record<string, string | undefined | null>) {
  return stripeWebhookEnvSchema.parse(coerceEnv(env));
}

export function safeValidateDeploymentEnv(env: Record<string, string | undefined | null>) {
  return deploymentEnvSchema.safeParse(coerceEnv(env));
}
