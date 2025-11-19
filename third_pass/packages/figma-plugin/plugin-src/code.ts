// Zephyr Figma Plugin - Main Code
// Handles JSON export and image extraction from Figma nodes

const JSON_FORMAT_VERSION = "1.0.0";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface ExportedNode {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
  
  // Dimensions
  width: number;
  height: number;
  x: number;
  y: number;
  rotation: number;
  
  // Layout properties
  layoutMode?: string;
  layoutAlign?: string;
  layoutGrow?: number;
  primaryAxisSizingMode?: string;
  counterAxisSizingMode?: string;
  primaryAxisAlignItems?: string;
  counterAxisAlignItems?: string;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
  counterAxisSpacing?: number;
  layoutWrap?: string;
  
  // Style properties
  opacity?: number;
  blendMode?: string;
  fills?: Paint[];
  strokes?: Paint[];
  strokeWeight?: number;
  strokeAlign?: string;
  strokeCap?: string;
  strokeJoin?: string;
  dashPattern?: number[];
  cornerRadius?: number;
  rectangleCornerRadii?: number[];
  
  // Effects
  effects?: Effect[];
  
  // Typography (for text nodes)
  characters?: string;
  fontSize?: number;
  fontName?: FontName;
  fontWeight?: number;
  textAlignHorizontal?: string;
  textAlignVertical?: string;
  textAutoResize?: string;
  textCase?: string;
  textDecoration?: string;
  letterSpacing?: LetterSpacing;
  lineHeight?: LineHeight;
  paragraphIndent?: number;
  paragraphSpacing?: number;
  
  // Component properties
  componentId?: string;
  componentProperties?: Record<string, any>;
  mainComponent?: {
    id: string;
    key: string;
    name: string;
  };
  
  // Constraints
  constraints?: {
    horizontal: string;
    vertical: string;
  };
  
  // Clip and mask
  clipsContent?: boolean;
  isMask?: boolean;
  
  // Children (recursive)
  children?: ExportedNode[];
}

interface JSONExport {
  version: string;
  exportDate: string;
  editDate?: string;
  fileKey: string;
  fileName: string;
  nodeId: string;
  nodeName: string;
  node: ExportedNode;
}

interface PluginMessage {
  type: string;
  data?: any;
  error?: string;
}

// ============================================================================
// NODE EXTRACTION FUNCTIONS
// ============================================================================

function extractPaint(paint: Paint): any {
  const base = {
    type: paint.type,
    visible: paint.visible,
    opacity: paint.opacity,
    blendMode: paint.blendMode,
  };

  if (paint.type === 'SOLID') {
    return {
      ...base,
      color: paint.color,
    };
  } else if (paint.type === 'GRADIENT_LINEAR' || 
             paint.type === 'GRADIENT_RADIAL' || 
             paint.type === 'GRADIENT_ANGULAR' || 
             paint.type === 'GRADIENT_DIAMOND') {
    return {
      ...base,
      gradientStops: paint.gradientStops,
      gradientTransform: paint.gradientTransform,
    };
  } else if (paint.type === 'IMAGE') {
    return {
      ...base,
      scaleMode: paint.scaleMode,
      imageHash: paint.imageHash,
      imageTransform: paint.imageTransform,
      scalingFactor: paint.scalingFactor,
      rotation: paint.rotation,
      filters: paint.filters,
    };
  }

  return base;
}

function extractEffect(effect: Effect): any {
  const base = {
    type: effect.type,
    visible: effect.visible,
    radius: effect.radius,
    blendMode: effect.blendMode,
  };

  if (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') {
    return {
      ...base,
      color: effect.color,
      offset: effect.offset,
      spread: effect.spread,
      showShadowBehindNode: effect.showShadowBehindNode,
    };
  }

  return base;
}

