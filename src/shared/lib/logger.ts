/**
 * Logger personalizado para el proyecto
 *
 * REGLA CRÍTICA: Usar logger en lugar de console.*
 * - console.log() → logger.info()
 * - console.error() → logger.error()
 * - console.warn() → logger.warn()
 * - console.debug() → logger.debug()
 *
 * Los logs solo se emiten si NEXT_PUBLIC_SHOW_LOGS === 'true'
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogData {
  data?: unknown;
  [key: string]: unknown;
}

const isLoggingEnabled = (): boolean => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_SHOW_LOGS === 'true';
  }
  return process.env.NEXT_PUBLIC_SHOW_LOGS === 'true';
};

const formatMessage = (scope: string | null, level: LogLevel, message: string): string => {
  const timestamp = new Date().toISOString();
  const scopePrefix = scope ? `[${scope}]` : '';
  return `${timestamp} ${level.toUpperCase()} ${scopePrefix} ${message}`;
};

const logWithLevel = (level: LogLevel, scope: string | null, message: string, data?: LogData): void => {
  if (!isLoggingEnabled()) return;

  const formattedMessage = formatMessage(scope, level, message);

  switch (level) {
    case 'debug':
      if (data) {
        console.debug(formattedMessage, data);
      } else {
        console.debug(formattedMessage);
      }
      break;
    case 'info':
      if (data) {
        console.info(formattedMessage, data);
      } else {
        console.info(formattedMessage);
      }
      break;
    case 'warn':
      if (data) {
        console.warn(formattedMessage, data);
      } else {
        console.warn(formattedMessage);
      }
      break;
    case 'error':
      if (data) {
        console.error(formattedMessage, data);
      } else {
        console.error(formattedMessage);
      }
      break;
  }
};

/**
 * Logger global para uso sin scope
 */
export const logger = {
  debug: (message: string, data?: LogData | unknown) => logWithLevel('debug', null, message, data as LogData),
  info: (message: string, data?: LogData | unknown) => logWithLevel('info', null, message, data as LogData),
  warn: (message: string, data?: LogData | unknown) => logWithLevel('warn', null, message, data as LogData),
  error: (message: string, data?: LogData | unknown) => logWithLevel('error', null, message, data as LogData),

  group: (label: string, fn: () => void) => {
    if (!isLoggingEnabled()) return;
    console.group(label);
    fn();
    console.groupEnd();
  },

  table: (data: unknown) => {
    if (!isLoggingEnabled()) return;
    console.table(data);
  },

  time: (label: string) => {
    if (!isLoggingEnabled()) return;
    console.time(label);
  },

  timeEnd: (label: string) => {
    if (!isLoggingEnabled()) return;
    console.timeEnd(label);
  },
};

/**
 * Logger con scope para uso en componentes específicos
 *
 * @example
 * const logger = new Logger('MyComponent');
 * logger.info('Component mounted');
 * logger.error('Something went wrong', { data: { error } });
 */
export class Logger {
  private scope: string;

  constructor(scope: string) {
    this.scope = scope;
  }

  debug(message: string, data?: LogData): void {
    logWithLevel('debug', this.scope, message, data);
  }

  info(message: string, data?: LogData): void {
    logWithLevel('info', this.scope, message, data);
  }

  warn(message: string, data?: LogData): void {
    logWithLevel('warn', this.scope, message, data);
  }

  error(message: string, data?: LogData): void {
    logWithLevel('error', this.scope, message, data);
  }

  group(label: string, fn: () => void): void {
    if (!isLoggingEnabled()) return;
    console.group(`[${this.scope}] ${label}`);
    fn();
    console.groupEnd();
  }

  table(data: unknown): void {
    if (!isLoggingEnabled()) return;
    console.table(data);
  }

  time(label: string): void {
    if (!isLoggingEnabled()) return;
    console.time(`[${this.scope}] ${label}`);
  }

  timeEnd(label: string): void {
    if (!isLoggingEnabled()) return;
    console.timeEnd(`[${this.scope}] ${label}`);
  }
}
