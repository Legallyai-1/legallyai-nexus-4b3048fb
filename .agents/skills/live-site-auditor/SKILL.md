---
name: live-site-auditor
description: >
  Use when the goal is to verify the live site behaves like production software:
  key routes load, critical integrations respond, and production smoke checks are
  explicit. Triggers: "check the live site", "is production working", "verify all
  tabs", "production smoke test", or "audit the deployed website".
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(npm run validate:deployment *)
  - Bash(npm run *)
  - Skill
---

# Live Site Auditor

Verify the deployed app from the outside in.

## Required coverage
- homepage and auth entry points
- pricing / payments surfaces
- legal hub navigation and major tabs
- webhook/API routes expected to reject/accept appropriately
- third-party integration health signals

## Method
1. identify critical production routes
2. run smoke checks
3. identify gaps not covered by automation
4. report what is verified vs assumed

## Guardrails
- Never treat an untested route as working.
- Separate deployment reachability from business-flow correctness.