async function extractNode(node: SceneNode): Promise<ExportedNode> {
  const baseNode: ExportedNode = {
    id: node.id,
    name: node.name,
    type: node.type,
    visible: node.visible,
    locked: node.locked,
    width: 'width' in node ? node.width : 0,
    height: 'height' in node ? node.height : 0,
    x: 'x' in node ? node.x : 0,
    y: 'y' in node ? node.y : 0,
    rotation: 'rotation' in node ? node.rotation : 0,
  };

  if ('opacity' in node) {
    baseNode.opacity = node.opacity;
  }
  if ('blendMode' in node) {
    baseNode.blendMode = node.blendMode;
  }

  if ('layoutMode' in node && node.layoutMode !== 'NONE') {
    baseNode.layoutMode = node.layoutMode;
    baseNode.layoutAlign = node.layoutAlign;
    baseNode.layoutGrow = node.layoutGrow;
    baseNode.primaryAxisSizingMode = node.primaryAxisSizingMode;
    baseNode.counterAxisSizingMode = node.counterAxisSizingMode;
    baseNode.primaryAxisAlignItems = node.primaryAxisAlignItems;
    baseNode.counterAxisAlignItems = node.counterAxisAlignItems;
    baseNode.paddingLeft = node.paddingLeft;
    baseNode.paddingRight = node.paddingRight;
    baseNode.paddingTop = node.paddingTop;
    baseNode.paddingBottom = node.paddingBottom;
    baseNode.itemSpacing = node.itemSpacing;
    
    if ('counterAxisSpacing' in node) {
      baseNode.counterAxisSpacing = node.counterAxisSpacing;
    }
    if ('layoutWrap' in node) {
      baseNode.layoutWrap = node.layoutWrap;
    }
  }

  if ('fills' in node && node.fills !== figma.mixed) {
    baseNode.fills = (node.fills as Paint[]).map(extractPaint);
  }
  if ('strokes' in node && node.strokes !== figma.mixed) {
    baseNode.strokes = (node.strokes as Paint[]).map(extractPaint);
  }

  if ('strokeWeight' in node) {
    baseNode.strokeWeight = typeof node.strokeWeight === 'number' ? node.strokeWeight : undefined;
    baseNode.strokeAlign = node.strokeAlign;
  }
  if ('strokeCap' in node) {
    baseNode.strokeCap = node.strokeCap;
  }
  if ('strokeJoin' in node) {
    baseNode.strokeJoin = node.strokeJoin;
  }
  if ('dashPattern' in node) {
    baseNode.dashPattern = node.dashPattern;
  }

  if ('cornerRadius' in node) {
    baseNode.cornerRadius = typeof node.cornerRadius === 'number' ? node.cornerRadius : undefined;
  }
  if ('rectangleCornerRadii' in node) {
    baseNode.rectangleCornerRadii = node.rectangleCornerRadii;
  }

  if ('effects' in node && node.effects !== figma.mixed) {
    baseNode.effects = (node.effects as Effect[]).map(extractEffect);
  }

  if (node.type === 'TEXT') {
    baseNode.characters = node.characters;
    baseNode.fontSize = typeof node.fontSize === 'number' ? node.fontSize : undefined;
    baseNode.fontName = node.fontName !== figma.mixed ? node.fontName : undefined;
    baseNode.fontWeight = typeof node.fontWeight === 'number' ? node.fontWeight : undefined;
    baseNode.textAlignHorizontal = node.textAlignHorizontal;
    baseNode.textAlignVertical = node.textAlignVertical;
    baseNode.textAutoResize = node.textAutoResize;
    baseNode.textCase = node.textCase !== figma.mixed ? node.textCase : undefined;
    baseNode.textDecoration = node.textDecoration !== figma.mixed ? node.textDecoration : undefined;
    baseNode.letterSpacing = node.letterSpacing !== figma.mixed ? node.letterSpacing : undefined;
    baseNode.lineHeight = node.lineHeight !== figma.mixed ? node.lineHeight : undefined;
    baseNode.paragraphIndent = typeof node.paragraphIndent === 'number' ? node.paragraphIndent : undefined;
    baseNode.paragraphSpacing = typeof node.paragraphSpacing === 'number' ? node.paragraphSpacing : undefined;
  }

  if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
    baseNode.componentId = 'id' in node ? node.id : undefined;
  }
  
  if (node.type === 'INSTANCE') {
    const mainComponent = await node.getMainComponentAsync();
    if (mainComponent) {
      baseNode.mainComponent = {
        id: mainComponent.id,
        key: mainComponent.key,
        name: mainComponent.name,
      };
    }
  }

  if ('componentProperties' in node) {
    baseNode.componentProperties = node.componentProperties;
  }

  if ('constraints' in node) {
    baseNode.constraints = {
      horizontal: node.constraints.horizontal,
      vertical: node.constraints.vertical,
    };
  }

  if ('clipsContent' in node) {
    baseNode.clipsContent = node.clipsContent;
  }
  if ('isMask' in node) {
    baseNode.isMask = node.isMask;
  }

  if ('children' in node) {
    baseNode.children = await Promise.all(node.children.map(child => extractNode(child)));
  }

  return baseNode;
}

