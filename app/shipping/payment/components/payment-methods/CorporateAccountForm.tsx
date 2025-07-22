import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CorporateAccountInfoSchema } from '@/lib/payment/validation';
import { PaymentMethodFormProps } from '../types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface CorporateAccountFormProps extends PaymentMethodFormProps {
  // Add any specific props for CorporateAccountForm if needed
}

export const CorporateAccountForm: React.FC<CorporateAccountFormProps> = ({
  paymentInfo,
  onPaymentInfoChange,
  validationErrors,
  isSubmitting,
}) => {
  const form = useForm<z.infer<typeof CorporateAccountInfoSchema>>({
    resolver: zodResolver(CorporateAccountInfoSchema),
    defaultValues: paymentInfo?.corporateAccount || {
      accountNumber: '',
      accountPin: '',
      billingContact: '',
    },
  });

  React.useEffect(() => {
    const subscription = form.watch((value) => {
      onPaymentInfoChange({
        corporateAccount: value as z.infer<typeof CorporateAccountInfoSchema>,
      });
    });
    return () => subscription.unsubscribe();
  }, [form, onPaymentInfoChange]);

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          control={form.control}
          name="accountNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Number</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Corporate Account Number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="accountPin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account PIN</FormLabel>
              <FormControl>
                <Input type="password" {...field} placeholder="****" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="billingContact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Billing Contact (Email or Phone)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="billing@example.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};