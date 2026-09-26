---
name: master-code-review
description: >
  Use when the user wants a thorough final code review plan or reusable review
  skill focused on correctness, regressions, security, environment handling,
  deployment risk, and production readiness. Triggers: "review this PR",
  "production review", "final review", "release review", "audit these
  changes", "check for regressions", or when an agent needs a structured,
  high-signal review pass before merge.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(git diff --stat *)
  - Bash(git diff --name-only *)
  - Bash(git diff --unified=0 *)
  - Bash(git status --short)
  - Skill
---

# Master Code Review

Run a high-signal review that prioritizes correctness and production safety over style.

## Review order

1. **Scope check**
   - Identify files changed.
   - Confirm the diff matches the requested task and avoids unrelated churn.

2. **Runtime correctness**
   - Check control flow, null handling, async behavior, and state transitions.
   - Look for broken imports, bad paths, incompatible API usage, and unreachable fallbacks.

3. **Data and auth safety**
   - Review auth/session handling, permission boundaries, webhook validation, and environment-variable usage.
   - Flag any client exposure of secrets or server-only values.

4. **Deployment risk**
   - Verify CI/workflow changes, build-time env validation, and deploy-time secret handling.
   - Check health checks, rollback paths, and failure reporting.

5. **Regression surface**
   - Inspect touched shared utilities and config files for downstream breakage.
   - Prefer concrete failure scenarios over speculative concerns.

## Output format

Return findings in priority order using this template:

```markdown
## Findings
1. [severity: high] <title>
   - Evidence: <file:line or command output>
   - Impact: <what breaks or becomes unsafe>
   - Fix: <smallest corrective action>

## Passed checks
- <short bullet list>

## Residual risk
- <only if something important remains unverified>
```

## Guardrails

- Report only real bugs, security issues, deployment blockers, and logic regressions.
- Do not spend output on formatting, naming, or subjective style.
- If no meaningful issues are found, explicitly say the reviewed change set looks production-ready within the verified scope.
