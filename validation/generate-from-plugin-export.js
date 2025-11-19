/**
 * Generate React Component from Plugin JSON Export
 *
 * Standalone script that generates React/TypeScript code from the
 * Zephyr Figma plugin JSON export without requiring the full pipeline
 * or database dependencies.
 *
 * Usage:
 *   node generate-from-plugin-export.js <input.json> <output-dir>
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { extractAllButtons } from './extract-button-properties.js';
import { extractCompleteStructure } from './extract-complete-structure.js';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

/**
 * Code Generator with proper component property extraction
 */
class SimpleCodeGenerator {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  /**
   * Generate React/TypeScript code from plugin export data
   */
  async generate(pluginData) {
    const component = this.extractComponentData(pluginData);

    // Extract structured component properties
    const componentProps = this.extractComponentProperties(pluginData);

    const prompt = this.createPrompt(component, componentProps);

    console.log('Generating React component with Claude Sonnet 4.5...');
    console.log('Component properties detected:');
    console.log(JSON.stringify(componentProps, null, 2));
    console.log();

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/figma-research',
        'X-Title': 'Figma to Code Pipeline'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4.5',
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.2,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Code generation failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const code = data.choices[0].message.content;

    // Calculate cost
    const inputTokens = data.usage?.prompt_tokens || 0;
    const outputTokens = data.usage?.completion_tokens || 0;
    const cost = (inputTokens / 1000000 * 3) + (outputTokens / 1000000 * 15);

    return {
      code,
      language: 'typescript',
      framework: 'react',
      componentName: component.name,
      componentProperties: componentProps,
      prompt,
      modelName: 'anthropic/claude-sonnet-4.5',
      tokensUsed: inputTokens + outputTokens,
      cost
    };
  }

  /**
   * Extract structured component properties based on component type
   */
  extractComponentProperties(pluginData) {
    const node = pluginData.node || pluginData;
    const componentName = node.name.toLowerCase();

    // Detect component type
    if (componentName.includes('button')) {
      // Extract complete page structure
      const structure = extractCompleteStructure(pluginData);

      // Also extract all buttons for backwards compatibility
      const buttons = extractAllButtons(pluginData);

      // Group buttons by variant for summary
      const buttonsByVariant = this.groupButtonsByVariant(buttons);

      return {
        type: 'Button',
        structure: structure,
        buttons: buttons,
        summary: {
          total: buttons.length,
          byVariant: buttonsByVariant,
          uniqueIcons: this.getUniqueIcons(buttons)
        }
      };
    }

    // Default: generic component
    return {
      type: 'Generic',
      componentCount: this.countComponents(node)
    };
  }

  /**
   * Group buttons by variant for analysis
   */
  groupButtonsByVariant(buttons) {
    const groups = {};
    for (const button of buttons) {
      const variant = button.variant;
      if (!groups[variant]) {
        groups[variant] = [];
      }
      groups[variant].push(button);
    }
    return groups;
  }

  /**
   * Get unique icons used across all buttons
   */
  getUniqueIcons(buttons) {
    const icons = new Set();
    for (const button of buttons) {
      if (button.leftIcon) icons.add(button.leftIcon);
      if (button.rightIcon) icons.add(button.rightIcon);
    }
    return Array.from(icons).filter(Boolean);
  }

  /**
   * Count component instances in tree
   */
  countComponents(node) {
    let count = 0;
    if (node.type === 'INSTANCE') count++;
    if (node.children) {
      for (const child of node.children) {
        count += this.countComponents(child);
      }
    }
    return count;
  }

