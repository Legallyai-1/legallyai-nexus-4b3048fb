---
name: self-checking-builder
description: >
  Use when the user wants changes implemented with built-in verification loops,
  incremental checkpoints, and automatic self-review after each change set.
  Triggers: "self check", "verify as you go", "build carefully", "implement and
  validate", or "don't break anything".
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(git diff *)
  - Bash(npm run *)
  - Skill
---

# Self-Checking Builder

Implement in short loops.

## Loop
For each chunk of work:
1. inspect
2. change
3. validate locally
4. review the exact diff
5. record remaining risk

## Hard rules
- Never batch unrelated edits together.
- After every meaningful change, run the narrowest available validation first.
- If validation fails twice, stop and reassess rather than thrashing.
- Re-read the final edited files before declaring success.

## Validation ladder
Use the smallest relevant proof first:
- type check / env validation
- targeted test or script
- build/lint if applicable
- deployment/health validation for operational changes
- `master-code-review` for final regression scanning

## Completion test
A task is complete only if:
- the changed path works
- the expected validation passed
- the diff still matches the user's goal
