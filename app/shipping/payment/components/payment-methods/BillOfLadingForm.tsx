import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { BillOfLadingInfoSchema } from '@/lib/payment/validation';
import { PaymentMethodFormProps } from '../types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BillOfLadingFormProps extends PaymentMethodFormProps {
  // Add any specific props for BillOfLadingForm if needed
}

export const BillOfLadingForm: React.FC<BillOfLadingFormProps> = ({
  paymentInfo,
  onPaymentInfoChange,
  validationErrors,
  isSubmitting,
}) => {
  const form = useForm<z.infer<typeof BillOfLadingInfoSchema>>({
    resolver: zodResolver(BillOfLadingInfoSchema),
    defaultValues: paymentInfo?.billOfLading || {
      bolNumber: '',
      bolDate: '',
      shipperReference: '',
      freightTerms: '',
    },
  });

  React.useEffect(() => {
    const subscription = form.watch((value) => {
      onPaymentInfoChange({
        billOfLading: value as z.infer<typeof BillOfLadingInfoSchema>,
      });
    });
    return () => subscription.unsubscribe();
  }, [form, onPaymentInfoChange]);

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
                <Input {...field} placeholder="BOL-YYYY-XXXXXX" />
              </FormControl>
              <FormMessage />
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
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
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
                <Input {...field} placeholder="Reference ID" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="freightTerms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Freight Terms</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select freight terms" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="prepaid">Prepaid</SelectItem>
                  <SelectItem value="collect">Collect</SelectItem>
                  <SelectItem value="third-party">Third-Party</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};