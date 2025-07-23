// Purchase Order Form Component
// Task 6.1: Payment Method Selection - PO form with validation

'use client';

import React, { useState, useCallback } from 'react';
import type { PaymentFormProps, PurchaseOrderInfo, ApprovalContact, MonetaryAmount } from '@/lib/payment/types';
import { formatCurrency, formatDate, isValidFutureDate } from '@/lib/payment/utils';

export default function PurchaseOrderForm({
  data,
  onChange,
  errors = [],
  isSubmitting = false,
  shipmentTotal,
  className = ''
}: PaymentFormProps) {
  console.log('Rendering PurchaseOrderForm:', { data, shipmentTotal, errorCount: errors.length });

  const [localData, setLocalData] = useState<PurchaseOrderInfo>(() => ({
    poNumber: data?.purchaseOrder?.poNumber || '',
    poAmount: data?.purchaseOrder?.poAmount || { amount: shipmentTotal.amount, currency: shipmentTotal.currency },
    expirationDate: data?.purchaseOrder?.expirationDate || '',
    approvalContact: data?.purchaseOrder?.approvalContact || {
      name: '',
      company: '',
      phone: '',
      email: '',
      extension: ''
    },
    department: data?.purchaseOrder?.department || '',
    costCenter: data?.purchaseOrder?.costCenter || '',
    projectCode: data?.purchaseOrder?.projectCode || '',
    glCode: data?.purchaseOrder?.glCode || '',
    approvalChain: data?.purchaseOrder?.approvalChain || [],
    terms: data?.purchaseOrder?.terms || {
      paymentTerms: 'Net 30',
      deliveryTerms: 'FOB Destination',
      warrantyTerms: '',
      specialConditions: []
    },
    isPreApproved: data?.purchaseOrder?.isPreApproved || false,
    authorizationNumber: data?.purchaseOrder?.authorizationNumber || ''
  }));

  const handleFieldChange = useCallback((field: keyof PurchaseOrderInfo, value: any) => {
    console.log('PO field changed:', { field, value });
    
    setLocalData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Trigger parent onChange
      onChange({
        ...data,
        purchaseOrder: updated
      });
      
      return updated;
    });
  }, [data, onChange]);

  const handleContactChange = useCallback((field: string, value: string) => {
    console.log('PO contact field changed:', { field, value });
    
    const updatedContact = {
      ...localData.approvalContact,
      [field]: value
    };
    
    handleFieldChange('approvalContact', updatedContact);
  }, [localData.approvalContact, handleFieldChange]);

  const handleAmountChange = useCallback((value: string) => {
    console.log('PO amount changed:', value);
    
    const amount = parseFloat(value) || 0;
    const updatedAmount: MonetaryAmount = {
      amount,
      currency: shipmentTotal.currency
    };
    
    handleFieldChange('poAmount', updatedAmount);
  }, [shipmentTotal.currency, handleFieldChange]);

  const addApprovalContact = useCallback(() => {
    console.log('Adding approval contact');
    
    const newContact: ApprovalContact = {
      name: '',
      title: '',
      email: '',
      phone: '',
      approvalLevel: localData.approvalChain.length + 1,
      maxApprovalAmount: { amount: 0, currency: shipmentTotal.currency }
    };
    
    handleFieldChange('approvalChain', [...localData.approvalChain, newContact]);
  }, [localData.approvalChain, shipmentTotal.currency, handleFieldChange]);

  const removeApprovalContact = useCallback((index: number) => {
    console.log('Removing approval contact:', index);
    
    const updatedChain = localData.approvalChain.filter((_, i) => i !== index);
    handleFieldChange('approvalChain', updatedChain);
  }, [localData.approvalChain, handleFieldChange]);

  const updateApprovalContact = useCallback((index: number, field: string, value: any) => {
    console.log('Updating approval contact:', { index, field, value });
    
    const updatedChain = localData.approvalChain.map((contact, i) =>
      i === index ? { ...contact, [field]: value } : contact
    );
    
    handleFieldChange('approvalChain', updatedChain);
  }, [localData.approvalChain, handleFieldChange]);

  const getFieldError = (fieldName: string) => {
    return errors.find(error => error.field.includes(fieldName))?.message;
  };

  const isAmountSufficient = localData.poAmount.amount >= shipmentTotal.amount;

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Purchase Order Information</h3>

      <div className="space-y-6">
        {/* PO Number and Amount Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="po-number" className="block text-sm font-medium text-gray-700 mb-2">
              Purchase Order Number *
            </label>
            <input
              id="po-number"
              type="text"
              value={localData.poNumber}
              onChange={(e) => handleFieldChange('poNumber', e.target.value)}
              placeholder="Enter PO number (e.g., PO-2025-001234)"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                getFieldError('poNumber') ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
              required
            />
            {getFieldError('poNumber') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError('poNumber')}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Format: Alphanumeric, 4-50 characters
            </p>
          </div>

          <div>
            <label htmlFor="po-amount" className="block text-sm font-medium text-gray-700 mb-2">
              Purchase Order Amount *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                id="po-amount"
                type="number"
                min="0"
                step="0.01"
                value={localData.poAmount.amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0.00"
                className={`w-full pl-7 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  getFieldError('poAmount') || !isAmountSufficient ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
                required
              />
            </div>
            {!isAmountSufficient && (
              <p className="mt-1 text-sm text-red-600">
                PO amount must be at least {formatCurrency(shipmentTotal)}
              </p>
            )}
            {getFieldError('poAmount') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError('poAmount')}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Must equal or exceed shipment total: {formatCurrency(shipmentTotal)}
            </p>
          </div>
        </div>

        {/* Expiration Date */}
        <div>
          <label htmlFor="po-expiration" className="block text-sm font-medium text-gray-700 mb-2">
            PO Expiration Date *
          </label>
          <input
            id="po-expiration"
            type="date"
            value={localData.expirationDate.split('T')[0]}
            onChange={(e) => handleFieldChange('expirationDate', new Date(e.target.value).toISOString())}
            min={new Date().toISOString().split('T')[0]}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              getFieldError('expirationDate') ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
            required
          />
          {getFieldError('expirationDate') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('expirationDate')}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Must be a future date for PO validity
          </p>
        </div>

        {/* Approval Contact */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Primary Approval Contact *</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Name *
              </label>
              <input
                id="contact-name"
                type="text"
                value={localData.approvalContact.name}
                onChange={(e) => handleContactChange('name', e.target.value)}
                placeholder="John Smith"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  getFieldError('approvalContact.name') ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
                required
              />
              {getFieldError('approvalContact.name') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('approvalContact.name')}</p>
              )}
            </div>

            <div>
              <label htmlFor="contact-company" className="block text-sm font-medium text-gray-700 mb-1">
                Company
              </label>
              <input
                id="contact-company"
                type="text"
                value={localData.approvalContact.company || ''}
                onChange={(e) => handleContactChange('company', e.target.value)}
                placeholder="Company Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                id="contact-email"
                type="email"
                value={localData.approvalContact.email}
                onChange={(e) => handleContactChange('email', e.target.value)}
                placeholder="john.smith@company.com"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  getFieldError('approvalContact.email') ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
                required
              />
              {getFieldError('approvalContact.email') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('approvalContact.email')}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Business email required (no personal domains)
              </p>
            </div>

            <div>
              <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                id="contact-phone"
                type="tel"
                value={localData.approvalContact.phone}
                onChange={(e) => handleContactChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  getFieldError('approvalContact.phone') ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
                required
              />
              {getFieldError('approvalContact.phone') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('approvalContact.phone')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Optional Fields */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Additional Information (Optional)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <input
                id="department"
                type="text"
                value={localData.department || ''}
                onChange={(e) => handleFieldChange('department', e.target.value)}
                placeholder="e.g., Operations"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="cost-center" className="block text-sm font-medium text-gray-700 mb-1">
                Cost Center
              </label>
              <input
                id="cost-center"
                type="text"
                value={localData.costCenter || ''}
                onChange={(e) => handleFieldChange('costCenter', e.target.value)}
                placeholder="e.g., CC-001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="project-code" className="block text-sm font-medium text-gray-700 mb-1">
                Project Code
              </label>
              <input
                id="project-code"
                type="text"
                value={localData.projectCode || ''}
                onChange={(e) => handleFieldChange('projectCode', e.target.value)}
                placeholder="e.g., PRJ-2025-001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="gl-code" className="block text-sm font-medium text-gray-700 mb-1">
                GL Code
              </label>
              <input
                id="gl-code"
                type="text"
                value={localData.glCode || ''}
                onChange={(e) => handleFieldChange('glCode', e.target.value)}
                placeholder="e.g., 6200-001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        {/* Pre-approval Status */}
        <div>
          <div className="flex items-center">
            <input
              id="pre-approved"
              type="checkbox"
              checked={localData.isPreApproved}
              onChange={(e) => handleFieldChange('isPreApproved', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isSubmitting}
            />
            <label htmlFor="pre-approved" className="ml-2 block text-sm text-gray-900">
              This purchase order has been pre-approved
            </label>
          </div>
          
          {localData.isPreApproved && (
            <div className="mt-2">
              <label htmlFor="auth-number" className="block text-sm font-medium text-gray-700 mb-1">
                Authorization Number
              </label>
              <input
                id="auth-number"
                type="text"
                value={localData.authorizationNumber || ''}
                onChange={(e) => handleFieldChange('authorizationNumber', e.target.value)}
                placeholder="Enter authorization number"
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
              />
            </div>
          )}
        </div>

        {/* Validation Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Validation Summary</h4>
          <div className="space-y-1 text-sm">
            <div className={`flex items-center ${localData.poNumber ? 'text-green-600' : 'text-gray-500'}`}>
              <span className="mr-2">{localData.poNumber ? '✓' : '○'}</span>
              PO Number provided
            </div>
            <div className={`flex items-center ${isAmountSufficient ? 'text-green-600' : 'text-red-600'}`}>
              <span className="mr-2">{isAmountSufficient ? '✓' : '✗'}</span>
              PO amount covers shipment total
            </div>
            <div className={`flex items-center ${localData.expirationDate && isValidFutureDate(localData.expirationDate) ? 'text-green-600' : 'text-gray-500'}`}>
              <span className="mr-2">{localData.expirationDate && isValidFutureDate(localData.expirationDate) ? '✓' : '○'}</span>
              Valid expiration date
            </div>
            <div className={`flex items-center ${localData.approvalContact.name && localData.approvalContact.email ? 'text-green-600' : 'text-gray-500'}`}>
              <span className="mr-2">{localData.approvalContact.name && localData.approvalContact.email ? '✓' : '○'}</span>
              Approval contact information
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}