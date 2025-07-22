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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BillingInfo,
  billingAddressSchema,
  ValidationErrors,
} from '@/lib/payment/billingTypes';
import { Address } from '@/lib/types';
import { useEffect } from 'react';

interface BillingAddressSectionProps {
  billingInfo: BillingInfo;
  onBillingInfoChange: (info: BillingInfo) => void;
  validationErrors: ValidationErrors;
  isSubmitting: boolean;
  originAddress?: Address;
}

export function BillingAddressSection({
  billingInfo,
  onBillingInfoChange,
  validationErrors,
  isSubmitting,
  originAddress,
}: BillingAddressSectionProps) {
  const form = useForm<z.infer<typeof billingAddressSchema>>({
    resolver: zodResolver(billingAddressSchema),
    defaultValues: billingInfo.billingAddress || {
      address: '',
      suite: '',
      city: '',
      state: '',
      zip: '',
      country: '',
      isResidential: false,
      contactInfo: { name: '', phone: '', email: '' },
      locationType: 'commercial',
    },
  });

  useEffect(() => {
    if (billingInfo.billingAddress) {
      form.reset(billingInfo.billingAddress);
    }
  }, [billingInfo.billingAddress, form]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      onBillingInfoChange({
        ...billingInfo,
        billingAddress: value as z.infer<typeof billingAddressSchema>,
      });
    });
    return () => subscription.unsubscribe();
  }, [form, onBillingInfoChange, billingInfo]);

  const handleSameAsOriginChange = (checked: boolean) => {
    if (checked && originAddress) {
      form.setValue('address', originAddress.address);
      form.setValue('suite', originAddress.suite);
      form.setValue('city', originAddress.city);
      form.setValue('state', originAddress.state);
      form.setValue('zip', originAddress.zip);
      form.setValue('country', originAddress.country);
      form.setValue('isResidential', originAddress.isResidential);
      form.setValue('contactInfo', originAddress.contactInfo);
      form.setValue('locationType', originAddress.locationType);
    } else if (!checked) {
      form.reset({
        address: '',
        suite: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        isResidential: false,
        contactInfo: { name: '', phone: '', email: '' },
        locationType: 'commercial',
      });
    }
    onBillingInfoChange({
      ...billingInfo,
      sameAsOriginAddress: checked,
      billingAddress: form.getValues(),
    });
  };

  return (
    <Form {...form}>
      <form className="space-y-4">
        {originAddress && (
          <FormField
            control={form.control}
            name="sameAsOriginAddress"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                <FormControl>
                  <Checkbox
                    checked={billingInfo.sameAsOriginAddress}
                    onCheckedChange={handleSameAsOriginChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Same as Origin Address
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street Address</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting || billingInfo.sameAsOriginAddress} />
              </FormControl>
              {validationErrors.address && (
                <FormMessage>{validationErrors.address as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="suite"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Suite/Apt (Optional)</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting || billingInfo.sameAsOriginAddress} />
              </FormControl>
              {validationErrors.suite && (
                <FormMessage>{validationErrors.suite as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isSubmitting || billingInfo.sameAsOriginAddress} />
                </FormControl>
                {validationErrors.city && (
                  <FormMessage>{validationErrors.city as string}</FormMessage>
                )}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isSubmitting || billingInfo.sameAsOriginAddress} />
                </FormControl>
                {validationErrors.state && (
                  <FormMessage>{validationErrors.state as string}</FormMessage>
                )}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="zip"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ZIP Code</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isSubmitting || billingInfo.sameAsOriginAddress} />
                </FormControl>
                {validationErrors.zip && (
                  <FormMessage>{validationErrors.zip as string}</FormMessage>
                )}
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting || billingInfo.sameAsOriginAddress} />
              </FormControl>
              {validationErrors.country && (
                <FormMessage>{validationErrors.country as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isResidential"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting || billingInfo.sameAsOriginAddress}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Residential Address
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="locationType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting || billingInfo.sameAsOriginAddress}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                  <SelectItem value="storage">Storage</SelectItem>
                  <SelectItem value="construction">Construction</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.locationType && (
                <FormMessage>{validationErrors.locationType as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="locationDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location Description (Optional)</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting || billingInfo.sameAsOriginAddress} />
              </FormControl>
              {validationErrors.locationDescription && (
                <FormMessage>{validationErrors.locationDescription as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <h3 className="text-lg font-semibold mt-6 mb-2">Contact Information</h3>
        <FormField
          control={form.control}
          name="contactInfo.name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Name</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting || billingInfo.sameAsOriginAddress} />
              </FormControl>
              {validationErrors['contactInfo.name'] && (
                <FormMessage>{validationErrors['contactInfo.name'] as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contactInfo.company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company (Optional)</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting || billingInfo.sameAsOriginAddress} />
              </FormControl>
              {validationErrors['contactInfo.company'] && (
                <FormMessage>{validationErrors['contactInfo.company'] as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contactInfo.phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting || billingInfo.sameAsOriginAddress} />
              </FormControl>
              {validationErrors['contactInfo.phone'] && (
                <FormMessage>{validationErrors['contactInfo.phone'] as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contactInfo.email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} disabled={isSubmitting || billingInfo.sameAsOriginAddress} />
              </FormControl>
              {validationErrors['contactInfo.email'] && (
                <FormMessage>{validationErrors['contactInfo.email'] as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contactInfo.extension"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Extension (Optional)</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting || billingInfo.sameAsOriginAddress} />
              </FormControl>
              {validationErrors['contactInfo.extension'] && (
                <FormMessage>{validationErrors['contactInfo.extension'] as string}</FormMessage>
              )}
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
