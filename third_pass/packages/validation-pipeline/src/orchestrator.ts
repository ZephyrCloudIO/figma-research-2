/**
 * Pipeline Orchestrator
 * Coordinates all stages of the Figma-to-code pipeline
 */

import { resolve, join } from 'path';
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import {
  PipelineConfig,
  ComponentInput,
  PipelineResult,
  PipelineStage,
  ProgressCallback,
  ErrorHandler,
  ValidationReport,
  ComponentMetadata,
} from './types.js';
import { getLogger } from './logger.js';
import { FigmaDatabase } from './database.js';
import { ComponentMatcher } from './component-matcher.js';
import { EnhancedFigmaParser, ComponentType } from './enhanced-figma-parser.js';
import { SemanticMapper, mapComponentToSchema } from './semantic-mapper.js';
import { extractIcons, generateLucideImports, IconMatch } from './icon-mapper.js';
import { summarizeFigmaData, formatSummaryForPrompt } from './figma-summarizer.js';
import { extractAllButtons, formatButtonPropertiesForPrompt } from './button-property-extractor.js';

const PIPELINE_VERSION = '1.0.0';

export class PipelineOrchestrator {
  private config: PipelineConfig;
  private logger = getLogger();
  private db?: FigmaDatabase;
  private matcher?: ComponentMatcher;

  constructor(config: PipelineConfig) {
    this.config = config;
  }

  /**
   * Initialize the pipeline (database, matcher, etc.)
   */
  async initialize(): Promise<void> {
    this.logger.section('Initializing Pipeline');

    try {
      // Create output directory
      if (!existsSync(this.config.outputDir)) {
        mkdirSync(this.config.outputDir, { recursive: true });
        this.logger.success(`Created output directory: ${this.config.outputDir}`);
      }

      // Initialize database
      if (this.config.enableCaching || this.config.enableSemanticMatching) {
        const dbPath = resolve(this.config.databasePath);
        this.db = new FigmaDatabase(dbPath);
        await this.db.initialize();
        this.logger.success(`Initialized database: ${dbPath}`);
      }

      // Initialize component matcher
      if (this.config.enableSemanticMatching && this.db) {
        this.matcher = new ComponentMatcher(this.config.databasePath);
        await this.matcher.initialize();
        this.logger.success('Initialized component matcher');
      }

      this.logger.success('Pipeline initialization complete');
    } catch (error) {
      this.logger.error('Pipeline initialization failed', error);
      throw error;
    }
  }

