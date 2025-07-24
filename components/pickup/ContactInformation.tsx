'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Phone, Mail, User, Shield, Clock, UserPlus } from 'lucide-react';
import { PickupContactInfo, BusinessHours, ValidationError } from '@/lib/types';

interface ContactInformationProps {
  primaryContact?: PickupContactInfo;
  backupContact?: PickupContactInfo;
  onContactUpdate: (primary: PickupContactInfo, backup?: PickupContactInfo) => void;
  validationErrors?: ValidationError[];
  isRequired?: boolean;
  className?: string;
}

interface ContactFormData {
  name: string;
  jobTitle: string;
  mobilePhone: string;
  alternativePhone: string;
  email: string;
  preferredContactMethod: 'phone' | 'email' | 'text';
  authorizationLevel: 'full' | 'limited' | 'notification-only';
}

const defaultContactData: ContactFormData = {
  name: '',
  jobTitle: '',
  mobilePhone: '',
  alternativePhone: '',
  email: '',
  preferredContactMethod: 'phone',
  authorizationLevel: 'full'
};

/**
 * ContactInformation Component
 * 
 * Task 7.3: Comprehensive contact management component for pickup scheduling
 * Features:
 * - Primary and backup contact information forms
 * - Real-time validation with business email checking
 * - Phone number formatting with international support
 * - Contact authorization level management
 * - Professional B2B contact interface
 */
