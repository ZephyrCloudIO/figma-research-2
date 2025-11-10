/**
 * List all components from Zephyr Cloud ShadCN Design System using Figma API
 */

import { config } from 'dotenv';
import { writeFileSync } from 'fs';

config({ path: '../.env' });

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
const FILE_KEY = 'MMMjqwWNYZAg0YlIeL9aJZ';  // Zephyr Cloud ShadCN Design System

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  componentSetId?: string;
  componentPropertyDefinitions?: any;
  [key: string]: any;
}

interface ComponentInfo {
  id: string;
  name: string;
  type: string;
  pageName: string;
  isComponentSet: boolean;
  variantCount?: number;
  variants?: string[];
}

async function fetchFigmaFile() {
  console.log('Fetching Figma file components...\n');

  const response = await fetch(`https://api.figma.com/v1/files/${FILE_KEY}`, {
    headers: {
      'X-Figma-Token': FIGMA_TOKEN!
    }
  });

  if (!response.ok) {
    throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log(`✓ Fetched file: ${data.name}`);
  console.log(`  Last modified: ${data.lastModified}\n`);

  return data;
}

function extractComponents(node: FigmaNode, pageName: string, components: ComponentInfo[] = []): ComponentInfo[] {
  // Check if this is a component or component set
  if (node.type === 'COMPONENT_SET') {
    // This is a component with variants
    const variants: string[] = [];
    let variantCount = 0;

    if (node.children) {
      variantCount = node.children.length;
      node.children.forEach(child => {
        if (child.name) {
          variants.push(child.name);
        }
      });
    }

    components.push({
      id: node.id,
      name: node.name,
      type: 'COMPONENT_SET',
      pageName,
      isComponentSet: true,
      variantCount,
      variants: variants.slice(0, 5) // Only store first 5 for brevity
    });
  } else if (node.type === 'COMPONENT') {
    // This is a standalone component (not part of a set)
    components.push({
      id: node.id,
      name: node.name,
      type: 'COMPONENT',
      pageName,
      isComponentSet: false
    });
  }

  // Recursively search children
  if (node.children) {
    for (const child of node.children) {
      extractComponents(child, pageName, components);
    }
  }

  return components;
}

function categorizeComponents(components: ComponentInfo[]) {
  const categories: Record<string, ComponentInfo[]> = {
    'Form Controls': [],
    'Data Display': [],
    'Feedback': [],
    'Navigation': [],
    'Layout': [],
    'Typography': [],
    'Media': [],
    'Icons': [],
    'Other': []
  };

  const formControlKeywords = ['button', 'input', 'select', 'checkbox', 'radio', 'switch', 'slider', 'textarea', 'toggle', 'form'];
  const dataDisplayKeywords = ['card', 'table', 'list', 'avatar', 'badge', 'chip', 'tooltip', 'skeleton', 'progress'];
  const feedbackKeywords = ['alert', 'dialog', 'modal', 'toast', 'notification', 'snackbar', 'banner'];
  const navigationKeywords = ['menu', 'nav', 'breadcrumb', 'tabs', 'pagination', 'stepper', 'drawer', 'sidebar'];
  const layoutKeywords = ['container', 'grid', 'stack', 'divider', 'separator', 'spacer', 'box'];
  const typographyKeywords = ['text', 'heading', 'title', 'paragraph', 'label', 'caption'];
  const mediaKeywords = ['image', 'icon', 'video', 'audio'];

  for (const component of components) {
    const nameLower = component.name.toLowerCase();

    if (nameLower.includes('icon') || nameLower.includes('social')) {
      categories['Icons'].push(component);
    } else if (formControlKeywords.some(kw => nameLower.includes(kw))) {
      categories['Form Controls'].push(component);
    } else if (dataDisplayKeywords.some(kw => nameLower.includes(kw))) {
      categories['Data Display'].push(component);
    } else if (feedbackKeywords.some(kw => nameLower.includes(kw))) {
      categories['Feedback'].push(component);
    } else if (navigationKeywords.some(kw => nameLower.includes(kw))) {
      categories['Navigation'].push(component);
    } else if (layoutKeywords.some(kw => nameLower.includes(kw))) {
      categories['Layout'].push(component);
    } else if (typographyKeywords.some(kw => nameLower.includes(kw))) {
      categories['Typography'].push(component);
    } else if (mediaKeywords.some(kw => nameLower.includes(kw))) {
      categories['Media'].push(component);
    } else {
      categories['Other'].push(component);
    }
  }

  return categories;
}

async function listAllComponents() {
  const data = await fetchFigmaFile();

  const allComponents: ComponentInfo[] = [];

  // Extract from all pages
  if (data.document && data.document.children) {
    for (const page of data.document.children) {
      const pageComponents = extractComponents(page, page.name || 'Unknown');
      allComponents.push(...pageComponents);
      console.log(`Page: "${page.name}" - ${pageComponents.length} components`);
    }
  }

  console.log(`\n✓ Total components found: ${allComponents.length}\n`);

  // Categorize
  const categorized = categorizeComponents(allComponents);

  // Print summary by category
  console.log('================================================================================');
  console.log('COMPONENT SUMMARY BY CATEGORY');
  console.log('================================================================================\n');

  for (const [category, components] of Object.entries(categorized)) {
    if (components.length === 0) continue;

    console.log(`\n${category} (${components.length}):`);
    console.log('─'.repeat(80));

    for (const comp of components) {
      const typeLabel = comp.isComponentSet ? `[SET: ${comp.variantCount} variants]` : '[SINGLE]';
      console.log(`  ${typeLabel.padEnd(20)} ${comp.name}`);

      if (comp.variants && comp.variants.length > 0) {
        console.log(`${''.padEnd(22)}↳ ${comp.variants.join(', ')}${comp.variantCount! > 5 ? ` ...and ${comp.variantCount! - 5} more` : ''}`);
      }
    }
  }

  // Save detailed data
  const outputPath = '/Users/zackarychapple/code/figma-research-clean/validation/figma-components-list.json';
  writeFileSync(outputPath, JSON.stringify({
    totalComponents: allComponents.length,
    categorized,
    allComponents
  }, null, 2));

  console.log(`\n\n✅ Saved detailed list to: figma-components-list.json`);

  // Generate implementation checklist
  console.log('\n\n================================================================================');
  console.log('IMPLEMENTATION STATUS');
  console.log('================================================================================\n');

  const implemented = ['Button', 'Badge', 'Card', 'Input', 'Dialog'];
  const inSystem = ['Select', 'Checkbox', 'Radio', 'Switch', 'Avatar', 'Icon'];

  console.log('✅ Implemented & Tested (5):');
  implemented.forEach(name => console.log(`   - ${name}`));

  console.log('\n⚠️  In System (Not Tested) (6):');
  inSystem.forEach(name => console.log(`   - ${name}`));

  const notImplemented = allComponents
    .filter(c => !c.name.toLowerCase().includes('icon'))
    .filter(c => !implemented.some(impl => c.name.toLowerCase().includes(impl.toLowerCase())))
    .filter(c => !inSystem.some(impl => c.name.toLowerCase().includes(impl.toLowerCase())));

  console.log(`\n❌ Not Implemented (${notImplemented.length}):`);
  notImplemented.slice(0, 20).forEach(comp => {
    console.log(`   - ${comp.name} (${comp.isComponentSet ? `${comp.variantCount} variants` : 'single'})`);
  });
  if (notImplemented.length > 20) {
    console.log(`   ... and ${notImplemented.length - 20} more`);
  }

  return { allComponents, categorized };
}

listAllComponents().catch(console.error);
