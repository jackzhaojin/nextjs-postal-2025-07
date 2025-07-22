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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  PaymentInfo,
  billOfLadingSchema,
  ValidationErrors,
} from '@/lib/payment/types';
import { useEffect } from 'react';

interface BillOfLadingFormProps {
  paymentInfo: PaymentInfo;
  onPaymentInfoChange: (info: PaymentInfo) => void;
  validationErrors: ValidationErrors;
  isSubmitting: boolean;
}

export function BillOfLadingForm({
  paymentInfo,
  onPaymentInfoChange,
  validationErrors,
  isSubmitting,
}: BillOfLadingFormProps) {
  const form = useForm<z.infer<typeof billOfLadingSchema>>({
    resolver: zodResolver(billOfLadingSchema),
    defaultValues: paymentInfo.billOfLading || {
      bolNumber: '',
      bolDate: '',
      shipperReference: '',
      freightTerms: undefined,
    },
  });

  useEffect(() => {
    if (paymentInfo.billOfLading) {
      form.reset(paymentInfo.billOfLading);
    }
  }, [paymentInfo.billOfLading, form]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      onPaymentInfoChange({
        ...paymentInfo,
        billOfLading: value as z.infer<typeof billOfLadingSchema>,
      });
    });
    return () => subscription.unsubscribe();
  }, [form, onPaymentInfoChange, paymentInfo]);

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          control={form.control}
          name="bolNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>BOL Number</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              {validationErrors.bolNumber && (
                <FormMessage>{validationErrors.bolNumber as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bolDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>BOL Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} disabled={isSubmitting} />
              </FormControl>
              {validationErrors.bolDate && (
                <FormMessage>{validationErrors.bolDate as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="shipperReference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shipper Reference (Optional)</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              {validationErrors.shipperReference && (
                <FormMessage>{validationErrors.shipperReference as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="freightTerms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Freight Terms</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select freight terms" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Prepaid">Prepaid</SelectItem>
                  <SelectItem value="Collect">Collect</SelectItem>
                  <SelectItem value="ThirdParty">Third-Party</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.freightTerms && (
                <FormMessage>{validationErrors.freightTerms as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