  /**
   * Extract relevant component data from plugin export
   */
  extractComponentData(pluginData) {
    const node = pluginData.node || pluginData;

    return {
      name: node.name,
      type: node.type,
      width: node.width || 0,
      height: node.height || 0,
      children: node.children || [],
      fills: node.fills || [],
      strokes: node.strokes || [],
      effects: node.effects || [],
      constraints: node.constraints || {},
      layoutMode: node.layoutMode,
      primaryAxisSizingMode: node.primaryAxisSizingMode,
      counterAxisSizingMode: node.counterAxisSizingMode,
      primaryAxisAlignItems: node.primaryAxisAlignItems,
      counterAxisAlignItems: node.counterAxisAlignItems,
      paddingLeft: node.paddingLeft,
      paddingRight: node.paddingRight,
      paddingTop: node.paddingTop,
      paddingBottom: node.paddingBottom,
      itemSpacing: node.itemSpacing,
      cornerRadius: node.cornerRadius,
      metadata: pluginData.metadata || {},
      rawNode: node
    };
  }

  /**
   * Create code generation prompt with structured component properties
   */
  createPrompt(component, componentProps) {
    if (componentProps.type === 'Button') {
      return this.createButtonPrompt(component, componentProps);
    }

    // Fallback to generic prompt
    return this.createGenericPrompt(component);
  }

  /**
   * Create button-specific prompt with all variants and proper ShadCN usage
   */
  createButtonPrompt(component, componentProps) {
    const { structure, buttons, summary } = componentProps;

    // Get unique icons for imports
    const icons = summary.uniqueIcons;
    const iconImports = icons.length > 0
      ? `import { ${icons.join(', ')} } from 'lucide-react';`
      : '';

    // Create examples of each button configuration
    const buttonExamples = buttons.slice(0, 10).map(btn => {
      const iconBefore = btn.leftIcon ? `<${btn.leftIcon} className="mr-2 h-4 w-4" />` : '';
      const iconAfter = btn.rightIcon ? `<${btn.rightIcon} className="ml-2 h-4 w-4" />` : '';

      return `<Button variant="${btn.variant}" size="${btn.size}">
  ${iconBefore}${btn.text}${iconAfter}
</Button>`;
    }).join('\n');

    // Detailed button specifications
    const buttonSpecs = buttons.map((btn, idx) => {
      return `Button ${idx + 1}:
  - Text: "${btn.text}"
  - Variant: ${btn.variant}
  - Size: ${btn.size}
  - State: ${btn.state}${btn.leftIcon ? `\n  - Left Icon: ${btn.leftIcon}` : ''}${btn.rightIcon ? `\n  - Right Icon: ${btn.rightIcon}` : ''}`;
    }).join('\n\n');

    // Extract structure info
    const header = structure.sections?.find(s => s.type === 'Header');
    const playground = structure.sections?.find(s => s.type === 'Playground');
    const footer = structure.sections?.find(s => s.type === 'Footer');

    return `You are an expert React + TypeScript + ShadCN + Tailwind CSS developer. Generate a complete button documentation component that matches this Figma design EXACTLY.

# Component: ${component.name}

# Page Structure (MUST INCLUDE ALL SECTIONS)

## 1. Header Section
${header ? `- Title: "${header.title}"
- Tagline: "${header.tagline}"
- Description: "${header.description}"
${header.links?.length > 0 ? `- Links: ${header.links.map(l => l.text).join(', ')}` : ''}` : 'No header found'}

## 2. Playground Section
${playground ? `- Section Title: "${playground.title}"
- Theme Sections: Light and Dark
- Total Buttons: ${summary.total}` : 'No playground found'}

## 3. Footer Section
${footer ? `- Text: "${footer.text}"
${footer.links?.length > 0 ? `- Links: ${footer.links.map(l => l.text).join(', ')}` : ''}` : 'No footer found'}

# Button Analysis
Total Buttons: ${summary.total}
Variants Found: ${Object.keys(summary.byVariant).join(', ')}
Icons Used: ${icons.join(', ') || 'None'}

# Detailed Button Specifications
${buttonSpecs}

# Required Imports
\`\`\`typescript
import React from 'react';
import { Button } from '@/components/ui/button';
${iconImports}
\`\`\`

# Component Requirements

1. **Complete Page Structure**: Include ALL sections:
   - Header with title, tagline, description, and links
   - Playground section with title
   - Light/Dark theme sections with buttons
   - Footer with copyright and links

2. **Exact Replication**: Generate ALL ${summary.total} buttons exactly as specified

3. **Use ShadCN Button**: Import from '@/components/ui/button'

4. **Correct Props**: Use the EXACT variant, size, and text for each button

5. **Icon Placement**:
   - Left icons use \`className="mr-2 h-4 w-4"\`
   - Right icons use \`className="ml-2 h-4 w-4"\`

6. **Layout Structure**:
   - Header at top with title, tagline, description
   - Playground section with title
   - Light/Dark theme toggle or separate sections
   - Footer at bottom
   - Use proper spacing and containers

7. **TypeScript**: Full TypeScript with proper types

8. **Responsive**: Make it responsive and accessible

# Button Examples (showing correct syntax)
${buttonExamples}

# Output Instructions
Generate ONLY the complete TypeScript React component code.
- Include header, playground, and footer sections
- Start with imports
- No markdown code blocks
- No explanations
- Production-ready code with all ${summary.total} buttons
- Match the EXACT structure from Figma

Generate the component now:`;
  }

