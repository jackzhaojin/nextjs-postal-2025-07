import { NextRequest } from 'next/server';
import { ZodSchema, ZodError } from 'zod';
import { ApiError, ErrorCodes } from '../utils/api-error';

export type ValidationResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: ApiError;
}

export function validateRequest<T>(schema: ZodSchema<T>) {
  return async (req: NextRequest): Promise<T> => {
    try {
      // Check content type
      const contentType = req.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new ApiError(
          ErrorCodes.INVALID_CONTENT_TYPE,
          'Content-Type must be application/json',
          {
            received: contentType,
            expected: 'application/json'
          },
          400
        );
      }

      // Parse request body
      let body: any;
      try {
        body = await req.json();
      } catch (parseError) {
        throw new ApiError(
          ErrorCodes.REQUEST_PARSE_ERROR,
          'Failed to parse request body as JSON',
          {
            originalError: parseError instanceof Error ? parseError.message : 'Unknown parse error',
            contentType
          },
          400
        );
      }

      // Validate against schema
      try {
        return schema.parse(body);
      } catch (validationError) {
        if (validationError instanceof ZodError) {
          throw new ApiError(
            ErrorCodes.SCHEMA_VALIDATION_FAILED,
            'Request validation failed',
            {
              code: 'SCHEMA_VALIDATION_FAILED',
              errors: validationError.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message,
                received: err.received,
                expected: err.expected,
                code: err.code
              }))
            },
            422
          );
        }
        
        throw ApiError.fromError(
          validationError instanceof Error ? validationError : new Error('Unknown validation error'),
          ErrorCodes.VALIDATION_ERROR,
          422
        );
      }
    } catch (error) {
      if (ApiError.isApiError(error)) {
        throw error;
      }
      
      throw new ApiError(
        ErrorCodes.INTERNAL_SERVER_ERROR,
        'An unexpected error occurred during validation',
        {
          originalError: error instanceof Error ? error.message : 'Unknown error'
        },
        500
      );
    }
  };
}

export async function validateRequestSafe<T>(
  schema: ZodSchema<T>,
  req: NextRequest
): Promise<ValidationResult<T>> {
  try {
    const validator = validateRequest(schema);
    const data = await validator(req);
    return { success: true, data };
  } catch (error) {
    if (ApiError.isApiError(error)) {
      return { success: false, error };
    }
    
    return {
      success: false,
      error: new ApiError(
        ErrorCodes.INTERNAL_SERVER_ERROR,
        'Validation failed unexpectedly',
        { originalError: error instanceof Error ? error.message : 'Unknown error' },
        500
      )
    };
  }
}

export function validateHeaders(req: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {};
  
  // Extract standard headers
  headers.contentType = req.headers.get('content-type') || '';
  headers.userAgent = req.headers.get('user-agent') || '';
  headers.authorization = req.headers.get('authorization') || '';
  headers.origin = req.headers.get('origin') || '';
  headers.referer = req.headers.get('referer') || '';
  
  // Extract custom MCP headers
  headers.mcpProject = req.headers.get('x-mcp-project') || '';
  headers.mcpPhase = req.headers.get('x-mcp-phase') || '';
  headers.mcpTaskId = req.headers.get('x-mcp-task-id') || '';
  headers.mcpSessionId = req.headers.get('x-mcp-session-id') || '';
  headers.mcpTraceLevel = req.headers.get('x-mcp-trace-level') || 'standard';
  
  // Extract additional debugging headers
  headers.mcpRequestId = req.headers.get('x-mcp-request-id') || '';
  headers.mcpParentSpanId = req.headers.get('x-mcp-parent-span-id') || '';
  
  return headers;
}

export function validateMethod(req: NextRequest, allowedMethods: string[]): void {
  if (!allowedMethods.includes(req.method)) {
    throw new ApiError(
      ErrorCodes.INVALID_REQUEST_METHOD,
      `Method ${req.method} not allowed`,
      {
        method: req.method,
        allowed: allowedMethods
      },
      405
    );
  }
}

export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: ZodSchema<T>
): T {
  try {
    const params: Record<string, any> = {};
    
    // Convert URLSearchParams to object
    for (const [key, value] of searchParams.entries()) {
      // Handle multiple values with same key
      if (params[key] !== undefined) {
        if (Array.isArray(params[key])) {
          params[key].push(value);
        } else {
          params[key] = [params[key], value];
        }
      } else {
        params[key] = value;
      }
    }
    
    return schema.parse(params);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ApiError(
        ErrorCodes.SCHEMA_VALIDATION_FAILED,
        'Query parameter validation failed',
        {
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            received: err.received,
            expected: err.expected
          }))
        },
        400
      );
    }
    
    throw ApiError.fromError(
      error instanceof Error ? error : new Error('Unknown query validation error'),
      ErrorCodes.VALIDATION_ERROR,
      400
    );
  }
}

export interface ValidationOptions {
  allowEmptyBody?: boolean;
  strictHeaders?: boolean;
  requireAuth?: boolean;
  maxBodySize?: number; // in bytes
}

export function createValidationMiddleware<T>(
  schema: ZodSchema<T>,
  options: ValidationOptions = {}
) {
  return async (req: NextRequest): Promise<T> => {
    const {
      allowEmptyBody = false,
      strictHeaders = false,
      requireAuth = false,
      maxBodySize = 1024 * 1024 // 1MB default
    } = options;

    // Validate method
    validateMethod(req, ['POST', 'PUT', 'PATCH']);

    // Validate headers if strict mode
    if (strictHeaders) {
      const headers = validateHeaders(req);
      if (!headers.contentType.includes('application/json')) {
        throw new ApiError(
          ErrorCodes.INVALID_CONTENT_TYPE,
          'Content-Type must be application/json',
          { received: headers.contentType },
          400
        );
      }
    }

    // Validate auth if required
    if (requireAuth) {
      const authHeader = req.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ApiError(
          ErrorCodes.UNAUTHORIZED,
          'Valid authorization token required',
          {},
          401
        );
      }
    }

    // Check body size if specified
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > maxBodySize) {
      throw new ApiError(
        ErrorCodes.VALIDATION_ERROR,
        'Request body too large',
        {
          size: parseInt(contentLength),
          maxSize: maxBodySize
        },
        413
      );
    }

    return validateRequest(schema)(req);
  };
}