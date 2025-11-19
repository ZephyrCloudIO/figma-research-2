---
id: task-45
title: Fix score parsing for Claude models in benchmark-runner
status: To Do
assignee: []
created_date: '2025-11-11 15:16'
labels: []
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Fix the critical issue where Claude Sonnet 4.5 and Claude Sonnet 3.5 return 0 scores despite successful benchmark runs, while gpt-4o scores correctly at 8.93/10 average.

## Context
Research findings show baseline-results.json has:
- gpt-4o: 8.93/10 average (WORKING)
- claude-sonnet-4.5: 0/10 average (BROKEN - 100% success but no scores)
- claude-sonnet-3.5: 0/10 average (BROKEN - 100% success but no scores)

All benchmarks pass (99.74% success rate) but Claude model scores aren't being captured.

## Root Cause Investigation
The score parsing regex patterns in parallel-runner.ts:229-246 may not match ze-benchmarks CLI output format for Claude models. The patterns work for gpt-4o but fail silently for Claude.

## Current Regex Patterns
```typescript
const scoreMatch = stdout.match(/score[:\s]+(\d+(?:\.\d+)?)/i);
const passFailMatch = stdout.match(/✓|✗|PASS|FAIL/);
```

## Investigation Steps
1. Run single benchmark with claude-sonnet-4.5 and capture full stdout
2. Compare stdout format between gpt-4o (working) and claude-sonnet-4.5 (broken)
3. Identify differences in ze-benchmarks output formatting
4. Update regex patterns to match all model outputs
5. Add fallback parsing strategies

## Success Criteria
All three models should return similar score distributions, not 0 for Claude models.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Capture raw stdout from ze-benchmarks for claude-sonnet-4.5 benchmark run
- [ ] #2 Capture raw stdout from ze-benchmarks for gpt-4o benchmark run (control)
- [ ] #3 Document differences in output format between models
- [ ] #4 Update score parsing regex in parallel-runner.ts to handle both formats
- [ ] #5 Add fallback parsing strategies (alternate patterns, output sections)
- [ ] #6 Add debug logging showing raw stdout when score parsing fails
- [ ] #7 Test with all 3 models (claude-sonnet-4.5, claude-sonnet-3.5, gpt-4o)
- [ ] #8 All models return non-zero scores for passing benchmarks
- [ ] #9 Score distribution is consistent across models (±2 points variance acceptable)
- [ ] #10 Add unit tests for score parsing with sample outputs from each model
- [ ] #11 Update TROUBLESHOOTING.md documenting score parsing issues and fixes
<!-- AC:END -->
