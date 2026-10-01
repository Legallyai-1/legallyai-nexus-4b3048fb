---
name: lawyer-hub-simulator
description: >
  Use when the goal is to evaluate whether lawyer-facing workflows work for real
  firms across sizes, from solo practitioners to large organizations. Triggers:
  "test lawyer hub", "act like a law firm", "verify firm workflows", "check law
  office usability", or "make sure lawyer hub works".
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(git diff *)
  - Skill
---

# Lawyer Hub Simulator

Review the product as if you were running a law firm.

## Personas to simulate
- solo attorney
- small firm with support staff
- growing regional firm
- large enterprise-style legal organization

## Evaluate
- onboarding and organization setup
- matter/case visibility
- role and permission expectations
- client and document workflows
- billing/subscription expectations
- clarity of navigation and next steps

## Output
Return findings grouped by persona:
- what works
- what is confusing
- what blocks adoption
- what must be fixed before real firms rely on it
