/**
 * Test Suite for Block Classification System
 *
 * Tests hierarchical block classification, composition detection,
 * and semantic mapping for 1,074+ block components.
 */

import { BlockClassifier, BlockCategory, BlockSubType, BlockClassification } from './block-classifier.js';
import { BlockSchemaRegistry, BlockSchema } from './block-semantic-mapper.js';
import { FigmaNode } from './enhanced-figma-parser.js';

// ============================================================================
// TEST DATA GENERATORS
// ============================================================================

/**
 * Generate mock Figma node for testing
 */
function createMockNode(config: {
  name: string;
  width: number;
  height: number;
  layoutMode?: string;
  children?: FigmaNode[];
}): FigmaNode {
  return {
    name: config.name,
    type: 'FRAME',
    size: { x: config.width, y: config.height },
    layoutMode: config.layoutMode || 'VERTICAL',
    children: config.children || [],
    visible: true
  };
}

/**
 * Create a mock child node
 */
function createChild(name: string, width: number = 100, height: number = 40): FigmaNode {
  return {
    name,
    type: 'FRAME',
    size: { x: width, y: height },
    visible: true
  };
}

// ============================================================================
// TEST RUNNERS
// ============================================================================

/**
 * Test Hero Block Classification
 */
function testHeroBlocks(): void {
  console.log('\n========================================');
  console.log('TEST SUITE: Hero Blocks');
  console.log('========================================\n');

  const tests = [
    {
      name: 'Hero Simple',
      node: createMockNode({
        name: 'Hero Section',
        width: 1200,
        height: 600,
        layoutMode: 'VERTICAL',
        children: [
          createChild('Heading', 800, 80),
          createChild('Description', 600, 40),
          createChild('Button Primary', 200, 50),
          createChild('Button Secondary', 200, 50)
        ]
      }),
      expectedCategory: BlockCategory.HERO,
      expectedSubType: BlockSubType.HERO_SIMPLE
    },
    {
      name: 'Hero Split',
      node: createMockNode({
        name: 'Hero - Split Layout',
        width: 1200,
        height: 600,
        layoutMode: 'HORIZONTAL',
        children: [
          createChild('Text Content', 600, 600),
          createChild('Hero Image', 600, 600)
        ]
      }),
      expectedCategory: BlockCategory.HERO,
      expectedSubType: BlockSubType.HERO_SPLIT
    },
    {
      name: 'Hero Centered',
      node: createMockNode({
        name: 'Hero Centered',
        width: 1200,
        height: 700,
        layoutMode: 'VERTICAL',
        children: [
          createChild('Heading', 900, 100),
          createChild('Subtitle', 700, 50),
          createChild('CTA Buttons', 400, 60)
        ]
      }),
      expectedCategory: BlockCategory.HERO,
      expectedSubType: BlockSubType.HERO_CENTERED
    }
  ];

  runTests(tests);
}

/**
 * Test Features Block Classification
 */
function testFeaturesBlocks(): void {
  console.log('\n========================================');
  console.log('TEST SUITE: Features Blocks');
  console.log('========================================\n');

  const tests = [
    {
      name: 'Features Grid',
      node: createMockNode({
        name: 'Features Section',
        width: 1200,
        height: 800,
        children: [
          createChild('Feature Card 1', 350, 250),
          createChild('Feature Card 2', 350, 250),
          createChild('Feature Card 3', 350, 250),
          createChild('Feature Card 4', 350, 250),
          createChild('Feature Card 5', 350, 250),
          createChild('Feature Card 6', 350, 250)
        ]
      }),
      expectedCategory: BlockCategory.FEATURES,
      expectedSubType: BlockSubType.FEATURES_GRID
    },
    {
      name: 'Features with Icons',
      node: createMockNode({
        name: 'Features - Icon List',
        width: 1000,
        height: 600,
        children: [
          createChild('Icon Feature 1', 900, 100),
          createChild('Icon Feature 2', 900, 100),
          createChild('Icon Feature 3', 900, 100)
        ]
      }),
      expectedCategory: BlockCategory.FEATURES,
      expectedSubType: BlockSubType.FEATURES_WITH_ICONS
    }
  ];

  runTests(tests);
}

