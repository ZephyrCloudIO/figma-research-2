---
id: task-47
title: Complete figma-extract scenario fixtures and oracle answers
status: To Do
assignee: []
created_date: '2025-11-11 15:16'
labels: []
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Complete the figma-extract benchmark scenarios by integrating the fixture strategy (task-38 DONE) into all 5 scenarios and ensuring oracle-answers.json files have proper Q&A format.

## Context
Tasks 38-43 are partially complete but not integrated:
- ✅ Task 38: Fixtures created (figma-files/, figma-api-responses/)
- ✅ Task 39: scenario.yaml configurations fixed
- ✅ Task 40: oracle-answers.json format corrected
- ✅ Task 41: repo-fixture content created
- ⏸️ Integration incomplete: Scenarios not validated with fixtures instead of live API

## Current State
- Fixtures exist in ze-benchmarks/suites/figma-extract/fixtures/
- 5 Figma JSON files (minimal-button, design-tokens-sample, component-variants, full-component-set, color-system)
- 4 mocked API responses (success, node, rate-limit, auth-error)
- Scenarios may still reference live API or have incomplete oracle answers

## Integration Work
1. Update scenario.yaml files to use fixtures instead of live API calls
2. Verify oracle-answers.json has complete expected outputs for each fixture
3. Add validation commands that test against fixtures
4. Ensure repo-fixture/ has all necessary test files
5. Add policy.yaml for fixture usage policies

## Validation
Run all 5 scenarios and verify they pass using only committed fixtures (no live API calls).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Review all 5 scenario.yaml files in figma-extract suite
- [ ] #2 Update each scenario to reference fixtures from ../fixtures/ directory
- [ ] #3 Verify oracle-answers.json has complete expectedBehavior for each fixture
- [ ] #4 Add validation commands that test fixture-based outputs
- [ ] #5 Update repo-fixture/package.json with necessary test scripts
- [ ] #6 Add policy.yaml documenting fixture usage policies
- [ ] #7 Test 001-design-token-extraction with design-tokens-sample.json fixture
- [ ] #8 Test 002-component-understanding with full-component-set.json fixture
- [ ] #9 Test 003-semantic-mapping with component-variants.json fixture
- [ ] #10 Test 004-visual-validation with minimal-button.json fixture
- [ ] #11 Test 005-color-system with color-system.json fixture
- [ ] #12 All 5 scenarios pass with >80% score using only fixtures (no live API)
- [ ] #13 Document fixture integration in ze-benchmarks/suites/figma-extract/README.md
<!-- AC:END -->
