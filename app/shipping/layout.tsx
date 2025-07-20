'use client';

import type { Metadata } from 'next';
import { ShippingProvider, useShipping } from '@/components/providers/ShippingProvider';
import { ShippingLayout } from '@/components/layout/ShippingLayout';

// Default shipping steps configuration
const defaultShippingSteps = [
  {
    id: 1,
    title: 'Shipment Details',
    description: 'Enter package and address information',
    path: '/shipping',
    status: 'in-progress' as const,
    completed: false
  },
  {
    id: 2,
    title: 'Pricing & Options',
    description: 'Select shipping service and pricing',
    path: '/shipping/pricing',
    status: 'not-started' as const,
    completed: false
  },
  {
    id: 3,
    title: 'Payment Information',
    description: 'Enter payment and billing details',
    path: '/shipping/payment',
    status: 'not-started' as const,
    completed: false
  },
  {
    id: 4,
    title: 'Pickup Scheduling',
    description: 'Schedule your pickup date and time',
    path: '/shipping/pickup',
    status: 'not-started' as const,
    completed: false
  },
  {
    id: 5,
    title: 'Review & Confirm',
    description: 'Review all details before submission',
    path: '/shipping/review',
    status: 'not-started' as const,
    completed: false
  },
  {
    id: 6,
    title: 'Confirmation',
    description: 'Shipment booked successfully',
    path: '/shipping/confirmation',
    status: 'not-started' as const,
    completed: false
  }
];

interface ShippingLayoutWrapperProps {
  children: React.ReactNode;
}

function ShippingLayoutInner({ children }: ShippingLayoutWrapperProps) {
  const {
    currentStep,
    canGoBack,
    canGoNext,
    isValid,
    isLoading,
    isDirty,
    goToPrevious,
    goToNext,
    saveProgress,
    resetShipment
  } = useShipping();

  return (
    <ShippingLayout
      currentStep={currentStep}
      steps={defaultShippingSteps}
      showStepIndicator={true}
      showNavigation={true}
      allowStepNavigation={false}
      canGoBack={canGoBack}
      canGoNext={canGoNext}
      isValid={isValid}
      isLoading={isLoading}
      isSaving={isDirty}
      onPrevious={goToPrevious}
      onNext={goToNext}
      onSave={saveProgress}
      onReset={resetShipment}
    >
      {children}
    </ShippingLayout>
  );
}

export default function ShippingLayoutWrapper({ children }: ShippingLayoutWrapperProps) {
  return (
    <ShippingProvider>
      <ShippingLayoutInner>{children}</ShippingLayoutInner>
    </ShippingProvider>
  );
}
