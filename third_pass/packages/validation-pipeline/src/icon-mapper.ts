/**
 * Icon Mapper
 *
 * Detects icon nodes in Figma data and maps them to Lucide React icons.
 * Addresses task-55: Fix icon mapping and rendering in generated components.
 */

import { FigmaNode } from './enhanced-figma-parser.js';

export interface IconMatch {
  isIcon: boolean;
  lucideIcon?: string;
  iconName?: string;
  confidence: number;
  reason: string[];
}

/**
 * Icon name mapping table: Figma patterns → Lucide React icon names
 * Covers common design system icons
 */
const ICON_NAME_MAPPINGS: Record<string, string> = {
  // Document/File icons
  'file': 'File',
  'folder': 'Folder',
  'folderopen': 'FolderOpen',
  'document': 'FileText',
  'doc': 'FileText',
  'page': 'FileText',

  // Navigation icons
  'arrow': 'ArrowRight',
  'arrowleft': 'ArrowLeft',
  'arrowright': 'ArrowRight',
  'arrowup': 'ArrowUp',
  'arrowdown': 'ArrowDown',
  'chevron': 'ChevronRight',
  'chevronleft': 'ChevronLeft',
  'chevronright': 'ChevronRight',
  'chevronup': 'ChevronUp',
  'chevrondown': 'ChevronDown',

  // Link/External icons
  'link': 'Link',
  'external': 'ExternalLink',
  'externallink': 'ExternalLink',
  'docs': 'FileText',
  'documentation': 'FileText',

  // UI icons
  'close': 'X',
  'x': 'X',
  'check': 'Check',
  'checkmark': 'Check',
  'plus': 'Plus',
  'minus': 'Minus',
  'search': 'Search',
  'filter': 'Filter',
  'menu': 'Menu',
  'hamburger': 'Menu',
  'settings': 'Settings',
  'gear': 'Settings',
  'user': 'User',
  'profile': 'User',
  'home': 'Home',
  'heart': 'Heart',
  'star': 'Star',
  'bell': 'Bell',
  'notification': 'Bell',

  // Media icons
  'play': 'Play',
  'pause': 'Pause',
  'stop': 'Square',
  'image': 'Image',
  'picture': 'Image',
  'video': 'Video',
  'camera': 'Camera',

  // Action icons
  'edit': 'Edit',
  'pencil': 'Pencil',
  'trash': 'Trash',
  'delete': 'Trash',
  'download': 'Download',
  'upload': 'Upload',
  'copy': 'Copy',
  'share': 'Share',

  // Status icons
  'info': 'Info',
  'warning': 'AlertTriangle',
  'alert': 'AlertCircle',
  'error': 'AlertCircle',
  'help': 'HelpCircle',
  'question': 'HelpCircle',

  // Developer icons
  'code': 'Code',
  'terminal': 'Terminal',
  'git': 'GitBranch',
  'github': 'Github',
  'developer': 'Code',
  'design': 'Figma',
  'designer': 'Figma',
};

/**
 * Common icon size thresholds (in pixels)
 */
const ICON_SIZE_MIN = 12;
const ICON_SIZE_MAX = 64;

/**
 * Detect if a Figma node represents an icon
 */
