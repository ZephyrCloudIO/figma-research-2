# Validation Pipeline

End-to-end validation pipeline for Figma-to-code workflow with React/ShadCN generation.

## Overview

This package provides a complete pipeline that processes Figma plugin JSON exports and generates production-ready React components using ShadCN UI components. The pipeline handles:

- **Parsing**: Extracts design data from Figma JSON exports
- **Classification**: Identifies component types (Button, Card, Input, etc.)
- **Semantic Mapping**: Maps Figma structures to ShadCN component hierarchies
- **Component Matching**: Finds similar components using semantic embeddings
- **Code Generation**: Generates TypeScript/React code with Claude Sonnet 4.5
- **Validation**: Validates code quality and visual accuracy
- **Output**: Produces component code, metadata, and validation reports

## Features

- **Fast Processing**: Simple components in <15s, complex in <30s
- **High Quality**: TypeScript, React, Tailwind CSS, accessibility support
- **Caching**: 15-25x speedup with hash-based caching
- **Batch Processing**: Process multiple components efficiently
- **Progress Tracking**: Detailed logging and progress updates
- **Error Recovery**: Automatic retries with exponential backoff
- **Flexible Output**: Component code, metadata, and validation reports

## Installation

```bash
npm install @figma-research/validation-pipeline
```

Or install dependencies locally:

```bash
cd third_pass/packages/validation-pipeline
npm install
```

## Quick Start

### 1. Initialize Configuration

```bash
npm run generate -- init
```

This creates:
- `pipeline.config.json` - Pipeline configuration
- `.env` - API keys and environment variables

### 2. Configure API Keys

Edit `.env` and add your OpenRouter API key:

```env
OPENROUTER=sk-or-v1-...
```

### 3. Generate Code

```bash
npm run generate -- generate -i example-inputs/button-example.json
```

This will:
1. Load the Figma JSON export
2. Parse and classify the component
3. Generate React/ShadCN code
4. Validate the output
5. Write files to `./output/`

## Usage

### CLI Commands

#### Generate Code

```bash
figma-generate generate -i <input.json> [options]
```

**Options:**
- `-i, --input <path>` - Path to Figma JSON export (required)
- `-o, --output <path>` - Output directory (default: ./output)
- `-c, --config <path>` - Path to config file
- `--env <path>` - Path to .env file
- `--log-level <level>` - Log level: debug|info|warn|error (default: info)
- `--log-file <path>` - Write logs to file
- `--no-cache` - Disable caching
- `--no-subdirs` - Do not create subdirectories for components
- `--enable-visual` - Enable visual validation (costs money!)

**Examples:**

```bash
# Basic usage
figma-generate generate -i button.json

# Custom output directory
figma-generate generate -i card.json -o ./components

# With custom config
figma-generate generate -i input.json -c my-config.json

# Enable debug logging
figma-generate generate -i input.json --log-level debug

# Save logs to file
figma-generate generate -i input.json --log-file pipeline.log
```

#### Initialize Configuration

```bash
figma-generate init [options]
```

**Options:**
- `--config <path>` - Path to create config file (default: ./pipeline.config.json)
- `--env <path>` - Path to create .env file (default: ./.env)

#### Validate Configuration

```bash
figma-generate validate-config [options]
```

**Options:**
- `-c, --config <path>` - Path to config file
- `--env <path>` - Path to .env file

### Programmatic API

```typescript
import {
  PipelineOrchestrator,
  loadConfig,
  initLogger,
  ComponentInput,
} from '@figma-research/validation-pipeline';

// Load configuration
const config = loadConfig({
  envFile: '.env',
  configFile: 'pipeline.config.json',
});

// Initialize logger
const logger = initLogger(config.logLevel, config.logFile);

// Create orchestrator
const orchestrator = new PipelineOrchestrator(config);
await orchestrator.initialize();

// Process a single component
const input: ComponentInput = {
  id: '123:456',
  name: 'Primary Button',
  type: 'COMPONENT',
  figmaNode: { /* Figma node data */ },
};

const result = await orchestrator.processComponent(input, {
  progressCallback: (update) => {
    console.log(`${update.stage}: ${update.progress}% - ${update.message}`);
  },
});

console.log('Generated code:', result.outputs.componentCode);

// Process multiple components
const components: ComponentInput[] = [/* ... */];
const batchResult = await orchestrator.processBatch(components);

console.log(`Processed ${batchResult.successCount}/${batchResult.totalComponents}`);

// Cleanup
await orchestrator.cleanup();
```

## Configuration

### Configuration File (pipeline.config.json)

```json
{
  "codeGenerationModel": "anthropic/claude-sonnet-4.5",
  "embeddingModel": "openai/text-embedding-3-small",
  "visionModel": "openai/gpt-4o",
  "databasePath": "./validation.db",
  "outputDir": "./output",
  "createSubdirectories": true,
  "enableCaching": true,
  "enableVisualValidation": false,
  "enableSemanticMatching": true,
  "maxRetries": 3,
  "retryDelay": 1000,
  "timeout": 60000,
  "logLevel": "info"
}
```

### Environment Variables (.env)

