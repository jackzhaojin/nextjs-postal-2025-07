import type { Metadata } from 'next';
import { ShippingLayout } from '@/components/layout/ShippingLayout';

export const metadata: Metadata = {
  title: 'Shipping Process - B2B Shipping System',
  description: 'Complete your shipment booking in 6 easy steps',
};

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

export default function ShippingLayoutWrapper({ children }: ShippingLayoutWrapperProps) {
  return (
    <ShippingLayout
      currentStep={1}
      steps={defaultShippingSteps}
      showStepIndicator={true}
      showNavigation={true}
      allowStepNavigation={false}
      canGoBack={false}
      canGoNext={false}
      isValid={false}
    >
      {children}
    </ShippingLayout>
  );
}
