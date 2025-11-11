/**
 * Block Classification Integration Module
 *
 * Integrates block classification with existing component classification
 * and semantic mapping systems.
 */

import { FigmaNode, ComponentType, EnhancedComponent } from './enhanced-figma-parser.js';
import { BlockClassifier, BlockCategory, BlockSubType, BlockClassification } from './block-classifier.js';
import { BlockSchemaRegistry, BlockSchema } from './block-semantic-mapper.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface EnhancedBlockComponent extends EnhancedComponent {
  isBlock: boolean;
  blockClassification?: BlockClassification;
  blockSchema?: BlockSchema;
  blockChildren?: EnhancedComponent[];
}

export interface BlockAnalysisResult {
  node: FigmaNode;
  isBlock: boolean;
  blockClassification?: BlockClassification;
  blockSchema?: BlockSchema;
  componentClassifications: EnhancedComponent[];
  recommendedImplementation: string;
  codeStructure?: BlockCodeStructure;
}

export interface BlockCodeStructure {
  componentName: string;
  importStatements: string[];
  jsx: string;
  props: Record<string, any>;
  tailwindClasses: string[];
}

// ============================================================================
// INTEGRATION CLASS
// ============================================================================

export class BlockIntegration {
  /**
   * Analyze a Figma node to determine if it's a block and get full classification
   */
  static analyzeNode(node: FigmaNode): BlockAnalysisResult {
    // Try block classification first
    const blockClassification = BlockClassifier.classifyBlock(node);
    const isBlock = blockClassification !== null;

    let blockSchema: BlockSchema | undefined;
    if (blockClassification) {
      blockSchema = BlockSchemaRegistry.getSchemaByCategoryAndSubType(
        blockClassification.category,
        blockClassification.subType
      );
    }

    // Always analyze component-level structure
    const componentClassifications = this.analyzeComponents(node);

    // Generate implementation recommendation
    const recommendedImplementation = this.generateImplementationRecommendation(
      isBlock,
      blockClassification,
      blockSchema,
      componentClassifications
    );

    // Generate code structure if it's a block
    let codeStructure: BlockCodeStructure | undefined;
    if (isBlock && blockClassification && blockSchema) {
      codeStructure = this.generateCodeStructure(node, blockClassification, blockSchema);
    }

    return {
      node,
      isBlock,
      blockClassification,
      blockSchema,
      componentClassifications,
      recommendedImplementation,
      codeStructure
    };
  }

  /**
   * Analyze components within a node (recursive)
   */
  private static analyzeComponents(node: FigmaNode): EnhancedComponent[] {
    const components: EnhancedComponent[] = [];

    const traverse = (n: FigmaNode, depth: number) => {
      // Simple component type inference (would use full ComponentClassifier in production)
      const componentType = this.inferComponentType(n);

      if (componentType !== 'Unknown') {
        components.push({
          id: n.id || `${n.name}-${depth}`,
          name: n.name,
          type: componentType,
          confidence: 0.8,
          styles: this.extractBasicStyles(n),
          tailwindClasses: [],
          cssProperties: {},
          classification: {
            type: componentType,
            confidence: 0.8,
            reasons: [`Detected as ${componentType} from name pattern`]
          }
        });
      }

      if (n.children) {
        n.children.forEach(child => traverse(child, depth + 1));
      }
    };

    traverse(node, 0);
    return components;
  }

  /**
   * Infer component type from node
   */
  private static inferComponentType(node: FigmaNode): ComponentType {
    const name = node.name.toLowerCase();

    // Map to ComponentType
    if (name.includes('button') || name.includes('btn')) return 'Button';
    if (name.includes('input') || name.includes('textfield')) return 'Input';
    if (name.includes('textarea')) return 'Textarea';
    if (name.includes('card')) return 'Card';
    if (name.includes('badge') || name.includes('tag')) return 'Badge';
    if (name.includes('avatar')) return 'Avatar';
    if (name.includes('icon')) return 'Icon';
    if (name.includes('image') || name.includes('img')) return 'Image';
    if (name.includes('form')) return 'Form';
    if (name.includes('checkbox')) return 'Checkbox';
    if (name.includes('radio')) return 'Radio';
    if (name.includes('switch')) return 'Switch';
    if (name.includes('slider')) return 'Slider';
    if (name.includes('select') || name.includes('dropdown')) return 'Select';
    if (name.includes('table')) return 'Table';
    if (name.includes('chart')) return 'Chart';
    if (name.includes('tabs')) return 'Tabs';
    if (name.includes('accordion')) return 'Accordion';
    if (name.includes('carousel')) return 'Carousel';
    if (name.includes('dialog') || name.includes('modal')) return 'Dialog';
    if (name.includes('alert')) return 'Alert';
    if (name.includes('tooltip')) return 'Tooltip';
    if (name.includes('popover')) return 'Popover';
    if (name.includes('progress')) return 'Progress';
    if (name.includes('skeleton')) return 'Skeleton';
    if (name.includes('separator') || name.includes('divider')) return 'Separator';

    return 'Unknown';
  }

