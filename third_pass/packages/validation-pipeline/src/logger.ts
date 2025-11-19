/**
 * Logging utility with multiple levels and optional file output
 */

import { appendFileSync, writeFileSync, existsSync } from 'fs';
import { dirname } from 'path';
import { mkdirSync } from 'fs';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

export class Logger {
  private level: LogLevel;
  private logFile?: string;
  private levelValue: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  constructor(level: LogLevel = 'info', logFile?: string) {
    this.level = level;
    this.logFile = logFile;

    // Initialize log file
    if (this.logFile) {
      const dir = dirname(this.logFile);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      // Clear log file on init
      writeFileSync(this.logFile, '');
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levelValue[level] >= this.levelValue[this.level];
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    const fullMessage = data
      ? `${prefix} ${message}\n${JSON.stringify(data, null, 2)}`
      : `${prefix} ${message}`;
    return fullMessage;
  }

  private log(level: LogLevel, message: string, data?: any): void {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, data);

    // Console output with colors
    const colors = {
      debug: '\x1b[36m', // Cyan
      info: '\x1b[32m',  // Green
      warn: '\x1b[33m',  // Yellow
      error: '\x1b[31m', // Red
    };
    const reset = '\x1b[0m';
    console.log(`${colors[level]}${formattedMessage}${reset}`);

    // File output (if configured)
    if (this.logFile) {
      appendFileSync(this.logFile, formattedMessage + '\n');
    }
  }

  debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: any): void {
    this.log('error', message, data);
  }

  // Progress indicator
  progress(message: string, current: number, total: number): void {
    const percentage = Math.round((current / total) * 100);
    const bar = this.createProgressBar(percentage);
    this.info(`${message} ${bar} ${current}/${total} (${percentage}%)`);
  }

  private createProgressBar(percentage: number, width: number = 20): string {
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    return `[${'='.repeat(filled)}${' '.repeat(empty)}]`;
  }

  // Section separators
  section(title: string): void {
    const line = '='.repeat(80);
    this.info(`\n${line}`);
    this.info(title);
    this.info(line);
  }

  subsection(title: string): void {
    const line = '-'.repeat(80);
    this.info(`\n${line}`);
    this.info(title);
    this.info(line);
  }

  // Success/failure indicators
  success(message: string): void {
    this.info(`✓ ${message}`);
  }

  failure(message: string): void {
    this.error(`✗ ${message}`);
  }

  // Timing
  time(label: string): () => void {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      this.info(`${label}: ${duration}ms`);
    };
  }
}

// Singleton instance
let globalLogger: Logger | null = null;

export function initLogger(level: LogLevel, logFile?: string): Logger {
  globalLogger = new Logger(level, logFile);
  return globalLogger;
}

export function getLogger(): Logger {
  if (!globalLogger) {
    globalLogger = new Logger('info');
  }
  return globalLogger;
}
