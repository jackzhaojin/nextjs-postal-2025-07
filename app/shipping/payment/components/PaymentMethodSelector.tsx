import React from 'react';
import { RadioGroup } from '@radix-ui/react-radio-group';
import { PaymentMethodCard } from './PaymentMethodCard';
import { PaymentMethodType } from '@/lib/payment/types';
import { CreditCard, Building2, Handshake, FileText, Banknote } from 'lucide-react';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethodType;
  onSelectMethod: (method: PaymentMethodType) => void;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onSelectMethod,
}) => {
  const paymentMethods = [
    {
      value: "purchaseOrder",
      title: "Purchase Order",
      description: "Pay with an approved Purchase Order.",
      icon: <FileText className="h-4 w-4 text-muted-foreground" />,
    },
    {
      value: "billOfLading",
      title: "Bill of Lading",
      description: "Freight-specific billing with BOL.",
      icon: <Handshake className="h-4 w-4 text-muted-foreground" />,
    },
    {
      value: "thirdPartyBilling",
      title: "Third-Party Billing",
      description: "Bill to an external account.",
      icon: <Building2 className="h-4 w-4 text-muted-foreground" />,
    },
    {
      value: "netTerms",
      title: "Net Terms",
      description: "Credit-based payment with application.",
      icon: <CreditCard className="h-4 w-4 text-muted-foreground" />,
    },
    {
      value: "corporateAccount",
      title: "Corporate Account",
      description: "Existing customer account integration.",
      icon: <Banknote className="h-4 w-4 text-muted-foreground" />,
    },
  ];

  return (
    <RadioGroup
      value={selectedMethod}
      onValueChange={(value: PaymentMethodType) => onSelectMethod(value)}
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
    >
      {paymentMethods.map((method) => (
        <PaymentMethodCard
          key={method.value}
          value={method.value}
          title={method.title}
          description={method.description}
          icon={method.icon}
          isSelected={selectedMethod === method.value}
          onSelect={onSelectMethod}
        />
      ))}
    </RadioGroup>
  );
};