  /**
   * Extract basic styles from node
   */
  private static extractBasicStyles(node: FigmaNode): any {
    return {
      colors: {
        background: [],
        text: [],
        border: []
      },
      effects: [],
      spacing: {
        padding: { top: 0, right: 0, bottom: 0, left: 0 }
      },
      borderRadius: 0,
      dimensions: {
        width: node.size?.x || 0,
        height: node.size?.y || 0
      }
    };
  }

  /**
   * Generate implementation recommendation
   */
  private static generateImplementationRecommendation(
    isBlock: boolean,
    blockClassification: BlockClassification | undefined,
    blockSchema: BlockSchema | undefined,
    components: EnhancedComponent[]
  ): string {
    if (!isBlock) {
      return `This appears to be a single component, not a block. Detected ${components.length} component(s): ${components.map(c => c.type).join(', ')}`;
    }

    const category = blockClassification!.category;
    const subType = blockClassification!.subType;
    const blockType = blockClassification!.blockType;
    const confidence = (blockClassification!.confidence * 100).toFixed(1);

    let recommendation = `Classified as: ${blockType} (${category})\n`;
    recommendation += `Confidence: ${confidence}%\n`;
    recommendation += `Sub-type: ${subType}\n\n`;

    if (blockSchema) {
      recommendation += `Schema Available: Yes\n`;
      recommendation += `Import Path: ${blockSchema.importPath}\n`;
      recommendation += `Wrapper: ${blockSchema.wrapperComponent}\n\n`;
    } else {
      recommendation += `Schema Available: No (use generic block implementation)\n\n`;
    }

    recommendation += `Composition:\n`;
    blockClassification!.composedOf.forEach(comp => {
      recommendation += `  - ${comp.componentType} (${comp.count}x)\n`;
    });

    recommendation += `\nLayout Pattern: ${blockClassification!.layoutPattern.type}`;
    if (blockClassification!.layoutPattern.columns) {
      recommendation += ` (${blockClassification!.layoutPattern.columns} columns)`;
    }
    recommendation += `\n`;

    recommendation += `Complexity: ${blockClassification!.layoutPattern.complexity}\n`;

    recommendation += `\nImplementation Strategy:\n`;
    recommendation += this.getImplementationStrategy(blockClassification!, blockSchema);

    return recommendation;
  }

  /**
   * Get implementation strategy
   */
  private static getImplementationStrategy(
    classification: BlockClassification,
    schema: BlockSchema | undefined
  ): string {
    const category = classification.category;

    switch (category) {
      case BlockCategory.HERO:
        return `1. Use Hero block template from ${schema?.importPath || 'custom implementation'}
2. Extract heading, description, and CTA text
3. Map image assets if present
4. Apply responsive breakpoints (mobile/tablet/desktop)
5. Implement with ShadCN Button and Typography components`;

      case BlockCategory.FEATURES:
        return `1. Use Features grid template
2. Extract feature items (title, description, icon)
3. Implement with Card, Icon, and Typography components
4. Use CSS Grid for responsive layout (1/2/3 columns)
5. Apply consistent spacing and alignment`;

      case BlockCategory.PRICING:
        return `1. Use Pricing cards template
2. Extract plan details (name, price, features)
3. Implement with Card, Badge, and Button components
4. Highlight recommended plan with visual treatment
5. Ensure mobile-responsive stacking`;

      case BlockCategory.AUTHENTICATION:
        return `1. Use ${classification.blockType} template
2. Implement with Form, Input, Button, and Card components
3. Add form validation logic
4. Include error states and loading states
5. Add social login options if present`;

      case BlockCategory.DASHBOARD:
        return `1. Use Dashboard block template
2. Implement with Card and Chart/Stat components
3. Add real-time data updates capability
4. Implement responsive grid layout
5. Include loading skeletons for data states`;

      case BlockCategory.ECOMMERCE:
        return `1. Use Product card/list template
2. Implement with Card, Image, Badge, and Button
3. Add hover states and animations
4. Include quick view/add to cart functionality
5. Implement image optimization`;

      case BlockCategory.TESTIMONIALS:
        return `1. Use Testimonials grid template
2. Implement with Card, Avatar, and Typography
3. Consider using Carousel for mobile
4. Add star ratings if present
5. Implement with subtle animations`;

      case BlockCategory.CTA:
        return `1. Use CTA section template
2. Center-align content
3. Implement with prominent Button(s)
4. Add background treatment (color/gradient/image)
5. Ensure high contrast for accessibility`;

      case BlockCategory.FOOTER:
        return `1. Use Footer template with multi-column layout
2. Implement with navigation links and social icons
3. Add responsive behavior (stack on mobile)
4. Include copyright and legal links
5. Ensure proper link hierarchy`;

      case BlockCategory.HEADER:
        return `1. Use Header/Navbar template
2. Implement with Logo, Navigation, and Action buttons
3. Add mobile hamburger menu
4. Implement sticky/fixed positioning
5. Include user profile dropdown if authenticated`;

      case BlockCategory.BLOG:
        return `1. Use Blog card/list template
2. Implement with Card, Image, Badge, and Typography
3. Add category filtering
4. Include read time and author information
5. Implement with hover effects`;

      case BlockCategory.FORM:
        return `1. Use Form block template
2. Implement with Form, Input, Textarea, and Button
3. Add field validation
4. Include success/error states
5. Implement multi-step form if complex`;

      default:
        return `1. Analyze block composition
2. Use appropriate ShadCN components
3. Implement responsive layout
4. Add appropriate states and interactions
5. Test across devices`;
    }
  }

