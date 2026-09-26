---
name: integration-auditor
description: >
  Use when multiple integrations must work together consistently across frontend,
  backend, workflows, and deployment. Triggers: "audit integrations", "check all
  services", "verify Supabase/Stripe/Vercel wiring", or "make sure integrations
  work together".
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(git diff *)
  - Bash(npm run *)
  - Skill
---

# Integration Auditor

Audit cross-system correctness.

## Focus
- env names and secret flow
- frontend/server contract consistency
- webhook and callback expectations
- deployment workflow assumptions
- health checks and monitoring coverage

## Required output
For each integration area, state:
- source of truth
- dependency chain
- failure mode
- proof of verification
- missing evidence
