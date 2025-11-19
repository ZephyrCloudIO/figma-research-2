---
id: task-49
title: >-
  Create end-to-end workflow connecting Zephyr plugin to validation pipeline to
  UI demo
status: To Do
assignee: []
created_date: '2025-11-11 15:17'
labels: []
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Build the complete workflow connecting all three third_pass components: Zephyr Figma plugin → validation pipeline → UI demo app, enabling designers to go from Figma selection to rendered React component in a single flow.

## Context
Once tasks 44.1, 44.2, 44.3, and 44.4 are complete, we need to integrate them into a seamless workflow. Currently they exist as independent packages that don't communicate.

## Desired Workflow
1. Designer selects component in Figma
2. Clicks "Generate as Code" in Zephyr plugin
3. Plugin exports JSON and triggers validation pipeline (via API or file watch)
4. Pipeline processes JSON → generates React component
5. UI demo app automatically updates with new component
6. Designer sees side-by-side comparison (Figma vs generated)
7. Designer can iterate and regenerate

## Integration Points
- Plugin → Pipeline: REST API or file system bridge
- Pipeline → UI Demo: File system output directory or database
- UI Demo → Designer: Live reload on new components
- Feedback loop: Designer can request regeneration with adjustments

## Technical Approach
- REST API server in validation-pipeline for receiving plugin requests
- WebSocket connection for real-time updates to UI demo
- Shared file system directory for component outputs
- Database for storing generation metadata and history
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Configure shared output directory for generated components (exports_test)
- [x] #2 Add dynamic exports indexing in ui-demo-app (pnpm run index-exports)
- [x] #3 Implement auto-discovery of exports from exports_test folder
- [ ] #4 Create REST API server in validation-pipeline accepting plugin JSON exports
- [ ] #5 Add API endpoints: POST /generate, GET /status/:id, GET /components
- [ ] #6 Implement WebSocket server for real-time updates to UI demo
- [ ] #7 Add file system watcher in UI demo monitoring output directory
- [ ] #8 Implement auto-reload when new components are generated
- [ ] #9 Add generation history tracking in database
- [ ] #10 Build feedback UI in demo app for requesting regeneration
- [ ] #11 Test complete workflow: Figma selection → JSON export → generation → UI display
- [ ] #12 End-to-end latency under 30 seconds for simple components
- [ ] #13 Add error handling and status notifications throughout workflow
- [ ] #14 Create workflow diagram documenting all integration points
- [ ] #15 Add developer guide for extending the workflow
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
### Foundation Complete (2025-11-11)

The ui-demo-app has been refactored to support end-to-end integration:

**Current Workflow (Manual):**
1. Figma plugin exports → `exports_test/` folder
2. Run: `node validation/generate-from-plugin-export.js <json> <output-dir>`
3. Generated component saved to `exports_test/generated/`
4. Run: `pnpm run index-exports` in ui-demo-app
5. Start dev server: `pnpm dev`
6. View at /exports

**Shared Architecture:**
- **Single source of truth**: `exports_test/` folder at repo root
- **Automatic indexing**: ui-demo-app scans exports_test and auto-discovers:
  - JSON exports from plugin
  - PNG/SVG renders from Figma
  - Generated React components
  - Metadata from generation (cost, tokens, model)
- **Dynamic loading**: Components loaded via dynamic import(), no hard-coding

**Next Steps for Full Automation:**
1. Create REST API in validation-pipeline that wraps generate-from-plugin-export.js
2. Add WebSocket for real-time status updates
3. Add file watcher in ui-demo-app to auto-reload on new exports
4. Build "Generate" button in UI to trigger generation
5. Add progress tracking and error handling

**Integration Points Identified:**
- Plugin → exports_test (already working)
- exports_test → generation script (already working)
- exports_test → ui-demo-app (now working via index-exports)
- Missing: Real-time updates, API endpoints, file watching

The foundation is solid for adding the REST API and WebSocket layers.
<!-- SECTION:NOTES:END -->
