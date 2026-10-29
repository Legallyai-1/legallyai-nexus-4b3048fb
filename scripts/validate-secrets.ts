import { checkDeploymentEnv, report } from './env-checks.ts';

process.exit(report('Deployment secrets', checkDeploymentEnv(process.env)));
