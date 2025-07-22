import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { NetTermsInfoSchema } from '@/lib/payment/validation';
import { PaymentMethodFormProps } from '../types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NetTermsFormProps extends PaymentMethodFormProps {
  // Add any specific props for NetTermsForm if needed
}

export const NetTermsForm: React.FC<NetTermsFormProps> = ({
  paymentInfo,
  onPaymentInfoChange,
  validationErrors,
  isSubmitting,
}) => {
  const form = useForm<z.infer<typeof NetTermsInfoSchema>>({
    resolver: zodResolver(NetTermsInfoSchema),
    defaultValues: paymentInfo?.netTerms || {
      netTermsPeriod: '',
      creditApplication: '',
      tradeReferences: [{ name: '', contact: '' }, { name: '', contact: '' }, { name: '', contact: '' }],
      annualRevenue: '',
    },
  });

  React.useEffect(() => {
    const subscription = form.watch((value) => {
      onPaymentInfoChange({
        netTerms: value as z.infer<typeof NetTermsInfoSchema>,
      });
    });
    return () => subscription.unsubscribe();
  }, [form, onPaymentInfoChange]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      // In a real application, you would upload this file to a server
      // and get a URL/path back. For this mock, we'll just use the file name.
      form.setValue('creditApplication', file.name);
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          control={form.control}
          name="netTermsPeriod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Net Terms Period</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select net terms period" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="net30">Net 30</SelectItem>
                  <SelectItem value="net60">Net 60</SelectItem>
                  <SelectItem value="net90">Net 90</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="creditApplication"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Credit Application (PDF/DOC, max 5MB)</FormLabel>
              <FormControl>
                <Input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
              </FormControl>
              <FormMessage />
              {field.value && <p className="text-sm text-muted-foreground">File selected: {field.value}</p>}
            </FormItem>
          )}
        />
        <div>
          <FormLabel>Trade References (3 required)</FormLabel>
          {form.watch('tradeReferences').map((ref, index) => (
            <div key={index} className="flex space-x-2 mt-2">
              <FormField
                control={form.control}
                name={`tradeReferences.${index}.name`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input {...field} placeholder={`Reference ${index + 1} Name`} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`tradeReferences.${index}.contact`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input {...field} placeholder={`Reference ${index + 1} Contact (Email/Phone)`} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>
        <FormField
          control={form.control}
          name="annualRevenue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Annual Revenue</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select annual revenue range" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="<1M">Less than $1 Million</SelectItem>
                  <SelectItem value="1M-5M">$1 Million - $5 Million</SelectItem>
                  <SelectItem value="5M-25M">$5 Million - $25 Million</SelectItem>
                  <SelectItem value=">25M">Greater than $25 Million</SelectItem>
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