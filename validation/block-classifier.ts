/**
 * Block Classification System for Figma-to-ShadCN
 *
 * Hierarchical classification system for 1,074+ block components from
 * Zephyr Cloud ShadCN Design System (Official Blocks, Pro Application, Pro Landing Page).
 *
 * Strategy: Instead of 1,074 individual classifiers, we use category-level
 * classification with composition detection and pattern matching.
 */

import { FigmaNode, ComponentType } from './enhanced-figma-parser.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export enum BlockCategory {
  // Marketing & Landing Page Blocks (522 components)
  HERO = 'Hero',
  FEATURES = 'Features',
  PRICING = 'Pricing',
  TESTIMONIALS = 'Testimonials',
  CTA = 'CTA',
  FOOTER = 'Footer',
  HEADER = 'Header',

  // Authentication Blocks
  AUTHENTICATION = 'Authentication',

  // Application Blocks (311 components)
  DASHBOARD = 'Dashboard',
  SIDEBAR = 'Sidebar',
  STATS = 'Stats',
  CHARTS = 'Charts',

  // E-commerce Blocks
  ECOMMERCE = 'E-commerce',
  PRODUCT = 'Product',
  CART = 'Cart',
  CHECKOUT = 'Checkout',

  // Content Blocks
  BLOG = 'Blog',
  ARTICLE = 'Article',
  CONTENT_GRID = 'ContentGrid',

  // Form Blocks
  FORM = 'Form',
  CONTACT = 'Contact',

  // Navigation Blocks
  NAVIGATION = 'Navigation',
  BREADCRUMB = 'Breadcrumb',

  // Layout Blocks
  LAYOUT = 'Layout',
  SECTION = 'Section',

  UNKNOWN = 'Unknown'
}

export enum BlockSubType {
  // Hero variants
  HERO_SIMPLE = 'Hero-Simple',
  HERO_WITH_IMAGE = 'Hero-WithImage',
  HERO_SPLIT = 'Hero-Split',
  HERO_CENTERED = 'Hero-Centered',

  // Feature variants
  FEATURES_GRID = 'Features-Grid',
  FEATURES_LIST = 'Features-List',
  FEATURES_CARDS = 'Features-Cards',
  FEATURES_WITH_ICONS = 'Features-WithIcons',

  // Pricing variants
  PRICING_SIMPLE = 'Pricing-Simple',
  PRICING_COMPARISON = 'Pricing-Comparison',
  PRICING_CARDS = 'Pricing-Cards',
  PRICING_TABLE = 'Pricing-Table',

  // Authentication variants
  LOGIN = 'Login',
  REGISTER = 'Register',
  FORGOT_PASSWORD = 'ForgotPassword',
  RESET_PASSWORD = 'ResetPassword',
  TWO_FACTOR = 'TwoFactor',

  // Dashboard variants
  DASHBOARD_STATS = 'Dashboard-Stats',
  DASHBOARD_HEADER = 'Dashboard-Header',
  DASHBOARD_SIDEBAR = 'Dashboard-Sidebar',
  DASHBOARD_WIDGET = 'Dashboard-Widget',

  // E-commerce variants
  PRODUCT_CARD = 'Product-Card',
  PRODUCT_LIST = 'Product-List',
  PRODUCT_DETAIL = 'Product-Detail',
  CART_SUMMARY = 'Cart-Summary',
  CHECKOUT_FORM = 'Checkout-Form',

  // Blog variants
  BLOG_CARD = 'Blog-Card',
  BLOG_LIST = 'Blog-List',
  BLOG_POST = 'Blog-Post',

  UNKNOWN = 'Unknown'
}

export interface BlockClassification {
  category: BlockCategory;
  subType: BlockSubType;
  blockType: string;  // Human-readable name
  confidence: number;
  composedOf: ComponentComposition[];
  layoutPattern: LayoutPattern;
  reasons: string[];
  characteristics: BlockCharacteristics;
}

export interface ComponentComposition {
  componentType: ComponentType;
  count: number;
  location: 'root' | 'nested' | 'deep';
  confidence: number;
}

export interface LayoutPattern {
  type: 'vertical' | 'horizontal' | 'grid' | 'flex' | 'absolute' | 'unknown';
  columns?: number;
  rows?: number;
  hasImages: boolean;
  hasText: boolean;
  hasButtons: boolean;
  hasForm: boolean;
  complexity: 'simple' | 'moderate' | 'complex';
}

export interface BlockCharacteristics {
  isFullWidth: boolean;
  isLargeSection: boolean;  // >500px height
  hasMultipleColumns: boolean;
  hasHierarchy: boolean;  // Clear parent-child structure
  dominantContent: 'text' | 'images' | 'forms' | 'mixed';
  estimatedComplexity: number;  // 1-10 scale
}

// ============================================================================
// BLOCK CLASSIFIER
// ============================================================================

