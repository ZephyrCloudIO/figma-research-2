# Exports Page - Visual Validation System

## Overview

The Exports page provides a visual validation system for Figma exports and their generated React components. It features a sidebar navigation for managing multiple exports and uses Puppeteer for automated visual comparison.

## Features

### 1. Sidebar Navigation
- Lists all Figma exports with dates
- Status indicators (✓ passed, ✗ failed, ⏳ validating)
- Click to view/compare exports
- Auto-selects first export on load

### 2. Side-by-Side Comparison
- **Left**: Original Figma export (PNG)
- **Right**: Generated React component (live render)
- Visual similarity score
- Validation status banner

### 3. Automated Visual Validation
- Puppeteer screenshot capture
- Pixelmatch image comparison
- Diff image generation
- Configurable similarity threshold (default: 90%)

## Usage

### Viewing Exports

1. Navigate to `/exports` in the UI demo app
2. Select an export from the sidebar
3. View side-by-side comparison

### Running Visual Validation

**Option 1: Manual (via UI)**
1. Select an export
2. Click "Run Visual Validation" button
3. Wait for validation to complete
4. View results with diff image

**Option 2: CLI (automated)**
```bash
# Validate all exports
cd third_pass/packages/ui-demo-app
pnpm run validate

# Validate specific export
pnpm run validate button

# Watch mode (re-run on changes)
pnpm run validate:watch
```

### Adding New Exports

1. **Export from Figma Plugin:**
   - Use Zephyr plugin to export JSON + images
   - Save to `public/figma-exports/`

2. **Generate Component:**
   ```bash
   cd validation
   node generate-from-plugin-export.js \
     ../exports_test/YourComponent.json \
     ../exports_test/generated
   ```

3. **Copy Files:**
   ```bash
   # Copy generated component
   cp exports_test/generated/YourComponent.tsx \
      third_pass/packages/ui-demo-app/src/components/generated/

   # Copy Figma export image
   cp exports_test/YourComponent_*.png \
      third_pass/packages/ui-demo-app/public/figma-exports/your-component.png
   ```

4. **Add to Store:**
   Update `src/lib/exports-store.ts`:
   ```typescript
   export const mockExports: FigmaExport[] = [
     {
       id: 'your-component',
       name: 'Your Component Name',
       nodeId: '12345:67890',
       exportDate: '2025-11-11T16:00:00Z',
       figmaImagePath: '/figma-exports/your-component.png',
       generatedComponentPath: '/src/components/generated/YourComponent.tsx',
       metadata: {
         width: 800,
         height: 600,
       },
       validation: {
         status: 'pending',
       },
     },
   ];
   ```

5. **Update ExportViewer:**
   Add your component to the render logic in `src/routes/exports.tsx`:
   ```typescript
   {exp.id === 'your-component' && <YourComponent />}
   ```

## File Structure

```
ui-demo-app/
├── src/
│   ├── lib/
│   │   ├── exports-store.ts          # Export data management
│   │   └── visual-validator.ts       # Puppeteer validation logic
│   ├── routes/
│   │   └── exports.tsx                # Exports page with sidebar
│   └── components/
│       └── generated/                 # Generated components
│           └── ButtonShowcase.tsx
├── scripts/
│   └── validate-exports.ts            # CLI validation script
└── public/
    ├── figma-exports/                 # Figma export images
    │   └── button-showcase.png
    └── validation-results/            # Generated screenshots & diffs
        ├── button-showcase-generated.png
        └── button-showcase-diff.png
```

## Validation Process

### 1. Screenshot Capture
```typescript
captureComponentScreenshot(
  'http://localhost:3000/exports#button-showcase',
  './validation-results/button-showcase-generated.png',
  { width: 1536, height: 6524 }
)
```

### 2. Image Comparison
```typescript
compareImages(
  './public/figma-exports/button-showcase.png',  // Original
  './validation-results/button-showcase-generated.png',  // Generated
  './validation-results/button-showcase-diff.png',  // Diff output
  0.1  // Threshold
)
```

### 3. Results
- **similarity**: Percentage match (0-100%)
- **diffPixels**: Number of different pixels
- **totalPixels**: Total pixels compared
- **diffImagePath**: Path to diff image
- **status**: passed | failed | error

