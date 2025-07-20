import { NextRequest } from 'next/server';
import { validateHeaders } from './validation';
import { MCPContextType, MCPContextSchema } from '../schemas/task-schemas';
import { ApiError, ErrorCodes } from '../utils/api-error';
import { 
  generateRequestId, 
  generateTaskId, 
  generateSessionId, 
  logContextBootstrap,
  TraceLogger,
  createTraceLogger
} from '../utils/trace-logger';

export interface ContextBootstrapOptions {
  requireProject?: boolean;
  requirePhase?: boolean;
  requireTaskId?: boolean;
  generateMissingIds?: boolean;
  validateContext?: boolean;
  enableTracing?: boolean;
}

export interface BootstrapResult {
  context: MCPContextType;
  tracer: TraceLogger;
}

export async function bootstrapContext(
  req: NextRequest, 
  payload: any,
  options: ContextBootstrapOptions = {}
): Promise<BootstrapResult> {
  const {
    requireProject = false,
    requirePhase = false,
    requireTaskId = false,
    generateMissingIds = true,
    validateContext = true,
    enableTracing = true
  } = options;

  try {
    const headers = validateHeaders(req);
    const requestId = generateRequestId();
    
    // Extract context from headers or payload with fallbacks
    const contextData = {
      project: extractProject(headers, payload, requireProject, generateMissingIds),
      taskId: extractTaskId(headers, payload, requireTaskId, generateMissingIds),
      phase: extractPhase(headers, payload, requirePhase, generateMissingIds),
      requestId,
      metadata: {
        user: extractUser(headers),
        sessionId: extractSessionId(headers, generateMissingIds),
        timestamp: new Date().toISOString(),
        traceLevel: extractTraceLevel(headers)
      }
    };
    
    // Validate constructed context if requested
    let validatedContext: MCPContextType;
    if (validateContext) {
      try {
        validatedContext = MCPContextSchema.parse(contextData);
      } catch (validationError) {
        throw new ApiError(
          ErrorCodes.MCP_CONTEXT_INVALID,
          'Failed to construct valid MCP context',
          {
            contextData,
            validationError: validationError instanceof Error ? validationError.message : 'Unknown validation error'
          },
          500
        );
      }
    } else {
      validatedContext = contextData as MCPContextType;
    }
    
    // Create tracer
    const tracer = enableTracing ? createTraceLogger(validatedContext) : createNoOpTracer(validatedContext);
    
    // Log context bootstrap for tracing
    logContextBootstrap(validatedContext, req.url || 'unknown');
    tracer.log('info', 'context_bootstrap_complete', {
      project: validatedContext.project,
      phase: validatedContext.phase,
      taskId: validatedContext.taskId,
      traceLevel: validatedContext.metadata.traceLevel
    });
    
    return {
      context: validatedContext,
      tracer
    };
    
  } catch (error) {
    if (ApiError.isApiError(error)) {
      throw error;
    }
    
    throw new ApiError(
      ErrorCodes.CONTEXT_BOOTSTRAP_FAILED,
      'Failed to bootstrap MCP context',
      { 
        originalError: error instanceof Error ? error.message : 'Unknown error',
        url: req.url,
        method: req.method
      },
      500
    );
  }
}

function extractProject(
  headers: Record<string, string>, 
  payload: any, 
  required: boolean, 
  generateMissing: boolean
): string {
  const project = headers.mcpProject || payload.context?.project;
  
  if (!project) {
    if (required) {
      throw new ApiError(
        ErrorCodes.MISSING_REQUIRED_FIELD,
        'Project identifier is required',
        { field: 'project' },
        400
      );
    }
    
    return generateMissing ? 'default-project' : '';
  }
  
  return project;
}

function extractTaskId(
  headers: Record<string, string>, 
  payload: any, 
  required: boolean, 
  generateMissing: boolean
): string {
  const taskId = headers.mcpTaskId || payload.context?.taskId;
  
  if (!taskId) {
    if (required) {
      throw new ApiError(
        ErrorCodes.MISSING_REQUIRED_FIELD,
        'Task ID is required',
        { field: 'taskId' },
        400
      );
    }
    
    return generateMissing ? generateTaskId() : '';
  }
  
  return taskId;
}