  /**
   * Process a single component through the pipeline
   */
  async processComponent(
    input: ComponentInput,
    options: {
      progressCallback?: ProgressCallback;
      errorHandler?: ErrorHandler;
    } = {}
  ): Promise<PipelineResult> {
    const startTime = Date.now();
    const stages: Record<string, PipelineStage> = {};
    const errors: string[] = [];
    const warnings: string[] = [];

    this.logger.section(`Processing Component: ${input.name}`);
    this.logger.info(`Component ID: ${input.id}`);

    // Initialize result
    const result: PipelineResult = {
      success: false,
      componentId: input.id,
      componentName: input.name,
      stages,
      outputs: {},
      totalDuration: 0,
      errors,
      warnings,
      generatedAt: new Date().toISOString(),
      pipelineVersion: PIPELINE_VERSION,
    };

    try {
      // Stage 1: Parse Figma data
      await this.runStage(
        'parse',
        stages,
        options.progressCallback,
        async () => {
          this.logger.subsection('Stage 1: Parse Figma Data');
          const parsed = EnhancedFigmaParser.parseNode(input.figmaNode);
          this.logger.success(`Parsed component: ${parsed.name}`);
          return parsed;
        }
      );

      // Stage 2: Classify component
      await this.runStage(
        'classify',
        stages,
        options.progressCallback,
        async () => {
          this.logger.subsection('Stage 2: Classify Component');
          const parsed = stages.parse.result;
          // Use the classifier from enhanced-figma-parser
          const componentType = this.classifyComponent(parsed);
          this.logger.success(`Classified as: ${componentType}`);
          return componentType;
        }
      );

      // Stage 2.5: Extract icons (NEW - task-55)
      await this.runStage(
        'icons',
        stages,
        options.progressCallback,
        async () => {
          this.logger.subsection('Stage 2.5: Extract Icons');
          const parsed = stages.parse.result;
          const allIcons = extractIcons(input.figmaNode);

          // Deduplicate icons by Lucide icon name to avoid overwhelming the prompt
          const iconMap = new Map<string, typeof allIcons[0]>();
          allIcons.forEach(iconData => {
            if (iconData.icon.lucideIcon && !iconMap.has(iconData.icon.lucideIcon)) {
              iconMap.set(iconData.icon.lucideIcon, iconData);
            }
          });

          const uniqueIcons = Array.from(iconMap.values());
          this.logger.success(`Found ${allIcons.length} icon instances, ${uniqueIcons.length} unique`);

          if (uniqueIcons.length > 0 && uniqueIcons.length <= 20) {
            uniqueIcons.forEach(({ path, icon }) => {
              this.logger.info(`  - ${icon.lucideIcon} at ${path} (confidence: ${(icon.confidence * 100).toFixed(0)}%)`);
            });
          } else if (uniqueIcons.length > 20) {
            this.logger.info(`  (Showing first 10 of ${uniqueIcons.length} unique icons)`);
            uniqueIcons.slice(0, 10).forEach(({ path, icon }) => {
              this.logger.info(`  - ${icon.lucideIcon} (confidence: ${(icon.confidence * 100).toFixed(0)}%)`);
            });
          }

          return uniqueIcons;
        }
      );

      // Stage 3: Semantic mapping
      await this.runStage(
        'map',
        stages,
        options.progressCallback,
        async () => {
          this.logger.subsection('Stage 3: Semantic Mapping');
          const parsed = stages.parse.result;
          const componentType = stages.classify.result;
          const mappingResult = mapComponentToSchema(parsed, componentType);
          this.logger.success(
            `Mapped to ShadCN ${mappingResult.shadcnSchema.shadcnName} (confidence: ${(mappingResult.overallConfidence * 100).toFixed(1)}%)`
          );
          if (mappingResult.warnings.length > 0) {
            mappingResult.warnings.forEach((w: string) => warnings.push(w));
          }
          return mappingResult;
        }
      );

      // Stage 4: Match library components (if enabled)
      if (this.config.enableSemanticMatching && this.matcher) {
        await this.runStage(
          'match',
          stages,
          options.progressCallback,
          async () => {
            this.logger.subsection('Stage 4: Match Library Components');
            const parsed = stages.parse.result;
            // Create a simple component for matching
            const component = {
              id: input.id,
              name: input.name,
              file_path: 'plugin-export',
              component_type: 'COMPONENT' as const,
              metadata: parsed,
            };
            const matches = await this.matcher!.findMatches(component);
            this.logger.success(
              `Found ${matches.matches.length} matches (top score: ${(matches.topScore * 100).toFixed(1)}%)`
            );
            return matches;
          }
        );
      } else {
        stages.match = {
          name: 'match',
          status: 'skipped',
        };
      }

      // Stage 5: Generate code
      await this.runStage(
        'generate',
        stages,
        options.progressCallback,
        async () => {
          this.logger.subsection('Stage 5: Generate Code');
          const parsed = stages.parse.result;
          const mappingResult = stages.map.result;
          const icons = stages.icons?.result || [];
          const code = await this.generateCode(parsed, mappingResult, icons, input.figmaNode);
          this.logger.success(`Generated ${code.length} characters of code`);
          return code;
        }
      );

      // Stage 6: Validate code
      await this.runStage(
        'validate',
        stages,
        options.progressCallback,
        async () => {
          this.logger.subsection('Stage 6: Validate Generated Code');
          const code = stages.generate.result;
          const validation = this.validateCode(code);
          this.logger.success(`Code validation complete (quality score: ${this.calculateQualityScore(validation)}%)`);
          return validation;
        }
      );

      // Stage 7: Visual validation (if enabled)
      if (this.config.enableVisualValidation) {
        await this.runStage(
          'visual',
          stages,
          options.progressCallback,
          async () => {
            this.logger.subsection('Stage 7: Visual Validation');
            this.logger.warn('Visual validation not yet implemented in this version');
            return null;
          }
        );
      } else {
        stages.visual = {
          name: 'visual',
          status: 'skipped',
        };
      }

      // Stage 8: Write output files
      await this.runStage(
        'output',
        stages,
        options.progressCallback,
        async () => {
          this.logger.subsection('Stage 8: Write Output Files');
          const code = stages.generate.result;
          const validation = stages.validate.result;
          const mappingResult = stages.map.result;

          const outputs = await this.writeOutputFiles(
            input,
            code,
            validation,
            mappingResult,
            stages
          );

          this.logger.success(`Wrote output files to: ${outputs.componentPath}`);
          return outputs;
        }
      );

      result.outputs = stages.output.result;
      result.success = true;
    } catch (error: any) {
      this.logger.error('Pipeline failed', error);
      errors.push(error.message);
      result.success = false;
    }

    result.totalDuration = Date.now() - startTime;
    this.logger.section(`Component Processing Complete: ${result.success ? 'SUCCESS' : 'FAILED'}`);
    this.logger.info(`Total duration: ${result.totalDuration}ms`);

    return result;
  }

