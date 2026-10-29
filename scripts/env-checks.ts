// Self-contained CI configuration checks (the old .env.validation.ts was removed in e3e8ff5).
// Required items fail the job; optional ones only warn. Values are never printed.

export type Env = Record<string, string | undefined>;
export interface CheckResult { errors: string[]; warnings: string[] }

const val = (env: Env, name: string) => (env[name] ?? '').trim();
const has = (env: Env, name: string) => val(env, name).length > 0;

function httpsUrl(value: string): boolean {
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
}

const BOOLEAN_FLAGS = ['VITE_ENABLE_PAYMENTS', 'VITE_ENABLE_ADSENSE', 'ENABLE_PAYMENTS'];

export function checkClientEnv(env: Env): CheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  // The client falls back to the built-in project URL/key when these are unset, so they are optional,
  // but a value that is set must be well-formed.
  if (!has(env, 'VITE_SUPABASE_URL')) warnings.push('VITE_SUPABASE_URL is not set; the Vercel project environment must provide it.');
  else if (!httpsUrl(val(env, 'VITE_SUPABASE_URL'))) errors.push('VITE_SUPABASE_URL must be an https URL.');
  if (!has(env, 'VITE_SUPABASE_ANON_KEY') && !has(env, 'VITE_SUPABASE_PUBLISHABLE_KEY')) {
    warnings.push('Neither VITE_SUPABASE_PUBLISHABLE_KEY nor VITE_SUPABASE_ANON_KEY is set; the Vercel project environment must provide one.');
  }
  for (const flag of BOOLEAN_FLAGS) {
    if (has(env, flag) && !['true', 'false'].includes(val(env, flag))) errors.push(`${flag} must be "true" or "false" when set.`);
  }
  if (!has(env, 'VITE_ENABLE_PAYMENTS')) warnings.push('VITE_ENABLE_PAYMENTS is not set in GitHub; the Vercel project environment decides.');
  return { errors, warnings };
}

export function checkDeploymentEnv(env: Env): CheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!has(env, 'VERCEL_TOKEN')) errors.push('VERCEL_TOKEN secret is missing; the deploy job cannot authenticate.');
  if (!has(env, 'VERCEL_ORG_ID')) warnings.push('VERCEL_ORG_ID is not set; the workflow falls back to the known team id.');
  if (!has(env, 'VERCEL_PROJECT_ID')) warnings.push('VERCEL_PROJECT_ID is not set; the workflow falls back to the known project id.');
  else if (!/^prj_[A-Za-z0-9]+$/.test(val(env, 'VERCEL_PROJECT_ID'))) errors.push('VERCEL_PROJECT_ID must look like prj_… when set.');
  // Server-side secrets live in the Vercel project env; GitHub copies are optional.
  for (const name of ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET']) {
    if (!has(env, name)) warnings.push(`${name} is not set in GitHub (fine if it is set in Vercel).`);
  }
  if (!has(env, 'SUPABASE_SECRET_KEY') && !has(env, 'SUPABASE_SERVICE_ROLE_KEY')) {
    warnings.push('No Supabase server key in GitHub (fine if it is set in Vercel).');
  }
  return { errors, warnings };
}

export function report(label: string, result: CheckResult): number {
  for (const w of result.warnings) console.warn(`::warning::${w}`);
  if (result.errors.length) {
    console.error(`${label} validation failed:`);
    for (const e of result.errors) console.error(`- ${e}`);
    return 1;
  }
  console.log(`${label} validation passed${result.warnings.length ? ` with ${result.warnings.length} warning(s)` : ''}.`);
  return 0;
}