export class BlockClassifier {
  /**
   * Main entry point: Classify a Figma node as a block
   */
  static classifyBlock(node: FigmaNode): BlockClassification | null {
    // Quick filters: Must be large enough to be a block
    if (!this.isLikelyBlock(node)) {
      return null;
    }

    const composition = this.analyzeComposition(node);
    const layout = this.analyzeLayoutPattern(node);
    const characteristics = this.analyzeCharacteristics(node, layout);

    // Try category-specific classifiers
    const classifiers = [
      // Marketing/Landing Page (most common - 522 components)
      this.classifyHeroBlock,
      this.classifyFeaturesBlock,
      this.classifyPricingBlock,
      this.classifyTestimonialsBlock,
      this.classifyCTABlock,
      this.classifyFooterBlock,
      this.classifyHeaderBlock,

      // Authentication
      this.classifyAuthenticationBlock,

      // Application
      this.classifyDashboardBlock,
      this.classifySidebarBlock,
      this.classifyStatsBlock,

      // E-commerce
      this.classifyEcommerceBlock,

      // Content
      this.classifyBlogBlock,
      this.classifyContentBlock,

      // Forms
      this.classifyFormBlock,

      // Navigation
      this.classifyNavigationBlock,
    ];

    for (const classifier of classifiers) {
      const result = classifier.call(this, node, composition, layout, characteristics);
      if (result && result.confidence >= 0.5) {
        return result;
      }
    }

    // Fallback: Generic block classification
    return this.classifyGenericBlock(node, composition, layout, characteristics);
  }

  /**
   * Quick filter: Is this node likely to be a block?
   */
  private static isLikelyBlock(node: FigmaNode): boolean {
    // Must have reasonable size
    if (!node.size) return false;

    const width = node.size.x;
    const height = node.size.y;

    // Too small to be a block
    if (width < 200 || height < 100) return false;

    // Must have children (blocks are compositions)
    if (!node.children || node.children.length < 2) return false;

    return true;
  }

  // ============================================================================
  // COMPOSITION ANALYSIS
  // ============================================================================

  /**
   * Analyze what components make up this block
   */
  private static analyzeComposition(node: FigmaNode): ComponentComposition[] {
    const compositions: Map<ComponentType, ComponentComposition> = new Map();

    const traverse = (n: FigmaNode, depth: number) => {
      const type = this.inferComponentType(n);

      if (type !== 'Unknown') {
        const existing = compositions.get(type);
        const location = depth === 1 ? 'root' : depth === 2 ? 'nested' : 'deep';

        if (existing) {
          existing.count++;
          existing.confidence = Math.max(existing.confidence, 1 - (depth * 0.1));
        } else {
          compositions.set(type, {
            componentType: type,
            count: 1,
            location,
            confidence: 1 - (depth * 0.1)
          });
        }
      }

      if (n.children) {
        for (const child of n.children) {
          traverse(child, depth + 1);
        }
      }
    };

    traverse(node, 0);
    return Array.from(compositions.values());
  }

  /**
   * Infer component type from node (simplified version)
   */
  private static inferComponentType(node: FigmaNode): ComponentType {
    const name = node.name.toLowerCase();

    // Button-like
    if (name.includes('button') || name.includes('btn')) return 'Button';

    // Input-like
    if (name.includes('input') || name.includes('text-field') || name.includes('textfield')) return 'Input';

    // Card-like
    if (name.includes('card')) return 'Card';

    // Badge-like
    if (name.includes('badge') || name.includes('tag')) return 'Badge';

    // Avatar-like
    if (name.includes('avatar') || name.includes('profile')) return 'Avatar';

    // Icon-like
    if (name.includes('icon')) return 'Icon';

    // Image-like
    if (name.includes('image') || name.includes('img') || name.includes('picture')) return 'Image';

    // Form-like
    if (name.includes('form')) return 'Form';

    // Table-like
    if (name.includes('table') || name.includes('grid')) return 'Table';

    return 'Unknown';
  }

  // ============================================================================
  // LAYOUT ANALYSIS
  // ============================================================================

  /**
   * Analyze layout pattern of the block
   */
  private static analyzeLayoutPattern(node: FigmaNode): LayoutPattern {
    const hasImages = this.containsImages(node);
    const hasText = this.containsText(node);
    const hasButtons = this.containsButtons(node);
    const hasForm = this.containsForm(node);

    let type: LayoutPattern['type'] = 'unknown';
    let columns: number | undefined;
    let rows: number | undefined;
    let complexity: 'simple' | 'moderate' | 'complex' = 'simple';

    if (node.layoutMode) {
      if (node.layoutMode === 'HORIZONTAL') {
        type = 'horizontal';
      } else if (node.layoutMode === 'VERTICAL') {
        type = 'vertical';
      }
    }

    // Detect grid layout
    if (node.children) {
      const childCount = node.children.length;
      if (childCount >= 4) {
        // Check if children are arranged in a grid pattern
        const isGrid = this.detectGridLayout(node.children);
        if (isGrid) {
          type = 'grid';
          columns = this.estimateColumns(node.children);
          rows = Math.ceil(childCount / (columns || 1));
        }
      }

      // Estimate complexity
      if (childCount < 5) complexity = 'simple';
      else if (childCount < 15) complexity = 'moderate';
      else complexity = 'complex';
    }

    return {
      type,
      columns,
      rows,
      hasImages,
      hasText,
      hasButtons,
      hasForm,
      complexity
    };
  }

