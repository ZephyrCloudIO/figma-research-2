# Zephyr Figma Plugin

Extract images and generate code from Figma designs with comprehensive node data extraction.

## Features

### 1. Generate as Code (JSON Export)

Export the complete node graph with all properties, styles, and children for code generation and semantic mapping.

**Extracts:**
- Complete node hierarchy (recursive)
- Layout properties (auto layout, padding, spacing, alignment)
- Style properties (fills, strokes, effects, opacity, corner radius)
- Typography (font family, size, weight, line height, letter spacing)
- Component metadata (component ID, properties, main component references)
- Dimensions and positioning
- Constraints and clipping

**Output Format:**
```json
{
  "version": "1.0.0",
  "exportDate": "2025-11-11T15:30:00.000Z",
  "fileKey": "MMMjqwWNYZAg0YlIeL9aJZ",
  "fileName": "Design System",
  "nodeId": "18491:22435",
  "nodeName": "Button/Primary",
  "node": {
    "id": "18491:22435",
    "name": "Button/Primary",
    "type": "COMPONENT",
    "visible": true,
    "locked": false,
    "width": 120,
    "height": 40,
    "x": 0,
    "y": 0,
    "rotation": 0,
    "layoutMode": "HORIZONTAL",
    "primaryAxisAlignItems": "CENTER",
    "counterAxisAlignItems": "CENTER",
    "paddingLeft": 16,
    "paddingRight": 16,
    "paddingTop": 8,
    "paddingBottom": 8,
    "itemSpacing": 8,
    "fills": [...],
    "effects": [...],
    "children": [...]
  }
}
```

### 2. Extract as Image

Export selected nodes as images in multiple formats (PNG, SVG, JPG) with configurable scale for visual verification and regression testing.

**Features:**
- Multi-format export (PNG, SVG, JPG)
- Configurable scale (1x, 2x, 4x)
- Automatic filename generation with node name, ID, and timestamp
- Metadata JSON export with file and node information

## Installation

This is a private plugin for internal use only.

1. Open Figma Desktop
2. Go to Plugins > Development > Import plugin from manifest
3. Select the `manifest.json` file from this directory
4. The plugin will appear in your Plugins menu

## Development

### Prerequisites

- Node.js 18+
- pnpm (for monorepo workspace)

### Setup

```bash
# Install dependencies
pnpm install

# Development mode (watch + rebuild)
pnpm dev

# Build for production
pnpm build

# Type check only
pnpm tsc
```

### Project Structure

```
figma-plugin/
├── manifest.json           # Plugin manifest
├── plugin-src/
│   ├── code.ts            # Main plugin code (sandbox context)
│   └── tsconfig.json      # TypeScript config for plugin
├── ui-src/
│   ├── App.tsx            # React UI component
│   ├── App.css            # UI styles
│   ├── main.tsx           # React entry point
│   ├── index.html         # HTML template
│   ├── tsconfig.json      # TypeScript config for UI
│   └── vite-env.d.ts      # Vite type definitions
├── schema/
│   └── json-export.schema.json  # JSON export schema
├── examples/
│   ├── button-export.json       # Example button export
│   └── card-export.json         # Example card export
├── dist/                  # Build output (gitignored)
│   ├── code.js           # Bundled plugin code
│   └── index.html        # Bundled UI
├── package.json
├── vite.config.ts
└── README.md
```

## Usage

### Generate JSON Export

1. Select a node, frame, or component in Figma
2. Open the Zephyr plugin
3. Click the "Generate as Code (JSON)" tab
4. Click "Generate JSON"
5. View the output in the plugin UI
6. Click "Copy" to copy to clipboard or "Download" to save as file

**Performance:**
- Simple components: < 100ms
- Complex components (50+ children): < 1s
- Large component sets (100+ nodes): < 5s

### Export Images

1. Select a node, frame, or component in Figma
2. Open the Zephyr plugin
3. Click the "Extract as Image" tab
4. Select desired formats (PNG, SVG, JPG)
5. Choose export scale (1x, 2x, 4x)
6. Click "Export Images"
7. Images and metadata will download automatically

## JSON Export Format

### Top Level Structure

| Field | Type | Description |
|-------|------|-------------|
| `version` | string | JSON format version (semver) |
| `exportDate` | string | ISO 8601 timestamp of export |
| `editDate` | string? | ISO 8601 timestamp of last file edit (optional) |
| `fileKey` | string | Figma file key |
| `fileName` | string | Name of Figma file |
| `nodeId` | string | ID of exported node |
| `nodeName` | string | Name of exported node |
| `node` | ExportedNode | Complete node data |

### ExportedNode Structure

**Base Properties:**
- `id`, `name`, `type` - Node identification
- `visible`, `locked` - Visibility state
- `width`, `height`, `x`, `y`, `rotation` - Dimensions and position

**Layout Properties** (auto layout):
- `layoutMode` - "HORIZONTAL", "VERTICAL", or "NONE"
- `primaryAxisSizingMode`, `counterAxisSizingMode` - Sizing modes
- `primaryAxisAlignItems`, `counterAxisAlignItems` - Alignment
- `paddingLeft`, `paddingRight`, `paddingTop`, `paddingBottom` - Padding
- `itemSpacing`, `counterAxisSpacing` - Spacing
- `layoutWrap` - Wrap mode

