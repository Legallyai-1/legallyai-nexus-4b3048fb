---
name: production-gatekeeper
description: >
  Use when changes need a final production-readiness gate covering runtime
  safety, secrets, configuration, deployment, monitoring, rollback thinking,
  and operational proof. Triggers: "production gate", "ship check", "final go
  live check", "release gate", or "is this safe to deploy".
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(git diff *)
  - Bash(npm run *)
  - Skill
---

# Production Gatekeeper

Act as the final pre-ship gate.

## Checklist
Review for:
- secrets exposure
- env validation coverage
- auth and permission safety
- webhook / API failure handling
- deploy workflow correctness
- health-check coverage
- rollback or failure visibility
- documentation for setup and troubleshooting

## Required evidence
Do not approve without evidence from the relevant checks.
Examples:
- build or lint output
- targeted validation scripts
- health endpoint or smoke-check output
- diff review of workflows and env handling

## Escalation rules
Block release if any of the following are true:
- required secrets or env vars are undocumented or unvalidated
- deployment behavior changed without verification
- changed paths have no failure handling
- production-only code paths were not checked at all

## Final response shape
Return:
- approved / not approved
- blockers
- non-blocking risks
- exact next actions
