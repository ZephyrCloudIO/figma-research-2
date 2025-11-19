# Figma to React Component Generation: Complete Analysis

## Overview
This document details how component generation from JSON export works in the validation pipeline, including JSON structure, parsing approach, DOM generation, and working examples.

---

## 1. JSON Structure from Plugin Export

### Top-Level Structure
The Figma plugin exports JSON with this core structure:

```json
{
  "document": {
    "id": "17318:4023",
    "name": "Component Name",
    "type": "INSTANCE|COMPONENT|FRAME|TEXT|RECTANGLE",
    "visible": true,
    "opacity": 1,
    
    // Layout properties
    "layoutMode": "HORIZONTAL|VERTICAL",
    "primaryAxisSizingMode": "FIXED|HUG|FILL",
    "counterAxisSizingMode": "FIXED|HUG|FILL",
    "primaryAxisAlignItems": "MIN|CENTER|MAX|SPACE_BETWEEN",
    "counterAxisAlignItems": "MIN|CENTER|MAX|BASELINE",
    "paddingLeft": 16,
    "paddingRight": 16,
    "paddingTop": 12,
    "paddingBottom": 12,
    "itemSpacing": 10,
    "cornerRadius": 4,
    
    // Styling
    "fills": [{
      "type": "SOLID",
      "color": { "r": 0.96, "g": 0.96, "b": 0.96, "a": 1 },
      "opacity": 1,
      "blendMode": "NORMAL"
    }],
    "strokes": [{
      "type": "SOLID",
      "color": { "r": 0.9, "g": 0.9, "b": 0.9, "a": 1 },
      "strokeWeight": 1
    }],
    "effects": [{
      "type": "DROP_SHADOW",
      "radius": 4,
      "offset": { "x": 0, "y": 2 },
      "color": { "r": 0, "g": 0, "b": 0, "a": 0.1 }
    }],
    
    // Typography (for TEXT nodes)
    "characters": "Button Text",
    "fontSize": 14,
    "fontName": { "family": "Inter", "style": "Medium" },
    "fontWeight": 500,
    "textAlignHorizontal": "CENTER",
    "textAlignVertical": "CENTER",
    "letterSpacing": 0,
    "lineHeight": { "value": 20, "unit": "PIXELS" },
    
    // Dimensions
    "absoluteBoundingBox": {
      "x": 1657,
      "y": 1526,
      "width": 125,
      "height": 67
    },
    "size": { "x": 125, "y": 67 },
    
    // Hierarchy
    "children": [
      { /* child nodes */ }
    ]
  },
  "components": {
    "190:897": {
      "key": "f14bca8ce...",
      "name": "Button / Primary",
      "description": "",
      "remote": false
    }
  },
  "styles": {
    "4:5041": {
      "key": "283ed2bc...",
      "name": "text-sm/leading-normal/medium",
      "styleType": "TEXT"
    }
  }
}
```

### FigmaNode Type Definition
Core interface representing Figma nodes:

```typescript
export interface FigmaNode {
  id?: string;
  name: string;
  type: string;  // FRAME, COMPONENT, INSTANCE, TEXT, RECTANGLE, VECTOR, etc.
  visible?: boolean;
  opacity?: number;
  
  // Layout
  size?: { x: number; y: number };
  layoutMode?: string;  // HORIZONTAL, VERTICAL, NONE
  primaryAxisSizingMode?: string;
  counterAxisSizingMode?: string;
  primaryAxisAlignItems?: string;
  counterAxisAlignItems?: string;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
  
  // Style
  fills?: any[];
  strokes?: any[];
  effects?: any[];
  cornerRadius?: number;
  
  // Typography
  characters?: string;
  fontSize?: number;
  fontName?: { family: string; style: string };
  fontWeight?: number;
  
  // Relationships
  children?: FigmaNode[];
  isComponent?: boolean;
  isInstance?: boolean;
}
```

---

## 2. Component Generation Flow

### Step 1: Extract Component Data
**File**: `generate-from-plugin-export.js`

```typescript
extractComponentData(pluginData) {
  const node = pluginData.node || pluginData;
  
  return {
    name: node.name,
    type: node.type,
    width: node.absoluteBoundingBox?.width || 0,
    height: node.absoluteBoundingBox?.height || 0,
    children: node.children || [],
    fills: node.fills || [],
    strokes: node.strokes || [],
    effects: node.effects || [],
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
```

### Step 2: Simplify Node Tree (Token Optimization)
Converts complex Figma tree to simplified structure for LLM processing:

