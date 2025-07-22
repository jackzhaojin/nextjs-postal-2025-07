'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { PaymentMethodType } from '@/lib/payment/types';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethodType | undefined;
  onSelectMethod: (method: PaymentMethodType) => void;
}

export function PaymentMethodSelector({
  selectedMethod,
  onSelectMethod,
}: PaymentMethodSelectorProps) {
  const paymentMethods: { value: PaymentMethodType; label: string; description: string }[] = [
    {
      value: 'po',
      label: 'Purchase Order',
      description: 'Pay with a valid purchase order number.',
    },
    {
      value: 'bol',
      label: 'Bill of Lading',
      description: 'Pay using a freight bill of lading.',
    },
    {
      value: 'thirdparty',
      label: 'Third-Party Billing',
      description: 'Bill to a third-party account.',
    },
    {
      value: 'net',
      label: 'Net Terms',
      description: 'Pay on credit with approved net terms.',
    },
    {
      value: 'corporate',
      label: 'Corporate Account',
      description: 'Use your existing corporate account.',
    },
  ];

  return (
    <RadioGroup
      onValueChange={(value: PaymentMethodType) => onSelectMethod(value)}
      value={selectedMethod}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {paymentMethods.map((method) => (
        <Label
          key={method.value}
          htmlFor={method.value}
          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
        >
          <RadioGroupItem id={method.value} value={method.value} className="sr-only" />
          <div className="flex w-full items-center justify-between">
            <CardTitle className="text-lg font-semibold">{method.label}</CardTitle>
            {selectedMethod === method.value && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-5 w-5 text-primary"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                <path d="M9 12l2 2 4-4"></path>
              </svg>
            )}
          </div>
          <CardContent className="w-full text-sm text-muted-foreground mt-2 p-0">
            {method.description}
          </CardContent>
        </Label>
      ))}
    </RadioGroup>
  );
}
