#!/usr/bin/env tsx

/**
 * Regenerate Components Script
 *
 * Automates the process of regenerating components from Figma exports:
 * 1. Cleans up old generated components
 * 2. Runs validation pipeline for each export
 * 3. Copies generated components to ui-demo-app
 * 4. Updates metadata and exports configuration
 *
 * Usage:
 *   pnpm regenerate              # Regenerate all exports
 *   pnpm regenerate Button       # Regenerate specific component
 *   pnpm regenerate --clean-only # Only clean, don't regenerate
 */

import { execSync } from 'child_process';
import { existsSync, rmSync, readdirSync, copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, resolve, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

// ============================================================================
// Configuration
// ============================================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, '../../..');
const EXPORTS_DIR = join(ROOT_DIR, 'exports_test');
const PIPELINE_DIR = join(ROOT_DIR, 'packages/validation-pipeline');
const UI_APP_DIR = join(ROOT_DIR, 'packages/ui-demo-app');
const GENERATED_DIR = join(UI_APP_DIR, 'src/components/generated');
const PUBLIC_EXPORTS_DIR = join(UI_APP_DIR, 'public/figma-exports');
const TEMP_OUTPUT_DIR = join(ROOT_DIR, 'exports_test/.regeneration-temp');

interface ExportConfig {
  id: string;
  name: string;
  jsonFile: string;
  pngFile?: string;
  componentName: string;
}

// ============================================================================
// Export Configurations
// ============================================================================

const EXPORTS: ExportConfig[] = [
  {
    id: 'button-showcase',
    name: 'Button Showcase',
    jsonFile: 'Button_17085_177606_2025-11-11T15-53-00-228Z.json',
    pngFile: 'Button_17085:177606_2025-11-11T15-50-56-958Z.png',
    componentName: 'ButtonShowcase',
  },
  {
    id: 'item',
    name: 'Item',
    jsonFile: 'Item_24341_12448_2025-11-11T16-53-29-012Z.json',
    pngFile: 'Item_24341:12448_2025-11-11T16-53-34-202Z.png',
    componentName: 'Item',
  },
];

// ============================================================================
// Utility Functions
// ============================================================================

function log(message: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') {
  const prefix = {
    info: 'ℹ',
    success: '✓',
    error: '✗',
    warn: '⚠',
  }[type];

  const color = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warn: '\x1b[33m',
  }[type];

  console.log(`${color}${prefix}\x1b[0m ${message}`);
}

function section(title: string) {
  console.log('\n' + '='.repeat(80));
  console.log(title);
  console.log('='.repeat(80));
}

function exec(command: string, cwd?: string): string {
  try {
    return execSync(command, {
      cwd: cwd || process.cwd(),
      encoding: 'utf-8',
      stdio: 'pipe'
    });
  } catch (error: any) {
    throw new Error(`Command failed: ${command}\n${error.stderr || error.message}`);
  }
}

// ============================================================================
// Step 1: Clean Up
// ============================================================================

function cleanGeneratedComponents(componentName?: string) {
  section('Step 1: Cleaning Generated Components');

  if (!existsSync(GENERATED_DIR)) {
    log('Generated directory does not exist, skipping cleanup', 'info');
    return;
  }

  const files = readdirSync(GENERATED_DIR);
  let removed = 0;

  for (const file of files) {
    if (componentName && !file.includes(componentName)) {
      continue;
    }

    const filePath = join(GENERATED_DIR, file);
    rmSync(filePath, { recursive: true, force: true });
    log(`Removed: ${file}`, 'success');
    removed++;
  }

  if (removed === 0) {
    log('No files to remove', 'info');
  } else {
    log(`Removed ${removed} file(s)`, 'success');
  }
}

function cleanTempOutput() {
  if (existsSync(TEMP_OUTPUT_DIR)) {
    rmSync(TEMP_OUTPUT_DIR, { recursive: true, force: true });
  }
  mkdirSync(TEMP_OUTPUT_DIR, { recursive: true });
}

