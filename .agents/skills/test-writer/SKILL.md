---
name: test-writer
description: >
  Use when the goal is to add or tighten focused tests around a changed behavior,
  regression risk, or critical flow. Triggers: "add tests", "cover this change",
  "write regression tests", or "test this flow".
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(npm run *)
  - Skill
---

# Test Writer

Add the smallest useful proof for behavior.

## Principles
- test the changed behavior directly
- prefer regression coverage over generic snapshots
- match existing repo patterns
- avoid broad unrelated test churn

## Priority order
1. critical flow breakage risk
2. config/env validation
3. failure handling
4. integration contract assumptions

## Guardrails
- Do not add tests that only mirror implementation details.
- If test infrastructure is missing, say so explicitly and recommend the smallest practical proof instead.