**Style Properties:**
- `opacity` - Opacity (0-1)
- `blendMode` - Blend mode string
- `fills` - Array of Paint objects (backgrounds)
- `strokes` - Array of Paint objects (borders)
- `strokeWeight` - Border width
- `strokeAlign` - "INSIDE", "OUTSIDE", "CENTER"
- `cornerRadius` - Single corner radius value
- `rectangleCornerRadii` - Array of 4 corner radii [TL, TR, BR, BL]
- `effects` - Array of Effect objects (shadows, blurs)

**Typography Properties** (text nodes):
- `characters` - Text content
- `fontSize` - Font size in pixels
- `fontName` - { family, style }
- `fontWeight` - Numeric weight (400, 600, etc.)
- `textAlignHorizontal`, `textAlignVertical` - Alignment
- `textAutoResize` - Resize mode
- `textCase`, `textDecoration` - Text formatting
- `letterSpacing` - { value, units }
- `lineHeight` - { value, units }
- `paragraphIndent`, `paragraphSpacing` - Paragraph formatting

**Component Properties:**
- `componentId` - Component ID (for components)
- `componentProperties` - Component property values
- `mainComponent` - Reference to main component (for instances)
  - `id`, `key`, `name`

**Other Properties:**
- `constraints` - { horizontal, vertical } - Layout constraints
- `clipsContent` - Whether content is clipped
- `isMask` - Whether node is a mask
- `children` - Array of child ExportedNode objects (recursive)

### Paint Object

```typescript
{
  type: 'SOLID' | 'GRADIENT_*' | 'IMAGE';
  visible: boolean;
  opacity: number;
  blendMode: string;
  
  // SOLID only
  color?: { r, g, b, a? };
  
  // GRADIENT only
  gradientStops?: Array<...>;
  gradientTransform?: Array<...>;
  
  // IMAGE only
  scaleMode?: string;
  imageHash?: string;
  imageTransform?: Array<...>;
}
```

### Effect Object

```typescript
{
  type: 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR';
  visible: boolean;
  radius: number;
  blendMode: string;
  
  // Shadow only
  color?: { r, g, b, a? };
  offset?: { x, y };
  spread?: number;
  showShadowBehindNode?: boolean;
}
```

## Examples

See the `examples/` directory for sample exports:
- `button-export.json` - Simple button component
- `card-export.json` - Complex card with nested children

## Schema Validation

The JSON export conforms to the JSON Schema defined in `schema/json-export.schema.json`.

You can validate exports using any JSON Schema validator:

```bash
# Using ajv-cli
npm install -g ajv-cli
ajv validate -s schema/json-export.schema.json -d output.json
```

## Integration with Semantic Mapper

The JSON export is designed to integrate with the Zephyr semantic mapping pipeline:

1. Export component as JSON
2. Feed JSON to semantic mapper (validation/semantic-mapper.ts)
3. Semantic mapper classifies component type and extracts design tokens
4. Generate code using appropriate component template

## API Reference

### Plugin Messages

**From UI to Plugin:**

```typescript
// Generate JSON export
{ type: 'generate-json' }

// Export images
{ 
  type: 'export-images',
  data: {
    png: boolean,
    svg: boolean,
    jpg: boolean,
    scale: number
  }
}

// Close plugin
{ type: 'close-plugin' }
```

**From Plugin to UI:**

```typescript
// Selection changed
{
  type: 'selection-changed',
  data: {
    count: number,
    nodes: Array<{ id, name, type }>
  }
}

// JSON export complete
{
  type: 'json-export-complete',
  data: {
    json: JSONExport,
    duration: number
  }
}

// Images export complete
{
  type: 'images-export-complete',
  data: {
    exports: Array<{ format, data, filename }>,
    metadata: { nodeId, nodeName, fileKey, fileName, timestamp, scale }
  }
}

// Progress update
{
  type: 'progress',
  data: { message: string }
}

// Error
{
  type: 'error',
  error: string
}
```

## Performance Considerations

### JSON Export

The plugin uses recursive traversal to extract complete node hierarchies. Performance characteristics:

- **Simple nodes** (< 10 children): < 100ms
- **Medium complexity** (10-50 children): 100-500ms
- **High complexity** (50-100 children): 500-2000ms
- **Very large** (100+ children): 2-5s

For very large component sets, consider exporting sub-trees individually.

### Image Export

Image export uses Figma's native `exportAsync()` which is optimized for performance:

- **PNG/JPG**: Fast, scales well
- **SVG**: Slower for complex vectors, fast for simple shapes
- **Multiple formats**: Exports run in sequence

## Troubleshoading

### Plugin won't load
- Ensure you're using Figma Desktop (not browser)
- Check that `dist/code.js` and `dist/index.html` exist
- Run `pnpm build` to generate dist files

### JSON export is slow
- Break down large component sets into smaller pieces
- Avoid exporting entire pages (export frames instead)

### Images won't export
- Ensure node is exportable (not text-only, not empty)
- Check that at least one format is selected
- Try a simpler node first to verify functionality

### Type errors during development
- Run `pnpm tsc` to check for type errors
- Ensure `@figma/plugin-typings` is installed
- Check that tsconfig.json is properly configured

## License

MIT License - Internal use only

## Support

For issues or questions, contact the Zephyr team.
