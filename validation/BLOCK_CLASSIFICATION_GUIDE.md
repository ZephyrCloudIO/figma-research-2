# Block Classification System - Developer Guide

## Quick Start

### 1. Classify a Figma Node as a Block

```typescript
import { BlockClassifier } from './block-classifier';

const result = BlockClassifier.classifyBlock(figmaNode);

if (result) {
  console.log(`Block: ${result.blockType}`);
  console.log(`Category: ${result.category}`);
  console.log(`Confidence: ${(result.confidence * 100).toFixed(1)}%`);
}
```

### 2. Get Block Schema

```typescript
import { BlockSchemaRegistry } from './block-semantic-mapper';

// By block type name
const schema = BlockSchemaRegistry.getSchema('Login-Form');

// By category and sub-type
const schema2 = BlockSchemaRegistry.getSchemaByCategoryAndSubType(
  BlockCategory.HERO,
  BlockSubType.HERO_SIMPLE
);

console.log(schema.importPath);      // '@/components/blocks/auth/login-form'
console.log(schema.structure);       // Slot definitions
```

### 3. Full Node Analysis

```typescript
import { BlockIntegration } from './block-integration';

const analysis = BlockIntegration.analyzeNode(figmaNode);

console.log('Is Block:', analysis.isBlock);
console.log('Category:', analysis.blockClassification?.category);
console.log('Composition:', analysis.blockClassification?.composedOf);
console.log('Implementation Guide:', analysis.recommendedImplementation);
console.log('Generated JSX:', analysis.codeStructure?.jsx);
```

## Block Categories

### Marketing/Landing Page (522 components)

| Category | Sub-Types | Use Cases |
|----------|-----------|-----------|
| **Hero** | Simple, Split, Centered, WithImage | Page headers, landing sections |
| **Features** | Grid, List, Cards, WithIcons | Product features, benefits |
| **Pricing** | Simple, Cards, Comparison, Table | Pricing plans, subscription tiers |
| **Testimonials** | Grid, Carousel, Cards | Customer reviews, social proof |
| **CTA** | Simple, Featured, Banner | Call-to-action sections |
| **Footer** | Simple, MultiColumn, Social | Site footers |
| **Header** | Navigation, Sticky, Transparent | Site headers, navigation bars |

### Authentication (50+ components)

| Sub-Type | Components | Use Cases |
|----------|-----------|-----------|
| **Login** | Card + Input + Button | User login forms |
| **Register** | Card + Input + Button + Checkbox | User registration |
| **ForgotPassword** | Card + Input + Button | Password recovery |
| **ResetPassword** | Card + Input + Button | Password reset |
| **TwoFactor** | Card + InputOTP + Button | 2FA verification |

### Application/Dashboard (311 components)

| Category | Sub-Types | Use Cases |
|----------|-----------|-----------|
| **Dashboard** | Stats, Header, Widget, Sidebar | Dashboard pages |
| **Sidebar** | Navigation, Collapsed, WithIcons | Side navigation |
| **Stats** | Grid, Cards, KPIs | Metrics, analytics |
| **Charts** | Line, Bar, Pie, Area | Data visualization |

### E-commerce (100+ components)

| Sub-Type | Components | Use Cases |
|----------|-----------|-----------|
| **ProductCard** | Card + Image + Badge + Button | Product listings |
| **ProductList** | Grid of ProductCards | Product galleries |
| **ProductDetail** | Image + Details + CTA | Product pages |
| **CartSummary** | List + Total + Checkout | Shopping cart |
| **CheckoutForm** | Form + Payment + Review | Checkout process |

### Content (80+ components)

| Category | Sub-Types | Use Cases |
|----------|-----------|-----------|
| **Blog** | Card, List, Post, Grid | Blog listings, articles |
| **Article** | Header, Content, Sidebar | Article pages |
| **ContentGrid** | Grid, Masonry, List | Content galleries |

### Forms (60+ components)

