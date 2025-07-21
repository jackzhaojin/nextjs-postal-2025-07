'use client';

import { useCallback } from 'react';
import { ContactInfo } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PhoneIcon, MailIcon, UserIcon, BuildingIcon } from 'lucide-react';

interface ContactInfoSectionProps {
  value: ContactInfo;
  onChange: (contactInfo: ContactInfo) => void;
  errors?: Record<string, string>;
  required?: boolean;
  prefix?: string;
  title?: string;
}

export function ContactInfoSection({
  value,
  onChange,
  errors = {},
  required = false,
  prefix = 'contact',
  title = 'Contact Information'
}: ContactInfoSectionProps) {
  console.log('ContactInfoSection: Rendering with value:', value);
  console.log('ContactInfoSection: Errors:', errors);

  // Handle field changes
  const handleFieldChange = useCallback((field: keyof ContactInfo, fieldValue: string) => {
    console.log('ContactInfoSection: Field changed:', field, fieldValue);
    onChange({
      ...value,
      [field]: fieldValue
    });
  }, [value, onChange]);

  // Format phone number as user types
  const handlePhoneChange = useCallback((phone: string) => {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Format based on length
    let formattedPhone = digits;
    if (digits.length >= 6) {
      formattedPhone = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    } else if (digits.length >= 3) {
      formattedPhone = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    }
    
    console.log('ContactInfoSection: Phone formatted from', phone, 'to', formattedPhone);
    handleFieldChange('phone', formattedPhone);
  }, [handleFieldChange]);

  return (
    <Card className="rounded-3xl shadow-[0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <UserIcon className="w-5 h-5 text-blue-600" />
          {title}
          {required && <span className="text-red-500">*</span>}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Name and Company Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor={`${prefix}-name`} className="text-sm font-medium">
              Contact Name {required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={`${prefix}-name`}
              value={value.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              placeholder="Full name"
              className={`rounded-xl ${errors.name ? 'border-red-500' : ''}`}
              autoComplete="name"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor={`${prefix}-company`} className="text-sm font-medium flex items-center gap-1">
              <BuildingIcon className="w-4 h-4" />
              Company Name
            </Label>
            <Input
              id={`${prefix}-company`}
              value={value.company || ''}
              onChange={(e) => handleFieldChange('company', e.target.value)}
              placeholder="Company name"
              className="rounded-xl"
              autoComplete="organization"
            />
          </div>
        </div>

        {/* Phone and Extension Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1">
            <Label htmlFor={`${prefix}-phone`} className="text-sm font-medium flex items-center gap-1">
              <PhoneIcon className="w-4 h-4" />
              Phone Number {required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={`${prefix}-phone`}
              type="tel"
              value={value.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="(555) 123-4567"
              className={`rounded-xl ${errors.phone ? 'border-red-500' : ''}`}
              autoComplete="tel"
              maxLength={14} // For formatted phone number
            />
            {errors.phone && (
              <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor={`${prefix}-extension`} className="text-sm font-medium">
              Extension
            </Label>
            <Input
              id={`${prefix}-extension`}
              value={value.extension || ''}
              onChange={(e) => handleFieldChange('extension', e.target.value)}
              placeholder="Ext."
              className="rounded-xl"
              maxLength={10}
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <Label htmlFor={`${prefix}-email`} className="text-sm font-medium flex items-center gap-1">
            <MailIcon className="w-4 h-4" />
            Email Address {required && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id={`${prefix}-email`}
            type="email"
            value={value.email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            placeholder="contact@company.com"
            className={`rounded-xl ${errors.email ? 'border-red-500' : ''}`}
            autoComplete="email"
          />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email}</p>
          )}
        </div>

        {/* Validation Helper Text */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Phone number will be used for pickup and delivery notifications</p>
          <p>• Email address will receive shipment confirmations and tracking updates</p>
          {value.company && (
            <p>• Company information may affect pricing and service options</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}