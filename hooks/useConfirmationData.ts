'use client';

import { useState, useCallback } from 'react';
import { ConfirmationPageData, ShippingTransaction, SubmissionResponse } from '@/lib/types';

interface UseConfirmationDataState {
  data: ConfirmationPageData | null;
  isLoading: boolean;
  error: string | null;
}

interface UseConfirmationDataResult extends UseConfirmationDataState {
  loadConfirmationData: () => Promise<void>;
  clearConfirmationData: () => void;
  refreshConfirmationData: () => Promise<void>;
}

export function useConfirmationData(): UseConfirmationDataResult {
  const [state, setState] = useState<UseConfirmationDataState>({
    data: null,
    isLoading: false,
    error: null
  });

  const generateConfirmationNumber = useCallback((): string => {
    const year = new Date().getFullYear();
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `SHP-${year}-${randomSuffix}`;
  }, []);

  const calculateBusinessDaysFromNow = useCallback((businessDays: number): Date => {
    const date = new Date();
    let addedDays = 0;
    
    while (addedDays < businessDays) {
      date.setDate(date.getDate() + 1);
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        addedDays++;
      }
    }
    
    return date;
  }, []);

  const createConfirmationData = useCallback((
    confirmationResponse: SubmissionResponse,
    transaction: ShippingTransaction
  ): ConfirmationPageData => {
    console.log('useConfirmationData - Creating confirmation data from:', {
      confirmationResponse,
      transaction
    });

    const bookingTimestamp = new Date();
    const pickupDate = transaction.pickupDetails?.date ? 
      new Date(transaction.pickupDetails.date) : 
      calculateBusinessDaysFromNow(1);
    
    const estimatedDeliveryDate = transaction.selectedOption ? 
      calculateBusinessDaysFromNow(transaction.selectedOption.transitDays + 1) :
      calculateBusinessDaysFromNow(3);

    const carrierInfo = {
      carrierId: transaction.selectedOption?.carrier || 'EXPRESS-001',
      carrierName: confirmationResponse.carrierInfo.name,
      carrierLogo: confirmationResponse.carrierInfo.logo || '/api/placeholder/120/40',
      serviceLevel: transaction.selectedOption?.serviceType || 'Ground Service',
      trackingUrlTemplate: confirmationResponse.carrierInfo.trackingUrl || 'https://tracking.example.com/{trackingNumber}'
    };

    const pickupConfirmation = {
      confirmedDate: pickupDate,
      timeWindow: {
        startTime: transaction.pickupDetails?.timeSlot.startTime || '08:00',
        endTime: transaction.pickupDetails?.timeSlot.endTime || '12:00',
        timezone: 'EST'
      },
      status: 'confirmed' as const,
      instructionsSent: {
        sent: true,
        timestamp: bookingTimestamp,
        method: 'system' as const,
        recipient: 'carrier-dispatch'
      },
      contactNotified: {
        sent: true,
        timestamp: bookingTimestamp,
        method: 'email' as const,
        recipient: transaction.shipmentDetails.origin.contactInfo.email
      },
      calendarInvite: {
        sent: true,
        timestamp: bookingTimestamp,
        method: 'email' as const,
        recipient: transaction.shipmentDetails.origin.contactInfo.email
      }
    };

    const deliveryEstimate = {
      estimatedDate: estimatedDeliveryDate,
      timeCommitment: 'By 5:00 PM EST',
      deliveryStatus: 'on-schedule' as const,
      deliveryAddress: transaction.shipmentDetails.destination,
      contactPerson: transaction.shipmentDetails.destination.contactInfo,
      specialInstructions: transaction.shipmentDetails.package.specialHandling || []
    };

    const references = {
      customerReference: transaction.paymentInfo?.reference,
      internalReference: `INT-${Date.now()}`,
      carrierReference: `CAR-${Date.now()}`,
      poNumber: transaction.paymentInfo?.paymentDetails?.purchaseOrder?.poNumber,
      bolNumber: transaction.paymentInfo?.paymentDetails?.billOfLading?.bolNumber
    };

    const confirmationData: ConfirmationPageData = {
      confirmationNumber: confirmationResponse.confirmationNumber,
      bookingTimestamp,
      transaction,
      carrierInfo,
      pickupConfirmation,
      deliveryEstimate,
      references
    };

    console.log('useConfirmationData - Confirmation data created:', confirmationData);
    return confirmationData;
  }, [calculateBusinessDaysFromNow]);

  const loadConfirmationData = useCallback(async () => {
    console.log('useConfirmationData - Loading confirmation data');
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Get confirmation data from localStorage
      const confirmationResponse = localStorage.getItem('shipping-confirmation');
      const transactionData = localStorage.getItem('currentShippingTransaction');
      
      if (!confirmationResponse || !transactionData) {
        throw new Error('Missing confirmation or transaction data');
      }

      const parsedConfirmation: SubmissionResponse = JSON.parse(confirmationResponse);
      const parsedTransaction: ShippingTransaction = JSON.parse(transactionData);
      
      console.log('useConfirmationData - Parsed data:', {
        confirmation: parsedConfirmation,
        transaction: parsedTransaction
      });
      
      // Validate required data
      if (!parsedConfirmation.confirmationNumber) {
        throw new Error('Invalid confirmation data: missing confirmation number');
      }

      if (!parsedTransaction.shipmentDetails) {
        throw new Error('Invalid transaction data: missing shipment details');
      }

      const fullConfirmationData = createConfirmationData(parsedConfirmation, parsedTransaction);
      
      setState({
        data: fullConfirmationData,
        isLoading: false,
        error: null
      });

      console.log('useConfirmationData - Data loaded successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load confirmation data';
      console.error('useConfirmationData - Error loading data:', error);
      
      setState({
        data: null,
        isLoading: false,
        error: errorMessage
      });
    }
  }, [createConfirmationData]);

  const clearConfirmationData = useCallback(() => {
    console.log('useConfirmationData - Clearing confirmation data');
    localStorage.removeItem('shipping-confirmation');
    localStorage.removeItem('currentShippingTransaction');
    
    setState({
      data: null,
      isLoading: false,
      error: null
    });
  }, []);

  const refreshConfirmationData = useCallback(async () => {
    console.log('useConfirmationData - Refreshing confirmation data');
    await loadConfirmationData();
  }, [loadConfirmationData]);

  return {
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
    loadConfirmationData,
    clearConfirmationData,
    refreshConfirmationData
  };
}

export default useConfirmationData;
