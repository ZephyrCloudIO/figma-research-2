/**
 * Validation Pipeline - Main exports
 */

export { PipelineOrchestrator } from './orchestrator.js';
export { loadConfig, validateConfig, generateExampleConfig, DEFAULT_CONFIG } from './config.js';
export { initLogger, getLogger, Logger } from './logger.js';
export type {
  PipelineConfig,
  ComponentInput,
  PipelineResult,
  PipelineStage,
  BatchPipelineResult,
  ValidationReport,
  ComponentMetadata,
  ProgressCallback,
  ErrorHandler,
  ProgressUpdate,
  ErrorContext,
} from './types.js';

// Re-export useful types from validation modules
export type { ComponentType, FigmaNode } from './enhanced-figma-parser.js';
export type { SemanticMappingResult, ShadCNComponentSchema } from './semantic-mapper.js';
export type { ComponentMatchResult } from './component-matcher.js';
export { FigmaDatabase } from './database.js';
