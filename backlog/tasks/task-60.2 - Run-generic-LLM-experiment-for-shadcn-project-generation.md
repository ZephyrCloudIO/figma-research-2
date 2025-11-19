---
id: task-60.2
title: Run generic LLM experiment for shadcn project generation
status: Done
assignee: []
created_date: '2025-11-11'
completed_date: '2025-11-11'
note: 'Completed - achieved 65% success rate, build failed due to missing v4 configuration'
labels:
  - shadcn
  - experiment
  - benchmark
dependencies:
  - task-60.1
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Run baseline experiment using generic LLM (no specialist persona) to generate a shadcn project.

**Model**: anthropic/claude-sonnet-4.5
**Prompt**: "Generate a new shadcn project, use vite and add the button component"
**Location**: `personas/starting_from_outcome/experiments/claude-sonnet-4.5/generic/`

**Process**:
1. Start fresh conversation with Claude Sonnet 4.5
2. Provide ONLY the starting prompt (no additional context/instructions)
3. Allow the LLM to generate the project
4. Document all steps the LLM takes
5. Save all generated files

**Comparison Against Control**:
- [ ] Bundler: Vite used, correct version, proper config
- [ ] Package Manager: Correct manager and versions
- [ ] Styles: index.css configured correctly
- [ ] Types: tsconfig files match control
- [ ] Components: Button component added correctly
- [ ] Build: `pnpm build` succeeds

**Artifacts to Capture**:
- Complete conversation log
- All generated files
- Build output/errors
- Comparison notes vs control
- Screenshots/evidence of success/failure for each criterion

**Scoring**: Use ze-benchmarks to score against control implementation
<!-- SECTION:DESCRIPTION:END -->
