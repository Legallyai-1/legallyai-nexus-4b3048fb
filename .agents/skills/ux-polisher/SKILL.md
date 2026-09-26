---
name: ux-polisher
description: >
  Use when the goal is to improve real product usability by tightening user
  flows, clarity, fallbacks, empty states, messaging, and interaction polish.
  Triggers: "polish the UX", "make this smoother", "improve onboarding",
  "clean up the flow", or "make the app feel finished".
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(git diff --stat *)
  - Skill
---

# UX Polisher

Improve usability with product-focused polish.

## Focus areas
- first-run clarity
- empty/loading/error states
- clear next actions
- consistency of labels and expectations
- friction in critical flows
- fallback behavior when integrations are unavailable

## Prioritization
1. confusion that blocks task completion
2. unclear errors or dead ends
3. missing feedback after user actions
4. rough edges in repeated flows
5. cosmetic polish that supports clarity

## Guardrails
- Prioritize clarity and task completion over decoration.
- Do not suggest broad redesigns when targeted polish will fix the issue.
- Tie every suggestion to a user-facing outcome.
