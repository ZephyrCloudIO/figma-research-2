---
id: task-32
title: Clean up and improve figma-research benchmark scenarios and prompts
status: In Progress
assignee: []
created_date: '2025-11-11 00:59'
updated_date: '2025-11-11 01:08'
labels:
  - benchmarks
  - quality
  - prompts
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The current figma-research benchmark scenarios and prompts contain unrealistic content and boilerplate trash that needs to be cleaned up.

## Issues to Address
1. Scenarios may not reflect realistic Figma research tasks
2. Prompts contain excessive boilerplate
3. Need to ensure scenarios are practical and meaningful
4. Remove any placeholder/generic content

## Scope
- Review all 43 scenarios in reference-repos/ze-benchmarks/suites/figma-research/
- Review prompts for each scenario (L0, L1, L2 tiers)
- Update to realistic, practical scenarios
- Remove boilerplate and make concise
- Ensure scenarios actually test relevant capabilities
<!-- SECTION:DESCRIPTION:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
## Problems Identified

### Current Issues
1. **All prompts use identical boilerplate** across 43 scenarios
2. **L0-minimal is too vague**: Just "Implement the required functionality to pass the tests"
3. **L2-directed is bloated**: Full of generic advice like "Follow SOLID principles", "Write comprehensive JSDoc comments"
4. **No realistic context**: Prompts don't explain the actual problem or domain
5. **Template-generated repetition**: Every scenario has exact same structure

### Examples of Bad Content
- "This is part of the figma-research pipeline in the {domain} domain"
- Repetitive "Success Criteria" sections listing tests/lint/typecheck
- Generic "Implementation Guidelines" with numbered steps
- No mention of actual Figma concepts or realistic use cases

## Improvement Strategy

### New Prompt Structure

**L0-minimal** (30-50 words)
- Brief task description
- Key objective
- Reference to tests

**L1-basic** (100-150 words)  
- Realistic scenario description
- Specific requirements for this scenario
- Key considerations for the domain
- Clear success criteria

**L2-directed** (200-300 words)
- Detailed realistic context
- Domain-specific guidance
- Edge cases to consider
- Implementation approach suggestions
- NO generic boilerplate

### Categories to Fix (43 scenarios)
- figma-api (5): URL parsing, node extraction, rate limiting, caching, latency
- classification (5): Detection, variants, properties, semantic, inventory  
- code-generation (5): Accuracy, types, semantic, accessibility, latency
- visual-validation (5): Rendering, pixel, semantic, feedback, latency
- ai-integration (5): Selection, prompts, costs, reliability, performance
- orchestration (5): Coordination, iterations, errors, metrics, performance
- tokens (5): Extraction, semantic, formats, consistency, performance
- performance (5): Cache hits, latency, parallel, costs, bottlenecks
- Other (3): workspace-creation, migration, optimization

## Implementation Approach
1. Start with one category (figma-api) as template
2. Create realistic, domain-specific prompts
3. Apply pattern to remaining categories
4. Remove all boilerplate
5. Test with single scenario benchmark
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Progress Update

### Completed: figma-api-url-parsing (1/43)

Updated all 3 tiers with realistic, domain-specific content:
- L0-minimal: 30 words, task-focused
- L1-basic: 130 words, practical requirements + tips
- L2-directed: 220 words, implementation strategy with code examples

### Template Pattern Established

**L0 Structure:**
- One sentence describing the task
- Reference to function name and key outputs
- Mention tests

**L1 Structure:**
- Brief context/use case
- Specific formats/patterns to handle
- Key requirements (bullet list)
- Implementation tips

**L2 Structure:**
- Real-world context
- Domain-specific patterns/knowledge
- Step-by-step implementation strategy with code snippets
- Edge cases and validation details

**Eliminated:**
- Generic "Follow SOLID principles"
- "Write comprehensive JSDoc comments"
- "This is part of the figma-research pipeline"
- Repetitive success criteria sections
- Numbered implementation guidelines

### Next Steps
- Complete remaining 42 scenarios using this template
- Focus on domain-specific, actionable content
- Keep L0 under 50 words, L1 under 200, L2 under 300

## Progress Update 2

### Completed: 3/43 scenarios (7%)

**figma-api category (3/5 complete):**
1. ✅ figma-api-url-parsing - All 3 tiers updated
2. ✅ figma-api-node-extraction - All 3 tiers updated
3. ✅ figma-api-rate-limiting - All 3 tiers updated
4. ⏳ figma-api-caching - In progress
5. ⏳ figma-api-latency - Pending

### Quality Metrics

**Word counts (target ranges):**
- L0: 26-30 words (target: 30-50) ✓
- L1: 94-125 words (target: 100-150) ✓
- L2: 200-250 words (target: 200-300) ✓

### Content Improvements

**Removed (examples):**
- "This is part of the figma-research pipeline in the {domain} domain"
- "Follow SOLID principles"
- "Write comprehensive JSDoc comments"
- Repetitive "Success Criteria" sections
- Generic "Implementation Guidelines" (1-5 numbered steps)

**Added (examples):**
- Specific API endpoints and patterns
- Real code examples (fetch, error handling, backoff)
- Domain knowledge (rate limits, node structures, URL formats)
- Edge cases and best practices
- Practical implementation strategies

### Remaining Work

- 2 more figma-api scenarios
- 40 scenarios across 8 other categories
- Estimated: ~2-3 hours for remaining scenarios

## Figma-API Category Complete! (5/5)

### All figma-api scenarios updated (5/43 total = 12%)

1. ✅ figma-api-url-parsing
2. ✅ figma-api-node-extraction
3. ✅ figma-api-rate-limiting
4. ✅ figma-api-caching
5. ✅ figma-api-latency

### Key Improvements Demonstrated

**Before (boilerplate example):**
> "This is part of the figma-research pipeline in the figma-api domain. Follow SOLID principles. Write comprehensive JSDoc comments."

**After (domain-specific example):**
> ```typescript
> const backoffMs = Math.min(
>   1000 * Math.pow(2, attempt - 1), // 1s, 2s, 4s, 8s
>   30000 // max 30s
> ) + Math.random() * 1000; // jitter
> ```

### Content Quality

- Real API patterns and endpoints
- Working code examples
- Specific HTTP headers and status codes
- Performance optimization strategies
- Edge cases and error handling
- Domain knowledge (rate limits, caching strategies, etc.)

### Remaining Work

**38 scenarios remaining across 8 categories:**
- classification (5)
- code-generation (5)
- visual-validation (5)
- ai-integration (5)
- orchestration (5)
- tokens (5)
- performance (5)
- other (3: workspace-creation, migration, optimization)

Estimated time: ~2 hours for remaining scenarios using established pattern.
<!-- SECTION:NOTES:END -->
