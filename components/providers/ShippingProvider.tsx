'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useShippingForm } from '@/hooks/useShippingForm';

interface ShippingContextValue {
  // Form state
  transaction: ReturnType<typeof useShippingForm>['transaction'];
  errors: ReturnType<typeof useShippingForm>['errors'];
  isValid: ReturnType<typeof useShippingForm>['isValid'];
  isDirty: ReturnType<typeof useShippingForm>['isDirty'];
  isLoading: ReturnType<typeof useShippingForm>['isLoading'];
  
  // Form actions
  updateOrigin: ReturnType<typeof useShippingForm>['updateOrigin'];
  updateDestination: ReturnType<typeof useShippingForm>['updateDestination'];
  updatePackage: ReturnType<typeof useShippingForm>['updatePackage'];
  updateTransaction: ReturnType<typeof useShippingForm>['updateTransaction'];
  validateForm: ReturnType<typeof useShippingForm>['validateForm'];
  saveProgress: ReturnType<typeof useShippingForm>['saveProgress'];
  clearForm: ReturnType<typeof useShippingForm>['clearForm'];
  goToNextStep: ReturnType<typeof useShippingForm>['goToNextStep'];
  
  // Navigation
  currentStep: number;
  canGoBack: boolean;
  canGoNext: boolean;
  goToPrevious: () => void;
  goToNext: () => void;
  goToStep: (step: number) => void;
  resetShipment: () => void;
}

const ShippingContext = createContext<ShippingContextValue | null>(null);

interface ShippingProviderProps {
  children: ReactNode;
}

// Step configuration with paths
export const SHIPPING_STEPS = [
  { id: 1, path: '/shipping', title: 'Shipment Details', description: 'Enter origin, destination, and package info', status: 'not-started' as const, completed: false },
  { id: 2, path: '/shipping/pricing', title: 'Pricing & Options', description: 'Select service and view pricing', status: 'not-started' as const, completed: false },
  { id: 3, path: '/shipping/payment', title: 'Payment Information', description: 'Provide payment details', status: 'not-started' as const, completed: false },
  { id: 4, path: '/shipping/pickup', title: 'Pickup Scheduling', description: 'Schedule pickup date and time', status: 'not-started' as const, completed: false },
  { id: 5, path: '/shipping/review', title: 'Review & Confirm', description: 'Review and confirm your shipment', status: 'not-started' as const, completed: false },
  { id: 6, path: '/shipping/confirmation', title: 'Confirmation', description: 'View shipment confirmation', status: 'not-started' as const, completed: false }
];

export function ShippingProvider({ children }: ShippingProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const formState = useShippingForm();
  
  // Determine current step from pathname
  const currentStep = SHIPPING_STEPS.find(step => step.path === pathname)?.id || 1;
  
  // Navigation logic
  const canGoBack = currentStep > 1;
  const canGoNext = currentStep < SHIPPING_STEPS.length;
  
  const goToPrevious = () => {
    if (canGoBack) {
      const previousStep = SHIPPING_STEPS.find(step => step.id === currentStep - 1);
      if (previousStep) {
        router.push(previousStep.path);
      }
    }
  };
  
  const goToNext = () => {
    if (currentStep === 1) {
      // For step 1, validate form before proceeding
      const success = formState.goToNextStep();
      if (success) {
        const nextStep = SHIPPING_STEPS.find(step => step.id === currentStep + 1);
        if (nextStep) {
          router.push(nextStep.path);
        }
      }
    } else if (canGoNext) {
      const nextStep = SHIPPING_STEPS.find(step => step.id === currentStep + 1);
      if (nextStep) {
        router.push(nextStep.path);
      }
    }
  };
  
  const goToStep = (stepId: number) => {
    const step = SHIPPING_STEPS.find(s => s.id === stepId);
    if (step) {
      router.push(step.path);
    }
  };
  
  const resetShipment = () => {
    formState.clearForm();
    router.push('/shipping');
  };
  
  const contextValue: ShippingContextValue = {
    ...formState,
    currentStep,
    canGoBack,
    canGoNext,
    goToPrevious,
    goToNext,
    goToStep,
    resetShipment,
    updateTransaction: formState.updateTransaction
  };
  
  return (
    <ShippingContext.Provider value={contextValue}>
      {children}
    </ShippingContext.Provider>
  );
}

export function useShipping() {
  const context = useContext(ShippingContext);
  if (!context) {
    throw new Error('useShipping must be used within a ShippingProvider');
  }
  return context;
}