/**
 * Test Pricing Block Classification
 */
function testPricingBlocks(): void {
  console.log('\n========================================');
  console.log('TEST SUITE: Pricing Blocks');
  console.log('========================================\n');

  const tests = [
    {
      name: 'Pricing Cards',
      node: createMockNode({
        name: 'Pricing Section',
        width: 1200,
        height: 700,
        children: [
          createChild('Pricing Card - Basic', 350, 600),
          createChild('Pricing Card - Pro', 350, 600),
          createChild('Pricing Card - Enterprise', 350, 600)
        ]
      }),
      expectedCategory: BlockCategory.PRICING,
      expectedSubType: BlockSubType.PRICING_CARDS
    },
    {
      name: 'Pricing Table',
      node: createMockNode({
        name: 'Pricing Comparison Table',
        width: 1200,
        height: 800,
        children: [
          createChild('Table Header', 1200, 80),
          createChild('Table Body', 1200, 720)
        ]
      }),
      expectedCategory: BlockCategory.PRICING,
      expectedSubType: BlockSubType.PRICING_TABLE
    }
  ];

  runTests(tests);
}

/**
 * Test Authentication Block Classification
 */
function testAuthenticationBlocks(): void {
  console.log('\n========================================');
  console.log('TEST SUITE: Authentication Blocks');
  console.log('========================================\n');

  const tests = [
    {
      name: 'Login Form',
      node: createMockNode({
        name: 'Login Form',
        width: 400,
        height: 500,
        layoutMode: 'VERTICAL',
        children: [
          createChild('Card Header', 400, 60),
          createChild('Email Input', 350, 50),
          createChild('Password Input', 350, 50),
          createChild('Remember Checkbox', 350, 30),
          createChild('Submit Button', 350, 50)
        ]
      }),
      expectedCategory: BlockCategory.AUTHENTICATION,
      expectedSubType: BlockSubType.LOGIN
    },
    {
      name: 'Register Form',
      node: createMockNode({
        name: 'Sign Up Form',
        width: 450,
        height: 650,
        layoutMode: 'VERTICAL',
        children: [
          createChild('Card Header', 400, 60),
          createChild('Name Input', 400, 50),
          createChild('Email Input', 400, 50),
          createChild('Password Input', 400, 50),
          createChild('Confirm Password Input', 400, 50),
          createChild('Terms Checkbox', 400, 30),
          createChild('Submit Button', 400, 50)
        ]
      }),
      expectedCategory: BlockCategory.AUTHENTICATION,
      expectedSubType: BlockSubType.REGISTER
    },
    {
      name: 'Forgot Password',
      node: createMockNode({
        name: 'Forgot Password Form',
        width: 400,
        height: 350,
        layoutMode: 'VERTICAL',
        children: [
          createChild('Card Header', 400, 60),
          createChild('Email Input', 350, 50),
          createChild('Submit Button', 350, 50)
        ]
      }),
      expectedCategory: BlockCategory.AUTHENTICATION,
      expectedSubType: BlockSubType.FORGOT_PASSWORD
    }
  ];

  runTests(tests);
}

/**
 * Test Dashboard Block Classification
 */
