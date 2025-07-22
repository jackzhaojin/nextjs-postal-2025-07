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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  BillingInfo,
  invoicePreferencesSchema,
  ValidationErrors,
  invoiceDeliveryMethodSchema,
  invoiceFormatSchema,
  invoiceFrequencySchema,
} from '@/lib/payment/billingTypes';
import { useEffect } from 'react';

interface InvoicePreferencesSectionProps {
  billingInfo: BillingInfo;
  onBillingInfoChange: (info: BillingInfo) => void;
  validationErrors: ValidationErrors;
  isSubmitting: boolean;
}

export function InvoicePreferencesSection({
  billingInfo,
  onBillingInfoChange,
  validationErrors,
  isSubmitting,
}: InvoicePreferencesSectionProps) {
  const form = useForm<z.infer<typeof invoicePreferencesSchema>>({
    resolver: zodResolver(invoicePreferencesSchema),
    defaultValues: billingInfo.invoicePreferences || {
      deliveryMethod: 'Email',
      format: 'Standard',
      frequency: 'Per shipment',
      customRequirements: '',
    },
  });

  useEffect(() => {
    if (billingInfo.invoicePreferences) {
      form.reset(billingInfo.invoicePreferences);
    }
  }, [billingInfo.invoicePreferences, form]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      onBillingInfoChange({
        ...billingInfo,
        invoicePreferences: value as z.infer<typeof invoicePreferencesSchema>,
      });
    });
    return () => subscription.unsubscribe();
  }, [form, onBillingInfoChange, billingInfo]);

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          control={form.control}
          name="deliveryMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Invoice Delivery Method</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select delivery method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {invoiceDeliveryMethodSchema.options.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors['invoicePreferences.deliveryMethod'] && (
                <FormMessage>{validationErrors['invoicePreferences.deliveryMethod'] as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="format"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Invoice Format</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select invoice format" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {invoiceFormatSchema.options.map((format) => (
                    <SelectItem key={format} value={format}>
                      {format}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors['invoicePreferences.format'] && (
                <FormMessage>{validationErrors['invoicePreferences.format'] as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Invoice Frequency</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select invoice frequency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {invoiceFrequencySchema.options.map((frequency) => (
                    <SelectItem key={frequency} value={frequency}>
                      {frequency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors['invoicePreferences.frequency'] && (
                <FormMessage>{validationErrors['invoicePreferences.frequency'] as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="customRequirements"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom Requirements (Optional)</FormLabel>
              <FormControl>
                <Textarea {...field} disabled={isSubmitting} />
              </FormControl>
              {validationErrors['invoicePreferences.customRequirements'] && (
                <FormMessage>{validationErrors['invoicePreferences.customRequirements'] as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
