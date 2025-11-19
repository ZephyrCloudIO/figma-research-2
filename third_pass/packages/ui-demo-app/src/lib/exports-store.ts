/**
 * Exports Store - Manages Figma exports and generated components
 */

export interface FigmaExport {
  id: string;
  name: string;
  nodeId: string;
  exportDate: string;
  figmaImagePath: string;
  figmaSvgPath?: string;
  figmaJsonPath?: string;
  generatedComponentPath?: string;
  metadata?: {
    width: number;
    height: number;
    fileKey?: string;
    fileName?: string;
    generationCost?: number;
    generationTokens?: number;
    generationModel?: string;
  };
  validation?: {
    status: 'pending' | 'validating' | 'passed' | 'failed';
    similarity?: number;
    diffImagePath?: string;
  };
}

export interface ExportsManifest {
  generated: string;
  count: number;
  exports: FigmaExport[];
}

let cachedManifest: ExportsManifest | null = null;

/**
 * Load exports from the generated manifest
 */
export async function loadExports(): Promise<FigmaExport[]> {
  if (cachedManifest) {
    return cachedManifest.exports;
  }

  try {
    const response = await fetch('/exports-manifest.json');
    if (!response.ok) {
      console.error('Failed to load exports manifest:', response.statusText);
      return [];
    }

    cachedManifest = await response.json();
    return cachedManifest.exports;
  } catch (error) {
    console.error('Error loading exports manifest:', error);
    return [];
  }
}

/**
 * Load the full Figma JSON export data
 */
export async function loadFigmaJson(jsonPath: string): Promise<any> {
  try {
    const response = await fetch(jsonPath);
    if (!response.ok) {
      throw new Error(`Failed to load JSON: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading Figma JSON:', error);
    return null;
  }
}

/**
 * Refresh exports by reloading the manifest
 */
export function refreshExports(): void {
  cachedManifest = null;
}