function testDashboardBlocks(): void {
  console.log('\n========================================');
  console.log('TEST SUITE: Dashboard Blocks');
  console.log('========================================\n');

  const tests = [
    {
      name: 'Dashboard Stats',
      node: createMockNode({
        name: 'Dashboard Stats Grid',
        width: 1200,
        height: 200,
        layoutMode: 'HORIZONTAL',
        children: [
          createChild('Stat Card - Revenue', 280, 150),
          createChild('Stat Card - Users', 280, 150),
          createChild('Stat Card - Orders', 280, 150),
          createChild('Stat Card - Growth', 280, 150)
        ]
      }),
      expectedCategory: BlockCategory.DASHBOARD,
      expectedSubType: BlockSubType.DASHBOARD_STATS
    },
    {
      name: 'Dashboard Header',
      node: createMockNode({
        name: 'Dashboard Header',
        width: 1200,
        height: 100,
        layoutMode: 'HORIZONTAL',
        children: [
          createChild('Title', 600, 80),
          createChild('Action Buttons', 400, 50)
        ]
      }),
      expectedCategory: BlockCategory.DASHBOARD,
      expectedSubType: BlockSubType.DASHBOARD_HEADER
    }
  ];

  runTests(tests);
}

/**
 * Test E-commerce Block Classification
 */
function testEcommerceBlocks(): void {
  console.log('\n========================================');
  console.log('TEST SUITE: E-commerce Blocks');
  console.log('========================================\n');

  const tests = [
    {
      name: 'Product Card',
      node: createMockNode({
        name: 'Product Card',
        width: 300,
        height: 450,
        layoutMode: 'VERTICAL',
        children: [
          createChild('Product Image', 300, 300),
          createChild('Product Badge', 80, 24),
          createChild('Product Title', 280, 40),
          createChild('Product Price', 280, 30),
          createChild('Add to Cart Button', 280, 50)
        ]
      }),
      expectedCategory: BlockCategory.ECOMMERCE,
      expectedSubType: BlockSubType.PRODUCT_CARD
    },
    {
      name: 'Product List',
      node: createMockNode({
        name: 'Product List Grid',
        width: 1200,
        height: 900,
        children: [
          createChild('Product Card 1', 280, 400),
          createChild('Product Card 2', 280, 400),
          createChild('Product Card 3', 280, 400),
          createChild('Product Card 4', 280, 400),
          createChild('Product Card 5', 280, 400),
          createChild('Product Card 6', 280, 400)
        ]
      }),
      expectedCategory: BlockCategory.ECOMMERCE,
      expectedSubType: BlockSubType.PRODUCT_LIST
    },
    {
      name: 'Cart Summary',
      node: createMockNode({
        name: 'Shopping Cart',
        width: 800,
        height: 600,
        layoutMode: 'VERTICAL',
        children: [
          createChild('Cart Header', 800, 60),
          createChild('Cart Items', 800, 400),
          createChild('Cart Total', 800, 80),
          createChild('Checkout Button', 300, 50)
        ]
      }),
      expectedCategory: BlockCategory.ECOMMERCE,
      expectedSubType: BlockSubType.CART_SUMMARY
    }
  ];

  runTests(tests);
}

/**
 * Test Marketing Block Classification
 */
function testMarketingBlocks(): void {
  console.log('\n========================================');
  console.log('TEST SUITE: Marketing Blocks');
  console.log('========================================\n');

  const tests = [
    {
      name: 'Testimonials',
      node: createMockNode({
        name: 'Testimonials Section',
        width: 1200,
        height: 600,
        children: [
          createChild('Testimonial Card 1', 350, 250),
          createChild('Testimonial Card 2', 350, 250),
          createChild('Testimonial Card 3', 350, 250)
        ]
      }),
      expectedCategory: BlockCategory.TESTIMONIALS,
      expectedSubType: BlockSubType.UNKNOWN
    },
    {
      name: 'CTA Section',
      node: createMockNode({
        name: 'Call to Action',
        width: 1000,
        height: 400,
        layoutMode: 'VERTICAL',
        children: [
          createChild('CTA Heading', 800, 80),
          createChild('CTA Description', 700, 50),
          createChild('CTA Button', 250, 60)
        ]
      }),
      expectedCategory: BlockCategory.CTA,
      expectedSubType: BlockSubType.UNKNOWN
    },
    {
      name: 'Footer',
      node: createMockNode({
        name: 'Site Footer',
        width: 1400,
        height: 400,
        children: [
          createChild('Footer Column 1', 300, 350),
          createChild('Footer Column 2', 300, 350),
          createChild('Footer Column 3', 300, 350),
          createChild('Footer Column 4', 300, 350)
        ]
      }),
      expectedCategory: BlockCategory.FOOTER,
      expectedSubType: BlockSubType.UNKNOWN
    },
    {
      name: 'Header',
      node: createMockNode({
        name: 'Site Header',
        width: 1400,
        height: 80,
        layoutMode: 'HORIZONTAL',
        children: [
          createChild('Logo', 150, 60),
          createChild('Navigation', 800, 60),
          createChild('Actions', 250, 50)
        ]
      }),
      expectedCategory: BlockCategory.HEADER,
      expectedSubType: BlockSubType.UNKNOWN
    }
  ];

  runTests(tests);
}

