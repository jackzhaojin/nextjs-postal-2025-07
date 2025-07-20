import { describe, it, expect, beforeEach } from '@jest/globals';
import { 
  bootstrapContext,
  bootstrapTaskValidationContext,
  bootstrapTaskExecutionContext,
  validateMCPContext
} from '@/lib/api/middleware/context-bootstrap';
import { createMockRequest } from '../setup';
import contextSamples from '../fixtures/context-samples.json';

describe('Context Bootstrap Middleware', () => {
  describe('bootstrapContext', () => {
    it('should bootstrap context from headers', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/test',
        'POST',
        {},
        {
          'X-MCP-Project': 'header-project',
          'X-MCP-Phase': 'header-phase',
          'X-MCP-Task-ID': 'header-task-id',
          'X-MCP-Session-ID': 'header-session-id',
          'X-MCP-Trace-Level': 'verbose'
        }
      );

      const { context, tracer } = await bootstrapContext(request, {});

      expect(context.project).toBe('header-project');
      expect(context.phase).toBe('header-phase');
      expect(context.taskId).toBe('header-task-id');
      expect(context.metadata.sessionId).toBe('header-session-id');
      expect(context.metadata.traceLevel).toBe('verbose');
      expect(context.requestId).toMatch(/^req_/);
      expect(tracer).toBeDefined();
    });

    it('should bootstrap context from payload when headers are missing', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/test',
        'POST',
        {
          context: {
            project: 'payload-project',
            phase: 'payload-phase',
            taskId: 'payload-task-id'
          }
        }
      );

      const { context } = await bootstrapContext(request, {
        context: {
          project: 'payload-project',
          phase: 'payload-phase',
          taskId: 'payload-task-id'
        }
      });

      expect(context.project).toBe('payload-project');
      expect(context.phase).toBe('payload-phase');
      expect(context.taskId).toBe('payload-task-id');
    });

    it('should generate default values when generateMissingIds is true', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/test',
        'POST',
        {}
      );

      const { context } = await bootstrapContext(request, {}, {
        generateMissingIds: true
      });

      expect(context.project).toBe('default-project');
      expect(context.phase).toBe('default-phase');
      expect(context.taskId).toMatch(/^task_/);
      expect(context.metadata.sessionId).toMatch(/^session_/);
    });

    it('should extract user from authorization header', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/test',
        'POST',
        {},
        {
          'Authorization': 'Bearer valid-token',
          'X-MCP-Project': 'auth-project',
          'X-MCP-Phase': 'auth-phase'
        }
      );

      const { context } = await bootstrapContext(request, {});

      expect(context.metadata.user).toBe('authenticated-user');
    });

    it('should validate trace level and default to standard', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/test',
        'POST',
        {},
        {
          'X-MCP-Project': 'test-project',
          'X-MCP-Phase': 'test-phase',
          'X-MCP-Trace-Level': 'invalid-level'
        }
      );

      const { context } = await bootstrapContext(request, {});

      expect(context.metadata.traceLevel).toBe('standard');
    });
  });

  describe('Factory Functions', () => {
    it('should create validation context with appropriate requirements', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/tasks/validate',
        'POST',
        {
          context: {
            project: 'validation-project',
            phase: 'validation-phase'
          }
        }
      );

      const { context } = await bootstrapTaskValidationContext(request, {
        context: {
          project: 'validation-project',
          phase: 'validation-phase'
        }
      });

      expect(context.project).toBe('validation-project');
      expect(context.phase).toBe('validation-phase');
      expect(context.taskId).toMatch(/^task_/); // Generated
    });

    it('should create execution context with task ID requirement', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/tasks/execute',
        'POST',
        {
          context: {
            project: 'execution-project',
            phase: 'execution-phase',
            taskId: 'execution-task-id'
          }
        }
      );

      const { context } = await bootstrapTaskExecutionContext(request, {
        context: {
          project: 'execution-project',
          phase: 'execution-phase',
          taskId: 'execution-task-id'
        }
      });

      expect(context.project).toBe('execution-project');
      expect(context.phase).toBe('execution-phase');
      expect(context.taskId).toBe('execution-task-id');
    });
  });

  describe('Error Handling', () => {
    it('should throw ApiError when required project is missing', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/test',
        'POST',
        {}
      );

      await expect(
        bootstrapContext(request, {}, {
          requireProject: true,
          generateMissingIds: false
        })
      ).rejects.toThrow('Project identifier is required');
    });

    it('should throw ApiError when required phase is missing', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/test',
        'POST',
        {
          context: {
            project: 'test-project'
          }
        }
      );

      await expect(
        bootstrapContext(request, { context: { project: 'test-project' } }, {
          requirePhase: true,
          generateMissingIds: false
        })
      ).rejects.toThrow('Phase identifier is required');
    });

    it('should throw ApiError when required task ID is missing', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/test',
        'POST',
        {
          context: {
            project: 'test-project',
            phase: 'test-phase'
          }
        }
      );

      await expect(
        bootstrapContext(request, { 
          context: { 
            project: 'test-project', 
            phase: 'test-phase' 
          } 
        }, {
          requireTaskId: true,
          generateMissingIds: false
        })
      ).rejects.toThrow('Task ID is required');
    });
  });

  describe('Context Validation', () => {
    it('should validate valid MCP context', () => {
      const validContext = {
        project: 'test-project',
        taskId: 'test-task-id',
        phase: 'test-phase',
        requestId: 'test-request-id',
        metadata: {
          timestamp: '2025-07-20T12:00:00.000Z',
          traceLevel: 'standard'
        }
      };

      const result = validateMCPContext(validContext);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.context.project).toBe('test-project');
    });

    it('should detect invalid MCP context', () => {
      const invalidContext = {
        project: 'test-project',
        // Missing required fields
        metadata: {
          timestamp: 'invalid-date'
        }
      };

      const result = validateMCPContext(invalidContext);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should generate warnings for default values', () => {
      const contextWithDefaults = {
        project: 'default-project',
        taskId: 'test-task-id',
        phase: 'default-phase',
        requestId: 'test-request-id',
        metadata: {
          timestamp: '2025-07-20T12:00:00.000Z',
          traceLevel: 'standard'
        }
      };

      const result = validateMCPContext(contextWithDefaults);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toEqual(
        expect.arrayContaining([
          expect.stringContaining('default project'),
          expect.stringContaining('default phase')
        ])
      );
    });
  });

  describe('Tracing Integration', () => {
    it('should create tracer with context information', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/test',
        'POST',
        {},
        {
          'X-MCP-Project': 'trace-project',
          'X-MCP-Phase': 'trace-phase',
          'X-MCP-Trace-Level': 'verbose'
        }
      );

      const { tracer } = await bootstrapContext(request, {});

      expect(tracer).toBeDefined();
      expect(typeof tracer.startSpan).toBe('function');
      expect(typeof tracer.endSpan).toBe('function');
      expect(typeof tracer.log).toBe('function');
      expect(typeof tracer.summary).toBe('function');
    });

    it('should create no-op tracer when tracing is disabled', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/test',
        'POST',
        {}
      );

      const { tracer } = await bootstrapContext(request, {}, {
        enableTracing: false
      });

      const summary = tracer.summary();
      expect(summary.totalEvents).toBe(0);
      expect(summary.activeSpans).toBe(0);
    });

    it('should log context bootstrap for non-minimal trace levels', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      const request = createMockRequest(
        'http://localhost:3000/api/test',
        'POST',
        {},
        {
          'X-MCP-Project': 'logged-project',
          'X-MCP-Phase': 'logged-phase',
          'X-MCP-Trace-Level': 'standard'
        }
      );

      await bootstrapContext(request, {});

      expect(consoleSpy).toHaveBeenCalledWith(
        '[MCP Context Bootstrap]',
        expect.objectContaining({
          project: 'logged-project',
          phase: 'logged-phase'
        })
      );

      consoleSpy.mockRestore();
    });

    it('should not log context bootstrap for minimal trace level', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      const request = createMockRequest(
        'http://localhost:3000/api/test',
        'POST',
        {},
        {
          'X-MCP-Project': 'minimal-project',
          'X-MCP-Phase': 'minimal-phase',
          'X-MCP-Trace-Level': 'minimal'
        }
      );

      await bootstrapContext(request, {});

      expect(consoleSpy).not.toHaveBeenCalledWith(
        '[MCP Context Bootstrap]',
        expect.any(Object)
      );

      consoleSpy.mockRestore();
    });
  });
});