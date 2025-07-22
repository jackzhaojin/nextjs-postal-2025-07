// localStorage utilities for B2B Shipping Transport System
// Provides safe localStorage operations with error handling and data validation

import { ShippingTransaction, StorageError, StorageResult } from './types';

// Storage configuration
const STORAGE_KEY = 'currentShippingTransaction';
const VERSION_KEY = 'shippingTransactionVersion';
const CURRENT_VERSION = '1.0';
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB limit

/**
 * Main localStorage manager for shipping transactions
 */
export class ShippingTransactionManager {
  private static readonly STORAGE_KEY = STORAGE_KEY;

  /**
   * Save shipping transaction to localStorage with error handling
   */
  static save(transaction: Partial<ShippingTransaction>): StorageResult<ShippingTransaction> {
    try {
      const existing = this.load();
      const updated: ShippingTransaction = {
        ...existing.data,
        ...transaction,
        timestamp: new Date(),
        id: existing.data?.id || this.generateId(),
      } as ShippingTransaction;

      // Validate data before storage
      const validationResult = this.validateTransaction(updated);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: {
            code: 'PARSE_ERROR',
            message: `Invalid transaction data: ${validationResult.errors.join(', ')}`,
          },
        };
      }

      // Check storage size
      const serialized = JSON.stringify(updated);
      if (serialized.length > MAX_STORAGE_SIZE) {
        return {
          success: false,
          error: {
            code: 'QUOTA_EXCEEDED',
            message: 'Transaction data exceeds maximum storage size',
          },
        };
      }