/**
 * Test Content Block Classification
 */
function testContentBlocks(): void {
  console.log('\n========================================');
  console.log('TEST SUITE: Content Blocks');
  console.log('========================================\n');

  const tests = [
    {
      name: 'Blog Card',
      node: createMockNode({
        name: 'Blog Post Card',
        width: 350,
        height: 500,
        layoutMode: 'VERTICAL',
        children: [
          createChild('Blog Image', 350, 200),
          createChild('Category Badge', 80, 24),
          createChild('Blog Title', 330, 60),
          createChild('Blog Excerpt', 330, 80),
          createChild('Author Meta', 330, 50)
        ]
      }),
      expectedCategory: BlockCategory.BLOG,
      expectedSubType: BlockSubType.BLOG_CARD
    },
    {
      name: 'Blog List',
      node: createMockNode({
        name: 'Blog Posts Grid',
        width: 1200,
        height: 900,
        children: [
          createChild('Blog Card 1', 350, 500),
          createChild('Blog Card 2', 350, 500),
          createChild('Blog Card 3', 350, 500)
        ]
      }),
      expectedCategory: BlockCategory.BLOG,
      expectedSubType: BlockSubType.BLOG_LIST
    }
  ];

  runTests(tests);
}

/**
 * Test Form Block Classification
 */
function testFormBlocks(): void {
  console.log('\n========================================');
  console.log('TEST SUITE: Form Blocks');
  console.log('========================================\n');

  const tests = [
    {
      name: 'Contact Form',
      node: createMockNode({
        name: 'Contact Form',
        width: 600,
        height: 600,
        layoutMode: 'VERTICAL',
        children: [
          createChild('Name Input', 550, 50),
          createChild('Email Input', 550, 50),
          createChild('Message Textarea', 550, 200),
          createChild('Submit Button', 200, 50)
        ]
      }),
      expectedCategory: BlockCategory.FORM,
      expectedSubType: BlockSubType.UNKNOWN
    }
  ];

  runTests(tests);
}

/**
 * Test Navigation Block Classification
 */
function testNavigationBlocks(): void {
  console.log('\n========================================');
  console.log('TEST SUITE: Navigation Blocks');
  console.log('========================================\n');

  const tests = [
    {
      name: 'Sidebar',
      node: createMockNode({
        name: 'Sidebar Navigation',
        width: 250,
        height: 800,
        layoutMode: 'VERTICAL',
        children: [
          createChild('Nav Item 1', 230, 50),
          createChild('Nav Item 2', 230, 50),
          createChild('Nav Item 3', 230, 50),
          createChild('Nav Item 4', 230, 50)
        ]
      }),
      expectedCategory: BlockCategory.SIDEBAR,
      expectedSubType: BlockSubType.DASHBOARD_SIDEBAR
    },
    {
      name: 'Breadcrumb',
      node: createMockNode({
        name: 'Breadcrumb Navigation',
        width: 600,
        height: 40,
        layoutMode: 'HORIZONTAL',
        children: [
          createChild('Home', 80, 30),
          createChild('Products', 100, 30),
          createChild('Category', 100, 30)
        ]
      }),
      expectedCategory: BlockCategory.BREADCRUMB,
      expectedSubType: BlockSubType.UNKNOWN
    }
  ];

  runTests(tests);
}

