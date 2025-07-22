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
import { Textarea } from '@/components/ui/textarea';
import {
  BillingInfo,
  companyInfoSchema,
  ValidationErrors,
  businessTypeSchema,
  industryTypeSchema,
  annualShippingVolumeSchema,
} from '@/lib/payment/billingTypes';
import { useEffect } from 'react';

interface CompanyInfoSectionProps {
  billingInfo: BillingInfo;
  onBillingInfoChange: (info: BillingInfo) => void;
  validationErrors: ValidationErrors;
  isSubmitting: boolean;
}

export function CompanyInfoSection({
  billingInfo,
  onBillingInfoChange,
  validationErrors,
  isSubmitting,
}: CompanyInfoSectionProps) {
  const form = useForm<z.infer<typeof companyInfoSchema>>({
    resolver: zodResolver(companyInfoSchema),
    defaultValues: billingInfo.companyInformation || {
      legalName: '',
      dbaName: '',
      businessType: 'Other',
      industry: 'Other',
      annualShippingVolume: '< $10K',
      businessDescription: '',
    },
  });

  useEffect(() => {
    if (billingInfo.companyInformation) {
      form.reset(billingInfo.companyInformation);
    }
  }, [billingInfo.companyInformation, form]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      onBillingInfoChange({
        ...billingInfo,
        companyInformation: value as z.infer<typeof companyInfoSchema>,
      });
    });
    return () => subscription.unsubscribe();
  }, [form, onBillingInfoChange, billingInfo]);

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          control={form.control}
          name="legalName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Legal Company Name</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              {validationErrors['companyInformation.legalName'] && (
                <FormMessage>{validationErrors['companyInformation.legalName'] as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dbaName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>DBA/Trade Name (Optional)</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              {validationErrors['companyInformation.dbaName'] && (
                <FormMessage>{validationErrors['companyInformation.dbaName'] as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="businessType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {businessTypeSchema.options.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors['companyInformation.businessType'] && (
                <FormMessage>{validationErrors['companyInformation.businessType'] as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="industry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Industry</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {industryTypeSchema.options.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors['companyInformation.industry'] && (
                <FormMessage>{validationErrors['companyInformation.industry'] as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="annualShippingVolume"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Annual Shipping Volume</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select annual shipping volume" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {annualShippingVolumeSchema.options.map((volume) => (
                    <SelectItem key={volume} value={volume}>
                      {volume}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors['companyInformation.annualShippingVolume'] && (
                <FormMessage>{validationErrors['companyInformation.annualShippingVolume'] as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="businessDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Description (Optional)</FormLabel>
              <FormControl>
                <Textarea {...field} disabled={isSubmitting} />
              </FormControl>
              {validationErrors['companyInformation.businessDescription'] && (
                <FormMessage>{validationErrors['companyInformation.businessDescription'] as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
