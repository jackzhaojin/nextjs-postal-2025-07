import { z } from 'zod';

export const TaskValidationRequest = z.object({
  instruction: z.object({
    input: z.string().min(1, 'Instruction input is required'),
    type: z.enum(['code-generation', 'validation', 'analysis', 'transformation']),
    priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    metadata: z.record(z.string(), z.any()).optional()
  }),
  context: z.object({
    project: z.string().min(1, 'Project identifier is required'),
    phase: z.string().min(1, 'Phase identifier is required'),
    metadata: z.record(z.string(), z.any()).optional()
  }),
  options: z.object({
    validateOnly: z.boolean().default(true),
    skipContextBootstrap: z.boolean().default(false),
    traceLevel: z.enum(['minimal', 'standard', 'verbose']).default('standard')
  }).optional()
});

export const TaskExecutionRequest = z.object({
  instruction: z.object({
    input: z.string().min(1, 'Instruction input is required'),
    type: z.enum(['code-generation', 'validation', 'analysis', 'transformation']),
    priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    metadata: z.record(z.string(), z.any()).optional()
  }),
  context: z.object({
    project: z.string().min(1, 'Project identifier is required'),
    phase: z.string().min(1, 'Phase identifier is required'),
    taskId: z.string().optional(),
    metadata: z.record(z.string(), z.any()).optional()
  }),
  options: z.object({
    async: z.boolean().default(false),
    timeout: z.number().min(1000).max(300000).default(30000), // 30 seconds default
    traceLevel: z.enum(['minimal', 'standard', 'verbose']).default('standard')
  }).optional()
});

export const MCPContextSchema = z.object({
  project: z.string(),
  taskId: z.string(),
  phase: z.string(),
  requestId: z.string(),
  metadata: z.object({
    user: z.string().optional(),
    sessionId: z.string().optional(),
    timestamp: z.string(),
    traceLevel: z.enum(['minimal', 'standard', 'verbose']).default('standard')
  })
});

export const TaskValidationResponse = z.object({
  success: z.boolean(),
  data: z.object({
    isValid: z.boolean(),
    errors: z.array(z.string()),
    warnings: z.array(z.string()),
    context: MCPContextSchema
  }),
  timestamp: z.string(),
  requestId: z.string()
});

export const TaskExecutionResponse = z.object({
  success: z.boolean(),
  data: z.object({
    status: z.enum(['queued', 'processing', 'completed', 'failed']),
    taskId: z.string(),
    message: z.string(),
    result: z.any().optional()
  }),
  timestamp: z.string(),
  requestId: z.string()
});

export const ApiErrorResponse = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
    timestamp: z.string(),
    requestId: z.string().optional()
  })
});

export type TaskValidationRequestType = z.infer<typeof TaskValidationRequest>;
export type TaskExecutionRequestType = z.infer<typeof TaskExecutionRequest>;
export type MCPContextType = z.infer<typeof MCPContextSchema>;
export type TaskValidationResponseType = z.infer<typeof TaskValidationResponse>;
export type TaskExecutionResponseType = z.infer<typeof TaskExecutionResponse>;
export type ApiErrorResponseType = z.infer<typeof ApiErrorResponse>;