  /**
   * Process multiple components in batch
   */
  async processBatch(
    inputs: ComponentInput[],
    options: {
      progressCallback?: ProgressCallback;
      errorHandler?: ErrorHandler;
    } = {}
  ) {
    this.logger.section(`Processing Batch: ${inputs.length} components`);
    const startTime = Date.now();
    const results: PipelineResult[] = [];

    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      this.logger.info(`\nProcessing ${i + 1}/${inputs.length}: ${input.name}`);

      try {
        const result = await this.processComponent(input, options);
        results.push(result);

        if (options.progressCallback) {
          options.progressCallback({
            stage: 'batch',
            progress: ((i + 1) / inputs.length) * 100,
            message: `Processed ${i + 1}/${inputs.length} components`,
            timestamp: Date.now(),
          });
        }
      } catch (error: any) {
        this.logger.error(`Failed to process ${input.name}`, error);
        // Continue with next component
      }
    }

    const totalDuration = Date.now() - startTime;
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    this.logger.section('Batch Processing Complete');
    this.logger.info(`Total components: ${inputs.length}`);
    this.logger.info(`Successful: ${successCount}`);
    this.logger.info(`Failed: ${failureCount}`);
    this.logger.info(`Total duration: ${totalDuration}ms`);
    this.logger.info(`Average per component: ${Math.round(totalDuration / inputs.length)}ms`);

    return {
      totalComponents: inputs.length,
      successCount,
      failureCount,
      results,
      totalDuration,
      startedAt: new Date(startTime).toISOString(),
      completedAt: new Date().toISOString(),
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    if (this.matcher) {
      this.matcher.close();
    }
    if (this.db) {
      this.db.close();
    }
    this.logger.info('Pipeline cleanup complete');
  }

  // Private helper methods

  private async runStage(
    name: string,
    stages: Record<string, PipelineStage>,
    progressCallback: ProgressCallback | undefined,
    executor: () => Promise<any>
  ): Promise<void> {
    const stage: PipelineStage = {
      name,
      status: 'running',
      startTime: Date.now(),
    };
    stages[name] = stage;

    try {
      const result = await executor();
      stage.result = result;
      stage.status = 'completed';
      stage.endTime = Date.now();
    } catch (error: any) {
      stage.status = 'failed';
      stage.error = error.message;
      stage.endTime = Date.now();
      throw error;
    }
  }

  private classifyComponent(parsed: any): ComponentType {
    // Simple classification based on name patterns
    const name = parsed.name.toLowerCase();

    if (name.includes('button')) return 'Button';
    if (name.includes('card')) return 'Card';
    if (name.includes('input') || name.includes('field')) return 'Input';
    if (name.includes('dialog') || name.includes('modal')) return 'Dialog';
    if (name.includes('alert')) return 'Alert';
    if (name.includes('badge')) return 'Badge';
    if (name.includes('checkbox')) return 'Checkbox';
    if (name.includes('radio')) return 'RadioGroup';
    if (name.includes('select')) return 'Select';
    if (name.includes('switch')) return 'Switch';
    if (name.includes('slider')) return 'Slider';
    if (name.includes('tabs')) return 'Tabs';
    if (name.includes('avatar')) return 'Avatar';

    return 'Button'; // Default fallback
  }