```env
# Required
OPENROUTER=your-openrouter-api-key

# Optional
FIGMA_TOKEN=your-figma-token
CODE_GENERATION_MODEL=anthropic/claude-sonnet-4.5
DATABASE_PATH=./validation.db
OUTPUT_DIR=./output
LOG_LEVEL=info
ENABLE_VISUAL_VALIDATION=false
```

## Input Format

The pipeline accepts JSON exports from the Figma plugin. The expected format:

```json
{
  "id": "123:456",
  "name": "Component Name",
  "type": "COMPONENT",
  "properties": {
    "variant": "primary",
    "size": "medium"
  },
  "metadata": {
    "version": "1.0",
    "lastModified": "2025-11-11T15:00:00Z",
    "description": "Component description"
  },
  "figmaNode": {
    "id": "123:456",
    "name": "Component Name",
    "type": "COMPONENT",
    "bounds": { "x": 0, "y": 0, "width": 120, "height": 40 },
    "fills": [...],
    "children": [...]
  }
}
```

**Supported formats:**
- Single component object
- Array of components
- Nested structure with `components` array

See `example-inputs/` for complete examples.

## Output Format

For each component, the pipeline generates:

### 1. Component Code (`<component-name>.tsx`)

```tsx
import { Button } from "@/components/ui/button";

interface PrimaryButtonProps {
  onClick?: () => void;
  disabled?: boolean;
}

export function PrimaryButton({ onClick, disabled }: PrimaryButtonProps) {
  return (
    <Button
      variant="default"
      size="default"
      onClick={onClick}
      disabled={disabled}
      className="w-30 h-10 rounded-md shadow-sm"
    >
      Button
    </Button>
  );
}
```

### 2. Metadata (`metadata.json`)

```json
{
  "componentId": "123:456",
  "componentName": "Primary Button",
  "figmaNodeId": "123:456",
  "generatedWith": {
    "model": "anthropic/claude-sonnet-4.5",
    "pipelineVersion": "1.0.0",
    "timestamp": "2025-11-11T15:30:00Z"
  },
  "classification": {
    "componentType": "Button",
    "shadcnComponent": "Button",
    "confidence": 0.95
  },
  "codeInfo": {
    "language": "typescript",
    "framework": "react",
    "library": "shadcn",
    "dependencies": ["@/components/ui"]
  },
  "validation": {
    "status": "pass",
    "score": 95,
    "issues": []
  }
}
```

### 3. Validation Report (`validation-report.json`)

```json
{
  "componentId": "123:456",
  "componentName": "Primary Button",
  "codeQuality": {
    "hasTypeScript": true,
    "hasReact": true,
    "hasTailwind": true,
    "hasProps": true,
    "hasAccessibility": true,
    "formatted": true
  },
  "semanticMapping": {
    "componentType": "Button",
    "shadcnComponent": "Button",
    "confidence": 0.95,
    "warnings": []
  },
  "timestamp": "2025-11-11T15:30:00Z"
}
```

## Pipeline Stages

1. **Parse** - Extract design data from Figma JSON
2. **Classify** - Identify component type (Button, Card, etc.)
3. **Map** - Map to ShadCN component structure
4. **Match** - Find similar components (if enabled)
5. **Generate** - Generate React/TypeScript code
6. **Validate** - Check code quality
7. **Visual** - Visual validation (if enabled)
8. **Output** - Write files

## Performance

- **Simple components**: <15 seconds
- **Complex components**: <30 seconds
- **Caching**: 15-25x speedup for repeated processing
- **Batch processing**: Efficient parallel processing

## Architecture

```
validation-pipeline/
├── src/
│   ├── cli.ts                    # CLI interface
│   ├── orchestrator.ts           # Pipeline coordinator
│   ├── config.ts                 # Configuration loader
│   ├── logger.ts                 # Logging utility
│   ├── types.ts                  # Type definitions
│   ├── index.ts                  # Main exports
│   ├── enhanced-figma-parser.ts  # Figma data parser
│   ├── semantic-mapper.ts        # Component mapping
│   ├── component-matcher.ts      # Semantic matching
│   ├── code-generator.ts         # Code generation
│   ├── visual-validator.ts       # Visual validation
│   ├── database.ts               # SQLite database
│   └── schema.sql                # Database schema
├── example-inputs/               # Example JSON files
├── example-outputs/              # Example outputs
├── config.example.json           # Example config
├── .env.example                  # Example environment
├── package.json
├── tsconfig.json
└── README.md
```

## Development

### Build

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

### Run Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

## Troubleshooting

### API Key Issues

**Error:** "OpenRouter API key is required"

**Solution:** Set the `OPENROUTER` environment variable in your `.env` file.

### Input Format Issues

**Error:** "No valid components found in input JSON"

**Solution:** Ensure your JSON has the correct format with `id`, `name`, `type`, and `figmaNode` fields.

### Generation Timeout

**Error:** Pipeline times out during code generation

**Solution:** Increase the `timeout` value in your config file (default: 60000ms).

### Database Lock

**Error:** Database is locked

**Solution:** Close other processes using the database or delete `validation.db` to start fresh.

## Contributing

This is part of the Figma Research project. See the main repository for contribution guidelines.

## License

MIT

## Related

- **Figma Plugin**: Exports components to JSON format
- **UI Demo App**: Displays generated components
- **Validation Code**: Source code in `/validation/`

## Support

For issues and questions, please refer to the main Figma Research project.
