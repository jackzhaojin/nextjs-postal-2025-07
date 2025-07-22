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
  purchaseOrderSchema,
  ValidationErrors,
} from '@/lib/payment/types';
import { useEffect } from 'react';

interface PurchaseOrderFormProps {
  paymentInfo: PaymentInfo;
  onPaymentInfoChange: (info: PaymentInfo) => void;
  validationErrors: ValidationErrors;
  isSubmitting: boolean;
}

export function PurchaseOrderForm({
  paymentInfo,
  onPaymentInfoChange,
  validationErrors,
  isSubmitting,
}: PurchaseOrderFormProps) {
  const form = useForm<z.infer<typeof purchaseOrderSchema>>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: paymentInfo.purchaseOrder || {
      poNumber: '',
      poAmount: 0,
      poExpiration: '',
      approvalContactName: '',
      approvalContactEmail: '',
      approvalContactPhone: '',
      department: '',
      costCenter: '',
    },
  });

  useEffect(() => {
    if (paymentInfo.purchaseOrder) {
      form.reset(paymentInfo.purchaseOrder);
    }
  }, [paymentInfo.purchaseOrder, form]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      onPaymentInfoChange({
        ...paymentInfo,
        purchaseOrder: value as z.infer<typeof purchaseOrderSchema>,
      });
    });
    return () => subscription.unsubscribe();
  }, [form, onPaymentInfoChange, paymentInfo]);

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          control={form.control}
          name="poNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>PO Number</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              {validationErrors.poNumber && (
                <FormMessage>{validationErrors.poNumber as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="poAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>PO Amount</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} disabled={isSubmitting} />
              </FormControl>
              {validationErrors.poAmount && (
                <FormMessage>{validationErrors.poAmount as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="poExpiration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>PO Expiration</FormLabel>
              <FormControl>
                <Input type="date" {...field} disabled={isSubmitting} />
              </FormControl>
              {validationErrors.poExpiration && (
                <FormMessage>{validationErrors.poExpiration as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="approvalContactName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Approval Contact Name</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              {validationErrors.approvalContactName && (
                <FormMessage>{validationErrors.approvalContactName as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="approvalContactEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Approval Contact Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} disabled={isSubmitting} />
              </FormControl>
              {validationErrors.approvalContactEmail && (
                <FormMessage>{validationErrors.approvalContactEmail as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="approvalContactPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Approval Contact Phone</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              {validationErrors.approvalContactPhone && (
                <FormMessage>{validationErrors.approvalContactPhone as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department (Optional)</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              {validationErrors.department && (
                <FormMessage>{validationErrors.department as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="costCenter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cost Center (Optional)</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              {validationErrors.costCenter && (
                <FormMessage>{validationErrors.costCenter as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
