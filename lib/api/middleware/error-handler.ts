import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { ApiError, ErrorCodes } from '../utils/api-error';

export interface ErrorContext {
  requestId?: string;
  url?: string;
  method?: string;
  userAgent?: string;
  timestamp: string;
}

export function handleApiError(error: unknown, context?: Partial<ErrorContext>): NextResponse {
  const errorContext: ErrorContext = {
    timestamp: new Date().toISOString(),
    ...context
  };

  // Handle known ApiError instances
  if (ApiError.isApiError(error)) {
    // Enrich ApiError with additional context if not already present
    if (!error.requestId && errorContext.requestId) {
      (error as any).requestId = errorContext.requestId;
    }

    logError(error, errorContext);
    
    return NextResponse.json(
      error.toJSON(),
      { 
        status: error.statusCode,
        headers: getErrorHeaders(error)
      }
    );
  }
  
  // Handle Zod validation errors (fallback - should be caught by validation middleware)
  if (error instanceof ZodError) {
    const apiError = new ApiError(
      ErrorCodes.SCHEMA_VALIDATION_FAILED,
      'Request validation failed',
      {
        errors: error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
      },
      422,
      errorContext.requestId
    );

    logError(apiError, errorContext);
    
    return NextResponse.json(
      apiError.toJSON(),
      { 
        status: 422,
        headers: getErrorHeaders(apiError)
      }
    );
  }
  
  // Handle standard Error instances
  if (error instanceof Error) {
    const apiError = new ApiError(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      'An internal server error occurred',
      {
        originalError: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        ...errorContext
      },
      500,
      errorContext.requestId
    );

    logError(apiError, errorContext);
    
    return NextResponse.json(
      apiError.toJSON(),
      { 
        status: 500,
        headers: getErrorHeaders(apiError)
      }
    );
  }
  
  // Handle unknown error types
  const unexpectedError = new ApiError(
    ErrorCodes.INTERNAL_SERVER_ERROR,
    'An unexpected error occurred',
    {
      originalError: typeof error === 'string' ? error : 'Unknown error type',
      errorType: typeof error,
      ...errorContext
    },
    500,
    errorContext.requestId
  );

  logError(unexpectedError, errorContext);
  
  return NextResponse.json(
    unexpectedError.toJSON(),
    { 
      status: 500,
      headers: getErrorHeaders(unexpectedError)
    }
  );
}

function getErrorHeaders(error: ApiError): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Error-Code': error.code,
    'X-Timestamp': error.timestamp
  };

  if (error.requestId) {
    headers['X-Request-Id'] = error.requestId;
  }

  // Add CORS headers for API routes
  headers['Access-Control-Allow-Origin'] = '*';
  headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
  headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-MCP-*';

  return headers;
}

function logError(error: ApiError, context: ErrorContext): void {
  const logLevel = getLogLevel(error.statusCode);
  const message = `[API Error] ${error.code}: ${error.message}`;
  
  const logData = {
    code: error.code,
    message: error.message,
    statusCode: error.statusCode,
    requestId: error.requestId,
    details: error.details,
    context,
    timestamp: error.timestamp
  };

  switch (logLevel) {
    case 'error':
      console.error(message, logData);
      break;
    case 'warn':
      console.warn(message, logData);
      break;
    case 'info':
      console.info(message, logData);
      break;
  }

  // In production, you might want to send errors to an external service
  if (process.env.NODE_ENV === 'production' && logLevel === 'error') {
    // Example: Send to error tracking service
    // errorTrackingService.reportError(error, context);
  }
}

function getLogLevel(statusCode: number): 'error' | 'warn' | 'info' {
  if (statusCode >= 500) {
    return 'error';
  } else if (statusCode >= 400) {
    return 'warn';
  } else {
    return 'info';
  }
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorCounts: Map<string, number> = new Map();
  private lastReset: number = Date.now();
  private readonly resetInterval = 60000; // 1 minute

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  handleError(error: unknown, context?: Partial<ErrorContext>): NextResponse {
    this.trackError(error);
    return handleApiError(error, context);
  }

  private trackError(error: unknown): void {
    const now = Date.now();
    
    // Reset counts every minute
    if (now - this.lastReset > this.resetInterval) {
      this.errorCounts.clear();
      this.lastReset = now;
    }

    let errorKey: string;
    if (ApiError.isApiError(error)) {
      errorKey = error.code;
    } else if (error instanceof Error) {
      errorKey = error.constructor.name;
    } else {
      errorKey = 'UnknownError';
    }

    const currentCount = this.errorCounts.get(errorKey) || 0;
    this.errorCounts.set(errorKey, currentCount + 1);

    // Log if error rate is high
    if (currentCount > 10) {
      console.warn(`[Error Rate Alert] High error rate for ${errorKey}: ${currentCount} errors in last minute`);
    }
  }

  getErrorStats(): Record<string, number> {
    return Object.fromEntries(this.errorCounts);
  }
}

export function createErrorHandler() {
  return ErrorHandler.getInstance();
}

// Utility functions for common error scenarios
export function handleValidationError(error: ZodError, requestId?: string): NextResponse {
  return handleApiError(
    new ApiError(
      ErrorCodes.SCHEMA_VALIDATION_FAILED,
      'Validation failed',
      {
        errors: error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
      },
      422,
      requestId
    )
  );
}

export function handleNotFound(resource: string, requestId?: string): NextResponse {
  return handleApiError(
    new ApiError(
      'NOT_FOUND',
      `${resource} not found`,
      { resource },
      404,
      requestId
    )
  );
}

export function handleUnauthorized(message: string = 'Authentication required', requestId?: string): NextResponse {
  return handleApiError(
    new ApiError(
      ErrorCodes.UNAUTHORIZED,
      message,
      {},
      401,
      requestId
    )
  );
}

export function handleForbidden(message: string = 'Access denied', requestId?: string): NextResponse {
  return handleApiError(
    new ApiError(
      ErrorCodes.FORBIDDEN,
      message,
      {},
      403,
      requestId
    )
  );
}

export function handleTooManyRequests(message: string = 'Rate limit exceeded', requestId?: string): NextResponse {
  return handleApiError(
    new ApiError(
      'RATE_LIMIT_EXCEEDED',
      message,
      {},
      429,
      requestId
    )
  );
}