  private async generateCode(parsed: any, mappingResult: any, icons: Array<{ path: string; node: any; icon: IconMatch }> = [], rawFigmaNode?: any): Promise<string> {
    // Call OpenRouter API for code generation
    const prompt = this.buildCodeGenerationPrompt(parsed, mappingResult, icons, rawFigmaNode);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.openRouterApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.codeGenerationModel,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Code generation failed: ${response.status} ${await response.text()}`);
    }

    const data = await response.json() as any;
    return data.choices[0].message.content;
  }

  private buildCodeGenerationPrompt(parsed: any, mappingResult: any, icons: Array<{ path: string; node: any; icon: IconMatch }> = [], rawFigmaNode?: any): string {
    const shadcnComponent = mappingResult.shadcnSchema.shadcnName;

    // For Button components, extract detailed button properties
    let buttonAnalysisSection = '';
    if (shadcnComponent === 'Button' || parsed.name.toLowerCase().includes('button')) {
      this.logger.info(`Attempting to extract button properties from: ${parsed.name}`);
      // Use raw Figma node if available, otherwise fall back to parsed
      const nodeToExtractFrom = rawFigmaNode || parsed;
      const buttons = extractAllButtons(nodeToExtractFrom);
      this.logger.info(`extractAllButtons returned ${buttons.length} buttons`);
      if (buttons.length > 0) {
        buttonAnalysisSection = '\n' + formatButtonPropertiesForPrompt(buttons);
        this.logger.info(`Extracted ${buttons.length} button instances with detailed properties`);
      } else {
        this.logger.warn('No buttons found by extractAllButtons - check node structure');
      }
    }

    // Summarize Figma data to avoid token overflow
    // Increased depth to 6 to capture button instances (was 3, which truncated at Light/Dark frames)
    const summary = summarizeFigmaData(parsed, 6);
    const reductionPct = ((1 - summary.summarizedSize / summary.originalSize) * 100).toFixed(0);
    this.logger.info(`Summarized Figma data: ${(summary.originalSize / 1024).toFixed(0)}KB → ${(summary.summarizedSize / 1024).toFixed(0)}KB (${reductionPct}% reduction)`);

    // Build icon section if icons were detected
    let iconSection = '';
    if (icons.length > 0) {
      const lucideImport = generateLucideImports(icons.map(i => i.icon));

      // List unique icon types without overwhelming the prompt
      const uniqueIconNames = Array.from(new Set(icons.map(i => i.icon.lucideIcon).filter(Boolean)));

      iconSection = `

# Icons Detected (IMPORTANT!)
This component contains icons. Use Lucide React icons:

${lucideImport}

Detected Icon Types: ${uniqueIconNames.join(', ')}

**CRITICAL**:
- Import icons from 'lucide-react' (see above)
- Replace any empty divs, placeholders, or icon containers with the actual icon components
- Match icon types based on context (docs/links → FileText/ExternalLink, folders → Folder, arrows → ArrowRight, etc.)
- Use appropriate className for sizing (typically "w-4 h-4" for 16px icons, "w-5 h-5" for 20px, "w-6 h-6" for 24px)
- Icons should match the visual hierarchy and spacing from the Figma design`;
    }

    return `You are an expert React + TypeScript + Tailwind CSS developer. Generate a pixel-perfect React component using ShadCN UI components.

**CRITICAL INSTRUCTION**: You MUST replicate the EXACT structure from the Figma data below. DO NOT invent, improvise, or create generic examples. If the Figma data shows 28 button instances, you MUST render all 28. If it shows Light and Dark sections, you MUST include both sections. This is a REPLICATION task, not a creative task.

# Component Information
- Name: ${parsed.name}
- Type: ${shadcnComponent}
- Confidence: ${(mappingResult.overallConfidence * 100).toFixed(1)}%
${buttonAnalysisSection}
# Figma Data (Summarized with Instance Counts)
${formatSummaryForPrompt(summary)}

**IMPORTANT**: The structure above shows "instanceCount" and "Repeated N times" annotations. These indicate how many times each component appears in the design. You MUST generate ALL instances, not just one example.

# Semantic Mapping
${JSON.stringify(mappingResult, null, 2)}${iconSection}

# Requirements (IN ORDER OF IMPORTANCE)
1. **STRUCTURAL ACCURACY** (HIGHEST PRIORITY):
   - Replicate the EXACT hierarchy shown in the Figma structure above
   - If a node shows "instanceCount: 28", render ALL 28 instances
   - If the structure shows Light and Dark sections, include BOTH sections
   - DO NOT create generic "playground" or example sections unless they exist in the Figma data
   - DO NOT invent content - only use text, components, and structure from the Figma data

2. **Visual Fidelity**:
   - Use the ShadCN "${shadcnComponent}" component as the base where appropriate
   - Implement all visual properties from the Figma data (colors, spacing, typography, borders, shadows)
   - Match the exact layout mode, gaps, and padding from the structure

3. **Icons**:
   - ${icons.length > 0 ? `**IMPORTANT**: Render all ${icons.length} icons using Lucide React components (see Icon Mappings above)` : 'No icons detected'}

4. **Code Quality**:
   - Create proper TypeScript interfaces for props
   - Use Tailwind CSS for all styling
   - Include accessibility attributes (ARIA labels, roles)
   - Make it production-ready and well-formatted

# Validation Checklist (Verify Before Submitting)
□ Did I include ALL sections from the Figma hierarchy (not just the first one)?
□ Did I generate ALL repeated instances (check instanceCount annotations)?
□ Did I avoid inventing any content not shown in the Figma data?
□ Does my component structure match the Figma structure depth and breadth?

# Output Format
Return ONLY the TypeScript/React component code. No explanations, no markdown code blocks, just the raw code.

Start with imports (including Lucide icons if present), then the props interface, then the component.`;
  }

  private validateCode(code: string): any {
    const quality = {
      hasTypeScript: code.includes('interface ') || code.includes('type '),
      hasReact: code.includes('import') && (code.includes('React') || code.includes('from "react"')),
      hasTailwind: code.includes('className='),
      hasProps: code.includes('Props'),
      hasAccessibility: code.includes('aria-') || code.includes('role='),
      formatted: code.split('\n').some(line => line.startsWith('  ')),
    };

    return quality;
  }

  private calculateQualityScore(validation: any): number {
    const weights = {
      hasTypeScript: 25,
      hasReact: 25,
      hasTailwind: 20,
      hasProps: 15,
      hasAccessibility: 10,
      formatted: 5,
    };

    let score = 0;
    for (const [key, weight] of Object.entries(weights)) {
      if (validation[key]) {
        score += weight;
      }
    }

    return score;
  }

  private async writeOutputFiles(
    input: ComponentInput,
    code: string,
    validation: any,
    mappingResult: any,
    stages: Record<string, PipelineStage>
  ): Promise<any> {
    // Create component directory
    const componentDir = this.config.createSubdirectories
      ? join(this.config.outputDir, this.sanitizeFilename(input.name))
      : this.config.outputDir;

    if (!existsSync(componentDir)) {
      mkdirSync(componentDir, { recursive: true });
    }

    // Write component code
    const componentPath = join(componentDir, `${this.sanitizeFilename(input.name)}.tsx`);
    writeFileSync(componentPath, code, 'utf-8');

    // Write metadata
    const metadata: ComponentMetadata = {
      componentId: input.id,
      componentName: input.name,
      figmaNodeId: input.id,
      generatedWith: {
        model: this.config.codeGenerationModel,
        pipelineVersion: PIPELINE_VERSION,
        timestamp: new Date().toISOString(),
      },
      classification: {
        componentType: stages.classify.result,
        shadcnComponent: mappingResult.shadcnSchema.shadcnName,
        confidence: mappingResult.overallConfidence,
      },
      codeInfo: {
        language: 'typescript',
        framework: 'react',
        library: 'shadcn',
        dependencies: ['@/components/ui'],
      },
      validation: {
        status: this.calculateQualityScore(validation) >= 80 ? 'pass' : 'warning',
        score: this.calculateQualityScore(validation),
        issues: [],
      },
    };

    const metadataPath = join(componentDir, 'metadata.json');
    writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');

    // Write validation report
    const report: ValidationReport = {
      componentId: input.id,
      componentName: input.name,
      codeQuality: validation,
      semanticMapping: {
        componentType: stages.classify.result,
        shadcnComponent: mappingResult.shadcnSchema.shadcnName,
        confidence: mappingResult.overallConfidence,
        warnings: mappingResult.warnings,
      },
      timestamp: new Date().toISOString(),
    };

    const reportPath = join(componentDir, 'validation-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');

    return {
      componentCode: code,
      componentPath,
      metadataPath,
      validationReportPath: reportPath,
    };
  }

  private sanitizeFilename(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
  }
}
