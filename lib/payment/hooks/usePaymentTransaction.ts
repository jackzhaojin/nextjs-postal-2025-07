import { useState, useEffect, useCallback } from 'react';
import { ShippingTransaction } from '@/lib/types'; // Assuming ShippingTransaction is defined here
import { PaymentInfo, PaymentMethodType, PaymentValidationStatus, ValidationResult } from '../types';
import { PaymentInfoSchema } from '../validation';

const STORAGE_KEY = 'currentShippingTransaction';

interface UsePaymentTransactionReturn {
  paymentInfo: PaymentInfo | null;
  updatePaymentInfo: (info: Partial<PaymentInfo>) => void;
  validatePaymentMethod: (method: PaymentMethodType) => ValidationResult;
  isPaymentMethodComplete: (method: PaymentMethodType) => boolean;
}

export const usePaymentTransaction = (): UsePaymentTransactionReturn => {
  const [shippingTransaction, setShippingTransaction] = useState<ShippingTransaction | null>(null);

  useEffect(() => {
    try {
      const storedTransaction = localStorage.getItem(STORAGE_KEY);
      if (storedTransaction) {
        setShippingTransaction(JSON.parse(storedTransaction));
      }
    } catch (error) {
      console.error('Failed to load shipping transaction from localStorage:', error);
    }
  }, []);

  const updatePaymentInfo = useCallback(
    (info: Partial<PaymentInfo>) => {
      setShippingTransaction((prevTransaction) => {
        const currentPaymentInfo = prevTransaction?.paymentInfo || {
          method: info.method || 'purchaseOrder', // Default or provided method
          validationStatus: 'notStarted',
          lastUpdated: new Date().toISOString(),
        };

        const updatedPaymentInfo: PaymentInfo = {
          ...currentPaymentInfo,
          ...info,
          lastUpdated: new Date().toISOString(),
        };

        const updatedTransaction: ShippingTransaction = {
          ...(prevTransaction || {} as ShippingTransaction),
          paymentInfo: updatedPaymentInfo,
          status: 'payment', // Ensure status is 'payment' when updating payment info
        };

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTransaction));
        } catch (error) {
          console.error('Failed to save shipping transaction to localStorage:', error);
        }
        return updatedTransaction;
      });
    },
    []
  );

  const validatePaymentMethod = useCallback(
    (method: PaymentMethodType): ValidationResult => {
      const currentPaymentInfo = shippingTransaction?.paymentInfo;

      if (!currentPaymentInfo || currentPaymentInfo.method !== method) {
        return { isValid: false, errors: { general: 'No payment information for this method.' } };
      }

      const result = PaymentInfoSchema.safeParse(currentPaymentInfo);

      if (!result.success) {
        const errors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          if (err.path.length > 0) {
            errors[err.path.join('.')] = err.message;
          } else {
            errors.general = err.message;
          }
        });
        return { isValid: false, errors };
      }

      return { isValid: true, errors: {} };
    },
    [shippingTransaction]
  );

  const isPaymentMethodComplete = useCallback(
    (method: PaymentMethodType): boolean => {
      const validationResult = validatePaymentMethod(method);
      return validationResult.isValid;
    },
    [validatePaymentMethod]
  );

  return {
    paymentInfo: shippingTransaction?.paymentInfo || null,
    updatePaymentInfo,
    validatePaymentMethod,
    isPaymentMethodComplete,
  };
};
