// Net Terms Form Component
// Task 6.1: Payment Method Selection - Net terms form with file upload and references

'use client';

import React, { useState, useCallback } from 'react';
import type { PaymentFormProps, NetTermsInfo, TradeReference, BankReference, MonetaryAmount, FileUpload } from '@/lib/payment/types';
import { formatCurrency, validateFileUpload, formatFileSize } from '@/lib/payment/utils';

export default function NetTermsForm({
  data,
  onChange,
  errors = [],
  isSubmitting = false,
  shipmentTotal,
  className = ''
}: PaymentFormProps) {
  console.log('Rendering NetTermsForm:', { data, shipmentTotal, errorCount: errors.length });

  const [localData, setLocalData] = useState<NetTermsInfo>(() => ({
    period: data?.netTerms?.period || 30,
    creditApplication: data?.netTerms?.creditApplication,
    tradeReferences: data?.netTerms?.tradeReferences || [],
    annualRevenue: data?.netTerms?.annualRevenue || 'under-100k',
    yearsInBusiness: data?.netTerms?.yearsInBusiness || 0,
    bankReferences: data?.netTerms?.bankReferences || [],
    financialStatements: data?.netTerms?.financialStatements || [],
    creditScore: data?.netTerms?.creditScore,
    requestedCreditLimit: data?.netTerms?.requestedCreditLimit || { amount: shipmentTotal.amount * 10, currency: shipmentTotal.currency },
    businessType: data?.netTerms?.businessType || 'corporation',
    taxIdNumber: data?.netTerms?.taxIdNumber || '',
    dunsNumber: data?.netTerms?.dunsNumber || ''
  }));

  const [uploadingFiles, setUploadingFiles] = useState<{ [key: string]: boolean }>({});

  const handleFieldChange = useCallback((field: keyof NetTermsInfo, value: any) => {
    console.log('Net terms field changed:', { field, value });
    
    setLocalData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Trigger parent onChange
      onChange({
        ...data,
        netTerms: updated
      });
      
      return updated;
    });
  }, [data, onChange]);

  const handleCreditLimitChange = useCallback((value: string) => {
    console.log('Credit limit changed:', value);
    
    const amount = parseFloat(value) || 0;
    const updatedLimit: MonetaryAmount = {
      amount,
      currency: shipmentTotal.currency
    };
    
    handleFieldChange('requestedCreditLimit', updatedLimit);
  }, [shipmentTotal.currency, handleFieldChange]);

  // Trade References Management
  const addTradeReference = useCallback(() => {
    console.log('Adding trade reference');
    
    const newReference: TradeReference = {
      companyName: '',
      contactName: '',
      contactTitle: '',
      phone: '',
      email: '',
      relationship: '',
      accountOpenDate: '',
      creditLimit: { amount: 0, currency: shipmentTotal.currency },
      currentBalance: { amount: 0, currency: shipmentTotal.currency },
      paymentHistory: 'good',
      averagePaymentDays: 30
    };
    
    handleFieldChange('tradeReferences', [...localData.tradeReferences, newReference]);
  }, [localData.tradeReferences, shipmentTotal.currency, handleFieldChange]);

  const removeTradeReference = useCallback((index: number) => {
    console.log('Removing trade reference:', index);
    
    const updatedReferences = localData.tradeReferences.filter((_, i) => i !== index);
    handleFieldChange('tradeReferences', updatedReferences);
  }, [localData.tradeReferences, handleFieldChange]);

  const updateTradeReference = useCallback((index: number, field: string, value: any) => {
    console.log('Updating trade reference:', { index, field, value });
    
    const updatedReferences = localData.tradeReferences.map((ref, i) =>
      i === index ? { ...ref, [field]: value } : ref
    );
    
    handleFieldChange('tradeReferences', updatedReferences);
  }, [localData.tradeReferences, handleFieldChange]);

  // Bank References Management
  const addBankReference = useCallback(() => {
    console.log('Adding bank reference');
    
    const newReference: BankReference = {
      bankName: '',
      contactName: '',
      phone: '',
      accountType: 'checking',
      accountOpenDate: '',
      averageBalance: { amount: 0, currency: shipmentTotal.currency },
      relationship: ''
    };
    
    handleFieldChange('bankReferences', [...localData.bankReferences, newReference]);
  }, [localData.bankReferences, shipmentTotal.currency, handleFieldChange]);

  const removeBankReference = useCallback((index: number) => {
    console.log('Removing bank reference:', index);
    
    const updatedReferences = localData.bankReferences.filter((_, i) => i !== index);
    handleFieldChange('bankReferences', updatedReferences);
  }, [localData.bankReferences, handleFieldChange]);

  const updateBankReference = useCallback((index: number, field: string, value: any) => {
    console.log('Updating bank reference:', { index, field, value });
    
    const updatedReferences = localData.bankReferences.map((ref, i) =>
      i === index ? { ...ref, [field]: value } : ref
    );
    
    handleFieldChange('bankReferences', updatedReferences);
  }, [localData.bankReferences, handleFieldChange]);

  // File Upload Handlers
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>, fileType: 'credit' | 'financial') => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('Uploading file:', file.name, 'type:', fileType);
    
    const validation = validateFileUpload(file);
    if (!validation.valid) {
      console.error('File validation failed:', validation.errors);
      return;
    }

    setUploadingFiles(prev => ({ ...prev, [fileType]: true }));
    
    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const uploadedFile: FileUpload = {
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date().toISOString(),
        status: 'completed',
        url: `https://example.com/uploads/${file.name}`,
        checksum: 'mock-checksum'
      };
      
      if (fileType === 'credit') {
        handleFieldChange('creditApplication', uploadedFile);
      } else {
        handleFieldChange('financialStatements', [...(localData.financialStatements || []), uploadedFile]);
      }
      
      console.log('File uploaded successfully:', uploadedFile);
    } catch (error) {
      console.error('File upload failed:', error);
    } finally {
      setUploadingFiles(prev => ({ ...prev, [fileType]: false }));
    }
  }, [handleFieldChange, localData.financialStatements]);

  const getFieldError = (fieldName: string) => {
    return errors.find(error => error.field.includes(fieldName))?.message;
  };

  const hasMinimumTradeReferences = localData.tradeReferences.length >= 3;
  const hasMinimumBankReferences = localData.bankReferences.length >= 1;

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Net Terms Application</h3>

      <div className="space-y-8">
        {/* Basic Terms */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Payment Terms</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="payment-period" className="block text-sm font-medium text-gray-700 mb-2">
                Payment Period *
              </label>
              <select
                id="payment-period"
                value={localData.period}
                onChange={(e) => handleFieldChange('period', parseInt(e.target.value) as any)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  getFieldError('period') ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
                required
              >
                <option value={15}>Net 15 Days</option>
                <option value={30}>Net 30 Days</option>
                <option value={45}>Net 45 Days</option>
                <option value={60}>Net 60 Days</option>
                <option value={90}>Net 90 Days</option>
              </select>
              {getFieldError('period') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('period')}</p>
              )}
            </div>

            <div>
              <label htmlFor="credit-limit" className="block text-sm font-medium text-gray-700 mb-2">
                Requested Credit Limit *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  id="credit-limit"
                  type="number"
                  min="0"
                  step="100"
                  value={localData.requestedCreditLimit.amount}
                  onChange={(e) => handleCreditLimitChange(e.target.value)}
                  placeholder="10000"
                  className={`w-full pl-7 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    getFieldError('requestedCreditLimit') ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                  required
                />
              </div>
              {getFieldError('requestedCreditLimit') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('requestedCreditLimit')}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Suggested: {formatCurrency({ amount: shipmentTotal.amount * 10, currency: shipmentTotal.currency })}
              </p>
            </div>

            <div>
              <label htmlFor="business-type" className="block text-sm font-medium text-gray-700 mb-2">
                Business Type *
              </label>
              <select
                id="business-type"
                value={localData.businessType}
                onChange={(e) => handleFieldChange('businessType', e.target.value as any)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  getFieldError('businessType') ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
                required
              >
                <option value="corporation">Corporation</option>
                <option value="llc">LLC</option>
                <option value="partnership">Partnership</option>
                <option value="sole-proprietorship">Sole Proprietorship</option>
                <option value="government">Government</option>
                <option value="non-profit">Non-Profit</option>
              </select>
              {getFieldError('businessType') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('businessType')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Business Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="annual-revenue" className="block text-sm font-medium text-gray-700 mb-2">
                Annual Revenue *
              </label>
              <select
                id="annual-revenue"
                value={localData.annualRevenue}
                onChange={(e) => handleFieldChange('annualRevenue', e.target.value as any)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  getFieldError('annualRevenue') ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
                required
              >
                <option value="under-100k">Under $100K</option>
                <option value="100k-500k">$100K - $500K</option>
                <option value="500k-1m">$500K - $1M</option>
                <option value="1m-5m">$1M - $5M</option>
                <option value="5m-25m">$5M - $25M</option>
                <option value="25m-100m">$25M - $100M</option>
                <option value="over-100m">Over $100M</option>
              </select>
              {getFieldError('annualRevenue') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('annualRevenue')}</p>
              )}
            </div>

            <div>
              <label htmlFor="years-in-business" className="block text-sm font-medium text-gray-700 mb-2">
                Years in Business *
              </label>
              <input
                id="years-in-business"
                type="number"
                min="0"
                max="200"
                value={localData.yearsInBusiness}
                onChange={(e) => handleFieldChange('yearsInBusiness', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  getFieldError('yearsInBusiness') ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
                required
              />
              {getFieldError('yearsInBusiness') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('yearsInBusiness')}</p>
              )}
            </div>

            <div>
              <label htmlFor="tax-id" className="block text-sm font-medium text-gray-700 mb-2">
                Tax ID Number *
              </label>
              <input
                id="tax-id"
                type="text"
                value={localData.taxIdNumber}
                onChange={(e) => handleFieldChange('taxIdNumber', e.target.value)}
                placeholder="XX-XXXXXXX"
                pattern="\d{2}-?\d{7}"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  getFieldError('taxIdNumber') ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
                required
              />
              {getFieldError('taxIdNumber') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('taxIdNumber')}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Format: XX-XXXXXXX
              </p>
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="duns-number" className="block text-sm font-medium text-gray-700 mb-2">
              DUNS Number
            </label>
            <input
              id="duns-number"
              type="text"
              value={localData.dunsNumber || ''}
              onChange={(e) => handleFieldChange('dunsNumber', e.target.value)}
              placeholder="123456789"
              pattern="\d{9}"
              maxLength={9}
              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
            />
            <p className="mt-1 text-xs text-gray-500">
              Optional 9-digit D&B number
            </p>
          </div>
        </div>

        {/* Trade References */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900">
              Trade References * (Minimum 3 required)
            </h4>
            <button
              type="button"
              onClick={addTradeReference}
              disabled={isSubmitting || localData.tradeReferences.length >= 5}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Reference
            </button>
          </div>

          {localData.tradeReferences.length === 0 && (
            <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">No trade references added yet.</p>
              <button
                type="button"
                onClick={addTradeReference}
                disabled={isSubmitting}
                className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                Add your first trade reference
              </button>
            </div>
          )}

          <div className="space-y-4">
            {localData.tradeReferences.map((reference, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-sm font-medium text-gray-900">Trade Reference #{index + 1}</h5>
                  <button
                    type="button"
                    onClick={() => removeTradeReference(index)}
                    disabled={isSubmitting}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={reference.companyName}
                      onChange={(e) => updateTradeReference(index, 'companyName', e.target.value)}
                      placeholder="Company Name"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      value={reference.contactName}
                      onChange={(e) => updateTradeReference(index, 'contactName', e.target.value)}
                      placeholder="Contact Name"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={reference.email}
                      onChange={(e) => updateTradeReference(index, 'email', e.target.value)}
                      placeholder="contact@company.com"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={reference.phone}
                      onChange={(e) => updateTradeReference(index, 'phone', e.target.value)}
                      placeholder="(555) 123-4567"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Payment History
                    </label>
                    <select
                      value={reference.paymentHistory}
                      onChange={(e) => updateTradeReference(index, 'paymentHistory', e.target.value as any)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      disabled={isSubmitting}
                    >
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Relationship
                    </label>
                    <input
                      type="text"
                      value={reference.relationship}
                      onChange={(e) => updateTradeReference(index, 'relationship', e.target.value)}
                      placeholder="Vendor, Customer, etc."
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!hasMinimumTradeReferences && (
            <p className="text-sm text-red-600 mt-2">
              At least 3 trade references are required ({localData.tradeReferences.length}/3)
            </p>
          )}
        </div>

        {/* Bank References */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900">
              Bank References * (Minimum 1 required)
            </h4>
            <button
              type="button"
              onClick={addBankReference}
              disabled={isSubmitting || localData.bankReferences.length >= 3}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Bank Reference
            </button>
          </div>

          {localData.bankReferences.length === 0 && (
            <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">No bank references added yet.</p>
              <button
                type="button"
                onClick={addBankReference}
                disabled={isSubmitting}
                className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                Add your first bank reference
              </button>
            </div>
          )}

          <div className="space-y-4">
            {localData.bankReferences.map((reference, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-sm font-medium text-gray-900">Bank Reference #{index + 1}</h5>
                  <button
                    type="button"
                    onClick={() => removeBankReference(index)}
                    disabled={isSubmitting}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Bank Name *
                    </label>
                    <input
                      type="text"
                      value={reference.bankName}
                      onChange={(e) => updateBankReference(index, 'bankName', e.target.value)}
                      placeholder="Bank of America"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      value={reference.contactName}
                      onChange={(e) => updateBankReference(index, 'contactName', e.target.value)}
                      placeholder="Banker Name"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={reference.phone}
                      onChange={(e) => updateBankReference(index, 'phone', e.target.value)}
                      placeholder="(555) 123-4567"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Account Type
                    </label>
                    <select
                      value={reference.accountType}
                      onChange={(e) => updateBankReference(index, 'accountType', e.target.value as any)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      disabled={isSubmitting}
                    >
                      <option value="checking">Checking</option>
                      <option value="savings">Savings</option>
                      <option value="line-of-credit">Line of Credit</option>
                      <option value="loan">Loan</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!hasMinimumBankReferences && (
            <p className="text-sm text-red-600 mt-2">
              At least 1 bank reference is required ({localData.bankReferences.length}/1)
            </p>
          )}
        </div>

        {/* File Uploads */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Supporting Documents</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Credit Application */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Credit Application
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {localData.creditApplication ? (
                    <div>
                      <svg className="mx-auto h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">{localData.creditApplication.name}</p>
                        <p>{formatFileSize(localData.creditApplication.size)}</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="text-sm text-gray-600">
                        <label htmlFor="credit-file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                          <span>Upload credit application</span>
                          <input
                            id="credit-file-upload"
                            type="file"
                            className="sr-only"
                            onChange={(e) => handleFileUpload(e, 'credit')}
                            accept=".pdf,.doc,.docx"
                            disabled={isSubmitting || uploadingFiles.credit}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PDF, DOC up to 5MB</p>
                    </div>
                  )}
                  {uploadingFiles.credit && (
                    <div className="mt-2">
                      <div className="text-sm text-blue-600">Uploading...</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Financial Statements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Financial Statements
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {(localData.financialStatements?.length || 0) > 0 ? (
                    <div>
                      <svg className="mx-auto h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">{localData.financialStatements?.length || 0} file(s) uploaded</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="text-sm text-gray-600">
                        <label htmlFor="financial-file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                          <span>Upload financial statements</span>
                          <input
                            id="financial-file-upload"
                            type="file"
                            className="sr-only"
                            onChange={(e) => handleFileUpload(e, 'financial')}
                            accept=".pdf,.doc,.docx"
                            disabled={isSubmitting || uploadingFiles.financial}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PDF, DOC up to 5MB each</p>
                    </div>
                  )}
                  {uploadingFiles.financial && (
                    <div className="mt-2">
                      <div className="text-sm text-blue-600">Uploading...</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Validation Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Application Status</h4>
          <div className="space-y-1 text-sm">
            <div className={`flex items-center ${localData.period ? 'text-green-600' : 'text-gray-500'}`}>
              <span className="mr-2">{localData.period ? '✓' : '○'}</span>
              Payment terms selected
            </div>
            <div className={`flex items-center ${localData.requestedCreditLimit.amount > 0 ? 'text-green-600' : 'text-gray-500'}`}>
              <span className="mr-2">{localData.requestedCreditLimit.amount > 0 ? '✓' : '○'}</span>
              Credit limit specified
            </div>
            <div className={`flex items-center ${hasMinimumTradeReferences ? 'text-green-600' : 'text-red-600'}`}>
              <span className="mr-2">{hasMinimumTradeReferences ? '✓' : '✗'}</span>
              Trade references (minimum 3)
            </div>
            <div className={`flex items-center ${hasMinimumBankReferences ? 'text-green-600' : 'text-red-600'}`}>
              <span className="mr-2">{hasMinimumBankReferences ? '✓' : '✗'}</span>
              Bank references (minimum 1)
            </div>
            <div className={`flex items-center ${localData.taxIdNumber ? 'text-green-600' : 'text-gray-500'}`}>
              <span className="mr-2">{localData.taxIdNumber ? '✓' : '○'}</span>
              Tax ID provided
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}