| Sub-Type | Use Cases |
|----------|-----------|
| **ContactForm** | Contact pages |
| **MultiStepForm** | Complex forms, wizards |
| **SurveyForm** | Surveys, questionnaires |
| **SearchForm** | Search interfaces |

### Navigation (40+ components)

| Sub-Type | Use Cases |
|----------|-----------|
| **Sidebar** | App navigation |
| **Breadcrumb** | Page hierarchy |
| **Pagination** | List navigation |
| **Tabs** | Content switching |

## Classification Pipeline

```
┌─────────────────┐
│  Figma Node     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Size Filter    │ ─── Must be ≥200x100px
└────────┬────────┘     Must have ≥2 children
         │
         ▼
┌─────────────────┐
│  Composition    │ ─── Detect component types
│  Analysis       │     Count components
└────────┬────────┘     Identify locations
         │
         ▼
┌─────────────────┐
│  Layout         │ ─── Detect grid/horizontal/vertical
│  Analysis       │     Estimate columns/rows
└────────┬────────┘     Analyze content types
         │
         ▼
┌─────────────────┐
│  Category       │ ─── Try each classifier
│  Classification │     Return best match ≥50% confidence
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Block          │
│  Classification │
└─────────────────┘
```

## Classification Signals

### Strong Signals (0.7-0.9 confidence)

**Name patterns:**
```typescript
// Hero
node.name.includes('hero')           → 0.8

// Authentication
node.name.includes('login')          → 0.8
node.name.includes('sign up')        → 0.8

// Dashboard
node.name.includes('dashboard')      → 0.7

// Footer
node.name.includes('footer')         → 0.9
```

### Moderate Signals (0.3-0.6 confidence)

**Composition patterns:**
```typescript
// Hero: Text + Buttons
hasText && hasButtons                → 0.4

// Features: Cards + Icons
hasCards && hasIcons                 → 0.5

// Pricing: Cards + Badges
hasCards && hasBadges                → 0.4

// Auth: Inputs + Button
hasInputs && hasButtons              → 0.4
```

### Weak Signals (0.1-0.3 confidence)

**Layout characteristics:**
```typescript
// Hero: Large, full-width
isFullWidth && isLargeSection        → 0.3

// Features: Grid layout
layoutType === 'grid'                → 0.2

// Stats: Horizontal row
layoutType === 'horizontal'          → 0.2
```

## Composition Detection

### Component Detection Rules

```typescript
// Button-like
name.includes('button') || name.includes('btn')

// Input-like
name.includes('input') || name.includes('textfield')

// Card-like
name.includes('card')

// Icon-like
name.includes('icon')

// Image-like
name.includes('image') || name.includes('img')

// Form-like
name.includes('form')
```

### Composition Output

```typescript
{
  componentType: 'Button',
  count: 2,
  location: 'root',        // 'root' | 'nested' | 'deep'
  confidence: 0.9
}
```

## Layout Patterns

### Grid Detection

```typescript
// Requirements:
// - 4+ children
// - Children at distinct Y positions (2+ rows)
// - Children grouped by similar Y (columns)

layoutPattern: {
  type: 'grid',
  columns: 3,
  rows: 2,
  complexity: 'moderate'
}
```

### Horizontal Detection

```typescript
// Requirements:
// - layoutMode === 'HORIZONTAL'
// - OR children arranged in a row

layoutPattern: {
  type: 'horizontal',
  complexity: 'simple'
}
```

### Vertical Detection

```typescript
// Requirements:
// - layoutMode === 'VERTICAL'
// - OR children stacked vertically

layoutPattern: {
  type: 'vertical',
  complexity: 'simple'
}
```

## Block Characteristics

### Size Classification

```typescript
isFullWidth: width >= 1000
isLargeSection: height >= 500
```

### Content Dominance

```typescript
dominantContent: 'forms'   // if hasForm
dominantContent: 'images'  // if hasImages && !hasText
dominantContent: 'text'    // if hasText && !hasImages
dominantContent: 'mixed'   // otherwise
```

### Complexity Score (1-10)

