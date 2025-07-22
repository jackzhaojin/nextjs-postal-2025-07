import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ThirdPartyBillingInfoSchema } from '@/lib/payment/validation';
import { PaymentMethodFormProps } from '../types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface ThirdPartyBillingFormProps extends PaymentMethodFormProps {
  // Add any specific props for ThirdPartyBillingForm if needed
}

export const ThirdPartyBillingForm: React.FC<ThirdPartyBillingFormProps> = ({
  paymentInfo,
  onPaymentInfoChange,
  validationErrors,
  isSubmitting,
}) => {
  const form = useForm<z.infer<typeof ThirdPartyBillingInfoSchema>>({
    resolver: zodResolver(ThirdPartyBillingInfoSchema),
    defaultValues: paymentInfo?.thirdPartyBilling || {
      accountNumber: '',
      companyName: '',
      contactInfo: '',
      authorizationCode: '',
    },
  });

  React.useEffect(() => {
    const subscription = form.watch((value) => {
      onPaymentInfoChange({
        thirdPartyBilling: value as z.infer<typeof ThirdPartyBillingInfoSchema>,
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
                <Input {...field} placeholder="123456789" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="ABC Logistics" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contactInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Info (Email or Phone)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="contact@abclogistics.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="authorizationCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Authorization Code (Optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="AUTH123" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};