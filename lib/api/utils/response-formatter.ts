import { NextResponse } from 'next/server';
import { MCPContextType } from '../schemas/task-schemas';

export interface ApiResponseData {
  [key: string]: any;
}

export interface ApiResponseMeta {
  requestId: string;
  timestamp: string;
  version?: string;
  processingTime?: number;
  traceId?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SuccessResponse<T = ApiResponseData> {
  success: true;
  data: T;
  meta: ApiResponseMeta;
  pagination?: PaginationMeta;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  meta: ApiResponseMeta;
}

export type ApiResponse<T = ApiResponseData> = SuccessResponse<T> | ErrorResponse;

export class ResponseFormatter {
  private startTime: number;
  private context: MCPContextType;

  constructor(context: MCPContextType) {
    this.context = context;
    this.startTime = performance.now();
  }

  success<T = ApiResponseData>(
    data: T,
    options: {
      statusCode?: number;
      headers?: Record<string, string>;
      pagination?: PaginationMeta;
      version?: string;
    } = {}
  ): NextResponse {
    const { statusCode = 200, headers = {}, pagination, version } = options;

    const response: SuccessResponse<T> = {
      success: true,
      data,
      meta: this.createMeta(version),
      ...(pagination && { pagination })
    };

    return NextResponse.json(response, {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': this.context.requestId,
        'X-Timestamp': response.meta.timestamp,
        ...this.getCorsHeaders(),
        ...headers
      }
    });
  }

  error(
    code: string,
    message: string,
    details?: any,
    statusCode: number = 500,
    headers: Record<string, string> = {}
  ): NextResponse {
    const response: ErrorResponse = {
      success: false,
      error: {
        code,
        message,
        details
      },
      meta: this.createMeta()
    };

    return NextResponse.json(response, {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': this.context.requestId,
        'X-Error-Code': code,
        'X-Timestamp': response.meta.timestamp,
        ...this.getCorsHeaders(),
        ...headers
      }
    });
  }

  created<T = ApiResponseData>(
    data: T,
    location?: string,
    headers: Record<string, string> = {}
  ): NextResponse {
    const responseHeaders = {
      ...headers,
      ...(location && { 'Location': location })
    };

    return this.success(data, {
      statusCode: 201,
      headers: responseHeaders
    });
  }

  accepted<T = ApiResponseData>(
    data: T,
    headers: Record<string, string> = {}
  ): NextResponse {
    return this.success(data, {
      statusCode: 202,
      headers
    });
  }

  noContent(headers: Record<string, string> = {}): NextResponse {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'X-Request-ID': this.context.requestId,
        'X-Timestamp': new Date().toISOString(),
        ...this.getCorsHeaders(),
        ...headers
      }
    });
  }

  paginated<T = ApiResponseData>(
    items: T[],
    pagination: PaginationMeta,
    headers: Record<string, string> = {}
  ): NextResponse {
    return this.success(
      { items },
      {
        pagination,
        headers
      }
    );
  }

  private createMeta(version?: string): ApiResponseMeta {
    const processingTime = performance.now() - this.startTime;

    return {
      requestId: this.context.requestId,
      timestamp: new Date().toISOString(),
      processingTime: Math.round(processingTime * 100) / 100, // Round to 2 decimal places
      traceId: this.context.requestId,
      ...(version && { version })
    };
  }

  private getCorsHeaders(): Record<string, string> {
    return {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-MCP-*',
      'Access-Control-Expose-Headers': 'X-Request-ID, X-Timestamp, X-Error-Code'
    };
  }
}

// Factory function
export function createResponseFormatter(context: MCPContextType): ResponseFormatter {
  return new ResponseFormatter(context);
}

// Utility functions for common response patterns
export function createTaskValidationResponse(
  isValid: boolean,
  errors: string[],
  warnings: string[],
  context: MCPContextType,
  additionalData?: any
) {
  const formatter = createResponseFormatter(context);
  
  return formatter.success({
    isValid,
    errors,
    warnings,
    context,
    validationResults: {
      schemaValid: errors.length === 0,
      businessRulesValid: true, // Will be implemented in later tasks
      contextValid: true,
      ...additionalData
    }
  });
}

export function createTaskExecutionResponse(
  status: 'queued' | 'processing' | 'completed' | 'failed',
  taskId: string,
  message: string,
  context: MCPContextType,
  result?: any,
  resourceUsage?: {
    cpu?: number;
    memory?: number;
    duration?: number;
  }
) {
  const formatter = createResponseFormatter(context);
  
  const statusCode = status === 'failed' ? 500 : status === 'queued' ? 202 : 200;
  
  return formatter.success({
    status,
    taskId,
    message,
    result,
    resourceUsage
  }, {
    statusCode
  });
}

export function createHealthCheckResponse(
  status: 'healthy' | 'degraded' | 'unhealthy',
  version: string,
  uptime: number,
  context: MCPContextType,
  dependencies?: Record<string, {
    status: 'available' | 'unavailable';
    responseTime?: number;
    lastChecked: string;
  }>
) {
  const formatter = createResponseFormatter(context);
  
  const statusCode = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;
  
  return formatter.success({
    status,
    version,
    uptime,
    dependencies
  }, {
    statusCode,
    version
  });
}

// Streaming response utilities for future use
export class StreamingResponseFormatter {
  private context: MCPContextType;
  private encoder = new TextEncoder();

  constructor(context: MCPContextType) {
    this.context = context;
  }

  createStream(): {
    stream: ReadableStream;
    write: (data: any) => void;
    close: () => void;
  } {
    let controller: ReadableStreamDefaultController<Uint8Array>;

    const stream = new ReadableStream({
      start(ctrl) {
        controller = ctrl;
      }
    });

    const write = (data: any) => {
      const chunk = this.encoder.encode(JSON.stringify(data) + '\n');
      controller.enqueue(chunk);
    };

    const close = () => {
      controller.close();
    };

    return { stream, write, close };
  }

  createServerSentEventStream(): {
    response: NextResponse;
    send: (event: string, data: any) => void;
    close: () => void;
  } {
    const { stream, write, close } = this.createStream();

    const response = new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Request-ID': this.context.requestId,
        ...this.getCorsHeaders()
      }
    });

    const send = (event: string, data: any) => {
      write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    return { response, send, close };
  }

  private getCorsHeaders(): Record<string, string> {
    return {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-MCP-*'
    };
  }
}