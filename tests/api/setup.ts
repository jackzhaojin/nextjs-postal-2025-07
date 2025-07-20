// Jest setup for API tests
import { jest } from '@jest/globals';

// Mock Next.js environment variables
if (!process.env.NODE_ENV) {
  (process.env as any).NODE_ENV = 'test';
}

// Mock performance.now for consistent timing in tests
const mockPerformance = {
  now: jest.fn(() => Date.now())
};

// @ts-ignore
global.performance = mockPerformance;

// Mock console methods to reduce test noise (optional)
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Increase timeout for integration tests
jest.setTimeout(10000);

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  // Reset performance.now mock to return increasing values
  let counter = 0;
  (mockPerformance.now as jest.Mock).mockImplementation(() => {
    counter += 100; // Increment by 100ms each call
    return counter;
  });
});

// Global test utilities
export const createMockRequest = (
  url: string,
  method: string = 'POST',
  body?: any,
  headers: Record<string, string> = {}
) => {
  const defaultHeaders: Record<string, string> = {
    'content-type': 'application/json',
    'user-agent': 'jest-test-runner',
    ...headers
  };

  // Mock Next.js Request
  return {
    url,
    method,
    headers: {
      get: (name: string) => defaultHeaders[name.toLowerCase()] || null,
      entries: () => Object.entries(defaultHeaders)
    },
    json: async () => body || {},
    text: async () => JSON.stringify(body || {})
  } as any;
};

export const createMockHeaders = (headers: Record<string, string> = {}) => {
  return {
    get: (name: string) => headers[name.toLowerCase()] || null,
    entries: () => Object.entries(headers),
    forEach: (callback: (value: string, key: string) => void) => {
      Object.entries(headers).forEach(([key, value]) => callback(value, key));
    }
  };
};