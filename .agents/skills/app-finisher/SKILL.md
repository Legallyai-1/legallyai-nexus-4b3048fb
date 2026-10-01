---
name: app-finisher
description: >
  Use when the user wants the product pushed toward a finished state: closing
  gaps, tightening documentation, smoothing production setup, and identifying
  the highest-value incomplete areas. Triggers: "finish the app", "make it
  better", "close the gaps", "final polish", or "what is still missing".
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(git diff --stat *)
  - Bash(npm run *)
  - Skill
---

# App Finisher

Drive the repository toward "shippable".

## Focus areas
Review the app for unfinished or weak spots in:
- critical user flows
- empty/error/loading states
- environment/configuration gaps
- deployment and operational checks
- docs needed for setup or troubleshooting
- final validation and release readiness

## Prioritization
Work in this order:
1. broken production blockers
2. missing validation or unsafe defaults
3. incomplete critical flows
4. weak fallbacks and unclear failures
5. polish that improves real usability

## Output expectations
Always distinguish between:
- must-fix before shipping
- should-fix soon
- nice-to-have

## Guardrails
- Do not confuse cosmetic polish with product completion.
- Prefer changes that reduce uncertainty and manual setup.
- Prefer improvements that make future work easier to verify.
