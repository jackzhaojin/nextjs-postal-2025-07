import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PurchaseOrderInfoSchema } from '@/lib/payment/validation';
import { PaymentMethodFormProps } from './types'; // Assuming types.ts is in the same directory
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface PurchaseOrderFormProps extends PaymentMethodFormProps {
  // Add any specific props for PurchaseOrderForm if needed
}

export const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({
  paymentInfo,
  onPaymentInfoChange,
  validationErrors,
  isSubmitting,
}) => {
  const form = useForm<z.infer<typeof PurchaseOrderInfoSchema>>({
    resolver: zodResolver(PurchaseOrderInfoSchema),
    defaultValues: paymentInfo?.purchaseOrder || {
      poNumber: '',
      poAmount: { amount: 0, currency: 'USD' },
      poExpiration: '',
      approvalContact: '',
      departmentCostCenter: '',
    },
  });

  // Watch for form changes and update parent state
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      onPaymentInfoChange({
        purchaseOrder: value as z.infer<typeof PurchaseOrderInfoSchema>,
      });
    });
    return () => subscription.unsubscribe();
  }, [form, onPaymentInfoChange]);

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          control={form.control}
          name="poNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>PO Number</FormLabel>
              <FormControl>
                <Input {...field} placeholder="PO-12345" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="poAmount.amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>PO Amount</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="poExpiration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>PO Expiration Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="approvalContact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Approval Contact (Email or Phone)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="approver@example.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="departmentCostCenter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department/Cost Center (Optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Marketing Dept" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};