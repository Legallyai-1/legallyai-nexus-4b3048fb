---
name: bug-hunter
description: >
  Use when the goal is to find likely functional bugs, broken flows, regressions,
  state mistakes, bad edge-case handling, or silent failures before or after a
  change. Triggers: "find bugs", "hunt regressions", "what could break", "debug
  this flow", or "check for logic issues".
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(git diff *)
  - Bash(npm run *)
  - Skill
---

# Bug Hunter

Find concrete bugs, not style issues.

## Method
1. Identify the changed or suspicious flow.
2. Trace the happy path.
3. Trace the failure path.
4. Check state transitions, async timing, null cases, and stale data risks.
5. Prefer specific break scenarios with evidence.

## Focus areas
- bad branching or missing guards
- stale React effects/state
- unsafe assumptions about env/config
- partial success without rollback or user feedback
- mismatched types/contracts between modules
- broken loading/error/empty states

## Output
Return only:
- confirmed bug risks
- exact evidence
- likely impact
- smallest fix direction

## Guardrails
- Do not report vague “might fail” concerns without a path to failure.
- Do not spend time on formatting or naming.
