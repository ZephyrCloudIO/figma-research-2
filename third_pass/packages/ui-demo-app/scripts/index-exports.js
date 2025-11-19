#!/usr/bin/env node
/**
 * Index Exports Script
 *
 * Scans the exports_test folder at the repo root and creates a manifest
 * of all available exports. Copies the necessary files to public folder.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '../../../../');
const EXPORTS_TEST_DIR = path.join(REPO_ROOT, 'exports_test');
const PUBLIC_DIR = path.join(__dirname, '../public');
const EXPORTS_PUBLIC_DIR = path.join(PUBLIC_DIR, 'figma-exports');
const MANIFEST_PATH = path.join(PUBLIC_DIR, 'exports-manifest.json');

console.log('Indexing Figma Exports...');
console.log('='.repeat(80));
console.log(`Source: ${EXPORTS_TEST_DIR}`);
console.log(`Target: ${EXPORTS_PUBLIC_DIR}`);
console.log('='.repeat(80));
console.log();

// Create public directories if they don't exist
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}
if (!fs.existsSync(EXPORTS_PUBLIC_DIR)) {
  fs.mkdirSync(EXPORTS_PUBLIC_DIR, { recursive: true });
}

// Scan exports_test directory
if (!fs.existsSync(EXPORTS_TEST_DIR)) {
  console.error(`Error: exports_test directory not found at ${EXPORTS_TEST_DIR}`);
  process.exit(1);
}

const files = fs.readdirSync(EXPORTS_TEST_DIR);
const exports = [];

for (const file of files) {
  // Look for JSON files that match the export pattern
  if (file.endsWith('.json') && !file.endsWith('metadata.json')) {
    const jsonPath = path.join(EXPORTS_TEST_DIR, file);
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    // Extract component name and node ID
    const nodeName = jsonData.nodeName || jsonData.node?.name || 'Unknown';
    const nodeId = jsonData.nodeId || jsonData.node?.id || 'unknown';
    const exportDate = jsonData.exportDate || new Date().toISOString();

    // Look for corresponding PNG file
    const baseName = file.replace('.json', '');
    const pngFile = files.find(f => f.startsWith(baseName.split('_')[0]) && f.endsWith('.png'));
    const svgFile = files.find(f => f.startsWith(baseName.split('_')[0]) && f.endsWith('.svg'));

    // Look for generated component
    const generatedDir = path.join(EXPORTS_TEST_DIR, 'generated');
    const generatedPipelineDir = path.join(EXPORTS_TEST_DIR, 'generated-pipeline');

    let generatedComponentPath = null;
    let generatedMetadataPath = null;

    // Check both generated directories
    if (fs.existsSync(generatedDir)) {
      const componentFile = path.join(generatedDir, `${nodeName}.tsx`);
      const metadataFile = path.join(generatedDir, `${nodeName}.metadata.json`);

      if (fs.existsSync(componentFile)) {
        generatedComponentPath = componentFile;
      }
      if (fs.existsSync(metadataFile)) {
        generatedMetadataPath = metadataFile;
      }
    }

    if (!generatedComponentPath && fs.existsSync(generatedPipelineDir)) {
      const componentDir = path.join(generatedPipelineDir, nodeName.toLowerCase());
      if (fs.existsSync(componentDir)) {
        const componentFile = path.join(componentDir, `${nodeName}.tsx`);
        const metadataFile = path.join(componentDir, 'metadata.json');

        if (fs.existsSync(componentFile)) {
          generatedComponentPath = componentFile;
        }
        if (fs.existsSync(metadataFile)) {
          generatedMetadataPath = metadataFile;
        }
      }
    }

    // Copy PNG to public if exists
    let publicImagePath = null;
    if (pngFile) {
      const pngSource = path.join(EXPORTS_TEST_DIR, pngFile);
      const pngTarget = path.join(EXPORTS_PUBLIC_DIR, pngFile);
      fs.copyFileSync(pngSource, pngTarget);
      publicImagePath = `/figma-exports/${pngFile}`;
      console.log(`✓ Copied: ${pngFile}`);
    }

    // Copy SVG to public if exists
    let publicSvgPath = null;
    if (svgFile) {
      const svgSource = path.join(EXPORTS_TEST_DIR, svgFile);
      const svgTarget = path.join(EXPORTS_PUBLIC_DIR, svgFile);
      fs.copyFileSync(svgSource, svgTarget);
      publicSvgPath = `/figma-exports/${svgFile}`;
      console.log(`✓ Copied: ${svgFile}`);
    }

    // Copy JSON to public for viewing
    const jsonTarget = path.join(EXPORTS_PUBLIC_DIR, file);
    fs.copyFileSync(jsonPath, jsonTarget);
    console.log(`✓ Copied: ${file}`);

    // Load metadata if available
    let metadata = null;
    if (generatedMetadataPath) {
      metadata = JSON.parse(fs.readFileSync(generatedMetadataPath, 'utf-8'));
    }

    // Create export entry
    const exportEntry = {
      id: nodeId.replace(/[^a-zA-Z0-9-]/g, '-'),
      name: nodeName,
      nodeId: nodeId,
      exportDate: exportDate,
      figmaImagePath: publicImagePath,
      figmaSvgPath: publicSvgPath,
      figmaJsonPath: `/figma-exports/${file}`,
      generatedComponentPath: generatedComponentPath
        ? path.relative(path.join(__dirname, '../src'), generatedComponentPath)
        : null,
      metadata: {
        width: jsonData.node?.width || jsonData.node?.absoluteBoundingBox?.width || 0,
        height: jsonData.node?.height || jsonData.node?.absoluteBoundingBox?.height || 0,
        fileKey: jsonData.fileKey,
        fileName: jsonData.fileName,
        generationCost: metadata?.cost,
        generationTokens: metadata?.tokensUsed,
        generationModel: metadata?.model,
      },
    };

    // Copy generated component to src/components/generated if it exists
    if (generatedComponentPath) {
      const genDir = path.join(__dirname, '../src/components/generated');
      if (!fs.existsSync(genDir)) {
        fs.mkdirSync(genDir, { recursive: true });
      }

      const targetComponent = path.join(genDir, `${nodeName}.tsx`);
      fs.copyFileSync(generatedComponentPath, targetComponent);
      exportEntry.generatedComponentPath = `@/components/generated/${nodeName}`;
      console.log(`✓ Copied component: ${nodeName}.tsx`);
    }

    exports.push(exportEntry);
    console.log();
  }
}

// Write manifest
const manifest = {
  generated: new Date().toISOString(),
  count: exports.length,
  exports: exports,
};

fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');

console.log('='.repeat(80));
console.log(`✅ Indexed ${exports.length} export(s)`);
console.log(`📄 Manifest: ${MANIFEST_PATH}`);
console.log('='.repeat(80));