```typescript
simplifyNodeTree(node, depth = 0, maxDepth = 5) {
  // Limit depth to prevent truncation
  if (depth > maxDepth) {
    return { name: node.name, type: node.type, truncated: true };
  }
  
  const simplified = {
    name: node.name,
    type: node.type,
    visible: node.visible,
    bounds: {
      width: Math.round(node.absoluteBoundingBox.width),
      height: Math.round(node.absoluteBoundingBox.height)
    },
    // Layout information
    layout: node.layoutMode ? {
      mode: node.layoutMode,
      spacing: node.itemSpacing,
      padding: {
        top: node.paddingTop,
        right: node.paddingRight,
        bottom: node.paddingBottom,
        left: node.paddingLeft
      },
      primaryAlign: node.primaryAxisAlignItems,
      counterAlign: node.counterAxisAlignItems
    } : undefined,
    // Colors and effects
    fills: node.fills?.slice(0, 2).map(f => ({
      type: f.type,
      color: f.color,
      opacity: f.opacity
    })),
    strokes: node.strokes?.slice(0, 1).map(s => s.color),
    effects: node.effects?.slice(0, 2).map(e => ({
      type: e.type,
      radius: e.radius,
      color: e.color
    })),
    cornerRadius: node.cornerRadius,
    // Typography (for TEXT nodes)
    text: node.type === 'TEXT' ? {
      content: node.characters,
      fontSize: node.fontSize,
      fontFamily: node.fontFamily,
      fontWeight: node.fontWeight,
      textAlignHorizontal: node.textAlignHorizontal
    } : undefined,
    // Children (limited to 20)
    children: node.children
      ?.filter(child => child.visible !== false)
      .slice(0, 20)
      .map(child => this.simplifyNodeTree(child, depth + 1, maxDepth))
  };
  
  return simplified;
}
```

### Step 3: Create Code Generation Prompt
The simplified tree is sent to Claude with detailed requirements:

```typescript
createPrompt(component) {
  const simplifiedTree = this.simplifyNodeTree(component.rawNode);
  
  return `You are an expert React + TypeScript + ShadCN + Tailwind CSS developer. 
Generate a pixel-perfect React component based on this Figma design export.

# Component Overview
Name: ${component.name}
Type: ${component.type}
Dimensions: ${component.width}x${component.height}px

# Layout Information
Layout Mode: ${component.layoutMode}
Item Spacing: ${component.itemSpacing}px
Padding: ${component.paddingTop}px ${component.paddingRight}px ${component.paddingBottom}px ${component.paddingLeft}px
Corner Radius: ${component.cornerRadius}px

# Simplified Node Structure
${JSON.stringify(simplifiedTree, null, 2)}

# Requirements
1. Use React + TypeScript
2. Use ShadCN components when appropriate
3. Use Tailwind CSS for styling
4. Match the design closely
5. Include prop types
6. Add JSDoc comments
7. Follow React best practices

# Output Format
Provide ONLY the complete React component code. 
Start directly with imports, no markdown code blocks.`;
}
```

### Step 4: Generate Code with Claude
Uses OpenRouter API to call Claude Sonnet 4.5:

```typescript
async generate(pluginData) {
  const component = this.extractComponentData(pluginData);
  const prompt = this.createPrompt(component);
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'anthropic/claude-sonnet-4.5',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 4000
    })
  });
  
  const data = await response.json();
  return data.choices[0].message.content;
}
```

---

## 3. Component Identification & Classification

### Classification Rules
**File**: `component-identifier.ts` and `enhanced-figma-parser.ts`

Components are identified using name patterns and type detection:

```typescript
function identifyComponentType(node: FigmaNode): ShadCNComponentType | null {
  const nodeName = node.name.toLowerCase();
  const nodeType = node.type;
  
  // Pattern-based detection
  if (nodeType === 'INSTANCE' && nodeName.includes('button')) {
    return 'Button';
  }
  if (nodeType === 'INSTANCE' && nodeName.includes('badge')) {
    return 'Badge';
  }
  if (nodeType === 'INSTANCE' && nodeName.includes('card')) {
    return 'Card';
  }
  if (nodeType === 'INSTANCE' && nodeName.includes('input') || nodeName.includes('text field')) {
    return 'Input';
  }
  if (nodeType === 'INSTANCE' && nodeName.includes('dialog') || nodeName.includes('modal')) {
    return 'Dialog';
  }
  if (nodeType === 'INSTANCE' && nodeName.includes('select') || nodeName.includes('dropdown')) {
    return 'Select';
  }
  // ... more patterns
  
  return null;
}
```

