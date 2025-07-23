'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Phone, Mail, Clock, DollarSign } from 'lucide-react';
import { AccountsPayableContact, BusinessHours } from '@/lib/billing/types';

interface AccountsPayableContactSectionProps {
  contact: AccountsPayableContact;
  onContactChange: (contact: AccountsPayableContact) => void;
  validationErrors: Record<string, string>;
  isSubmitting: boolean;
}

const CONTACT_TITLES = [
  'Accounts Payable Manager',
  'Financial Controller',
  'Chief Financial Officer',
  'Accounting Manager',
  'Billing Coordinator',
  'Finance Director',
  'Accounts Receivable Manager',
  'Business Operations Manager',
  'Administrative Assistant',
  'Other'
];

const DEPARTMENTS = [
  'Accounting',
  'Finance',
  'Accounts Payable',
  'Procurement',
  'Operations',
  'Administration',
  'Legal',
  'Other'
];

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu'
];

const BUSINESS_HOURS_OPTIONS = [
  { value: '8:00-17:00', label: '8:00 AM - 5:00 PM' },
  { value: '9:00-17:00', label: '9:00 AM - 5:00 PM' },
  { value: '9:00-18:00', label: '9:00 AM - 6:00 PM' },
  { value: '8:00-16:00', label: '8:00 AM - 4:00 PM' },
  { value: 'closed', label: 'Closed' }
];