/**
 * Test Composition Detection
 */
function testCompositionDetection(): void {
  console.log('\n========================================');
  console.log('TEST SUITE: Composition Detection');
  console.log('========================================\n');

  const tests = [
    {
      name: 'Login Form Composition',
      node: createMockNode({
        name: 'Login Form',
        width: 400,
        height: 500,
        children: [
          createChild('Email Input', 350, 50),
          createChild('Password Input', 350, 50),
          createChild('Button Submit', 350, 50),
          createChild('Checkbox Remember', 350, 30)
        ]
      }),
      expectedComponents: ['Input', 'Button', 'Checkbox']
    },
    {
      name: 'Product Card Composition',
      node: createMockNode({
        name: 'Product Card',
        width: 300,
        height: 450,
        children: [
          createChild('Product Image', 300, 300),
          createChild('Badge Sale', 80, 24),
          createChild('Card Container', 280, 100),
          createChild('Button Add to Cart', 280, 50)
        ]
      }),
      expectedComponents: ['Image', 'Badge', 'Card', 'Button']
    }
  ];

  tests.forEach(test => {
    console.log(`\nTest: ${test.name}`);
    console.log('─'.repeat(50));

    const result = BlockClassifier.classifyBlock(test.node);

    if (result) {
      console.log(`Detected Components: ${result.composedOf.map(c => c.componentType).join(', ')}`);

      const detectedTypes = result.composedOf.map(c => c.componentType);
      const allExpectedFound = test.expectedComponents.every(expected =>
        detectedTypes.includes(expected as any)
      );

      if (allExpectedFound) {
        console.log('✓ All expected components detected');
      } else {
        console.log('✗ Some expected components missing');
        console.log(`  Expected: ${test.expectedComponents.join(', ')}`);
        console.log(`  Detected: ${detectedTypes.join(', ')}`);
      }

      console.log(`\nComposition Details:`);
      result.composedOf.forEach(comp => {
        console.log(`  - ${comp.componentType}: ${comp.count}x (${comp.location}, confidence: ${comp.confidence.toFixed(2)})`);
      });
    } else {
      console.log('✗ Failed to classify as block');
    }
  });
}

/**
 * Test Layout Pattern Detection
 */
