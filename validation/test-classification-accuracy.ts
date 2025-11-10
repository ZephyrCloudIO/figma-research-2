/**
 * Classification Accuracy Test Suite
 *
 * Tests improved ComponentClassifier on Phase 4 data and additional test cases
 * to validate >90% accuracy target.
 */

import { ComponentClassifier, FigmaNode } from './enhanced-figma-parser.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// TEST DATA
// ============================================================================

interface TestCase {
  name: string;
  expectedType: string;
  node: Partial<FigmaNode>;
  description: string;
}

const testCases: TestCase[] = [
  // Phase 4 Button Variants (22 cases that failed before)
  {
    name: "Variant=Default, State=Default, Size=default",
    expectedType: "Button",
    node: {
      name: "Variant=Default, State=Default, Size=default",
      type: "COMPONENT",
      size: { x: 120, y: 40 },
      fills: [{ visible: true, type: "SOLID", color: { r: 0, g: 0, b: 0, a: 1 }, opacity: 1 }],
      cornerRadius: 6
    },
    description: "Default button variant"
  },
  {
    name: "Variant=Default, State=Focus, Size=default",
    expectedType: "Button",
    node: {
      name: "Variant=Default, State=Focus, Size=default",
      type: "COMPONENT",
      size: { x: 120, y: 40 }
    },
    description: "Button with focus state"
  },
  {
    name: "Variant=Default, State=Hover, Size=default",
    expectedType: "Button",
    node: {
      name: "Variant=Default, State=Hover, Size=default",
      type: "COMPONENT",
      size: { x: 120, y: 40 }
    },
    description: "Button with hover state"
  },
  {
    name: "Variant=Default, State=Disabled, Size=default",
    expectedType: "Button",
    node: {
      name: "Variant=Default, State=Disabled, Size=default",
      type: "COMPONENT",
      size: { x: 120, y: 40 }
    },
    description: "Disabled button variant"
  },
  {
    name: "Variant=Default, State=Loading, Size=default",
    expectedType: "Button",
    node: {
      name: "Variant=Default, State=Loading, Size=default",
      type: "COMPONENT",
      size: { x: 120, y: 40 }
    },
    description: "Loading button state"
  },
  {
    name: "Variant=Secondary, State=Default, Size=default",
    expectedType: "Button",
    node: {
      name: "Variant=Secondary, State=Default, Size=default",
      type: "COMPONENT",
      size: { x: 120, y: 40 }
    },
    description: "Secondary button variant"
  },
  {
    name: "Variant=Secondary, State=Focus, Size=default",
    expectedType: "Button",
    node: {
      name: "Variant=Secondary, State=Focus, Size=default",
      type: "COMPONENT",
      size: { x: 120, y: 40 }
    },
    description: "Secondary button with focus"
  },
  {
    name: "Variant=Secondary, State=Hover, Size=default",
    expectedType: "Button",
    node: {
      name: "Variant=Secondary, State=Hover, Size=default",
      type: "COMPONENT",
      size: { x: 120, y: 40 }
    },
    description: "Secondary button with hover"
  },
  {
    name: "Variant=Secondary, State=Disabled, Size=default",
    expectedType: "Button",
    node: {
      name: "Variant=Secondary, State=Disabled, Size=default",
      type: "COMPONENT",
      size: { x: 120, y: 40 }
    },
    description: "Disabled secondary button"
  },
  {
    name: "Variant=Secondary, State=Loading, Size=default",
    expectedType: "Button",
    node: {
      name: "Variant=Secondary, State=Loading, Size=default",
      type: "COMPONENT",
      size: { x: 120, y: 40 }
    },
    description: "Loading secondary button"
  },
  {
    name: "Variant=Default, State=Default, Size=lg",
    expectedType: "Button",
    node: {
      name: "Variant=Default, State=Default, Size=lg",
      type: "COMPONENT",
      size: { x: 160, y: 48 }
    },
    description: "Large button variant"
  },
  {
    name: "Variant=Default, State=Focus, Size=lg",
    expectedType: "Button",
    node: {
      name: "Variant=Default, State=Focus, Size=lg",
      type: "COMPONENT",
      size: { x: 160, y: 48 }
    },
    description: "Large button with focus"
  },
  {
    name: "Variant=Default, State=Hover, Size=lg",
    expectedType: "Button",
    node: {
      name: "Variant=Default, State=Hover, Size=lg",
      type: "COMPONENT",
      size: { x: 160, y: 48 }
    },
    description: "Large button with hover"
  },
  {
    name: "Variant=Default, State=Disabled, Size=lg",
    expectedType: "Button",
    node: {
      name: "Variant=Default, State=Disabled, Size=lg",
      type: "COMPONENT",
      size: { x: 160, y: 48 }
    },
    description: "Disabled large button"
  },
  {
    name: "Variant=Default, State=Loading, Size=lg",
    expectedType: "Button",
    node: {
      name: "Variant=Default, State=Loading, Size=lg",
      type: "COMPONENT",
      size: { x: 160, y: 48 }
    },
    description: "Loading large button"
  },
  {
    name: "Variant=Default, State=Default, Size=sm",
    expectedType: "Button",
    node: {
      name: "Variant=Default, State=Default, Size=sm",
      type: "COMPONENT",
      size: { x: 80, y: 32 }
    },
    description: "Small button variant"
  },
  {
    name: "Variant=Default, State=Focus, Size=sm",
    expectedType: "Button",
    node: {
      name: "Variant=Default, State=Focus, Size=sm",
      type: "COMPONENT",
      size: { x: 80, y: 32 }
    },
    description: "Small button with focus"
  },
  {
    name: "Variant=Default, State=Hover, Size=sm",
    expectedType: "Button",
    node: {
      name: "Variant=Default, State=Hover, Size=sm",
      type: "COMPONENT",
      size: { x: 80, y: 32 }
    },
    description: "Small button with hover"
  },
  {
    name: "Variant=Default, State=Disabled, Size=sm",
    expectedType: "Button",
    node: {
      name: "Variant=Default, State=Disabled, Size=sm",
      type: "COMPONENT",
      size: { x: 80, y: 32 }
    },
    description: "Disabled small button"
  },
  {
    name: "Variant=Default, State=Loading, Size=sm",
    expectedType: "Button",
    node: {
      name: "Variant=Default, State=Loading, Size=sm",
      type: "COMPONENT",
      size: { x: 80, y: 32 }
    },
    description: "Loading small button"
  },
  {
    name: "Variant=Secondary, State=Default, Size=lg",
    expectedType: "Button",
    node: {
      name: "Variant=Secondary, State=Default, Size=lg",
      type: "COMPONENT",
      size: { x: 160, y: 48 }
    },
    description: "Large secondary button"
  },
  {
    name: "Variant=Secondary, State=Focus, Size=lg",
    expectedType: "Button",
    node: {
      name: "Variant=Secondary, State=Focus, Size=lg",
      type: "COMPONENT",
      size: { x: 160, y: 48 }
    },
    description: "Large secondary button with focus"
  },

  // Phase 4 Icon Variants (8 cases that worked before)
  {
    name: "Variant=Default, State=Default, Size=icon",
    expectedType: "Icon",
    node: {
      name: "Variant=Default, State=Default, Size=icon",
      type: "COMPONENT",
      size: { x: 24, y: 24 }
    },
    description: "Icon button variant"
  },
  {
    name: "Variant=Default, State=Focus, Size=icon",
    expectedType: "Icon",
    node: {
      name: "Variant=Default, State=Focus, Size=icon",
      type: "COMPONENT",
      size: { x: 24, y: 24 }
    },
    description: "Icon button with focus"
  },
  {
    name: "Variant=Default, State=Hover, Size=icon",
    expectedType: "Icon",
    node: {
      name: "Variant=Default, State=Hover, Size=icon",
      type: "COMPONENT",
      size: { x: 24, y: 24 }
    },
    description: "Icon button with hover"
  },
  {
    name: "Variant=Default, State=Disabled, Size=icon",
    expectedType: "Icon",
    node: {
      name: "Variant=Default, State=Disabled, Size=icon",
      type: "COMPONENT",
      size: { x: 24, y: 24 }
    },
    description: "Disabled icon button"
  },
  {
    name: "Variant=Secondary, State=Default, Size=icon",
    expectedType: "Icon",
    node: {
      name: "Variant=Secondary, State=Default, Size=icon",
      type: "COMPONENT",
      size: { x: 24, y: 24 }
    },
    description: "Secondary icon button"
  },
  {
    name: "Variant=Secondary, State=Focus, Size=icon",
    expectedType: "Icon",
    node: {
      name: "Variant=Secondary, State=Focus, Size=icon",
      type: "COMPONENT",
      size: { x: 24, y: 24 }
    },
    description: "Secondary icon with focus"
  },
  {
    name: "Variant=Secondary, State=Hover, Size=icon",
    expectedType: "Icon",
    node: {
      name: "Variant=Secondary, State=Hover, Size=icon",
      type: "COMPONENT",
      size: { x: 24, y: 24 }
    },
    description: "Secondary icon with hover"
  },
  {
    name: "Variant=Secondary, State=Disabled, Size=icon",
    expectedType: "Icon",
    node: {
      name: "Variant=Secondary, State=Disabled, Size=icon",
      type: "COMPONENT",
      size: { x: 24, y: 24 }
    },
    description: "Disabled secondary icon"
  },

  // Additional test cases for diverse component types
  {
    name: "Button Primary",
    expectedType: "Button",
    node: {
      name: "Button Primary",
      type: "COMPONENT",
      size: { x: 120, y: 40 },
      fills: [{ visible: true, type: "SOLID", color: { r: 0.2, g: 0.4, b: 1, a: 1 }, opacity: 1 }],
      cornerRadius: 8
    },
    description: "Explicit button with name"
  },
  {
    name: "Primary Action Button",
    expectedType: "Button",
    node: {
      name: "Primary Action Button",
      type: "COMPONENT",
      size: { x: 140, y: 44 }
    },
    description: "Button with 'button' in name"
  },
  {
    name: "Card Container",
    expectedType: "Card",
    node: {
      name: "Card Container",
      type: "FRAME",
      size: { x: 320, y: 240 },
      effects: [{ type: "DROP_SHADOW", visible: true, radius: 8 }],
      children: [
        { type: "TEXT", name: "Title" } as any,
        { type: "TEXT", name: "Description" } as any,
        { type: "FRAME", name: "Actions" } as any
      ]
    },
    description: "Card with shadow and multiple children"
  },
  {
    name: "Input Field",
    expectedType: "Input",
    node: {
      name: "Input Field",
      type: "FRAME",
      size: { x: 300, y: 40 },
      strokes: [{ visible: true, type: "SOLID", color: { r: 0.8, g: 0.8, b: 0.8, a: 1 }, opacity: 1 }],
      children: [{ type: "TEXT", name: "Placeholder" } as any]
    },
    description: "Input with border and text"
  },
  {
    name: "Checkbox Control",
    expectedType: "Checkbox",
    node: {
      name: "Checkbox Control",
      type: "COMPONENT",
      size: { x: 20, y: 20 }
    },
    description: "Small square checkbox"
  },
  {
    name: "Radio Option",
    expectedType: "Radio",
    node: {
      name: "Radio Option",
      type: "COMPONENT",
      size: { x: 20, y: 20 },
      cornerRadius: 10
    },
    description: "Circular radio button"
  },
  {
    name: "Toggle Switch",
    expectedType: "Switch",
    node: {
      name: "Toggle Switch",
      type: "COMPONENT",
      size: { x: 44, y: 24 },
      cornerRadius: 12
    },
    description: "Pill-shaped switch"
  },
  {
    name: "Badge Status",
    expectedType: "Badge",
    node: {
      name: "Badge Status",
      type: "COMPONENT",
      size: { x: 60, y: 24 },
      cornerRadius: 12,
      children: [{ type: "TEXT", name: "Active" } as any]
    },
    description: "Small rounded badge with text"
  },
  {
    name: "Avatar Profile",
    expectedType: "Avatar",
    node: {
      name: "Avatar Profile",
      type: "COMPONENT",
      size: { x: 48, y: 48 },
      cornerRadius: 24
    },
    description: "Circular avatar"
  },
  {
    name: "Icon Search",
    expectedType: "Icon",
    node: {
      name: "Icon Search",
      type: "VECTOR",
      size: { x: 24, y: 24 }
    },
    description: "Small vector icon"
  },
  {
    name: "Dialog Modal",
    expectedType: "Dialog",
    node: {
      name: "Dialog Modal",
      type: "FRAME",
      size: { x: 480, y: 320 },
      effects: [{ type: "DROP_SHADOW", visible: true, radius: 16 }],
      children: [
        { type: "TEXT", name: "Title" } as any,
        { type: "TEXT", name: "Message" } as any,
        { type: "FRAME", name: "Actions" } as any,
        { type: "COMPONENT", name: "Close Button" } as any
      ]
    },
    description: "Large modal with shadow and sections"
  },
  {
    name: "Dropdown Select",
    expectedType: "Select",
    node: {
      name: "Dropdown Select",
      type: "COMPONENT",
      size: { x: 200, y: 40 },
      children: [
        { type: "TEXT", name: "Selected Value" } as any,
        { type: "VECTOR", name: "chevron-down" } as any
      ]
    },
    description: "Select with text and chevron"
  },

  // Edge cases and potential false positives
  {
    name: "Frame Container",
    expectedType: "Container",
    node: {
      name: "Frame Container",
      type: "FRAME",
      size: { x: 400, y: 300 }
    },
    description: "Generic container"
  },
  {
    name: "Text Label",
    expectedType: "Text",
    node: {
      name: "Text Label",
      type: "TEXT",
      fontSize: 14
    },
    description: "Text node"
  },
  {
    name: "Image Thumbnail",
    expectedType: "Image",
    node: {
      name: "Image Thumbnail",
      type: "FRAME",
      fills: [{ type: "IMAGE", visible: true }]
    },
    description: "Frame with image fill"
  },
  {
    name: "Primary Badge",
    expectedType: "Badge",
    node: {
      name: "Primary Badge",
      type: "COMPONENT",
      size: { x: 70, y: 28 },
      cornerRadius: 4
    },
    description: "Badge with primary keyword (should not be button)"
  },
  {
    name: "Destructive Alert",
    expectedType: "Container",
    node: {
      name: "Destructive Alert",
      type: "FRAME",
      size: { x: 400, y: 100 }
    },
    description: "Large alert (should not be button despite 'destructive')"
  }
];