  private static containsImages(node: FigmaNode): boolean {
    if (node.name.toLowerCase().includes('image') || node.name.toLowerCase().includes('img')) {
      return true;
    }
    if (node.children) {
      return node.children.some(child => this.containsImages(child));
    }
    return false;
  }

  private static containsText(node: FigmaNode): boolean {
    if (node.characters && node.characters.length > 0) return true;
    if (node.children) {
      return node.children.some(child => this.containsText(child));
    }
    return false;
  }

  private static containsButtons(node: FigmaNode): boolean {
    if (node.name.toLowerCase().includes('button')) return true;
    if (node.children) {
      return node.children.some(child => this.containsButtons(child));
    }
    return false;
  }

  private static containsForm(node: FigmaNode): boolean {
    const name = node.name.toLowerCase();
    if (name.includes('form') || name.includes('input') || name.includes('field')) {
      return true;
    }
    if (node.children) {
      return node.children.some(child => this.containsForm(child));
    }
    return false;
  }

  private static detectGridLayout(children: FigmaNode[]): boolean {
    // Simple heuristic: if children have similar Y positions (within threshold), it's likely a grid
    if (children.length < 4) return false;

    const positions = children
      .map(c => c.relativeTransform ? c.relativeTransform.m12 : 0)
      .sort((a, b) => a - b);

    // Check if there are at least 2 distinct rows
    const threshold = 50;
    let rowCount = 1;
    for (let i = 1; i < positions.length; i++) {
      if (Math.abs(positions[i] - positions[i-1]) > threshold) {
        rowCount++;
      }
    }

    return rowCount >= 2;
  }

  private static estimateColumns(children: FigmaNode[]): number {
    if (children.length < 2) return 1;

    // Group by similar Y positions to find columns
    const yPositions = children.map(c => c.relativeTransform ? c.relativeTransform.m12 : 0);
    const firstRowY = Math.min(...yPositions);
    const threshold = 50;

    const firstRowCount = yPositions.filter(y => Math.abs(y - firstRowY) < threshold).length;
    return firstRowCount;
  }

  // ============================================================================
  // CHARACTERISTICS ANALYSIS
  // ============================================================================

  /**
   * Analyze block characteristics
   */
  private static analyzeCharacteristics(node: FigmaNode, layout: LayoutPattern): BlockCharacteristics {
    const width = node.size?.x || 0;
    const height = node.size?.y || 0;

    const isFullWidth = width >= 1000;  // Likely full-width section
    const isLargeSection = height >= 500;
    const hasMultipleColumns = (layout.columns || 1) > 1;
    const hasHierarchy = (node.children?.length || 0) >= 3;

    // Determine dominant content
    let dominantContent: BlockCharacteristics['dominantContent'] = 'mixed';
    if (layout.hasForm) {
      dominantContent = 'forms';
    } else if (layout.hasImages && !layout.hasText) {
      dominantContent = 'images';
    } else if (layout.hasText && !layout.hasImages) {
      dominantContent = 'text';
    }

    // Estimate complexity (1-10 scale)
    let complexity = 1;
    complexity += (node.children?.length || 0) * 0.3;  // More children = more complex
    complexity += hasMultipleColumns ? 2 : 0;
    complexity += layout.hasForm ? 2 : 0;
    complexity += layout.hasImages ? 1 : 0;
    complexity = Math.min(Math.round(complexity), 10);

    return {
      isFullWidth,
      isLargeSection,
      hasMultipleColumns,
      hasHierarchy,
      dominantContent,
      estimatedComplexity: complexity
    };
  }

  // ============================================================================
  // CATEGORY CLASSIFIERS
  // ============================================================================

  /**
   * Classify Hero Blocks
   * Hero sections are large, prominent sections at the top of pages
   */
  private static classifyHeroBlock(
    node: FigmaNode,
    composition: ComponentComposition[],
    layout: LayoutPattern,
    characteristics: BlockCharacteristics
  ): BlockClassification | null {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;
    let subType = BlockSubType.HERO_SIMPLE;

    // Name-based detection
    if (name.includes('hero')) {
      confidence += 0.8;
      reasons.push('Name contains "hero"');
    }

    // Layout-based detection
    if (characteristics.isLargeSection && characteristics.isFullWidth) {
      confidence += 0.3;
      reasons.push('Large, full-width section (typical hero pattern)');
    }

    // Composition-based detection (Hero = Heading + CTA buttons + optional image)
    const hasText = layout.hasText;
    const hasButtons = layout.hasButtons;
    const hasImages = layout.hasImages;

    if (hasText && hasButtons) {
      confidence += 0.4;
      reasons.push('Contains text and CTA buttons (hero pattern)');
    }

    // Determine sub-type
    if (hasImages && layout.type === 'horizontal') {
      subType = BlockSubType.HERO_SPLIT;
      reasons.push('Split layout with image');
    } else if (hasImages) {
      subType = BlockSubType.HERO_WITH_IMAGE;
      reasons.push('Contains hero image');
    } else if (layout.type === 'vertical') {
      subType = BlockSubType.HERO_CENTERED;
      reasons.push('Centered vertical layout');
    }

    if (confidence >= 0.5) {
      return {
        category: BlockCategory.HERO,
        subType,
        blockType: this.subTypeToReadable(subType),
        confidence: Math.min(confidence, 1),
        composedOf: composition,
        layoutPattern: layout,
        reasons,
        characteristics
      };
    }

    return null;
  }