### Supported Component Types

**Phase 1 & 2: Basic Components**
- Button, Badge, Card, Input, Dialog, Select, DatePicker
- Checkbox, Radio, Switch, Textarea, Label, Separator, Avatar, Icon

**Phase 3: Data Display**
- Table (154 variants)
- Chart (108 variants - Bar, Line, Pie, Area)
- Carousel (29 variants)
- Tooltip (5 variants)
- HoverCard (11 variants)
- Skeleton (4 variants)
- Progress (6 variants)
- Empty (11 variants)

**Phase 4: Feedback & Overlays**
- Drawer, Sheet, Popover, Sonner (Toast), Spinner

**Phase 5: Advanced Inputs**
- Calendar, DatePicker, InputOTP, InputGroup, Combobox, Command

---

## 4. DOM Structure Generation via Semantic Mapping

### Semantic Mapping System
**File**: `semantic-mapper.ts`

Maps Figma layer hierarchy to ShadCN component sub-component structure:

```typescript
export interface ShadCNComponentSlot {
  name: string;
  required: boolean;
  description: string;
  detectionRules: SlotDetectionRule[];
  children?: ShadCNComponentSlot[];
  allowsMultiple?: boolean;
}
```

### Example: Card Component Schema

```typescript
static getCardSchema(): ShadCNComponentSchema {
  return {
    componentType: 'Card',
    shadcnName: 'Card',
    wrapperComponent: 'Card',
    importPath: '@/components/ui/card',
    slots: [
      {
        name: 'CardHeader',
        required: false,
        description: 'Header section',
        detectionRules: [
          {
            type: 'name_pattern',
            weight: 0.5,
            matcher: (node, ctx) => DetectionRules.nameMatches(node, ['header', 'top'])
          },
          {
            type: 'position',
            weight: 0.3,
            matcher: (node, ctx) => DetectionRules.isAtPosition(node, ctx, 'top')
          },
          {
            type: 'semantic',
            weight: 0.2,
            matcher: (node, ctx) => DetectionRules.isHeaderLike(node, ctx)
          }
        ],
        children: [
          {
            name: 'CardTitle',
            required: false,
            detectionRules: [
              {
                type: 'semantic',
                weight: 0.5,
                matcher: (node, ctx) => DetectionRules.isTitleLike(node, ctx)
              }
            ]
          },
          {
            name: 'CardDescription',
            required: false,
            detectionRules: [
              {
                type: 'semantic',
                weight: 0.5,
                matcher: (node, ctx) => DetectionRules.isDescriptionLike(node, ctx)
              }
            ]
          }
        ]
      },
      {
        name: 'CardContent',
        required: false,
        detectionRules: [
          {
            type: 'semantic',
            weight: 0.5,
            matcher: (node, ctx) => DetectionRules.isContentLike(node, ctx)
          }
        ]
      },
      {
        name: 'CardFooter',
        required: false,
        detectionRules: [
          {
            type: 'semantic',
            weight: 0.5,
            matcher: (node, ctx) => DetectionRules.isFooterLike(node, ctx)
          }
        ]
      }
    ]
  };
}
```

### Detection Rules

Built-in semantic detection functions:

```typescript
export class DetectionRules {
  // Name-based detection
  static nameMatches(node: FigmaNode, patterns: string[]): number
  
  // Position-based detection (top, bottom, middle)
  static isAtPosition(node: FigmaNode, context: DetectionContext, position: 'top' | 'bottom' | 'middle'): number
  
  // Content type detection
  static hasTextContent(node: FigmaNode): number
  
  // Semantic detection
  static isTitleLike(node: FigmaNode, context: DetectionContext): number
  static isDescriptionLike(node: FigmaNode, context: DetectionContext): number
  static isContentLike(node: FigmaNode, context: DetectionContext): number
  static isFooterLike(node: FigmaNode, context: DetectionContext): number
  static isHeaderLike(node: FigmaNode, context: DetectionContext): number
}
```

---

## 5. Template-Based Code Generation

### Semantic Code Generator
**File**: `semantic-code-generator.ts`

Falls back to template generation if AI fails:

