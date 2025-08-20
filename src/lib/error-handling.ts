/**
 * Error handling utilities for the application
 */

export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
}

export class ApplicationError extends Error {
  public code?: string;
  public details?: unknown;

  constructor(message: string, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApplicationError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Safely parse JSON with error handling
 */
export function safeJsonParse<T>(jsonString: string): T | null {
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return null;
  }
}

/**
 * Safely execute async function with error handling
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  fallback?: T
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    console.error('Async operation failed:', error);
    return fallback ?? null;
  }
}

/**
 * Log errors consistently across the application
 */
export function logError(error: unknown, context?: string): void {
  const errorInfo = {
    context,
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  };

  console.error('Application Error:', errorInfo);

  // In production, you might want to send this to an error tracking service
  // like Sentry, LogRocket, etc.
}

/**
 * Create user-friendly error messages
 */
export function createUserFriendlyError(error: unknown): string {
  if (error instanceof ApplicationError) {
    return error.message;
  }

  if (error instanceof Error) {
    // Common Firebase/network errors
    if (error.message.includes('network')) {
      return 'Bağlantı sorunu yaşanıyor. Lütfen internet bağlantınızı kontrol edin.';
    }
    if (error.message.includes('permission')) {
      return 'Bu işlem için yetkiniz bulunmuyor.';
    }
    if (error.message.includes('auth')) {
      return 'Kimlik doğrulama sorunu. Lütfen tekrar giriş yapın.';
    }
  }

  return 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.';
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff: 1s, 2s, 4s, etc.
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}