  /**
   * Classify Features Blocks
   * Feature sections showcase product/service features in grids or lists
   */
  private static classifyFeaturesBlock(
    node: FigmaNode,
    composition: ComponentComposition[],
    layout: LayoutPattern,
    characteristics: BlockCharacteristics
  ): BlockClassification | null {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;
    let subType = BlockSubType.FEATURES_LIST;

    // Name-based detection
    if (name.includes('feature')) {
      confidence += 0.8;
      reasons.push('Name contains "feature"');
    }

    // Layout-based detection (Features typically have grid/list layout)
    if (layout.type === 'grid' && characteristics.hasMultipleColumns) {
      confidence += 0.4;
      reasons.push('Grid layout with multiple columns (feature grid pattern)');
      subType = BlockSubType.FEATURES_GRID;
    }

    // Composition-based detection (Features = Icons + Text + optional Cards)
    const hasIcons = composition.some(c => c.componentType === 'Icon');
    const hasCards = composition.some(c => c.componentType === 'Card');

    if (hasIcons) {
      confidence += 0.3;
      reasons.push('Contains icons (typical feature presentation)');
      subType = BlockSubType.FEATURES_WITH_ICONS;
    }

    if (hasCards) {
      confidence += 0.2;
      reasons.push('Uses card components for features');
      subType = BlockSubType.FEATURES_CARDS;
    }

    // Repetitive structure (multiple similar children)
    if (node.children && node.children.length >= 3) {
      const similarChildren = this.countSimilarChildren(node.children);
      if (similarChildren >= 3) {
        confidence += 0.2;
        reasons.push(`Has ${similarChildren} similar child elements (feature repetition)`);
      }
    }

    if (confidence >= 0.5) {
      return {
        category: BlockCategory.FEATURES,
        subType,
        blockType: this.subTypeToReadable(subType),
        confidence: Math.min(confidence, 1),
        composedOf: composition,
        layoutPattern: layout,
        reasons,
        characteristics
      };
    }

    return null;
  }

  /**
   * Classify Pricing Blocks
   */
  private static classifyPricingBlock(
    node: FigmaNode,
    composition: ComponentComposition[],
    layout: LayoutPattern,
    characteristics: BlockCharacteristics
  ): BlockClassification | null {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;
    let subType = BlockSubType.PRICING_SIMPLE;

    // Name-based detection
    if (name.includes('pricing') || name.includes('price') || name.includes('plan')) {
      confidence += 0.8;
      reasons.push('Name indicates pricing content');
    }

    // Composition-based detection (Pricing = Cards + Badges + Buttons)
    const hasCards = composition.some(c => c.componentType === 'Card');
    const hasBadges = composition.some(c => c.componentType === 'Badge');
    const hasButtons = composition.some(c => c.componentType === 'Button');

    if (hasCards && hasButtons) {
      confidence += 0.4;
      reasons.push('Cards with CTA buttons (pricing card pattern)');
      subType = BlockSubType.PRICING_CARDS;
    }

    if (hasBadges) {
      confidence += 0.2;
      reasons.push('Contains badges (plan highlights)');
    }

    // Layout pattern (typically 2-4 columns)
    if (layout.columns && layout.columns >= 2 && layout.columns <= 4) {
      confidence += 0.3;
      reasons.push(`${layout.columns}-column layout (typical pricing table)`);
    }

    if (confidence >= 0.5) {
      return {
        category: BlockCategory.PRICING,
        subType,
        blockType: this.subTypeToReadable(subType),
        confidence: Math.min(confidence, 1),
        composedOf: composition,
        layoutPattern: layout,
        reasons,
        characteristics
      };
    }

    return null;
  }

  /**
   * Classify Testimonials Blocks
   */
  private static classifyTestimonialsBlock(
    node: FigmaNode,
    composition: ComponentComposition[],
    layout: LayoutPattern,
    characteristics: BlockCharacteristics
  ): BlockClassification | null {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    // Name-based detection
    if (name.includes('testimonial') || name.includes('review') || name.includes('quote')) {
      confidence += 0.8;
      reasons.push('Name indicates testimonial/review content');
    }

    // Composition-based detection (Testimonials = Avatar + Text + optional Badge)
    const hasAvatars = composition.some(c => c.componentType === 'Avatar');
    const hasCards = composition.some(c => c.componentType === 'Card');

    if (hasAvatars) {
      confidence += 0.4;
      reasons.push('Contains avatars (customer/user attribution)');
    }

    if (hasCards) {
      confidence += 0.2;
      reasons.push('Uses cards for testimonial display');
    }

    if (confidence >= 0.5) {
      return {
        category: BlockCategory.TESTIMONIALS,
        subType: BlockSubType.UNKNOWN,
        blockType: 'Testimonials Section',
        confidence: Math.min(confidence, 1),
        composedOf: composition,
        layoutPattern: layout,
        reasons,
        characteristics
      };
    }

    return null;
  }