export function AccountsPayableContactSection({
  contact,
  onContactChange,
  validationErrors,
  isSubmitting
}: AccountsPayableContactSectionProps) {
  console.log('👤 [BILLING] AccountsPayableContactSection rendered with validation errors:', validationErrors);

  const handleFieldChange = (field: keyof AccountsPayableContact, value: string | boolean | number | BusinessHours) => {
    console.log(`👤 [BILLING] Contact field changed: ${field} = ${value}`);
    
    const updatedContact = {
      ...contact,
      [field]: value
    };
    
    onContactChange(updatedContact);
  };

  const handleBusinessHoursChange = (day: keyof BusinessHours, hours: string) => {
    console.log(`👤 [BILLING] Business hours changed for ${day}: ${hours}`);
    
    const updatedBusinessHours = {
      ...contact.businessHours,
      [day]: hours === 'closed' ? 'closed' : { start: hours.split('-')[0], end: hours.split('-')[1] }
    };
    
    handleFieldChange('businessHours', updatedBusinessHours);
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isBusinessEmail = (email: string) => {
    const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    return domain && !personalDomains.includes(domain);
  };

  return (
    <Card className="w-full" data-testid="accounts-payable-contact-section">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Accounts Payable Contact
        </CardTitle>
        <p className="text-sm text-gray-600">
          Primary contact for billing, invoices, and payment processing
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="ap-full-name" className="text-sm font-medium">
            Full Name *
          </Label>
          <Input
            id="ap-full-name"
            data-testid="ap-full-name"
            type="text"
            value={contact.fullName}
            onChange={(e) => handleFieldChange('fullName', e.target.value)}
            placeholder="John Smith"
            disabled={isSubmitting}
            className={validationErrors['accountsPayableContact.fullName'] ? 'border-red-500' : ''}
          />
          {validationErrors['accountsPayableContact.fullName'] && (
            <p className="text-sm text-red-600" data-testid="error-ap-full-name">
              {validationErrors['accountsPayableContact.fullName']}
            </p>
          )}
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="ap-title" className="text-sm font-medium">
            Job Title *
          </Label>
          <Select
            value={contact.title}
            onValueChange={(value) => handleFieldChange('title', value)}
            disabled={isSubmitting}
          >
            <SelectTrigger 
              id="ap-title"
              data-testid="ap-title"
              className={validationErrors['accountsPayableContact.title'] ? 'border-red-500' : ''}
            >
              <SelectValue placeholder="Select job title" />
            </SelectTrigger>
            <SelectContent>
              {CONTACT_TITLES.map((title) => (
                <SelectItem key={title} value={title}>
                  {title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors['accountsPayableContact.title'] && (
            <p className="text-sm text-red-600" data-testid="error-ap-title">
              {validationErrors['accountsPayableContact.title']}
            </p>
          )}
        </div>

        {/* Department */}
        <div className="space-y-2">
          <Label htmlFor="ap-department" className="text-sm font-medium">
            Department *
          </Label>
          <Select
            value={contact.department}
            onValueChange={(value) => handleFieldChange('department', value)}
            disabled={isSubmitting}
          >
            <SelectTrigger 
              id="ap-department"
              data-testid="ap-department"
              className={validationErrors['accountsPayableContact.department'] ? 'border-red-500' : ''}
            >
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors['accountsPayableContact.department'] && (
            <p className="text-sm text-red-600" data-testid="error-ap-department">
              {validationErrors['accountsPayableContact.department']}
            </p>
          )}
        </div>

        {/* Phone Number with Extension */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ap-phone" className="text-sm font-medium flex items-center gap-1">
              <Phone className="w-4 h-4" />
              Phone Number *
            </Label>
            <Input
              id="ap-phone"
              data-testid="ap-phone"
              type="tel"
              value={contact.phone}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              placeholder="(555) 123-4567"
              disabled={isSubmitting}
              className={validationErrors['accountsPayableContact.phone'] ? 'border-red-500' : ''}
            />
            {validationErrors['accountsPayableContact.phone'] && (
              <p className="text-sm text-red-600" data-testid="error-ap-phone">
                {validationErrors['accountsPayableContact.phone']}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ap-phone-extension" className="text-sm font-medium">
              Extension (Optional)
            </Label>
            <Input
              id="ap-phone-extension"
              data-testid="ap-phone-extension"
              type="text"
              value={contact.phoneExtension || ''}
              onChange={(e) => handleFieldChange('phoneExtension', e.target.value)}
              placeholder="1234"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Email Address */}
        <div className="space-y-2">
          <Label htmlFor="ap-email" className="text-sm font-medium flex items-center gap-1">
            <Mail className="w-4 h-4" />
            Business Email Address *
          </Label>
          <Input
            id="ap-email"
            data-testid="ap-email"
            type="email"
            value={contact.email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            placeholder="john.smith@company.com"
            disabled={isSubmitting}
            className={validationErrors['accountsPayableContact.email'] ? 'border-red-500' : ''}
          />
          {contact.email && isValidEmail(contact.email) && !isBusinessEmail(contact.email) && (
            <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
              <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                Personal Email Detected
              </Badge>
              <span className="text-sm text-yellow-700">
                Business email recommended for B2B transactions
              </span>
            </div>
          )}
          {validationErrors['accountsPayableContact.email'] && (
            <p className="text-sm text-red-600" data-testid="error-ap-email">
              {validationErrors['accountsPayableContact.email']}
            </p>
          )}
        </div>

        {/* Alternate Email */}
        <div className="space-y-2">
          <Label htmlFor="ap-alternate-email" className="text-sm font-medium">
            Alternate Email (Optional)
          </Label>
          <Input
            id="ap-alternate-email"
            data-testid="ap-alternate-email"
            type="email"
            value={contact.alternateEmail || ''}
            onChange={(e) => handleFieldChange('alternateEmail', e.target.value)}
            placeholder="backup@company.com"
            disabled={isSubmitting}
          />
        </div>

        {/* Preferred Contact Method */}
        <div className="space-y-2">
          <Label htmlFor="ap-preferred-contact" className="text-sm font-medium">
            Preferred Contact Method *
          </Label>
          <Select
            value={contact.preferredContactMethod}
            onValueChange={(value: 'email' | 'phone') => handleFieldChange('preferredContactMethod', value)}
            disabled={isSubmitting}
          >
            <SelectTrigger 
              id="ap-preferred-contact"
              data-testid="ap-preferred-contact"
              className={validationErrors['accountsPayableContact.preferredContactMethod'] ? 'border-red-500' : ''}
            >
              <SelectValue placeholder="Select preferred method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
            </SelectContent>
          </Select>
          {validationErrors['accountsPayableContact.preferredContactMethod'] && (
            <p className="text-sm text-red-600" data-testid="error-ap-preferred-contact">
              {validationErrors['accountsPayableContact.preferredContactMethod']}
            </p>
          )}
        </div>

        {/* Business Hours */}
        <div className="space-y-4">
          <Label className="text-sm font-medium flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Business Hours & Time Zone
          </Label>
          
          {/* Timezone */}
          <div className="space-y-2">
            <Label htmlFor="ap-timezone" className="text-sm font-medium">
              Time Zone *
            </Label>
            <Select
              value={contact.businessHours.timezone}
              onValueChange={(value) => handleBusinessHoursChange('timezone', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger 
                id="ap-timezone"
                data-testid="ap-timezone"
              >
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz.replace('America/', '').replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Weekly Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map((day) => (
              <div key={day} className="space-y-1">
                <Label className="text-sm font-medium capitalize">
                  {day}
                </Label>
                <Select
                  value={typeof contact.businessHours[day as keyof BusinessHours] === 'object' 
                    ? `${(contact.businessHours[day as keyof BusinessHours] as any).start}-${(contact.businessHours[day as keyof BusinessHours] as any).end}` 
                    : contact.businessHours[day as keyof BusinessHours] as string}
                  onValueChange={(value) => handleBusinessHoursChange(day as keyof BusinessHours, value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger data-testid={`business-hours-${day}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_HOURS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>

        {/* Authorization Level */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="authorized-signer"
              checked={contact.isAuthorizedSigner}
              onCheckedChange={(checked) => handleFieldChange('isAuthorizedSigner', checked as boolean)}
              disabled={isSubmitting}
            />
            <Label htmlFor="authorized-signer" className="text-sm font-medium">
              Authorized to sign purchase orders and approve payments
            </Label>
          </div>

          {contact.isAuthorizedSigner && (
            <div className="space-y-2">
              <Label htmlFor="po-limit" className="text-sm font-medium flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                Purchase Order Authorization Limit (Optional)
              </Label>
              <Input
                id="po-limit"
                data-testid="po-limit"
                type="number"
                value={contact.purchaseOrderLimit || ''}
                onChange={(e) => handleFieldChange('purchaseOrderLimit', parseInt(e.target.value) || 0)}
                placeholder="50000"
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500">
                Maximum dollar amount this contact can authorize for purchase orders
              </p>
            </div>
          )}
        </div>

        {/* Contact Summary */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Contact Summary</h4>
          <div className="space-y-1 text-sm text-gray-700">
            <p><strong>Primary Contact:</strong> {contact.fullName || 'Not specified'}</p>
            <p><strong>Department:</strong> {contact.department || 'Not specified'}</p>
            <p><strong>Contact Method:</strong> {contact.preferredContactMethod || 'Not specified'}</p>
            <p><strong>Authorization Level:</strong> {contact.isAuthorizedSigner ? 'Authorized Signer' : 'Standard Contact'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default AccountsPayableContactSection;