async function generateJSONExport(node: SceneNode): Promise<JSONExport> {
  const exportDate = new Date().toISOString();
  const fileKey = figma.fileKey || 'unknown';
  const fileName = figma.root.name;
  const extractedNode = await extractNode(node);
  
  return {
    version: JSON_FORMAT_VERSION,
    exportDate,
    fileKey,
    fileName,
    nodeId: node.id,
    nodeName: node.name,
    node: extractedNode,
  };
}

async function exportAsImages(node: SceneNode, settings: any) {
  const formats: Array<'PNG' | 'SVG' | 'JPG'> = [];
  if (settings.png) formats.push('PNG');
  if (settings.svg) formats.push('SVG');
  if (settings.jpg) formats.push('JPG');
  
  const scale = settings.scale || 1;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const cleanName = node.name.replace(/[^a-zA-Z0-9-_]/g, '_');
  const basename = cleanName + '_' + node.id + '_' + timestamp;
  
  const exports: Array<{ format: string; data: Uint8Array; filename: string }> = [];
  
  for (const format of formats) {
    try {
      const data = await node.exportAsync({
        format,
        constraint: { type: 'SCALE', value: scale },
      });
      
      const extension = format.toLowerCase();
      const filename = basename + '.' + extension;
      
      exports.push({ format, data, filename });
    } catch (error) {
      console.error('Failed to export ' + format + ':', error);
    }
  }
  
  return {
    exports,
    metadata: {
      nodeId: node.id,
      nodeName: node.name,
      fileKey: figma.fileKey || 'unknown',
      fileName: figma.root.name,
      timestamp,
      scale,
    },
  };
}

// ============================================================================
// PLUGIN INITIALIZATION
// ============================================================================

figma.showUI(__html__, { themeColors: true, width: 400, height: 500 });

figma.on('selectionchange', () => {
  const selection = figma.currentPage.selection;
  figma.ui.postMessage({
    type: 'selection-changed',
    data: {
      count: selection.length,
      nodes: selection.map(node => ({
        id: node.id,
        name: node.name,
        type: node.type,
      })),
    },
  });
});

figma.ui.onmessage = async (msg: PluginMessage) => {
  try {
    if (msg.type === 'generate-json') {
      const selection = figma.currentPage.selection;
      
      if (selection.length === 0) {
        figma.ui.postMessage({
          type: 'error',
          error: 'Please select a node to export',
        });
        return;
      }
      
      if (selection.length > 1) {
        figma.ui.postMessage({
          type: 'error',
          error: 'Please select only one node to export',
        });
        return;
      }
      
      const node = selection[0];
      figma.ui.postMessage({
        type: 'progress',
        data: { message: 'Extracting node data...' },
      });
      
      const startTime = Date.now();
      const jsonExport = await generateJSONExport(node);
      const duration = Date.now() - startTime;
      
      figma.ui.postMessage({
        type: 'json-export-complete',
        data: { json: jsonExport, duration },
      });
      
    } else if (msg.type === 'export-images') {
      const selection = figma.currentPage.selection;
      
      if (selection.length === 0) {
        figma.ui.postMessage({
          type: 'error',
          error: 'Please select a node to export',
        });
        return;
      }
      
      if (selection.length > 1) {
        figma.ui.postMessage({
          type: 'error',
          error: 'Please select only one node to export',
        });
        return;
      }
      
      const node = selection[0];
      figma.ui.postMessage({
        type: 'progress',
        data: { message: 'Exporting images...' },
      });
      
      const result = await exportAsImages(node, msg.data);
      
      figma.ui.postMessage({
        type: 'images-export-complete',
        data: result,
      });
      
    } else if (msg.type === 'close-plugin') {
      figma.closePlugin();
    }
    
  } catch (error) {
    console.error('Plugin error:', error);
    figma.ui.postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
};

const initialSelection = figma.currentPage.selection;
figma.ui.postMessage({
  type: 'selection-changed',
  data: {
    count: initialSelection.length,
    nodes: initialSelection.map(node => ({
      id: node.id,
      name: node.name,
      type: node.type,
    })),
  },
});