  /**
   * Classify CTA (Call-to-Action) Blocks
   */
  private static classifyCTABlock(
    node: FigmaNode,
    composition: ComponentComposition[],
    layout: LayoutPattern,
    characteristics: BlockCharacteristics
  ): BlockClassification | null {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    // Name-based detection
    if (name.includes('cta') || name.includes('call-to-action') || name.includes('action')) {
      confidence += 0.7;
      reasons.push('Name indicates CTA section');
    }

    // Layout characteristics (CTAs are typically centered, moderate size)
    if (layout.type === 'vertical' && layout.hasButtons) {
      confidence += 0.4;
      reasons.push('Centered layout with CTA buttons');
    }

    // Composition (CTA = Heading + Text + Button(s))
    const buttonCount = composition.find(c => c.componentType === 'Button')?.count || 0;
    if (buttonCount >= 1) {
      confidence += 0.3;
      reasons.push(`Contains ${buttonCount} CTA button(s)`);
    }

    // Simple composition (CTAs are usually simple)
    if (characteristics.estimatedComplexity <= 4) {
      confidence += 0.2;
      reasons.push('Simple composition (typical for CTA)');
    }

    if (confidence >= 0.5) {
      return {
        category: BlockCategory.CTA,
        subType: BlockSubType.UNKNOWN,
        blockType: 'Call-to-Action Section',
        confidence: Math.min(confidence, 1),
        composedOf: composition,
        layoutPattern: layout,
        reasons,
        characteristics
      };
    }

    return null;
  }

  /**
   * Classify Footer Blocks
   */
  private static classifyFooterBlock(
    node: FigmaNode,
    composition: ComponentComposition[],
    layout: LayoutPattern,
    characteristics: BlockCharacteristics
  ): BlockClassification | null {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    // Name-based detection
    if (name.includes('footer')) {
      confidence += 0.9;
      reasons.push('Name contains "footer"');
    }

    // Layout characteristics (Footers are wide, multi-column)
    if (characteristics.isFullWidth && characteristics.hasMultipleColumns) {
      confidence += 0.4;
      reasons.push('Full-width, multi-column layout (footer pattern)');
    }

    // Composition (Footers = Navigation + Social icons + Text)
    const hasIcons = composition.some(c => c.componentType === 'Icon');
    if (hasIcons && layout.columns && layout.columns >= 3) {
      confidence += 0.3;
      reasons.push('Multiple columns with icons (footer navigation)');
    }

    if (confidence >= 0.5) {
      return {
        category: BlockCategory.FOOTER,
        subType: BlockSubType.UNKNOWN,
        blockType: 'Footer Section',
        confidence: Math.min(confidence, 1),
        composedOf: composition,
        layoutPattern: layout,
        reasons,
        characteristics
      };
    }

    return null;
  }

  /**
   * Classify Header/Navigation Blocks
   */
  private static classifyHeaderBlock(
    node: FigmaNode,
    composition: ComponentComposition[],
    layout: LayoutPattern,
    characteristics: BlockCharacteristics
  ): BlockClassification | null {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    // Name-based detection
    if (name.includes('header') || name.includes('navbar') || name.includes('nav')) {
      confidence += 0.8;
      reasons.push('Name indicates header/navigation');
    }

    // Layout characteristics (Headers are horizontal, full-width, small height)
    if (layout.type === 'horizontal' && characteristics.isFullWidth) {
      const height = node.size?.y || 0;
      if (height < 150) {
        confidence += 0.4;
        reasons.push('Horizontal, full-width, compact (header pattern)');
      }
    }

    // Composition (Headers = Logo + Nav + Button/Avatar)
    const hasButtons = composition.some(c => c.componentType === 'Button');
    const hasAvatar = composition.some(c => c.componentType === 'Avatar');

    if (hasButtons || hasAvatar) {
      confidence += 0.3;
      reasons.push('Contains action buttons or user avatar');
    }

    if (confidence >= 0.5) {
      return {
        category: BlockCategory.HEADER,
        subType: BlockSubType.UNKNOWN,
        blockType: 'Header/Navigation',
        confidence: Math.min(confidence, 1),
        composedOf: composition,
        layoutPattern: layout,
        reasons,
        characteristics
      };
    }

    return null;
  }

