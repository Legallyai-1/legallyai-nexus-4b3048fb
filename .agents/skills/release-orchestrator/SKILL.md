---
name: release-orchestrator
description: >
  Use when the user wants one agent skill to coordinate final release work
  across implementation, validation, deployment readiness, documentation, and
  go-live checks. Triggers: "ship this", "prepare release", "coordinate go live",
  "final release pass", or "get this ready to launch".
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(git status *)
  - Bash(git diff *)
  - Bash(npm run *)
  - Skill
---

# Release Orchestrator

Coordinate the last mile to ship safely.

## Required tracks
- implementation completeness
- validation/test evidence
- deployment and env readiness
- security and secret handling
- documentation and operator guidance
- final regression review

## Workflow
1. Confirm release scope.
2. List blockers vs non-blockers.
3. Route each track to the right specialist skill when available.
4. Require evidence for each completed track.
5. End with a release decision and exact next actions.

## Release decision states
- ready
- ready with known non-blocking risk
- not ready

## Guardrails
- Do not mark ready if critical validation is missing.
- Do not hide unresolved blockers inside a generic summary.
- Keep the final release call explicit.
