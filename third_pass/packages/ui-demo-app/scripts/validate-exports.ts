#!/usr/bin/env tsx
/**
 * CLI script to validate exports using Puppeteer
 *
 * Usage:
 *   pnpm run validate          # Validate all exports
 *   pnpm run validate button   # Validate specific export
 */

import { validateComponent, batchValidate } from '../src/lib/visual-validator';
import { loadExports } from '../src/lib/exports-store';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DEV_SERVER_URL = process.env.VITE_DEV_SERVER || 'http://localhost:5173';
const PUBLIC_DIR = resolve(__dirname, '../public');
const VALIDATION_OUTPUT = resolve(__dirname, '../public/validation-results');

async function main() {
  const args = process.argv.slice(2);
  const exportIdFilter = args[0];

  console.log('Loading exports...');
  const exports = await loadExports();

  if (exports.length === 0) {
    console.log('No exports found.');
    return;
  }

  console.log(`Found ${exports.length} export(s)`);

  // Filter exports if ID specified
  const exportsToValidate = exportIdFilter
    ? exports.filter(exp => exp.id.includes(exportIdFilter))
    : exports;

  if (exportsToValidate.length === 0) {
    console.log(`No exports match filter: ${exportIdFilter}`);
    return;
  }

  console.log(`\nValidating ${exportsToValidate.length} export(s)...\n`);
  console.log('='.repeat(80));

  // Prepare validation data
  const validationData = exportsToValidate.map(exp => ({
    id: exp.id,
    componentUrl: `${DEV_SERVER_URL}/exports#${exp.id}`,
    figmaImagePath: resolve(PUBLIC_DIR, exp.figmaImagePath.replace(/^\//, '')),
  }));

  // Run validation
  const results = await batchValidate(validationData, {
    threshold: 0.1,
    targetSimilarity: 90,
    outputDir: VALIDATION_OUTPUT,
    viewport: exportsToValidate[0].metadata
      ? {
          width: exportsToValidate[0].metadata.width,
          height: exportsToValidate[0].metadata.height,
        }
      : undefined,
  });

  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('VALIDATION SUMMARY');
  console.log('='.repeat(80));

  let passedCount = 0;
  let failedCount = 0;
  let errorCount = 0;

  results.forEach((result, id) => {
    const icon =
      result.status === 'passed'
        ? '✅'
        : result.status === 'failed'
        ? '❌'
        : '⚠️';

    console.log(`\n${icon} ${id}`);
    console.log(`   Status: ${result.status.toUpperCase()}`);
    console.log(`   Similarity: ${result.similarity.toFixed(2)}%`);
    if (result.diffPixels > 0) {
      console.log(
        `   Diff: ${result.diffPixels.toLocaleString()} / ${result.totalPixels.toLocaleString()} pixels`
      );
    }
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }

    if (result.status === 'passed') passedCount++;
    else if (result.status === 'failed') failedCount++;
    else errorCount++;
  });

  console.log('\n' + '='.repeat(80));
  console.log(
    `Total: ${results.size} | Passed: ${passedCount} | Failed: ${failedCount} | Errors: ${errorCount}`
  );
  console.log('='.repeat(80));

  // Exit with error code if any failed
  process.exit(failedCount + errorCount > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
