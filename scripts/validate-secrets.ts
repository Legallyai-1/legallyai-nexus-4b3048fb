import {
  requiredGitHubSecrets,
  requiredGitHubVariables,
} from '../.env.validation.ts';

const missingSecrets = requiredGitHubSecrets.filter((name) => !process.env[name]);
const missingPaymentSecrets = process.env.VITE_ENABLE_PAYMENTS === 'true'
  ? ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'].filter((name) => !process.env[name])
  : [];
const missingVariables = requiredGitHubVariables.filter((name) => !process.env[name]);
const missingPublicKey = !process.env.VITE_SUPABASE_ANON_KEY && !process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const missingServerKey = !process.env.SUPABASE_SECRET_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY;

if (missingSecrets.length > 0 || missingPaymentSecrets.length > 0 || missingVariables.length > 0 || missingPublicKey || missingServerKey) {
  console.error('Required deployment configuration is missing.');

  const allMissingSecrets = [...missingSecrets, ...missingPaymentSecrets];
  if (allMissingSecrets.length > 0) {
    console.error(`Missing secrets: ${allMissingSecrets.join(', ')}`);
  }

  if (missingVariables.length > 0) {
    console.error(`Missing variables: ${missingVariables.join(', ')}`);
  }

  if (missingPublicKey) {
    console.error('Missing one of VITE_SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_KEY.');
  }

  if (missingServerKey) {
    console.error('Missing one of SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY.');
  }

  process.exit(1);
}

console.log('All required deployment secrets and variables are present.');