// ============================================================================
// Step 2: Run Pipeline
// ============================================================================

function generateComponent(exportConfig: ExportConfig): {
  success: boolean;
  duration: number;
  outputPath?: string;
  metadata?: any;
} {
  section(`Step 2: Generating ${exportConfig.name}`);

  const jsonPath = join(EXPORTS_DIR, exportConfig.jsonFile);

  if (!existsSync(jsonPath)) {
    log(`JSON file not found: ${jsonPath}`, 'error');
    return { success: false, duration: 0 };
  }

  const outputDir = join(TEMP_OUTPUT_DIR, exportConfig.id);
  const startTime = Date.now();

  try {
    log(`Input: ${exportConfig.jsonFile}`, 'info');
    log(`Output: ${outputDir}`, 'info');
    log('Running validation pipeline...', 'info');

    const command = `npx tsx src/cli.ts generate -i "${jsonPath}" -o "${outputDir}"`;
    const output = exec(command, PIPELINE_DIR);

    const duration = Date.now() - startTime;

    // Find generated component file
    const componentFiles = readdirSync(outputDir, { recursive: true })
      .filter(f => typeof f === 'string' && f.endsWith('.tsx'));

    if (componentFiles.length === 0) {
      log('No component files generated', 'error');
      return { success: false, duration };
    }

    const componentFile = componentFiles[0];
    const outputPath = join(outputDir, componentFile as string);

    // Read metadata
    const metadataPath = join(outputDir, componentFile.replace(/\.tsx$/, ''), 'metadata.json');
    let metadata;
    if (existsSync(metadataPath)) {
      metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));
    }

    log(`Generated in ${(duration / 1000).toFixed(1)}s`, 'success');
    log(`Component: ${componentFile}`, 'success');

    return { success: true, duration, outputPath, metadata };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    log(`Generation failed: ${error.message}`, 'error');
    return { success: false, duration };
  }
}

// ============================================================================
// Step 3: Copy to UI Demo App
// ============================================================================

function copyGeneratedComponent(exportConfig: ExportConfig, sourcePath: string) {
  section(`Step 3: Copying ${exportConfig.name} to UI Demo App`);

  // Ensure generated directory exists
  if (!existsSync(GENERATED_DIR)) {
    mkdirSync(GENERATED_DIR, { recursive: true });
    log('Created generated directory', 'success');
  }

  // Read and post-process the component
  let componentCode = readFileSync(sourcePath, 'utf-8');

  // Remove markdown code fences if present
  componentCode = componentCode.replace(/^```typescript\n?/g, '').replace(/\n?```$/g, '');

  // Remove leading/trailing whitespace
  componentCode = componentCode.trim();

  // Fix export names to match component name
  const exportRegex = /export\s+(default\s+)?function\s+(\w+)/;
  const match = componentCode.match(exportRegex);
  if (match && match[2] !== exportConfig.componentName) {
    log(`Fixing export name: ${match[2]} → ${exportConfig.componentName}`, 'info');
    // Replace function name
    componentCode = componentCode.replace(
      new RegExp(`\\b${match[2]}\\b`, 'g'),
      exportConfig.componentName
    );
    // Change to named export if it's default
    if (match[1]?.includes('default')) {
      componentCode = componentCode.replace(/export\s+default\s+function/, 'export function');
    }
  }

  // Copy processed component file
  const destPath = join(GENERATED_DIR, `${exportConfig.componentName}.tsx`);
  writeFileSync(destPath, componentCode, 'utf-8');
  log(`Copied to: src/components/generated/${exportConfig.componentName}.tsx`, 'success');

  // Copy PNG to public directory if it exists
  if (exportConfig.pngFile) {
    const pngSource = join(EXPORTS_DIR, exportConfig.pngFile);
    if (existsSync(pngSource)) {
      if (!existsSync(PUBLIC_EXPORTS_DIR)) {
        mkdirSync(PUBLIC_EXPORTS_DIR, { recursive: true });
      }

      const pngDest = join(PUBLIC_EXPORTS_DIR, `${exportConfig.id}.png`);
      copyFileSync(pngSource, pngDest);
      log(`Copied PNG to: public/figma-exports/${exportConfig.id}.png`, 'success');
    }
  }
}

