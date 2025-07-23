'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { FileText, Mail, Download, Clock, AlertCircle } from 'lucide-react';
import { InvoicePreferences, InvoiceDeliveryMethod, InvoiceFormat, InvoiceFrequency } from '@/lib/billing/types';

interface InvoicePreferencesSectionProps {
  preferences: InvoicePreferences;
  onPreferencesChange: (preferences: InvoicePreferences) => void;
  validationErrors: Record<string, string>;
  isSubmitting: boolean;
}

const DELIVERY_METHODS: Array<{value: InvoiceDeliveryMethod, label: string, description: string, icon: React.ReactNode}> = [
  {
    value: 'email',
    label: 'Email',
    description: 'Fastest delivery, environmentally friendly',
    icon: <Mail className="w-4 h-4" />
  },
  {
    value: 'mail',
    label: 'Postal Mail',
    description: 'Physical copy for records, 3-5 business days',
    icon: <FileText className="w-4 h-4" />
  },
  {
    value: 'edi',
    label: 'EDI Integration',
    description: 'Direct system integration for automated processing',
    icon: <Download className="w-4 h-4" />
  },
  {
    value: 'portal',
    label: 'Customer Portal',
    description: 'Access via secure online portal with download options',
    icon: <Download className="w-4 h-4" />
  }
];

const INVOICE_FORMATS: Array<{value: InvoiceFormat, label: string, description: string}> = [
  {
    value: 'standard',
    label: 'Standard',
    description: 'Basic invoice with shipping details and totals'
  },
  {
    value: 'itemized',
    label: 'Itemized',
    description: 'Detailed breakdown of all charges and fees'
  },
  {
    value: 'summary',
    label: 'Summary',
    description: 'Consolidated summary for multiple shipments'
  },
  {
    value: 'custom',
    label: 'Custom',
    description: 'Customized format to match your requirements'
  }
];

const INVOICE_FREQUENCIES: Array<{value: InvoiceFrequency, label: string, description: string}> = [
  {
    value: 'per-shipment',
    label: 'Per Shipment',
    description: 'Individual invoice for each shipment'
  },
  {
    value: 'daily',
    label: 'Daily',
    description: 'Consolidated daily invoice for all shipments'
  },
  {
    value: 'weekly',
    label: 'Weekly',
    description: 'Weekly summary invoice (Fridays)'
  },
  {
    value: 'monthly',
    label: 'Monthly',
    description: 'Monthly consolidated invoice (1st of month)'
  }
];

