/**
 * Button Property Extractor
 * Port of validation/extract-button-properties.js to TypeScript
 * Extracts button text, icons, variant, size, state from componentProperties
 */

export interface ButtonProperties {
  text: string;
  variant: string;
  size: string;
  state: string;
  leftIcon: string | null;
  rightIcon: string | null;
  showLeftIcon: boolean;
  showRightIcon: boolean;
}

/**
 * Extract all button properties from a Figma node
 */
export function extractButtonProperties(node: any): ButtonProperties | null {
  if (!node || node.type !== 'INSTANCE') {
    return null;
  }

  const props = node.componentProperties || {};

  // Extract button text
  const buttonText = extractButtonText(node, props);

  // Extract icon configuration
  const { leftIcon, rightIcon, showLeftIcon, showRightIcon } = extractIconConfig(node, props);

  // Extract variant from styling (since it's not in componentProperties)
  const variant = extractVariantFromStyling(node, buttonText);

  // Extract size from dimensions
  const size = extractSizeFromDimensions(node);

  // Extract state from visual properties
  const state = extractStateFromVisuals(node, buttonText);

  return {
    text: buttonText,
    variant,
    size,
    state,
    leftIcon,
    rightIcon,
    showLeftIcon,
    showRightIcon,
  };
}

/**
 * Extract button text from componentProperties or children
 */
function extractButtonText(node: any, props: any): string {
  // Check componentProperties first
  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith('Button Text') && (value as any).value) {
      return (value as any).value;
    }
  }

  // Fall back to finding TEXT child
  if (node.children) {
    for (const child of node.children) {
      if (child.type === 'TEXT' && child.characters) {
        return child.characters;
      }
    }
  }

  return 'Button';
}

/**
 * Extract icon configuration from componentProperties and children
 */
function extractIconConfig(node: any, props: any): {
  leftIcon: string | null;
  rightIcon: string | null;
  showLeftIcon: boolean;
  showRightIcon: boolean;
} {
  let leftIcon: string | null = null;
  let rightIcon: string | null = null;
  let showLeftIcon = false;
  let showRightIcon = false;

  // Get show/hide flags from componentProperties
  for (const [key, value] of Object.entries(props)) {
    const propValue = value as any;
    if (key.startsWith('Show Left Icon')) {
      showLeftIcon = propValue.value === true || propValue.value === 'true';
    } else if (key.startsWith('Show Right Icon')) {
      showRightIcon = propValue.value === true || propValue.value === 'true';
    }
  }

  // Extract icon names from children
  if (node.children) {
    const iconChildren = node.children.filter((c: any) =>
      c.type === 'INSTANCE' && c.name.startsWith('Icon /')
    );

    // First icon is typically left, second is right
    if (iconChildren.length >= 1) {
      leftIcon = extractIconName(iconChildren[0].name);
    }
    if (iconChildren.length >= 2) {
      rightIcon = extractIconName(iconChildren[iconChildren.length - 1].name);
    }
  }

  return {
    leftIcon: showLeftIcon ? leftIcon : null,
    rightIcon: showRightIcon ? rightIcon : null,
    showLeftIcon,
    showRightIcon,
  };
}

/**
 * Extract icon name from "Icon / IconName" format
 */
function extractIconName(iconNodeName: string): string | null {
  // "Icon / Send" -> "Send"
  // "Icon / ArrowRight" -> "ArrowRight"
  // "Icon / LoaderCircle" -> "LoaderCircle"
  const match = iconNodeName.match(/Icon\s*\/\s*(\w+)/);
  if (match) {
    const name = match[1];
    // Map to lucide-react icon names
    return iconNameToLucide(name);
  }
  return null;
}

/**
 * Map Figma icon names to lucide-react icon names
 */
function iconNameToLucide(figmaName: string): string | null {
  // Common mappings
  const mappings: Record<string, string | null> = {
    'Send': 'Send',
    'ArrowRight': 'ArrowRight',
    'LoaderCircle': 'Loader2', // Map to Loader2 for consistency with ShadCN
    'Circle': null, // This is a placeholder/hidden icon
    'Sun': 'Sun',
    'Moon': 'Moon',
    'ChevronDown': 'ChevronDown',
    'ChevronUp': 'ChevronUp',
    'ChevronLeft': 'ChevronLeft',
    'ChevronRight': 'ChevronRight',
    'Plus': 'Plus',
    'Minus': 'Minus',
    'X': 'X',
    'Check': 'Check',
    'AlertCircle': 'AlertCircle',
    'Info': 'Info',
    'HelpCircle': 'HelpCircle'
  };

  return mappings[figmaName] !== undefined ? mappings[figmaName] : figmaName;
}

/**
 * Extract variant from button styling and text
 * Since variant isn't in componentProperties, we infer from visual styling
 */