  /**
   * Create generic prompt for non-button components
   */
  createGenericPrompt(component) {
    const simplifiedTree = this.simplifyNodeTree(component.rawNode);

    return `You are an expert React + TypeScript + ShadCN + Tailwind CSS developer. Generate a pixel-perfect React component based on this Figma design export.

# Component Overview
Name: ${component.name}
Type: ${component.type}
Dimensions: ${component.width}x${component.height}px

# Layout Information
${component.layoutMode ? `Layout Mode: ${component.layoutMode}` : ''}
${component.itemSpacing ? `Item Spacing: ${component.itemSpacing}px` : ''}
${component.paddingTop ? `Padding: ${component.paddingTop}px ${component.paddingRight}px ${component.paddingBottom}px ${component.paddingLeft}px` : ''}
${component.cornerRadius ? `Corner Radius: ${component.cornerRadius}px` : ''}

# Simplified Node Structure
${JSON.stringify(simplifiedTree, null, 2)}

# Requirements
1. Use React + TypeScript
2. Use ShadCN components when appropriate (Button, Card, Badge, etc.)
3. Use Tailwind CSS for all styling (no inline styles)
4. Match the design as closely as possible
5. Use proper TypeScript types
6. Include prop types for customization
7. Add JSDoc comments
8. Follow React best practices
9. Make it responsive and accessible

# Output Format
Provide ONLY the complete React component code. No explanations, just the code.
Start directly with the imports, no markdown code blocks.

Generate the component now:`;
  }

  /**
   * Create a simplified, token-efficient version of the node tree
   */
  simplifyNodeTree(node, depth = 0, maxDepth = 3) {
    if (depth > maxDepth) {
      return { name: node.name, type: node.type, truncated: true };
    }

    const simplified = {
      name: node.name,
      type: node.type,
      visible: node.visible
    };

    // Add bounds
    if (node.width && node.height) {
      simplified.bounds = {
        width: Math.round(node.width),
        height: Math.round(node.height)
      };
    }

    // Add layout properties for auto layout
    if (node.layoutMode) {
      simplified.layout = {
        mode: node.layoutMode,
        spacing: node.itemSpacing,
        padding: {
          top: node.paddingTop,
          right: node.paddingRight,
          bottom: node.paddingBottom,
          left: node.paddingLeft
        }
      };
    }

    // Recursively simplify children (limit depth and count)
    if (node.children?.length > 0 && depth < maxDepth) {
      simplified.children = node.children
        .filter(child => child.visible !== false)
        .slice(0, 10)
        .map(child => this.simplifyNodeTree(child, depth + 1, maxDepth));
    }

    return simplified;
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node generate-from-plugin-export.js <input.json> <output-dir>');
    process.exit(1);
  }