```typescript
function generateComponentCode(component: ComponentInstance, depth: number = 0): string {
  const indent = '  '.repeat(depth + 1);
  
  switch (component.componentType) {
    case 'Button': {
      const props = [];
      if (component.variant && component.variant !== 'default') {
        props.push(`variant="${component.variant}"`);
      }
      if (component.size && component.size !== 'default') {
        props.push(`size="${component.size}"`);
      }
      
      const content = [];
      // Add leading icon if present
      if (component.icon) {
        content.push(`<${component.icon} className="mr-2 h-4 w-4" />`);
      }
      // Add text
      if (component.text) {
        content.push(component.text);
      }
      
      const propsStr = props.length > 0 ? ` ${props.join(' ')}` : '';
      return `${indent}<Button${propsStr}>${content.join('')}</Button>`;
    }
    
    case 'Card': {
      // Generate Card with CardHeader, CardTitle, CardContent, CardFooter
      const body = component.children
        .map(child => generateComponentCode(child, depth + 1))
        .join('\n');
      return `${indent}<Card>\n${body}\n${indent}</Card>`;
    }
    
    case 'Container': {
      // Generate flex container with layout classes
      const classes = ['flex'];
      if (component.properties.layout === 'horizontal') {
        classes.push('flex-row');
      } else {
        classes.push('flex-col');
      }
      
      // Add alignment classes
      if (component.properties.primaryAxisAlignItems === 'CENTER') {
        classes.push('justify-center');
      }
      if (component.properties.counterAxisAlignItems === 'CENTER') {
        classes.push('items-center');
      }
      
      // Add spacing
      if (component.properties.gap) {
        const gap = component.properties.gap;
        if (gap <= 8) classes.push('gap-2');
        else if (gap <= 16) classes.push('gap-4');
        else classes.push('gap-6');
      }
      
      const childrenCode = component.children
        .map(child => generateComponentCode(child, depth + 1))
        .join('\n');
      
      return `${indent}<div className="${classes.join(' ')}">\n${childrenCode}\n${indent}</div>`;
    }
  }
  
  return '';
}
```

---

## 6. Working Example: Button Generation

### Input JSON (Simplified)
```json
{
  "node": {
    "name": "Button / Primary",
    "type": "COMPONENT",
    "absoluteBoundingBox": { "x": 0, "y": 0, "width": 120, "height": 40 },
    "layoutMode": "HORIZONTAL",
    "paddingLeft": 16,
    "paddingRight": 16,
    "paddingTop": 8,
    "paddingBottom": 8,
    "itemSpacing": 8,
    "cornerRadius": 6,
    "fills": [{ "color": { "r": 0, "g": 0.5, "b": 1, "a": 1 } }],
    "children": [
      {
        "name": "Icon",
        "type": "INSTANCE",
        "visible": true,
        "absoluteBoundingBox": { "width": 16, "height": 16 }
      },
      {
        "name": "Label",
        "type": "TEXT",
        "characters": "Click me",
        "fontSize": 14,
        "fontWeight": 500,
        "textAlignHorizontal": "CENTER"
      }
    ]
  }
}
```

### Generated React Component
```typescript
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface ButtonComponentProps {
  className?: string;
}

export function ButtonComponent({ className }: ButtonComponentProps) {
  return (
    <Button variant="primary" size="default" className={className}>
      <ChevronRight className="mr-2 h-4 w-4" />
      Click me
    </Button>
  );
}
```

---

## 7. Phase 3 Component Examples

### Table Generation

**Input Node Structure**:
```
Table (FRAME)
├── TableHeader (FRAME, HORIZONTAL)
│   ├── TableHead-Name (TEXT)
│   ├── TableHead-Email (TEXT)
│   └── TableHead-Status (TEXT)
└── TableBody (FRAME, VERTICAL)
    ├── TableRow-1 (FRAME, HORIZONTAL)
    │   ├── TableCell (TEXT)
    │   ├── TableCell (TEXT)
    │   └── TableCell (TEXT)
    └── TableRow-2 (FRAME, HORIZONTAL)
        ├── TableCell (TEXT)
        ├── TableCell (TEXT)
        └── TableCell (TEXT)
```

**Generated Component**:
```typescript
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function DataTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>John Doe</TableCell>
          <TableCell>john@example.com</TableCell>
          <TableCell>Active</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
```

### Carousel Generation

**Input Node Structure**:
```
Carousel (COMPONENT, HORIZONTAL)
├── Arrow Left (INSTANCE)
├── Carousel Container (FRAME)
│   ├── Slide 1 (FRAME)
│   ├── Slide 2 (FRAME)
│   └── Slide 3 (FRAME)
├── Arrow Right (INSTANCE)
└── Dots (FRAME)
```