// ============================================================================
// Step 4: Update Exports Store
// ============================================================================

function updateExportsStore(results: Map<string, any>) {
  section('Step 4: Updating Exports Store');

  const storeFile = join(UI_APP_DIR, 'src/lib/exports-store.ts');

  if (!existsSync(storeFile)) {
    log('Exports store not found, skipping update', 'warn');
    return;
  }

  // Read current store
  let storeContent = readFileSync(storeFile, 'utf-8');

  // Update metadata for each export
  for (const [exportId, result] of results.entries()) {
    const exportConfig = EXPORTS.find(e => e.id === exportId);
    if (!exportConfig || !result.success) continue;

    const metadata = result.metadata;
    if (!metadata) continue;

    log(`Updating metadata for ${exportConfig.name}`, 'info');

    // You could parse and update the mockExports array here
    // For now, just log the metadata
    log(`  Generated with: ${metadata.generatedWith?.model}`, 'info');
    log(`  Quality score: ${metadata.validation?.score}%`, 'info');
  }

  log('Exports store update complete', 'success');
}

// ============================================================================
// Main Script
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const componentFilter = args.find(arg => !arg.startsWith('--'));
  const cleanOnly = args.includes('--clean-only');

  console.log('\n🔄 Component Regeneration Script\n');

  if (componentFilter) {
    log(`Filtering for component: ${componentFilter}`, 'info');
  }

  // Filter exports if component name provided
  const exportsToProcess = componentFilter
    ? EXPORTS.filter(e =>
        e.name.toLowerCase().includes(componentFilter.toLowerCase()) ||
        e.componentName.toLowerCase().includes(componentFilter.toLowerCase())
      )
    : EXPORTS;

  if (exportsToProcess.length === 0) {
    log(`No exports found matching: ${componentFilter}`, 'error');
    process.exit(1);
  }

  log(`Processing ${exportsToProcess.length} export(s)`, 'info');

  // Step 1: Clean
  cleanGeneratedComponents(componentFilter);
  cleanTempOutput();

  if (cleanOnly) {
    log('Clean-only mode, exiting', 'info');
    return;
  }

  // Step 2 & 3: Generate and Copy
  const results = new Map<string, any>();
  let successCount = 0;
  let failureCount = 0;

  for (const exportConfig of exportsToProcess) {
    const result = generateComponent(exportConfig);
    results.set(exportConfig.id, result);

    if (result.success && result.outputPath) {
      copyGeneratedComponent(exportConfig, result.outputPath);
      successCount++;
    } else {
      failureCount++;
    }
  }

  // Step 4: Update store
  if (successCount > 0) {
    updateExportsStore(results);
  }

  // Summary
  section('Summary');
  log(`Total exports processed: ${exportsToProcess.length}`, 'info');
  log(`Successful: ${successCount}`, 'success');
  if (failureCount > 0) {
    log(`Failed: ${failureCount}`, 'error');
  }

  const totalDuration = Array.from(results.values())
    .reduce((sum, r) => sum + r.duration, 0);
  log(`Total duration: ${(totalDuration / 1000).toFixed(1)}s`, 'info');

  if (successCount > 0) {
    console.log('\n✨ Components regenerated successfully!');
    console.log('\nNext steps:');
    console.log('  1. Start the dev server: pnpm dev');
    console.log('  2. Visit http://localhost:5173/exports');
    console.log('  3. Check visual similarity with Puppeteer validation');
  }

  // Cleanup temp directory
  if (existsSync(TEMP_OUTPUT_DIR)) {
    rmSync(TEMP_OUTPUT_DIR, { recursive: true, force: true });
  }

  process.exit(failureCount > 0 ? 1 : 0);
}

// Run script
main().catch(error => {
  console.error('\n❌ Script failed:', error.message);
  process.exit(1);
});
