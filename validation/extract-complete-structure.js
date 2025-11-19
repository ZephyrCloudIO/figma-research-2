/**
 * Extract Complete Component Structure from Figma Export
 *
 * Extracts the ENTIRE component hierarchy including:
 * - Headers with title/tagline/description
 * - Section titles
 * - All component instances
 * - Footers
 * - Separators
 * - Container structure
 */

import { extractAllButtons } from './extract-button-properties.js';

/**
 * Extract complete page structure from Figma export
 */
export function extractCompleteStructure(figmaData) {
  const node = figmaData.node || figmaData;

  const structure = {
    type: 'Page',
    name: node.name,
    sections: []
  };

  // Find major sections
  const container = findNodeByName(node, 'Container');
  if (!container) {
    return structure;
  }

  // Extract header section
  const header = extractHeaderSection(container);
  if (header) {
    structure.sections.push(header);
  }

  // Extract playground section
  const playground = extractPlaygroundSection(container);
  if (playground) {
    structure.sections.push(playground);
  }

  // Extract footer section
  const footer = extractFooterSection(container);
  if (footer) {
    structure.sections.push(footer);
  }

  return structure;
}

/**
 * Extract header section with title, tagline, description
 */
function extractHeaderSection(containerNode) {
  const headerInstance = findNodeByName(containerNode, '_Docs / Header');
  if (!headerInstance) {
    return null;
  }

  const props = headerInstance.componentProperties || {};

  // Extract text properties
  const title = extractPropValue(props, 'Title');
  const tagline = extractPropValue(props, 'Tagline');
  const description = extractPropValue(props, 'Description');

  // Find links in children
  const links = extractLinksFromNode(headerInstance);

  return {
    type: 'Header',
    title,
    tagline,
    description,
    links
  };
}

/**
 * Extract playground section with title and preview
 */
function extractPlaygroundSection(containerNode) {
  const playgroundNode = findNodeByName(containerNode, 'Playground');
  if (!playgroundNode) {
    return null;
  }

  // Extract title
  const titleNode = findNodeByName(playgroundNode, 'Title');
  const title = extractTextFromNode(titleNode) || 'Playground';

  // Extract preview section with all components
  const previewNode = findNodeByName(playgroundNode, 'Preview');
  const components = extractComponentsFromPreview(previewNode);

  return {
    type: 'Playground',
    title,
    components
  };
}

/**
 * Extract components from preview section (Light/Dark themes)
 */
function extractComponentsFromPreview(previewNode) {
  if (!previewNode) {
    return [];
  }

  const wrapper = findNodeByName(previewNode, 'Wrapper');
  if (!wrapper || !wrapper.children) {
    return [];
  }

  const themes = [];

  // Look for Light and Dark theme sections
  for (const child of wrapper.children) {
    if (child.name === 'Light') {
      themes.push({
        theme: 'light',
        components: extractComponentInstances(child)
      });
    } else if (child.name === 'Dark') {
      themes.push({
        theme: 'dark',
        components: extractComponentInstances(child)
      });
    }
  }

  return themes;
}

/**
 * Extract component instances from a theme section
 */
function extractComponentInstances(themeNode) {
  const components = [];

  if (!themeNode.children) {
    return components;
  }

  for (const child of themeNode.children) {
    if (child.type === 'INSTANCE') {
      // Determine component type
      const componentType = classifyComponent(child);

      if (componentType === 'Button') {
        components.push({
          type: 'Button',
          ...extractButtonProperties(child)
        });
      } else if (componentType === 'Icon') {
        components.push({
          type: 'Icon',
          name: child.name
        });
      }
      // Add more component types as needed
    }
  }

  return components;
}

/**
 * Extract button properties (reuse from extract-button-properties.js)
 */
function extractButtonProperties(node) {
  const props = node.componentProperties || {};

  // Extract button text
  const buttonText = extractPropValue(props, 'Button Text') ||
                     extractTextFromNode(node) ||
                     'Button';

  // Extract icon configuration
  const showLeftIcon = extractPropValue(props, 'Show Left Icon') === true;
  const showRightIcon = extractPropValue(props, 'Show Right Icon') === true;

  // Extract icon names from children
  let leftIcon = null;
  let rightIcon = null;

  if (node.children) {
    const iconChildren = node.children.filter(c =>
      c.type === 'INSTANCE' && c.name.startsWith('Icon /')
    );

    if (iconChildren.length >= 1 && showLeftIcon) {
      leftIcon = extractIconName(iconChildren[0].name);
    }
    if (iconChildren.length >= 2 && showRightIcon) {
      rightIcon = extractIconName(iconChildren[iconChildren.length - 1].name);
    }
  }

  // Extract variant from styling
  const variant = extractVariantFromStyling(node, buttonText);

  // Extract size from dimensions
  const size = extractSizeFromDimensions(node);

  // Extract state
  const state = extractStateFromVisuals(node);

  return {
    text: buttonText,
    variant,
    size,
    state,
    leftIcon,
    rightIcon,
    showLeftIcon,
    showRightIcon
  };
}

