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
  BillingInfo,
  accountsPayableContactSchema,
} from '@/lib/payment/billingTypes';
import { ValidationErrors } from '@/lib/types';
import { useEffect } from 'react';

interface AccountsPayableSectionProps {
  billingInfo: BillingInfo;
  onBillingInfoChange: (info: BillingInfo) => void;
  validationErrors: ValidationErrors;
  isSubmitting: boolean;
}

export function AccountsPayableSection({
  billingInfo,
  onBillingInfoChange,
  validationErrors,
  isSubmitting,
}: AccountsPayableSectionProps) {
  const form = useForm<z.infer<typeof accountsPayableContactSchema>>({
    resolver: zodResolver(accountsPayableContactSchema),
    defaultValues: billingInfo.accountsPayableContact || {
      name: '',
      title: '',
      phone: '',
      email: '',
      extension: '',
    },
  });

  useEffect(() => {
    if (billingInfo.accountsPayableContact) {
      form.reset(billingInfo.accountsPayableContact);
    }
  }, [billingInfo.accountsPayableContact, form]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      onBillingInfoChange({
        ...billingInfo,
        accountsPayableContact: value as z.infer<typeof accountsPayableContactSchema>,
      });
    });
    return () => subscription.unsubscribe();
  }, [form, onBillingInfoChange, billingInfo]);

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              {validationErrors['accountsPayableContact.name'] && (
                <FormMessage>{validationErrors['accountsPayableContact.name'] as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title (Optional)</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              {validationErrors['accountsPayableContact.title'] && (
                <FormMessage>{validationErrors['accountsPayableContact.title'] as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              {validationErrors['accountsPayableContact.phone'] && (
                <FormMessage>{validationErrors['accountsPayableContact.phone'] as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} disabled={isSubmitting} />
              </FormControl>
              {validationErrors['accountsPayableContact.email'] && (
                <FormMessage>{validationErrors['accountsPayableContact.email'] as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="extension"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Extension (Optional)</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              {validationErrors['accountsPayableContact.extension'] && (
                <FormMessage>{validationErrors['accountsPayableContact.extension'] as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