  /**
   * Generate code structure for a block
   */
  private static generateCodeStructure(
    node: FigmaNode,
    classification: BlockClassification,
    schema: BlockSchema
  ): BlockCodeStructure {
    const componentName = this.toComponentName(classification.blockType);
    const importStatements = this.generateImports(classification, schema);
    const jsx = this.generateJSX(node, classification, schema);
    const props = this.generateProps(classification);
    const tailwindClasses = schema.tailwindClasses || [];

    return {
      componentName,
      importStatements,
      jsx,
      props,
      tailwindClasses
    };
  }

  /**
   * Convert block type to component name
   */
  private static toComponentName(blockType: string): string {
    return blockType
      .split(/[-\s]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  /**
   * Generate import statements
   */
  private static generateImports(classification: BlockClassification, schema: BlockSchema): string[] {
    const imports: string[] = [];

    // Block component import
    imports.push(`import { ${this.toComponentName(classification.blockType)} } from '${schema.importPath}';`);

    // Component imports based on composition
    const uniqueComponents = new Set(classification.composedOf.map(c => c.componentType));
    const componentImports = Array.from(uniqueComponents)
      .filter(c => c !== 'Unknown' && c !== 'Container')
      .map(c => c);

    if (componentImports.length > 0) {
      imports.push(`import { ${componentImports.join(', ')} } from '@/components/ui';`);
    }

    return imports;
  }

  /**
   * Generate JSX structure
   */
  private static generateJSX(node: FigmaNode, classification: BlockClassification, schema: BlockSchema): string {
    const componentName = this.toComponentName(classification.blockType);
    const classes = schema.tailwindClasses?.join(' ') || '';

    let jsx = `<${componentName} className="${classes}">\n`;

    // Add structure based on schema
    schema.structure.forEach(slot => {
      jsx += this.generateSlotJSX(slot, 1);
    });

    jsx += `</${componentName}>`;

    return jsx;
  }

  /**
   * Generate JSX for a slot
   */
  private static generateSlotJSX(slot: any, indent: number): string {
    const indentation = '  '.repeat(indent);
    let jsx = '';

    const componentName = slot.componentType === 'Container' ? 'div' : slot.componentType;
    const props = slot.defaultProps ? this.propsToString(slot.defaultProps) : '';

    jsx += `${indentation}<${componentName}${props}>\n`;

    if (slot.children) {
      slot.children.forEach((child: any) => {
        jsx += this.generateSlotJSX(child, indent + 1);
      });
    } else {
      jsx += `${indentation}  {/* ${slot.description} */}\n`;
    }

    jsx += `${indentation}</${componentName}>\n`;

    return jsx;
  }

  /**
   * Convert props object to string
   */
  private static propsToString(props: Record<string, any>): string {
    return Object.entries(props)
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return ` ${key}="${value}"`;
        } else if (typeof value === 'boolean' && value) {
          return ` ${key}`;
        } else {
          return ` ${key}={${JSON.stringify(value)}}`;
        }
      })
      .join('');
  }

  /**
   * Generate component props
   */
  private static generateProps(classification: BlockClassification): Record<string, any> {
    const props: Record<string, any> = {};

    // Add common props based on category
    switch (classification.category) {
      case BlockCategory.HERO:
        props.heading = 'Hero Heading';
        props.description = 'Hero description text';
        props.primaryCTA = 'Get Started';
        props.secondaryCTA = 'Learn More';
        break;

      case BlockCategory.FEATURES:
        props.features = [
          { icon: 'Icon1', title: 'Feature 1', description: 'Description 1' },
          { icon: 'Icon2', title: 'Feature 2', description: 'Description 2' },
          { icon: 'Icon3', title: 'Feature 3', description: 'Description 3' }
        ];
        break;

      case BlockCategory.PRICING:
        props.plans = [
          { name: 'Basic', price: '$9', features: ['Feature 1', 'Feature 2'] },
          { name: 'Pro', price: '$29', features: ['Feature 1', 'Feature 2', 'Feature 3'], popular: true },
          { name: 'Enterprise', price: '$99', features: ['All features'] }
        ];
        break;

      case BlockCategory.AUTHENTICATION:
        props.title = classification.blockType;
        props.onSubmit = 'handleSubmit';
        break;

      case BlockCategory.TESTIMONIALS:
        props.testimonials = [
          { quote: 'Testimonial 1', author: 'Author 1', role: 'Role 1' },
          { quote: 'Testimonial 2', author: 'Author 2', role: 'Role 2' }
        ];
        break;
    }

    return props;
  }

  /**
   * Get block statistics for a Figma file
   */
  static getBlockStatistics(nodes: FigmaNode[]): BlockStatistics {
    const stats: BlockStatistics = {
      totalNodes: 0,
      totalBlocks: 0,
      blocksByCategory: new Map(),
      blocksBySubType: new Map(),
      averageConfidence: 0,
      averageComplexity: 0
    };

    let totalConfidence = 0;
    let totalComplexity = 0;

    const traverse = (node: FigmaNode) => {
      stats.totalNodes++;

      const classification = BlockClassifier.classifyBlock(node);
      if (classification) {
        stats.totalBlocks++;
        totalConfidence += classification.confidence;
        totalComplexity += classification.characteristics.estimatedComplexity;

        // By category
        const catCount = stats.blocksByCategory.get(classification.category) || 0;
        stats.blocksByCategory.set(classification.category, catCount + 1);

        // By sub-type
        const subCount = stats.blocksBySubType.get(classification.subType) || 0;
        stats.blocksBySubType.set(classification.subType, subCount + 1);
      }

      if (node.children) {
        node.children.forEach(traverse);
      }
    };

    nodes.forEach(traverse);

    if (stats.totalBlocks > 0) {
      stats.averageConfidence = totalConfidence / stats.totalBlocks;
      stats.averageComplexity = totalComplexity / stats.totalBlocks;
    }

    return stats;
  }
}

