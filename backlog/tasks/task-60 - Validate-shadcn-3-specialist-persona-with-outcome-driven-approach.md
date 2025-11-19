---
id: task-60
title: Validate shadcn 3 specialist persona with outcome-driven approach
status: To Do
assignee: []
created_date: '2025-11-11'
labels:
  - persona
  - benchmark
  - shadcn
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Validate working with the outcome in mind when creating a persona by developing a shadcn 3 agent specialist template. This task will iterate on the persona and create benchmarks as we go.

**Approach**:
1. Crawl shadcn documentation site
2. Clone shadcn GitHub repo
3. Configure MCP (low priority future enhancement)
4. Create specialist template from gathered resources

**Test Scenario**: Generate new shadcn project with vite and button component
- Model: anthropic/claude-sonnet-4.5
- Starting Prompt: "Generate a new shadcn project, use vite and add the button component"

**Three-way Comparison**:
1. **Control**: Follow https://ui.shadcn.com/docs/installation/vite exactly (pnpm setup)
2. **Generic LLMs**: Pass only starting prompt to LLM
3. **Shadcn specialist**: Combine starting prompt with shadcn specialist template

**Success Criteria** (functional equivalence with control):
- **Bundler**: Vite used, correct version, proper tailwindcss plugin config in vite.config.ts
- **Package Manager**: pnpm used, correct versions of tailwindcss and @tailwindcss/vite
- **Styles**: index.css configured correctly with tailwindcss imports
- **Types**: tsconfig.json and tsconfig.app.json with appropriate compilerOptions
- **Components**: `pnpm dlx shadcn@latest add button` executed
- **Build**: Project builds successfully with `pnpm build`

**Scoring**: Results compared using ze-benchmarks scoring across specialist template versions

**Folder Structure**:
```
personas/starting_from_outcome/
├── control/
├── experiments/
│   └── claude-sonnet-4.5/
│       ├── generic/
│       └── specialist/
└── benchmarks/
    └── results/
```

**Future Enhancements** (Low Priority):
- Configure shadcn MCP as part of agent specialist definition
<!-- SECTION:DESCRIPTION:END -->
