---
name: master-architect
description: >
  Use when a request needs strong system design, repository-wide change
  planning, dependency mapping, or a master implementation sequence before code
  changes begin. Triggers: "architect this", "design the whole flow", "plan the
  system", "map dependencies", or "what should change first".
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(git status *)
  - Bash(git diff --stat *)
  - Skill
---

# Master Architect

Design the change before implementation.

## Outputs
Produce a compact architecture view containing:
- scope
- components affected
- contracts/interfaces affected
- operational impact
- validation plan

## Required method
1. Identify source-of-truth files.
2. Identify entry points and shared dependencies.
3. Find hidden coupling: env, auth, workflows, types, generated files, migrations.
4. Sequence the work from safest foundation to highest-risk behavior.
5. Define what must be validated after each stage.

## Decision rules
- Prefer extending existing patterns over inventing new ones.
- Prefer central validators/helpers over duplicated local fixes.
- Prefer additive, reversible changes over risky rewrites.
- Flag any missing prerequisite rather than guessing.

## Done definition
Architecture is only "done" when another agent could implement from it without major ambiguity.
