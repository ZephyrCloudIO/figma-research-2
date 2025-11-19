---
id: task-60.4
title: Run shadcn specialist experiment and compare results
status: Done
assignee: []
created_date: '2025-11-11'
completed_date: '2025-11-11'
labels:
  - shadcn
  - experiment
  - benchmark
  - comparison
dependencies:
  - task-60.2
  - task-60.3
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Run experiment using the shadcn specialist template combined with the starting prompt, then compare results across all three approaches (control, generic, specialist).

**Model**: anthropic/claude-sonnet-4.5
**Combined Prompt**: Shadcn specialist template + "Generate a new shadcn project, use vite and add the button component"
**Location**: `personas/starting_from_outcome/experiments/claude-sonnet-4.5/specialist/`

**Process**:
1. Start fresh conversation with Claude Sonnet 4.5
2. Load shadcn specialist template as system/context
3. Provide starting prompt
4. Allow the LLM to generate the project
5. Document all steps the LLM takes
6. Save all generated files

**Comparison Against Control**:
- [ ] Bundler: Vite used, correct version, proper config
- [ ] Package Manager: Correct manager and versions
- [ ] Styles: index.css configured correctly
- [ ] Types: tsconfig files match control
- [ ] Components: Button component added correctly
- [ ] Build: `pnpm build` succeeds

**Benchmark Scoring**:
Use ze-benchmarks to score both generic and specialist outputs against control:
- Generic LLM score vs control
- Specialist LLM score vs control
- Delta between generic and specialist
- Analysis of which criteria improved with specialist

**Results Location**: `personas/starting_from_outcome/benchmarks/results/`

**Analysis Questions**:
1. Which success criteria did generic fail but specialist pass?
2. Which criteria did both fail/pass?
3. What gaps exist in the specialist template that need iteration?
4. Is there measurable improvement with the specialist approach?

**Iteration**:
Based on results, update specialist template (task-60.3) and re-run to improve scores. Track version history of template and corresponding scores.

**Deliverables**:
- [ ] Specialist experiment complete with all artifacts
- [ ] Ze-benchmarks scores for all three approaches
- [ ] Comparison analysis document
- [ ] Recommendations for specialist template improvements
- [ ] Decision on whether outcome-driven persona approach is effective
<!-- SECTION:DESCRIPTION:END -->
