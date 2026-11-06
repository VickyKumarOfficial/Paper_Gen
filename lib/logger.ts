/**
 * Niera QPG Logger — Structured logging for Phase 0+
 * Level: error | warn | info | debug
 */
type Level = 'error' | 'warn' | 'info' | 'debug';

interface LogEntry {
  level: Level;
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

function log(level: Level, message: string, data?: Record<string, unknown>) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(data && { data }),
  };
  console[level]('[Niera]', JSON.stringify(entry));
}

export const logger = {
  error: (msg: string, data?: Record<string, unknown>) => log('error', msg, data),
  warn: (msg: string, data?: Record<string, unknown>) => log('warn', msg, data),
  info: (msg: string, data?: Record<string, unknown>) => log('info', msg, data),
  debug: (msg: string, data?: Record<string, unknown>) => log('debug', msg, data),
};