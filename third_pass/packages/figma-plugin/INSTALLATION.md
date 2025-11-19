# Zephyr Figma Plugin - Installation Guide

## Prerequisites

- Figma Desktop application (not browser version)
- Node.js 18+ and pnpm installed (for building)

## Installation Steps

### 1. Build the Plugin

```bash
# Navigate to plugin directory
cd third_pass/packages/figma-plugin

# Install dependencies
pnpm install

# Build the plugin
pnpm build
```

This will create the `dist/` directory with:
- `dist/code.js` - Bundled plugin code
- `dist/index.html` - Bundled UI

### 2. Import into Figma

1. Open Figma Desktop application
2. Go to **Plugins** menu → **Development** → **Import plugin from manifest...**
3. Navigate to `third_pass/packages/figma-plugin/`
4. Select `manifest.json`
5. Click "Open"

The plugin will now appear in your Plugins menu as "Zephyr - Figma to Code"

### 3. Verify Installation

1. Open any Figma file
2. Select a node, frame, or component
3. Go to **Plugins** → **Development** → **Zephyr - Figma to Code**
4. The plugin UI should open showing:
   - Selection information
   - Two tabs: "Generate as Code (JSON)" and "Extract as Image"

## Usage

### Generate JSON Export

1. Select a single node in Figma
2. Open the plugin
3. Click "Generate as Code (JSON)" tab
4. Click "Generate JSON" button
5. JSON will display in the plugin UI
6. Click "Copy" or "Download" to save

### Export Images

1. Select a single node in Figma
2. Open the plugin
3. Click "Extract as Image" tab
4. Select desired formats (PNG, SVG, JPG)
5. Choose export scale (1x, 2x, 4x)
6. Click "Export Images" button
7. Images will download automatically

## Development Mode

For plugin development with hot reload:

```bash
# Terminal 1 - Build with watch
pnpm build:watch

# Terminal 2 - Type check with watch
pnpm tsc:watch

# Or run both together
pnpm dev
```

When files change, rebuild and reload the plugin in Figma:
1. Right-click on canvas
2. Select **Plugins** → **Development** → **Reload plugin**

## Troubleshooting

### Plugin won't load
- Ensure `dist/` directory exists with `code.js` and `index.html`
- Run `pnpm build` again
- Check Figma Console (Plugins → Development → Open Console) for errors

### Build fails
- Ensure Node.js 18+ is installed: `node --version`
- Ensure pnpm is installed: `pnpm --version`
- Clear node_modules and reinstall: `rm -rf node_modules && pnpm install`

### Plugin crashes
- Check Figma Console for error messages
- Ensure you have a single node selected
- Try with a simpler node first

### JSON export is slow
- Expected for very large components (100+ nodes)
- Consider exporting smaller sub-trees
- See README.md "Performance Considerations" section

## Uninstallation

To remove the plugin:
1. Go to **Plugins** → **Manage plugins...**
2. Find "Zephyr - Figma to Code" in Development section
3. Click the "..." menu → **Remove**

## Support

For issues or questions, see the main README.md or contact the Zephyr team.
