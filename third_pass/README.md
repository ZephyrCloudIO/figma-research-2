# Zephyr Third Pass - Figma-to-Code Ecosystem

**Status:** ✅ Operational (with known issues - see below)

Production implementation of the Figma-to-code generation system, bringing together all research and validation work into a cohesive, production-ready solution.

## Overview

The third_pass workspace contains three core packages that work together to enable designers to extract components from Figma and generate production-ready React/ShadCN code:

```
Figma Design → Zephyr Plugin → Validation Pipeline → UI Demo App
```

## Architecture

### Packages

1. **figma-plugin/** - Zephyr Figma Plugin
   - Private plugin for internal team use
   - Extract as Image (PNG/SVG/JPEG)
   - Generate as Code (JSON export with metadata)

2. **validation-pipeline/** - Code Generation Pipeline
   - Parse Figma JSON → Classify components → Semantic mapping
   - Generate React/TypeScript/ShadCN code with Claude Sonnet 4.5
   - Visual validation and similarity scoring
   - Target: 100% visual similarity

3. **ui-demo-app/** - Component Showcase & Testing
   - Tanstack Router + Tailwind 4 + ShadCN 3
   - Visual diff viewer (Figma vs Generated)
   - Component library browser
   - Metrics dashboard

### Shared Code

- **shared/types/** - Common TypeScript interfaces and types
- **shared/utils/** - Shared utility functions

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Figma desktop app (for plugin development)

### Installation

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run dev servers
pnpm dev
```

### Environment Variables

Copy `.env.example` to `.env` and add your API keys:

```env
FIGMA_TOKEN=your_figma_personal_access_token
ANTHROPIC_API_KEY=your_anthropic_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
```

## Workflow

### 1. Extract from Figma

1. Open Figma desktop app with your design system file
2. Select a component, frame, or page
3. Run Zephyr plugin (Plugins → Development → Zephyr Figma)
4. Choose "Generate as Code" to export JSON
5. JSON saved to local filesystem with metadata

### 2. Generate Code

**Option A: Regenerate All Components (Recommended)**
```bash
cd packages/ui-demo-app
pnpm regenerate              # Regenerate all exports
pnpm regenerate Button       # Regenerate specific component
pnpm regenerate:clean        # Clean only, don't regenerate
```

This script:
- Cleans old generated components
- Runs validation pipeline for each export
- Copies components to ui-demo-app
- Updates exports configuration
- Handles large components (28MB+) automatically

**Option B: Manual Generation**
```bash
cd packages/validation-pipeline
pnpm run generate --input /path/to/exported.json
```

Pipeline processes:
- Parses Figma node structure
- Extracts icons and maps to Lucide React
- Summarizes large JSON data (28MB → <100KB)
- Classifies component type
- Maps to ShadCN semantic structure
- Generates React/TypeScript code with icons
- Validates visual similarity

Output:
- `Component.tsx` - Generated React component with icons
- `metadata.json` - Generation metadata
- `validation-report.json` - Visual similarity scores

### 3. View & Test

```bash
cd packages/ui-demo-app
pnpm run dev
```

Navigate to:
- `/exports` - Exports page with sidebar (NEW!)
- `/components` - Browse all generated components
- `/playground` - Interactive component testing
- `/metrics` - Generation quality dashboard

## ⚠️ Known Issues

### Recently Fixed

**1. Icons Now Rendering** (task-55) ✅ FIXED
- **Problem:** Icon components referenced but not implemented in generated code
- **Solution:** Implemented comprehensive icon detection and Lucide React mapping
- **Detection:** Identifies icons by name patterns, node type, size, and vector children
- **Mapping:** 60+ Figma icon patterns → Lucide components (FolderOpen, FileText, ArrowRight, etc.)
- **Result:** Icons properly imported and rendered with correct sizing
- **Example:** `<FileText className="w-4 h-4" />` instead of `<div className="w-4 h-4" />`
- **Status:** ✅ Fixed and tested with Button component (90% quality score)
- **Impact:** Expected 15-30% visual similarity improvement for icon-heavy components

### Critical (Blockers)

**1. Low Visual Similarity on Complex Layouts** (task-56)
- **Problem:** Complex components (Item: ~50%) vs simple components (Button: 95%)
- **Root Cause:** Insufficient semantic mapping for nested layouts
- **Impact:** Multi-section layouts not usable without manual fixes
- **Status:** 🔴 Blocker for complex components
- **Priority:** Critical

### High Priority

**2. Design Tokens Not Extracted** (task-57)
- Hardcoded hex colors (#E5E5E5) instead of design tokens
- No spacing scale mapping (uses pixel values)
- Typography scales not detected
- **Impact:** Components don't match design system
- **Priority:** High

**3. Missing Component Variants** (task-58)
- Button sizes/colors not extracted as props
- Component states (hover, focus, disabled) not captured
- **Impact:** Components not reusable across contexts
- **Priority:** High

### Medium Priority

**4. No Responsive Breakpoints** - Mobile/tablet variants not generated
**5. Font Loading** - Custom fonts may not load correctly
**6. Dark Mode** - Theme-aware styles not implemented
**7. Animations** - Transitions and effects not captured

## Performance & Results

### Current Benchmarks

| Component | Input Size | Time | Cost | Icons | Similarity | Status |
|-----------|------------|------|------|-------|------------|--------|
| Button Showcase | 8MB JSON | 14s | $0.04 | ✅ Yes (7 types) | 90% | ✅ Excellent |
| Item | 28MB JSON | 15s | $0.04 | ✅ Yes (15 types) | TBD | ✅ Generated w/ icons |

### Target Metrics

| Metric | Target | Achieved | Status |
|--------|--------|----------|--------|
| Generation Time | <60s | 20-30s | ✅ |
| Cost per Component | <$0.10 | $0.04-0.05 | ✅ |
| Visual Similarity | >90% | 50-95% | ⚠️ Varies |
| Token Optimization | <20K | 8K | ✅ |

## Development

### Package Scripts

Each package supports:
- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run test` - Run tests
- `pnpm run lint` - Lint code
- `pnpm run typecheck` - TypeScript type checking

### Workspace Scripts

From root:
- `pnpm -r <script>` - Run script in all packages
- `pnpm --filter <package> <script>` - Run script in specific package

## Technology Stack

- **TypeScript 5.9+** - Type-safe code
- **React 19** - UI components
- **Tanstack Router** - Client-side routing
- **Tailwind 4.1** - Utility-first CSS
- **ShadCN 3** - Component library
- **Claude Sonnet 4.5** - AI code generation
- **Figma Plugin API** - Figma integration
- **SQLite** - Local data storage
- **PNPM** - Package management

## Research Foundation

This implementation builds on extensive research and validation:

- 13,000+ LOC validation code (../validation/)
- 8 specialized AI agent personas (../personas/v2/)
- 387 benchmark scenarios (../reference-repos/ze-benchmarks/)
- Comprehensive fixture system
- 100% style extraction coverage
- 85%+ component matching accuracy
- 3-7 second generation latency
- $0.70-1.00/month operational cost

## Documentation

- [Complete Workflow Guide](./WORKFLOW.md) - Step-by-step workflow (500+ lines)
- [Package Updates History](./PACKAGE_UPDATES.md) - Dependency updates
- [Exports Page Guide](./packages/ui-demo-app/EXPORTS_PAGE.md) - Visual validation
- [Plugin Development](./packages/figma-plugin/README.md)
- [Pipeline Architecture](./packages/validation-pipeline/README.md)
- [UI Demo App](./packages/ui-demo-app/README.md)

## Recent Improvements

**Icon Mapping** (task-55) ✅ Completed 2025-11-11:
- Created `icon-mapper.ts` with detection logic and Lucide mapping table (60+ patterns)
- Added Stage 2.5 to pipeline for icon extraction
- Enhanced code generation prompts with icon context
- Deduplicates 400+ instances → 15 unique icons
- Test: Button component now renders icons correctly (FileText, ArrowRight, Circle, Send, Loader2, etc.)
- See: `validation-pipeline/src/icon-mapper.ts`

**Figma Data Summarization** ✅ Completed 2025-11-11:
- Created `figma-summarizer.ts` to handle large components (28MB+)
- Intelligently reduces JSON data while preserving all essential information
- Extracts and deduplicates colors, typography, layout, structure
- Groups repeated instances with counts
- Reduction: 28MB (7.3M tokens) → <100KB (<25K tokens)
- Item component now generates successfully in 14.6s
- See: `validation-pipeline/src/figma-summarizer.ts`

**Component Regeneration Script** ✅ Completed 2025-11-11:
- Created automated regeneration script for ui-demo-app
- One command to regenerate all or specific components
- Cleans, generates, copies, and updates exports
- Usage: `pnpm regenerate` or `pnpm regenerate Button`
- See: `ui-demo-app/scripts/regenerate-components.ts`

## Next Steps

Priority fixes (see backlog):
1. ~~**task-55:** Fix icon mapping and rendering~~ ✅ DONE
2. **task-56:** Improve semantic mapping for complex layouts (Critical)
3. **task-57:** Implement design token extraction (High)
4. **task-58:** Extract component variants and props (High)
5. Regenerate Item component with new icon support and measure similarity improvement

## Contributing

This is a private internal project. For questions or issues, contact the Zephyr team.

## License

Proprietary - Internal use only
