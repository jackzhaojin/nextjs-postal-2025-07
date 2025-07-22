'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  PaymentInfo,
  thirdPartyBillingSchema,
  ValidationErrors,
} from '@/lib/payment/types';
import { useEffect } from 'react';

interface ThirdPartyBillingFormProps {
  paymentInfo: PaymentInfo;
  onPaymentInfoChange: (info: PaymentInfo) => void;
  validationErrors: ValidationErrors;
  isSubmitting: boolean;
}

export function ThirdPartyBillingForm({
  paymentInfo,
  onPaymentInfoChange,
  validationErrors,
  isSubmitting,
}: ThirdPartyBillingFormProps) {
  const form = useForm<z.infer<typeof thirdPartyBillingSchema>>({
    resolver: zodResolver(thirdPartyBillingSchema),
    defaultValues: paymentInfo.thirdPartyBilling || {
      accountNumber: '',
      companyName: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      authorizationCode: '',
    },
  });

  useEffect(() => {
    if (paymentInfo.thirdPartyBilling) {
      form.reset(paymentInfo.thirdPartyBilling);
    }
  }, [paymentInfo.thirdPartyBilling, form]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      onPaymentInfoChange({
        ...paymentInfo,
        thirdPartyBilling: value as z.infer<typeof thirdPartyBillingSchema>,
      });
    });
    return () => subscription.unsubscribe();
  }, [form, onPaymentInfoChange, paymentInfo]);

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
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              {validationErrors.accountNumber && (
                <FormMessage>{validationErrors.accountNumber as string}</FormMessage>
              )}
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
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              {validationErrors.companyName && (
                <FormMessage>{validationErrors.companyName as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contactName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Name</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              {validationErrors.contactName && (
                <FormMessage>{validationErrors.contactName as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contactEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} disabled={isSubmitting} />
              </FormControl>
              {validationErrors.contactEmail && (
                <FormMessage>{validationErrors.contactEmail as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contactPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Phone</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              {validationErrors.contactPhone && (
                <FormMessage>{validationErrors.contactPhone as string}</FormMessage>
              )}
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
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              {validationErrors.authorizationCode && (
                <FormMessage>{validationErrors.authorizationCode as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