function testLayoutPatternDetection(): void {
  console.log('\n========================================');
  console.log('TEST SUITE: Layout Pattern Detection');
  console.log('========================================\n');

  const tests = [
    {
      name: 'Grid Layout',
      node: createMockNode({
        name: 'Features Grid',
        width: 1200,
        height: 800,
        children: [
          { ...createChild('Item 1', 350, 250), relativeTransform: { m00: 1, m01: 0, m02: 0, m10: 0, m11: 1, m12: 0 } },
          { ...createChild('Item 2', 350, 250), relativeTransform: { m00: 1, m01: 0, m02: 400, m10: 0, m11: 1, m12: 0 } },
          { ...createChild('Item 3', 350, 250), relativeTransform: { m00: 1, m01: 0, m02: 800, m10: 0, m11: 1, m12: 0 } },
          { ...createChild('Item 4', 350, 250), relativeTransform: { m00: 1, m01: 0, m02: 0, m10: 0, m11: 1, m12: 300 } },
          { ...createChild('Item 5', 350, 250), relativeTransform: { m00: 1, m01: 0, m02: 400, m10: 0, m11: 1, m12: 300 } },
          { ...createChild('Item 6', 350, 250), relativeTransform: { m00: 1, m01: 0, m02: 800, m10: 0, m11: 1, m12: 300 } }
        ]
      }),
      expectedPattern: 'grid',
      expectedColumns: 3
    },
    {
      name: 'Horizontal Layout',
      node: createMockNode({
        name: 'Stats Row',
        width: 1200,
        height: 150,
        layoutMode: 'HORIZONTAL',
        children: [
          createChild('Stat 1', 280, 150),
          createChild('Stat 2', 280, 150),
          createChild('Stat 3', 280, 150),
          createChild('Stat 4', 280, 150)
        ]
      }),
      expectedPattern: 'horizontal'
    },
    {
      name: 'Vertical Layout',
      node: createMockNode({
        name: 'Form',
        width: 400,
        height: 500,
        layoutMode: 'VERTICAL',
        children: [
          createChild('Input 1', 350, 50),
          createChild('Input 2', 350, 50),
          createChild('Button', 350, 50)
        ]
      }),
      expectedPattern: 'vertical'
    }
  ];

  tests.forEach(test => {
    console.log(`\nTest: ${test.name}`);
    console.log('─'.repeat(50));

    const result = BlockClassifier.classifyBlock(test.node);

    if (result) {
      console.log(`Layout Type: ${result.layoutPattern.type}`);
      console.log(`Complexity: ${result.layoutPattern.complexity}`);

      if (result.layoutPattern.columns) {
        console.log(`Columns: ${result.layoutPattern.columns}`);
      }
      if (result.layoutPattern.rows) {
        console.log(`Rows: ${result.layoutPattern.rows}`);
      }

      const patternMatches = result.layoutPattern.type === test.expectedPattern;
      const columnsMatch = !test.expectedColumns || result.layoutPattern.columns === test.expectedColumns;

      if (patternMatches && columnsMatch) {
        console.log('✓ Layout pattern correctly detected');
      } else {
        console.log('✗ Layout pattern mismatch');
        if (!patternMatches) {
          console.log(`  Expected pattern: ${test.expectedPattern}, got: ${result.layoutPattern.type}`);
        }
        if (!columnsMatch) {
          console.log(`  Expected columns: ${test.expectedColumns}, got: ${result.layoutPattern.columns}`);
        }
      }
    } else {
      console.log('✗ Failed to classify as block');
    }
  });
}

/**
 * Test Block Schemas
 */
function testBlockSchemas(): void {
  console.log('\n========================================');
  console.log('TEST SUITE: Block Schemas');
  console.log('========================================\n');

  const allSchemas = BlockSchemaRegistry.getAllSchemas();
  console.log(`Total registered schemas: ${allSchemas.length}\n`);

  // Group by category
  const byCategory = new Map<string, BlockSchema[]>();
  allSchemas.forEach(schema => {
    const category = schema.category;
    if (!byCategory.has(category)) {
      byCategory.set(category, []);
    }
    byCategory.get(category)!.push(schema);
  });

  console.log('Schemas by Category:');
  console.log('─'.repeat(50));

  for (const [category, schemas] of byCategory.entries()) {
    console.log(`\n${category} (${schemas.length} schemas):`);
    schemas.forEach(schema => {
      console.log(`  - ${schema.blockType}`);
      console.log(`    Import: ${schema.importPath}`);
      console.log(`    Wrapper: ${schema.wrapperComponent}`);
      console.log(`    Structure: ${schema.structure.length} top-level slots`);
    });
  }

  // Test schema retrieval
  console.log('\n\nSchema Retrieval Tests:');
  console.log('─'.repeat(50));

  const tests = [
    { blockType: 'Hero-Simple', shouldFind: true },
    { blockType: 'Login-Form', shouldFind: true },
    { blockType: 'Pricing-Cards', shouldFind: true },
    { blockType: 'Nonexistent-Block', shouldFind: false }
  ];

  tests.forEach(test => {
    const schema = BlockSchemaRegistry.getSchema(test.blockType);
    const found = schema !== undefined;

    if (found === test.shouldFind) {
      console.log(`✓ ${test.blockType}: ${found ? 'Found' : 'Not found'} (expected)`);
    } else {
      console.log(`✗ ${test.blockType}: ${found ? 'Found' : 'Not found'} (unexpected)`);
    }
  });
}

// ============================================================================
// TEST HELPERS
// ============================================================================

