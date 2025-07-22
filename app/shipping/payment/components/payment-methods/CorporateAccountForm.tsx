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
  corporateAccountSchema,
  ValidationErrors,
} from '@/lib/payment/types';
import { useEffect } from 'react';

interface CorporateAccountFormProps {
  paymentInfo: PaymentInfo;
  onPaymentInfoChange: (info: PaymentInfo) => void;
  validationErrors: ValidationErrors;
  isSubmitting: boolean;
}

export function CorporateAccountForm({
  paymentInfo,
  onPaymentInfoChange,
  validationErrors,
  isSubmitting,
}: CorporateAccountFormProps) {
  const form = useForm<z.infer<typeof corporateAccountSchema>>({
    resolver: zodResolver(corporateAccountSchema),
    defaultValues: paymentInfo.corporateAccount || {
      accountNumber: '',
      accountPin: '',
      billingContactName: '',
      billingContactEmail: '',
      billingContactPhone: '',
    },
  });

  useEffect(() => {
    if (paymentInfo.corporateAccount) {
      form.reset(paymentInfo.corporateAccount);
    }
  }, [paymentInfo.corporateAccount, form]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      onPaymentInfoChange({
        ...paymentInfo,
        corporateAccount: value as z.infer<typeof corporateAccountSchema>,
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
          name="accountPin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account PIN</FormLabel>
              <FormControl>
                <Input type="password" {...field} disabled={isSubmitting} />
              </FormControl>
              {validationErrors.accountPin && (
                <FormMessage>{validationErrors.accountPin as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="billingContactName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Billing Contact Name</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              {validationErrors.billingContactName && (
                <FormMessage>{validationErrors.billingContactName as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="billingContactEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Billing Contact Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} disabled={isSubmitting} />
              </FormControl>
              {validationErrors.billingContactEmail && (
                <FormMessage>{validationErrors.billingContactEmail as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="billingContactPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Billing Contact Phone</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              {validationErrors.billingContactPhone && (
                <FormMessage>{validationErrors.billingContactPhone as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