/**
 * Extract footer section
 */
function extractFooterSection(containerNode) {
  const footerNode = findNodeByName(containerNode, 'Footer');
  if (!footerNode) {
    return null;
  }

  // Extract text content
  const text = extractTextFromNode(footerNode);

  // Extract links
  const links = extractLinksFromNode(footerNode);

  return {
    type: 'Footer',
    text,
    links
  };
}

/**
 * Classify component type
 */
function classifyComponent(node) {
  const name = node.name.toLowerCase();

  if (name === 'button' || name.includes('button')) {
    return 'Button';
  }
  if (name.startsWith('icon /')) {
    return 'Icon';
  }

  return 'Unknown';
}

/**
 * Helper: Find node by name in tree
 */
function findNodeByName(node, targetName) {
  if (!node) return null;

  if (node.name === targetName) {
    return node;
  }

  if (node.children) {
    for (const child of node.children) {
      const found = findNodeByName(child, targetName);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Helper: Extract property value
 */
function extractPropValue(props, propName) {
  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith(propName) && value.value !== undefined) {
      return value.value;
    }
  }
  return null;
}

/**
 * Helper: Extract all text from node tree
 */
function extractTextFromNode(node) {
  if (!node) return null;

  if (node.characters) {
    return node.characters;
  }

  if (node.children) {
    for (const child of node.children) {
      const text = extractTextFromNode(child);
      if (text) return text;
    }
  }

  return null;
}

/**
 * Helper: Extract links from node
 */
function extractLinksFromNode(node) {
  const links = [];

  if (!node || !node.children) {
    return links;
  }

  function traverse(n) {
    if (n.characters && (n.name.toLowerCase().includes('link') || n.name.toLowerCase().includes('docs'))) {
      links.push({
        text: n.characters,
        type: 'link'
      });
    }

    if (n.children) {
      for (const child of n.children) {
        traverse(child);
      }
    }
  }

  traverse(node);
  return links;
}

/**
 * Helper: Extract icon name from "Icon / IconName" format
 */
function extractIconName(iconNodeName) {
  const match = iconNodeName.match(/Icon\s*\/\s*(\w+)/);
  if (match) {
    const name = match[1];
    return iconNameToLucide(name);
  }
  return null;
}

/**
 * Helper: Map Figma icon names to lucide-react
 */
function iconNameToLucide(figmaName) {
  const mappings = {
    'Send': 'Send',
    'ArrowRight': 'ArrowRight',
    'LoaderCircle': 'LoaderCircle',
    'Circle': null,
    'Sun': 'Sun',
    'Moon': 'Moon'
  };
  return mappings[figmaName] || figmaName;
}

/**
 * Helper: Extract variant from styling
 */
function extractVariantFromStyling(node, buttonText) {
  const text = (buttonText || '').toLowerCase();

  if (text === 'outline') return 'outline';
  if (text === 'ghost') return 'ghost';
  if (text === 'link') return 'link';
  if (text === 'destructive' || text === 'desctructive') return 'destructive';
  if (text === 'secondary') return 'secondary';

  const fills = node.fills || [];
  const hasBackground = fills.some(f => f.visible !== false && f.opacity > 0.1);
  const strokes = node.strokes || [];
  const hasStroke = strokes.some(s => s.visible !== false);

  if (!hasBackground && hasStroke) return 'outline';
  if (!hasBackground && !hasStroke) return 'ghost';

  return 'default';
}

/**
 * Helper: Extract size from dimensions
 */
function extractSizeFromDimensions(node) {
  const height = node.height || node.size?.y || 0;

  if (height <= 36) return 'sm';
  if (height >= 44) return 'lg';

  const width = node.width || node.size?.x || 0;
  if (Math.abs(width - height) < 5 && width < 50) return 'icon';

  return 'default';
}

/**
 * Helper: Extract state from visuals
 */
function extractStateFromVisuals(node) {
  const name = node.name.toLowerCase();

  if (name.includes('disabled')) return 'disabled';
  if (name.includes('loading')) return 'loading';
  if (node.opacity < 0.6) return 'disabled';

  return 'default';
}