function extractPhase(
  headers: Record<string, string>, 
  payload: any, 
  required: boolean, 
  generateMissing: boolean
): string {
  const phase = headers.mcpPhase || payload.context?.phase;
  
  if (!phase) {
    if (required) {
      throw new ApiError(
        ErrorCodes.MISSING_REQUIRED_FIELD,
        'Phase identifier is required',
        { field: 'phase' },
        400
      );
    }
    
    return generateMissing ? 'default-phase' : '';
  }
  
  return phase;
}

function extractSessionId(
  headers: Record<string, string>, 
  generateMissing: boolean
): string {
  const sessionId = headers.mcpSessionId;
  
  if (!sessionId && generateMissing) {
    return generateSessionId();
  }
  
  return sessionId || '';
}

function extractUser(headers: Record<string, string>): string | undefined {
  const authHeader = headers.authorization;
  
  if (!authHeader) {
    return undefined;
  }
  
  // Simple token extraction for v3.1 - no actual auth validation
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    if (token.length > 0) {
      return 'authenticated-user';
    }
  }
  
  return undefined;
}

function extractTraceLevel(headers: Record<string, string>): 'minimal' | 'standard' | 'verbose' {
  const level = headers.mcpTraceLevel;
  
  if (['minimal', 'standard', 'verbose'].includes(level)) {
    return level as 'minimal' | 'standard' | 'verbose';
  }
  
  return 'standard';
}

// Factory functions for different context scenarios
export async function bootstrapTaskValidationContext(
  req: NextRequest,
  payload: any
): Promise<BootstrapResult> {
  return bootstrapContext(req, payload, {
    requireProject: true,
    requirePhase: true,
    requireTaskId: false,
    generateMissingIds: true,
    validateContext: true,
    enableTracing: true
  });
}

export async function bootstrapTaskExecutionContext(
  req: NextRequest,
  payload: any
): Promise<BootstrapResult> {
  return bootstrapContext(req, payload, {
    requireProject: true,
    requirePhase: true,
    requireTaskId: true,
    generateMissingIds: true,
    validateContext: true,
    enableTracing: true
  });
}

export async function bootstrapDevelopmentContext(
  req: NextRequest,
  payload: any
): Promise<BootstrapResult> {
  return bootstrapContext(req, payload, {
    requireProject: false,
    requirePhase: false,
    requireTaskId: false,
    generateMissingIds: true,
    validateContext: false,
    enableTracing: true
  });
}

// Create a no-op tracer for scenarios where tracing is disabled
function createNoOpTracer(context: MCPContextType): TraceLogger {
  return {
    startSpan: () => 'noop',
    endSpan: () => {},
    log: () => {},
    getEvents: () => [],
    getActiveSpans: () => [],
    summary: () => ({
      requestId: context.requestId,
      totalEvents: 0,
      activeSpans: 0,
      errors: 0,
      warnings: 0,
      duration: 0
    })
  } as TraceLogger;
}

export interface ContextValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  context: MCPContextType;
}

export function validateMCPContext(context: any): ContextValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    const validatedContext = MCPContextSchema.parse(context);
    
    // Additional business rule validations
    if (!validatedContext.project || validatedContext.project === 'default-project') {
      warnings.push('Using default project identifier');
    }
    
    if (!validatedContext.phase || validatedContext.phase === 'default-phase') {
      warnings.push('Using default phase identifier');
    }
    
    if (!validatedContext.taskId) {
      warnings.push('No task ID provided');
    }
    
    return {
      isValid: true,
      errors,
      warnings,
      context: validatedContext
    };
    
  } catch (error) {
    if (error instanceof Error) {
      errors.push(error.message);
    } else {
      errors.push('Unknown validation error');
    }
    
    return {
      isValid: false,
      errors,
      warnings,
      context: context as MCPContextType
    };
  }
}