  /**
   * Classify Authentication Blocks
   */
  private static classifyAuthenticationBlock(
    node: FigmaNode,
    composition: ComponentComposition[],
    layout: LayoutPattern,
    characteristics: BlockCharacteristics
  ): BlockClassification | null {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;
    let subType = BlockSubType.LOGIN;

    // Name-based detection
    if (name.includes('login') || name.includes('sign-in') || name.includes('signin')) {
      confidence += 0.8;
      subType = BlockSubType.LOGIN;
      reasons.push('Name indicates login form');
    } else if (name.includes('register') || name.includes('sign-up') || name.includes('signup')) {
      confidence += 0.8;
      subType = BlockSubType.REGISTER;
      reasons.push('Name indicates registration form');
    } else if (name.includes('forgot') || name.includes('reset')) {
      confidence += 0.8;
      subType = name.includes('forgot') ? BlockSubType.FORGOT_PASSWORD : BlockSubType.RESET_PASSWORD;
      reasons.push('Name indicates password recovery');
    } else if (name.includes('2fa') || name.includes('two-factor') || name.includes('otp')) {
      confidence += 0.8;
      subType = BlockSubType.TWO_FACTOR;
      reasons.push('Name indicates two-factor authentication');
    }

    // Composition-based detection (Auth = Card + Input + Button + optional Checkbox)
    const hasInputs = composition.some(c => c.componentType === 'Input');
    const hasButtons = composition.some(c => c.componentType === 'Button');
    const hasCard = composition.some(c => c.componentType === 'Card');

    if (hasInputs && hasButtons) {
      confidence += 0.4;
      reasons.push('Form with inputs and submit button');
    }

    if (hasCard) {
      confidence += 0.2;
      reasons.push('Uses card wrapper (auth form pattern)');
    }

    // Layout characteristics (Auth forms are typically centered, moderate size)
    if (layout.type === 'vertical' && !characteristics.isFullWidth) {
      confidence += 0.2;
      reasons.push('Vertical, centered layout (auth form pattern)');
    }

    if (confidence >= 0.5) {
      return {
        category: BlockCategory.AUTHENTICATION,
        subType,
        blockType: this.subTypeToReadable(subType),
        confidence: Math.min(confidence, 1),
        composedOf: composition,
        layoutPattern: layout,
        reasons,
        characteristics
      };
    }

    return null;
  }

  /**
   * Classify Dashboard Blocks
   */
  private static classifyDashboardBlock(
    node: FigmaNode,
    composition: ComponentComposition[],
    layout: LayoutPattern,
    characteristics: BlockCharacteristics
  ): BlockClassification | null {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;
    let subType = BlockSubType.DASHBOARD_WIDGET;

    // Name-based detection
    if (name.includes('dashboard')) {
      confidence += 0.7;
      reasons.push('Name contains "dashboard"');

      if (name.includes('stats') || name.includes('metric')) {
        subType = BlockSubType.DASHBOARD_STATS;
      } else if (name.includes('header')) {
        subType = BlockSubType.DASHBOARD_HEADER;
      } else if (name.includes('sidebar')) {
        subType = BlockSubType.DASHBOARD_SIDEBAR;
      }
    }

    // Composition-based detection (Dashboards = Cards + Charts + Stats)
    const hasCards = composition.some(c => c.componentType === 'Card');
    const hasCharts = composition.some(c => c.componentType === 'Chart');
    const hasBadges = composition.some(c => c.componentType === 'Badge');

    if (hasCards && (hasCharts || hasBadges)) {
      confidence += 0.4;
      reasons.push('Cards with charts/metrics (dashboard pattern)');
    }

    // Layout characteristics (Dashboards are complex, often grid-based)
    if (layout.type === 'grid' && characteristics.estimatedComplexity >= 5) {
      confidence += 0.3;
      reasons.push('Complex grid layout (dashboard pattern)');
    }

    if (confidence >= 0.5) {
      return {
        category: BlockCategory.DASHBOARD,
        subType,
        blockType: this.subTypeToReadable(subType),
        confidence: Math.min(confidence, 1),
        composedOf: composition,
        layoutPattern: layout,
        reasons,
        characteristics
      };
    }

    return null;
  }

  /**
   * Classify Sidebar Blocks
   */
  private static classifySidebarBlock(
    node: FigmaNode,
    composition: ComponentComposition[],
    layout: LayoutPattern,
    characteristics: BlockCharacteristics
  ): BlockClassification | null {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    // Name-based detection
    if (name.includes('sidebar') || name.includes('side-bar')) {
      confidence += 0.9;
      reasons.push('Name contains "sidebar"');
    }

    // Layout characteristics (Sidebars are vertical, narrow, tall)
    if (layout.type === 'vertical') {
      const width = node.size?.x || 0;
      const height = node.size?.y || 0;

      if (width < 400 && height > 500) {
        confidence += 0.4;
        reasons.push('Narrow, tall vertical layout (sidebar pattern)');
      }
    }

    // Composition (Sidebars = Navigation items + Icons)
    const hasIcons = composition.some(c => c.componentType === 'Icon');
    if (hasIcons && layout.type === 'vertical') {
      confidence += 0.3;
      reasons.push('Vertical list with icons (sidebar navigation)');
    }

    if (confidence >= 0.5) {
      return {
        category: BlockCategory.SIDEBAR,
        subType: BlockSubType.DASHBOARD_SIDEBAR,
        blockType: 'Sidebar Navigation',
        confidence: Math.min(confidence, 1),
        composedOf: composition,
        layoutPattern: layout,
        reasons,
        characteristics
      };
    }

    return null;
  }