// ============================================================================
// STATISTICS INTERFACE
// ============================================================================

export interface BlockStatistics {
  totalNodes: number;
  totalBlocks: number;
  blocksByCategory: Map<BlockCategory, number>;
  blocksBySubType: Map<BlockSubType, number>;
  averageConfidence: number;
  averageComplexity: number;
}

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

/**
 * Pretty print block statistics
 */
export function printBlockStatistics(stats: BlockStatistics): void {
  console.log('\n' + '='.repeat(60));
  console.log('BLOCK CLASSIFICATION STATISTICS');
  console.log('='.repeat(60));

  console.log(`\nTotal Nodes Analyzed: ${stats.totalNodes}`);
  console.log(`Total Blocks Detected: ${stats.totalBlocks}`);
  console.log(`Block Detection Rate: ${((stats.totalBlocks / stats.totalNodes) * 100).toFixed(1)}%`);
  console.log(`Average Confidence: ${(stats.averageConfidence * 100).toFixed(1)}%`);
  console.log(`Average Complexity: ${stats.averageComplexity.toFixed(1)}/10`);

  console.log('\n' + '-'.repeat(60));
  console.log('Blocks by Category:');
  console.log('-'.repeat(60));

  const sortedCategories = Array.from(stats.blocksByCategory.entries())
    .sort((a, b) => b[1] - a[1]);

  sortedCategories.forEach(([category, count]) => {
    const percentage = ((count / stats.totalBlocks) * 100).toFixed(1);
    console.log(`  ${category.padEnd(20)} ${count.toString().padStart(4)} (${percentage}%)`);
  });

  console.log('\n' + '-'.repeat(60));
  console.log('Blocks by Sub-Type (Top 10):');
  console.log('-'.repeat(60));

  const sortedSubTypes = Array.from(stats.blocksBySubType.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  sortedSubTypes.forEach(([subType, count]) => {
    const percentage = ((count / stats.totalBlocks) * 100).toFixed(1);
    console.log(`  ${subType.padEnd(30)} ${count.toString().padStart(4)} (${percentage}%)`);
  });

  console.log('\n' + '='.repeat(60) + '\n');
}