      // Save to localStorage
      localStorage.setItem(this.STORAGE_KEY, serialized);
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);

      return {
        success: true,
        data: updated,
      };
    } catch (error) {
      return this.handleStorageError(error);
    }
  }

  /**
   * Load shipping transaction from localStorage with error handling
   */
  static load(): StorageResult<ShippingTransaction | null> {
    try {
      if (!this.isStorageAvailable()) {
        return {
          success: false,
          error: {
            code: 'NOT_AVAILABLE',
            message: 'localStorage is not available',
          },
        };
      }

      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) {
        return {
          success: true,
          data: null,
        };
      }

      // Check version compatibility
      const version = localStorage.getItem(VERSION_KEY);
      if (version && version !== CURRENT_VERSION) {
        const migrationResult = this.migrateData(data, version);
        if (!migrationResult.success) {
          return migrationResult;
        }
        return {
          success: true,
          data: migrationResult.data,
        };
      }

      const parsed = JSON.parse(data);
      
      // Convert timestamp string back to Date object
      if (parsed.timestamp && typeof parsed.timestamp === 'string') {
        parsed.timestamp = new Date(parsed.timestamp);
      }
      
      // Data sanitization: ensure country codes are in correct format
      if (parsed.shipmentDetails) {
        if (parsed.shipmentDetails.origin?.country === 'USA') {
          parsed.shipmentDetails.origin.country = 'US';
        }
        if (parsed.shipmentDetails.destination?.country === 'USA') {
          parsed.shipmentDetails.destination.country = 'US';
        }
      }

      return {
        success: true,
        data: parsed,
      };
    } catch (error) {
      return this.handleStorageError(error);
    }
  }

  /**
   * Clear shipping transaction from localStorage
   */
  static clear(): StorageResult<boolean> {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(VERSION_KEY);
      return {
        success: true,
        data: true,
      };
    } catch (error) {
      return this.handleStorageError(error);
    }
  }

  /**
   * Update transaction status
   */
  static updateStatus(status: ShippingTransaction['status']): StorageResult<ShippingTransaction> {
    const existing = this.load();
    if (!existing.success || !existing.data) {
      return {
        success: false,
        error: {
          code: 'PARSE_ERROR',
          message: 'No existing transaction to update',
        },
      };
    }

    return this.save({
      ...existing.data,
      status,
    });
  }

  /**
   * Get current storage usage
   */
  static getStorageInfo(): {
    used: number;
    available: number;
    percentage: number;
  } {
    const data = localStorage.getItem(this.STORAGE_KEY);
    const used = data ? new Blob([data]).size : 0;
    const available = MAX_STORAGE_SIZE - used;
    const percentage = (used / MAX_STORAGE_SIZE) * 100;

    return {
      used,
      available,
      percentage,
    };
  }

  /**
   * Check if localStorage is available
   */
  static isStorageAvailable(): boolean {
    try {
      const test = 'localStorage-test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate unique ID for transaction
   */
  private static generateId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Basic validation for transaction data
   */
  private static validateTransaction(transaction: ShippingTransaction): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!transaction.id) {
      errors.push('Missing transaction ID');
    }

    if (!transaction.timestamp) {
      errors.push('Missing timestamp');
    }

    if (!transaction.status) {
      errors.push('Missing status');
    }

    const validStatuses = ['draft', 'pricing', 'payment', 'pickup', 'review', 'confirmed'];
    if (transaction.status && !validStatuses.includes(transaction.status)) {
      errors.push('Invalid status');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Handle storage errors consistently
   */
  private static handleStorageError(error: unknown): StorageResult<any> {
    if (error instanceof Error) {
      if (error.name === 'QuotaExceededError') {
        return {
          success: false,
          error: {
            code: 'QUOTA_EXCEEDED',
            message: 'localStorage quota exceeded',
            originalError: error,
          },
        };
      }

      if (error instanceof SyntaxError) {
        return {
          success: false,
          error: {
            code: 'PARSE_ERROR',
            message: 'Failed to parse stored data',
            originalError: error,
          },
        };
      }
    }

    return {
      success: false,
      error: {
        code: 'UNKNOWN',
        message: 'Unknown storage error occurred',
        originalError: error instanceof Error ? error : new Error(String(error)),
      },
    };
  }

  /**
   * Migrate data from previous versions
   */
  private static migrateData(data: string, fromVersion: string): StorageResult<ShippingTransaction | null> {
    try {
      const parsed = JSON.parse(data);
      
      // Migration logic for country codes: USA -> US
      if (parsed.shipmentDetails) {
        if (parsed.shipmentDetails.origin?.country === 'USA') {
          parsed.shipmentDetails.origin.country = 'US';
        }
        if (parsed.shipmentDetails.destination?.country === 'USA') {
          parsed.shipmentDetails.destination.country = 'US';
        }
      }
      
      // Update version after successful migration
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
      
      return {
        success: true,
        data: parsed,
      };
    } catch (error) {
      return this.handleStorageError(error);
    }
  }
}

/**
 * Generic localStorage utility functions
 */
export class LocalStorageUtil {
  /**
   * Safe JSON parsing with error handling
   */
  static safeJsonParse<T>(data: string | null): StorageResult<T | null> {
    if (!data) {
      return {
        success: true,
        data: null,
      };
    }

    try {
      const parsed = JSON.parse(data);
      return {
        success: true,
        data: parsed,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PARSE_ERROR',
          message: 'Failed to parse JSON data',
          originalError: error instanceof Error ? error : new Error(String(error)),
        },
      };
    }
  }

  /**
   * Safe localStorage setItem with size checking
   */
  static safeSetItem(key: string, value: string): StorageResult<boolean> {
    try {
      if (value.length > MAX_STORAGE_SIZE) {
        return {
          success: false,
          error: {
            code: 'QUOTA_EXCEEDED',
            message: 'Data exceeds maximum storage size',
          },
        };
      }

      localStorage.setItem(key, value);
      return {
        success: true,
        data: true,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        return {
          success: false,
          error: {
            code: 'QUOTA_EXCEEDED',
            message: 'localStorage quota exceeded',
            originalError: error,
          },
        };
      }

      return {
        success: false,
        error: {
          code: 'UNKNOWN',
          message: 'Failed to save data',
          originalError: error instanceof Error ? error : new Error(String(error)),
        },
      };
    }
  }

  /**
   * Safe localStorage getItem
   */
  static safeGetItem(key: string): StorageResult<string | null> {
    try {
      const data = localStorage.getItem(key);
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN',
          message: 'Failed to retrieve data',
          originalError: error instanceof Error ? error : new Error(String(error)),
        },
      };
    }
  }

  /**
   * Compress data for storage (simple implementation)
   */
  static compressData(data: string): string {
    // Simple compression: remove unnecessary whitespace from JSON
    try {
      const parsed = JSON.parse(data);
      return JSON.stringify(parsed);
    } catch {
      return data;
    }
  }

  /**
   * Monitor storage usage
   */
  static getStorageUsage(): {
    total: number;
    used: number;
    available: number;
    percentage: number;
  } {
    let used = 0;
    
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }

    return {
      total: MAX_STORAGE_SIZE,
      used,
      available: MAX_STORAGE_SIZE - used,
      percentage: (used / MAX_STORAGE_SIZE) * 100,
    };
  }

  /**
   * Clean up old data and fix country code format
   */
  static cleanup(): StorageResult<boolean> {
    try {
      // Load current data
      const existing = ShippingTransactionManager.load();
      if (existing.success && existing.data) {
        // Force save to trigger data sanitization
        const cleanupResult = ShippingTransactionManager.save(existing.data);
        if (!cleanupResult.success) {
          return {
            success: false,
            error: cleanupResult.error,
          };
        }
      }
      
      // Future implementation: remove old transaction data, temporary data, etc.
      // For now, just return success
      return {
        success: true,
        data: true,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN',
          message: 'Cleanup failed',
          originalError: error instanceof Error ? error : new Error(String(error)),
        },
      };
    }
  }
}

/**
 * Data validation utilities for localStorage data
 */
export class StorageValidator {
  /**
   * Validate that stored data matches expected interface
   */
  static validateShippingTransaction(data: any): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data) {
      errors.push('No data provided');
      return { isValid: false, errors, warnings };
    }

    // Required fields
    if (!data.id) errors.push('Missing transaction ID');
    if (!data.timestamp) errors.push('Missing timestamp');
    if (!data.status) errors.push('Missing status');

    // Status validation
    const validStatuses = ['draft', 'pricing', 'payment', 'pickup', 'review', 'confirmed'];
    if (data.status && !validStatuses.includes(data.status)) {
      errors.push(`Invalid status: ${data.status}`);
    }

    // Timestamp validation
    if (data.timestamp) {
      const timestamp = new Date(data.timestamp);
      if (isNaN(timestamp.getTime())) {
        errors.push('Invalid timestamp format');
      }
    }

    // Optional field warnings
    if (data.status !== 'draft' && !data.shipmentDetails) {
      warnings.push('Missing shipment details for non-draft transaction');
    }

    if (data.status === 'confirmed' && !data.confirmationNumber) {
      warnings.push('Missing confirmation number for confirmed transaction');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Sanitize data before storage
   */
  static sanitizeData(data: any): any {
    // Remove any potentially problematic data
    const sanitized = { ...data };

    // Remove functions, undefined values, etc.
    return JSON.parse(JSON.stringify(sanitized));
  }
}

// Default export for convenience
export default ShippingTransactionManager;