  /**
   * Classify Stats Blocks
   */
  private static classifyStatsBlock(
    node: FigmaNode,
    composition: ComponentComposition[],
    layout: LayoutPattern,
    characteristics: BlockCharacteristics
  ): BlockClassification | null {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    // Name-based detection
    if (name.includes('stats') || name.includes('metric') || name.includes('kpi')) {
      confidence += 0.8;
      reasons.push('Name indicates statistics/metrics');
    }

    // Layout characteristics (Stats are often horizontal, 2-4 items)
    if (layout.type === 'horizontal' || (layout.type === 'grid' && layout.columns && layout.columns <= 4)) {
      confidence += 0.3;
      reasons.push('Horizontal/grid layout (stats pattern)');
    }

    // Composition (Stats = Cards + Badges + Numbers)
    const hasCards = composition.some(c => c.componentType === 'Card');
    const hasBadges = composition.some(c => c.componentType === 'Badge');

    if (hasCards && node.children && node.children.length >= 2 && node.children.length <= 6) {
      confidence += 0.4;
      reasons.push('Multiple cards with metrics');
    }

    if (confidence >= 0.5) {
      return {
        category: BlockCategory.STATS,
        subType: BlockSubType.DASHBOARD_STATS,
        blockType: 'Statistics/Metrics Section',
        confidence: Math.min(confidence, 1),
        composedOf: composition,
        layoutPattern: layout,
        reasons,
        characteristics
      };
    }

    return null;
  }

  /**
   * Classify E-commerce Blocks
   */
  private static classifyEcommerceBlock(
    node: FigmaNode,
    composition: ComponentComposition[],
    layout: LayoutPattern,
    characteristics: BlockCharacteristics
  ): BlockClassification | null {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;
    let subType = BlockSubType.PRODUCT_CARD;

    // Name-based detection
    if (name.includes('product')) {
      confidence += 0.7;
      reasons.push('Name contains "product"');

      if (name.includes('card')) {
        subType = BlockSubType.PRODUCT_CARD;
      } else if (name.includes('list')) {
        subType = BlockSubType.PRODUCT_LIST;
      } else if (name.includes('detail')) {
        subType = BlockSubType.PRODUCT_DETAIL;
      }
    } else if (name.includes('cart')) {
      confidence += 0.8;
      subType = BlockSubType.CART_SUMMARY;
      reasons.push('Name contains "cart"');
    } else if (name.includes('checkout')) {
      confidence += 0.8;
      subType = BlockSubType.CHECKOUT_FORM;
      reasons.push('Name contains "checkout"');
    }

    // Composition-based detection
    const hasImages = layout.hasImages;
    const hasBadges = composition.some(c => c.componentType === 'Badge');
    const hasButtons = layout.hasButtons;

    if (hasImages && hasBadges && hasButtons) {
      confidence += 0.4;
      reasons.push('Image + badge + button (product card pattern)');
    }

    if (confidence >= 0.5) {
      return {
        category: BlockCategory.ECOMMERCE,
        subType,
        blockType: this.subTypeToReadable(subType),
        confidence: Math.min(confidence, 1),
        composedOf: composition,
        layoutPattern: layout,
        reasons,
        characteristics
      };
    }

    return null;
  }

  /**
   * Classify Blog Blocks
   */
  private static classifyBlogBlock(
    node: FigmaNode,
    composition: ComponentComposition[],
    layout: LayoutPattern,
    characteristics: BlockCharacteristics
  ): BlockClassification | null {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;
    let subType = BlockSubType.BLOG_CARD;

    // Name-based detection
    if (name.includes('blog') || name.includes('article') || name.includes('post')) {
      confidence += 0.7;
      reasons.push('Name indicates blog/article content');

      if (name.includes('card')) {
        subType = BlockSubType.BLOG_CARD;
      } else if (name.includes('list')) {
        subType = BlockSubType.BLOG_LIST;
      } else if (name.includes('post')) {
        subType = BlockSubType.BLOG_POST;
      }
    }

    // Composition-based detection (Blog = Image + Title + Excerpt + Meta)
    const hasImages = layout.hasImages;
    const hasCards = composition.some(c => c.componentType === 'Card');
    const hasBadges = composition.some(c => c.componentType === 'Badge');

    if (hasCards && hasImages) {
      confidence += 0.4;
      reasons.push('Card with image (blog card pattern)');
    }

    if (hasBadges) {
      confidence += 0.2;
      reasons.push('Contains badges (category tags)');
    }

    if (confidence >= 0.5) {
      return {
        category: BlockCategory.BLOG,
        subType,
        blockType: this.subTypeToReadable(subType),
        confidence: Math.min(confidence, 1),
        composedOf: composition,
        layoutPattern: layout,
        reasons,
        characteristics
      };
    }

    return null;
  }

