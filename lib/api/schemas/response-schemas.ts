import { z } from 'zod';
import { MCPContextSchema } from './task-schemas';

export const StandardApiResponseSchema = z.object({
  success: z.boolean(),
  timestamp: z.string(),
  requestId: z.string(),
  version: z.string().optional()
});

export const SuccessResponseSchema = StandardApiResponseSchema.extend({
  success: z.literal(true),
  data: z.any()
});

export const ErrorResponseSchema = StandardApiResponseSchema.extend({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
    stack: z.string().optional()
  })
});

export const ValidationErrorDetailsSchema = z.object({
  field: z.string(),
  message: z.string(),
  received: z.any().optional(),
  expected: z.any().optional()
});

export const ValidationErrorResponseSchema = ErrorResponseSchema.extend({
  error: z.object({
    code: z.literal('VALIDATION_ERROR'),
    message: z.string(),
    details: z.object({
      errors: z.array(ValidationErrorDetailsSchema)
    }),
    stack: z.string().optional()
  })
});

export const TaskValidationSuccessResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    isValid: z.boolean(),
    errors: z.array(z.string()),
    warnings: z.array(z.string()),
    context: MCPContextSchema,
    validationResults: z.object({
      schemaValid: z.boolean(),
      businessRulesValid: z.boolean(),
      contextValid: z.boolean(),
      details: z.record(z.string(), z.any()).optional()
    }).optional()
  })
});

export const TaskExecutionSuccessResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    status: z.enum(['queued', 'processing', 'completed', 'failed']),
    taskId: z.string(),
    message: z.string(),
    result: z.any().optional(),
    executionTime: z.number().optional(),
    resourceUsage: z.object({
      cpu: z.number().optional(),
      memory: z.number().optional(),
      duration: z.number().optional()
    }).optional()
  })
});

export const HealthCheckResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    status: z.enum(['healthy', 'degraded', 'unhealthy']),
    version: z.string(),
    uptime: z.number(),
    dependencies: z.record(z.string(), z.object({
      status: z.enum(['available', 'unavailable']),
      responseTime: z.number().optional(),
      lastChecked: z.string()
    })).optional()
  })
});

export const PaginationSchema = z.object({
  page: z.number().min(1),
  limit: z.number().min(1).max(100),
  total: z.number(),
  totalPages: z.number(),
  hasNext: z.boolean(),
  hasPrev: z.boolean()
});

export const PaginatedResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    items: z.array(z.any()),
    pagination: PaginationSchema
  })
});

export type StandardApiResponseType = z.infer<typeof StandardApiResponseSchema>;
export type SuccessResponseType = z.infer<typeof SuccessResponseSchema>;
export type ErrorResponseType = z.infer<typeof ErrorResponseSchema>;
export type ValidationErrorDetailsType = z.infer<typeof ValidationErrorDetailsSchema>;
export type ValidationErrorResponseType = z.infer<typeof ValidationErrorResponseSchema>;
export type TaskValidationSuccessResponseType = z.infer<typeof TaskValidationSuccessResponseSchema>;
export type TaskExecutionSuccessResponseType = z.infer<typeof TaskExecutionSuccessResponseSchema>;
export type HealthCheckResponseType = z.infer<typeof HealthCheckResponseSchema>;
export type PaginationType = z.infer<typeof PaginationSchema>;
export type PaginatedResponseType = z.infer<typeof PaginatedResponseSchema>;