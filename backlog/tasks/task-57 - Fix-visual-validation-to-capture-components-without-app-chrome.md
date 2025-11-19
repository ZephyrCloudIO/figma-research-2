---
id: task-57
title: Fix visual validation to capture components without app chrome
status: To Do
assignee: []
created_date: '2025-11-11 17:35'
labels:
  - visual-validation
  - puppeteer
  - bug
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Visual validation is currently failing (63% similarity) because Puppeteer screenshots include the entire demo app UI (sidebar, header, navigation) while Figma exports show clean component showcases.

**Problem:**
- Screenshots at `http://localhost:5173/exports#{id}` capture full page with app chrome
- Figma exports are isolated component showcases without UI chrome  
- This creates massive pixel differences (sidebar covers ~20% of viewport)

**Solutions to implement:**
1. **Option A - Selector-based capture**: Update `captureComponentScreenshot` to find and capture only the component showcase element using `page.evaluate()` and element bounds
2. **Option B - Isolated preview routes**: Create `/preview/{id}` routes that render only the component without app layout
3. **Option C - Hide chrome via URL param**: Add `?isolated=true` param that hides sidebar/header via CSS

**Current code location:** `packages/ui-demo-app/src/lib/visual-validator.ts:30-66`

**Success criteria:**
- Screenshots contain only component showcase (no sidebar/header)
- Visual similarity improves to accurately reflect component quality
- Can validate both light and dark theme variants
<!-- SECTION:DESCRIPTION:END -->
