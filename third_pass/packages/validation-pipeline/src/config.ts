/**
 * Configuration loader and validator
 */

import { config as loadEnv } from 'dotenv';
import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { PipelineConfig } from './types.js';

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: PipelineConfig = {
  // API Keys (must be provided)
  openRouterApiKey: '',
  figmaToken: '',

  // Model Configuration
  codeGenerationModel: 'anthropic/claude-sonnet-4.5',
  embeddingModel: 'openai/text-embedding-3-small',
  visionModel: 'openai/gpt-4o',

  // Database
  databasePath: './validation.db',

  // Output
  outputDir: './output',
  createSubdirectories: true,

  // Pipeline features
  enableCaching: true,
  enableVisualValidation: false, // Disabled by default (costs money)
  enableSemanticMatching: true,

  // Performance
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 60000, // 60 seconds

  // Logging
  logLevel: 'info',
  logFile: undefined,
};

/**
 * Load configuration from multiple sources:
 * 1. Default values
 * 2. Config file (if provided)
 * 3. Environment variables
 * 4. CLI overrides (if provided)
 */
export function loadConfig(options: {
  configFile?: string;
  envFile?: string;
  overrides?: Partial<PipelineConfig>;
} = {}): PipelineConfig {
  // Start with defaults
  const config: PipelineConfig = { ...DEFAULT_CONFIG };

  // Load environment variables
  if (options.envFile) {
    loadEnv({ path: resolve(options.envFile) });
  } else {
    // Try to load from common locations
    const envPaths = [
      '.env',
      '../.env',
      '../../.env',
      '../../../.env',
    ];
    for (const envPath of envPaths) {
      if (existsSync(envPath)) {
        loadEnv({ path: resolve(envPath) });
        break;
      }
    }
  }

  // Load from config file if provided
  if (options.configFile) {
    const configPath = resolve(options.configFile);
    if (existsSync(configPath)) {
      try {
        const fileConfig = JSON.parse(readFileSync(configPath, 'utf-8'));
        Object.assign(config, fileConfig);
      } catch (error) {
        throw new Error(`Failed to load config file ${configPath}: ${error}`);
      }
    } else {
      throw new Error(`Config file not found: ${configPath}`);
    }
  }

  // Override from environment variables
  if (process.env.OPENROUTER) {
    config.openRouterApiKey = process.env.OPENROUTER;
  }
  if (process.env.FIGMA_TOKEN) {
    config.figmaToken = process.env.FIGMA_TOKEN;
  }
  if (process.env.CODE_GENERATION_MODEL) {
    config.codeGenerationModel = process.env.CODE_GENERATION_MODEL;
  }
  if (process.env.DATABASE_PATH) {
    config.databasePath = process.env.DATABASE_PATH;
  }
  if (process.env.OUTPUT_DIR) {
    config.outputDir = process.env.OUTPUT_DIR;
  }
  if (process.env.LOG_LEVEL) {
    config.logLevel = process.env.LOG_LEVEL as PipelineConfig['logLevel'];
  }
  if (process.env.ENABLE_VISUAL_VALIDATION) {
    config.enableVisualValidation = process.env.ENABLE_VISUAL_VALIDATION === 'true';
  }

  // Apply CLI overrides
  if (options.overrides) {
    Object.assign(config, options.overrides);
  }

  // Validate required fields
  validateConfig(config);

  return config;
}

/**
 * Validate configuration
 */
export function validateConfig(config: PipelineConfig): void {
  const errors: string[] = [];

  if (!config.openRouterApiKey) {
    errors.push('OpenRouter API key is required (set OPENROUTER env var or provide in config)');
  }

  if (!config.codeGenerationModel) {
    errors.push('Code generation model is required');
  }

  if (!config.outputDir) {
    errors.push('Output directory is required');
  }

  if (config.maxRetries < 0) {
    errors.push('maxRetries must be >= 0');
  }

  if (config.retryDelay < 0) {
    errors.push('retryDelay must be >= 0');
  }

  if (config.timeout <= 0) {
    errors.push('timeout must be > 0');
  }

  if (!['debug', 'info', 'warn', 'error'].includes(config.logLevel)) {
    errors.push('logLevel must be one of: debug, info, warn, error');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}`);
  }
}

/**
 * Create example config file content
 */
export function generateExampleConfig(): string {
  const example: Partial<PipelineConfig> = {
    codeGenerationModel: 'anthropic/claude-sonnet-4.5',
    embeddingModel: 'openai/text-embedding-3-small',
    visionModel: 'openai/gpt-4o',
    databasePath: './validation.db',
    outputDir: './output',
    createSubdirectories: true,
    enableCaching: true,
    enableVisualValidation: false,
    enableSemanticMatching: true,
    maxRetries: 3,
    retryDelay: 1000,
    timeout: 60000,
    logLevel: 'info',
  };

  return JSON.stringify(example, null, 2);
}
