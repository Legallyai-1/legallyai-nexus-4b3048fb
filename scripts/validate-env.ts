import {
  formatZodIssues,
  safeValidateClientEnv,
  safeValidateDeploymentEnv,
  safeValidateServerEnv,
} from '../.env.validation.ts';

const args = new Set(process.argv.slice(2));
const target = [...args].find((arg) => arg.startsWith('--target='))?.split('=')[1] ?? 'client';

const validators = {
  client: safeValidateClientEnv,
  server: safeValidateServerEnv,
  deployment: safeValidateDeploymentEnv,
} as const;

const validate = validators[target as keyof typeof validators];

if (!validate) {
  console.error(`Unknown target "${target}". Use --target=client|server|deployment.`);
  process.exit(1);
}

const result = validate(process.env);

if (!result.success) {
  console.error(`Environment validation failed for ${target}:`);
  console.error(formatZodIssues(result.error).join('\n'));
  process.exit(1);
}

console.log(`Environment validation passed for ${target}.`);