**Generated Component**:
```typescript
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

export function ImageCarousel() {
  return (
    <Carousel>
      <CarouselContent>
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>Slide 2</CarouselItem>
        <CarouselItem>Slide 3</CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
```

---

## 8. Key Files in Validation Folder

| File | Purpose |
|------|---------|
| `generate-from-plugin-export.js` | Main entry point for generating components from JSON |
| `semantic-code-generator.ts` | Template-based code generation fallback |
| `semantic-mapper.ts` | Maps Figma hierarchy to ShadCN component structure |
| `block-semantic-mapper.ts` | Block-level component schemas (Hero, Feature, etc.) |
| `component-identifier.ts` | Identifies component types from Figma nodes |
| `enhanced-figma-parser.ts` | Extracts styles and classifies components |
| `block-classifier.ts` | Classifies Figma blocks into component categories |
| `test-phase3-components.ts` | Test suite for Phase 3 components (84 test cases) |

---

## 9. JSON Parsing Strategy

### Top-Down Recursive Approach

1. **Extract Root Component**
   - Get component name, type, dimensions
   - Extract layout properties (mode, spacing, alignment)
   - Extract styling (colors, strokes, effects)

2. **Classify Component Type**
   - Match name against patterns (Button, Card, etc.)
   - Infer semantic meaning from children structure
   - Confidence scoring for classification

3. **Recursively Process Children**
   - For each child node, repeat steps 1-2
   - Build component tree/hierarchy
   - Detect component slots (Header, Content, Footer)

4. **Generate Code**
   - Use semantic mapping to emit ShadCN components
   - Apply Tailwind classes based on layout properties
   - Nest components according to hierarchy

### Example: Recursive Processing

```typescript
function parseNode(node: FigmaNode, depth = 0): ComponentInstance {
  // 1. Classify
  const componentType = identifyComponentType(node);
  
  // 2. Extract properties
  const instance: ComponentInstance = {
    id: node.id,
    name: node.name,
    figmaType: node.type,
    componentType,
    variant: extractVariant(node.name),
    size: extractSize(node.name),
    text: node.characters,
    position: { x: node.absoluteBoundingBox?.x || 0, y: node.absoluteBoundingBox?.y || 0 },
    dimensions: { 
      width: node.absoluteBoundingBox?.width || 0, 
      height: node.absoluteBoundingBox?.height || 0 
    },
    properties: extractProperties(node),
    children: [],
    rawNode: node
  };
  
  // 3. Recursively process children
  if (node.children && node.children.length > 0) {
    instance.children = node.children
      .filter(child => child.visible !== false)
      .map(child => parseNode(child, depth + 1));
  }
  
  return instance;
}
```

---

## 10. Cost Optimization

### Token Efficiency

1. **Tree Simplification**: Limits depth to 5, children to 20
2. **Property Filtering**: Only includes relevant style properties
3. **Color Simplification**: Takes first 2 fills, 1 stroke
4. **Effect Limiting**: Takes first 2 effects only

**Typical Cost**:
- Input tokens: 2000-3000 (simplified tree)
- Output tokens: 1000-2000 (component code)
- Cost per generation: $0.015-$0.030 (using Claude Sonnet 4.5)

---

## 11. Error Handling & Validation

### Classification Confidence Scoring

```typescript
interface ComponentClassification {
  type: ComponentType;
  confidence: number;  // 0-1 score
  reasons: string[];   // Why this classification was chosen
}
```

### Common Patterns for Validation

- Verify children exist before accessing
- Check visible flag before processing nodes
- Validate required properties before generating code
- Fall back to Container if type unknown

---

## Summary

**Key Takeaways:**

1. **JSON Structure**: Figma exports hierarchical node tree with layout, styling, and typography properties

2. **Generation Flow**: Extract → Simplify → Classify → Generate via Claude or Template

3. **Component Identification**: Uses name patterns, node types, and semantic rules

4. **DOM Generation**: Semantic mapping rules detect component slots (Header, Content, Footer)

5. **Template Generation**: Fallback system using known ShadCN component patterns

6. **Phase 3 Support**: Tables, Charts, Carousels, Tooltips, HoverCards, Skeletons, Progress, Empty states

7. **Cost Optimized**: Token-aware tree simplification keeps costs low

8. **Highly Modular**: Separate concerns for parsing, classification, mapping, and code generation

