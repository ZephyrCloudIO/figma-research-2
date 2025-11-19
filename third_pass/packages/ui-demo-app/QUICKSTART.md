# UI Demo App - Quick Start

## Installation (One Command)

```bash
cd /Users/zackarychapple/code/figma-research-clean/third_pass/packages/ui-demo-app && pnpm install && pnpm dev
```

## Manual Setup

### 1. Install Dependencies

```bash
cd /Users/zackarychapple/code/figma-research-clean/third_pass/packages/ui-demo-app
pnpm install
```

### 2. Start Dev Server

```bash
pnpm dev
```

Open http://localhost:5173

## What You Get

5 fully-functional pages:

1. **/** - Home with feature cards
2. **/components** - Component showcase with search/filter
3. **/visual-diff** - Side-by-side Figma comparison
4. **/metrics** - Performance dashboard
5. **/playground** - Live code editor

## Optional: Add ShadCN Components

```bash
# From the ui-demo-app directory
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add dialog
npx shadcn@latest add select
npx shadcn@latest add tabs
```

Components will be added to `src/components/ui/`

## File Structure

```
ui-demo-app/
├── src/
│   ├── routes/              # 5 pages + root layout
│   ├── lib/utils.ts         # Utilities
│   ├── index.css            # Tailwind + tokens
│   └── main.tsx             # Entry point
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md                # Full documentation
```

## Tech Stack

- React 19.1.1
- Tanstack Router 1.134+
- Tailwind 4.1
- ShadCN 3
- TypeScript 5.9+
- Vite 7+

## Next Steps

1. Install and run (see above)
2. Browse the demo pages
3. Read [README.md](./README.md) for details
4. Read [ARCHITECTURE.md](./ARCHITECTURE.md) for deep dive
5. Integrate with validation pipeline

## Common Commands

```bash
pnpm dev         # Start dev server
pnpm build       # Build for production
pnpm preview     # Preview production build
pnpm typecheck   # Run TypeScript checks
pnpm lint        # Run ESLint
```

## Integration Points

Currently uses mock data. To integrate with real data:

1. Import validation-pipeline package
2. Replace mock arrays with pipeline data
3. Load Figma images from exports
4. Collect real metrics

Example:

```typescript
import { pipeline } from '@zephyr/validation-pipeline'

const components = await pipeline.getGeneratedComponents()
```

## Troubleshooting

**Port already in use?**
Vite will auto-select next available port

**TypeScript errors?**
Run `pnpm typecheck` to see all issues

**Route tree not found?**
Restart dev server - it auto-generates on start

## Documentation

- [README.md](./README.md) - Full setup and features
- [SETUP.md](./SETUP.md) - Detailed setup guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical deep dive

---

**Created:** 22 files
**Ready to use:** Yes
**Dependencies installed:** After `pnpm install`
