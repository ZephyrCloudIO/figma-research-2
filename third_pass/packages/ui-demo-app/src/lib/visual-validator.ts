/**
 * Visual Validation using Puppeteer and Pixelmatch
 */

import puppeteer from 'puppeteer';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import sharp from 'sharp';

export interface ValidationResult {
  status: 'passed' | 'failed' | 'error';
  similarity: number;
  diffPixels: number;
  totalPixels: number;
  diffImagePath?: string;
  error?: string;
}

export interface ValidationOptions {
  threshold?: number; // Pixel diff threshold (0-1), default 0.1
  targetSimilarity?: number; // Required similarity percentage, default 90
  outputDir?: string; // Where to save diff images
  viewport?: { width: number; height: number };
}

/**
 * Capture screenshot of a component using Puppeteer element screenshot
 */
export async function captureComponentScreenshot(
  componentUrl: string,
  outputPath: string,
  viewport = { width: 1536, height: 6524 }
): Promise<void> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport(viewport);

    // Navigate to the component
    await page.goto(componentUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Wait for component showcase element to render
    const selector = '[data-component-showcase]';
    await page.waitForSelector(selector, { timeout: 10000 });

    // Find the component showcase element
    const element = await page.$(selector);

    if (!element) {
      throw new Error(`Could not find element with selector: ${selector}`);
    }

    // Take screenshot of just the element
    await element.screenshot({
      path: outputPath,
    });

    console.log(`Screenshot saved to: ${outputPath}`);
  } finally {
    await browser.close();
  }
}

/**
 * Normalize and resize images to match dimensions
 */
async function normalizeImages(
  img1Path: string,
  img2Path: string
): Promise<{ img1: PNG; img2: PNG; width: number; height: number }> {
  // Get metadata for both images
  const [meta1, meta2] = await Promise.all([
    sharp(img1Path).metadata(),
    sharp(img2Path).metadata(),
  ]);

  console.log(`  Image 1: ${meta1.width}x${meta1.height} (${meta1.format}, ${meta1.channels} channels)`);
  console.log(`  Image 2: ${meta2.width}x${meta2.height} (${meta2.format}, ${meta2.channels} channels)`);

  // Determine target dimensions (use smaller dimensions to avoid upscaling)
  const targetWidth = Math.min(meta1.width!, meta2.width!);
  const targetHeight = Math.min(meta1.height!, meta2.height!);

  console.log(`  Normalizing to: ${targetWidth}x${targetHeight}`);

  // Resize and convert both images to RGBA PNG buffers
  const [buffer1, buffer2] = await Promise.all([
    sharp(img1Path)
      .resize(targetWidth, targetHeight, { fit: 'fill' })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true }),
    sharp(img2Path)
      .resize(targetWidth, targetHeight, { fit: 'fill' })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true }),
  ]);

  // Convert to PNG objects for pixelmatch
  const img1 = new PNG({ width: targetWidth, height: targetHeight });
  img1.data = buffer1.data;

  const img2 = new PNG({ width: targetWidth, height: targetHeight });
  img2.data = buffer2.data;

  return { img1, img2, width: targetWidth, height: targetHeight };
}

/**
 * Compare two images and generate diff
 */
export async function compareImages(
  figmaImagePath: string,
  generatedImagePath: string,
  diffImagePath: string,
  threshold = 0.1
): Promise<{
  diffPixels: number;
  totalPixels: number;
  similarity: number;
}> {
  // Normalize images to same dimensions and format
  const { img1, img2, width, height } = await normalizeImages(
    figmaImagePath,
    generatedImagePath
  );

  // Create diff image
  const diff = new PNG({ width, height });

  // Compare pixels
  const diffPixels = pixelmatch(
    img1.data,
    img2.data,
    diff.data,
    width,
    height,
    { threshold }
  );

  // Save diff image
  writeFileSync(diffImagePath, PNG.sync.write(diff));

  const totalPixels = width * height;
  const similarity = ((totalPixels - diffPixels) / totalPixels) * 100;

  return {
    diffPixels,
    totalPixels,
    similarity,
  };
}

/**
 * Validate a generated component against Figma export
 */
export async function validateComponent(
  exportId: string,
  componentUrl: string,
  figmaImagePath: string,
  options: ValidationOptions = {}
): Promise<ValidationResult> {
  const {
    threshold = 0.1,
    targetSimilarity = 90,
    outputDir = './validation-results',
    viewport,
  } = options;

  try {
    // Create output directory if it doesn't exist
    const fs = await import('fs/promises');
    await fs.mkdir(outputDir, { recursive: true });

    // Paths for generated screenshot and diff
    const generatedScreenshotPath = join(outputDir, `${exportId}-generated.png`);
    const diffImagePath = join(outputDir, `${exportId}-diff.png`);

    // Capture screenshot of generated component
    console.log(`Capturing screenshot for ${exportId}...`);
    await captureComponentScreenshot(componentUrl, generatedScreenshotPath, viewport);

    // Compare images
    console.log(`Comparing images for ${exportId}...`);
    const { diffPixels, totalPixels, similarity } = await compareImages(
      figmaImagePath,
      generatedScreenshotPath,
      diffImagePath,
      threshold
    );

    console.log(`Validation results for ${exportId}:`);
    console.log(`  Similarity: ${similarity.toFixed(2)}%`);
    console.log(`  Diff pixels: ${diffPixels} / ${totalPixels}`);

    return {
      status: similarity >= targetSimilarity ? 'passed' : 'failed',
      similarity: Math.round(similarity * 100) / 100,
      diffPixels,
      totalPixels,
      diffImagePath: `/validation-results/${exportId}-diff.png`,
    };
  } catch (error) {
    console.error(`Validation error for ${exportId}:`, error);
    return {
      status: 'error',
      similarity: 0,
      diffPixels: 0,
      totalPixels: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Batch validate multiple exports
 */
export async function batchValidate(
  exports: Array<{
    id: string;
    componentUrl: string;
    figmaImagePath: string;
  }>,
  options: ValidationOptions = {}
): Promise<Map<string, ValidationResult>> {
  const results = new Map<string, ValidationResult>();

  for (const exp of exports) {
    console.log(`\nValidating: ${exp.id}`);
    const result = await validateComponent(
      exp.id,
      exp.componentUrl,
      exp.figmaImagePath,
      options
    );
    results.set(exp.id, result);
  }

  return results;
}
