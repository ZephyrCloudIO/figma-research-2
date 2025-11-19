/**
 * Extract Button Properties from Figma Export
 *
 * Extracts variant, size, state, text, and icons from button instances
 * Based on component properties and structural analysis
 */

/**
 * Extract all button properties from a Figma node
 */
export function extractButtonProperties(node) {
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
  const state = extractStateFromVisuals(node);

  return {
    text: buttonText,
    variant,
    size,
    state,
    leftIcon,
    rightIcon,
    showLeftIcon,
    showRightIcon,
    rawNode: node
  };
}

/**
 * Extract button text from componentProperties or children
 */
function extractButtonText(node, props) {
  // Check componentProperties first
  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith('Button Text') && value.value) {
      return value.value;
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
function extractIconConfig(node, props) {
  let leftIcon = null;
  let rightIcon = null;
  let showLeftIcon = false;
  let showRightIcon = false;

  // Get show/hide flags from componentProperties
  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith('Show Left Icon')) {
      showLeftIcon = value.value === true || value.value === 'true';
    } else if (key.startsWith('Show Right Icon')) {
      showRightIcon = value.value === true || value.value === 'true';
    }
  }

  // Extract icon names from children
  if (node.children) {
    const iconChildren = node.children.filter(c =>
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
    showRightIcon
  };
}

/**
 * Extract icon name from "Icon / IconName" format
 */
function extractIconName(iconNodeName) {
  // "Icon / Send" -> "Send"
  // "Icon / ArrowRight" -> "ArrowRight"
  // "Icon / LoaderCircle" -> "LoaderCircle"
  const match = iconNodeName.match(/Icon\s*\/\s*(\w+)/);
  if (match) {
    const name = match[1];
    // Map to lucide-react icon names (convert to kebab-case)
    return iconNameToLucide(name);
  }
  return null;
}

/**
 * Map Figma icon names to lucide-react icon names
 */
function iconNameToLucide(figmaName) {
  // Common mappings
  const mappings = {
    'Send': 'Send',
    'ArrowRight': 'ArrowRight',
    'LoaderCircle': 'LoaderCircle',
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

  return mappings[figmaName] || figmaName;
}

/**
 * Extract variant from button styling and text
 * Since variant isn't in componentProperties, we infer from visual styling
 */
function extractVariantFromStyling(node, buttonText) {
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
  if (text === 'destructive') {
    return 'destructive';
  }
  if (text === 'secondary') {
    return 'secondary';
  }

  // Check fills for variant detection
  const fills = node.fills || [];
  const hasBackground = fills.some(f => f.visible !== false && f.opacity > 0.1);
  const strokes = node.strokes || [];
  const hasStroke = strokes.some(s => s.visible !== false);

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
function extractSizeFromDimensions(node) {
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
 */
function extractStateFromVisuals(node) {
  const name = node.name.toLowerCase();

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

  return 'default';
}

/**
 * Process all buttons in a Figma export
 */
export function extractAllButtons(figmaData) {
  const buttons = [];

  function traverse(node) {
    if (node.type === 'INSTANCE' && node.name === 'Button') {
      const props = extractButtonProperties(node);
      if (props) {
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
