# Zephyr UI Demo App

A modern UI demo application built with Tanstack Router, Tailwind 4, and ShadCN 3 for showcasing and validating Figma-generated components.

## Features

- **Component Showcase** - Browse and test all generated components from the validation pipeline
- **Visual Diff Viewer** - Compare Figma designs side-by-side with rendered components
- **Code Playground** - Experiment with generated code in a live editor environment
- **Metrics Dashboard** - Monitor pipeline performance, latency, accuracy, and costs

## Tech Stack

- **React 19.1.1** - Latest React with improved performance
- **Tanstack Router 1.134+** - Type-safe file-based routing with code splitting
- **Tailwind CSS 4.1** - Utility-first CSS framework with CSS variables
- **ShadCN 3** - High-quality, accessible component library
- **TypeScript 5.9+** - Type safety and developer experience
- **Vite 7+** - Fast build tool and dev server

## Project Structure

```
ui-demo-app/
├── src/
│   ├── routes/           # File-based routing
│   │   ├── __root.tsx    # Root layout with navigation
│   │   ├── index.tsx     # Home page
│   │   ├── components.tsx # Component showcase
│   │   ├── visual-diff.tsx # Visual comparison tool
│   │   ├── metrics.tsx   # Metrics dashboard
│   │   └── playground.tsx # Code editor playground
│   ├── lib/              # Utility functions
│   │   └── utils.ts      # cn() helper for class names
│   ├── index.css         # Tailwind 4 styles with design tokens
│   └── main.tsx          # App entry point
├── components.json       # ShadCN configuration
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation

From the workspace root:

```bash
# Install all dependencies
pnpm install

# Or install only for this package
cd packages/ui-demo-app
pnpm install
```

### Development

Start the development server with hot module replacement:

```bash
pnpm dev
```

The app will be available at `http://localhost:5173`

### Building

Build for production:

```bash
pnpm build
```

Preview the production build:

```bash
pnpm preview
```

### Other Commands

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint
```

## Adding ShadCN Components

To add new ShadCN components:

```bash
npx shadcn@latest add <component-name>
```

For example:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
```

Components will be added to `src/components/ui/`.

## Tailwind 4 Design Tokens

This project uses Tailwind 4's CSS variable system for theming. Design tokens are defined in `src/index.css`:

- Light and dark mode support via CSS variables
- OKLch color space for better color manipulation
- Customizable radius values
- Semantic color naming (primary, secondary, muted, etc.)

## Routing

This app uses Tanstack Router with file-based routing. Routes are automatically generated from files in `src/routes/`:

- `index.tsx` → `/`
- `components.tsx` → `/components`
- `visual-diff.tsx` → `/visual-diff`
- `metrics.tsx` → `/metrics`
- `playground.tsx` → `/playground`

The router provides:
- Type-safe navigation
- Automatic code splitting
- Active link styling
- Search param validation

## Integration with Validation Pipeline

The UI demo app is designed to integrate with the `@zephyr/validation-pipeline` package:

1. Component data will be loaded from the validation pipeline's output
2. Visual diff images will be sourced from Figma exports
3. Metrics will be collected from the generation process
4. Playground will support loading generated components dynamically

## Architecture Decisions

### Why Tanstack Router?

- **Type Safety**: Full TypeScript support with auto-generated types
- **File-Based Routing**: Intuitive structure with automatic route generation
- **Code Splitting**: Automatic bundle splitting for optimal performance
- **Modern API**: Clean, composable API with hooks

### Why Tailwind 4?

- **CSS Variables**: Native CSS variable support for theming
- **Performance**: Improved build times and smaller bundles
- **Modern CSS**: Uses OKLch color space and modern CSS features
- **Developer Experience**: Better autocomplete and validation

### Why ShadCN 3?

- **Customizable**: Components are copied into your project, not installed as dependencies
- **Accessible**: Built on Radix UI primitives with excellent a11y
- **Styleable**: Uses Tailwind for easy customization
- **Type Safe**: Full TypeScript support

## Performance

Target metrics:

- **Bundle Size**: < 500KB gzipped
- **First Load**: < 2s on 3G connection
- **Time to Interactive**: < 3s
- **Lighthouse Score**: > 90

## Future Enhancements

- [ ] Real-time code execution in playground
- [ ] Component history and versioning
- [ ] Export components as npm packages
- [ ] A/B testing interface
- [ ] Collaborative editing features
- [ ] Integration with Figma API for live sync

## Contributing

This is part of the Zephyr Figma-to-Code ecosystem. See the main project README for contribution guidelines.

## License

Private - Internal use only