```typescript
complexity = 1
complexity += childCount * 0.3       // More children = more complex
complexity += hasMultipleColumns ? 2 : 0
complexity += hasForm ? 2 : 0
complexity += hasImages ? 1 : 0
complexity = Math.min(Math.round(complexity), 10)
```

## Block Schemas

### Schema Structure

```typescript
interface BlockSchema {
  blockType: string;           // 'Login-Form'
  category: BlockCategory;     // BlockCategory.AUTHENTICATION
  subType: BlockSubType;       // BlockSubType.LOGIN
  description: string;         // Human-readable description
  structure: BlockComponentSlot[];  // Hierarchical slot definitions
  wrapperComponent: string;    // 'Card' | 'section' | 'header' | etc.
  importPath: string;          // '@/components/blocks/auth/login-form'
  tailwindClasses?: string[];  // Default Tailwind classes
  usage: string;               // Usage guidelines
}
```

### Example: Login Form Schema

```typescript
{
  blockType: 'Login-Form',
  category: BlockCategory.AUTHENTICATION,
  subType: BlockSubType.LOGIN,
  wrapperComponent: 'Card',
  importPath: '@/components/blocks/auth/login-form',
  structure: [
    {
      name: 'card',
      componentType: 'Card',
      children: [
        {
          name: 'card-header',
          children: [
            { name: 'title', componentType: 'Text', required: true }
          ]
        },
        {
          name: 'card-content',
          children: [
            { name: 'form', componentType: 'Form', required: true,
              children: [
                { name: 'email-input', componentType: 'Input', required: true },
                { name: 'password-input', componentType: 'Input', required: true },
                { name: 'submit-button', componentType: 'Button', required: true }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

## Code Generation

### Generated JSX Structure

```typescript
const codeStructure = blockAnalysis.codeStructure;

console.log(codeStructure.jsx);
// Output:
<LoginForm className="w-full max-w-md mx-auto">
  <Card>
    <div>
      {/* Card header */}
      <h2>
        {/* Form title */}
      </h2>
    </div>
    <div>
      {/* Card content */}
      <Form>
        {/* Login form */}
        <Input>
          {/* Email/username input */}
        </Input>
        <Input>
          {/* Password input */}
        </Input>
        <Button>
          {/* Submit button */}
        </Button>
      </Form>
    </div>
  </Card>
</LoginForm>
```

### Generated Props

```typescript
console.log(codeStructure.props);
// Output:
{
  title: 'Login-Form',
  onSubmit: 'handleSubmit'
}
```

### Import Statements

```typescript
console.log(codeStructure.importStatements);
// Output:
[
  "import { LoginForm } from '@/components/blocks/auth/login-form';",
  "import { Card, Input, Button, Form } from '@/components/ui';"
]
```

## Statistics & Reporting

### Get Block Statistics

```typescript
import { BlockIntegration, printBlockStatistics } from './block-integration';

const figmaNodes = [/* array of nodes */];
const stats = BlockIntegration.getBlockStatistics(figmaNodes);

printBlockStatistics(stats);
```

### Output Example

```
============================================================
BLOCK CLASSIFICATION STATISTICS
============================================================

Total Nodes Analyzed: 1074
Total Blocks Detected: 856
Block Detection Rate: 79.7%
Average Confidence: 78.3%
Average Complexity: 4.2/10

------------------------------------------------------------
Blocks by Category:
------------------------------------------------------------
  Hero                 187 (21.8%)
  Features            162 (18.9%)
  Pricing             89 (10.4%)
  Dashboard           76 (8.9%)
  ...

------------------------------------------------------------
Blocks by Sub-Type (Top 10):
------------------------------------------------------------
  Hero-Simple                       89 (10.4%)
  Features-Grid                     78 (9.1%)
  Pricing-Cards                     67 (7.8%)
  Login                            45 (5.3%)
  ...