  const inputPath = path.resolve(args[0]);
  const outputDir = path.resolve(args[1]);

  // Validate API key
  const apiKey = process.env.OPENROUTER;
  if (!apiKey) {
    console.error('Error: OPENROUTER environment variable required');
    console.error('Create a .env file with: OPENROUTER=your-api-key-here');
    process.exit(1);
  }

  console.log('Figma Plugin Export to React Component');
  console.log('='.repeat(80));
  console.log(`Input: ${inputPath}`);
  console.log(`Output: ${outputDir}`);
  console.log('='.repeat(80));
  console.log();

  // Read input JSON
  if (!fs.existsSync(inputPath)) {
    console.error(`Error: Input file not found: ${inputPath}`);
    process.exit(1);
  }

  console.log('Reading plugin export...');
  const pluginData = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  console.log(`✓ Loaded: ${pluginData.nodeName || pluginData.node?.name || 'Unknown'}`);
  console.log();

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`✓ Created output directory: ${outputDir}`);
  }

  // Generate code
  const generator = new SimpleCodeGenerator(apiKey);

  try {
    const startTime = Date.now();
    const result = await generator.generate(pluginData);
    const duration = Date.now() - startTime;

    console.log(`✓ Generated in ${duration}ms`);
    console.log();
    console.log('Generation Details:');
    console.log(`  Component: ${result.componentName}`);
    console.log(`  Model: ${result.modelName}`);
    console.log(`  Tokens: ${result.tokensUsed}`);
    console.log(`  Cost: $${result.cost.toFixed(6)}`);
    if (result.componentProperties?.summary) {
      console.log(`  Buttons Generated: ${result.componentProperties.summary.total}`);
      console.log(`  Variants: ${Object.keys(result.componentProperties.summary.byVariant).join(', ')}`);
      console.log(`  Icons: ${result.componentProperties.summary.uniqueIcons.join(', ') || 'None'}`);
    }
    console.log();

    // Clean component name for filename
    const cleanName = result.componentName.replace(/[^a-zA-Z0-9-]/g, '');
    const fileName = `${cleanName}.tsx`;
    const outputPath = path.join(outputDir, fileName);

    // Extract code from markdown blocks if present
    let code = result.code;
    const codeBlockMatch = code.match(/```(?:typescript|tsx|jsx)?\n([\s\S]*?)```/);
    if (codeBlockMatch) {
      code = codeBlockMatch[1].trim();
    }

    // Write component file
    fs.writeFileSync(outputPath, code, 'utf-8');
    console.log(`✓ Saved component: ${outputPath}`);
    console.log();

    // Write metadata
    const metadataPath = path.join(outputDir, `${cleanName}.metadata.json`);
    fs.writeFileSync(metadataPath, JSON.stringify({
      componentName: result.componentName,
      componentProperties: result.componentProperties,
      generatedAt: new Date().toISOString(),
      model: result.modelName,
      tokensUsed: result.tokensUsed,
      cost: result.cost,
      inputFile: inputPath,
      outputFile: outputPath
    }, null, 2), 'utf-8');
    console.log(`✓ Saved metadata: ${metadataPath}`);

    // Write prompt for debugging
    const promptPath = path.join(outputDir, `${cleanName}.prompt.txt`);
    fs.writeFileSync(promptPath, result.prompt, 'utf-8');
    console.log(`✓ Saved prompt: ${promptPath}`);

    console.log();
    console.log('='.repeat(80));
    console.log('✅ Generation complete!');
    console.log('='.repeat(80));

    // Preview code
    console.log();
    console.log('Generated Code Preview:');
    console.log('-'.repeat(80));
    console.log(code.substring(0, 1000));
    if (code.length > 1000) {
      console.log('...(truncated, see output file for complete code)');
    }

  } catch (error) {
    console.error('❌ Generation failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