export function ContactInformation({
  primaryContact,
  backupContact,
  onContactUpdate,
  validationErrors = [],
  isRequired = true,
  className = ''
}: ContactInformationProps) {
  console.log('📞 [CONTACT-INFO] Rendering contact information component');

  const [primaryData, setPrimaryData] = useState<ContactFormData>(() => ({
    name: primaryContact?.name || '',
    jobTitle: primaryContact?.jobTitle || '',
    mobilePhone: primaryContact?.mobilePhone || '',
    alternativePhone: primaryContact?.alternativePhone || '',
    email: primaryContact?.email || '',
    preferredContactMethod: primaryContact?.preferredContactMethod || 'phone',
    authorizationLevel: primaryContact?.authorizationLevel || 'full'
  }));

  const [backupData, setBackupData] = useState<ContactFormData>(() => ({
    name: backupContact?.name || '',
    jobTitle: backupContact?.jobTitle || '',
    mobilePhone: backupContact?.mobilePhone || '',
    alternativePhone: backupContact?.alternativePhone || '',
    email: backupContact?.email || '',
    preferredContactMethod: backupContact?.preferredContactMethod || 'phone',
    authorizationLevel: backupContact?.authorizationLevel || 'limited'
  }));

  const [showBackupContact, setShowBackupContact] = useState(!!backupContact);
  const [phoneFormatErrors, setPhoneFormatErrors] = useState<Record<string, string>>({});
  const [emailValidationErrors, setEmailValidationErrors] = useState<Record<string, string>>({});

  // Phone number formatting function
  const formatPhoneNumber = useCallback((value: string): string => {
    console.log('📞 [CONTACT-INFO] Formatting phone number:', value);
    
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX for US numbers
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else if (digits.length <= 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else {
      // Handle international numbers
      return `+${digits.slice(0, digits.length - 10)} (${digits.slice(-10, -7)}) ${digits.slice(-7, -4)}-${digits.slice(-4)}`;
    }
  }, []);

  // Email validation function
  const validateEmail = useCallback((email: string): { isValid: boolean; error?: string } => {
    console.log('📧 [CONTACT-INFO] Validating email:', email);
    
    if (!email) return { isValid: true };
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }
    
    // Check for business email domains (basic validation)
    const commonConsumerDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    if (commonConsumerDomains.includes(domain)) {
      return { isValid: true, error: 'Consider using a business email address for professional communications' };
    }
    
    return { isValid: true };
  }, []);

  // Phone validation function
  const validatePhone = useCallback((phone: string): { isValid: boolean; error?: string } => {
    console.log('📞 [CONTACT-INFO] Validating phone:', phone);
    
    if (!phone) return { isValid: true };
    
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      return { isValid: false, error: 'Phone number must be at least 10 digits' };
    }
    if (digits.length > 15) {
      return { isValid: false, error: 'Phone number is too long' };
    }
    
    return { isValid: true };
  }, []);

  // Handle primary contact field changes
  const handlePrimaryChange = useCallback((field: keyof ContactFormData, value: string) => {
    console.log('📞 [CONTACT-INFO] Primary contact field changed:', field, value);
    
    let formattedValue = value;
    
    // Format phone numbers
    if (field === 'mobilePhone' || field === 'alternativePhone') {
      formattedValue = formatPhoneNumber(value);
      
      // Validate phone
      const validation = validatePhone(formattedValue);
      setPhoneFormatErrors(prev => ({
        ...prev,
        [field]: validation.error || ''
      }));
    }
    
    // Validate email
    if (field === 'email') {
      const validation = validateEmail(value);
      setEmailValidationErrors(prev => ({
        ...prev,
        primary: validation.error || ''
      }));
    }
    
    setPrimaryData(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  }, [formatPhoneNumber, validatePhone, validateEmail]);

  // Handle backup contact field changes
  const handleBackupChange = useCallback((field: keyof ContactFormData, value: string) => {
    console.log('📞 [CONTACT-INFO] Backup contact field changed:', field, value);
    
    let formattedValue = value;
    
    // Format phone numbers
    if (field === 'mobilePhone' || field === 'alternativePhone') {
      formattedValue = formatPhoneNumber(value);
      
      // Validate phone
      const validation = validatePhone(formattedValue);
      setPhoneFormatErrors(prev => ({
        ...prev,
        [`backup_${field}`]: validation.error || ''
      }));
    }
    
    // Validate email
    if (field === 'email') {
      const validation = validateEmail(value);
      setEmailValidationErrors(prev => ({
        ...prev,
        backup: validation.error || ''
      }));
    }
    
    setBackupData(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  }, [formatPhoneNumber, validatePhone, validateEmail]);

  // Update parent component when data changes
  useEffect(() => {
    console.log('📞 [CONTACT-INFO] Contact data changed, updating parent');
    
    const primary: PickupContactInfo = {
      name: primaryData.name,
      jobTitle: primaryData.jobTitle || undefined,
      mobilePhone: primaryData.mobilePhone,
      alternativePhone: primaryData.alternativePhone || undefined,
      email: primaryData.email,
      preferredContactMethod: primaryData.preferredContactMethod,
      authorizationLevel: primaryData.authorizationLevel
    };
    
    let backup: PickupContactInfo | undefined;
    if (showBackupContact && backupData.name && backupData.mobilePhone && backupData.email) {
      backup = {
        name: backupData.name,
        jobTitle: backupData.jobTitle || undefined,
        mobilePhone: backupData.mobilePhone,
        alternativePhone: backupData.alternativePhone || undefined,
        email: backupData.email,
        preferredContactMethod: backupData.preferredContactMethod,
        authorizationLevel: backupData.authorizationLevel
      };
    }
    
    onContactUpdate(primary, backup);
  }, [primaryData, backupData, showBackupContact, onContactUpdate]);

  const renderContactForm = (
    data: ContactFormData, 
    onChange: (field: keyof ContactFormData, value: string) => void,
    prefix: string,
    title: string,
    isBackup = false
  ) => (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {isBackup ? <UserPlus className="h-5 w-5" /> : <User className="h-5 w-5" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Name and Job Title Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`${prefix}-name`} className="text-sm font-medium">
              Full Name {!isBackup && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={`${prefix}-name`}
              value={data.name}
              onChange={(e) => onChange('name', e.target.value)}
              placeholder="Enter full name"
              className="mt-1"
              required={!isBackup}
            />
          </div>
          <div>
            <Label htmlFor={`${prefix}-title`} className="text-sm font-medium">
              Job Title / Role
            </Label>
            <Input
              id={`${prefix}-title`}
              value={data.jobTitle}
              onChange={(e) => onChange('jobTitle', e.target.value)}
              placeholder="e.g., Shipping Manager"
              className="mt-1"
            />
          </div>
        </div>

        {/* Phone Numbers Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`${prefix}-mobile`} className="text-sm font-medium flex items-center gap-1">
              <Phone className="h-4 w-4" />
              Mobile Phone {!isBackup && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={`${prefix}-mobile`}
              type="tel"
              value={data.mobilePhone}
              onChange={(e) => onChange('mobilePhone', e.target.value)}
              placeholder="(555) 123-4567"
              className="mt-1"
              required={!isBackup}
            />
            {phoneFormatErrors[isBackup ? 'backup_mobilePhone' : 'mobilePhone'] && (
              <p className="text-sm text-red-600 mt-1">
                {phoneFormatErrors[isBackup ? 'backup_mobilePhone' : 'mobilePhone']}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor={`${prefix}-alt-phone`} className="text-sm font-medium">
              Alternative Phone
            </Label>
            <Input
              id={`${prefix}-alt-phone`}
              type="tel"
              value={data.alternativePhone}
              onChange={(e) => onChange('alternativePhone', e.target.value)}
              placeholder="(555) 987-6543"
              className="mt-1"
            />
            {phoneFormatErrors[isBackup ? 'backup_alternativePhone' : 'alternativePhone'] && (
              <p className="text-sm text-red-600 mt-1">
                {phoneFormatErrors[isBackup ? 'backup_alternativePhone' : 'alternativePhone']}
              </p>
            )}
          </div>
        </div>

        {/* Email and Preferences Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`${prefix}-email`} className="text-sm font-medium flex items-center gap-1">
              <Mail className="h-4 w-4" />
              Email Address {!isBackup && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={`${prefix}-email`}
              type="email"
              value={data.email}
              onChange={(e) => onChange('email', e.target.value)}
              placeholder="name@company.com"
              className="mt-1"
              required={!isBackup}
            />
            {emailValidationErrors[isBackup ? 'backup' : 'primary'] && (
              <p className={`text-sm mt-1 ${emailValidationErrors[isBackup ? 'backup' : 'primary'].includes('Consider') ? 'text-amber-600' : 'text-red-600'}`}>
                {emailValidationErrors[isBackup ? 'backup' : 'primary']}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor={`${prefix}-contact-method`} className="text-sm font-medium">
              Preferred Contact Method
            </Label>
            <Select value={data.preferredContactMethod} onValueChange={(value) => onChange('preferredContactMethod', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="phone">Phone Call</SelectItem>
                <SelectItem value="text">Text Message</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Authorization Level */}
        <div>
          <Label htmlFor={`${prefix}-auth`} className="text-sm font-medium flex items-center gap-1">
            <Shield className="h-4 w-4" />
            Authorization Level
          </Label>
          <Select value={data.authorizationLevel} onValueChange={(value) => onChange('authorizationLevel', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Full Authority - Can make all pickup decisions</SelectItem>
              <SelectItem value="limited">Limited Authority - Can coordinate pickup only</SelectItem>
              <SelectItem value="notification-only">Notification Only - Receive updates only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Primary Contact */}
      {renderContactForm(
        primaryData,
        handlePrimaryChange,
        'primary',
        'Primary Contact Information'
      )}

      {/* Backup Contact Toggle */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant={showBackupContact ? "default" : "outline"}
          onClick={() => setShowBackupContact(!showBackupContact)}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          {showBackupContact ? 'Remove Backup Contact' : 'Add Backup Contact'}
        </Button>
        <p className="text-sm text-gray-600">
          Recommended for reliable pickup coordination
        </p>
      </div>

      {/* Backup Contact */}
      {showBackupContact && renderContactForm(
        backupData,
        handleBackupChange,
        'backup',
        'Backup Contact Information',
        true
      )}

      {/* Contact Instructions */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">Contact Availability</p>
              <p className="text-blue-700">
                Ensure contact persons are available during pickup time. Our drivers will call the primary contact 
                30 minutes before arrival. If unavailable, we'll contact the backup contact.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
