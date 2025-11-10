---
id: task-23
title: Create snapshot generator package for agent specialists
status: In Progress
assignee:
  - Claude
created_date: '2025-11-10 21:35'
updated_date: '2025-11-10 21:40'
labels:
  - agent-specialists
  - versioning
  - infrastructure
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
In the folder specialist_work create a node package that ingests the agent specialist template and the benchmark scores and creates the agent specialist snapshot.

Context:
- Snapshots are immutable and cannot be edited under any circumstances
- Snapshots combine template + benchmark scores
- Versioning tracks improvements to system prompts, tools, personas, and capabilities
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Package can ingest agent specialist templates
- [ ] #2 Package can ingest benchmark scores
- [ ] #3 Generates immutable agent specialist snapshots
- [ ] #4 Snapshots include all necessary metadata (version, scores, timestamp)
- [ ] #5 Snapshots are properly stored and cannot be modified
<!-- AC:END -->
