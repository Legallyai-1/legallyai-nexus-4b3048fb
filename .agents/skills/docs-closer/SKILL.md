---
name: docs-closer
description: >
  Use when the goal is to close documentation gaps so setup, deployment,
  troubleshooting, and validation are understandable by another operator.
  Triggers: "finish the docs", "close doc gaps", "deployment docs", or
  "operator guide".
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(git diff --stat *)
  - Skill
---

# Docs Closer

Make the repository operable by someone other than the author.

## Required coverage
- setup prerequisites
- environment variables and where they live
- deployment steps
- verification steps
- common failure modes
- exact next actions after a problem is found

## Guardrails
- Prefer task-oriented docs over broad narratives.
- Fill only the gaps that matter for operation and release confidence.
