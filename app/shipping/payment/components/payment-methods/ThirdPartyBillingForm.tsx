// Third Party Billing Form Component
// Task 6.1: Payment Method Selection - Third-party billing form with validation

'use client';

import React, { useState, useCallback } from 'react';
import type { PaymentFormProps, ThirdPartyBillingInfo, MonetaryAmount } from '@/lib/payment/types';
import type { ContactInfo, Address } from '@/lib/types';
import { formatCurrency, validateFileUpload, formatFileSize } from '@/lib/payment/utils';

export default function ThirdPartyBillingForm({
  data,
  onChange,
  errors = [],
  isSubmitting = false,
  shipmentTotal,
  className = ''
}: PaymentFormProps) {
  console.log('Rendering ThirdPartyBillingForm:', { data, shipmentTotal, errorCount: errors.length });

  const [localData, setLocalData] = useState<ThirdPartyBillingInfo>(() => ({
    accountNumber: data?.thirdPartyBilling?.accountNumber || '',
    companyName: data?.thirdPartyBilling?.companyName || '',
    contactInfo: data?.thirdPartyBilling?.contactInfo || {
      name: '',
      company: '',
      phone: '',
      email: '',
      extension: ''
    },
    billingAddress: data?.thirdPartyBilling?.billingAddress || {
      address: '',
      suite: '',
      city: '',
      state: '',
      zip: '',
      country: 'US',
      isResidential: false,
      contactInfo: {
        name: '',
        company: '',
        phone: '',
        email: '',
        extension: ''
      },
      locationType: 'commercial',
      locationDescription: ''
    },
    authorizationCode: data?.thirdPartyBilling?.authorizationCode || '',
    relationshipType: data?.thirdPartyBilling?.relationshipType || 'partner',
    authorizationDocument: data?.thirdPartyBilling?.authorizationDocument,
    billingInstructions: data?.thirdPartyBilling?.billingInstructions || '',
    creditLimit: data?.thirdPartyBilling?.creditLimit,
    isVerified: data?.thirdPartyBilling?.isVerified || false,
    verificationDate: data?.thirdPartyBilling?.verificationDate
  }));

  const [uploadingFile, setUploadingFile] = useState(false);

  const handleFieldChange = useCallback((field: keyof ThirdPartyBillingInfo, value: any) => {
    console.log('Third-party billing field changed:', { field, value });
    
    setLocalData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Trigger parent onChange
      onChange({
        ...data,
        thirdPartyBilling: updated
      });
      
      return updated;
    });
  }, [data, onChange]);

  const handleContactChange = useCallback((field: string, value: string) => {
    console.log('Third-party contact field changed:', { field, value });
    
    const updatedContact = {
      ...localData.contactInfo,
      [field]: value
    };
    
    handleFieldChange('contactInfo', updatedContact);
  }, [localData.contactInfo, handleFieldChange]);

  const handleAddressChange = useCallback((field: string, value: any) => {
    console.log('Third-party address field changed:', { field, value });
    
    const updatedAddress = {
      ...localData.billingAddress,
      [field]: value
    };
    
    handleFieldChange('billingAddress', updatedAddress);
  }, [localData.billingAddress, handleFieldChange]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('Uploading authorization document:', file.name);
    
    const validation = validateFileUpload(file);
    if (!validation.valid) {
      console.error('File validation failed:', validation.errors);
      // In a real app, show error to user
      return;
    }

    setUploadingFile(true);
    
    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const uploadedFile = {
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date().toISOString(),
        status: 'completed' as const,
        url: `https://example.com/uploads/${file.name}`,
        checksum: 'mock-checksum'
      };
      
      handleFieldChange('authorizationDocument', uploadedFile);
      console.log('File uploaded successfully:', uploadedFile);
    } catch (error) {
      console.error('File upload failed:', error);
    } finally {
      setUploadingFile(false);
    }
  }, [handleFieldChange]);

  const simulateAccountVerification = useCallback(async () => {
    if (!localData.accountNumber) return;
    
    console.log('Simulating account verification for:', localData.accountNumber);
    
    // Simulate API call for account verification
    setTimeout(() => {
      const isValid = localData.accountNumber.length >= 8;
      handleFieldChange('isVerified', isValid);
      if (isValid) {
        handleFieldChange('verificationDate', new Date().toISOString());
      }
      console.log('Account verification result:', isValid);
    }, 1000);
  }, [localData.accountNumber, handleFieldChange]);

  const getFieldError = (fieldName: string) => {
    return errors.find(error => error.field.includes(fieldName))?.message;
  };

  const isAccountNumberValid = localData.accountNumber.match(/^\d{8,15}$/);

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Third-Party Billing Information</h3>

      <div className="space-y-6">
        {/* Account Information */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Account Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="account-number" className="block text-sm font-medium text-gray-700 mb-2">
                Account Number *
              </label>
              <div className="flex">
                <input
                  id="account-number"
                  type="text"
                  value={localData.accountNumber}
                  onChange={(e) => handleFieldChange('accountNumber', e.target.value)}
                  placeholder="12345678"
                  maxLength={15}
                  className={`flex-1 px-3 py-2 border rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    getFieldError('accountNumber') || !isAccountNumberValid ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                  required
                />
                <button
                  type="button"
                  onClick={simulateAccountVerification}
                  disabled={!localData.accountNumber || isSubmitting}
                  className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Verify
                </button>
              </div>
              {getFieldError('accountNumber') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('accountNumber')}</p>
              )}
              {localData.accountNumber && !isAccountNumberValid && (
                <p className="mt-1 text-sm text-red-600">
                  Account number must be 8-15 digits
                </p>
              )}
              {localData.isVerified && (
                <p className="mt-1 text-sm text-green-600 flex items-center">
                  <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Account verified
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                8-15 digits, will be verified
              </p>
            </div>

            <div>
              <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                id="company-name"
                type="text"
                value={localData.companyName}
                onChange={(e) => handleFieldChange('companyName', e.target.value)}
                placeholder="Third Party Company Inc."
                maxLength={100}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  getFieldError('companyName') ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
                required
              />
              {getFieldError('companyName') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('companyName')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Relationship Type */}
        <div>
          <label htmlFor="relationship-type" className="block text-sm font-medium text-gray-700 mb-2">
            Relationship Type *
          </label>
          <select
            id="relationship-type"
            value={localData.relationshipType}
            onChange={(e) => handleFieldChange('relationshipType', e.target.value as any)}
            className={`w-full max-w-xs px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              getFieldError('relationshipType') ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
            required
          >
            <option value="parent-company">Parent Company</option>
            <option value="subsidiary">Subsidiary</option>
            <option value="partner">Business Partner</option>
            <option value="vendor">Vendor</option>
            <option value="customer">Customer</option>
            <option value="other">Other</option>
          </select>
          {getFieldError('relationshipType') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('relationshipType')}</p>
          )}
        </div>

        {/* Contact Information */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Contact Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Name *
              </label>
              <input
                id="contact-name"
                type="text"
                value={localData.contactInfo.name}
                onChange={(e) => handleContactChange('name', e.target.value)}
                placeholder="Jane Doe"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  getFieldError('contactInfo.name') ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
                required
              />
              {getFieldError('contactInfo.name') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('contactInfo.name')}</p>
              )}
            </div>

            <div>
              <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                id="contact-email"
                type="email"
                value={localData.contactInfo.email}
                onChange={(e) => handleContactChange('email', e.target.value)}
                placeholder="jane.doe@company.com"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  getFieldError('contactInfo.email') ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
                required
              />
              {getFieldError('contactInfo.email') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('contactInfo.email')}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Business email required
              </p>
            </div>

            <div>
              <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                id="contact-phone"
                type="tel"
                value={localData.contactInfo.phone}
                onChange={(e) => handleContactChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  getFieldError('contactInfo.phone') ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
                required
              />
              {getFieldError('contactInfo.phone') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('contactInfo.phone')}</p>
              )}
            </div>

            <div>
              <label htmlFor="contact-extension" className="block text-sm font-medium text-gray-700 mb-1">
                Extension
              </label>
              <input
                id="contact-extension"
                type="text"
                value={localData.contactInfo.extension || ''}
                onChange={(e) => handleContactChange('extension', e.target.value)}
                placeholder="1234"
                maxLength={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        {/* Billing Address */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Billing Address</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="billing-address" className="block text-sm font-medium text-gray-700 mb-1">
                Street Address *
              </label>
              <input
                id="billing-address"
                type="text"
                value={localData.billingAddress.address}
                onChange={(e) => handleAddressChange('address', e.target.value)}
                placeholder="123 Business Ave"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  getFieldError('billingAddress.address') ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
                required
              />
              {getFieldError('billingAddress.address') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('billingAddress.address')}</p>
              )}
            </div>

            <div>
              <label htmlFor="billing-city" className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                id="billing-city"
                type="text"
                value={localData.billingAddress.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                placeholder="City"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  getFieldError('billingAddress.city') ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
                required
              />
              {getFieldError('billingAddress.city') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('billingAddress.city')}</p>
              )}
            </div>

            <div>
              <label htmlFor="billing-state" className="block text-sm font-medium text-gray-700 mb-1">
                State *
              </label>
              <input
                id="billing-state"
                type="text"
                value={localData.billingAddress.state}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                placeholder="State"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  getFieldError('billingAddress.state') ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
                required
              />
              {getFieldError('billingAddress.state') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('billingAddress.state')}</p>
              )}
            </div>

            <div>
              <label htmlFor="billing-zip" className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code *
              </label>
              <input
                id="billing-zip"
                type="text"
                value={localData.billingAddress.zip}
                onChange={(e) => handleAddressChange('zip', e.target.value)}
                placeholder="12345"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  getFieldError('billingAddress.zip') ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
                required
              />
              {getFieldError('billingAddress.zip') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('billingAddress.zip')}</p>
              )}
            </div>

            <div>
              <label htmlFor="billing-country" className="block text-sm font-medium text-gray-700 mb-1">
                Country *
              </label>
              <select
                id="billing-country"
                value={localData.billingAddress.country}
                onChange={(e) => handleAddressChange('country', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
                required
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="MX">Mexico</option>
              </select>
            </div>
          </div>
        </div>

        {/* Authorization */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Authorization</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="auth-code" className="block text-sm font-medium text-gray-700 mb-2">
                Authorization Code
              </label>
              <input
                id="auth-code"
                type="text"
                value={localData.authorizationCode || ''}
                onChange={(e) => handleFieldChange('authorizationCode', e.target.value)}
                placeholder="AUTH123456"
                maxLength={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
              />
              <p className="mt-1 text-xs text-gray-500">
                Optional authorization code for billing
              </p>
            </div>

            <div>
              <label htmlFor="auth-document" className="block text-sm font-medium text-gray-700 mb-2">
                Authorization Document
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {localData.authorizationDocument ? (
                    <div>
                      <svg className="mx-auto h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">{localData.authorizationDocument.name}</p>
                        <p>{formatFileSize(localData.authorizationDocument.size)}</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="text-sm text-gray-600">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            onChange={handleFileUpload}
                            accept=".pdf,.doc,.docx"
                            disabled={isSubmitting || uploadingFile}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF, DOC up to 5MB</p>
                    </div>
                  )}
                  {uploadingFile && (
                    <div className="mt-2">
                      <div className="text-sm text-blue-600">Uploading...</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Billing Instructions */}
        <div>
          <label htmlFor="billing-instructions" className="block text-sm font-medium text-gray-700 mb-2">
            Billing Instructions
          </label>
          <textarea
            id="billing-instructions"
            value={localData.billingInstructions || ''}
            onChange={(e) => handleFieldChange('billingInstructions', e.target.value)}
            placeholder="Any special billing instructions or requirements"
            rows={3}
            maxLength={500}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isSubmitting}
          />
          <p className="mt-1 text-xs text-gray-500">
            {(localData.billingInstructions || '').length}/500 characters
          </p>
        </div>

        {/* Validation Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Validation Summary</h4>
          <div className="space-y-1 text-sm">
            <div className={`flex items-center ${isAccountNumberValid ? 'text-green-600' : 'text-red-600'}`}>
              <span className="mr-2">{isAccountNumberValid ? '✓' : '✗'}</span>
              Account number format valid
            </div>
            <div className={`flex items-center ${localData.isVerified ? 'text-green-600' : 'text-gray-500'}`}>
              <span className="mr-2">{localData.isVerified ? '✓' : '○'}</span>
              Account verified
            </div>
            <div className={`flex items-center ${localData.companyName ? 'text-green-600' : 'text-gray-500'}`}>
              <span className="mr-2">{localData.companyName ? '✓' : '○'}</span>
              Company name provided
            </div>
            <div className={`flex items-center ${localData.contactInfo.name && localData.contactInfo.email ? 'text-green-600' : 'text-gray-500'}`}>
              <span className="mr-2">{localData.contactInfo.name && localData.contactInfo.email ? '✓' : '○'}</span>
              Contact information complete
            </div>
            <div className={`flex items-center ${localData.billingAddress.address && localData.billingAddress.city ? 'text-green-600' : 'text-gray-500'}`}>
              <span className="mr-2">{localData.billingAddress.address && localData.billingAddress.city ? '✓' : '○'}</span>
              Billing address complete
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}