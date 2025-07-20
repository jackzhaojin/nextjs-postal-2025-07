import { NextRequest } from 'next/server';
import { validateRequest } from '@/lib/api/middleware/validation';
import { bootstrapTaskValidationContext } from '@/lib/api/middleware/context-bootstrap';
import { handleApiError } from '@/lib/api/middleware/error-handler';
import { createTaskValidationResponse } from '@/lib/api/utils/response-formatter';
import { 
  TaskValidationRequest, 
  TaskValidationRequestType,
  MCPContextType 
} from '@/lib/api/schemas/task-schemas';

export async function POST(request: NextRequest) {
  try {
    // 1. Validate request payload against schema
    const validatedPayload = await validateRequest(TaskValidationRequest)(request);
    
    // 2. Bootstrap MCP context with validation-specific requirements
    const { context, tracer } = await bootstrapTaskValidationContext(request, validatedPayload);
    
    // Start tracing the validation process
    const validationSpan = tracer.startSpan('task_validation', {
      instructionType: validatedPayload.instruction.type,
      priority: validatedPayload.instruction.priority,
      project: context.project,
      phase: context.phase
    });
    
    // 3. Perform task validation logic (stub implementation for 3.1)
    const validationResult = await performTaskValidation(validatedPayload, context, tracer);
    
    // End tracing span
    tracer.endSpan(validationSpan, {
      validationResult: validationResult.isValid,
      errorCount: validationResult.errors.length,
      warningCount: validationResult.warnings.length
    });
    
    // 4. Return structured response using response formatter
    return createTaskValidationResponse(
      validationResult.isValid,
      validationResult.errors,
      validationResult.warnings,
      context,
      validationResult.additionalData
    );
    
  } catch (error) {
    return handleApiError(error, {
      url: request.url,
      method: request.method,
      userAgent: request.headers.get('user-agent') || undefined
    });
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-MCP-*',
      'Access-Control-Max-Age': '86400'
    }
  });
}

// Stub implementation for task validation logic
async function performTaskValidation(
  payload: TaskValidationRequestType,
  context: MCPContextType,
  tracer: any
): Promise<{
  isValid: boolean;
  errors: string[];
  warnings: string[];
  additionalData?: any;
}> {
  tracer.log('info', 'validation_started', {
    instructionLength: payload.instruction.input.length,
    instructionType: payload.instruction.type
  });

  // Basic validation checks for 3.1 scaffolding
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validate instruction content
  if (payload.instruction.input.length < 10) {
    warnings.push('Instruction input is very short, consider providing more detail');
  }
  
  if (payload.instruction.input.length > 10000) {
    errors.push('Instruction input exceeds maximum length of 10,000 characters');
  }
  
  // Validate instruction type compatibility
  const supportedTypes = ['code-generation', 'validation', 'analysis', 'transformation'];
  if (!supportedTypes.includes(payload.instruction.type)) {
    errors.push(`Instruction type '${payload.instruction.type}' is not currently supported`);
  }
  
  // Context validation
  if (context.project === 'default-project') {
    warnings.push('Using default project context - consider specifying a project identifier');
  }
  
  if (context.phase === 'default-phase') {
    warnings.push('Using default phase context - consider specifying a phase identifier');
  }
  
  // Simulate validation processing time
  await new Promise(resolve => setTimeout(resolve, 50));
  
  tracer.log('info', 'validation_completed', {
    isValid: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    additionalData: {
      instructionAnalysis: {
        length: payload.instruction.input.length,
        type: payload.instruction.type,
        priority: payload.instruction.priority,
        estimatedComplexity: calculateInstructionComplexity(payload.instruction.input)
      },
      contextAnalysis: {
        project: context.project,
        phase: context.phase,
        hasTaskId: !!context.taskId,
        traceLevel: context.metadata.traceLevel
      },
      validationTimestamp: new Date().toISOString(),
      version: '3.1.0-scaffolding'
    }
  };
}

// Helper function to estimate instruction complexity
function calculateInstructionComplexity(instruction: string): 'low' | 'medium' | 'high' {
  const length = instruction.length;
  const complexityKeywords = [
    'complex', 'multiple', 'integration', 'advanced', 'sophisticated',
    'enterprise', 'production', 'scalable', 'distributed', 'microservice'
  ];
  
  const hasComplexityKeywords = complexityKeywords.some(keyword => 
    instruction.toLowerCase().includes(keyword)
  );
  
  if (length > 5000 || hasComplexityKeywords) {
    return 'high';
  } else if (length > 1000) {
    return 'medium';
  } else {
    return 'low';
  }
}