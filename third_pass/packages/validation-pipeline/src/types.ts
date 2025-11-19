/**
 * Core type definitions for the validation pipeline
 */

export interface PipelineConfig {
  // API Configuration
  openRouterApiKey: string;
  figmaToken?: string;

  // Model Configuration
  codeGenerationModel: string; // e.g., "anthropic/claude-sonnet-4.5"
  embeddingModel: string; // e.g., "openai/text-embedding-3-small"
  visionModel: string; // e.g., "openai/gpt-4o"

  // Database Configuration
  databasePath: string;

  // Output Configuration
  outputDir: string;
  createSubdirectories: boolean; // Create component-specific subdirectories

  // Pipeline Configuration
  enableCaching: boolean;
  enableVisualValidation: boolean;
  enableSemanticMatching: boolean;

  // Performance Configuration
  maxRetries: number;
  retryDelay: number; // milliseconds
  timeout: number; // milliseconds

  // Logging Configuration
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  logFile?: string;
}

export interface ComponentInput {
  // Core Figma data
  id: string;
  name: string;
  type: string;

  // Component properties (from plugin export)
  properties?: Record<string, any>;

  // Metadata from plugin
  metadata?: {
    version?: string;
    lastModified?: string;
    author?: string;
    description?: string;
    tags?: string[];
  };

  // Raw Figma node data
  figmaNode: any;
}

export interface PipelineStage {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startTime?: number;
  endTime?: number;
  error?: string;
  result?: any;
}

export interface PipelineResult {
  success: boolean;
  componentId: string;
  componentName: string;

  // Stages
  stages: Record<string, PipelineStage>;

  // Output files
  outputs: {
    componentCode?: string;
    componentPath?: string;
    metadataPath?: string;
    validationReportPath?: string;
  };

  // Timing
  totalDuration: number;

  // Errors
  errors: string[];
  warnings: string[];

  // Metadata
  generatedAt: string;
  pipelineVersion: string;
}

export interface BatchPipelineResult {
  totalComponents: number;
  successCount: number;
  failureCount: number;
  results: PipelineResult[];
  totalDuration: number;
  startedAt: string;
  completedAt: string;
}

export interface ValidationReport {
  componentId: string;
  componentName: string;

  // Visual validation
  visualValidation?: {
    pixelScore: number;
    semanticScore: number;
    finalScore: number;
    recommendation: 'PASS' | 'NEEDS_REVIEW' | 'FAIL';
    differences: string[];
    suggestions: string[];
  };

  // Code quality
  codeQuality: {
    hasTypeScript: boolean;
    hasReact: boolean;
    hasTailwind: boolean;
    hasProps: boolean;
    hasAccessibility: boolean;
    formatted: boolean;
  };

  // Semantic mapping
  semanticMapping: {
    componentType: string;
    shadcnComponent: string;
    confidence: number;
    warnings: string[];
  };

  timestamp: string;
}

export interface ComponentMetadata {
  componentId: string;
  componentName: string;
  figmaNodeId: string;

  // Generation info
  generatedWith: {
    model: string;
    pipelineVersion: string;
    timestamp: string;
  };

  // Classification
  classification: {
    componentType: string;
    shadcnComponent: string;
    confidence: number;
  };

  // Code info
  codeInfo: {
    language: string;
    framework: string;
    library: string;
    dependencies: string[];
  };

  // Validation
  validation: {
    status: 'pass' | 'warning' | 'fail';
    score: number;
    issues: string[];
  };
}

export interface ProgressUpdate {
  stage: string;
  progress: number; // 0-100
  message: string;
  timestamp: number;
}

export type ProgressCallback = (update: ProgressUpdate) => void;

export interface ErrorContext {
  stage: string;
  component: string;
  error: Error;
  attemptNumber: number;
  maxAttempts: number;
}

export type ErrorHandler = (context: ErrorContext) => 'retry' | 'skip' | 'abort';
