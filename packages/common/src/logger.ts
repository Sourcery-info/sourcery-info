import pino from 'pino';
import type { ResolveOptions } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

// Detect if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Configure log levels and custom levels
const levels = {
  emerg: 80,
  alert: 70,
  crit: 60,
  error: 50,
  warn: 40,
  notice: 30,
  info: 20,
  debug: 10,
};

// Create base logger configuration
const baseConfig = {
  level: isBrowser ? 'info' : (process?.env?.LOG_LEVEL || 'info'),
  customLevels: levels,
  formatters: {
    level: (label: string) => {
      return { level: label };
    },
  },
  timestamp: isBrowser ? undefined : pino.stdTimeFunctions.isoTime,
};

// Create performance hooks for timing
const performanceHooks: { [key: string]: number } = {};

// Create the streams array - always provide a valid array for Node environment
const streams = isBrowser ? [] : [{ stream: process.stdout }];

// Create the logger instance
export const logger = isBrowser
  ? pino({
      ...baseConfig,
      browser: {
        write: {
          info: (o) => console.log(o),
          warn: (o) => console.warn(o),
          error: (o) => console.error(o),
        },
      },
    })
  : pino(baseConfig, pino.multistream(streams));

// Performance monitoring helpers
export const startTimer = (label: string) => {
  performanceHooks[label] = performance.now();
};

export const endTimer = (label: string, additionalData: object = {}, tags: string[] = []) => {
  const start = performanceHooks[label];
  if (!start) {
    logger.warn({ 
      msg: `Timer "${label}" was never started`,
      tags: ['timing', 'warning', ...tags]
    });
    return;
  }
  const duration = performance.now() - start;
  delete performanceHooks[label];
  
  logger.info({
    msg: `${label} completed`,
    duration,
    ...additionalData,
    type: 'performance',
    tags: ['timing', 'performance', ...tags]
  });
  return duration;
};

// Request logging middleware for SvelteKit
export const loggerMiddleware = async ({ event, resolve }: { 
  event: RequestEvent,
  resolve: (event: RequestEvent, opts?: ResolveOptions) => Promise<Response>
}) => {
  const start = performance.now();
  const response = await resolve(event);
  const duration = performance.now() - start;
  
  logger.info({
    msg: 'Request completed',
    method: event.request.method,
    path: event.url.pathname,
    status: response.status,
    duration,
    type: 'request',
    tags: ['http', 'request', event.request.method.toLowerCase()]
  });
  
  return response;
};

// Error logging helper
export const logError = (error: Error, context: object = {}, tags: string[] = []) => {
  logger.error({
    msg: error.message,
    error: {
      name: error.name,
      stack: error.stack,
    },
    ...context,
    type: 'error',
    tags: ['error', ...tags]
  });
};

// Generic logging with tags
export const logWithTags = (
  level: keyof typeof levels,
  msg: string,
  data: object = {},
  tags: string[] = []
) => {
  logger[level]({
    msg,
    ...data,
    tags
  });
}; 