```

## Best Practices

### 1. Check Confidence Scores

```typescript
if (result.confidence >= 0.8) {
  // High confidence - safe to use
} else if (result.confidence >= 0.5) {
  // Moderate confidence - review manually
} else {
  // Low confidence - don't use
}
```

### 2. Validate Composition

```typescript
const requiredComponents = ['Input', 'Button'];
const hasRequired = requiredComponents.every(comp =>
  result.composedOf.some(c => c.componentType === comp)
);
```

### 3. Use Schema When Available

```typescript
const schema = BlockSchemaRegistry.getSchemaByCategoryAndSubType(
  result.category,
  result.subType
);

if (schema) {
  // Use schema for code generation
  generateCodeFromSchema(schema);
} else {
  // Fallback to generic implementation
  generateGenericCode(result);
}
```

### 4. Handle Unknown Blocks

```typescript
if (result.category === BlockCategory.UNKNOWN) {
  // Try component-level classification instead
  const components = ComponentClassifier.classifyAll(node.children);
  // Generate generic layout
}
```

## Troubleshooting

### Block Not Detected

**Possible causes:**
1. Too small (must be ≥200x100px)
2. Too few children (must have ≥2)
3. Low confidence (<50%)

**Solutions:**
1. Lower size threshold for specific cases
2. Add more classification signals
3. Check classifier order

### Wrong Category

**Common issues:**
1. Authentication/Forms detected as CTA
   - **Fix:** Prioritize form detection
2. Product cards detected as Pricing cards
   - **Fix:** Add e-commerce specific signals

### Low Confidence

**Causes:**
1. Weak name patterns
2. Mixed composition
3. Unusual layout

**Solutions:**
1. Add more detection rules
2. Tune weights
3. Add specific sub-type classifiers

## Testing

### Run All Tests

```bash
npx tsx test-blocks.ts
```

### Run Specific Category

```typescript
// In test-blocks.ts
testHeroBlocks();
testAuthenticationBlocks();
testDashboardBlocks();
// etc.
```

### Create Custom Test

```typescript
const testNode = createMockNode({
  name: 'My Custom Block',
  width: 1200,
  height: 600,
  children: [
    createChild('Header', 1200, 100),
    createChild('Content', 1200, 400)
  ]
});

const result = BlockClassifier.classifyBlock(testNode);
console.log(result);
```

## API Reference

### BlockClassifier

```typescript
class BlockClassifier {
  // Main classification method
  static classifyBlock(node: FigmaNode): BlockClassification | null;

  // Helper methods (private)
  private static isLikelyBlock(node: FigmaNode): boolean;
  private static analyzeComposition(node: FigmaNode): ComponentComposition[];
  private static analyzeLayoutPattern(node: FigmaNode): LayoutPattern;
  private static analyzeCharacteristics(node: FigmaNode): BlockCharacteristics;

  // Category classifiers
  private static classifyHeroBlock(...): BlockClassification | null;
  private static classifyFeaturesBlock(...): BlockClassification | null;
  // ... 15+ more category classifiers
}
```

### BlockSchemaRegistry

```typescript
class BlockSchemaRegistry {
  static initialize(): void;
  static getSchema(blockType: string): BlockSchema | undefined;
  static getSchemaByCategoryAndSubType(
    category: BlockCategory,
    subType: BlockSubType
  ): BlockSchema | undefined;
  static getSchemasByCategory(category: BlockCategory): BlockSchema[];
  static getAllSchemas(): BlockSchema[];
}
```

### BlockIntegration

```typescript
class BlockIntegration {
  static analyzeNode(node: FigmaNode): BlockAnalysisResult;
  static getBlockStatistics(nodes: FigmaNode[]): BlockStatistics;
}
```

## Resources

- **Implementation:** `/validation/block-classifier.ts`
- **Schemas:** `/validation/block-semantic-mapper.ts`
- **Integration:** `/validation/block-integration.ts`
- **Tests:** `/validation/test-blocks.ts`
- **Full Report:** `/validation/PHASE_7_BLOCKS_REPORT.md`

---

*Last Updated: 2025-11-10*
*Version: 1.0.0*