  /**
   * Classify Content Blocks (generic content sections)
   */
  private static classifyContentBlock(
    node: FigmaNode,
    composition: ComponentComposition[],
    layout: LayoutPattern,
    characteristics: BlockCharacteristics
  ): BlockClassification | null {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    // Name-based detection
    if (name.includes('content') || name.includes('section')) {
      confidence += 0.5;
      reasons.push('Name indicates content section');
    }

    // Layout-based detection (Content blocks are versatile)
    if (characteristics.isFullWidth && layout.hasText) {
      confidence += 0.3;
      reasons.push('Full-width text content');
    }

    // Moderate complexity
    if (characteristics.estimatedComplexity >= 3 && characteristics.estimatedComplexity <= 6) {
      confidence += 0.2;
      reasons.push('Moderate complexity (content block)');
    }

    if (confidence >= 0.5) {
      return {
        category: BlockCategory.CONTENT_GRID,
        subType: BlockSubType.UNKNOWN,
        blockType: 'Content Section',
        confidence: Math.min(confidence, 1),
        composedOf: composition,
        layoutPattern: layout,
        reasons,
        characteristics
      };
    }

    return null;
  }

  /**
   * Classify Form Blocks
   */
  private static classifyFormBlock(
    node: FigmaNode,
    composition: ComponentComposition[],
    layout: LayoutPattern,
    characteristics: BlockCharacteristics
  ): BlockClassification | null {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    // Name-based detection
    if (name.includes('form') && !name.includes('login') && !name.includes('register')) {
      confidence += 0.7;
      reasons.push('Name contains "form"');
    }

    if (name.includes('contact')) {
      confidence += 0.3;
      reasons.push('Contact form');
    }

    // Composition-based detection (Forms = Multiple inputs + Button)
    const hasForm = layout.hasForm;
    const inputCount = composition.find(c => c.componentType === 'Input')?.count || 0;
    const hasButtons = layout.hasButtons;

    if (hasForm && inputCount >= 2 && hasButtons) {
      confidence += 0.5;
      reasons.push(`Form with ${inputCount} inputs and submit button`);
    }

    if (confidence >= 0.5) {
      return {
        category: BlockCategory.FORM,
        subType: BlockSubType.UNKNOWN,
        blockType: 'Form Block',
        confidence: Math.min(confidence, 1),
        composedOf: composition,
        layoutPattern: layout,
        reasons,
        characteristics
      };
    }

    return null;
  }

  /**
   * Classify Navigation Blocks
   */
  private static classifyNavigationBlock(
    node: FigmaNode,
    composition: ComponentComposition[],
    layout: LayoutPattern,
    characteristics: BlockCharacteristics
  ): BlockClassification | null {
    const name = node.name.toLowerCase();
    const reasons: string[] = [];
    let confidence = 0;

    // Name-based detection
    if (name.includes('navigation') || name.includes('nav') || name.includes('menu')) {
      confidence += 0.7;
      reasons.push('Name indicates navigation');
    }

    if (name.includes('breadcrumb')) {
      confidence += 0.9;
      reasons.push('Breadcrumb navigation');

      return {
        category: BlockCategory.BREADCRUMB,
        subType: BlockSubType.UNKNOWN,
        blockType: 'Breadcrumb Navigation',
        confidence: Math.min(confidence, 1),
        composedOf: composition,
        layoutPattern: layout,
        reasons,
        characteristics
      };
    }

    // Layout characteristics (Navigation is typically horizontal)
    if (layout.type === 'horizontal') {
      confidence += 0.3;
      reasons.push('Horizontal layout (navigation pattern)');
    }

    if (confidence >= 0.5) {
      return {
        category: BlockCategory.NAVIGATION,
        subType: BlockSubType.UNKNOWN,
        blockType: 'Navigation Block',
        confidence: Math.min(confidence, 1),
        composedOf: composition,
        layoutPattern: layout,
        reasons,
        characteristics
      };
    }

    return null;
  }

  /**
   * Fallback: Generic block classification
   */
  private static classifyGenericBlock(
    node: FigmaNode,
    composition: ComponentComposition[],
    layout: LayoutPattern,
    characteristics: BlockCharacteristics
  ): BlockClassification {
    const reasons: string[] = ['No specific block type detected', 'Classified as generic layout block'];

    let category = BlockCategory.LAYOUT;
    if (characteristics.isLargeSection) {
      category = BlockCategory.SECTION;
      reasons.push('Large section block');
    }

    return {
      category,
      subType: BlockSubType.UNKNOWN,
      blockType: 'Generic Layout Block',
      confidence: 0.3,
      composedOf: composition,
      layoutPattern: layout,
      reasons,
      characteristics
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Count similar children (heuristic for repeated patterns)
   */
  private static countSimilarChildren(children: FigmaNode[]): number {
    if (children.length < 2) return 0;

    // Group by similar size
    const sizeGroups = new Map<string, number>();

    for (const child of children) {
      if (child.size) {
        const sizeKey = `${Math.round(child.size.x / 50)}-${Math.round(child.size.y / 50)}`;
        sizeGroups.set(sizeKey, (sizeGroups.get(sizeKey) || 0) + 1);
      }
    }

    // Find the largest group
    let maxGroup = 0;
    for (const count of sizeGroups.values()) {
      maxGroup = Math.max(maxGroup, count);
    }

    return maxGroup;
  }

  /**
   * Convert sub-type enum to readable string
   */
  private static subTypeToReadable(subType: BlockSubType): string {
    return subType
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}
