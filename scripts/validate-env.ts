import { checkClientEnv, checkDeploymentEnv, report } from './env-checks.ts';

const target = process.argv.slice(2).find((arg) => arg.startsWith('--target='))?.split('=')[1] ?? 'client';
const checks = { client: checkClientEnv, deployment: checkDeploymentEnv } as const;
const check = checks[target as keyof typeof checks];
if (!check) {
  console.error(`Unknown target "${target}". Use --target=client|deployment.`);
  process.exit(1);
}
process.exit(report(target, check(process.env)));
