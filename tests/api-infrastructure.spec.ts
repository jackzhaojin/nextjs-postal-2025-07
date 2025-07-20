import { test, expect } from '@playwright/test';

test.describe('API Infrastructure - Task 3.1 Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Start the development server
    // Note: This assumes `npm run dev` is running on localhost:3000
  });

  test.describe('POST /api/tasks/validate', () => {
    test('should validate a basic task validation request', async ({ request }) => {
      const validPayload = {
        instruction: {
          input: "Generate a React component for user authentication",
          type: "code-generation",
          priority: "medium",
          metadata: {
            targetFramework: "React",
            outputFormat: "TypeScript"
          }
        },
        context: {
          project: "nextjs-portal-ai",
          phase: "development",
          metadata: {
            feature: "authentication"
          }
        },
        options: {
          validateOnly: true,
          traceLevel: "standard"
        }
      };

      const response = await request.post('http://localhost:3000/api/tasks/validate', {
        data: validPayload,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(response.status()).toBe(200);
      
      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('isValid');
      expect(result.data).toHaveProperty('errors');
      expect(result.data).toHaveProperty('warnings');
      expect(result.data).toHaveProperty('context');
      expect(result.meta).toHaveProperty('requestId');
      expect(result.meta).toHaveProperty('timestamp');
      expect(result.meta).toHaveProperty('processingTime');
    });

    test('should handle custom MCP headers', async ({ request }) => {
      const payload = {
        instruction: {
          input: "Validate API schema for user endpoint",
          type: "validation",
          priority: "high"
        },
        context: {
          project: "api-validation-project",
          phase: "testing"
        }
      };

      const response = await request.post('http://localhost:3000/api/tasks/validate', {
        data: payload,
        headers: {
          'Content-Type': 'application/json',
          'X-MCP-Project': 'custom-project',
          'X-MCP-Phase': 'custom-phase',
          'X-MCP-Trace-Level': 'verbose'
        }
      });

      expect(response.status()).toBe(200);
      
      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data.context.project).toBe('custom-project');
      expect(result.data.context.phase).toBe('custom-phase');
      expect(result.data.context.metadata.traceLevel).toBe('verbose');
    });

    test('should return 422 for missing instruction', async ({ request }) => {
      const invalidPayload = {
        context: {
          project: "test-project",
          phase: "testing"
        }
      };

      const response = await request.post('http://localhost:3000/api/tasks/validate', {
        data: invalidPayload,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(response.status()).toBe(422);
      
      const result = await response.json();
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

    test('should return 422 for invalid instruction type', async ({ request }) => {
      const invalidPayload = {
        instruction: {
          input: "Test input",
          type: "invalid-type"
        },
        context: {
          project: "test-project",
          phase: "testing"
        }
      };

      const response = await request.post('http://localhost:3000/api/tasks/validate', {
        data: invalidPayload,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(response.status()).toBe(422);
      
      const result = await response.json();
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

    test('should return 400 for invalid content type', async ({ request }) => {
      const payload = {
        instruction: {
          input: "Test input",
          type: "validation"
        },
        context: {
          project: "test-project",
          phase: "testing"
        }
      };

      const response = await request.post('http://localhost:3000/api/tasks/validate', {
        data: JSON.stringify(payload),
        headers: {
          'Content-Type': 'text/plain'
        }
      });

      expect(response.status()).toBe(400);
      
      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('INVALID_CONTENT_TYPE');
    });

    test('should handle CORS preflight request', async ({ request }) => {
      const response = await request.fetch('http://localhost:3000/api/tasks/validate', {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:3001',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, X-MCP-Project'
        }
      });

      expect(response.status()).toBe(200);
      expect(response.headers()['access-control-allow-origin']).toBe('*');
      expect(response.headers()['access-control-allow-methods']).toContain('POST');
      expect(response.headers()['access-control-allow-headers']).toContain('X-MCP-');
    });
  });

  test.describe('POST /api/tasks/execute', () => {
    test('should execute a basic task execution request', async ({ request }) => {
      const validPayload = {
        instruction: {
          input: "Transform legacy component to modern React hooks",
          type: "transformation",
          priority: "medium"
        },
        context: {
          project: "legacy-migration",
          phase: "modernization",
          taskId: "task_12345"
        },
        options: {
          async: false,
          timeout: 60000,
          traceLevel: "verbose"
        }
      };

      const response = await request.post('http://localhost:3000/api/tasks/execute', {
        data: validPayload,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(response.status()).toBe(200);
      
      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('status');
      expect(result.data).toHaveProperty('taskId');
      expect(result.data).toHaveProperty('message');
      expect(result.data.status).toBe('completed');
      expect(result.data.taskId).toBe('task_12345');
      expect(result.data.resourceUsage).toHaveProperty('duration');
    });

    test('should generate task ID when not provided', async ({ request }) => {
      const payload = {
        instruction: {
          input: "Validate form component props interface",
          type: "validation",
          priority: "high"
        },
        context: {
          project: "ui-components",
          phase: "validation"
        },
        options: {
          async: false,
          timeout: 5000,
          traceLevel: "standard"
        }
      };

      const response = await request.post('http://localhost:3000/api/tasks/execute', {
        data: payload,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(response.status()).toBe(200);
      
      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data.taskId).toMatch(/^task_/);
      expect(result.data.result.contextSummary.taskId).toMatch(/^task_/);
    });

    test('should return 422 for missing context', async ({ request }) => {
      const invalidPayload = {
        instruction: {
          input: "Test input",
          type: "code-generation"
        }
      };

      const response = await request.post('http://localhost:3000/api/tasks/execute', {
        data: invalidPayload,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(response.status()).toBe(422);
      
      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('SCHEMA_VALIDATION_FAILED');
    });

    test('should return 422 for invalid timeout values', async ({ request }) => {
      const invalidPayload = {
        instruction: {
          input: "Test instruction",
          type: "validation"
        },
        context: {
          project: "test-project",
          phase: "testing"
        },
        options: {
          timeout: 500  // Too small, minimum is 1000
        }
      };

      const response = await request.post('http://localhost:3000/api/tasks/execute', {
        data: invalidPayload,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(response.status()).toBe(422);
      
      const result = await response.json();
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

  test.describe('Cross-endpoint Validation', () => {
    test('should maintain consistent context structure across endpoints', async ({ request }) => {
      const payload = {
        instruction: {
          input: "Generate a React component for user authentication",
          type: "code-generation",
          priority: "medium"
        },
        context: {
          project: "nextjs-portal-ai",
          phase: "development"
        }
      };

      const headers = {
        'Content-Type': 'application/json',
        'X-MCP-Project': 'consistent-project',
        'X-MCP-Phase': 'consistent-phase'
      };

      const [validateResponse, executeResponse] = await Promise.all([
        request.post('http://localhost:3000/api/tasks/validate', {
          data: payload,
          headers
        }),
        request.post('http://localhost:3000/api/tasks/execute', {
          data: {
            ...payload,
            context: {
              ...payload.context,
              taskId: 'consistent-task-id'
            }
          },
          headers
        })
      ]);

      expect(validateResponse.status()).toBe(200);
      expect(executeResponse.status()).toBe(200);

      const validateResult = await validateResponse.json();
      const executeResult = await executeResponse.json();

      expect(validateResult.data.context.project).toBe(executeResult.data.result.contextSummary.project);
      expect(validateResult.data.context.phase).toBe(executeResult.data.result.contextSummary.phase);
    });
  });

  test.describe('Error Handling and Resilience', () => {
    test('should handle malformed JSON gracefully', async ({ request }) => {
      const response = await request.post('http://localhost:3000/api/tasks/validate', {
        data: '{ invalid json }',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(response.status()).toBe(400);
      
      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('REQUEST_PARSE_ERROR');
    });

    test('should include proper error metadata', async ({ request }) => {
      const invalidPayload = {
        instruction: {
          input: "",  // Empty string should fail validation
          type: "validation"
        },
        context: {
          project: "test-project",
          phase: "testing"
        }
      };

      const response = await request.post('http://localhost:3000/api/tasks/validate', {
        data: invalidPayload,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(response.status()).toBe(422);
      
      const result = await response.json();
      expect(result.error).toHaveProperty('code');
      expect(result.error).toHaveProperty('message');
      expect(result.error).toHaveProperty('details');
      expect(result.meta).toHaveProperty('requestId');
      expect(result.meta).toHaveProperty('timestamp');
      
      // Check that response headers include proper values
      expect(response.headers()['content-type']).toContain('application/json');
      expect(response.headers()['x-error-code']).toBe('SCHEMA_VALIDATION_FAILED');
      expect(response.headers()['x-request-id']).toMatch(/^req_/);
    });
  });
});