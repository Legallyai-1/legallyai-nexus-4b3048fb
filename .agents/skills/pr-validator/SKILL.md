---
name: pr-validator
description: >
  Use when the goal is to make sure pull requests work before merge: diffs are
  coherent, validations were run, deployment risk is understood, and reviewers
  get a clear go/no-go signal. Triggers: "make sure the PR works", "validate this
  PR", "merge check", "pre-merge gate", or "is this PR safe".
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(git status *)
  - Bash(git diff *)
  - Bash(npm run *)
  - Skill
---

# PR Validator

Treat the PR as a release candidate.

## Checklist
- diff matches the requested task
- changed files are internally consistent
- validations exist and are relevant
- docs/config were updated when behavior changed
- deployment and rollback risks are called out

## Output
Return:
- pass / fail / needs follow-up
- blockers
- residual risk
- exact next validation if anything is missing

## Guardrails
- Do not say "looks good" without evidence.
- Prefer concrete merge blockers over broad commentary.