## Configuration

### Validation Options

```typescript
interface ValidationOptions {
  threshold?: number;         // Pixel diff threshold (0-1), default 0.1
  targetSimilarity?: number;  // Required similarity %, default 90
  outputDir?: string;         // Output directory for results
  viewport?: {               // Screenshot viewport size
    width: number;
    height: number;
  };
}
```

### Puppeteer Settings

The validator uses headless Chrome with:
- No sandbox (for Docker compatibility)
- networkidle2 wait strategy
- 30-second timeout
- Full page screenshots

## Troubleshooting

### Export Not Showing
- Check `figmaImagePath` is correct in exports-store.ts
- Verify image exists in `public/figma-exports/`
- Check browser console for errors

### Validation Fails
- Ensure dev server is running (`pnpm dev`)
- Check component renders without errors
- Verify image dimensions match
- Try adjusting threshold (more tolerant: 0.2-0.3)

### Puppeteer Errors
- Install Chromium: `npx puppeteer browsers install chrome`
- Check port 3000 is available
- Increase timeout in visual-validator.ts

### Component Not Rendering
- Add `data-component-root` attribute to component root
- Import component in `exports.tsx`
- Add render case in ExportViewer

## Best Practices

### 1. Consistent Dimensions
- Use same viewport size for capture as Figma export
- Store dimensions in metadata
- Pass to validation options

### 2. Loading States
- Wait for fonts to load before screenshot
- Use `data-component-root` selector
- Add explicit wait if needed: `await page.waitForTimeout(1000)`

### 3. Dynamic Content
- Mock dynamic data for consistent screenshots
- Use fixed dates/times
- Disable animations during capture

### 4. Threshold Tuning
- Start with 0.1 (strict)
- Increase for anti-aliasing differences: 0.2
- Use 0.3+ for font rendering variations
- Never go above 0.5 (too lenient)

### 5. Performance
- Run validation in CI/CD pipeline
- Cache results with component hash
- Only re-validate on changes

## Future Enhancements

### Planned Features
- [ ] Automatic export discovery (scan filesystem)
- [ ] Real-time validation API endpoint
- [ ] WebSocket updates for live status
- [ ] Batch validation dashboard
- [ ] Historical comparison (track changes over time)
- [ ] Export management UI (add/remove/edit)
- [ ] Automatic export on Figma plugin use
- [ ] Integration with git hooks (validate before commit)

### Advanced Validation
- [ ] Responsive breakpoint testing
- [ ] Dark mode validation
- [ ] Interaction testing (hover, click, focus)
- [ ] Accessibility validation (ARIA, contrast)
- [ ] Performance metrics (bundle size, render time)

## Examples

### Example 1: Button Showcase

**Export:**
- ID: `button-showcase`
- Figma: 1536 × 6524px PNG
- Component: `ButtonShowcase.tsx`

**Results:**
- Similarity: 95%
- Status: ✓ Passed
- Diff pixels: 39,484 / 10,020,864

### Example 2: Adding Card Component

1. Export from Figma (CardComponent_12345_67890.json)
2. Generate code: `node generate-from-plugin-export.js ...`
3. Copy files to ui-demo-app
4. Add to exports-store.ts
5. Update exports.tsx with component
6. Run validation: `pnpm run validate card`
7. View results at `/exports`

## API Reference

### exports-store.ts

```typescript
loadExports(): Promise<FigmaExport[]>
addExport(data: Omit<FigmaExport, 'id'>): FigmaExport
getExport(id: string): FigmaExport | undefined
updateValidation(id: string, validation: ValidationResult): void
```

### visual-validator.ts

```typescript
captureComponentScreenshot(url: string, output: string, viewport?: Viewport): Promise<void>
compareImages(img1: string, img2: string, diff: string, threshold: number): ComparisonResult
validateComponent(id: string, url: string, figma: string, options?: Options): Promise<ValidationResult>
batchValidate(exports: Export[], options?: Options): Promise<Map<string, ValidationResult>>
```

---

**Ready to use!** Navigate to `/exports` in the UI demo app to see your first export with visual validation.
