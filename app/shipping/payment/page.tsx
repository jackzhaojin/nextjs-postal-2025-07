// Payment Method Selection Page
// Task 6.1: Payment Method Selection - Main payment page with B2B payment methods

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ShippingTransactionManager } from '@/lib/localStorage';
import { usePaymentTransaction } from '@/lib/payment/hooks/usePaymentTransaction';
import { getPaymentMethodConfig, formatCurrency } from '@/lib/payment/utils';
import type { ShippingTransaction, PricingOption } from '@/lib/types';
import type { PaymentMethodType, MonetaryAmount } from '@/lib/payment/types';

// Import components (these will be created in subsequent tasks)
import PaymentMethodSelector from './components/PaymentMethodSelector';
import PurchaseOrderForm from './components/payment-methods/PurchaseOrderForm';
import BillOfLadingForm from './components/payment-methods/BillOfLadingForm';
import ThirdPartyBillingForm from './components/payment-methods/ThirdPartyBillingForm';
import NetTermsForm from './components/payment-methods/NetTermsForm';
import CorporateAccountForm from './components/payment-methods/CorporateAccountForm';

export default function PaymentPage() {
  console.log('Rendering PaymentPage');

  const router = useRouter();
  const [transaction, setTransaction] = useState<ShippingTransaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate shipment total from pricing option
  const shipmentTotal: MonetaryAmount = React.useMemo(() => {
    if (!transaction?.selectedOption) {
      return { amount: 0, currency: 'USD' };
    }
    return {
      amount: transaction.selectedOption.pricing.total,
      currency: 'USD' // Default currency, could be derived from transaction
    };
  }, [transaction?.selectedOption]);

  // Initialize payment transaction hook
  const {
    paymentInfo,
    formState,
    isValidating,
    isComplete,
    selectPaymentMethod,
    updatePaymentInfo,
    validatePaymentMethod,
    totalWithFees,
    paymentMethodFees,
    validationErrors,
    canProceed
  } = usePaymentTransaction({
    shipmentTotal,
    onPaymentComplete: (paymentInfo) => {
      console.log('Payment method completed:', paymentInfo);
      // Update transaction in localStorage
      if (transaction) {
        const updatedTransaction = {
          ...transaction,
          paymentInfo,
          status: 'payment' as const
        };
        ShippingTransactionManager.save(updatedTransaction);
        setTransaction(updatedTransaction);
      }
    },
    onValidationError: (errors) => {
      console.log('Payment validation errors:', errors);
      setError(errors.map(e => e.message).join(', '));
    }
  });

  // Load transaction from localStorage on mount
  useEffect(() => {
    console.log('Loading transaction from localStorage...');
    setIsLoading(true);
    
    const loadResult = ShippingTransactionManager.load();
    if (loadResult.success && loadResult.data) {
      console.log('Loaded transaction:', loadResult.data);
      setTransaction(loadResult.data);
      
      // Validate that we have a selected pricing option
      if (!loadResult.data.selectedOption) {
        console.warn('No pricing option selected, redirecting to pricing page');
        router.push('/shipping/pricing');
        return;
      }
    } else {
      console.warn('No transaction found, redirecting to shipping details');
      router.push('/shipping');
      return;
    }
    
    setIsLoading(false);
  }, [router]);

  // Handle payment method selection
  const handlePaymentMethodSelect = useCallback((method: PaymentMethodType) => {
    console.log('Payment method selected:', method);
    selectPaymentMethod(method);
    setError(null);
  }, [selectPaymentMethod]);

  // Handle form data updates
  const handleFormDataUpdate = useCallback((updates: any) => {
    console.log('Updating payment form data:', updates);
    updatePaymentInfo(updates);
  }, [updatePaymentInfo]);

  // Handle navigation to next step
  const handleNext = useCallback(async () => {
    console.log('Proceeding to next step...');
    
    if (!canProceed) {
      console.warn('Cannot proceed: validation incomplete');
      setError('Please complete all required fields and resolve validation errors');
      return;
    }

    const isValid = await validatePaymentMethod();
    if (!isValid) {
      console.warn('Payment method validation failed');
      setError('Payment method validation failed. Please check your information.');
      return;
    }

    // Update transaction status and navigate to pickup
    if (transaction && paymentInfo) {
      const updatedTransaction: ShippingTransaction = {
        ...transaction,
        paymentInfo,
        status: 'pickup'
      };
      
      const saveResult = ShippingTransactionManager.save(updatedTransaction);
      if (saveResult.success) {
        console.log('Transaction saved, navigating to pickup page');
        router.push('/shipping/pickup');
      } else {
        console.error('Failed to save transaction:', saveResult.error);
        setError('Failed to save payment information. Please try again.');
      }
    }
  }, [canProceed, validatePaymentMethod, transaction, paymentInfo, router]);

  // Handle navigation back to pricing
  const handleBack = useCallback(() => {
    console.log('Navigating back to pricing page');
    router.push('/shipping/pricing');
  }, [router]);

  // Render payment method form based on selected method
  const renderPaymentMethodForm = () => {
    if (!formState.selectedMethod) return null;

    const commonProps = {
      data: paymentInfo,
      onChange: handleFormDataUpdate,
      errors: validationErrors,
      isSubmitting: isValidating,
      shipmentTotal,
      className: "mt-6"
    };

    switch (formState.selectedMethod) {
      case 'po':
        return <PurchaseOrderForm {...commonProps} />;
      case 'bol':
        return <BillOfLadingForm {...commonProps} />;
      case 'thirdparty':
        return <ThirdPartyBillingForm {...commonProps} />;
      case 'net':
        return <NetTermsForm {...commonProps} />;
      case 'corporate':
        return <CorporateAccountForm {...commonProps} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment options...</p>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Transaction Found</h2>
          <p className="text-gray-600 mb-4">Please start from the beginning.</p>
          <button
            onClick={() => router.push('/shipping')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Start New Shipment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payment Information</h1>
              <p className="text-gray-600 mt-1">Step 3 of 6: Choose your payment method</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Shipment Total</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(shipmentTotal)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center">
            <div className="flex items-center text-sm">
              <span className="text-blue-600 font-medium">1. Details</span>
              <span className="mx-2 text-gray-400">→</span>
              <span className="text-blue-600 font-medium">2. Pricing</span>
              <span className="mx-2 text-gray-400">→</span>
              <span className="text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">3. Payment</span>
              <span className="mx-2 text-gray-400">→</span>
              <span className="text-gray-400">4. Pickup</span>
              <span className="mx-2 text-gray-400">→</span>
              <span className="text-gray-400">5. Review</span>
              <span className="mx-2 text-gray-400">→</span>
              <span className="text-gray-400">6. Confirmation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Validation Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Method Selection */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Select Payment Method
          </h2>
          <PaymentMethodSelector
            selectedMethod={formState.selectedMethod}
            onSelect={handlePaymentMethodSelect}
            shipmentTotal={shipmentTotal}
            paymentMethodConfigs={getPaymentMethodConfig()}
          />
        </div>

        {/* Payment Method Form */}
        {renderPaymentMethodForm()}

        {/* Cost Summary */}
        {totalWithFees && paymentMethodFees.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Shipment Cost</span>
                <span>{formatCurrency(shipmentTotal)}</span>
              </div>
              {paymentMethodFees.map((fee, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-600">{fee.description}</span>
                  <span>{formatCurrency(fee.amount)}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(totalWithFees)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Back to Pricing
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed || isValidating}
            className={`px-6 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              canProceed && !isValidating
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isValidating ? 'Validating...' : 'Continue to Pickup'}
          </button>
        </div>

        {/* Development Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Development Info</h4>
            <pre className="text-xs text-gray-600 overflow-auto">
              {JSON.stringify(
                {
                  selectedMethod: formState.selectedMethod,
                  isComplete,
                  canProceed,
                  errorCount: validationErrors.length,
                  shipmentTotal,
                  totalWithFees
                },
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}