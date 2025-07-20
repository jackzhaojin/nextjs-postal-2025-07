import { z } from 'zod';

export const HeadersSchema = z.object({
  contentType: z.string(),
  userAgent: z.string(),
  authorization: z.string(),
  mcpProject: z.string(),
  mcpPhase: z.string(),
  mcpTaskId: z.string(),
  mcpSessionId: z.string(),
  mcpTraceLevel: z.enum(['minimal', 'standard', 'verbose'])
});

export const RequestMetadataSchema = z.object({
  url: z.string(),
  method: z.string(),
  timestamp: z.string(),
  headers: HeadersSchema,
  ip: z.string().optional(),
  userAgent: z.string().optional()
});

export const UserContextSchema = z.object({
  id: z.string().optional(),
  email: z.string().optional(),
  role: z.string().optional(),
  permissions: z.array(z.string()).optional()
});

export const SessionContextSchema = z.object({
  sessionId: z.string(),
  startTime: z.string(),
  lastActivity: z.string(),
  duration: z.number().optional()
});

export const ProjectContextSchema = z.object({
  projectId: z.string(),
  name: z.string(),
  version: z.string().optional(),
  environment: z.enum(['development', 'staging', 'production']).default('development'),
  metadata: z.record(z.string(), z.any()).optional()
});

export const PhaseContextSchema = z.object({
  phaseId: z.string(),
  name: z.string(),
  status: z.enum(['planning', 'active', 'completed', 'cancelled']).default('active'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional()
});

export const TaskContextSchema = z.object({
  taskId: z.string(),
  parentTaskId: z.string().optional(),
  type: z.enum(['code-generation', 'validation', 'analysis', 'transformation']),
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled']).default('pending'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  createdAt: z.string(),
  updatedAt: z.string(),
  metadata: z.record(z.string(), z.any()).optional()
});

export const EnhancedMCPContextSchema = z.object({
  request: RequestMetadataSchema,
  user: UserContextSchema.optional(),
  session: SessionContextSchema,
  project: ProjectContextSchema,
  phase: PhaseContextSchema,
  task: TaskContextSchema,
  tracing: z.object({
    requestId: z.string(),
    traceLevel: z.enum(['minimal', 'standard', 'verbose']),
    parentSpanId: z.string().optional(),
    spanId: z.string()
  })
});

export type HeadersType = z.infer<typeof HeadersSchema>;
export type RequestMetadataType = z.infer<typeof RequestMetadataSchema>;
export type UserContextType = z.infer<typeof UserContextSchema>;
export type SessionContextType = z.infer<typeof SessionContextSchema>;
export type ProjectContextType = z.infer<typeof ProjectContextSchema>;
export type PhaseContextType = z.infer<typeof PhaseContextSchema>;
export type TaskContextType = z.infer<typeof TaskContextSchema>;
export type EnhancedMCPContextType = z.infer<typeof EnhancedMCPContextSchema>;