export function detectIcon(node: FigmaNode): IconMatch {
  const reasons: string[] = [];
  let confidence = 0;

  // Check name patterns
  const name = node.name?.toLowerCase() || '';

  // Strong indicators (each adds significant confidence)
  if (name.includes('icon')) {
    reasons.push('Name contains "icon"');
    confidence += 0.4;
  }

  if (name.startsWith('icon /') || name.startsWith('icon/')) {
    reasons.push('Name starts with "Icon /"');
    confidence += 0.3;
  }

  if (name.includes('link') && (name.includes('docs') || name.includes('external'))) {
    reasons.push('Name suggests link/docs icon');
    confidence += 0.3;
  }

  // Check node type
  if (node.type === 'INSTANCE' || node.type === 'COMPONENT') {
    reasons.push('Is component instance');
    confidence += 0.2;
  }

  if (node.type === 'VECTOR') {
    reasons.push('Is vector graphic');
    confidence += 0.15;
  }

  // Check children for VECTOR nodes (common in icon components)
  if (node.children && node.children.length > 0) {
    const hasVectorChild = node.children.some(c => c.type === 'VECTOR');
    if (hasVectorChild) {
      reasons.push('Contains vector children');
      confidence += 0.15;
    }
  }

  // Check size constraints
  if (node.size) {
    const width = node.size.x;
    const height = node.size.y;

    // Square icons are very common
    if (width === height && width >= ICON_SIZE_MIN && width <= ICON_SIZE_MAX) {
      reasons.push(`Square icon size (${width}×${height}px)`);
      confidence += 0.2;
    }
    // Allow slight variation
    else if (
      width >= ICON_SIZE_MIN && width <= ICON_SIZE_MAX &&
      height >= ICON_SIZE_MIN && height <= ICON_SIZE_MAX &&
      Math.abs(width - height) <= 4
    ) {
      reasons.push(`Icon-sized (${width}×${height}px)`);
      confidence += 0.15;
    }
  }

  // Cap confidence at 1.0
  confidence = Math.min(confidence, 1.0);

  // Consider it an icon if confidence >= 0.6
  const isIcon = confidence >= 0.6;

  let lucideIcon: string | undefined;
  let iconName: string | undefined;

  if (isIcon) {
    const match = mapToLucideIcon(name);
    if (match) {
      lucideIcon = match.lucideIcon;
      iconName = match.iconName;
      reasons.push(`Mapped to Lucide icon: ${lucideIcon}`);
    } else {
      reasons.push('No Lucide mapping found, using default');
      lucideIcon = 'FileText'; // Default fallback
      iconName = 'unknown';
    }
  }

  return {
    isIcon,
    lucideIcon,
    iconName,
    confidence,
    reason: reasons,
  };
}

/**
 * Map a Figma icon name to a Lucide React icon
 */
export function mapToLucideIcon(figmaName: string): { lucideIcon: string; iconName: string } | null {
  const normalized = figmaName.toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Remove special characters
    .trim();

  // Direct lookup
  if (ICON_NAME_MAPPINGS[normalized]) {
    return {
      lucideIcon: ICON_NAME_MAPPINGS[normalized],
      iconName: normalized,
    };
  }

  // Fuzzy matching - check if any mapping key is contained in the name
  for (const [key, lucideIcon] of Object.entries(ICON_NAME_MAPPINGS)) {
    if (normalized.includes(key)) {
      return {
        lucideIcon,
        iconName: key,
      };
    }
  }

  // Check reverse - if name is contained in any key
  for (const [key, lucideIcon] of Object.entries(ICON_NAME_MAPPINGS)) {
    if (key.includes(normalized)) {
      return {
        lucideIcon,
        iconName: key,
      };
    }
  }

  return null;
}

/**
 * Extract all icons from a Figma node tree
 */
export function extractIcons(node: FigmaNode): Array<{ path: string; node: FigmaNode; icon: IconMatch }> {
  const icons: Array<{ path: string; node: FigmaNode; icon: IconMatch }> = [];

  function traverse(n: FigmaNode, path: string = '') {
    const currentPath = path ? `${path} > ${n.name}` : n.name;

    const iconMatch = detectIcon(n);
    if (iconMatch.isIcon) {
      icons.push({
        path: currentPath,
        node: n,
        icon: iconMatch,
      });
    }

    // Recurse into children
    if (n.children) {
      for (const child of n.children) {
        traverse(child, currentPath);
      }
    }
  }

  traverse(node);
  return icons;
}

/**
 * Generate import statement for Lucide icons used in a component
 */
export function generateLucideImports(icons: IconMatch[]): string {
  const uniqueIcons = new Set(
    icons
      .filter(i => i.lucideIcon)
      .map(i => i.lucideIcon!)
  );

  if (uniqueIcons.size === 0) {
    return '';
  }

  const iconList = Array.from(uniqueIcons).sort().join(', ');
  return `import { ${iconList} } from 'lucide-react';`;
}

/**
 * Generate JSX for rendering an icon
 */
export function generateIconJSX(iconMatch: IconMatch, props: {
  className?: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
} = {}): string {
  if (!iconMatch.isIcon || !iconMatch.lucideIcon) {
    return `<div className="${props.className || 'w-4 h-4'}" />`;
  }

  const attributes: string[] = [];

  if (props.className) {
    attributes.push(`className="${props.className}"`);
  }

  if (props.size) {
    attributes.push(`size={${props.size}}`);
  }

  if (props.color) {
    attributes.push(`color="${props.color}"`);
  }

  if (props.strokeWidth) {
    attributes.push(`strokeWidth={${props.strokeWidth}}`);
  }

  const attrsString = attributes.length > 0 ? ' ' + attributes.join(' ') : '';
  return `<${iconMatch.lucideIcon}${attrsString} />`;
}
