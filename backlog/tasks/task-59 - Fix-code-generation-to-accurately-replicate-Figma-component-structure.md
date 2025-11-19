---
id: task-59
title: Fix code generation to accurately replicate Figma component structure
status: To Do
assignee: []
created_date: '2025-11-11 17:57'
labels:
  - code-generation
  - semantic-mapping
  - critical-bug
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**CRITICAL ISSUE**: Visual validation revealed that code generation is producing generic/synthetic components instead of accurately replicating the actual Figma designs.

**Evidence from Button Showcase**:
- **Figma Export**: Comprehensive button showcase with dozens of variants, multiple sizes, states, and both light/dark themes
- **Generated Component**: Generic showcase with only 3 buttons in a "Playground" section
- **Similarity**: 63.30% (after removing app chrome from comparison)

**Root Cause**:
The LLM is generating "what a button showcase should look like" based on its training, rather than accurately translating the specific Figma design structure and content.

**Impact**:
- Generated components don't match designs
- Missing content (dark theme section entirely absent)
- Wrong layout structure
- Cannot be used as drop-in replacements for Figma designs

**Solution Approaches**:

1. **Improve Prompt Engineering**:
   - Add explicit instruction: "Replicate EXACTLY what you see in the Figma data, do not invent or improvise"
   - Provide structure outline extracted from Figma hierarchy
   - Add validation step in prompt to check coverage

2. **Enhance Figma Data Extraction**:
   - Preserve more structural information during summarization
   - Extract explicit component counts and sections
   - Map all text content explicitly (don't let LLM invent text)

3. **Add Structure Validation**:
   - Compare generated component structure to Figma hierarchy
   - Flag missing sections before finalizing generation
   - Iterate with corrective prompts if structure doesn't match

**Files to Investigate**:
- `validation-pipeline/src/orchestrator.ts:buildCodeGenerationPrompt` - Where prompts are built
- `validation-pipeline/src/figma-summarizer.ts` - May be removing too much structure
- Generated components:
  - `ui-demo-app/src/components/generated/ButtonShowcase.tsx` (generic, not accurate)
  - `ui-demo-app/src/components/generated/Item.tsx` (likely similar issues)

**Acceptance Criteria**:
- Generated components match Figma exports structurally (all sections present)
- Visual similarity >85% after screenshot capture improvements
- No "invented" content - all text, layout, and structure from Figma only
<!-- SECTION:DESCRIPTION:END -->
