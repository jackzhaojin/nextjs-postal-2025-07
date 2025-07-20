import { describe, it, expect, beforeEach } from '@jest/globals';
import { POST as validatePOST } from '@/app/api/tasks/validate/route';
import { POST as executePOST } from '@/app/api/tasks/execute/route';
import { createMockRequest } from '../setup';
import validPayloads from '../fixtures/valid-payloads.json';
import invalidPayloads from '../fixtures/invalid-payloads.json';

describe('API Task Validation Infrastructure', () => {
  describe('/api/tasks/validate', () => {
    describe('Valid Requests', () => {
      it('should validate basic task validation request', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/tasks/validate',
          'POST',
          validPayloads.taskValidation.basic,
          {
            'Content-Type': 'application/json'
          }
        );

        const response = await validatePOST(request);
        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result.success).toBe(true);
        expect(result.data).toHaveProperty('isValid');
        expect(result.data).toHaveProperty('errors');
        expect(result.data).toHaveProperty('warnings');
        expect(result.data).toHaveProperty('context');
        expect(result.meta).toHaveProperty('requestId');
        expect(result.meta).toHaveProperty('timestamp');
        expect(result.meta).toHaveProperty('processingTime');
      });

      it('should handle request with custom MCP headers', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/tasks/validate',
          'POST',
          validPayloads.taskValidation.withHeaders,
          {
            'Content-Type': 'application/json',
            'X-MCP-Project': 'custom-project',
            'X-MCP-Phase': 'custom-phase',
            'X-MCP-Trace-Level': 'verbose'
          }
        );

        const response = await validatePOST(request);
        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result.success).toBe(true);
        expect(result.data.context.project).toBe('custom-project');
        expect(result.data.context.phase).toBe('custom-phase');
        expect(result.data.context.metadata.traceLevel).toBe('verbose');
      });

      it('should handle minimal payload correctly', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/tasks/validate',
          'POST',
          validPayloads.taskValidation.minimal
        );

        const response = await validatePOST(request);
        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result.success).toBe(true);
        expect(result.data.isValid).toBe(true);
        expect(result.data.context.project).toBe('test-project');
        expect(result.data.context.phase).toBe('test-phase');
      });

      it('should handle complex instruction with metadata', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/tasks/validate',
          'POST',
          validPayloads.taskValidation.complex
        );

        const response = await validatePOST(request);
        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result.success).toBe(true);
        expect(result.data.validationResults).toHaveProperty('instructionAnalysis');
        expect(result.data.validationResults.instructionAnalysis.estimatedComplexity).toBe('high');
        expect(result.data.context.project).toBe('enterprise-modernization');
      });
    });

    describe('Invalid Requests', () => {
      it('should return 422 for missing instruction', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/tasks/validate',
          'POST',
          invalidPayloads.missingInstruction,
          {
            'Content-Type': 'application/json'
          }
        );

        const response = await validatePOST(request);
        const result = await response.json();

        expect(response.status).toBe(422);
        expect(result.success).toBe(false);
        expect(result.error.code).toBe('SCHEMA_VALIDATION_FAILED');
        expect(result.error.details.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'instruction',
              message: expect.stringContaining('Required')
            })
          ])
        );
      });

      it('should return 422 for invalid instruction type', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/tasks/validate',
          'POST',
          invalidPayloads.invalidInstructionType
        );

        const response = await validatePOST(request);
        const result = await response.json();

        expect(response.status).toBe(422);
        expect(result.success).toBe(false);
        expect(result.error.details.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'instruction.type',
              message: expect.stringContaining('Invalid enum value')
            })
          ])
        );
      });

      it('should return 422 for empty instruction input', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/tasks/validate',
          'POST',
          invalidPayloads.emptyInstructionInput
        );

        const response = await validatePOST(request);
        const result = await response.json();

        expect(response.status).toBe(422);
        expect(result.success).toBe(false);
        expect(result.error.details.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'instruction.input',
              message: expect.stringContaining('String must contain at least 1 character')
            })
          ])
        );
      });

      it('should return 400 for malformed JSON', async () => {
        const request = {
          url: 'http://localhost:3000/api/tasks/validate',
          method: 'POST',
          headers: {
            get: (name: string) => name === 'content-type' ? 'application/json' : null
          },
          json: async () => {
            throw new Error('Unexpected token');
          }
        } as any;

        const response = await validatePOST(request);
        const result = await response.json();

        expect(response.status).toBe(400);
        expect(result.success).toBe(false);
        expect(result.error.code).toBe('REQUEST_PARSE_ERROR');
      });

      it('should return 400 for invalid content type', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/tasks/validate',
          'POST',
          validPayloads.taskValidation.basic,
          {
            'Content-Type': 'text/plain'
          }
        );

        const response = await validatePOST(request);
        const result = await response.json();

        expect(response.status).toBe(400);
        expect(result.success).toBe(false);
        expect(result.error.code).toBe('INVALID_CONTENT_TYPE');
      });
    });
  });

  describe('/api/tasks/execute', () => {
    describe('Valid Requests', () => {
      it('should execute basic task execution request', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/tasks/execute',
          'POST',
          validPayloads.taskExecution.basic
        );

        const response = await executePOST(request);
        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result.success).toBe(true);
        expect(result.data).toHaveProperty('status');
        expect(result.data).toHaveProperty('taskId');
        expect(result.data).toHaveProperty('message');
        expect(result.data.status).toBe('completed');
        expect(result.data.taskId).toBe('task_12345');
      });

      it('should handle async execution request', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/tasks/execute',
          'POST',
          validPayloads.taskExecution.async
        );

        const response = await executePOST(request);
        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result.success).toBe(true);
        expect(result.data.status).toBe('completed');
        expect(result.data.result).toHaveProperty('scaffoldingVersion');
        expect(result.data.resourceUsage).toHaveProperty('duration');
      });

      it('should generate task ID when not provided', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/tasks/execute',
          'POST',
          validPayloads.taskExecution.quickValidation
        );

        const response = await executePOST(request);
        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result.success).toBe(true);
        expect(result.data.taskId).toMatch(/^task_/);
        expect(result.data.result.contextSummary.taskId).toMatch(/^task_/);
      });

      it('should handle code generation with complex metadata', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/tasks/execute',
          'POST',
          validPayloads.taskExecution.codeGeneration
        );

        const response = await executePOST(request);
        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result.success).toBe(true);
        expect(result.data.result.executionDetails.complexity).toBe('moderate');
        expect(result.data.result.instructionSummary.metadata).toHaveProperty('framework');
        expect(result.data.resourceUsage).toHaveProperty('cpu');
        expect(result.data.resourceUsage).toHaveProperty('memory');
      });
    });

    describe('Invalid Requests', () => {
      it('should return 422 for missing context', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/tasks/execute',
          'POST',
          invalidPayloads.missingContext
        );

        const response = await executePOST(request);
        const result = await response.json();

        expect(response.status).toBe(422);
        expect(result.success).toBe(false);
        expect(result.error.code).toBe('SCHEMA_VALIDATION_FAILED');
      });

      it('should return 422 for invalid timeout values', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/tasks/execute',
          'POST',
          invalidPayloads.invalidTimeout
        );

        const response = await executePOST(request);
        const result = await response.json();

        expect(response.status).toBe(422);
        expect(result.success).toBe(false);
        expect(result.error.details.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'options.timeout',
              message: expect.stringContaining('Number must be greater than or equal to 1000')
            })
          ])
        );
      });
    });
  });

  describe('Cross-endpoint Validation', () => {
    it('should maintain consistent context structure across endpoints', async () => {
      const payload = validPayloads.taskValidation.basic;
      
      const validateRequest = createMockRequest(
        'http://localhost:3000/api/tasks/validate',
        'POST',
        payload,
        {
          'X-MCP-Project': 'consistent-project',
          'X-MCP-Phase': 'consistent-phase'
        }
      );

      const executeRequest = createMockRequest(
        'http://localhost:3000/api/tasks/execute',
        'POST',
        {
          ...payload,
          context: {
            ...payload.context,
            taskId: 'consistent-task-id'
          }
        },
        {
          'X-MCP-Project': 'consistent-project',
          'X-MCP-Phase': 'consistent-phase'
        }
      );

      const [validateResponse, executeResponse] = await Promise.all([
        validatePOST(validateRequest),
        executePOST(executeRequest)
      ]);

      const validateResult = await validateResponse.json();
      const executeResult = await executeResponse.json();

      expect(validateResult.data.context.project).toBe(executeResult.data.result.contextSummary.project);
      expect(validateResult.data.context.phase).toBe(executeResult.data.result.contextSummary.phase);
    });

    it('should handle CORS preflight requests', async () => {
      const optionsRequest = createMockRequest(
        'http://localhost:3000/api/tasks/validate',
        'OPTIONS'
      );

      // Import OPTIONS handler from validate route
      const { OPTIONS } = await import('@/app/api/tasks/validate/route');
      const response = await OPTIONS(optionsRequest);

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
      expect(response.headers.get('Access-Control-Allow-Headers')).toContain('X-MCP-');
    });
  });
});