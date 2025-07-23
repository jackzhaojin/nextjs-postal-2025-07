// Payment Transaction State Management Hook
// Task 6.1: Payment Method Selection - React Hook for payment state

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { 
  EnhancedPaymentInfo, 
  PaymentMethodType, 
  PaymentValidationError,
  MonetaryAmount,
  PaymentFormState,
  PaymentFormAction
} from '../types';
import { 
  savePaymentToStorage, 
  loadPaymentFromStorage, 
  isPaymentMethodComplete,
  calculatePaymentMethodFees,
  calculateTotalWithFees,
  createPaymentError
} from '../utils';
import { validatePaymentMethodByType } from '../validation';

interface UsePaymentTransactionOptions {
  shipmentTotal: MonetaryAmount;
  onPaymentComplete?: (paymentInfo: EnhancedPaymentInfo) => void;
  onValidationError?: (errors: PaymentValidationError[]) => void;
  autoSave?: boolean;
  debounceMs?: number;
}

interface UsePaymentTransactionReturn {
  // State
  paymentInfo: EnhancedPaymentInfo | null;
  formState: PaymentFormState;
  isLoading: boolean;
  isValidating: boolean;
  isComplete: boolean;
  
  // Actions
  selectPaymentMethod: (method: PaymentMethodType) => void;
  updatePaymentInfo: (updates: Partial<EnhancedPaymentInfo>) => void;
  validatePaymentMethod: () => Promise<boolean>;
  resetPaymentInfo: () => void;
  
  // Calculated values
  totalWithFees: MonetaryAmount | null;
  paymentMethodFees: any[];
  validationErrors: PaymentValidationError[];
  
  // Utilities
  canProceed: boolean;
  isDirty: boolean;
}

