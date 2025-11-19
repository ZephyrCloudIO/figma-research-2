---
id: task-50
title: Improve visual similarity scoring to reach 85% target
status: To Do
assignee: []
created_date: '2025-11-11 15:17'
updated_date: '2025-11-11 15:23'
labels: []
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Fix dimension normalization and improve visual validation to achieve the 85% visual similarity target (currently at 56%).

## Context
Research findings show validation system achieves:
- Semantic scores: 70-80% (good structure) ✓
- Pixel scores: 56% visual similarity (below 85% target) ✗

The infrastructure works but needs tuning, specifically dimension normalization and rendering consistency.

## Root Causes
1. Dimension mismatches between Figma exports and rendered components
2. Font rendering differences (system fonts vs web fonts)
3. Pixel-perfect comparison too strict for functional equivalence
4. Missing responsive layout handling

## Investigation Findings
From FIGMA_API_EXTRACTION_SUMMARY.md:
- Exact values matter: cornerRadius 6 vs 8 affects accuracy
- Button component: 76.0% → 83.1% with real Figma data (+7.1 points)
- Semantic score: 60.0% → 80.0% with exact values (+20 points)

## Improvement Strategies
1. Normalize dimensions before comparison (scale to same size)
2. Use font fallback chains matching Figma's rendering
3. Implement perceptual similarity (SSIM) instead of pixel-perfect
4. Add tolerance zones for minor variations
5. Weight different regions (content vs padding)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Implement dimension normalization: scale both images to same size before comparison
- [ ] #2 Add font configuration matching Figma's rendering (Inter, SF Pro, system fallbacks)
- [ ] #3 Replace pixelmatch with SSIM (Structural Similarity Index) for perceptual comparison
- [ ] #4 Add configurable tolerance for minor variations (1-2 pixel differences)
- [ ] #5 Implement region-weighted comparison (content 80%, padding 20%)
- [ ] #6 Test with Button component achieving >85% visual similarity
- [ ] #7 Test with Card component achieving >85% visual similarity
- [ ] #8 Test with Input component achieving >85% visual similarity
- [ ] #9 Average visual similarity across all components >85%
- [ ] #10 Add comparison visualization showing difference heatmaps
- [ ] #11 Document visual validation improvements in validation/VISUAL-VALIDATION.md
- [ ] #12 Add configuration file for similarity thresholds and weights
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
**User Clarifications:**

- Target is 100% visual similarity (not 85%)

- Pixel-perfect matching is the goal

- Focus on exact reproduction of Figma designs
<!-- SECTION:NOTES:END -->
