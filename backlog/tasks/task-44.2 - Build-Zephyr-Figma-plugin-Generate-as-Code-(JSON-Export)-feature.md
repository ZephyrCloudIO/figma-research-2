---
id: task-44.2
title: Build Zephyr Figma plugin - Generate as Code (JSON Export) feature
status: Done
assignee: []
created_date: '2025-11-11 15:15'
updated_date: '2025-11-11 16:20'
labels: []
dependencies: []
parent_task_id: task-44
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement the "Generate as Code" feature for the Zephyr Figma plugin that exports the complete node graph and state as a JSON object for code generation with semantic mapping.

## Context
From tasks.md: Takes the node graph and state of every sub node (including all attributes) and exports it as a JSON object. JSON includes version and edit date information to detect changes. This feeds into the semantic mapping process for code generation.

## Research Findings
- Current extraction in validation/enhanced-figma-parser.ts achieves 100% style coverage
- Extracts: colors, typography, effects, spacing, layout, dimensions, component properties
- Classification system supports 14 component types with 83-92% accuracy
- Semantic mapper requires specific structure (validation/semantic-mapper.ts)

## JSON Export Format
```json
{
  "version": "1.0.0",
  "exportDate": "2025-11-11T...",
  "editDate": "2025-11-10T...",
  "fileKey": "MMMjqwWNYZAg0YlIeL9aJZ",
  "nodeId": "18491:22435",
  "node": {
    "id": "...",
    "name": "Button",
    "type": "COMPONENT",
    "children": [...],
    "styles": { colors, typography, effects, spacing },
    "layout": { mode, direction, align, justify },
    "componentProperties": {...}
  }
}
```

## Technical Approach
- Traverse complete node hierarchy recursively
- Extract all attributes (not just visible properties)
- Capture component metadata (variants, properties, instances)
- Include edit history (lastModified from file API)
- Optimize for large component trees
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Implement recursive node traversal extracting all children
- [x] #2 Extract complete style properties (fills, strokes, effects, opacity, cornerRadius)
- [x] #3 Extract layout properties (layoutMode, padding, itemSpacing, alignment)
- [x] #4 Extract typography properties (fontFamily, fontSize, fontWeight, lineHeight, letterSpacing)
- [x] #5 Extract component metadata (componentId, componentProperties, mainComponent)
- [x] #6 Extract dimensions (width, height, absoluteBoundingBox)
- [x] #7 Include file metadata (version, lastModified timestamp)
- [x] #8 Generate JSON with proper structure (version, exportDate, editDate, fileKey, nodeId, node)
- [x] #9 Handle deeply nested hierarchies (50+ levels)
- [x] #10 Handle large component sets (100+ nodes)
- [x] #11 Export completes in under 5 seconds for complex components
- [x] #12 JSON validates against schema
- [x] #13 Include documentation for JSON format in plugin README
- [x] #14 Add version field to track JSON format changes
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Testing Complete

Successfully tested JSON export with real Figma components:

- JSON export working with complete node hierarchy

- Async node traversal implemented correctly

- Component instance mainComponent references extracted

- All node properties captured (60+ per node)

- Export time < 5 seconds for complex components

- Exports saved to exports_test/ directory

✅ WORKFLOW COMPLETE - Successfully generated Button component from plugin export!

End-to-End Test Results:

- Plugin export: 8MB JSON (1536x6524px Button showcase)

- Generation time: 23.4 seconds, Cost: $0.047361 (8,191 tokens)

- Visual similarity: 95%, Model: Claude Sonnet 4.5

Files Created:

1. validation/generate-from-plugin-export.js - Standalone generation script

2. exports_test/generated/Button.tsx - Generated component (124 lines)

3. exports_test/generated/VALIDATION_REPORT.md - Full validation report

4. third_pass/WORKFLOW.md - Complete workflow documentation

5. third_pass/packages/ui-demo-app/src/routes/showcase.button.tsx - Showcase page

Key Achievements:

- Complete Figma → Code workflow validated

- Production-ready TypeScript/React with ShadCN + Tailwind

- UI demo app with side-by-side comparison

View: cd third_pass/packages/ui-demo-app && pnpm dev → http://localhost:3000/showcase/button
<!-- SECTION:NOTES:END -->
