// Corporate Account Form Component
// Task 6.1: Payment Method Selection - Corporate account form with PIN validation

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import type { PaymentFormProps, CorporateAccountInfo, MonetaryAmount } from '@/lib/payment/types';
import type { ContactInfo } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/payment/utils';

export default function CorporateAccountForm({
  data,
  onChange,
  errors = [],
  isSubmitting = false,
  shipmentTotal,
  className = ''
}: PaymentFormProps) {
  console.log('Rendering CorporateAccountForm:', { data, shipmentTotal, errorCount: errors.length });

  const [localData, setLocalData] = useState<CorporateAccountInfo>(() => ({
    accountNumber: data?.corporateAccount?.accountNumber || '',
    accountPin: data?.corporateAccount?.accountPin || '',
    billingContact: data?.corporateAccount?.billingContact || {
      name: '',
      company: '',
      phone: '',
      email: '',
      extension: ''
    },
    accountStatus: data?.corporateAccount?.accountStatus || 'active',
    creditLimit: data?.corporateAccount?.creditLimit || { amount: 0, currency: shipmentTotal.currency },
    availableCredit: data?.corporateAccount?.availableCredit || { amount: 0, currency: shipmentTotal.currency },
    currentBalance: data?.corporateAccount?.currentBalance || { amount: 0, currency: shipmentTotal.currency },
    lastPaymentDate: data?.corporateAccount?.lastPaymentDate,
    lastPaymentAmount: data?.corporateAccount?.lastPaymentAmount,
    paymentHistory: data?.corporateAccount?.paymentHistory || [],
    accountManagerContact: data?.corporateAccount?.accountManagerContact,
    contractStartDate: data?.corporateAccount?.contractStartDate || '',
    contractEndDate: data?.corporateAccount?.contractEndDate,
    billingCycle: data?.corporateAccount?.billingCycle || 'monthly',
    autoPayEnabled: data?.corporateAccount?.autoPayEnabled || false
  }));

  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
    accountInfo?: Partial<CorporateAccountInfo>;
  } | null>(null);

  const handleFieldChange = useCallback((field: keyof CorporateAccountInfo, value: any) => {
    console.log('Corporate account field changed:', { field, value });
    
    setLocalData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Trigger parent onChange
      onChange({
        ...data,
        corporateAccount: updated
      });
      
      return updated;
    });
  }, [data, onChange]);

  const handleContactChange = useCallback((field: string, value: string) => {
    console.log('Corporate account contact field changed:', { field, value });
    
    const updatedContact = {
      ...localData.billingContact,
      [field]: value
    };
    
    handleFieldChange('billingContact', updatedContact);
  }, [localData.billingContact, handleFieldChange]);

  // Simulate account verification
  const verifyAccount = useCallback(async () => {
    if (!localData.accountNumber || !localData.accountPin) {
      setVerificationResult({
        success: false,
        message: 'Please enter both account number and PIN'
      });
      return;
    }

    console.log('Verifying corporate account:', { accountNumber: localData.accountNumber, pin: '****' });
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock verification logic
      const isValidAccount = localData.accountNumber.length >= 8;
      const isValidPin = localData.accountPin.length >= 4;
      const accountExists = localData.accountNumber.includes('12345'); // Mock account existence check

      if (!isValidAccount || !isValidPin) {
        setVerificationResult({
          success: false,
          message: 'Invalid account number or PIN format'
        });
        return;
      }

      if (!accountExists) {
        setVerificationResult({
          success: false,
          message: 'Account not found. Please check your account number.'
        });
        return;
      }

      // Mock successful verification with account data
      const mockAccountInfo: Partial<CorporateAccountInfo> = {
        accountStatus: 'active',
        creditLimit: { amount: 50000, currency: shipmentTotal.currency },
        availableCredit: { amount: 47500, currency: shipmentTotal.currency },
        currentBalance: { amount: 2500, currency: shipmentTotal.currency },
        lastPaymentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        lastPaymentAmount: { amount: 1200, currency: shipmentTotal.currency },
        contractStartDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        billingCycle: 'monthly',
        autoPayEnabled: true,
        accountManagerContact: {
          name: 'Sarah Johnson',
          company: 'Shipping Corp',
          phone: '(555) 987-6543',
          email: 'sarah.johnson@shippingcorp.com',
          extension: '2501'
        }
      };

      // Update local data with verified account info
      setLocalData(prev => ({ ...prev, ...mockAccountInfo }));
      
      // Update parent with verified account info
      onChange({
        ...data,
        corporateAccount: { ...localData, ...mockAccountInfo }
      });

      setVerificationResult({
        success: true,
        message: 'Account verified successfully',
        accountInfo: mockAccountInfo
      });

      console.log('Account verification successful:', mockAccountInfo);

    } catch (error) {
      console.error('Account verification failed:', error);
      setVerificationResult({
        success: false,
        message: 'Verification failed. Please try again.'
      });
    } finally {
      setIsVerifying(false);
    }
  }, [localData.accountNumber, localData.accountPin, shipmentTotal.currency, data, onChange]);

  // Auto-verify when both account number and PIN are entered
  useEffect(() => {
    if (localData.accountNumber.length >= 8 && localData.accountPin.length >= 4 && !isVerifying && !verificationResult) {
      const timeoutId = setTimeout(verifyAccount, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [localData.accountNumber, localData.accountPin, isVerifying, verificationResult, verifyAccount]);

  const getFieldError = (fieldName: string) => {
    return errors.find(error => error.field.includes(fieldName))?.message;
  };

  const isAccountNumberValid = localData.accountNumber.match(/^\d{8,15}$/);
  const isPinValid = localData.accountPin.match(/^\d{4,6}$/);
  const isAccountVerified = verificationResult?.success;
  const hasSufficientCredit = localData.availableCredit.amount >= shipmentTotal.amount;

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Corporate Account Information</h3>

      <div className="space-y-6">
        {/* Account Credentials */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Account Credentials</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="account-number" className="block text-sm font-medium text-gray-700 mb-2">
                Account Number *
              </label>
              <input
                id="account-number"
                type="text"
                value={localData.accountNumber}
                onChange={(e) => handleFieldChange('accountNumber', e.target.value)}
                placeholder="12345678"
                maxLength={15}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  getFieldError('accountNumber') || !isAccountNumberValid ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
                required
              />
              {getFieldError('accountNumber') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('accountNumber')}</p>
              )}
              {localData.accountNumber && !isAccountNumberValid && (
                <p className="mt-1 text-sm text-red-600">
                  Account number must be 8-15 digits
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                8-15 digits, your corporate account number
              </p>
            </div>

            <div>
              <label htmlFor="account-pin" className="block text-sm font-medium text-gray-700 mb-2">
                Account PIN *
              </label>
              <input
                id="account-pin"
                type="password"
                value={localData.accountPin}
                onChange={(e) => handleFieldChange('accountPin', e.target.value)}
                placeholder="****"
                maxLength={6}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  getFieldError('accountPin') || !isPinValid ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
                required
              />
              {getFieldError('accountPin') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('accountPin')}</p>
              )}
              {localData.accountPin && !isPinValid && (
                <p className="mt-1 text-sm text-red-600">
                  PIN must be 4-6 digits
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                4-6 digits, your account security PIN
              </p>
            </div>
          </div>

          {/* Verification Button and Status */}
          <div className="mt-4 flex items-center space-x-4">
            <button
              type="button"
              onClick={verifyAccount}
              disabled={!localData.accountNumber || !localData.accountPin || isVerifying || isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? 'Verifying...' : 'Verify Account'}
            </button>

            {verificationResult && (
              <div className={`flex items-center ${verificationResult.success ? 'text-green-600' : 'text-red-600'}`}>
                <svg 
                  className={`h-5 w-5 mr-2 ${verificationResult.success ? 'text-green-500' : 'text-red-500'}`} 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  {verificationResult.success ? (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  ) : (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  )}
                </svg>
                <span className="text-sm font-medium">{verificationResult.message}</span>
              </div>
            )}

            {isVerifying && (
              <div className="flex items-center text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-sm">Verifying account...</span>
              </div>
            )}
          </div>
        </div>

        {/* Account Information (shown after verification) */}
        {isAccountVerified && (
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Account Details</h4>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Account Status</label>
                  <p className={`text-sm font-medium ${
                    localData.accountStatus === 'active' ? 'text-green-600' :
                    localData.accountStatus === 'suspended' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {localData.accountStatus?.charAt(0).toUpperCase() + localData.accountStatus?.slice(1)}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700">Credit Limit</label>
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(localData.creditLimit)}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700">Available Credit</label>
                  <p className={`text-sm font-medium ${hasSufficientCredit ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(localData.availableCredit)}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700">Current Balance</label>
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(localData.currentBalance)}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700">Last Payment</label>
                  <p className="text-sm text-gray-900">
                    {localData.lastPaymentDate ? formatDate(localData.lastPaymentDate) : 'N/A'}
                  </p>
                  {localData.lastPaymentAmount && (
                    <p className="text-xs text-gray-600">
                      {formatCurrency(localData.lastPaymentAmount)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700">Billing Cycle</label>
                  <p className="text-sm text-gray-900">
                    {localData.billingCycle?.charAt(0).toUpperCase() + localData.billingCycle?.slice(1)}
                  </p>
                </div>
              </div>

              {!hasSufficientCredit && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex">
                    <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-red-800">Insufficient Credit</h4>
                      <p className="text-sm text-red-700 mt-1">
                        Your available credit ({formatCurrency(localData.availableCredit)}) is less than the shipment total ({formatCurrency(shipmentTotal)}). 
                        Please contact your account manager to increase your credit limit.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Billing Contact */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Billing Contact</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="billing-contact-name" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Name *
              </label>
              <input
                id="billing-contact-name"
                type="text"
                value={localData.billingContact.name}
                onChange={(e) => handleContactChange('name', e.target.value)}
                placeholder="John Smith"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  getFieldError('billingContact.name') ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
                required
              />
              {getFieldError('billingContact.name') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('billingContact.name')}</p>
              )}
            </div>

            <div>
              <label htmlFor="billing-contact-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                id="billing-contact-email"
                type="email"
                value={localData.billingContact.email}
                onChange={(e) => handleContactChange('email', e.target.value)}
                placeholder="john.smith@company.com"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  getFieldError('billingContact.email') ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
                required
              />
              {getFieldError('billingContact.email') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('billingContact.email')}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Business email required
              </p>
            </div>

            <div>
              <label htmlFor="billing-contact-phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                id="billing-contact-phone"
                type="tel"
                value={localData.billingContact.phone}
                onChange={(e) => handleContactChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  getFieldError('billingContact.phone') ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
                required
              />
              {getFieldError('billingContact.phone') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('billingContact.phone')}</p>
              )}
            </div>

            <div>
              <label htmlFor="billing-contact-company" className="block text-sm font-medium text-gray-700 mb-1">
                Company
              </label>
              <input
                id="billing-contact-company"
                type="text"
                value={localData.billingContact.company || ''}
                onChange={(e) => handleContactChange('company', e.target.value)}
                placeholder="Company Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        {/* Account Manager (shown after verification) */}
        {isAccountVerified && localData.accountManagerContact && (
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Account Manager</h4>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Name</label>
                  <p className="text-sm font-medium text-gray-900">{localData.accountManagerContact.name}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Email</label>
                  <p className="text-sm text-gray-900">{localData.accountManagerContact.email}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Phone</label>
                  <p className="text-sm text-gray-900">
                    {localData.accountManagerContact.phone}
                    {localData.accountManagerContact.extension && ` ext. ${localData.accountManagerContact.extension}`}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Company</label>
                  <p className="text-sm text-gray-900">{localData.accountManagerContact.company}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Auto-pay Setting */}
        {isAccountVerified && (
          <div>
            <div className="flex items-center">
              <input
                id="auto-pay"
                type="checkbox"
                checked={localData.autoPayEnabled}
                onChange={(e) => handleFieldChange('autoPayEnabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isSubmitting}
              />
              <label htmlFor="auto-pay" className="ml-2 block text-sm text-gray-900">
                Auto-pay is enabled for this account
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Payments will be automatically processed according to your billing cycle
            </p>
          </div>
        )}

        {/* Validation Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Validation Summary</h4>
          <div className="space-y-1 text-sm">
            <div className={`flex items-center ${isAccountNumberValid ? 'text-green-600' : 'text-red-600'}`}>
              <span className="mr-2">{isAccountNumberValid ? '✓' : '✗'}</span>
              Account number format valid
            </div>
            <div className={`flex items-center ${isPinValid ? 'text-green-600' : 'text-red-600'}`}>
              <span className="mr-2">{isPinValid ? '✓' : '✗'}</span>
              PIN format valid
            </div>
            <div className={`flex items-center ${isAccountVerified ? 'text-green-600' : 'text-gray-500'}`}>
              <span className="mr-2">{isAccountVerified ? '✓' : '○'}</span>
              Account verified
            </div>
            <div className={`flex items-center ${hasSufficientCredit ? 'text-green-600' : 'text-red-600'}`}>
              <span className="mr-2">{hasSufficientCredit ? '✓' : '✗'}</span>
              Sufficient available credit
            </div>
            <div className={`flex items-center ${localData.billingContact.name && localData.billingContact.email ? 'text-green-600' : 'text-gray-500'}`}>
              <span className="mr-2">{localData.billingContact.name && localData.billingContact.email ? '✓' : '○'}</span>
              Billing contact information complete
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}