// ============================================================================
// TEST RUNNER
// ============================================================================

interface TestResult {
  name: string;
  expected: string;
  actual: string;
  confidence: number;
  reasons: string[];
  correct: boolean;
  description: string;
}

function runClassificationTests(): TestResult[] {
  const results: TestResult[] = [];

  for (const testCase of testCases) {
    const classification = ComponentClassifier.classify(testCase.node as FigmaNode);

    results.push({
      name: testCase.name,
      expected: testCase.expectedType,
      actual: classification.type,
      confidence: classification.confidence,
      reasons: classification.reasons,
      correct: classification.type === testCase.expectedType,
      description: testCase.description
    });
  }

  return results;
}

function generateReport(results: TestResult[]): void {
  const totalTests = results.length;
  const correctTests = results.filter(r => r.correct).length;
  const accuracy = (correctTests / totalTests) * 100;

  // Group by expected type
  const byType: Record<string, { correct: number; total: number; avgConfidence: number }> = {};

  for (const result of results) {
    if (!byType[result.expected]) {
      byType[result.expected] = { correct: 0, total: 0, avgConfidence: 0 };
    }
    byType[result.expected].total++;
    byType[result.expected].avgConfidence += result.confidence;
    if (result.correct) {
      byType[result.expected].correct++;
    }
  }

  for (const type in byType) {
    byType[type].avgConfidence /= byType[type].total;
  }

  // Confusion matrix
  const confusionMatrix: Record<string, Record<string, number>> = {};
  for (const result of results) {
    if (!confusionMatrix[result.expected]) {
      confusionMatrix[result.expected] = {};
    }
    if (!confusionMatrix[result.expected][result.actual]) {
      confusionMatrix[result.expected][result.actual] = 0;
    }
    confusionMatrix[result.expected][result.actual]++;
  }

  // Generate report
  const report = {
    summary: {
      totalTests,
      correctTests,
      incorrectTests: totalTests - correctTests,
      accuracy: accuracy.toFixed(2) + '%',
      averageConfidence: (results.reduce((sum, r) => sum + r.confidence, 0) / totalTests).toFixed(3),
      passedTarget: accuracy >= 90
    },
    byComponentType: byType,
    confusionMatrix,
    failures: results.filter(r => !r.correct).map(r => ({
      name: r.name,
      expected: r.expected,
      actual: r.actual,
      confidence: r.confidence,
      reasons: r.reasons,
      description: r.description
    })),
    allResults: results
  };

  // Save to file (navigate up from dist if needed)
  const baseDir = __dirname.includes('/dist') ? path.join(__dirname, '..') : __dirname;
  const reportPath = path.join(baseDir, 'reports', 'classification-accuracy-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Generate markdown summary
  const markdown = generateMarkdownReport(report);
  const mdPath = path.join(baseDir, 'reports', 'classification-accuracy-report.md');
  fs.writeFileSync(mdPath, markdown);

  console.log('\n' + '='.repeat(80));
  console.log('CLASSIFICATION ACCURACY TEST RESULTS');
  console.log('='.repeat(80));
  console.log(`\nTotal Tests: ${totalTests}`);
  console.log(`Correct: ${correctTests}`);
  console.log(`Incorrect: ${totalTests - correctTests}`);
  console.log(`Accuracy: ${accuracy.toFixed(2)}% ${accuracy >= 90 ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`Average Confidence: ${report.summary.averageConfidence}`);
  console.log(`\nTarget: ≥90% accuracy`);
  console.log(`Status: ${report.summary.passedTarget ? '✓ TARGET MET' : '✗ TARGET NOT MET'}`);

  console.log('\n' + '-'.repeat(80));
  console.log('ACCURACY BY COMPONENT TYPE');
  console.log('-'.repeat(80));
  for (const [type, stats] of Object.entries(byType)) {
    const typeAccuracy = (stats.correct / stats.total) * 100;
    console.log(`${type.padEnd(15)} ${stats.correct}/${stats.total} (${typeAccuracy.toFixed(1)}%) - Avg Confidence: ${stats.avgConfidence.toFixed(3)}`);
  }

  if (report.failures.length > 0) {
    console.log('\n' + '-'.repeat(80));
    console.log('FAILURES');
    console.log('-'.repeat(80));
    for (const failure of report.failures) {
      console.log(`\n✗ ${failure.name}`);
      console.log(`  Expected: ${failure.expected}`);
      console.log(`  Got: ${failure.actual} (confidence: ${failure.confidence.toFixed(3)})`);
      console.log(`  Reasons: ${failure.reasons.join(', ')}`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`Full report saved to:`);
  console.log(`  JSON: ${reportPath}`);
  console.log(`  Markdown: ${mdPath}`);
  console.log('='.repeat(80) + '\n');
}

function generateMarkdownReport(report: any): string {
  let md = `# Classification Accuracy Test Report\n\n`;
  md += `**Date:** ${new Date().toISOString().split('T')[0]}\n`;
  md += `**Task:** Phase 5 Classification Improvements (task-14.16)\n\n`;
  md += `---\n\n`;

  md += `## Executive Summary\n\n`;
  md += `- **Total Tests:** ${report.summary.totalTests}\n`;
  md += `- **Correct:** ${report.summary.correctTests}\n`;
  md += `- **Incorrect:** ${report.summary.incorrectTests}\n`;
  md += `- **Accuracy:** ${report.summary.accuracy} ${report.summary.passedTarget ? '✓ TARGET MET' : '✗ BELOW TARGET'}\n`;
  md += `- **Average Confidence:** ${report.summary.averageConfidence}\n`;
  md += `- **Target:** ≥90% accuracy\n`;
  md += `- **Status:** ${report.summary.passedTarget ? '**PASS** ✓' : '**NEEDS IMPROVEMENT** ✗'}\n\n`;

  md += `---\n\n`;
  md += `## Accuracy by Component Type\n\n`;
  md += `| Component Type | Correct | Total | Accuracy | Avg Confidence |\n`;
  md += `|----------------|---------|-------|----------|----------------|\n`;

  for (const [type, stats] of Object.entries(report.byComponentType) as [string, any][]) {
    const accuracy = ((stats.correct / stats.total) * 100).toFixed(1);
    md += `| ${type} | ${stats.correct} | ${stats.total} | ${accuracy}% | ${stats.avgConfidence.toFixed(3)} |\n`;
  }

  md += `\n---\n\n`;
  md += `## Confusion Matrix\n\n`;
  md += `Shows what types were predicted for each expected type:\n\n`;

  for (const [expected, predictions] of Object.entries(report.confusionMatrix) as [string, any][]) {
    md += `### Expected: ${expected}\n`;
    for (const [predicted, count] of Object.entries(predictions) as [string, number][]) {
      const marker = predicted === expected ? '✓' : '✗';
      md += `- ${marker} Predicted as ${predicted}: ${count}\n`;
    }
    md += `\n`;
  }

  if (report.failures.length > 0) {
    md += `---\n\n`;
    md += `## Failures (${report.failures.length})\n\n`;

    for (const failure of report.failures) {
      md += `### ✗ ${failure.name}\n\n`;
      md += `- **Expected:** ${failure.expected}\n`;
      md += `- **Got:** ${failure.actual}\n`;
      md += `- **Confidence:** ${failure.confidence.toFixed(3)}\n`;
      md += `- **Description:** ${failure.description}\n`;
      md += `- **Reasons:**\n`;
      for (const reason of failure.reasons) {
        md += `  - ${reason}\n`;
      }
      md += `\n`;
    }
  } else {
    md += `---\n\n`;
    md += `## Failures\n\n`;
    md += `✓ No failures! All tests passed.\n\n`;
  }

  md += `---\n\n`;
  md += `## Improvements Implemented\n\n`;
  md += `1. **Variant Pattern Detection** - Recognizes \`Variant=\`, \`State=\`, \`Size=\` patterns\n`;
  md += `2. **Interactive State Detection** - Identifies hover/focus/disabled/loading states\n`;
  md += `3. **Button Variant Keywords** - Detects primary/secondary/destructive/outline/ghost\n`;
  md += `4. **Lowered Classification Threshold** - From 0.5 to 0.4 confidence\n`;
  md += `5. **Enhanced Confidence Scoring** - Multi-signal approach with cumulative scoring\n\n`;

  return md;
}

// ============================================================================
// MAIN
// ============================================================================

console.log('Running classification accuracy tests...\n');
const results = runClassificationTests();
generateReport(results);
