/**
 * Enhanced Figma Parser
 *
 * Extracts complete style definitions and automatically classifies components
 * by type for better matching and code generation.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface FigmaNode {
  id?: string;
  guid?: { sessionID: number; localID: number };
  name: string;
  type: string;
  visible?: boolean;
  opacity?: number;

  // Layout
  size?: { x: number; y: number };
  relativeTransform?: {
    m00: number; m01: number; m02: number;
    m10: number; m11: number; m12: number;
  };
  layoutMode?: string;
  primaryAxisSizingMode?: string;
  counterAxisSizingMode?: string;
  primaryAxisAlignItems?: string;
  counterAxisAlignItems?: string;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
  layoutGrow?: number;

  // Style
  fills?: any[];
  strokes?: any[];
  effects?: any[];
  strokeWeight?: number;
  strokeAlign?: string;
  cornerRadius?: number;
  rectangleCornerRadii?: number[];

  // Typography
  characters?: string;
  fontSize?: number;
  fontName?: { family: string; style: string };
  fontWeight?: number;
  textAlignHorizontal?: string;
  textAlignVertical?: string;
  letterSpacing?: { value: number; units: string };
  lineHeight?: { value: number; units: string };

  // Relationships
  children?: FigmaNode[];
  isComponent?: boolean;
  isInstance?: boolean;
}

export interface ExtractedColor {
  hex: string;
  rgb: string;
  rgba: string;
  opacity: number;
  type: 'fill' | 'stroke' | 'text' | 'shadow';
}

export interface ExtractedTypography {
  fontFamily: string;
  fontSize: number;
  fontWeight: number | string;
  fontStyle: string;
  lineHeight: { value: number; unit: string };
  letterSpacing: { value: number; unit: string };
  textAlign: string;
  textAlignVertical: string;
}

export interface ExtractedEffect {
  type: 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR';
  radius: number;
  color?: ExtractedColor;
  offset?: { x: number; y: number };
  spread?: number;
  visible: boolean;
}

export interface ExtractedSpacing {
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  gap?: number;
}

export interface ExtractedStyles {
  colors: {
    background?: ExtractedColor[];
    text?: ExtractedColor[];
    border?: ExtractedColor[];
  };
  typography?: ExtractedTypography;
  effects: ExtractedEffect[];
  spacing: ExtractedSpacing;
  borderRadius: number | number[];
  dimensions: { width: number; height: number };
  layout?: {
    mode: string;
    direction: string;
    align: string;
    justify: string;
  };
}

export interface ComponentClassification {
  type: ComponentType;
  confidence: number;
  reasons: string[];
}

export type ComponentType =
  | 'Button'
  | 'Input'
  | 'Textarea'
  | 'Card'
  | 'Dialog'
  | 'Select'
  | 'Checkbox'
  | 'Radio'
  | 'RadioGroup'
  | 'Switch'
  | 'Slider'
  | 'Toggle'
  | 'ToggleGroup'
  | 'Badge'
  | 'Avatar'
  | 'Icon'
  | 'Form'
  | 'Field'
  | 'Tabs'
  | 'DropdownMenu'
  | 'NavigationMenu'
  | 'Breadcrumb'
  | 'Sidebar'
  | 'Pagination'
  | 'Menubar'
  | 'Accordion'
  | 'Collapsible'
  | 'Separator'
  | 'AspectRatio'
  | 'Resizable'
  | 'ScrollArea'
  | 'ContextMenu'
  | 'DataTable'
  | 'Table'
  | 'Kbd'
  | 'Chart'
  | 'Carousel'
  | 'Tooltip'
  | 'HoverCard'
  | 'Skeleton'
  | 'Progress'
  | 'Empty'
  | 'Alert'
  | 'AlertDialog'
  | 'Drawer'
  | 'Sheet'
  | 'Popover'
  | 'Sonner'
  | 'Spinner'
  | 'Container'
  | 'Text'
  | 'Image'
  | 'Calendar'
  | 'DatePicker'
  | 'InputOTP'
  | 'InputGroup'
  | 'Combobox'
  | 'Command'
  | 'Unknown';

export interface EnhancedComponent {
  id: string;
  name: string;
  type: ComponentType;
  confidence: number;
  styles: ExtractedStyles;
  tailwindClasses: string[];
  cssProperties: Record<string, string>;
  classification: ComponentClassification;
  children?: EnhancedComponent[];
}

// ============================================================================
// COLOR EXTRACTION
// ============================================================================

export class ColorExtractor {
  /**
   * Convert Figma color (0-1) to RGB (0-255)
   */
  static figmaColorToRgb(color: any): { r: number; g: number; b: number } {
    return {
      r: Math.round((color.r || 0) * 255),
      g: Math.round((color.g || 0) * 255),
      b: Math.round((color.b || 0) * 255)
    };
  }

  /**
   * Convert RGB to hex
   */
  static rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b]
      .map(x => x.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Extract color with all formats
   */
  static extractColor(figmaColor: any, opacity: number = 1, type: 'fill' | 'stroke' | 'text' | 'shadow' = 'fill'): ExtractedColor {
    const rgb = this.figmaColorToRgb(figmaColor);
    const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);
    const finalOpacity = opacity !== undefined ? opacity : (figmaColor.a !== undefined ? figmaColor.a : 1);

    return {
      hex,
      rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      rgba: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${finalOpacity.toFixed(3)})`,
      opacity: finalOpacity,
      type
    };
  }

  /**
   * Extract all fills from a node
   */
  static extractFills(node: FigmaNode): ExtractedColor[] {
    if (!node.fills || node.fills.length === 0) return [];

    return node.fills
      .filter(fill => fill.visible !== false && fill.type === 'SOLID')
      .map(fill => this.extractColor(fill.color, fill.opacity, 'fill'));
  }

  /**
   * Extract all strokes from a node
   */
  static extractStrokes(node: FigmaNode): ExtractedColor[] {
    if (!node.strokes || node.strokes.length === 0) return [];

    return node.strokes
      .filter(stroke => stroke.visible !== false && stroke.type === 'SOLID')
      .map(stroke => this.extractColor(stroke.color, stroke.opacity, 'stroke'));
  }

  /**
   * Extract text color from a text node
   */
  static extractTextColor(node: FigmaNode): ExtractedColor | null {
    if (node.type !== 'TEXT' || !node.fills || node.fills.length === 0) return null;

    const textFill = node.fills.find(fill => fill.visible !== false && fill.type === 'SOLID');
    if (!textFill) return null;

    return this.extractColor(textFill.color, textFill.opacity, 'text');
  }
}

// ============================================================================
// TYPOGRAPHY EXTRACTION
// ============================================================================

export class TypographyExtractor {
  /**
   * Map Figma font weights to CSS numeric values
   */
  static mapFontWeight(fontStyle: string): number {
    const weightMap: Record<string, number> = {
      'Thin': 100,
      'Extra Light': 200,
      'ExtraLight': 200,
      'Light': 300,
      'Regular': 400,
      'Normal': 400,
      'Medium': 500,
      'Semi Bold': 600,
      'SemiBold': 600,
      'Bold': 700,
      'Extra Bold': 800,
      'ExtraBold': 800,
      'Black': 900
    };

    return weightMap[fontStyle] || 400;
  }

  /**
   * Extract complete typography information
   */
  static extractTypography(node: FigmaNode): ExtractedTypography | null {
    if (node.type !== 'TEXT' || !node.fontName) return null;

    return {
      fontFamily: node.fontName.family,
      fontSize: node.fontSize || 14,
      fontWeight: this.mapFontWeight(node.fontName.style),
      fontStyle: node.fontName.style,
      lineHeight: node.lineHeight
        ? { value: node.lineHeight.value, unit: node.lineHeight.units }
        : { value: node.fontSize || 14, unit: 'PIXELS' },
      letterSpacing: node.letterSpacing
        ? { value: node.letterSpacing.value, unit: node.letterSpacing.units }
        : { value: 0, unit: 'PIXELS' },
      textAlign: node.textAlignHorizontal || 'LEFT',
      textAlignVertical: node.textAlignVertical || 'TOP'
    };
  }
}

// ============================================================================
// EFFECTS EXTRACTION
// ============================================================================

export class EffectsExtractor {
  /**
   * Extract shadow and blur effects
   */
  static extractEffects(node: FigmaNode): ExtractedEffect[] {
    if (!node.effects || node.effects.length === 0) return [];

    return node.effects
      .filter(effect => effect.visible !== false)
      .map(effect => {
        const extracted: ExtractedEffect = {
          type: effect.type,
          radius: effect.radius || 0,
          visible: effect.visible !== false
        };

        if (effect.color) {
          extracted.color = ColorExtractor.extractColor(
            effect.color,
            effect.color.a,
            'shadow'
          );
        }

        if (effect.offset) {
          extracted.offset = {
            x: effect.offset.x || 0,
            y: effect.offset.y || 0
          };
        }

        if (effect.spread !== undefined) {
          extracted.spread = effect.spread;
        }

        return extracted;
      });
  }

  /**
   * Convert effects to CSS box-shadow
   */
  static effectsToBoxShadow(effects: ExtractedEffect[]): string {
    const shadows = effects
      .filter(e => e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW')
      .map(effect => {
        const inset = effect.type === 'INNER_SHADOW' ? 'inset ' : '';
        const x = effect.offset?.x || 0;
        const y = effect.offset?.y || 0;
        const blur = effect.radius || 0;
        const spread = effect.spread || 0;
        const color = effect.color?.rgba || 'rgba(0,0,0,0.1)';

        return `${inset}${x}px ${y}px ${blur}px ${spread}px ${color}`;
      });

    return shadows.join(', ');
  }
}

// ============================================================================
// SPACING EXTRACTION
// ============================================================================

export class SpacingExtractor {
  /**
   * Extract padding and spacing
   */
  static extractSpacing(node: FigmaNode): ExtractedSpacing {
    return {
      padding: {
        top: node.paddingTop || 0,
        right: node.paddingRight || 0,
        bottom: node.paddingBottom || 0,
        left: node.paddingLeft || 0
      },
      gap: node.itemSpacing
    };
  }

  /**
   * Check if spacing is uniform
   */
  static isUniformPadding(spacing: ExtractedSpacing): boolean {
    const { top, right, bottom, left } = spacing.padding;
    return top === right && right === bottom && bottom === left;
  }

  /**
   * Check if spacing is symmetric (top/bottom and left/right pairs)
   */
  static isSymmetricPadding(spacing: ExtractedSpacing): boolean {
    const { top, right, bottom, left } = spacing.padding;
    return top === bottom && left === right;
  }
}

// ============================================================================
// COMPONENT CLASSIFICATION
// ============================================================================

export class ComponentClassifier {
  /**
   * Classify a component based on its properties
   */
  static classify(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const type = node.type;

    // Try each classifier in order of specificity
    const classifiers = [
      // Phase 3: Data Display components (check before generic components)
      this.classifyTable,        // Before DataTable (Phase 6)
      this.classifySkeleton,     // Before Tooltip/HoverCard (can be small and gray)
      this.classifyProgress,     // Before Chart (to avoid "bar"/"line" confusion)
      this.classifyEmpty,        // Before HoverCard (both have structured content)
      this.classifyChart,
      this.classifyCarousel,
      this.classifyTooltip,      // Before HoverCard (smaller, simpler)
      this.classifyHoverCard,
      // Phase 4: Feedback & Overlays (more specific first)
      this.classifyAlertDialog,  // Before Alert and Dialog
      this.classifyAlert,  // Before Sonner to avoid confusion
      this.classifyDrawer,
      this.classifySheet,
      this.classifyPopover,
      this.classifySonner,
      this.classifySpinner,
      // Phase 5: Advanced Inputs (composition components first)
      this.classifyDatePicker,  // Before Calendar (contains Calendar)
      this.classifyCalendar,
      this.classifyCombobox,  // Before Command (contains Command)
      this.classifyCommand,
      this.classifyInputOTP,
      this.classifyInputGroup,
      this.classifySlider,
      this.classifyTabs,
      this.classifyPagination,
      this.classifyToggleGroup,  // Before Breadcrumb and Textarea to prevent misclassification
      this.classifyBreadcrumb,
      this.classifyNavigationMenu,
      this.classifySidebar,
      this.classifyDropdownMenu,
      this.classifyMenubar,
      this.classifyButton,
      this.classifyInput,
      this.classifyField,
      this.classifyTextarea,
      this.classifyCheckbox,
      this.classifyRadioGroup,
      this.classifyRadio,
      this.classifySwitch,
      this.classifyToggle,
      this.classifySelect,
      this.classifyDialog,
      this.classifyCard,
      this.classifyForm,
      this.classifyBadge,
      this.classifyAvatar,
      this.classifyIcon,
      this.classifyText,
      this.classifyImage
    ];

    for (const classifier of classifiers) {
      const result = classifier.call(this, node);
      // Lowered threshold from 0.5 to 0.4 to catch more specific types
      if (result.confidence >= 0.4) {
        return result;
      }
    }

    return {
      type: 'Container',
      confidence: 0.3,
      reasons: ['No specific component type detected']
    };
  }

  /**
   * Button classification
   */
  static classifyButton(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    // Skip if this is an icon variant (let icon classifier handle it) (NEW)
    if (/size\s*=\s*icon/i.test(name)) {
      return {
        type: 'Button',
        confidence: 0,
        reasons: ['Size=icon suggests icon component, skipping button classification']
      };
    }

    // Name-based detection
    if (name.includes('button') || name.includes('btn')) {
      confidence += 0.5;
      reasons.push('Name contains "button"');
    }

    // Variant pattern detection (NEW)
    const hasVariantPattern = /variant\s*=/i.test(name) ||
                             /state\s*=/i.test(name) ||
                             /size\s*=/i.test(name);

    if (hasVariantPattern) {
      // Check for button-specific variant types
      const variantType = name.match(/variant\s*=\s*(\w+)/i)?.[1]?.toLowerCase();
      const isButtonVariant = variantType && ['default', 'primary', 'secondary', 'outline',
                               'ghost', 'link', 'destructive', 'tertiary'].includes(variantType);

      if (isButtonVariant) {
        confidence += 0.5;
        reasons.push(`Variant type "${variantType}" indicates button component`);
      } else if (hasVariantPattern) {
        confidence += 0.2;
        reasons.push('Has variant/state/size properties (common for buttons)');
      }
    }

    // Interactive state detection (NEW)
    const hasInteractiveState = /state\s*=\s*(hover|focus|active|pressed|disabled|loading)/i.test(name);
    if (hasInteractiveState) {
      confidence += 0.3;
      reasons.push('Has interactive state property (hover/focus/disabled/loading)');
    }

    // Additional button variant keywords (NEW)
    const hasButtonKeywords = name.includes('primary') ||
                             name.includes('secondary') ||
                             name.includes('destructive') ||
                             name.includes('outline') ||
                             name.includes('ghost');
    if (hasButtonKeywords && !name.includes('button')) {
      confidence += 0.2;
      reasons.push('Contains button variant keywords');
    }

    // Structure-based detection
    const hasBackground = node.fills && node.fills.length > 0 &&
                         node.fills.some(f => f.visible !== false);
    const hasText = node.children?.some(c => c.type === 'TEXT');
    const isInteractive = node.type === 'INSTANCE' || node.type === 'SYMBOL' || node.type === 'COMPONENT';

    if (hasBackground && hasText && isInteractive) {
      confidence += 0.2;
      reasons.push('Has background, text, and is interactive');
    } else if (hasBackground && isInteractive) {
      confidence += 0.1;
      reasons.push('Has background and is interactive');
    }

    // Size-based heuristic (buttons are typically small to medium)
    if (node.size && node.size.x > 40 && node.size.x < 300 &&
        node.size.y > 24 && node.size.y < 60) {
      confidence += 0.05;
      reasons.push('Size matches typical button dimensions');
    }

    // Has corner radius (common for buttons)
    if (node.cornerRadius && node.cornerRadius > 0) {
      confidence += 0.05;
      reasons.push('Has rounded corners');
    }

    return {
      type: 'Button',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }

  /**
   * Input field classification
   */
  static classifyInput(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    if (name.includes('input') || name.includes('textfield') || name.includes('text field')) {
      confidence += 0.6;
      reasons.push('Name contains input-related keyword');
    }

    // Variant pattern detection for inputs (NEW)
    const hasVariantPattern = /variant\s*=/i.test(name) ||
                             /state\s*=/i.test(name);

    if (hasVariantPattern && (name.includes('input') || name.includes('field'))) {
      confidence += 0.3;
      reasons.push('Has variant/state properties with input indicators');
    }

    // Interactive state detection (NEW)
    const hasInputState = /state\s*=\s*(focus|error|disabled|filled|empty)/i.test(name);
    if (hasInputState) {
      confidence += 0.2;
      reasons.push('Has input-specific state (focus/error/disabled)');
    }

    // Typical input structure: frame with border and text
    const hasBorder = node.strokes && node.strokes.length > 0;
    const hasText = node.children?.some(c => c.type === 'TEXT');

    if (hasBorder && hasText) {
      confidence += 0.2;
      reasons.push('Has border and text field');
    }

    // Size heuristic (inputs are typically wider than tall)
    if (node.size && node.size.x > node.size.y * 2) {
      confidence += 0.1;
      reasons.push('Width suggests input field');
    }

    return {
      type: 'Input',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }

  /**
   * Checkbox classification
   */
  static classifyCheckbox(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    if (name.includes('checkbox') || name.includes('check')) {
      confidence += 0.6;
      reasons.push('Name contains "checkbox"');
    }

    // Small square with optional checkmark
    if (node.size && Math.abs(node.size.x - node.size.y) < 4 &&
        node.size.x < 30) {
      confidence += 0.2;
      reasons.push('Square shape of small size');
    }

    return {
      type: 'Checkbox',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }

  /**
   * Select/Dropdown classification
   */
  static classifySelect(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    if (name.includes('select') || name.includes('dropdown') || name.includes('combobox')) {
      confidence += 0.6;
      reasons.push('Name contains select/dropdown');
    }

    // Has text and icon (typically down chevron)
    const hasText = node.children?.some(c => c.type === 'TEXT');
    const hasIcon = node.children?.some(c =>
      c.name.toLowerCase().includes('icon') ||
      c.name.toLowerCase().includes('chevron')
    );

    if (hasText && hasIcon) {
      confidence += 0.3;
      reasons.push('Has text and icon');
    }

    return {
      type: 'Select',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }

  /**
   * Card classification
   */
  static classifyCard(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    if (name.includes('card')) {
      confidence += 0.5;
      reasons.push('Name contains "card"');
    }

    // Has shadow/elevation and multiple children
    const hasShadow = node.effects && node.effects.some(e =>
      e.type === 'DROP_SHADOW' && e.visible !== false
    );
    const hasMultipleChildren = node.children && node.children.length >= 2;

    if (hasShadow && hasMultipleChildren) {
      confidence += 0.3;
      reasons.push('Has elevation and multiple content sections');
    }

    // Medium to large size
    if (node.size && node.size.x > 200 && node.size.y > 100) {
      confidence += 0.1;
      reasons.push('Size suggests content container');
    }

    return {
      type: 'Card',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }

  /**
   * Dialog/Modal classification
   */
  static classifyDialog(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    if (name.includes('dialog') || name.includes('modal') || name.includes('popup')) {
      confidence += 0.7;
      reasons.push('Name contains dialog/modal');
    }

    // Large with shadow and multiple sections
    const hasShadow = node.effects && node.effects.some(e =>
      e.type === 'DROP_SHADOW' && e.visible !== false
    );
    const isLarge = node.size && node.size.x > 300 && node.size.y > 200;
    const hasMultipleSections = node.children && node.children.length >= 3;

    if (hasShadow && isLarge && hasMultipleSections) {
      confidence += 0.2;
      reasons.push('Large container with shadow and multiple sections');
    }

    return {
      type: 'Dialog',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }

  /**
   * Badge classification
   */
  static classifyBadge(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    if (name.includes('badge') || name.includes('tag') || name.includes('chip')) {
      confidence += 0.6;
      reasons.push('Name contains badge/tag/chip');
    }

    // Small with text and rounded corners
    const hasText = node.children?.some(c => c.type === 'TEXT');
    const isSmall = node.size && node.size.x < 100 && node.size.y < 40;
    const isRounded = node.cornerRadius && node.cornerRadius >= 4;

    if (hasText && isSmall && isRounded) {
      confidence += 0.3;
      reasons.push('Small, rounded container with text');
    }

    return {
      type: 'Badge',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }

  /**
   * Avatar classification
   */
  static classifyAvatar(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    if (name.includes('avatar') || name.includes('profile')) {
      confidence += 0.6;
      reasons.push('Name contains avatar/profile');
    }

    // Circular or square, small to medium size
    const isCircular = node.cornerRadius && node.size &&
                       node.cornerRadius >= node.size.x / 2;
    const isSquare = node.size && Math.abs(node.size.x - node.size.y) < 4;
    const isSmallMedium = node.size && node.size.x < 100;

    if ((isCircular || isSquare) && isSmallMedium) {
      confidence += 0.3;
      reasons.push('Circular or square shape of appropriate size');
    }

    return {
      type: 'Avatar',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }

  /**
   * Icon classification
   */
  static classifyIcon(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    if (name.includes('icon') || name.includes('ico ')) {
      confidence += 0.6;
      reasons.push('Name contains "icon"');
    }

    // Size=icon variant (strong signal for icon buttons) (NEW)
    if (/size\s*=\s*icon/i.test(name)) {
      confidence += 0.5;
      reasons.push('Size=icon indicates icon component');
    }

    // Small, square or nearly square
    const isSmall = node.size && node.size.x <= 32 && node.size.y <= 32;
    const isSquarish = node.size &&
                       Math.abs(node.size.x - node.size.y) / Math.max(node.size.x, node.size.y) < 0.2;

    if (isSmall && isSquarish) {
      confidence += 0.3;
      reasons.push('Small, square dimensions');
    }

    // Vector or group type
    if (node.type === 'VECTOR' || node.type === 'GROUP' || node.type === 'BOOLEAN_OPERATION') {
      confidence += 0.1;
      reasons.push('Vector-based node');
    }

    return {
      type: 'Icon',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }

  /**
   * Text classification
   */
  static classifyText(node: FigmaNode): ComponentClassification {
    if (node.type === 'TEXT') {
      return {
        type: 'Text',
        confidence: 1.0,
        reasons: ['Is a text node']
      };
    }

    return {
      type: 'Text',
      confidence: 0,
      reasons: []
    };
  }

  /**
   * Image classification
   */
  static classifyImage(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    if (name.includes('image') || name.includes('img') || name.includes('picture')) {
      confidence += 0.5;
      reasons.push('Name suggests image');
    }

    // Has image fill
    const hasImageFill = node.fills && node.fills.some(f => f.type === 'IMAGE');
    if (hasImageFill) {
      confidence += 0.5;
      reasons.push('Has image fill');
    }

    return {
      type: 'Image',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }

  /**
   * Menubar classification
   */
  static classifyMenubar(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    // Name-based detection
    if (name.includes('menubar') || name.includes('menu bar') || name.includes('app menu')) {
      confidence += 0.7;
      reasons.push('Name contains "menubar", "menu bar", or "app menu"');
    }

    // Horizontal layout at top (typical for menubar)
    if (node.layoutMode === 'HORIZONTAL') {
      confidence += 0.2;
      reasons.push('Horizontal layout suggests menubar');
    }

    // Check for multiple menu triggers (File, Edit, View, etc.)
    if (node.children) {
      const menuLikeChildren = node.children.filter(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('menu') ||
               childName.includes('file') ||
               childName.includes('edit') ||
               childName.includes('view') ||
               childName.includes('help') ||
               childName.includes('trigger');
      });

      if (menuLikeChildren.length >= 2) {
        confidence += 0.3;
        reasons.push(`Has ${menuLikeChildren.length} menu-like children (typical menubar)`);
      }

      // Check for desktop app style menus (File/Edit/View/Help pattern)
      const hasDesktopMenuPattern = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('file') ||
               childName.includes('edit') ||
               childName.includes('view') ||
               childName.includes('help');
      });

      if (hasDesktopMenuPattern) {
        confidence += 0.2;
        reasons.push('Contains desktop application-style menu items (File/Edit/View/Help)');
      }
    }

    // Size heuristic: menubar is typically wider than tall and positioned at top
    if (node.size && node.size.x > node.size.y * 3) {
      confidence += 0.1;
      reasons.push('Wide horizontal layout typical of menubar');
    }

    return {
      type: 'Menubar',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }

  static classifySlider(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    if (name.includes("slider")) {
      confidence += 0.7;
      reasons.push("Name contains \"slider\"");
    }

    const hasRangeVariant = /range\s*=\s*(yes|no)/i.test(name);
    if (hasRangeVariant) {
      confidence += 0.3;
      reasons.push("Has Range=Yes/No variant property");
    }

    const hasSliderState = /state\s*=\s*(default|focus|hover)/i.test(name);
    if (hasSliderState) {
      confidence += 0.2;
      reasons.push("Has slider state property");
    }

    if (node.size && node.size.x > node.size.y * 4) {
      confidence += 0.2;
      reasons.push("Wide horizontal layout suggests slider");
    }

    const hasTrack = node.children?.some(c =>
      c.name.toLowerCase().includes("track") ||
      c.name.toLowerCase().includes("rail")
    );
    const hasThumb = node.children?.some(c =>
      c.name.toLowerCase().includes("thumb") ||
      c.name.toLowerCase().includes("handle") ||
      c.name.toLowerCase().includes("knob")
    );

    if (hasTrack && hasThumb) {
      confidence += 0.3;
      reasons.push("Contains track and thumb elements");
    } else if (hasTrack || hasThumb) {
      confidence += 0.15;
      reasons.push("Contains slider-like element");
    }

    if (node.children) {
      const roundedChildren = node.children.filter(c =>
        c.cornerRadius && c.size &&
        Math.abs(c.size.x - c.size.y) < 4 &&
        c.cornerRadius >= c.size.x / 2
      );

      if (roundedChildren.length >= 2) {
        confidence += 0.15;
        reasons.push(`Contains ${roundedChildren.length} circular children`);
      } else if (roundedChildren.length === 1) {
        confidence += 0.1;
        reasons.push("Contains 1 circular child (likely slider thumb)");
      }
    }

    return {
      type: "Slider",
      confidence: Math.min(confidence, 1),
      reasons
    };
  }

  static classifyTextarea(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    // Name-based detection
    if (name.includes('textarea') || name.includes('text area')) {
      confidence += 0.7;
      reasons.push('Name contains textarea-related keyword');
    }

    // Variant pattern detection for textareas
    const hasVariantPattern = /variant\s*=/i.test(name) ||
                             /state\s*=/i.test(name);

    if (hasVariantPattern && name.includes('textarea')) {
      confidence += 0.3;
      reasons.push('Has variant/state properties with textarea indicators');
    }

    // Interactive state detection (same as Input but specific to textarea)
    const hasTextareaState = /state\s*=\s*(focus|error|disabled|filled|default)/i.test(name);
    if (hasTextareaState) {
      confidence += 0.1;
      reasons.push('Has textarea-specific state (focus/error/disabled/filled)');
    }

    // Typical textarea structure: frame with border and text, multiline
    const hasBorder = node.strokes && node.strokes.length > 0;
    const hasText = node.children?.some(c => c.type === 'TEXT');

    if (hasBorder && hasText) {
      confidence += 0.1;
      reasons.push('Has border and text field');
    }

    // SIZE IS KEY DIFFERENTIATOR: Textareas are taller than inputs
    // This is the primary way to distinguish textarea from input
    if (node.size) {
      const aspectRatio = node.size.x / node.size.y;
      const height = node.size.y;

      // Strong signal: Height >= 80px is almost certainly a textarea
      if (height >= 80) {
        confidence += 0.6;
        reasons.push('Height >= 80px strongly suggests textarea (multi-line field)');
      }
      // Medium signal: Height 60-80px with good aspect ratio
      else if (height >= 60 && aspectRatio >= 0.8 && aspectRatio <= 3) {
        confidence += 0.5;
        reasons.push('Height 60-80px with aspect ratio suggests textarea');
      }
      // Weak signal: Shorter but squarish (not the typical wide input)
      else if (height >= 40 && aspectRatio >= 1 && aspectRatio <= 2) {
        confidence += 0.3;
        reasons.push('Square-ish aspect ratio suggests possible textarea');
      }
    }

    return {
      type: 'Textarea',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }

  static classifyRadioGroup(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    // Strong indicator: name contains "radio group" or "radio-group"
    if (name.includes('radio group') || name.includes('radio-group') || name.includes('radiogroup')) {
      confidence += 0.8;
      reasons.push('Name contains "radio group"');
    }

    // Multiple radio children
    const hasMultipleRadioChildren = node.children && node.children.filter(child => {
      const childName = child.name.toLowerCase();
      return childName.includes('radio') && !childName.includes('group');
    }).length >= 2;

    if (hasMultipleRadioChildren) {
      confidence += 0.5;
      reasons.push('Contains multiple radio child components');
    }

    // Layout suggests grouped items (vertical or horizontal layout)
    const hasLayout = node.layoutMode === 'HORIZONTAL' || node.layoutMode === 'VERTICAL';
    if (hasLayout && hasMultipleRadioChildren) {
      confidence += 0.2;
      reasons.push('Has layout mode with multiple items');
    }

    // Has item spacing (common for radio groups)
    if (node.itemSpacing && node.itemSpacing > 0 && hasMultipleRadioChildren) {
      confidence += 0.1;
      reasons.push('Has item spacing between radio options');
    }

    return {
      type: 'RadioGroup',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }

  /**
   * Radio button classification
   */
  static classifyRadio(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    // Exclude if this looks like a group
    if (name.includes('group') || (node.children && node.children.length > 3)) {
      return {
        type: 'Radio',
        confidence: 0,
        reasons: ['Appears to be a radio group, not individual radio']
      };
    }

    if (name.includes('radio')) {
      confidence += 0.7;
      reasons.push('Name contains "radio"');
    }

    // Small circle
    if (node.cornerRadius && node.size &&
        Math.abs(node.size.x - node.size.y) < 4 &&
        node.cornerRadius >= node.size.x / 2) {
      confidence += 0.2;
      reasons.push('Circular shape of small size');
    }

    return {
      type: 'Radio',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }

  /**
   * Switch/Toggle classification
   */
  static classifySwitch(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    // Skip if this looks like a toggle group (has multiple toggle items)
    if ((name.includes('toggle') || name.includes('switch')) &&
        (name.includes('group') || name.includes('bar'))) {
      return {
        type: 'Switch',
        confidence: 0,
        reasons: ['Name suggests toggle group, not single switch']
      };
    }

    // Skip if has multiple children that look like toggles (structural check)
    const hasMultipleToggles = node.children && node.children.length >= 2 &&
      node.children.filter(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('toggle') ||
               childName.includes('item') ||
               childName.includes('option') ||
               childName.includes('button');
      }).length >= 2;

    if (hasMultipleToggles) {
      return {
        type: 'Switch',
        confidence: 0,
        reasons: ['Has multiple toggle-like children, likely a toggle group']
      };
    }

    if (name.includes('switch') || name.includes('toggle')) {
      confidence += 0.7;
      reasons.push('Name contains switch/toggle');
    }

    // Pill shape (width roughly 2x height, high corner radius)
    if (node.size && node.cornerRadius &&
        node.size.x > node.size.y * 1.5 &&
        node.size.x < node.size.y * 2.5 &&
        node.cornerRadius >= node.size.y / 2) {
      confidence += 0.2;
      reasons.push('Pill shape suggests switch');
    }

    return {
      type: 'Switch',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }

  /**
   * Select/Dropdown classification
   */

  /**
   * Slider classification
   */

  static classifyToggleGroup(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    // Name-based detection
    if (name.includes('togglegroup') || name.includes('toggle group') ||
        name.includes('toggle-group')) {
      confidence += 0.7;
      reasons.push('Name contains "togglegroup" or "toggle group"');
    } else if (name.includes('toggle') && (name.includes('group') || name.includes('bar'))) {
      confidence += 0.5;
      reasons.push('Name contains "toggle" with "group" or "bar"');
    }

    // Structure-based detection: has multiple toggle items as children
    const hasMultipleToggles = node.children && node.children.length >= 2 &&
      node.children.filter(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('toggle') ||
               childName.includes('item') ||
               childName.includes('option') ||
               childName.includes('button');
      }).length >= 2;

    if (hasMultipleToggles) {
      confidence += 0.4;
      reasons.push('Has multiple toggle items as children');
    }

    // Layout detection: horizontal or vertical group
    if (node.layoutMode === 'HORIZONTAL' || node.layoutMode === 'VERTICAL') {
      confidence += 0.1;
      reasons.push('Has flex layout (typical for toggle groups)');
    }

    // Has background/border (toggle groups are typically contained)
    const hasBackground = node.fills && node.fills.length > 0 &&
                         node.fills.some(f => f.visible !== false);
    const hasBorder = node.strokes && node.strokes.length > 0;

    if (hasBackground || hasBorder) {
      confidence += 0.1;
      reasons.push('Has background or border (typical container style)');
    }

    // Check if children are arranged in a group-like manner
    if (node.children && node.children.length >= 2) {
      const childrenWithSimilarSize = node.children.filter(child => {
        if (!child.size || !node.children![0].size) return false;
        const firstChildSize = node.children![0].size;
        return Math.abs(child.size.x - firstChildSize.x) < 20 &&
               Math.abs(child.size.y - firstChildSize.y) < 20;
      });

      if (childrenWithSimilarSize.length >= 2) {
        confidence += 0.1;
        reasons.push('Children have similar sizes (grouped layout)');
      }
    }

    return {
      type: 'ToggleGroup',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }

  static classifyTabs(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    // Name-based detection
    if (name.includes('tabs') || name === 'tab') {
      confidence += 0.7;
      reasons.push('Name contains "tabs" or is "tab"');
    } else if (name.includes('tab group') || name.includes('tab-group')) {
      confidence += 0.6;
      reasons.push('Name contains "tab group"');
    }

    // Structure-based detection: has tab triggers and content areas
    const children = node.children || [];

    // Look for tab list/triggers (horizontal layout with multiple items)
    const hasTabList = children.some(child => {
      const childName = child.name.toLowerCase();
      return (childName.includes('list') || childName.includes('trigger') || childName.includes('tab')) &&
             child.layoutMode === 'HORIZONTAL' &&
             (child.children?.length || 0) >= 2;
    });

    if (hasTabList) {
      confidence += 0.4;
      reasons.push('Has tab list with multiple triggers in horizontal layout');
    }

    // Look for content areas (multiple children that could be panels)
    const potentialContent = children.filter(child => {
      const childName = child.name.toLowerCase();
      return childName.includes('content') ||
             childName.includes('panel') ||
             childName.includes('pane') ||
             childName.includes('tab ');
    });

    if (potentialContent.length >= 2) {
      confidence += 0.3;
      reasons.push(`Has ${potentialContent.length} potential content areas`);
    }

    // Check for typical tabs structure: list at top + content below
    if (children.length >= 2) {
      const firstChild = children[0];
      const firstChildName = firstChild.name.toLowerCase();

      if ((firstChildName.includes('list') || firstChildName.includes('trigger')) &&
          firstChild.layoutMode === 'HORIZONTAL') {
        confidence += 0.2;
        reasons.push('First child is horizontal list (typical tabs structure)');
      }
    }

    // Layout detection: typically vertical with list at top
    if (node.layoutMode === 'VERTICAL' && children.length >= 2) {
      confidence += 0.1;
      reasons.push('Vertical layout with multiple children (tabs pattern)');
    }

    // Check for multiple tab-like children (similar size, positioned horizontally)
    const tabLikeChildren = children.filter(child => {
      const childName = child.name.toLowerCase();
      return childName.includes('tab') && !childName.includes('content');
    });

    if (tabLikeChildren.length >= 2) {
      confidence += 0.3;
      reasons.push(`Has ${tabLikeChildren.length} tab-like children`);
    }

    return {
      type: 'Tabs',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }

  static classifyForm(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    // Name-based detection
    if (name.includes('form')) {
      confidence += 0.6;
      reasons.push('Name contains "form"');
    }

    // Check for form-like structure: container with multiple input fields
    const hasMultipleChildren = node.children && node.children.length >= 2;
    const hasInputFields = node.children?.some(c => {
      const childName = c.name.toLowerCase();
      return childName.includes('input') ||
             childName.includes('field') ||
             childName.includes('textfield') ||
             childName.includes('label');
    });

    if (hasMultipleChildren && hasInputFields) {
      confidence += 0.3;
      reasons.push('Contains multiple form fields (inputs/labels)');
    }

    // Check for button (submit/cancel)
    const hasButton = node.children?.some(c =>
      c.name.toLowerCase().includes('button') ||
      c.name.toLowerCase().includes('submit')
    );

    if (hasButton) {
      confidence += 0.1;
      reasons.push('Contains action buttons');
    }

    // Vertical layout is common for forms
    if (node.layoutMode === 'VERTICAL') {
      confidence += 0.05;
      reasons.push('Vertical layout typical for forms');
    }

    // Medium to large container
    if (node.size && node.size.y > 150) {
      confidence += 0.05;
      reasons.push('Size suggests form container');
    }

    return {
      type: 'Form',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }

  static classifyField(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    // Primary signal: Name contains "field" but NOT "textfield" (which is Input)
    if (name.includes('field') && !name.includes('textfield')) {
      confidence += 0.6;
      reasons.push('Name contains "field"');
    }

    // Check for field-specific compound names
    if (name.includes('formfield') || name.includes('form field') || name.includes('inputfield')) {
      confidence += 0.5;
      reasons.push('Name suggests form field component');
    }

    // Structural analysis: Look for field-like children
    const children = node.children || [];

    // Look for label child
    const hasLabel = children.some(c => {
      const childName = c.name.toLowerCase();
      return childName.includes('label') || childName.includes('title') || childName.includes('name');
    });

    // Look for input/control child
    const hasInput = children.some(c => {
      const childName = c.name.toLowerCase();
      return childName.includes('input') ||
             childName.includes('control') ||
             childName.includes('field') ||
             childName.includes('textbox') ||
             childName.includes('textarea') ||
             childName.includes('select');
    });

    // Look for description/helper text
    const hasDescription = children.some(c => {
      const childName = c.name.toLowerCase();
      return childName.includes('description') ||
             childName.includes('helper') ||
             childName.includes('hint') ||
             childName.includes('help') ||
             childName.includes('caption') ||
             childName.includes('subtitle');
    });

    // Look for error/validation message
    const hasErrorMessage = children.some(c => {
      const childName = c.name.toLowerCase();
      return childName.includes('error') ||
             childName.includes('message') ||
             childName.includes('invalid') ||
             childName.includes('validation') ||
             childName.includes('warning') ||
             childName.includes('alert');
    });

    // Strong signal: has both label and input (classic field structure)
    if (hasLabel && hasInput) {
      confidence += 0.4;
      reasons.push('Contains both label and input components');
    }

    // Additional signals
    if (hasDescription) {
      confidence += 0.1;
      reasons.push('Contains description/helper text');
    }
    if (hasErrorMessage) {
      confidence += 0.1;
      reasons.push('Contains error/validation message');
    }

    // Variant signals
    const hasDataInvalidVariant = /data\s*invalid\s*=\s*(true|false)/i.test(name);
    if (hasDataInvalidVariant) {
      confidence += 0.2;
      reasons.push('Has "Data Invalid" variant');
    }

    const hasOrientationVariant = /orientation\s*=\s*(vertical|horizontal|responsive)/i.test(name);
    if (hasOrientationVariant) {
      confidence += 0.15;
      reasons.push('Has "Orientation" variant');
    }

    const hasDescPlacementVariant = /description\s*placement\s*=/i.test(name);
    if (hasDescPlacementVariant) {
      confidence += 0.15;
      reasons.push('Has "Description Placement" variant');
    }

    // Layout signals
    if (node.layoutMode === 'VERTICAL') {
      confidence += 0.05;
      reasons.push('Vertical layout (typical for fields)');
    }

    // Child count heuristic (fields typically have 2-4 children)
    if (children.length >= 2 && children.length <= 4) {
      confidence += 0.05;
      reasons.push('Child count matches field structure');
    }

    // Size heuristic (fields are typically medium height, not too tall or short)
    if (node.size) {
      if (node.size.y >= 60 && node.size.y <= 200) {
        confidence += 0.05;
        reasons.push('Height suggests field component');
      }
    }

    return {
      type: 'Field',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }

  static classifyPagination(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    if (name.includes('pagination') || name.includes('pager')) {
      confidence += 0.7;
      reasons.push('Name contains "pagination"');
    }

    return {
      type: 'Pagination',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }

  static classifyBreadcrumb(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    // Name-based detection
    if (name.includes('breadcrumb')) {
      confidence += 0.7;
      reasons.push('Name contains "breadcrumb"');
    }

    // Variant pattern detection
    const hasVariantPattern = /variant\s*=/i.test(name) ||
                             /state\s*=/i.test(name);

    if (hasVariantPattern && name.includes('breadcrumb')) {
      confidence += 0.2;
      reasons.push('Has variant/state properties with breadcrumb indicators');
    }

    // Structure-based detection: horizontal layout with multiple items
    const hasHorizontalLayout = node.layoutMode === 'HORIZONTAL';
    if (hasHorizontalLayout) {
      confidence += 0.2;
      reasons.push('Has horizontal layout (typical for breadcrumbs)');
    }

    // Has multiple children (breadcrumb items)
    const hasMultipleChildren = node.children && node.children.length >= 2;
    if (hasMultipleChildren) {
      confidence += 0.1;
      reasons.push('Has multiple children (breadcrumb trail)');
    }

    // Check for separator pattern (/ or >)
    const hasSeparator = node.children?.some(child => {
      const childName = child.name.toLowerCase();
      return childName.includes('separator') ||
             childName.includes('chevron') ||
             childName.includes('slash') ||
             (child.type === 'TEXT' && (child.characters === '/' || child.characters === '>'));
    });

    if (hasSeparator) {
      confidence += 0.2;
      reasons.push('Contains separator elements (/ or >)');
    }

    // Check for link-like children
    const hasLinks = node.children?.some(child => {
      const childName = child.name.toLowerCase();
      return childName.includes('link') ||
             childName.includes('item') ||
             childName.includes('page');
    });

    if (hasLinks) {
      confidence += 0.1;
      reasons.push('Contains link/item elements');
    }

    // Size heuristic: breadcrumbs are typically low height, variable width
    if (node.size) {
      if (node.size.y < 50 && node.size.x > 100) {
        confidence += 0.1;
        reasons.push('Size matches typical breadcrumb dimensions');
      }
    }

    return {
      type: 'Breadcrumb',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }

  static classifySidebar(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    // Name-based detection
    if (name.includes('sidebar') || name.includes('side-bar')) {
      confidence += 0.7;
      reasons.push('Name contains "sidebar"');
    } else if (name.includes('side panel') || name.includes('side-panel') ||
               name.includes('sidepanel')) {
      confidence += 0.6;
      reasons.push('Name contains "side panel"');
    } else if (name.includes('navigation panel') || name.includes('nav panel')) {
      confidence += 0.5;
      reasons.push('Name contains "navigation panel"');
    } else if (name.includes('nav') && (name.includes('side') || name.includes('left'))) {
      confidence += 0.4;
      reasons.push('Name suggests side navigation');
    }

    // Variant pattern detection for sidebars
    const hasSidebarVariant = /type\s*=\s*(collapsible|simple|tree|checkbox)/i.test(name);
    if (hasSidebarVariant) {
      confidence += 0.3;
      reasons.push('Has sidebar-specific variant type (collapsible/simple/tree/checkbox)');
    }

    // State detection
    const hasState = /state\s*=\s*(default|hover|active|focused)/i.test(name);
    if (hasState) {
      confidence += 0.2;
      reasons.push('Has interactive state property');
    }

    // Collapsed state detection
    const hasCollapsedState = /collapsed\s*=\s*(true|false)/i.test(name);
    if (hasCollapsedState) {
      confidence += 0.2;
      reasons.push('Has collapsed state property (typical for sidebars)');
    }

    // Structure-based detection: vertical layout with navigation items
    const isVertical = node.layoutMode === 'VERTICAL';
    const hasMultipleChildren = node.children && node.children.length >= 3;

    if (isVertical && hasMultipleChildren) {
      confidence += 0.2;
      reasons.push('Vertical layout with multiple children (typical sidebar structure)');
    }

    // Check for navigation-like children (menu items, buttons)
    const hasNavChildren = node.children?.some(child => {
      const childName = child.name.toLowerCase();
      return childName.includes('menu') ||
             childName.includes('item') ||
             childName.includes('button') ||
             childName.includes('nav');
    });

    if (hasNavChildren) {
      confidence += 0.15;
      reasons.push('Contains navigation-like child components');
    }

    // Size heuristics: sidebars are typically tall and narrow
    if (node.size) {
      const aspectRatio = node.size.x / node.size.y;
      const height = node.size.y;

      // Tall and narrow (typical sidebar proportions)
      if (height > 400 && aspectRatio < 0.8) {
        confidence += 0.2;
        reasons.push('Height > 400px with narrow aspect ratio suggests sidebar');
      } else if (height > 300 && aspectRatio < 1.0) {
        confidence += 0.15;
        reasons.push('Tall with narrow-ish proportions suggests sidebar');
      }
    }

    // Check for typical sidebar sections (header, content, footer)
    const hasSidebarSections = node.children?.some(child => {
      const childName = child.name.toLowerCase();
      return childName.includes('header') ||
             childName.includes('content') ||
             childName.includes('footer');
    });

    if (hasSidebarSections) {
      confidence += 0.1;
      reasons.push('Contains typical sidebar sections (header/content/footer)');
    }

    return {
      type: 'Sidebar',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }


  /**
   * Toggle classification
   */
  static classifyToggle(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    if (name.includes('toggle') && !name.includes('group')) {
      confidence += 0.7;
      reasons.push('Name contains "toggle"');
    }

    return {
      type: 'Toggle',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }



  /**
   * NavigationMenu classification
   */
  static classifyNavigationMenu(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    if (name.includes('navigation') && name.includes('menu')) {
      confidence += 0.7;
      reasons.push('Name contains "navigation menu"');
    } else if (name.includes('nav') && name.includes('menu')) {
      confidence += 0.6;
      reasons.push('Name contains "nav menu"');
    }

    return {
      type: 'NavigationMenu',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }



  /**
   * DropdownMenu classification
   */
  static classifyDropdownMenu(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    if (name.includes('dropdown') && name.includes('menu')) {
      confidence += 0.7;
      reasons.push('Name contains "dropdown menu"');
    } else if (name.includes('dropdownmenu')) {
      confidence += 0.7;
      reasons.push('Name contains "dropdownmenu"');
    } else if (name.includes('dropdown')) {
      confidence += 0.4;
      reasons.push('Name contains "dropdown"');
    }

    const hasTrigger = node.children?.some(c =>
      c.name.toLowerCase().includes('trigger') ||
      c.name.toLowerCase().includes('button')
    );
    const hasContent = node.children?.some(c =>
      c.name.toLowerCase().includes('content') ||
      c.name.toLowerCase().includes('menu')
    );

    if (hasTrigger && hasContent) {
      confidence += 0.5;
      reasons.push('Has trigger and menu content structure');
    }

    return {
      type: 'DropdownMenu',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }

  /**
   * Calendar classification (96 variants)
   * Grid-based date selector with month/year navigation
   */
  static classifyCalendar(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    // Name-based detection
    if (name.includes('calendar') || name.includes('datepicker') || name.includes('date picker')) {
      confidence += 0.7;
      reasons.push('Name contains calendar/datepicker keyword');
    }

    // Variant detection
    if (/weekday\s*names\s*=/i.test(name)) {
      confidence += 0.15;
      reasons.push('Has "Weekday Names" variant (calendar-specific)');
    }

    if (/outside\s*month\s*days\s*=/i.test(name)) {
      confidence += 0.15;
      reasons.push('Has "Outside Month Days" variant (calendar-specific)');
    }

    // Structural detection: Grid layout (7 columns for days of week)
    if (node.children) {
      // Look for grid container
      const hasGridChild = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('grid') ||
               childName.includes('days') ||
               childName.includes('week');
      });

      if (hasGridChild) {
        confidence += 0.2;
        reasons.push('Contains grid/days/week child element');
      }

      // Look for header with month/year
      const hasHeader = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return (childName.includes('header') || childName.includes('month')) &&
               (childName.includes('year') || childName.includes('nav'));
      });

      if (hasHeader) {
        confidence += 0.15;
        reasons.push('Contains header with month/year navigation');
      }

      // Look for navigation arrows
      const hasNavigation = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('prev') ||
               childName.includes('next') ||
               childName.includes('arrow') ||
               childName.includes('chevron');
      });

      if (hasNavigation) {
        confidence += 0.1;
        reasons.push('Contains navigation arrows');
      }

      // Check for multiple day cells (usually 28-42 cells)
      const dayCells = node.children.filter(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('day') ||
               childName.match(/\b\d{1,2}\b/); // Numbers 1-31
      });

      if (dayCells.length >= 7) {
        confidence += 0.2;
        reasons.push(`Contains ${dayCells.length} day cells (calendar grid)`);
      }
    }

    // Size heuristic: Calendars are typically square-ish and medium-sized
    if (node.size) {
      const aspectRatio = node.size.x / node.size.y;
      if (aspectRatio >= 0.8 && aspectRatio <= 1.5 && node.size.x > 200) {
        confidence += 0.05;
        reasons.push('Square-ish aspect ratio with appropriate size');
      }
    }

    return {
      type: 'Calendar',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }

  /**
   * DatePicker classification (25 variants)
   * Combination of Input + Popover + Calendar
   */
  static classifyDatePicker(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    // Name-based detection (most specific first)
    if (name.includes('datepicker') || name.includes('date picker') || name.includes('date-picker')) {
      confidence += 0.8;
      reasons.push('Name contains "datepicker" or "date picker"');
    } else if (name.includes('date') && (name.includes('input') || name.includes('field'))) {
      confidence += 0.5;
      reasons.push('Name suggests date input field');
    }

    // Variant detection
    if (/variant\s*=\s*(default|outline|ghost)/i.test(name)) {
      confidence += 0.1;
      reasons.push('Has button variant property');
    }

    // Structural detection: Look for combination of input + calendar
    if (node.children) {
      const hasInput = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('input') ||
               childName.includes('field') ||
               childName.includes('trigger');
      });

      const hasCalendar = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('calendar') ||
               childName.includes('popover') ||
               childName.includes('dropdown');
      });

      if (hasInput && hasCalendar) {
        confidence += 0.4;
        reasons.push('Contains both input field and calendar/popover');
      } else if (hasInput) {
        confidence += 0.2;
        reasons.push('Contains input field');
      }

      // Look for calendar icon
      const hasCalendarIcon = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return (childName.includes('icon') && childName.includes('calendar')) ||
               childName.includes('calendaricon');
      });

      if (hasCalendarIcon) {
        confidence += 0.15;
        reasons.push('Contains calendar icon');
      }
    }

    return {
      type: 'DatePicker',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }

  /**
   * InputOTP classification (11 variants)
   * Segmented input for one-time passwords/codes
   */
  static classifyInputOTP(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    // Name-based detection
    if (name.includes('otp') || name.includes('one-time') || name.includes('onetime')) {
      confidence += 0.7;
      reasons.push('Name contains OTP/one-time keyword');
    } else if (name.includes('verification') && name.includes('code')) {
      confidence += 0.5;
      reasons.push('Name suggests verification code input');
    } else if (name.includes('pin') && name.includes('code')) {
      confidence += 0.5;
      reasons.push('Name suggests PIN code input');
    }

    // Variant detection
    if (/length\s*=\s*\d+/i.test(name)) {
      confidence += 0.2;
      reasons.push('Has "Length" variant (OTP-specific)');
    }

    // Structural detection: Multiple segmented input boxes
    if (node.children) {
      // Look for multiple similar-sized input segments
      const segments = node.children.filter(child => {
        const childName = child.name.toLowerCase();
        return (childName.includes('slot') ||
                childName.includes('box') ||
                childName.includes('digit') ||
                childName.includes('char') ||
                childName.match(/\b[0-9]\b/)) && // Single digit
               child.size &&
               Math.abs(child.size.x - child.size.y) < 10; // Square-ish
      });

      if (segments.length >= 4 && segments.length <= 8) {
        confidence += 0.4;
        reasons.push(`Contains ${segments.length} input segments (OTP pattern)`);
      }

      // Check for uniform spacing (typical OTP layout)
      if (segments.length >= 4) {
        const allSameSize = segments.every(seg =>
          seg.size && segments[0].size &&
          Math.abs(seg.size.x - segments[0].size.x) < 5
        );

        if (allSameSize) {
          confidence += 0.15;
          reasons.push('Segments have uniform size');
        }
      }
    }

    // Layout: Horizontal arrangement
    if (node.layoutMode === 'HORIZONTAL') {
      confidence += 0.1;
      reasons.push('Horizontal layout (typical for OTP inputs)');
    }

    return {
      type: 'InputOTP',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }

  /**
   * InputGroup classification (152 variants - most complex!)
   * Input with prefix/suffix/addons
   */
  static classifyInputGroup(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    // Name-based detection
    if (name.includes('inputgroup') || name.includes('input group') || name.includes('input-group')) {
      confidence += 0.7;
      reasons.push('Name contains "inputgroup" or "input group"');
    } else if ((name.includes('input') || name.includes('field')) &&
               (name.includes('addon') || name.includes('prefix') || name.includes('suffix'))) {
      confidence += 0.6;
      reasons.push('Name suggests input with addon/prefix/suffix');
    }

    // Variant detection (InputGroup has MANY variants)
    if (/start\s*addon\s*=/i.test(name) || /end\s*addon\s*=/i.test(name)) {
      confidence += 0.2;
      reasons.push('Has "Start/End Addon" variant (InputGroup-specific)');
    }

    if (/start\s*element\s*=/i.test(name) || /end\s*element\s*=/i.test(name)) {
      confidence += 0.2;
      reasons.push('Has "Start/End Element" variant (InputGroup-specific)');
    }

    // Structural detection: Input + additional elements
    if (node.children && node.children.length >= 2) {
      const hasInput = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('input') ||
               childName.includes('field') ||
               childName.includes('textbox');
      });

      const hasAddon = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('addon') ||
               childName.includes('prefix') ||
               childName.includes('suffix') ||
               childName.includes('start') ||
               childName.includes('end') ||
               childName.includes('element');
      });

      const hasIcon = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('icon');
      });

      const hasButton = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('button');
      });

      if (hasInput && (hasAddon || hasIcon || hasButton)) {
        confidence += 0.3;
        reasons.push('Contains input field with addon/icon/button');
      }

      // Check for multiple elements (complex InputGroup)
      if (node.children.length >= 3) {
        confidence += 0.1;
        reasons.push('Multiple child elements suggest complex input group');
      }
    }

    // Layout: Horizontal arrangement (input groups are side-by-side)
    if (node.layoutMode === 'HORIZONTAL') {
      confidence += 0.1;
      reasons.push('Horizontal layout (typical for input groups)');
    }

    // Size heuristic: Similar to regular input but may be wider
    if (node.size && node.size.x > 150 && node.size.y >= 30 && node.size.y <= 60) {
      confidence += 0.05;
      reasons.push('Size matches input group dimensions');
    }

    return {
      type: 'InputGroup',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }

  /**
   * Combobox classification (25 variants)
   * Combination of Input + Popover + Command (searchable select)
   */
  static classifyCombobox(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    // Name-based detection
    if (name.includes('combobox') || name.includes('combo box') || name.includes('combo-box')) {
      confidence += 0.8;
      reasons.push('Name contains "combobox" or "combo box"');
    } else if (name.includes('autocomplete') || name.includes('auto complete') || name.includes('auto-complete')) {
      confidence += 0.6;
      reasons.push('Name contains "autocomplete"');
    } else if ((name.includes('select') || name.includes('dropdown')) && name.includes('search')) {
      confidence += 0.5;
      reasons.push('Name suggests searchable select');
    }

    // Variant detection
    if (/variant\s*=\s*(default|outline)/i.test(name)) {
      confidence += 0.1;
      reasons.push('Has variant property');
    }

    // Structural detection: Combination of input, dropdown, and command list
    if (node.children) {
      const hasInput = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('input') ||
               childName.includes('search') ||
               childName.includes('trigger');
      });

      const hasDropdown = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('popover') ||
               childName.includes('dropdown') ||
               childName.includes('list') ||
               childName.includes('menu');
      });

      const hasCommand = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('command') ||
               childName.includes('option') ||
               childName.includes('item');
      });

      if (hasInput && hasDropdown && hasCommand) {
        confidence += 0.4;
        reasons.push('Contains input, dropdown, and command/option structure');
      } else if (hasInput && hasDropdown) {
        confidence += 0.25;
        reasons.push('Contains input and dropdown structure');
      }

      // Look for search/filter capability indicators
      const hasSearch = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('search') || childName.includes('filter');
      });

      if (hasSearch) {
        confidence += 0.15;
        reasons.push('Contains search/filter element');
      }

      // Look for chevron/arrow icon
      const hasChevron = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('chevron') ||
               childName.includes('arrow') ||
               (childName.includes('icon') && (childName.includes('down') || childName.includes('expand')));
      });

      if (hasChevron) {
        confidence += 0.1;
        reasons.push('Contains chevron/arrow icon');
      }
    }

    return {
      type: 'Combobox',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }

  /**
   * Command classification (19 variants)
   * Command palette/search with keyboard shortcuts
   */
  static classifyCommand(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    // Name-based detection
    if (name.includes('command') && !name.includes('combobox')) {
      confidence += 0.7;
      reasons.push('Name contains "command"');
    } else if (name.includes('palette') || name.includes('cmd') || name.includes('cmdk')) {
      confidence += 0.6;
      reasons.push('Name suggests command palette');
    }

    // Variant detection
    if (/show\s*shortcut\s*=/i.test(name)) {
      confidence += 0.2;
      reasons.push('Has "Show Shortcut" variant (Command-specific)');
    }

    // Structural detection: Search input + list of items with optional shortcuts
    if (node.children) {
      const hasInput = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('input') ||
               childName.includes('search');
      });

      const hasList = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('list') ||
               childName.includes('group') ||
               childName.includes('items');
      });

      const hasItems = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('item') ||
               childName.includes('option');
      });

      if (hasInput && (hasList || hasItems)) {
        confidence += 0.3;
        reasons.push('Contains search input and item list');
      }

      // Look for keyboard shortcuts
      const hasShortcuts = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('shortcut') ||
               childName.includes('kbd') ||
               childName.includes('key');
      });

      if (hasShortcuts) {
        confidence += 0.2;
        reasons.push('Contains keyboard shortcuts (command palette feature)');
      }

      // Look for groups/sections (commands are often grouped)
      const hasGroups = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('group') ||
               childName.includes('section') ||
               childName.includes('separator');
      });

      if (hasGroups) {
        confidence += 0.15;
        reasons.push('Contains groups/sections');
      }

      // Look for icons (command items often have icons)
      const hasIcons = node.children.filter(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('icon');
      }).length >= 2;

      if (hasIcons) {
        confidence += 0.1;
        reasons.push('Contains multiple icons (command items)');
      }
    }

    // Size heuristic: Command palettes are typically tall and medium width
    if (node.size && node.size.y > 200 && node.size.x > 250 && node.size.x < 600) {
      confidence += 0.05;
      reasons.push('Size matches command palette dimensions');
    }

    return {
      type: 'Command',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }
  /**
   * Alert classification
   */
  static classifyAlert(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    // Name-based detection - STRONG requirement for "alert" in name
    if (name.includes('alert') && !name.includes('dialog')) {
      confidence += 0.8;
      reasons.push('Name contains "alert" (but not "dialog")');
    } else {
      // Without "alert" in name, very low confidence
      return {
        type: 'Alert',
        confidence: 0,
        reasons: ['Name does not contain "alert"']
      };
    }

    // Variant pattern detection (specific to Alert: default/destructive)
    const hasVariantPattern = /variant\s*=\s*(default|destructive)/i.test(name);
    if (hasVariantPattern) {
      confidence += 0.3;
      reasons.push('Has alert variant property (default/destructive)');
    }

    // Structure: typically has icon + title + description
    const hasIcon = node.children?.some(c =>
      c.name.toLowerCase().includes('icon') ||
      c.type === 'VECTOR'
    );
    const hasTitle = node.children?.some(c =>
      c.name.toLowerCase().includes('title') ||
      c.name.toLowerCase().includes('heading')
    );
    const hasDescription = node.children?.some(c =>
      c.name.toLowerCase().includes('description') ||
      c.name.toLowerCase().includes('message')
    );

    if (hasIcon && (hasTitle || hasDescription)) {
      confidence += 0.3;
      reasons.push('Has alert structure (icon + text content)');
    }

    // Size heuristic: alerts are typically horizontal banners
    if (node.size && node.size.x > node.size.y * 2) {
      confidence += 0.1;
      reasons.push('Wide horizontal layout typical of alert banner');
    }

    // Has background and border (common for alerts)
    const hasBackground = node.fills && node.fills.length > 0 &&
                         node.fills.some(f => f.visible !== false);
    const hasBorder = node.strokes && node.strokes.length > 0;

    if (hasBackground || hasBorder) {
      confidence += 0.1;
      reasons.push('Has background/border typical of alert components');
    }

    return {
      type: 'Alert',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }

  /**
   * AlertDialog classification (distinct from Alert and Dialog)
   */
  static classifyAlertDialog(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    // Strong name-based detection
    if (name.includes('alert') && name.includes('dialog')) {
      confidence += 0.8;
      reasons.push('Name contains both "alert" and "dialog"');
    } else if (name.includes('alertdialog')) {
      confidence += 0.8;
      reasons.push('Name contains "alertdialog"');
    }

    // Variant pattern detection
    const hasVariantPattern = /variant\s*=/i.test(name);
    if (hasVariantPattern) {
      confidence += 0.1;
      reasons.push('Has variant properties');
    }

    // Structure: overlay with trigger and content
    const hasTrigger = node.children?.some(c =>
      c.name.toLowerCase().includes('trigger') ||
      c.name.toLowerCase().includes('button')
    );
    const hasContent = node.children?.some(c =>
      c.name.toLowerCase().includes('content') ||
      c.name.toLowerCase().includes('modal')
    );

    if (hasTrigger && hasContent) {
      confidence += 0.3;
      reasons.push('Has trigger + content structure (overlay pattern)');
    }

    // Has action buttons (Cancel/Continue)
    const hasActions = node.children?.some(c => {
      const childName = c.name.toLowerCase();
      return childName.includes('action') ||
             childName.includes('cancel') ||
             childName.includes('continue') ||
             childName.includes('confirm');
    });

    if (hasActions) {
      confidence += 0.2;
      reasons.push('Contains action buttons (typical for alert dialogs)');
    }

    return {
      type: 'AlertDialog',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }

  /**
   * Drawer classification
   */
  static classifyDrawer(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    // Name-based detection
    if (name.includes('drawer')) {
      confidence += 0.7;
      reasons.push('Name contains "drawer"');
    } else if (name.includes('side panel') && !name.includes('sidebar')) {
      confidence += 0.5;
      reasons.push('Name suggests side panel (drawer-like)');
    }

    // Variant: Side detection (top/bottom/left/right)
    const hasSideVariant = /side\s*=\s*(top|bottom|left|right)/i.test(name);
    if (hasSideVariant) {
      confidence += 0.3;
      reasons.push('Has Side variant property (top/bottom/left/right)');
    }

    // Structure: trigger + content
    const hasTrigger = node.children?.some(c =>
      c.name.toLowerCase().includes('trigger') ||
      c.name.toLowerCase().includes('button')
    );
    const hasContent = node.children?.some(c =>
      c.name.toLowerCase().includes('content') ||
      c.name.toLowerCase().includes('panel')
    );

    if (hasTrigger && hasContent) {
      confidence += 0.3;
      reasons.push('Has trigger + content structure');
    }

    // Size: typically tall and narrow (vertical) or wide and short (horizontal)
    if (node.size) {
      const aspectRatio = node.size.x / node.size.y;
      if (aspectRatio < 0.5 || aspectRatio > 2.5) {
        confidence += 0.1;
        reasons.push('Aspect ratio suggests drawer (slides from edge)');
      }
    }

    return {
      type: 'Drawer',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }

  /**
   * Sheet classification
   */
  static classifySheet(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    // Name-based detection
    if (name.includes('sheet')) {
      confidence += 0.7;
      reasons.push('Name contains "sheet"');
    } else if (name.includes('bottom sheet') || name.includes('bottomsheet')) {
      confidence += 0.8;
      reasons.push('Name contains "bottom sheet"');
    }

    // Variant: Side detection (specifically for sheet placement)
    const hasSideVariant = /side\s*=\s*(top|bottom|left|right)/i.test(name);
    if (hasSideVariant) {
      confidence += 0.2;
      reasons.push('Has Side variant property');
    }

    // Structure: trigger + content (similar to drawer but more modal-like)
    const hasTrigger = node.children?.some(c =>
      c.name.toLowerCase().includes('trigger') ||
      c.name.toLowerCase().includes('button') ||
      c.name.toLowerCase().includes('open')
    );
    const hasContent = node.children?.some(c =>
      c.name.toLowerCase().includes('content') ||
      c.name.toLowerCase().includes('modal')
    );

    if (hasTrigger && hasContent) {
      confidence += 0.3;
      reasons.push('Has trigger + content structure (modal pattern)');
    }

    // Has header with title/description (common for sheets)
    const hasHeader = node.children?.some(c => {
      const childName = c.name.toLowerCase();
      return childName.includes('header') ||
             childName.includes('title') ||
             childName.includes('description');
    });

    if (hasHeader) {
      confidence += 0.2;
      reasons.push('Contains header section (typical for sheets)');
    }

    // Overlay/shadow effect (sheets typically have backdrop)
    const hasShadow = node.effects && node.effects.some(e =>
      e.type === 'DROP_SHADOW' && e.visible !== false
    );

    if (hasShadow) {
      confidence += 0.1;
      reasons.push('Has shadow effect (overlay appearance)');
    }

    return {
      type: 'Sheet',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }

  /**
   * Popover classification
   */
  static classifyPopover(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    // Name-based detection
    if (name.includes('popover')) {
      confidence += 0.7;
      reasons.push('Name contains "popover"');
    } else if (name.includes('popup') && !name.includes('dialog')) {
      confidence += 0.5;
      reasons.push('Name suggests popup (popover-like)');
    }

    // Structure: trigger + content (small overlay)
    const hasTrigger = node.children?.some(c =>
      c.name.toLowerCase().includes('trigger') ||
      c.name.toLowerCase().includes('button')
    );
    const hasContent = node.children?.some(c =>
      c.name.toLowerCase().includes('content') ||
      c.name.toLowerCase().includes('body')
    );

    if (hasTrigger && hasContent) {
      confidence += 0.4;
      reasons.push('Has trigger + content structure (overlay pattern)');
    }

    // Small size (popovers are typically compact)
    if (node.size && node.size.x < 400 && node.size.y < 300) {
      confidence += 0.2;
      reasons.push('Small size typical of popover components');
    }

    // Has shadow (floating appearance)
    const hasShadow = node.effects && node.effects.some(e =>
      e.type === 'DROP_SHADOW' && e.visible !== false
    );

    if (hasShadow) {
      confidence += 0.1;
      reasons.push('Has shadow effect (floating appearance)');
    }

    return {
      type: 'Popover',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }

  /**
   * Sonner (Toast) classification
   */
  static classifySonner(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    // Name-based detection
    if (name.includes('sonner') || name.includes('toast')) {
      confidence += 0.7;
      reasons.push('Name contains "sonner" or "toast"');
    } else if (name.includes('notification') && !name.includes('bell')) {
      confidence += 0.5;
      reasons.push('Name suggests notification toast');
    } else if (name.includes('snackbar')) {
      confidence += 0.6;
      reasons.push('Name contains "snackbar" (toast variant)');
    }

    // Variant: Position detection
    const hasPositionVariant = /position\s*=\s*(top-left|top-center|top-right|bottom-left|bottom-center|bottom-right)/i.test(name);
    if (hasPositionVariant) {
      confidence += 0.3;
      reasons.push('Has Position variant property (toast positioning)');
    }

    // Variant: Type detection (success/error/info/warning)
    const hasTypeVariant = /type\s*=\s*(success|error|info|warning|default)/i.test(name) ||
                           /variant\s*=\s*(success|error|info|warning|default)/i.test(name);
    if (hasTypeVariant) {
      confidence += 0.2;
      reasons.push('Has Type variant (success/error/info/warning)');
    }

    // Structure: icon + message + optional action
    const hasIcon = node.children?.some(c =>
      c.name.toLowerCase().includes('icon') ||
      c.type === 'VECTOR'
    );
    const hasMessage = node.children?.some(c =>
      c.name.toLowerCase().includes('message') ||
      c.name.toLowerCase().includes('text') ||
      c.name.toLowerCase().includes('title')
    );

    if (hasIcon && hasMessage) {
      confidence += 0.2;
      reasons.push('Has toast structure (icon + message)');
    }

    // Small/medium compact size
    if (node.size && node.size.x > 200 && node.size.x < 500 &&
        node.size.y > 50 && node.size.y < 150) {
      confidence += 0.1;
      reasons.push('Compact size typical of toast notifications');
    }

    // Has background and shadow (floating toast appearance)
    const hasBackground = node.fills && node.fills.length > 0 &&
                         node.fills.some(f => f.visible !== false);
    const hasShadow = node.effects && node.effects.some(e =>
      e.type === 'DROP_SHADOW' && e.visible !== false
    );

    if (hasBackground && hasShadow) {
      confidence += 0.1;
      reasons.push('Has background and shadow (floating toast)');
    }

    return {
      type: 'Sonner',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }

  /**
   * Spinner (Loading) classification
   */
  static classifySpinner(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    // Name-based detection
    if (name.includes('spinner') || name.includes('loading')) {
      confidence += 0.7;
      reasons.push('Name contains "spinner" or "loading"');
    } else if (name.includes('loader')) {
      confidence += 0.6;
      reasons.push('Name contains "loader"');
    }

    // Variant: Size detection
    const hasSizeVariant = /size\s*=\s*(xs|sm|md|lg|xl)/i.test(name);
    if (hasSizeVariant) {
      confidence += 0.2;
      reasons.push('Has Size variant property');
    }

    // Circular shape (spinners are typically circular)
    const isCircular = node.cornerRadius && node.size &&
                       node.cornerRadius >= node.size.x / 2;
    const isSquare = node.size && Math.abs(node.size.x - node.size.y) < 4;

    if (isCircular || (isSquare && node.size && node.size.x < 100)) {
      confidence += 0.3;
      reasons.push('Circular or square shape (typical spinner)');
    }

    // Small size (spinners are compact)
    if (node.size && node.size.x < 80 && node.size.y < 80) {
      confidence += 0.2;
      reasons.push('Small size typical of spinner component');
    }

    // Vector-based or has animation-like structure
    if (node.type === 'VECTOR' || node.type === 'BOOLEAN_OPERATION') {
      confidence += 0.1;
      reasons.push('Vector-based (typical for spinners)');
    }

    // Has multiple circular children (animated segments)
    const circularChildren = node.children?.filter(c =>
      c.cornerRadius && c.size &&
      c.cornerRadius >= c.size.x / 2
    );

    if (circularChildren && circularChildren.length > 0) {
      confidence += 0.1;
      reasons.push('Contains circular elements (spinner segments)');
    }

    return {
      type: 'Spinner',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }

  /**
   * Table classification (Phase 3 - Data Display)
   * Distinguishes from DataTable (Phase 6) - Table is simpler, DataTable has advanced features
   */
  static classifyTable(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    // NEGATIVE signals - reduce confidence if it looks like Carousel
    if (name.includes('carousel') || name.includes('slider')) {
      confidence -= 0.5;
      reasons.push('NEGATIVE: Name suggests Carousel (not table)');
    }

    // Name-based detection
    if (name.includes('table') && !name.includes('data')) {
      confidence += 0.7;
      reasons.push('Name contains "table" (not data table)');
    } else if (name.includes('grid') && !name.includes('data')) {
      confidence += 0.4;
      reasons.push('Name contains "grid"');
    }

    // Variant detection - table-specific variants
    if (/striped\s*=\s*(yes|no)/i.test(name)) {
      confidence += 0.2;
      reasons.push('Has Striped variant (table feature)');
    }

    if (/hoverable\s*=\s*(yes|no)/i.test(name)) {
      confidence += 0.15;
      reasons.push('Has Hoverable variant (table feature)');
    }

    if (/selectable\s*=\s*(yes|no)/i.test(name)) {
      confidence += 0.15;
      reasons.push('Has Selectable variant (table feature)');
    }

    // Structural detection: table structure with rows and cells
    if (node.children) {
      // NEGATIVE: Check for carousel-specific elements
      const hasCarouselElements = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('carousel') ||
               childName.includes('slide') ||
               (childName.includes('arrow') && (childName.includes('left') || childName.includes('right'))) ||
               childName.includes('dot') ||
               childName.includes('indicator') ||
               childName.includes('pagination');
      });

      if (hasCarouselElements) {
        confidence -= 0.4;
        reasons.push('NEGATIVE: Contains carousel elements (not table)');
      }
      // Look for header row (thead)
      const hasHeader = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('head') ||
               childName.includes('header') ||
               childName.includes('thead');
      });

      if (hasHeader) {
        confidence += 0.3;
        reasons.push('Contains header row structure (thead)');
      }

      // Look for body rows (tbody)
      const hasBody = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('body') ||
               childName.includes('tbody') ||
               childName.includes('rows');
      });

      if (hasBody) {
        confidence += 0.2;
        reasons.push('Contains body row structure (tbody)');
      }

      // Look for multiple row-like children
      const rowLikeChildren = node.children.filter(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('row') ||
               childName.includes('tr') ||
               (child.layoutMode === 'HORIZONTAL' && (child.children?.length || 0) >= 2);
      });

      if (rowLikeChildren.length >= 2) {
        confidence += 0.3;
        reasons.push(`Has ${rowLikeChildren.length} row-like children`);
      }

      // Look for cell-like children in rows
      const hasCells = rowLikeChildren.some(row => {
        return row.children?.some(cell => {
          const cellName = cell.name.toLowerCase();
          return cellName.includes('cell') ||
                 cellName.includes('td') ||
                 cellName.includes('th');
        });
      });

      if (hasCells) {
        confidence += 0.2;
        reasons.push('Contains cell structure (td/th)');
      }
    }

    // Grid-like layout (vertical stack of horizontal rows)
    if (node.layoutMode === 'VERTICAL') {
      const hasHorizontalChildren = node.children?.filter(c =>
        c.layoutMode === 'HORIZONTAL'
      ).length || 0;

      if (hasHorizontalChildren >= 2) {
        confidence += 0.2;
        reasons.push('Vertical layout with horizontal rows (table pattern)');
      }
    }

    // Size heuristic: tables are typically wide and medium-tall
    if (node.size && node.size.x > 300 && node.size.y > 100) {
      confidence += 0.1;
      reasons.push('Size suggests table layout');
    }

    // Distinguish from DataTable: DataTable has more advanced features
    // If it has sorting, filtering, pagination indicators, it's likely DataTable
    const hasAdvancedFeatures = node.children?.some(child => {
      const childName = child.name.toLowerCase();
      return childName.includes('sort') ||
             childName.includes('filter') ||
             childName.includes('pagination') ||
             childName.includes('search');
    });

    if (hasAdvancedFeatures) {
      confidence *= 0.5; // Reduce confidence - might be DataTable
      reasons.push('Has advanced features - might be DataTable instead');
    }

    return {
      type: 'Table',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }

  /**
   * Chart classification (Phase 3 - Data Display)
   */
  static classifyChart(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    // Name-based detection
    if (name.includes('chart')) {
      confidence += 0.8;
      reasons.push('Name contains "chart"');
    } else if (name.includes('graph')) {
      confidence += 0.7;
      reasons.push('Name contains "graph"');
    } else if (name.includes('visualization') || name.includes('viz')) {
      confidence += 0.6;
      reasons.push('Name suggests data visualization');
    }

    // Variant detection - chart types
    const chartTypes = ['bar', 'line', 'pie', 'donut', 'area', 'radar', 'scatter'];
    for (const chartType of chartTypes) {
      if (name.includes(chartType)) {
        confidence += 0.3;
        reasons.push(`Contains chart type: ${chartType}`);
        break;
      }
    }

    // Check for chart-specific variant patterns
    if (/type\s*=\s*(bar|line|pie|area|donut)/i.test(name)) {
      confidence += 0.3;
      reasons.push('Has Type variant with chart type value');
    }

    // Structural detection: chart elements
    if (node.children) {
      // Look for axis elements
      const hasAxis = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('axis') ||
               childName.includes('x-axis') ||
               childName.includes('y-axis');
      });

      if (hasAxis) {
        confidence += 0.3;
        reasons.push('Contains axis elements');
      }

      // Look for legend
      const hasLegend = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('legend');
      });

      if (hasLegend) {
        confidence += 0.2;
        reasons.push('Contains legend element');
      }

      // Look for data series or bars/lines
      const hasDataElements = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('bar') ||
               childName.includes('line') ||
               childName.includes('series') ||
               childName.includes('data') ||
               childName.includes('point');
      });

      if (hasDataElements) {
        confidence += 0.2;
        reasons.push('Contains data visualization elements');
      }

      // Look for grid lines
      const hasGrid = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('grid') || childName.includes('gridline');
      });

      if (hasGrid) {
        confidence += 0.1;
        reasons.push('Contains grid lines');
      }
    }

    // Medium to large size (charts need space)
    if (node.size && node.size.x > 200 && node.size.y > 150) {
      confidence += 0.1;
      reasons.push('Size appropriate for chart display');
    }

    return {
      type: 'Chart',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }

  /**
   * Carousel classification (Phase 3 - Data Display)
   */
  static classifyCarousel(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    // Name-based detection
    if (name.includes('carousel')) {
      confidence += 0.8;
      reasons.push('Name contains "carousel"');
    } else if (name.includes('slider') && (name.includes('image') || name.includes('slide'))) {
      confidence += 0.6;
      reasons.push('Name suggests image slider/carousel');
    } else if (name.includes('gallery') && name.includes('scroll')) {
      confidence += 0.5;
      reasons.push('Name suggests scrolling gallery');
    }

    // Variant detection
    if (/orientation\s*=\s*(horizontal|vertical)/i.test(name)) {
      confidence += 0.25;
      reasons.push('Has Orientation variant');
    }

    if (/dots\s*=\s*(yes|no|true|false)/i.test(name)) {
      confidence += 0.2;
      reasons.push('Has Dots variant (carousel navigation)');
    }

    if (/arrows\s*=\s*(yes|no|true|false)/i.test(name)) {
      confidence += 0.2;
      reasons.push('Has Arrows variant (carousel navigation)');
    }

    // Structural detection
    if (node.children) {
      // Look for navigation arrows
      const hasArrows = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return (childName.includes('arrow') ||
                childName.includes('prev') ||
                childName.includes('next') ||
                childName.includes('chevron')) &&
               (childName.includes('left') || childName.includes('right'));
      });

      if (hasArrows) {
        confidence += 0.3;
        reasons.push('Contains navigation arrows');
      }

      // Look for pagination dots/indicators
      const hasDots = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('dot') ||
               childName.includes('indicator') ||
               childName.includes('pagination');
      });

      if (hasDots) {
        confidence += 0.25;
        reasons.push('Contains pagination dots/indicators');
      }

      // Look for slide items
      const slideItems = node.children.filter(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('slide') ||
               childName.includes('item') ||
               childName.includes('card');
      });

      if (slideItems.length >= 2) {
        confidence += 0.3;
        reasons.push(`Contains ${slideItems.length} slide items`);
      }

      // Look for slide container
      const hasContainer = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return (childName.includes('container') ||
                childName.includes('track') ||
                childName.includes('viewport')) &&
               (child.children?.length || 0) >= 2;
      });

      if (hasContainer) {
        confidence += 0.2;
        reasons.push('Contains slide container/track');
      }
    }

    // Horizontal layout with overflow (typical carousel)
    if (node.layoutMode === 'HORIZONTAL' ||
        (node.children && node.children.length >= 2)) {
      confidence += 0.1;
      reasons.push('Layout suggests carousel structure');
    }

    return {
      type: 'Carousel',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }

  /**
   * Tooltip classification (Phase 3 - Data Display)
   */
  static classifyTooltip(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    // NEGATIVE signals - reduce confidence if it looks like HoverCard
    if (name.includes('hovercard') || name.includes('hover card') ||
        (name.includes('hover') && name.includes('popover'))) {
      confidence -= 0.5;
      reasons.push('NEGATIVE: Name suggests HoverCard (not tooltip)');
    }

    // Name-based detection
    if (name.includes('tooltip')) {
      confidence += 0.9;
      reasons.push('Name contains "tooltip"');
    } else if (name.includes('hint') || name.includes('tip')) {
      confidence += 0.5;
      reasons.push('Name suggests tooltip/hint');
    }

    // Variant detection - but check it's not HoverCard
    if (/side\s*=\s*(top|bottom|left|right)/i.test(name) && !name.includes('hover')) {
      confidence += 0.2;
      reasons.push('Has Side variant (tooltip positioning)');
    }

    // Structural detection
    if (node.children) {
      // NEGATIVE: Check for HoverCard-specific structure
      const hasHeader = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('header') && !childName.includes('text');
      });

      const hasContent = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('content') || childName.includes('body');
      });

      const hasFooter = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('footer');
      });

      // If has structured sections like header/content/footer, it's likely HoverCard
      if ((hasHeader && hasContent) || hasFooter) {
        confidence -= 0.4;
        reasons.push('NEGATIVE: Has structured sections (likely HoverCard)');
      }

      // Look for arrow/pointer
      const hasArrow = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('arrow') ||
               childName.includes('pointer') ||
               childName.includes('tip');
      });

      if (hasArrow) {
        confidence += 0.3;
        reasons.push('Contains arrow/pointer element');
      }

      // Has text content (simple text, not structured)
      const hasText = node.children.some(child =>
        child.type === 'TEXT' || child.children?.some(c => c.type === 'TEXT')
      );

      if (hasText) {
        confidence += 0.2;
        reasons.push('Contains text content');
      }

      // Tooltips typically have very few children (1-2: text + maybe arrow)
      if (node.children.length <= 2) {
        confidence += 0.15;
        reasons.push('Simple structure (1-2 children)');
      }
    }

    // Small size (tooltips are compact) - stricter bounds
    if (node.size && node.size.x < 200 && node.size.y < 80) {
      confidence += 0.35;
      reasons.push('Small size typical of tooltip');
    } else if (node.size && node.size.x >= 200 && node.size.y >= 100) {
      // Too large for tooltip, likely HoverCard
      confidence -= 0.3;
      reasons.push('NEGATIVE: Too large for tooltip (likely HoverCard)');
    }

    // Has shadow/elevation (floating appearance)
    const hasShadow = node.effects && node.effects.some(e =>
      e.type === 'DROP_SHADOW' && e.visible !== false
    );

    if (hasShadow) {
      confidence += 0.15;
      reasons.push('Has shadow (floating appearance)');
    }

    // Has border or background
    const hasBorder = node.strokes && node.strokes.length > 0;
    const hasBackground = node.fills && node.fills.length > 0;

    if (hasBorder || hasBackground) {
      confidence += 0.1;
      reasons.push('Has border or background');
    }

    return {
      type: 'Tooltip',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }

  /**
   * HoverCard classification (Phase 3 - Data Display)
   * Similar to Tooltip but larger with more content
   */
  static classifyHoverCard(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    // Name-based detection
    if (name.includes('hovercard') || name.includes('hover card')) {
      confidence += 0.95;
      reasons.push('Name contains "hovercard" or "hover card"');
    } else if (name.includes('hover') && name.includes('popover')) {
      confidence += 0.8;
      reasons.push('Name suggests hover popover');
    } else if (name.includes('popover') && name.includes('card')) {
      confidence += 0.7;
      reasons.push('Name suggests popover card');
    }

    // Variant detection (HoverCard specific)
    if (/side\s*=\s*(top|bottom|left|right)/i.test(name) && name.includes('hover')) {
      confidence += 0.2;
      reasons.push('Has Side variant with hover pattern');
    }

    // Structural detection
    if (node.children) {
      // Look for arrow/pointer
      const hasArrow = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('arrow') || childName.includes('pointer');
      });

      if (hasArrow) {
        confidence += 0.25;
        reasons.push('Contains arrow element');
      }

      // Has multiple content sections (header, content, etc.) - key differentiator from Tooltip
      const hasHeader = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('header') || childName.includes('title');
      });

      const hasContent = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('content') || childName.includes('body');
      });

      const hasFooter = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('footer');
      });

      // HoverCard typically has structured sections
      if (hasHeader && hasContent) {
        confidence += 0.4;
        reasons.push('Has header and content sections (hover card structure)');
      } else if (hasHeader || hasContent || hasFooter) {
        confidence += 0.25;
        reasons.push('Has structured content sections');
      }

      // Has multiple children (richer content than tooltip) - stronger signal
      if (node.children.length >= 3) {
        confidence += 0.25;
        reasons.push('Multiple content sections (richer than tooltip)');
      }
    }

    // Medium size (larger than tooltip, smaller than empty state/dialog)
    // HoverCard is typically 200-400px wide, 100-350px tall
    if (node.size && node.size.x >= 200 && node.size.x <= 400 &&
        node.size.y >= 80 && node.size.y <= 350) {
      confidence += 0.35;
      reasons.push('Medium size typical of hover card');
    }

    // Has shadow/elevation
    const hasShadow = node.effects && node.effects.some(e =>
      e.type === 'DROP_SHADOW' && e.visible !== false
    );

    if (hasShadow) {
      confidence += 0.15;
      reasons.push('Has shadow (floating appearance)');
    }

    return {
      type: 'HoverCard',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }

  /**
   * Skeleton classification (Phase 3 - Data Display)
   * Loading placeholder with shimmer effect
   */
  static classifySkeleton(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    // Name-based detection (strengthened)
    if (name.includes('skeleton')) {
      confidence += 0.9;
      reasons.push('Name contains "skeleton"');
    } else if (name.includes('placeholder') && name.includes('loading')) {
      confidence += 0.8;
      reasons.push('Name suggests loading placeholder');
    } else if (name.includes('loading') && name.includes('placeholder')) {
      confidence += 0.8;
      reasons.push('Name contains "loading placeholder"');
    } else if (name.includes('shimmer')) {
      confidence += 0.7;
      reasons.push('Name contains "shimmer"');
    } else if (name.includes('placeholder') && !name.includes('empty')) {
      confidence += 0.5;
      reasons.push('Name contains "placeholder"');
    }

    // Variant detection
    if (/shape\s*=\s*(rectangle|circle|text)/i.test(name)) {
      confidence += 0.3;
      reasons.push('Has Shape variant (skeleton type)');
    }

    if (/animated\s*=\s*(yes|no|true|false)/i.test(name)) {
      confidence += 0.2;
      reasons.push('Has Animated variant');
    }

    // NEGATIVE signals - reduce confidence if it looks like Tooltip or HoverCard
    if (node.children) {
      // Check for arrow/pointer (Tooltip has this, Skeleton doesn't)
      const hasArrow = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('arrow') || childName.includes('pointer');
      });

      if (hasArrow) {
        confidence -= 0.4;
        reasons.push('NEGATIVE: Has arrow/pointer (not skeleton)');
      }

      // Check for actual text content (Tooltip has text, Skeleton is placeholder)
      const hasTextContent = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return child.type === 'TEXT' &&
               !childName.includes('placeholder') &&
               !childName.includes('skeleton');
      });

      if (hasTextContent) {
        confidence -= 0.3;
        reasons.push('NEGATIVE: Contains text content (not skeleton)');
      }
    }

    // Structural detection - simple geometric shapes
    if (node.children) {
      // Look for multiple simple rectangular placeholders
      const rectangularChildren = node.children.filter(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('line') ||
               childName.includes('box') ||
               childName.includes('rect') ||
               (child.size && !child.children?.length);
      });

      if (rectangularChildren.length >= 2) {
        confidence += 0.35;
        reasons.push('Contains multiple placeholder shapes');
      }

      // Look for gradient/shimmer effect
      const hasGradient = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('gradient') ||
               childName.includes('shimmer') ||
               childName.includes('shine') ||
               childName.includes('effect');
      });

      if (hasGradient) {
        confidence += 0.3;
        reasons.push('Contains gradient/shimmer effect');
      }
    }

    // Typical skeleton colors (grays, muted) - broader range
    const hasSkeletonColors = node.fills && node.fills.some(fill => {
      if (fill.type === 'SOLID' && fill.color) {
        const gray = fill.color.r === fill.color.g && fill.color.g === fill.color.b;
        const lightness = fill.color.r;
        // Skeleton grays are typically between 0.8 and 0.95 (light gray)
        return gray && lightness >= 0.8 && lightness <= 0.95;
      }
      return false;
    });

    if (hasSkeletonColors) {
      confidence += 0.25;
      reasons.push('Has skeleton-typical colors (light gray)');
    }

    // Has corner radius (skeleton UI elements are rounded)
    if (node.cornerRadius && node.cornerRadius > 0) {
      confidence += 0.1;
      reasons.push('Has rounded corners');
    }

    return {
      type: 'Skeleton',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }

  /**
   * Progress classification (Phase 3 - Data Display)
   */
  static classifyProgress(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    // Name-based detection (strengthened)
    if (name.includes('progress')) {
      confidence += 0.9;
      reasons.push('Name contains "progress"');
    } else if (name.includes('progressbar') || name.includes('progress bar')) {
      confidence += 0.95;
      reasons.push('Name contains "progress bar"');
    } else if (name.includes('loading') && (name.includes('bar') || name.includes('indicator'))) {
      confidence += 0.7;
      reasons.push('Name suggests loading bar/indicator');
    }

    // NEGATIVE signals - reduce confidence if it looks like Chart
    if (node.children) {
      // Check for chart-specific elements that Progress doesn't have
      const hasChartElements = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('axis') ||
               childName.includes('legend') ||
               childName.includes('grid') ||
               childName.includes('data point') ||
               childName.includes('series') ||
               (childName.includes('x-') || childName.includes('y-'));
      });

      if (hasChartElements) {
        confidence -= 0.5;
        reasons.push('NEGATIVE: Contains chart-specific elements (not progress)');
      }
    }

    // Variant detection
    if (/type\s*=\s*(linear|circular|radial)/i.test(name)) {
      // Only boost if it's progress type, not chart type
      if (!name.includes('chart')) {
        confidence += 0.25;
        reasons.push('Has Type variant (progress type)');
      }
    }

    if (/value\s*=\s*\d+/i.test(name)) {
      confidence += 0.2;
      reasons.push('Has Value variant (progress value)');
    }

    if (/indeterminate\s*=\s*(yes|no|true|false)/i.test(name)) {
      confidence += 0.2;
      reasons.push('Has Indeterminate variant');
    }

    // Structural detection
    if (node.children) {
      // Look for track/background bar
      const hasTrack = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('track') ||
               childName.includes('background') ||
               childName.includes('rail');
      });

      // Look for fill/indicator bar (but not chart bars)
      const hasFill = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return (childName.includes('fill') ||
               childName.includes('indicator') ||
               childName.includes('value')) &&
               !childName.includes('chart');
      });

      if (hasTrack && hasFill) {
        confidence += 0.45;
        reasons.push('Contains track and fill elements');
      } else if (hasTrack || hasFill) {
        confidence += 0.25;
        reasons.push('Contains progress bar element');
      }

      // Circular progress - check for circular/ring structure
      const isCircular = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return (childName.includes('circle') || childName.includes('ring')) &&
               (childName.includes('progress') || childName.includes('indicator') || childName.includes('track'));
      });

      if (isCircular) {
        confidence += 0.35;
        reasons.push('Circular progress structure');
      }
    }

    // Linear progress bar shape (wide and short) - stronger signal
    if (node.size && node.size.x > node.size.y * 3 && node.size.y < 50) {
      confidence += 0.35;
      reasons.push('Wide horizontal bar shape (linear progress)');
    }

    // Circular progress shape (square with high corner radius)
    if (node.size && Math.abs(node.size.x - node.size.y) < 10 &&
        node.cornerRadius && node.cornerRadius >= node.size.x / 2) {
      confidence += 0.35;
      reasons.push('Circular shape (circular progress)');
    }

    // Has corner radius (progress bars are typically rounded)
    if (node.cornerRadius && node.cornerRadius > 0 &&
        node.size && node.size.x > node.size.y * 2) {
      confidence += 0.15;
      reasons.push('Rounded progress bar');
    }

    return {
      type: 'Progress',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }

  /**
   * Empty classification (Phase 3 - Data Display)
   * Empty state component with icon and message
   */
  static classifyEmpty(node: FigmaNode): ComponentClassification {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    // Name-based detection (strengthened)
    if (name.includes('empty state') || name.includes('empty-state')) {
      confidence += 0.95;
      reasons.push('Name contains "empty state"');
    } else if (name.includes('empty')) {
      confidence += 0.85;
      reasons.push('Name contains "empty"');
    } else if (name.includes('no data') || name.includes('no-data') || name.includes('nodata')) {
      confidence += 0.8;
      reasons.push('Name suggests no data state');
    } else if (name.includes('zero state') || name.includes('zero-state')) {
      confidence += 0.85;
      reasons.push('Name suggests zero state');
    } else if (name.includes('blank slate') || name.includes('blank-slate')) {
      confidence += 0.85;
      reasons.push('Name suggests blank slate');
    } else if (name.includes('placeholder') && !name.includes('loading')) {
      confidence += 0.5;
      reasons.push('Name suggests placeholder state');
    }

    // NEGATIVE signals - reduce confidence if it looks like HoverCard
    if (node.children) {
      // HoverCards have triggers or arrows, Empty states don't
      const hasTriggerOrArrow = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('trigger') ||
               childName.includes('arrow') ||
               childName.includes('pointer');
      });

      if (hasTriggerOrArrow) {
        confidence -= 0.4;
        reasons.push('NEGATIVE: Has trigger/arrow (not empty state)');
      }

      // Check for HoverCard-specific naming patterns
      const hasHoverCardPattern = name.includes('hover') ||
                                  name.includes('popover') ||
                                  name.includes('card');

      if (hasHoverCardPattern && !name.includes('empty')) {
        confidence -= 0.3;
        reasons.push('NEGATIVE: Has hover/popover/card pattern (not empty state)');
      }
    }

    // Structural detection
    if (node.children) {
      // Look for icon (typically large, centered) - stronger signal for empty states
      const hasIcon = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('icon') ||
               childName.includes('illustration') ||
               childName.includes('image') ||
               childName.includes('graphic');
      });

      if (hasIcon) {
        confidence += 0.35;
        reasons.push('Contains icon/illustration');
      }

      // Look for title text
      const hasTitle = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return (childName.includes('title') ||
                childName.includes('heading') ||
                childName.includes('message')) &&
               (child.type === 'TEXT' || child.children?.some(c => c.type === 'TEXT'));
      });

      if (hasTitle) {
        confidence += 0.3;
        reasons.push('Contains title/heading text');
      }

      // Look for description text
      const hasDescription = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return (childName.includes('description') ||
                childName.includes('subtitle') ||
                childName.includes('text')) &&
               (child.type === 'TEXT' || child.children?.some(c => c.type === 'TEXT'));
      });

      if (hasDescription) {
        confidence += 0.25;
        reasons.push('Contains description text');
      }

      // Look for action button (optional but common in empty states)
      const hasButton = node.children.some(child => {
        const childName = child.name.toLowerCase();
        return childName.includes('button') || childName.includes('action') || childName.includes('cta');
      });

      if (hasButton) {
        confidence += 0.2;
        reasons.push('Contains action button');
      }

      // Centered vertical layout (typical empty state pattern) - stronger signal
      if (node.layoutMode === 'VERTICAL' && node.children.length >= 2) {
        const centerAligned = node.primaryAxisAlignItems === 'CENTER' ||
                             node.counterAxisAlignItems === 'CENTER';
        if (centerAligned) {
          confidence += 0.25;
          reasons.push('Centered vertical layout (empty state pattern)');
        }
      }
    }

    // Medium to large size (empty states fill their container, larger than HoverCard)
    if (node.size && node.size.x > 200 && node.size.y > 150) {
      confidence += 0.15;
      reasons.push('Size appropriate for empty state display');
    }

    // Empty states are typically larger than hover cards
    if (node.size && (node.size.x > 350 || node.size.y > 250)) {
      confidence += 0.1;
      reasons.push('Large size (typical for empty state)');
    }

    return {
      type: 'Empty',
      confidence: Math.min(confidence, 1),
      reasons
    };
  }

}

// ============================================================================
// TAILWIND CSS MAPPER
// ============================================================================

export class TailwindMapper {
  /**
   * Map extracted styles to Tailwind classes
   */
  static mapStyles(styles: ExtractedStyles): string[] {
    const classes: string[] = [];

    // Background color
    if (styles.colors.background && styles.colors.background.length > 0) {
      const bgClass = this.mapColorToTailwind(styles.colors.background[0], 'bg');
      if (bgClass) classes.push(bgClass);
    }

    // Text color
    if (styles.colors.text && styles.colors.text.length > 0) {
      const textClass = this.mapColorToTailwind(styles.colors.text[0], 'text');
      if (textClass) classes.push(textClass);
    }

    // Border
    if (styles.colors.border && styles.colors.border.length > 0) {
      const borderClass = this.mapColorToTailwind(styles.colors.border[0], 'border');
      if (borderClass) {
        classes.push('border');
        classes.push(borderClass);
      }
    }

    // Border radius
    const radiusClass = this.mapBorderRadius(styles.borderRadius);
    if (radiusClass) classes.push(radiusClass);

    // Padding
    const paddingClasses = this.mapSpacing(styles.spacing.padding, 'p');
    classes.push(...paddingClasses);

    // Gap
    if (styles.spacing.gap !== undefined) {
      const gapClass = this.mapGap(styles.spacing.gap);
      if (gapClass) classes.push(gapClass);
    }

    // Typography
    if (styles.typography) {
      const typoClasses = this.mapTypography(styles.typography);
      classes.push(...typoClasses);
    }

    // Effects
    const shadowClass = this.mapShadow(styles.effects);
    if (shadowClass) classes.push(shadowClass);

    // Layout
    if (styles.layout) {
      const layoutClasses = this.mapLayout(styles.layout);
      classes.push(...layoutClasses);
    }

    return classes;
  }

  /**
   * Map color to closest Tailwind color
   */
  static mapColorToTailwind(color: ExtractedColor, prefix: string): string | null {
    // Try to match to common Tailwind colors
    const colorMap: Record<string, string> = {
      // Grays
      '#000000': `${prefix}-black`,
      '#ffffff': `${prefix}-white`,
      '#f9fafb': `${prefix}-gray-50`,
      '#f3f4f6': `${prefix}-gray-100`,
      '#e5e7eb': `${prefix}-gray-200`,
      '#d1d5db': `${prefix}-gray-300`,
      '#9ca3af': `${prefix}-gray-400`,
      '#6b7280': `${prefix}-gray-500`,
      '#4b5563': `${prefix}-gray-600`,
      '#374151': `${prefix}-gray-700`,
      '#1f2937': `${prefix}-gray-800`,
      '#111827': `${prefix}-gray-900`,

      // Blues
      '#3b82f6': `${prefix}-blue-500`,
      '#2563eb': `${prefix}-blue-600`,
      '#1d4ed8': `${prefix}-blue-700`,

      // Purples
      '#7c3aed': `${prefix}-violet-600`,
      '#6d28d9': `${prefix}-violet-700`,

      // Reds
      '#ef4444': `${prefix}-red-500`,
      '#dc2626': `${prefix}-red-600`,

      // Greens
      '#10b981': `${prefix}-green-500`,
      '#059669': `${prefix}-green-600`,
    };

    const hex = color.hex.toLowerCase();
    return colorMap[hex] || null;
  }

  /**
   * Map border radius to Tailwind
   */
  static mapBorderRadius(radius: number | number[]): string | null {
    if (Array.isArray(radius)) {
      // Check if all corners are the same
      if (radius.every(r => r === radius[0])) {
        radius = radius[0];
      } else {
        return null; // Complex radius, needs custom CSS
      }
    }

    if (radius === 0) return null;
    if (radius <= 2) return 'rounded-sm';
    if (radius <= 4) return 'rounded';
    if (radius <= 6) return 'rounded-md';
    if (radius <= 8) return 'rounded-lg';
    if (radius <= 12) return 'rounded-xl';
    if (radius <= 16) return 'rounded-2xl';
    if (radius >= 9999) return 'rounded-full';

    return 'rounded-lg';
  }

  /**
   * Map spacing to Tailwind
   */
  static mapSpacing(padding: { top: number; right: number; bottom: number; left: number }, prefix: string): string[] {
    const { top, right, bottom, left } = padding;

    // Check if uniform
    if (top === right && right === bottom && bottom === left) {
      if (top === 0) return [];
      return [this.spacingValueToClass(top, prefix)];
    }

    // Check if symmetric (y and x)
    if (top === bottom && left === right) {
      const classes = [];
      if (top > 0) classes.push(this.spacingValueToClass(top, `${prefix}y`));
      if (left > 0) classes.push(this.spacingValueToClass(left, `${prefix}x`));
      return classes;
    }

    // Individual sides
    const classes = [];
    if (top > 0) classes.push(this.spacingValueToClass(top, `${prefix}t`));
    if (right > 0) classes.push(this.spacingValueToClass(right, `${prefix}r`));
    if (bottom > 0) classes.push(this.spacingValueToClass(bottom, `${prefix}b`));
    if (left > 0) classes.push(this.spacingValueToClass(left, `${prefix}l`));
    return classes;
  }

  /**
   * Convert spacing value to Tailwind class
   */
  static spacingValueToClass(value: number, prefix: string): string {
    // Tailwind spacing scale: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24...
    // 1 unit = 0.25rem = 4px
    const rem = value / 16; // Convert px to rem
    const units = rem * 4; // Convert rem to Tailwind units

    if (units <= 0.5) return `${prefix}-0`;
    if (units <= 1.5) return `${prefix}-1`;
    if (units <= 2.5) return `${prefix}-2`;
    if (units <= 3.5) return `${prefix}-3`;
    if (units <= 4.5) return `${prefix}-4`;
    if (units <= 5.5) return `${prefix}-5`;
    if (units <= 6.5) return `${prefix}-6`;
    if (units <= 9) return `${prefix}-8`;
    if (units <= 11) return `${prefix}-10`;
    if (units <= 14) return `${prefix}-12`;
    if (units <= 18) return `${prefix}-16`;
    if (units <= 22) return `${prefix}-20`;

    return `${prefix}-24`;
  }

  /**
   * Map gap to Tailwind
   */
  static mapGap(gap: number): string | null {
    return this.spacingValueToClass(gap, 'gap');
  }

  /**
   * Map typography to Tailwind
   */
  static mapTypography(typo: ExtractedTypography): string[] {
    const classes: string[] = [];

    // Font size
    const fontSize = typo.fontSize;
    if (fontSize <= 12) classes.push('text-xs');
    else if (fontSize <= 14) classes.push('text-sm');
    else if (fontSize <= 16) classes.push('text-base');
    else if (fontSize <= 18) classes.push('text-lg');
    else if (fontSize <= 20) classes.push('text-xl');
    else if (fontSize <= 24) classes.push('text-2xl');
    else if (fontSize <= 30) classes.push('text-3xl');
    else classes.push('text-4xl');

    // Font weight
    const weight = typeof typo.fontWeight === 'number' ? typo.fontWeight : 400;
    if (weight <= 300) classes.push('font-light');
    else if (weight <= 400) classes.push('font-normal');
    else if (weight <= 500) classes.push('font-medium');
    else if (weight <= 600) classes.push('font-semibold');
    else classes.push('font-bold');

    // Text align
    if (typo.textAlign === 'CENTER') classes.push('text-center');
    else if (typo.textAlign === 'RIGHT') classes.push('text-right');
    else if (typo.textAlign === 'JUSTIFIED') classes.push('text-justify');

    return classes;
  }

  /**
   * Map shadow effects to Tailwind
   */
  static mapShadow(effects: ExtractedEffect[]): string | null {
    const shadows = effects.filter(e =>
      e.type === 'DROP_SHADOW' && e.visible
    );

    if (shadows.length === 0) return null;

    // Simple heuristic based on blur radius
    const shadow = shadows[0];
    const blur = shadow.radius;

    if (blur <= 2) return 'shadow-sm';
    if (blur <= 6) return 'shadow';
    if (blur <= 10) return 'shadow-md';
    if (blur <= 15) return 'shadow-lg';
    if (blur <= 25) return 'shadow-xl';

    return 'shadow-2xl';
  }

  /**
   * Map layout to Tailwind
   */
  static mapLayout(layout: { mode: string; direction: string; align: string; justify: string }): string[] {
    const classes: string[] = [];

    if (layout.mode === 'HORIZONTAL' || layout.mode === 'VERTICAL') {
      classes.push('flex');

      if (layout.direction === 'column') {
        classes.push('flex-col');
      }

      // Alignment
      if (layout.align === 'CENTER') classes.push('items-center');
      else if (layout.align === 'END') classes.push('items-end');
      else if (layout.align === 'STRETCH') classes.push('items-stretch');

      // Justify
      if (layout.justify === 'CENTER') classes.push('justify-center');
      else if (layout.justify === 'SPACE_BETWEEN') classes.push('justify-between');
      else if (layout.justify === 'SPACE_AROUND') classes.push('justify-around');
      else if (layout.justify === 'END') classes.push('justify-end');
    }

    return classes;
  }
}

// ============================================================================
// ENHANCED PARSER
// ============================================================================

export class EnhancedFigmaParser {
  /**
   * Parse a Figma node into an enhanced component
   */
  static parseNode(node: FigmaNode): EnhancedComponent {
    // Extract styles
    const styles = this.extractStyles(node);

    // Classify component
    const classification = ComponentClassifier.classify(node);

    // Map to Tailwind
    const tailwindClasses = TailwindMapper.mapStyles(styles);

    // Generate CSS properties
    const cssProperties = this.generateCssProperties(styles);

    // Parse children
    const children = node.children?.map(child => this.parseNode(child));

    return {
      id: this.getNodeId(node),
      name: node.name,
      type: classification.type,
      confidence: classification.confidence,
      styles,
      tailwindClasses,
      cssProperties,
      classification,
      children
    };
  }

  /**
   * Extract all styles from a node
   */
  static extractStyles(node: FigmaNode): ExtractedStyles {
    const colors = {
      background: ColorExtractor.extractFills(node),
      text: node.type === 'TEXT' ? [ColorExtractor.extractTextColor(node)].filter(Boolean) as ExtractedColor[] : [],
      border: ColorExtractor.extractStrokes(node)
    };

    const typography = TypographyExtractor.extractTypography(node);
    const effects = EffectsExtractor.extractEffects(node);
    const spacing = SpacingExtractor.extractSpacing(node);

    const borderRadius = node.rectangleCornerRadii || node.cornerRadius || 0;

    const dimensions = {
      width: node.size?.x || 0,
      height: node.size?.y || 0
    };

    const layout = node.layoutMode ? {
      mode: node.layoutMode,
      direction: node.layoutMode === 'HORIZONTAL' ? 'row' : 'column',
      align: node.counterAxisAlignItems || 'start',
      justify: node.primaryAxisAlignItems || 'start'
    } : undefined;

    return {
      colors,
      typography,
      effects,
      spacing,
      borderRadius,
      dimensions,
      layout
    };
  }

  /**
   * Generate CSS properties from extracted styles
   */
  static generateCssProperties(styles: ExtractedStyles): Record<string, string> {
    const css: Record<string, string> = {};

    // Background
    if (styles.colors.background.length > 0) {
      css.backgroundColor = styles.colors.background[0].rgba;
    }

    // Text color
    if (styles.colors.text.length > 0) {
      css.color = styles.colors.text[0].rgba;
    }

    // Border
    if (styles.colors.border.length > 0) {
      css.borderColor = styles.colors.border[0].rgba;
      css.borderStyle = 'solid';
      css.borderWidth = '1px';
    }

    // Border radius
    if (Array.isArray(styles.borderRadius)) {
      css.borderRadius = styles.borderRadius.map(r => `${r}px`).join(' ');
    } else if (styles.borderRadius > 0) {
      css.borderRadius = `${styles.borderRadius}px`;
    }

    // Spacing
    const { padding } = styles.spacing;
    if (SpacingExtractor.isUniformPadding(styles.spacing)) {
      css.padding = `${padding.top}px`;
    } else if (SpacingExtractor.isSymmetricPadding(styles.spacing)) {
      css.padding = `${padding.top}px ${padding.left}px`;
    } else {
      css.padding = `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;
    }

    // Gap
    if (styles.spacing.gap !== undefined) {
      css.gap = `${styles.spacing.gap}px`;
    }

    // Typography
    if (styles.typography) {
      css.fontFamily = styles.typography.fontFamily;
      css.fontSize = `${styles.typography.fontSize}px`;
      css.fontWeight = String(styles.typography.fontWeight);
      css.lineHeight = `${styles.typography.lineHeight.value}px`;
      css.letterSpacing = `${styles.typography.letterSpacing.value}px`;
      css.textAlign = styles.typography.textAlign.toLowerCase();
    }

    // Effects
    if (styles.effects.length > 0) {
      const boxShadow = EffectsExtractor.effectsToBoxShadow(styles.effects);
      if (boxShadow) css.boxShadow = boxShadow;
    }

    // Layout
    if (styles.layout) {
      css.display = 'flex';
      css.flexDirection = styles.layout.direction;
      css.alignItems = styles.layout.align.toLowerCase();
      css.justifyContent = styles.layout.justify.toLowerCase();
    }

    // Dimensions
    css.width = `${styles.dimensions.width}px`;
    css.height = `${styles.dimensions.height}px`;

    return css;
  }

  /**
   * Get node ID
   */
  static getNodeId(node: FigmaNode): string {
    if (node.id) return node.id;
    if (node.guid) {
      return `${node.guid.sessionID}:${node.guid.localID}`;
    }
    return 'unknown';
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default EnhancedFigmaParser;
