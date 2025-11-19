/**
 * Figma Data Summarizer
 *
 * Intelligently reduces large Figma JSON data for prompt inclusion
 * while preserving all essential information for code generation.
 *
 * Strategy:
 * - Extract color palette (deduplicated)
 * - Extract typography styles (deduplicated)
 * - Simplify component hierarchy
 * - Preserve layout structure
 * - Remove redundant repeated instances
 */

export interface SummarizedFigmaData {
  name: string;
  type: string;
  dimensions: { width: number; height: number };
  colors: Set<string>;
  typography: Array<{ family: string; size: number; weight: number }>;
  layout: {
    mode?: string;
    direction?: string;
    gap?: number;
    padding?: { top: number; right: number; bottom: number; left: number };
  };
  structure: any;
  originalSize: number;
  summarizedSize: number;
}

/**
 * Summarize Figma data for prompt inclusion
 */
export function summarizeFigmaData(parsed: any, maxDepth: number = 3): SummarizedFigmaData {
  const colors = new Set<string>();
  const typography: Array<{ family: string; size: number; weight: number }> = [];
  const typographySet = new Set<string>();

  // Extract colors and typography
  function extractStyles(node: any, depth: number = 0) {
    if (depth > 15) return; // Prevent infinite recursion

    // Extract fills/colors
    if (node.fills) {
      node.fills.forEach((fill: any) => {
        if (fill.color) {
          colors.add(fill.color);
        }
      });
    }

    // Extract text styles
    if (node.fontSize && node.fontName) {
      const key = `${node.fontName.family || 'default'}-${node.fontSize}-${node.fontWeight || 400}`;
      if (!typographySet.has(key)) {
        typographySet.add(key);
        typography.push({
          family: node.fontName.family || 'default',
          size: node.fontSize,
          weight: node.fontWeight || 400,
        });
      }
    }

    // Recurse
    if (node.children) {
      node.children.forEach((child: any) => extractStyles(child, depth + 1));
    }
  }

  extractStyles(parsed);

  // Build simplified structure (limit depth to avoid huge trees)
  function simplifyStructure(node: any, depth: number = 0): any {
    if (depth >= maxDepth) {
      return {
        type: node.type,
        name: node.name,
        childCount: node.children?.length || 0,
        truncated: true,
      };
    }

    const simplified: any = {
      type: node.type,
      name: node.name,
    };

    // Include essential layout properties
    if (node.size) {
      simplified.size = node.size;
    }

    if (node.layoutMode) {
      simplified.layout = {
        mode: node.layoutMode,
        gap: node.itemSpacing,
        padding: {
          top: node.paddingTop || 0,
          right: node.paddingRight || 0,
          bottom: node.paddingBottom || 0,
          left: node.paddingLeft || 0,
        },
      };
    }

    // Include fills (but just type and color, not full object)
    if (node.fills && node.fills.length > 0) {
      simplified.fill = node.fills[0].color || node.fills[0].type;
    }

    // Include text content
    if (node.characters) {
      simplified.text = node.characters.substring(0, 100); // Limit text length
    }

    // Simplify children (deduplicate identical siblings)
    if (node.children && node.children.length > 0) {
      // Group children by type and name
      const childGroups = new Map<string, any[]>();
      node.children.forEach((child: any) => {
        const key = `${child.type}-${child.name}`;
        if (!childGroups.has(key)) {
          childGroups.set(key, []);
        }
        childGroups.get(key)!.push(child);
      });

      // For each group, include first instance + count
      simplified.children = Array.from(childGroups.entries()).map(([key, instances]) => {
        if (instances.length === 1) {
          return simplifyStructure(instances[0], depth + 1);
        } else {
          // Multiple instances - include first + count
          return {
            ...simplifyStructure(instances[0], depth + 1),
            instanceCount: instances.length,
            note: `Repeated ${instances.length} times`,
          };
        }
      });
    }

    return simplified;
  }

  const structure = simplifyStructure(parsed);

  // Calculate sizes
  const originalStr = JSON.stringify(parsed);
  const summarizedStr = JSON.stringify({
    name: parsed.name,
    type: parsed.type,
    dimensions: parsed.size || { width: 0, height: 0 },
    colors: Array.from(colors),
    typography,
    layout: {
      mode: parsed.layoutMode,
      direction: parsed.primaryAxisSizingMode,
      gap: parsed.itemSpacing,
      padding: {
        top: parsed.paddingTop || 0,
        right: parsed.paddingRight || 0,
        bottom: parsed.paddingBottom || 0,
        left: parsed.paddingLeft || 0,
      },
    },
    structure,
  });

  return {
    name: parsed.name,
    type: parsed.type,
    dimensions: parsed.size || { width: 0, height: 0 },
    colors,
    typography,
    layout: {
      mode: parsed.layoutMode,
      direction: parsed.primaryAxisSizingMode,
      gap: parsed.itemSpacing,
      padding: {
        top: parsed.paddingTop || 0,
        right: parsed.paddingRight || 0,
        bottom: parsed.paddingBottom || 0,
        left: parsed.paddingLeft || 0,
      },
    },
    structure,
    originalSize: originalStr.length,
    summarizedSize: summarizedStr.length,
  };
}

/**
 * Format summarized data for prompt inclusion
 */
export function formatSummaryForPrompt(summary: SummarizedFigmaData): string {
  const colorsList = Array.from(summary.colors).slice(0, 20).join(', ');
  const typographyList = summary.typography.slice(0, 10).map(t =>
    `${t.family} ${t.size}px weight ${t.weight}`
  ).join(', ');

  return `
## Component Overview
- Name: ${summary.name}
- Type: ${summary.type}
- Dimensions: ${summary.dimensions.width}×${summary.dimensions.height}px
- Data reduction: ${((1 - summary.summarizedSize / summary.originalSize) * 100).toFixed(0)}% smaller

## Color Palette
${colorsList}${summary.colors.size > 20 ? ` (${summary.colors.size - 20} more...)` : ''}

## Typography Styles
${typographyList}${summary.typography.length > 10 ? ` (${summary.typography.length - 10} more...)` : ''}

## Layout
- Mode: ${summary.layout.mode || 'none'}
- Direction: ${summary.layout.direction || 'auto'}
- Gap: ${summary.layout.gap || 0}px
- Padding: ${summary.layout.padding?.top || 0}/${summary.layout.padding?.right || 0}/${summary.layout.padding?.bottom || 0}/${summary.layout.padding?.left || 0}

## Simplified Structure
\`\`\`json
${JSON.stringify(summary.structure, null, 2)}
\`\`\`
`;
}
