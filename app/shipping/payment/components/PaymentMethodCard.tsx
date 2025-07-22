import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

interface PaymentMethodCardProps {
  value: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onSelect: (value: string) => void;
}

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  value,
  title,
  description,
  icon,
  isSelected,
  onSelect,
}) => {
  return (
    <Card
      className={cn(
        "cursor-pointer hover:border-primary transition-colors",
        isSelected && "border-primary ring-2 ring-primary ring-offset-2"
      )}
      onClick={() => onSelect(value)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
      <RadioGroupItem value={value} id={value} className="sr-only" />
    </Card>
  );
};