function extractVariantFromStyling(node: any, buttonText: string): string {
  const text = (buttonText || '').toLowerCase();

  // Check button text for variant hints
  if (text === 'button' || text === 'default' || text === '') {
    return 'default';
  }
  if (text === 'outline') {
    return 'outline';
  }
  if (text === 'ghost') {
    return 'ghost';
  }
  if (text === 'link') {
    return 'link';
  }
  // FIXED: Handle typo "Desctructive" -> "destructive"
  if (text === 'destructive' || text.includes('destruct')) {
    return 'destructive';
  }
  if (text === 'secondary') {
    return 'secondary';
  }

  // Check fills for variant detection
  const fills = node.fills || [];
  const hasBackground = fills.some((f: any) => f.visible !== false && f.opacity > 0.1);
  const strokes = node.strokes || [];
  const hasStroke = strokes.some((s: any) => s.visible !== false);

  if (!hasBackground && hasStroke) {
    return 'outline';
  }
  if (!hasBackground && !hasStroke) {
    return 'ghost';
  }

  // Default to 'default' variant
  return 'default';
}

/**
 * Extract size from button dimensions
 */
function extractSizeFromDimensions(node: any): string {
  const height = node.height || node.size?.y || 0;

  // ShadCN button sizes (approximate):
  // sm: 36px (h-9)
  // default: 40px (h-10)
  // lg: 44px (h-11)
  // icon: 40px (h-10 w-10)

  if (height <= 36) {
    return 'sm';
  }
  if (height >= 44) {
    return 'lg';
  }

  // Check if it's an icon-only button (square)
  const width = node.width || node.size?.x || 0;
  if (Math.abs(width - height) < 5 && width < 50) {
    return 'icon';
  }

  return 'default';
}

/**
 * Extract state from visual properties
 * ENHANCED: Add Loader2 icon for disabled buttons with loading/wait text
 */
function extractStateFromVisuals(node: any, buttonText: string): string {
  const name = node.name.toLowerCase();
  const text = (buttonText || '').toLowerCase();

  // Check for state indicators in node name
  if (name.includes('hover')) return 'hover';
  if (name.includes('focus')) return 'focus';
  if (name.includes('active') || name.includes('pressed')) return 'active';
  if (name.includes('disabled')) return 'disabled';
  if (name.includes('loading')) return 'loading';

  // Check opacity for disabled state
  if (node.opacity < 0.6) {
    return 'disabled';
  }

  // FIXED: Check button text for loading indicators
  if (text.includes('wait') || text.includes('loading') || text.includes('...')) {
    return 'loading';
  }

  return 'default';
}

/**
 * Process all buttons in a Figma export
 */
export function extractAllButtons(figmaData: any): ButtonProperties[] {
  const buttons: ButtonProperties[] = [];

  function traverse(node: any) {
    if (node.type === 'INSTANCE' && node.name === 'Button') {
      const props = extractButtonProperties(node);
      if (props) {
        // FIXED: For loading/disabled buttons with "wait" text, add Loader2 icon
        if ((props.state === 'loading' || props.state === 'disabled') &&
            props.text.toLowerCase().includes('wait') &&
            !props.leftIcon && !props.rightIcon) {
          props.leftIcon = 'Loader2';
          props.showLeftIcon = true;
        }
        buttons.push(props);
      }
    }

    if (node.children) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  // Start from root node
  const rootNode = figmaData.node || figmaData.document || figmaData;
  traverse(rootNode);

  return buttons;
}

/**
 * Format button properties for prompt inclusion
 */
export function formatButtonPropertiesForPrompt(buttons: ButtonProperties[]): string {
  if (buttons.length === 0) {
    return '';
  }

  let output = `# Button Analysis\n`;
  output += `Total Buttons: ${buttons.length}\n`;

  // Extract unique variants
  const variants = Array.from(new Set(buttons.map(b => b.variant))).filter(v => v !== 'default');
  if (variants.length > 0) {
    output += `Variants Found: ${['default', ...variants].join(', ')}\n`;
  }

  // Extract unique icons
  const icons = Array.from(new Set(
    buttons.flatMap(b => [b.leftIcon, b.rightIcon]).filter(Boolean) as string[]
  ));
  if (icons.length > 0) {
    output += `Icons Used: ${icons.join(', ')}\n`;
  }

  output += `\n# Detailed Button Specifications\n`;

  buttons.forEach((btn, index) => {
    output += `Button ${index + 1}:\n`;
    output += `  - Text: "${btn.text}"\n`;
    output += `  - Variant: ${btn.variant}\n`;
    output += `  - Size: ${btn.size}\n`;
    output += `  - State: ${btn.state}\n`;
    if (btn.leftIcon) {
      output += `  - Left Icon: ${btn.leftIcon}\n`;
    }
    if (btn.rightIcon) {
      output += `  - Right Icon: ${btn.rightIcon}\n`;
    }
    output += `\n`;
  });

  return output;
}
