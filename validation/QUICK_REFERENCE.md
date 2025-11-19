# Component Generation Quick Reference

## Entry Points

### Generate from Plugin Export
**File**: `/Users/zackarychapple/code/figma-research-clean/validation/generate-from-plugin-export.js`

**Usage**:
```bash
node generate-from-plugin-export.js input.json output-directory
```

**What it does**:
1. Reads Figma plugin JSON export
2. Extracts component data and simplifies tree
3. Creates prompt for Claude Sonnet 4.5
4. Generates React/TypeScript component code
5. Saves component, metadata, and prompt to output folder

### From Component Inventory
**File**: `/Users/zackarychapple/code/figma-research-clean/validation/semantic-code-generator.ts`

**What it does**:
- Template-based component generation
- Fallback when AI generation fails
- Supports multiple generation strategies

---

## Core Components

### 1. JSON Parsing
**File**: `enhanced-figma-parser.ts`

**Key Functions**:
- `FigmaNode` interface - Core Figma node structure
- `ExtractedStyles` interface - Parsed style definitions
- `ComponentClassifier` - Classifies nodes into component types

### 2. Classification System
**File**: `component-identifier.ts`

**Process**:
1. Extract component data from FigmaNode
2. Identify type (Button, Card, etc.)
3. Extract properties (variant, size, text, icon)
4. Build component inventory

**Supported Types**: 30+ component types (see COMPONENT_GENERATION_ANALYSIS.md)

### 3. Semantic Mapping
**File**: `semantic-mapper.ts`

**What it maps**:
- Figma layer hierarchy → ShadCN component slots
- Named layers → CardHeader, CardTitle, etc.
- Position-based detection → Footer detection
- Text content → Typography mapping

**Detection Rules**:
- `nameMatches()` - Pattern matching on layer names
- `isAtPosition()` - Top/bottom/middle detection
- `hasTextContent()` - Text node detection
- `isTitleLike()` - Semantic title detection
- `isDescriptionLike()` - Semantic description detection

### 4. Block Mapping
**File**: `block-semantic-mapper.ts`

**Supported Blocks**:
- Hero (Simple, Split, Centered)
- Feature (Grid, With Icons)
- Pricing (Cards, Table)
- Authentication (Login, Register, Password Reset)
- Dashboard (Stats, Header)
- E-commerce (Product Card, Product List)
- Marketing (Testimonials, CTA, Footer, Header)
- Content (Blog Card)

---

## JSON Structure Quick Reference

### Complete Node Example
```json
{
  "node": {
    "id": "17318:4023",
    "name": "Button / Primary",
    "type": "COMPONENT",
    "visible": true,
    "opacity": 1,
    
    // Dimensions
    "absoluteBoundingBox": { "x": 0, "y": 0, "width": 120, "height": 40 },
    
    // Layout (for auto-layout frames)
    "layoutMode": "HORIZONTAL",
    "primaryAxisSizingMode": "FIXED",
    "counterAxisSizingMode": "FIXED",
    "primaryAxisAlignItems": "CENTER",
    "counterAxisAlignItems": "CENTER",
    "paddingLeft": 16,
    "paddingRight": 16,
    "paddingTop": 8,
    "paddingBottom": 8,
    "itemSpacing": 8,
    "cornerRadius": 6,
    
    // Colors and effects
    "fills": [{"type": "SOLID", "color": {"r": 0, "g": 0.5, "b": 1, "a": 1}}],
    "strokes": [{"type": "SOLID", "color": {"r": 0.9, "g": 0.9, "b": 0.9, "a": 1}}],
    "effects": [{"type": "DROP_SHADOW", "radius": 4, "offset": {"x": 0, "y": 2}}],
    
    // Typography (TEXT nodes only)
    "characters": "Click me",
    "fontSize": 14,
    "fontName": {"family": "Inter", "style": "Medium"},
    "fontWeight": 500,
    "textAlignHorizontal": "CENTER",
    "textAlignVertical": "CENTER",
    
    // Hierarchy
    "children": [
      {"name": "Icon", "type": "INSTANCE"},
      {"name": "Label", "type": "TEXT", "characters": "Click me"}
    ]
  }
}
```

### Layout Values
```
layoutMode: "HORIZONTAL" | "VERTICAL" | "NONE"
primaryAxisSizingMode: "FIXED" | "HUG" | "FILL"
counterAxisSizingMode: "FIXED" | "HUG" | "FILL"
primaryAxisAlignItems: "MIN" | "CENTER" | "MAX" | "SPACE_BETWEEN"
counterAxisAlignItems: "MIN" | "CENTER" | "MAX" | "BASELINE"
```

