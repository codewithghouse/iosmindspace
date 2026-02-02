/**
 * Logger utility that only logs in development mode
 * In production builds, all logs are suppressed for better performance
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
  
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  
  warn: (...args: any[]) => {
    // Warnings are shown in both dev and production
    console.warn(...args);
  },
  
  error: (...args: any[]) => {
    // Errors are always shown
    console.error(...args);
  },
};

