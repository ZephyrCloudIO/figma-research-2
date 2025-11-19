---
id: task-46
title: Integrate prompt combination system into benchmark execution
status: To Do
assignee: []
created_date: '2025-11-11 15:16'
labels: []
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Enable the prompt combination system that's built but commented out in parallel-runner.ts, allowing specialist personas to receive their full context (persona + docs + model prompts + tier prompt) during benchmark execution.

## Context
Research findings show the prompt-builder.ts system is complete with proper combination order, but the integration is commented out in parallel-runner.ts:454-492. This means specialists run with ONLY tier prompts, missing their persona context, documentation, and model-specific instructions.

## Impact
- Specialists don't receive their values, attributes, tech stack, or domain expertise
- Model-specific prompt optimizations aren't being used
- Documentation references aren't included
- Benchmarks test tier prompts in isolation, not specialist templates

## Current State
```typescript
// In parallel-runner.ts:454-492
// TODO: Implement prompt injection
// const combinedPrompt = buildCombinedPrompt(template, tierPrompt, model);
// injectCombinedPrompt(scenarioPath, combinedPrompt);
```

## Technical Approach
1. Uncomment and test prompt injection code
2. Ensure combined prompts are written to scenario directories
3. Clean up injected prompts after execution
4. Handle concurrent executions (temp directories or locking)
5. Verify ze-benchmarks reads injected prompts correctly

## Validation
Run same benchmark with/without prompt injection and compare results to verify specialist context improves performance.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Uncomment prompt injection code in parallel-runner.ts:454-492
- [ ] #2 Test buildCombinedPrompt() generates correct output for all template sections
- [ ] #3 Implement safe prompt injection that doesn't corrupt original scenario files
- [ ] #4 Use temporary directories or file locking for concurrent executions
- [ ] #5 Verify injected prompts are read by ze-benchmarks CLI
- [ ] #6 Clean up injected prompts after benchmark completion
- [ ] #7 Handle injection failures gracefully (fall back to tier prompt only)
- [ ] #8 Add configuration flag to enable/disable prompt injection
- [ ] #9 Run A/B test: same benchmark with/without injection shows performance difference
- [ ] #10 Document prompt injection in benchmark-runner README
- [ ] #11 Add debug logging showing combined prompt preview (first 200 chars)
<!-- AC:END -->
