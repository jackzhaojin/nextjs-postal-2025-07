export class ApiError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: any;
  public readonly timestamp: string;
  public readonly requestId?: string;

  constructor(
    code: string,
    message: string,
    details?: any,
    statusCode: number = 500,
    requestId?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.requestId = requestId;
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
        timestamp: this.timestamp,
        requestId: this.requestId
      }
    };
  }

  static isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
  }

  static fromError(error: Error, code: string = 'INTERNAL_SERVER_ERROR', statusCode: number = 500): ApiError {
    return new ApiError(
      code,
      error.message,
      {
        originalError: error.name,
        stack: error.stack
      },
      statusCode
    );
  }
}

export const ErrorCodes = {
  // Validation Errors (4xx)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SCHEMA_VALIDATION_FAILED: 'SCHEMA_VALIDATION_FAILED',
  REQUEST_PARSE_ERROR: 'REQUEST_PARSE_ERROR',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FIELD_FORMAT: 'INVALID_FIELD_FORMAT',
  INVALID_REQUEST_METHOD: 'INVALID_REQUEST_METHOD',
  INVALID_CONTENT_TYPE: 'INVALID_CONTENT_TYPE',
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  
  // Authentication and Authorization Errors (4xx)
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // Context Errors (5xx)
  CONTEXT_BOOTSTRAP_FAILED: 'CONTEXT_BOOTSTRAP_FAILED',
  MCP_CONTEXT_INVALID: 'MCP_CONTEXT_INVALID',
  CONTEXT_MISSING: 'CONTEXT_MISSING',
  
  // System Errors (5xx)
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  
  // Task Execution Errors (5xx)
  TASK_EXECUTION_FAILED: 'TASK_EXECUTION_FAILED',
  TASK_TIMEOUT: 'TASK_TIMEOUT',
  TASK_CANCELLED: 'TASK_CANCELLED',
  RESOURCE_EXHAUSTED: 'RESOURCE_EXHAUSTED'
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];