interface TestCase {
  name: string;
  node: FigmaNode;
  expectedCategory: BlockCategory;
  expectedSubType: BlockSubType;
  expectedComponents?: string[];
}

/**
 * Run a set of test cases
 */
function runTests(tests: TestCase[]): void {
  let passed = 0;
  let failed = 0;

  tests.forEach(test => {
    console.log(`\nTest: ${test.name}`);
    console.log('─'.repeat(50));

    const result = BlockClassifier.classifyBlock(test.node);

    if (!result) {
      console.log('✗ Failed to classify as block');
      failed++;
      return;
    }

    console.log(`Category: ${result.category} (expected: ${test.expectedCategory})`);
    console.log(`Sub-type: ${result.subType} (expected: ${test.expectedSubType})`);
    console.log(`Confidence: ${(result.confidence * 100).toFixed(1)}%`);
    console.log(`Block Type: ${result.blockType}`);

    const categoryMatch = result.category === test.expectedCategory;
    const subTypeMatch = result.subType === test.expectedSubType;
    const highConfidence = result.confidence >= 0.5;

    if (categoryMatch && subTypeMatch && highConfidence) {
      console.log('✓ PASSED');
      passed++;
    } else {
      console.log('✗ FAILED');
      if (!categoryMatch) console.log('  - Category mismatch');
      if (!subTypeMatch) console.log('  - Sub-type mismatch');
      if (!highConfidence) console.log('  - Low confidence');
      failed++;
    }

    console.log('\nReasons:');
    result.reasons.forEach(reason => {
      console.log(`  • ${reason}`);
    });

    console.log('\nComposition:');
    result.composedOf.forEach(comp => {
      console.log(`  • ${comp.componentType} (${comp.count}x, ${comp.location})`);
    });

    console.log('\nLayout:');
    console.log(`  • Type: ${result.layoutPattern.type}`);
    console.log(`  • Complexity: ${result.layoutPattern.complexity}`);
    console.log(`  • Has Images: ${result.layoutPattern.hasImages}`);
    console.log(`  • Has Text: ${result.layoutPattern.hasText}`);
    console.log(`  • Has Buttons: ${result.layoutPattern.hasButtons}`);
    console.log(`  • Has Form: ${result.layoutPattern.hasForm}`);

    console.log('\nCharacteristics:');
    console.log(`  • Full Width: ${result.characteristics.isFullWidth}`);
    console.log(`  • Large Section: ${result.characteristics.isLargeSection}`);
    console.log(`  • Multiple Columns: ${result.characteristics.hasMultipleColumns}`);
    console.log(`  • Dominant Content: ${result.characteristics.dominantContent}`);
    console.log(`  • Complexity Score: ${result.characteristics.estimatedComplexity}/10`);
  });

  console.log('\n' + '='.repeat(50));
  console.log(`Tests Passed: ${passed}/${tests.length}`);
  console.log(`Tests Failed: ${failed}/${tests.length}`);
  console.log(`Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`);
  console.log('='.repeat(50));
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

/**
 * Run all tests
 */
export function runAllBlockTests(): void {
  console.log('\n');
  console.log('█'.repeat(60));
  console.log('██ BLOCK CLASSIFICATION SYSTEM - TEST SUITE');
  console.log('██ Phase 7: Blocks & Templates');
  console.log('██ Target: 1,074 Block Components');
  console.log('█'.repeat(60));

  // Test individual block categories
  testHeroBlocks();
  testFeaturesBlocks();
  testPricingBlocks();
  testAuthenticationBlocks();
  testDashboardBlocks();
  testEcommerceBlocks();
  testMarketingBlocks();
  testContentBlocks();
  testFormBlocks();
  testNavigationBlocks();

  // Test advanced features
  testCompositionDetection();
  testLayoutPatternDetection();
  testBlockSchemas();

  console.log('\n\n');
  console.log('█'.repeat(60));
  console.log('██ ALL TESTS COMPLETED');
  console.log('█'.repeat(60));
  console.log('\n');
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllBlockTests();
}
