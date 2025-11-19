---
id: task-56
title: Improve semantic mapping for complex multi-section layouts
status: To Do
assignee: []
created_date: '2025-11-11 17:01'
labels:
  - enhancement
  - critical
  - semantic-mapping
  - visual-similarity
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Complex components with multiple sections (headers, content areas, footers) achieve only ~50% visual similarity compared to 95% for simple components like buttons.

## Problem
The Item component export demonstrates the issue:
- **Input:** 3072×16472px layout with header, playground, and footer sections
- **Output:** ~50% visual similarity
- **Root Cause:** Insufficient semantic understanding of layout structure

Simple components (buttons, cards) work well because they have:
- Flat hierarchy
- Clear semantic meaning
- Well-defined ShadCN mappings

Complex components fail because:
- Deep nesting (5+ levels)
- Multiple semantic sections
- No clear ShadCN equivalent
- Layout intent not captured

## Impact
- Multi-section pages unusable without extensive manual fixes
- Documentation pages, dashboards, and complex UIs can't be generated
- Only simple atomic components achieve high similarity

## Examples
**Button Showcase** (95% similarity):
- Single section
- Flat list of variants
- Clear component hierarchy

**Item Component** (50% similarity):
- Header with nav
- Playground with preview
- Footer with links
- Each section has subsections
- Layout intent lost

## Solution
1. **Enhanced Layout Classification**
   - Detect page sections (header, main, footer)
   - Identify semantic regions (nav, sidebar, content)
   - Classify layout patterns (grid, flex, stack)

2. **Semantic Context Extraction**
   - Capture layout intent from names/metadata
   - Detect common patterns (docs page, dashboard, card grid)
   - Build context map for generation

3. **Improved Prompt Engineering**
   - Include layout hierarchy in prompt
   - Provide section descriptions
   - Add semantic hints (this is a header, this is navigation)
   - Reference similar successful patterns

4. **ShadCN Layout Components**
   - Use ShadCN layout primitives when available
   - Compose complex layouts from simple parts
   - Add semantic HTML elements (header, nav, main, footer)

## Acceptance Criteria
<!-- AC:BEGIN -->
- Detect and classify page sections (header, main, footer, aside)
- Extract semantic intent from node names and structure
- Generate appropriate HTML semantic elements
- Use ShadCN layout components where applicable
- Item component visual similarity improves from 50% → 80%+
- Complex documentation pages achieve 75%+ similarity
- Dashboard layouts achieve 70%+ similarity
<!-- SECTION:DESCRIPTION:END -->

- [ ] #1 Implement section detection (header/main/footer/aside)
- [ ] #2 Extract semantic intent from node names
- [ ] #3 Classify layout patterns (grid/flex/stack)
- [ ] #4 Add layout context to generation prompt
- [ ] #5 Use semantic HTML elements in generated code
- [ ] #6 Integrate ShadCN layout components
- [ ] #7 Test with Item component (target: 50% → 80%)
- [ ] #8 Test with dashboard layout (target: 70%+)
- [ ] #9 Test with docs page layout (target: 75%+)
- [ ] #10 Document semantic mapping strategy
<!-- AC:END -->
