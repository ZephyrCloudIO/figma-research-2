---
id: task-60.3
title: Create shadcn 3 specialist template from docs and repo
status: Done
assignee: []
created_date: '2025-11-11'
completed_date: '2025-11-11'
labels:
  - shadcn
  - persona
  - specialist-template
dependencies:
  - task-60.1
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create a shadcn 3 agent specialist template by gathering and synthesizing information from the shadcn documentation site and GitHub repository.

**Resources to Gather**:
1. **Documentation**: Crawl https://ui.shadcn.com/
   - Installation guides (especially vite)
   - Component documentation
   - Configuration best practices
   - CLI usage patterns
2. **GitHub Repo**: Clone and analyze shadcn/ui repository
   - Component source code
   - Configuration examples
   - Common patterns and conventions

**Template Components**:
- System instructions for shadcn specialist
- Best practices and patterns
- Common configurations and setups
- Component usage guidelines
- Troubleshooting knowledge

**Specialist Template Location**: `personas/starting_from_outcome/specialist-template.md`

**Quality Criteria**:
- [ ] Covers installation for different bundlers (focus on vite)
- [ ] Documents correct package versions and dependencies
- [ ] Includes configuration patterns (tailwind, typescript, vite)
- [ ] Provides component installation instructions
- [ ] References official documentation URLs
- [ ] Includes common pitfalls and solutions

**Iteration Plan**:
This template will be refined based on benchmark results. Initial version should be comprehensive but expect improvements based on what the generic LLM misses.

**Template Location**: `personas/starting_from_outcome/shadcn-specialist.json5`

**Note**: This is a TEMPLATE. Benchmarks and weights will be added after running experiments to create the SNAPSHOT. The template contains:
- Specialist knowledge from official documentation
- Model-specific prompts (especially for claude-sonnet-4.5)
- Capability descriptions and tags
- Test suite definitions (without scores)

**Future Enhancement** (Low Priority):
- Integrate shadcn MCP server configuration into specialist definition
<!-- SECTION:DESCRIPTION:END -->
