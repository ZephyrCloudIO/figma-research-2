#!/usr/bin/env node

/**
 * CLI for Figma-to-Code Validation Pipeline
 */

import { Command } from 'commander';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { loadConfig } from './config.js';
import { initLogger } from './logger.js';
import { PipelineOrchestrator } from './orchestrator.js';
import { ComponentInput } from './types.js';

const program = new Command();

program
  .name('figma-generate')
  .description('Generate React/ShadCN code from Figma plugin JSON exports')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate code from a Figma JSON export')
  .requiredOption('-i, --input <path>', 'Path to Figma JSON export file')
  .option('-o, --output <path>', 'Output directory (default: ./output)')
  .option('-c, --config <path>', 'Path to config file')
  .option('--env <path>', 'Path to .env file')
  .option('--log-level <level>', 'Log level (debug|info|warn|error)', 'info')
  .option('--log-file <path>', 'Write logs to file')
  .option('--no-cache', 'Disable caching')
  .option('--no-subdirs', 'Do not create subdirectories for components')
  .option('--enable-visual', 'Enable visual validation (costs money!)')
  .action(async (options) => {
    try {
      // Load configuration
      const config = loadConfig({
        configFile: options.config,
        envFile: options.env,
        overrides: {
          outputDir: options.output || './output',
          logLevel: options.logLevel,
          logFile: options.logFile,
          enableCaching: options.cache,
          createSubdirectories: options.subdirs,
          enableVisualValidation: options.enableVisual,
        },
      });

      // Initialize logger
      const logger = initLogger(config.logLevel, config.logFile);

      logger.section('Figma-to-Code Validation Pipeline');
      logger.info(`Input file: ${options.input}`);
      logger.info(`Output directory: ${config.outputDir}`);
      logger.info(`Log level: ${config.logLevel}`);

      // Check input file exists
      const inputPath = resolve(options.input);
      if (!existsSync(inputPath)) {
        logger.error(`Input file not found: ${inputPath}`);
        process.exit(1);
      }

      // Load input JSON
      logger.info('Loading input JSON...');
      const inputData = JSON.parse(readFileSync(inputPath, 'utf-8'));

      // Convert to ComponentInput format
      const components = parseInputJson(inputData);
      logger.success(`Loaded ${components.length} component(s)`);

      // Initialize pipeline
      const orchestrator = new PipelineOrchestrator(config);
      await orchestrator.initialize();

      // Process components
      const results = await orchestrator.processBatch(components, {
        progressCallback: (update) => {
          logger.progress(update.message, update.progress, 100);
        },
      });

      // Cleanup
      await orchestrator.cleanup();

      // Summary
      logger.section('Generation Complete');
      logger.info(`Total components: ${results.totalComponents}`);
      logger.success(`Successful: ${results.successCount}`);
      if (results.failureCount > 0) {
        logger.failure(`Failed: ${results.failureCount}`);
      }
      logger.info(`Total duration: ${results.totalDuration}ms`);
      logger.info(`Output directory: ${config.outputDir}`);

      process.exit(results.failureCount > 0 ? 1 : 0);
    } catch (error: any) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program
  .command('init')
  .description('Initialize configuration files')
  .option('--config <path>', 'Path to create config file', './pipeline.config.json')
  .option('--env <path>', 'Path to create .env file', './.env')
  .action((options) => {
    const { writeFileSync } = require('fs');
    const { generateExampleConfig } = require('./config.js');

    // Create config file
    const configPath = resolve(options.config);
    writeFileSync(configPath, generateExampleConfig(), 'utf-8');
    console.log(`Created config file: ${configPath}`);

    // Create .env file
    const envPath = resolve(options.env);
    const envContent = `# OpenRouter API Key (required)
OPENROUTER=your-api-key-here

# Figma Token (optional, for API access)
FIGMA_TOKEN=your-figma-token-here

# Model Configuration (optional, defaults shown)
# CODE_GENERATION_MODEL=anthropic/claude-sonnet-4.5
# DATABASE_PATH=./validation.db
# OUTPUT_DIR=./output
# LOG_LEVEL=info
# ENABLE_VISUAL_VALIDATION=false
`;
    writeFileSync(envPath, envContent, 'utf-8');
    console.log(`Created .env file: ${envPath}`);

    console.log('\nNext steps:');
    console.log('1. Edit .env file and add your API keys');
    console.log('2. Optionally edit pipeline.config.json');
    console.log('3. Run: figma-generate generate -i <your-figma-export.json>');
  });

program
  .command('validate-config')
  .description('Validate configuration')
  .option('-c, --config <path>', 'Path to config file')
  .option('--env <path>', 'Path to .env file')
  .action((options) => {
    try {
      const config = loadConfig({
        configFile: options.config,
        envFile: options.env,
      });

      console.log('Configuration is valid!');
      console.log('\nCurrent configuration:');
      console.log(JSON.stringify({
        codeGenerationModel: config.codeGenerationModel,
        embeddingModel: config.embeddingModel,
        visionModel: config.visionModel,
        databasePath: config.databasePath,
        outputDir: config.outputDir,
        enableCaching: config.enableCaching,
        enableVisualValidation: config.enableVisualValidation,
        enableSemanticMatching: config.enableSemanticMatching,
        logLevel: config.logLevel,
      }, null, 2));
    } catch (error: any) {
      console.error('Configuration error:', error.message);
      process.exit(1);
    }
  });

/**
 * Parse input JSON to ComponentInput format
 * Handles various input formats from Figma plugin
 */
function parseInputJson(data: any): ComponentInput[] {
  const components: ComponentInput[] = [];

  // Handle Zephyr Figma plugin format (with node wrapper)
  if (data.node && data.node.id && data.node.name && data.node.type) {
    components.push({
      id: data.node.id,
      name: data.node.name,
      type: data.node.type,
      properties: data.node.properties,
      metadata: {
        ...data.node.metadata,
        version: data.version,
        exportDate: data.exportDate,
        fileKey: data.fileKey,
        fileName: data.fileName,
        nodeId: data.nodeId,
        nodeName: data.nodeName,
      },
      figmaNode: data.node,
    });
  }
  // Handle single component (direct format)
  else if (data.id && data.name && data.type) {
    components.push({
      id: data.id,
      name: data.name,
      type: data.type,
      properties: data.properties,
      metadata: data.metadata,
      figmaNode: data,
    });
  }
  // Handle array of components
  else if (Array.isArray(data)) {
    data.forEach((item) => {
      if (item.id && item.name && item.type) {
        components.push({
          id: item.id,
          name: item.name,
          type: item.type,
          properties: item.properties,
          metadata: item.metadata,
          figmaNode: item,
        });
      }
    });
  }
  // Handle nested structure
  else if (data.components && Array.isArray(data.components)) {
    data.components.forEach((item: any) => {
      if (item.id && item.name && item.type) {
        components.push({
          id: item.id,
          name: item.name,
          type: item.type,
          properties: item.properties,
          metadata: item.metadata,
          figmaNode: item,
        });
      }
    });
  }

  if (components.length === 0) {
    throw new Error('No valid components found in input JSON. Expected format: { id, name, type, ... }');
  }

  return components;
}

program.parse();