### Node Types
```
"FRAME" - Container/layout
"COMPONENT" - Reusable component
"INSTANCE" - Component instance
"TEXT" - Text node
"RECTANGLE" - Shape
"VECTOR" - Vector graphic
"GROUP" - Group of nodes
```

---

## Generation Pipeline

```
Input JSON
    ↓
Extract Component Data
    ↓
Simplify Node Tree (depth≤5, children≤20)
    ↓
Classify Component Type
    ↓
Create Prompt
    ↓
Generate Code (Claude Sonnet 4.5)
    ↓
Clean Markdown
    ↓
Save Component, Metadata, Prompt
```

---

## Template Generation (Fallback)

### Button Template
```typescript
<Button variant="${variant}" size="${size}">
  <${icon} className="mr-2 h-4 w-4" />
  ${text}
</Button>
```

### Card Template
```typescript
<Card>
  <CardHeader>
    <CardTitle>${title}</CardTitle>
    <CardDescription>${description}</CardDescription>
  </CardHeader>
  <CardContent>${content}</CardContent>
  <CardFooter>${footer}</CardFooter>
</Card>
```

### Container Template
```typescript
<div className="flex flex-${direction} gap-${gap} ${alignment}">
  ${children}
</div>
```

---

## Supported Components by Phase

### Phase 1-2: Basic (18 types)
Button, Badge, Card, Input, Dialog, Select, DatePicker, Checkbox, Radio, Switch, Textarea, Label, Separator, Avatar, Icon

### Phase 3: Data Display (9 types)
Table, Chart, Carousel, Tooltip, HoverCard, Skeleton, Progress, Empty, Breadcrumb

### Phase 4: Feedback (5 types)
Drawer, Sheet, Popover, Sonner, Spinner

### Phase 5: Advanced Input (6 types)
Calendar, DatePicker, InputOTP, InputGroup, Combobox, Command

---

## Key File Paths

| File | Purpose |
|------|---------|
| `generate-from-plugin-export.js` | Main entry point |
| `semantic-code-generator.ts` | Template generation |
| `semantic-mapper.ts` | Slot detection |
| `component-identifier.ts` | Type identification |
| `enhanced-figma-parser.ts` | Node parsing & style extraction |
| `block-classifier.ts` | Block classification |
| `test-phase3-components.ts` | 84 test cases for Phase 3 |

---

## Cost Optimization Tips

1. **Tree Simplification**: Limited to depth 5, first 20 children
2. **Property Filtering**: Only relevant styles included
3. **Token Count**: ~2000-3000 input, 1000-2000 output
4. **Cost**: ~$0.015-$0.030 per component (Sonnet 4.5)

---

## Detection Rule Weights

| Rule Type | Weight | Use Case |
|-----------|--------|----------|
| name_pattern | 0.5 | Layer named "CardHeader" |
| semantic | 0.5 | Detected title/description |
| position | 0.3 | Top/bottom detection |
| content_type | 0.2 | Text content detection |
| hierarchy | 1.0 | Root container |

---

## Common Patterns

### Header Detection
```
- Name contains: "header", "top"
- Position: Top of siblings
- Content: Has text children
```

### Title Detection
```
- Name contains: "title", "heading", "h1"
- Has text content
- Usually first child
- Larger font size
```

### Content Detection
```
- Name contains: "content", "body", "main"
- Middle position in hierarchy
- Container type (FRAME)
```

### Footer Detection
```
- Name contains: "footer", "actions", "buttons"
- Position: Bottom of siblings
- Contains buttons/controls
```

---

## Debug Tips

1. **Check component classification**: Look at `componentType` field
2. **Verify children parsing**: Count actual vs expected children
3. **Validate Tailwind classes**: Ensure proper gap/padding mapping
4. **Review detection confidence**: >0.8 is good, <0.5 needs review
5. **Compare templates vs AI**: Use template as baseline for validation

---

## Test Suite

Run Phase 3 component tests:
```bash
npx tsx test-phase3-components.ts
```

Expected output: 84 test cases covering:
- Tables (3 tests)
- Charts (4 tests)
- Carousels (2 tests)
- Tooltips (3 tests)
- HoverCards (2 tests)
- Skeletons (3 tests)
- Progress (4 tests)
- Empty States (4 tests)

---

## Full Documentation

See `COMPONENT_GENERATION_ANALYSIS.md` for:
- Complete JSON structure reference
- Detailed generation flow
- Semantic mapping schemas
- Working examples with code
- Phase 3 component details