export function usePaymentTransaction(options: UsePaymentTransactionOptions): UsePaymentTransactionReturn {
  const {
    shipmentTotal,
    onPaymentComplete,
    onValidationError,
    autoSave = true,
    debounceMs = 300
  } = options;

  console.log('Initializing usePaymentTransaction hook:', options);

  // Core state
  const [paymentInfo, setPaymentInfo] = useState<EnhancedPaymentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<PaymentValidationError[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  // Form state derived from payment info
  const formState: PaymentFormState = useMemo(() => {
    const errorsByField: Record<string, PaymentValidationError[]> = {};
    validationErrors.forEach(error => {
      if (!errorsByField[error.field]) errorsByField[error.field] = [];
      errorsByField[error.field].push(error);
    });

    return {
      selectedMethod: paymentInfo?.method || null,
      formData: paymentInfo || {},
      validationErrors: errorsByField,
      isSubmitting: false,
      isValidating,
      isDirty,
      completedSections: paymentInfo ? [paymentInfo.method] : []
    };
  }, [paymentInfo, validationErrors, isValidating, isDirty]);

  // Load payment info from storage on mount
  useEffect(() => {
    console.log('Loading payment info from storage...');
    setIsLoading(true);
    
    try {
      const savedPayment = loadPaymentFromStorage();
      if (savedPayment) {
        console.log('Loaded payment info from storage:', savedPayment);
        setPaymentInfo(savedPayment);
      }
    } catch (error) {
      console.error('Failed to load payment info from storage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-save with debouncing
  useEffect(() => {
    if (!autoSave || !paymentInfo || !isDirty) return;

    console.log('Auto-saving payment info...');
    const timeoutId = setTimeout(() => {
      try {
        savePaymentToStorage(paymentInfo);
        setIsDirty(false);
        console.log('Payment info auto-saved successfully');
      } catch (error) {
        console.error('Failed to auto-save payment info:', error);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [paymentInfo, isDirty, autoSave, debounceMs]);

  // Calculate payment method fees
  const paymentMethodFees = useMemo(() => {
    if (!paymentInfo?.method) return [];
    return calculatePaymentMethodFees(paymentInfo.method, shipmentTotal);
  }, [paymentInfo?.method, shipmentTotal]);

  // Calculate total with fees
  const totalWithFees = useMemo(() => {
    if (!paymentMethodFees.length) return shipmentTotal;
    const result = calculateTotalWithFees(shipmentTotal, paymentMethodFees);
    return result.total;
  }, [shipmentTotal, paymentMethodFees]);

  // Check if payment method is complete
  const isComplete = useMemo(() => {
    if (!paymentInfo?.method) return false;
    return isPaymentMethodComplete(paymentInfo.method, paymentInfo);
  }, [paymentInfo]);

  // Check if can proceed to next step
  const canProceed = useMemo(() => {
    return isComplete && validationErrors.filter(e => e.severity === 'error').length === 0;
  }, [isComplete, validationErrors]);

  // Select payment method
  const selectPaymentMethod = useCallback((method: PaymentMethodType) => {
    console.log('Selecting payment method:', method);
    
    const newPaymentInfo: EnhancedPaymentInfo = {
      method,
      validationStatus: {
        isValid: false,
        isComplete: false,
        isVerified: false,
        errors: [],
        lastValidated: new Date().toISOString()
      },
      lastUpdated: new Date().toISOString(),
      totalWithPaymentFees: totalWithFees,
      paymentMethodFees
    };

    setPaymentInfo(newPaymentInfo);
    setValidationErrors([]);
    setIsDirty(true);
  }, [totalWithFees, paymentMethodFees]);

  // Update payment info
  const updatePaymentInfo = useCallback((updates: Partial<EnhancedPaymentInfo>) => {
    console.log('Updating payment info:', updates);
    
    setPaymentInfo(prev => {
      if (!prev) return null;
      
      const updated = {
        ...prev,
        ...updates,
        lastUpdated: new Date().toISOString(),
        totalWithPaymentFees: totalWithFees,
        paymentMethodFees
      };
      
      return updated;
    });
    
    setIsDirty(true);
  }, [totalWithFees, paymentMethodFees]);

  // Validate payment method
  const validatePaymentMethod = useCallback(async (): Promise<boolean> => {
    if (!paymentInfo?.method) {
      console.warn('No payment method selected for validation');
      return false;
    }

    console.log('Validating payment method:', paymentInfo.method);
    setIsValidating(true);

    try {
      const validationResult = validatePaymentMethodByType(
        paymentInfo.method,
        paymentInfo,
        shipmentTotal
      );

      const errors: PaymentValidationError[] = validationResult.errors.map((error: any) => ({
        field: Array.isArray(error.path) ? error.path.join('.') : error.path || 'unknown',
        code: error.code || 'VALIDATION_ERROR',
        message: error.message || 'Validation failed',
        severity: 'error' as const
      }));

      setValidationErrors(errors);

      // Update validation status in payment info
      const updatedPaymentInfo = {
        ...paymentInfo,
        validationStatus: {
          isValid: validationResult.isValid,
          isComplete: isPaymentMethodComplete(paymentInfo.method, paymentInfo),
          isVerified: validationResult.isValid,
          errors,
          lastValidated: new Date().toISOString()
        },
        lastUpdated: new Date().toISOString()
      };

      setPaymentInfo(updatedPaymentInfo);

      if (errors.length > 0 && onValidationError) {
        onValidationError(errors);
      }

      if (validationResult.isValid && onPaymentComplete) {
        onPaymentComplete(updatedPaymentInfo);
      }

      console.log('Validation completed:', { isValid: validationResult.isValid, errors });
      return validationResult.isValid;

    } catch (error) {
      console.error('Payment validation failed:', error);
      
      const validationError: PaymentValidationError = {
        field: 'general',
        code: 'VALIDATION_FAILED',
        message: error instanceof Error ? error.message : 'Validation failed',
        severity: 'error'
      };

      setValidationErrors([validationError]);
      
      if (onValidationError) {
        onValidationError([validationError]);
      }

      return false;
    } finally {
      setIsValidating(false);
    }
  }, [paymentInfo, shipmentTotal, onPaymentComplete, onValidationError]);

  // Reset payment info
  const resetPaymentInfo = useCallback(() => {
    console.log('Resetting payment info');
    setPaymentInfo(null);
    setValidationErrors([]);
    setIsDirty(false);
    
    try {
      localStorage.removeItem('currentShippingTransaction');
    } catch (error) {
      console.error('Failed to clear payment info from storage:', error);
    }
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('Payment transaction state updated:', {
      hasPaymentInfo: !!paymentInfo,
      method: paymentInfo?.method,
      isComplete,
      canProceed,
      errorCount: validationErrors.length,
      isDirty,
      isValidating
    });
  }, [paymentInfo, isComplete, canProceed, validationErrors, isDirty, isValidating]);

  return {
    // State
    paymentInfo,
    formState,
    isLoading,
    isValidating,
    isComplete,
    
    // Actions
    selectPaymentMethod,
    updatePaymentInfo,
    validatePaymentMethod,
    resetPaymentInfo,
    
    // Calculated values
    totalWithFees,
    paymentMethodFees,
    validationErrors,
    
    // Utilities
    canProceed,
    isDirty
  };
}