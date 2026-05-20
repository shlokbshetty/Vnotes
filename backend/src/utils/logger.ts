/**
 * Structured logging utility
 * Provides consistent logging across the application
 */

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

const getTimestamp = () => new Date().toISOString();

const log = (level: LogLevel, message: string, data?: any) => {
  const timestamp = getTimestamp();
  const logEntry = {
    timestamp,
    level,
    message,
    ...(data && { data })
  };

  if (level === 'ERROR') {
    console.error(`[${timestamp}] [${level}] ${message}`, data || '');
  } else if (level === 'WARN') {
    console.warn(`[${timestamp}] [${level}] ${message}`, data || '');
  } else {
    console.log(`[${timestamp}] [${level}] ${message}`, data || '');
  }
};

export const logger = {
  info: (message: string, data?: any) => log('INFO', message, data),
  warn: (message: string, data?: any) => log('WARN', message, data),
  error: (message: string, data?: any) => log('ERROR', message, data),
  debug: (message: string, data?: any) => log('DEBUG', message, data)
};
