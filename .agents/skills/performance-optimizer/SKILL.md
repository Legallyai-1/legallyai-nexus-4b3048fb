---
name: performance-optimizer
description: >
  Use when the goal is to reduce obvious performance problems in runtime,
  rendering, bundle size, data fetching, or operational latency. Triggers:
  "speed this up", "performance audit", "why is this slow", "reduce bundle", or
  "optimize the app".
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(git diff *)
  - Bash(npm run *)
  - Skill
---

# Performance Optimizer

Focus on meaningful bottlenecks with measurable impact.

## Targets
- unnecessary re-renders
- oversized bundles or duplicated dependencies
- repeated network requests
- slow initialization paths
- blocking synchronous work on the client
- wasteful build/deploy steps

## Method
1. identify likely hotspot
2. find the mechanism causing cost
3. prefer the smallest fix with measurable benefit
4. validate no behavior regression

## Guardrails
- Do not trade correctness or security for micro-optimizations.
- Prefer high-impact changes over speculative tuning.
- State the expected win clearly.
