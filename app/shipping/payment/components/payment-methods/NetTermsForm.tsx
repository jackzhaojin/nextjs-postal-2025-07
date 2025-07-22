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
  netTermsSchema,
  ValidationErrors,
} from '@/lib/payment/types';
import { useEffect } from 'react';

interface NetTermsFormProps {
  paymentInfo: PaymentInfo;
  onPaymentInfoChange: (info: PaymentInfo) => void;
  validationErrors: ValidationErrors;
  isSubmitting: boolean;
}

export function NetTermsForm({
  paymentInfo,
  onPaymentInfoChange,
  validationErrors,
  isSubmitting,
}: NetTermsFormProps) {
  const form = useForm<z.infer<typeof netTermsSchema>>({
    resolver: zodResolver(netTermsSchema),
    defaultValues: paymentInfo.netTerms || {
      netTermsPeriod: undefined,
      creditApplication: undefined,
      tradeReference1Name: '',
      tradeReference1Contact: '',
      tradeReference1Phone: '',
      tradeReference2Name: '',
      tradeReference2Contact: '',
      tradeReference2Phone: '',
      tradeReference3Name: '',
      tradeReference3Contact: '',
      tradeReference3Phone: '',
      annualRevenue: undefined,
    },
  });

  useEffect(() => {
    if (paymentInfo.netTerms) {
      form.reset(paymentInfo.netTerms);
    }
  }, [paymentInfo.netTerms, form]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      onPaymentInfoChange({
        ...paymentInfo,
        netTerms: value as z.infer<typeof netTermsSchema>,
      });
    });
    return () => subscription.unsubscribe();
  }, [form, onPaymentInfoChange, paymentInfo]);

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          control={form.control}
          name="netTermsPeriod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Net Terms Period</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select net terms period" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Net 15">Net 15</SelectItem>
                  <SelectItem value="Net 30">Net 30</SelectItem>
                  <SelectItem value="Net 45">Net 45</SelectItem>
                  <SelectItem value="Net 60">Net 60</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.netTermsPeriod && (
                <FormMessage>{validationErrors.netTermsPeriod as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="creditApplication"
          render={({ field: { value, onChange, ...fieldProps } }) => (
            <FormItem>
              <FormLabel>Credit Application (PDF/DOC, max 5MB)</FormLabel>
              <FormControl>
                <Input
                  {...fieldProps}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(event) => onChange(event.target.files && event.target.files[0])}
                  disabled={isSubmitting}
                />
              </FormControl>
              {validationErrors.creditApplication && (
                <FormMessage>{validationErrors.creditApplication as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <h3 className="text-lg font-semibold mt-6 mb-2">Trade References</h3>
        <FormField
          control={form.control}
          name="tradeReference1Name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trade Reference 1 Name</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              {validationErrors.tradeReference1Name && (
                <FormMessage>{validationErrors.tradeReference1Name as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tradeReference1Contact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trade Reference 1 Contact</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              {validationErrors.tradeReference1Contact && (
                <FormMessage>{validationErrors.tradeReference1Contact as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tradeReference1Phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trade Reference 1 Phone</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              {validationErrors.tradeReference1Phone && (
                <FormMessage>{validationErrors.tradeReference1Phone as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tradeReference2Name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trade Reference 2 Name</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              {validationErrors.tradeReference2Name && (
                <FormMessage>{validationErrors.tradeReference2Name as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tradeReference2Contact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trade Reference 2 Contact</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              {validationErrors.tradeReference2Contact && (
                <FormMessage>{validationErrors.tradeReference2Contact as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tradeReference2Phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trade Reference 2 Phone</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              {validationErrors.tradeReference2Phone && (
                <FormMessage>{validationErrors.tradeReference2Phone as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tradeReference3Name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trade Reference 3 Name</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              {validationErrors.tradeReference3Name && (
                <FormMessage>{validationErrors.tradeReference3Name as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tradeReference3Contact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trade Reference 3 Contact</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              {validationErrors.tradeReference3Contact && (
                <FormMessage>{validationErrors.tradeReference3Contact as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tradeReference3Phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trade Reference 3 Phone</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              {validationErrors.tradeReference3Phone && (
                <FormMessage>{validationErrors.tradeReference3Phone as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="annualRevenue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Annual Revenue</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select annual revenue range" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="< $1M">&lt; $1M</SelectItem>
                  <SelectItem value="$1M - $5M">$1M - $5M</SelectItem>
                  <SelectItem value="$5M - $25M">$5M - $25M</SelectItem>
                  <SelectItem value=">$25M">&gt; $25M</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.annualRevenue && (
                <FormMessage>{validationErrors.annualRevenue as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