export function InvoicePreferencesSection({
  preferences,
  onPreferencesChange,
  validationErrors,
  isSubmitting
}: InvoicePreferencesSectionProps) {
  console.log('📋 [BILLING] InvoicePreferencesSection rendered with validation errors:', validationErrors);

  const handleFieldChange = (field: keyof InvoicePreferences, value: any) => {
    console.log(`📋 [BILLING] Invoice preference field changed: ${field} = ${value}`);
    
    const updatedPreferences = {
      ...preferences,
      [field]: value
    };
    
    onPreferencesChange(updatedPreferences);
  };

  const handleEmailListChange = (index: number, email: string) => {
    const currentEmails = preferences.emailSettings?.ccEmails || [];
    const updatedEmails = [...currentEmails];
    updatedEmails[index] = email;
    
    const updatedEmailSettings = {
      ...preferences.emailSettings,
      primaryEmail: preferences.emailSettings?.primaryEmail || '',
      ccEmails: updatedEmails,
      subjectLineFormat: preferences.emailSettings?.subjectLineFormat || 'Invoice {invoice_number}',
      attachmentFormat: preferences.emailSettings?.attachmentFormat || 'pdf' as const,
      encryptionRequired: preferences.emailSettings?.encryptionRequired || false,
      digitalSignatureRequired: preferences.emailSettings?.digitalSignatureRequired || false,
      deliveryConfirmationRequired: preferences.emailSettings?.deliveryConfirmationRequired || false,
      readReceiptRequired: preferences.emailSettings?.readReceiptRequired || false
    };
    
    handleFieldChange('emailSettings', updatedEmailSettings);
  };

  const addEmailAddress = () => {
    const currentEmails = preferences.emailSettings?.ccEmails || [];
    const updatedEmails = [...currentEmails, ''];
    
    const updatedEmailSettings = {
      ...preferences.emailSettings,
      primaryEmail: preferences.emailSettings?.primaryEmail || '',
      ccEmails: updatedEmails,
      subjectLineFormat: preferences.emailSettings?.subjectLineFormat || 'Invoice {invoice_number}',
      attachmentFormat: preferences.emailSettings?.attachmentFormat || 'pdf' as const,
      encryptionRequired: preferences.emailSettings?.encryptionRequired || false,
      digitalSignatureRequired: preferences.emailSettings?.digitalSignatureRequired || false,
      deliveryConfirmationRequired: preferences.emailSettings?.deliveryConfirmationRequired || false,
      readReceiptRequired: preferences.emailSettings?.readReceiptRequired || false
    };
    
    handleFieldChange('emailSettings', updatedEmailSettings);
  };

  const removeEmailAddress = (index: number) => {
    const currentEmails = preferences.emailSettings?.ccEmails || [];
    const updatedEmails = currentEmails.filter((_, i) => i !== index);
    
    const updatedEmailSettings = {
      ...preferences.emailSettings,
      primaryEmail: preferences.emailSettings?.primaryEmail || '',
      ccEmails: updatedEmails,
      subjectLineFormat: preferences.emailSettings?.subjectLineFormat || 'Invoice {invoice_number}',
      attachmentFormat: preferences.emailSettings?.attachmentFormat || 'pdf' as const,
      encryptionRequired: preferences.emailSettings?.encryptionRequired || false,
      digitalSignatureRequired: preferences.emailSettings?.digitalSignatureRequired || false,
      deliveryConfirmationRequired: preferences.emailSettings?.deliveryConfirmationRequired || false,
      readReceiptRequired: preferences.emailSettings?.readReceiptRequired || false
    };
    
    handleFieldChange('emailSettings', updatedEmailSettings);
  };

  const getDeliveryMethodInfo = (method: InvoiceDeliveryMethod) => {
    return DELIVERY_METHODS.find(m => m.value === method);
  };

  const getFormatInfo = (format: InvoiceFormat) => {
    return INVOICE_FORMATS.find(f => f.value === format);
  };

  const getFrequencyInfo = (frequency: InvoiceFrequency) => {
    return INVOICE_FREQUENCIES.find(f => f.value === frequency);
  };

  return (
    <Card className="w-full" data-testid="invoice-preferences-section">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Invoice Preferences
        </CardTitle>
        <p className="text-sm text-gray-600">
          Configure how you want to receive and manage invoices
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Invoice Delivery Method */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Invoice Delivery Method *
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DELIVERY_METHODS.map((method) => (
              <div
                key={method.value}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  preferences.deliveryMethod === method.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleFieldChange('deliveryMethod', method.value)}
                data-testid={`delivery-method-${method.value}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded ${
                    preferences.deliveryMethod === method.value ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    {method.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{method.label}</h4>
                    <p className="text-xs text-gray-600 mt-1">{method.description}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    preferences.deliveryMethod === method.value
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {preferences.deliveryMethod === method.value && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {validationErrors['invoicePreferences.deliveryMethod'] && (
            <p className="text-sm text-red-600" data-testid="error-delivery-method">
              {validationErrors['invoicePreferences.deliveryMethod']}
            </p>
          )}
        </div>

        {/* Email Addresses for Email Delivery */}
        {preferences.deliveryMethod === 'email' && (
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-1">
              <Mail className="w-4 h-4" />
              Invoice Email Addresses *
            </Label>
            <div className="space-y-2">
              {(preferences.emailSettings?.ccEmails || ['']).map((email: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailListChange(index, e.target.value)}
                    placeholder="invoice@company.com"
                    disabled={isSubmitting}
                    className={validationErrors[`invoicePreferences.emailSettings.ccEmails.${index}`] ? 'border-red-500' : ''}
                    data-testid={`invoice-email-${index}`}
                  />
                  {(preferences.emailSettings?.ccEmails?.length || 0) > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEmailAddress(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded"
                      disabled={isSubmitting}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addEmailAddress}
                className="text-sm text-blue-600 hover:bg-blue-50 px-3 py-2 rounded"
                disabled={isSubmitting}
              >
                + Add Another Email
              </button>
            </div>
            {validationErrors['invoicePreferences.emailSettings'] && (
              <p className="text-sm text-red-600" data-testid="error-invoice-emails">
                {validationErrors['invoicePreferences.emailSettings']}
              </p>
            )}
          </div>
        )}

        {/* EDI Configuration */}
        {preferences.deliveryMethod === 'edi' && (
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-blue-800">EDI Configuration Required</h4>
            </div>
            <p className="text-sm text-blue-700">
              EDI integration requires technical setup. Our team will contact you to configure the connection.
            </p>
            <div className="space-y-2">
              <Label htmlFor="edi-contact" className="text-sm font-medium">
                EDI Technical Contact Email
              </Label>
              <Input
                id="edi-contact"
                data-testid="edi-contact-email"
                type="email"
                value={preferences.ediSettings?.tradingPartnerAgreement || ''}
                onChange={(e) => {
                  const updatedEdiSettings = {
                    ediProvider: preferences.ediSettings?.ediProvider || '',
                    isaQualifier: preferences.ediSettings?.isaQualifier || '',
                    isaId: preferences.ediSettings?.isaId || '',
                    gsQualifier: preferences.ediSettings?.gsQualifier || '',
                    gsId: preferences.ediSettings?.gsId || '',
                    tradingPartnerAgreement: e.target.value,
                    transactionSets: preferences.ediSettings?.transactionSets || [],
                    acknowledgmentRequired: preferences.ediSettings?.acknowledgmentRequired || false,
                    testMode: preferences.ediSettings?.testMode || true
                  };
                  handleFieldChange('ediSettings', updatedEdiSettings);
                }}
                placeholder="edi-admin@company.com"
                disabled={isSubmitting}
              />
            </div>
          </div>
        )}

        {/* Invoice Format */}
        <div className="space-y-3">
          <Label htmlFor="invoice-format" className="text-sm font-medium">
            Invoice Format *
          </Label>
          <Select
            value={preferences.format}
            onValueChange={(value: InvoiceFormat) => handleFieldChange('format', value)}
            disabled={isSubmitting}
          >
            <SelectTrigger 
              id="invoice-format"
              data-testid="invoice-format"
              className={validationErrors['invoicePreferences.format'] ? 'border-red-500' : ''}
            >
              <SelectValue placeholder="Select invoice format" />
            </SelectTrigger>
            <SelectContent>
              {INVOICE_FORMATS.map((format) => (
                <SelectItem key={format.value} value={format.value}>
                  <div className="flex flex-col">
                    <span>{format.label}</span>
                    <span className="text-xs text-gray-500">{format.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors['invoicePreferences.format'] && (
            <p className="text-sm text-red-600" data-testid="error-invoice-format">
              {validationErrors['invoicePreferences.format']}
            </p>
          )}
          {preferences.format && (
            <div className="p-3 bg-gray-50 rounded border">
              <p className="text-sm text-gray-700">
                <strong>{getFormatInfo(preferences.format)?.label}:</strong> {getFormatInfo(preferences.format)?.description}
              </p>
            </div>
          )}
        </div>

        {/* Invoice Frequency */}
        <div className="space-y-3">
          <Label htmlFor="invoice-frequency" className="text-sm font-medium flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Invoice Frequency *
          </Label>
          <Select
            value={preferences.frequency}
            onValueChange={(value: InvoiceFrequency) => handleFieldChange('frequency', value)}
            disabled={isSubmitting}
          >
            <SelectTrigger 
              id="invoice-frequency"
              data-testid="invoice-frequency"
              className={validationErrors['invoicePreferences.frequency'] ? 'border-red-500' : ''}
            >
              <SelectValue placeholder="Select invoice frequency" />
            </SelectTrigger>
            <SelectContent>
              {INVOICE_FREQUENCIES.map((frequency) => (
                <SelectItem key={frequency.value} value={frequency.value}>
                  <div className="flex flex-col">
                    <span>{frequency.label}</span>
                    <span className="text-xs text-gray-500">{frequency.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors['invoicePreferences.frequency'] && (
            <p className="text-sm text-red-600" data-testid="error-invoice-frequency">
              {validationErrors['invoicePreferences.frequency']}
            </p>
          )}
          {preferences.frequency && (
            <div className="p-3 bg-gray-50 rounded border">
              <p className="text-sm text-gray-700">
                <strong>{getFrequencyInfo(preferences.frequency)?.label}:</strong> {getFrequencyInfo(preferences.frequency)?.description}
              </p>
            </div>
          )}
        </div>

        {/* Purchase Order Requirement */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="require-po"
              checked={preferences.purchaseOrderRequired || false}
              onCheckedChange={(checked) => handleFieldChange('purchaseOrderRequired', checked as boolean)}
              disabled={isSubmitting}
            />
            <Label htmlFor="require-po" className="text-sm font-medium">
              Require Purchase Order number on all invoices
            </Label>
          </div>
          
          {preferences.purchaseOrderRequired && (
            <div className="space-y-2">
              <Label htmlFor="po-format" className="text-sm font-medium">
                Purchase Order Number Format (Optional)
              </Label>
              <Input
                id="po-format"
                data-testid="po-format"
                type="text"
                value={preferences.customRequirements || ''}
                onChange={(e) => handleFieldChange('customRequirements', e.target.value)}
                placeholder="e.g., PO-YYYY-NNNN"
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500">
                Specify format requirements for PO numbers (optional)
              </p>
            </div>
          )}
        </div>

        {/* Special Instructions */}
        <div className="space-y-2">
          <Label htmlFor="special-instructions" className="text-sm font-medium">
            Special Invoice Instructions (Optional)
          </Label>
          <Textarea
            id="special-instructions"
            data-testid="special-instructions"
            value={preferences.customRequirements || ''}
            onChange={(e) => handleFieldChange('customRequirements', e.target.value)}
            placeholder="Any special requirements for invoice processing, reference numbers, or formatting..."
            rows={3}
            disabled={isSubmitting}
            maxLength={500}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Special requirements for invoice processing</span>
            <span>{(preferences.customRequirements || '').length}/500</span>
          </div>
        </div>

        {/* Invoice Preferences Summary */}
        <div className="p-4 bg-green-50 rounded-lg">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Invoice Configuration Summary
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-white">
                {preferences.deliveryMethod ? getDeliveryMethodInfo(preferences.deliveryMethod)?.label : 'Not Selected'}
              </Badge>
              <Badge variant="outline" className="bg-white">
                {preferences.format ? getFormatInfo(preferences.format)?.label : 'Not Selected'}
              </Badge>
              <Badge variant="outline" className="bg-white">
                {preferences.frequency ? getFrequencyInfo(preferences.frequency)?.label : 'Not Selected'}
              </Badge>
            </div>
            <div className="text-sm text-gray-700">
              {preferences.deliveryMethod === 'email' && (
                <p><strong>Email Recipients:</strong> {(preferences.emailSettings?.ccEmails || []).filter((e: string) => e).length} email(s)</p>
              )}
              <p><strong>PO Required:</strong> {preferences.purchaseOrderRequired ? 'Yes' : 'No'}</p>
              {preferences.customRequirements && (
                <p><strong>Special Instructions:</strong> {preferences.customRequirements.slice(0, 50)}{preferences.customRequirements.length > 50 ? '...' : ''}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default InvoicePreferencesSection;
