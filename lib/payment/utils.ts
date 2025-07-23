// Payment Method Utility Functions
// Task 6.1: Payment Method Selection - Helper functions and utilities

import type { 
  MonetaryAmount, 
  PaymentMethodType, 
  PaymentMethodFee, 
  PaymentCalculationResult,
  PaymentMethodConfig,
  EnhancedPaymentInfo,
  PaymentValidationError,
  PaymentError,
  PaymentErrorCode
} from './types';

// Currency formatting utilities
export function formatCurrency(amount: MonetaryAmount, showCents: boolean = true): string {
  console.log('Formatting currency:', amount);
  
  const currencySymbols = {
    USD: '$',
    CAD: 'CA$',
    MXN: 'MX$'
  };
  
  const symbol = currencySymbols[amount.currency] || '$';
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0
  });
  
  return `${symbol}${formatter.format(amount.amount)}`;
}

export function parseCurrencyString(currencyStr: string, defaultCurrency: 'USD' | 'CAD' | 'MXN' = 'USD'): MonetaryAmount {
  console.log('Parsing currency string:', currencyStr);
  
  // Remove currency symbols and whitespace
  const cleanStr = currencyStr.replace(/[$,\s]/g, '');
  const amount = parseFloat(cleanStr);
  
  if (isNaN(amount)) {
    throw new Error('Invalid currency format');
  }
  
  return {
    amount,
    currency: defaultCurrency
  };
}

// Payment method fee calculations
export function calculatePaymentMethodFees(
  method: PaymentMethodType, 
  subtotal: MonetaryAmount
): PaymentMethodFee[] {
  console.log('Calculating payment method fees:', { method, subtotal });
  
  const fees: PaymentMethodFee[] = [];
  
  switch (method) {
    case 'po':
      // No additional fees for PO
      break;
      
    case 'bol':
      fees.push({
        type: 'processing',
        description: 'Bill of Lading processing fee',
        amount: { amount: 15.00, currency: subtotal.currency }
      });
      break;
      
    case 'thirdparty':
      fees.push({
        type: 'processing',
        description: 'Third-party billing processing fee',
        amount: { amount: 25.00, currency: subtotal.currency }
      });
      break;
      
    case 'net':
      fees.push({
        type: 'service',
        description: 'Net terms service fee',
        amount: { amount: subtotal.amount * 0.015, currency: subtotal.currency },
        percentage: 1.5
      });
      break;
      
    case 'corporate':
      // No additional fees for corporate accounts
      break;
  }
  
  return fees;
}

export function calculateTotalWithFees(
  subtotal: MonetaryAmount, 
  fees: PaymentMethodFee[]
): PaymentCalculationResult {
  console.log('Calculating total with fees:', { subtotal, fees });
  
  const feeTotal = fees.reduce((sum, fee) => sum + fee.amount.amount, 0);
  const total = subtotal.amount + feeTotal;
  
  const breakdown = {
    baseAmount: subtotal,
    processingFees: {
      amount: fees.filter(f => f.type === 'processing').reduce((sum, f) => sum + f.amount.amount, 0),
      currency: subtotal.currency
    },
    serviceFees: {
      amount: fees.filter(f => f.type === 'service').reduce((sum, f) => sum + f.amount.amount, 0),
      currency: subtotal.currency
    },
    taxes: { amount: 0, currency: subtotal.currency } // Tax calculation would be implemented here
  };
  
  return {
    subtotal,
    fees,
    total: { amount: total, currency: subtotal.currency },
    breakdown
  };
}

// Payment method configuration
export function getPaymentMethodConfig(): PaymentMethodConfig[] {
  console.log('Getting payment method configuration');
  
  return [
    {
      method: 'po',
      isEnabled: true,
      displayName: 'Purchase Order',
      description: 'Pay using a company purchase order with approval workflow',
      icon: '📋',
      fees: [],
      requirements: [
        { field: 'poNumber', required: true, description: 'Valid purchase order number', format: 'Alphanumeric, 4-50 characters' },
        { field: 'poAmount', required: true, description: 'PO amount must equal or exceed shipment total', example: '$1,250.00' },
        { field: 'expirationDate', required: true, description: 'Future expiration date', format: 'YYYY-MM-DD' },
        { field: 'approvalContact', required: true, description: 'Contact information for PO approval', format: 'Business email required' }
      ],
      validationRules: [
        { field: 'poNumber', type: 'format', rule: '^[A-Z0-9]{4,50}$', message: 'PO number must be alphanumeric', severity: 'error' },
        { field: 'poAmount', type: 'custom', rule: 'greaterThanShipmentTotal', message: 'PO amount insufficient', severity: 'error' }
      ],
      eligibilityCriteria: {
        allowedCustomerTypes: ['business', 'government', 'enterprise'],
        minimumShipmentValue: { amount: 50, currency: 'USD' }
      }
    },
    {
      method: 'bol',
      isEnabled: true,
      displayName: 'Bill of Lading',
      description: 'Freight billing with proper BOL documentation',
      icon: '📄',
      fees: [
        {
          type: 'processing',
          description: 'BOL processing fee',
          amount: { amount: 15.00, currency: 'USD' }
        }
      ],
      requirements: [
        { field: 'bolNumber', required: true, description: 'BOL number in format BOL-YYYY-XXXXXX', format: 'BOL-2025-123456' },
        { field: 'bolDate', required: true, description: 'BOL date (cannot be future)', format: 'YYYY-MM-DD' },
        { field: 'shipperReference', required: true, description: 'Shipper reference number', format: 'Alphanumeric, max 20 chars' }
      ],
      validationRules: [
        { field: 'bolNumber', type: 'format', rule: '^BOL-\\d{4}-\\d{6}$', message: 'Invalid BOL format', severity: 'error' },
        { field: 'bolDate', type: 'custom', rule: 'notFutureDate', message: 'BOL date cannot be in future', severity: 'error' }
      ],
      eligibilityCriteria: {
        allowedCustomerTypes: ['business', 'freight', 'logistics'],
        minimumShipmentValue: { amount: 100, currency: 'USD' }
      }
    },
    {
      method: 'thirdparty',
      isEnabled: true,
      displayName: 'Third-Party Billing',
      description: 'Bill to a third-party account with authorization',
      icon: '👥',
      fees: [
        {
          type: 'processing',
          description: 'Third-party processing fee',
          amount: { amount: 25.00, currency: 'USD' }
        }
      ],
      requirements: [
        { field: 'accountNumber', required: true, description: 'Valid third-party account number', format: '8-15 digits' },
        { field: 'companyName', required: true, description: 'Third-party company name', format: 'Business name' },
        { field: 'authorizationCode', required: false, description: 'Authorization code if required', format: 'Alphanumeric' }
      ],
      validationRules: [
        { field: 'accountNumber', type: 'format', rule: '^\\d{8,15}$', message: 'Invalid account number format', severity: 'error' },
        { field: 'accountNumber', type: 'custom', rule: 'luhnValidation', message: 'Invalid account number', severity: 'error' }
      ],
      eligibilityCriteria: {
        allowedCustomerTypes: ['business', 'enterprise'],
        minimumShipmentValue: { amount: 75, currency: 'USD' }
      }
    },
    {
      method: 'net',
      isEnabled: true,
      displayName: 'Net Terms',
      description: 'Credit-based payment with 15-90 day terms',
      icon: '💳',
      fees: [
        {
          type: 'service',
          description: 'Net terms service fee',
          amount: { amount: 0, currency: 'USD' },
          percentage: 1.5
        }
      ],
      requirements: [
        { field: 'period', required: true, description: 'Payment period (15, 30, 45, 60, or 90 days)', format: 'Select from options' },
        { field: 'tradeReferences', required: true, description: 'Minimum 3 trade references', format: 'Business contacts' },
        { field: 'creditApplication', required: false, description: 'Credit application document', format: 'PDF or Word, max 5MB' }
      ],
      validationRules: [
        { field: 'tradeReferences', type: 'custom', rule: 'minimumThreeReferences', message: 'At least 3 trade references required', severity: 'error' },
        { field: 'annualRevenue', type: 'required', rule: 'required', message: 'Annual revenue required', severity: 'error' }
      ],
      eligibilityCriteria: {
        allowedCustomerTypes: ['business', 'enterprise'],
        minimumShipmentValue: { amount: 200, currency: 'USD' },
        volumeRequirements: {
          minimumMonthlyShipments: 5,
          minimumAnnualVolume: { amount: 10000, currency: 'USD' }
        }
      }
    },
    {
      method: 'corporate',
      isEnabled: true,
      displayName: 'Corporate Account',
      description: 'Existing corporate account with PIN verification',
      icon: '🏢',
      fees: [],
      requirements: [
        { field: 'accountNumber', required: true, description: 'Corporate account number', format: '8-15 digits' },
        { field: 'accountPin', required: true, description: 'Account PIN', format: '4-6 digits' },
        { field: 'billingContact', required: true, description: 'Billing contact information', format: 'Business contact' }
      ],
      validationRules: [
        { field: 'accountNumber', type: 'format', rule: '^\\d{8,15}$', message: 'Invalid account number format', severity: 'error' },
        { field: 'accountPin', type: 'format', rule: '^\\d{4,6}$', message: 'PIN must be 4-6 digits', severity: 'error' },
        { field: 'accountNumber', type: 'async', rule: 'accountExists', message: 'Account not found', severity: 'error' }
      ],
      eligibilityCriteria: {
        allowedCustomerTypes: ['existing-customer', 'enterprise'],
        minimumShipmentValue: { amount: 25, currency: 'USD' }
      }
    }
  ];
}

// Payment method display utilities
export function getPaymentMethodDisplayName(method: PaymentMethodType): string {
  const config = getPaymentMethodConfig().find(c => c.method === method);
  return config?.displayName || method.toUpperCase();
}

export function getPaymentMethodIcon(method: PaymentMethodType): string {
  const config = getPaymentMethodConfig().find(c => c.method === method);
  return config?.icon || '💰';
}

export function getPaymentMethodDescription(method: PaymentMethodType): string {
  const config = getPaymentMethodConfig().find(c => c.method === method);
  return config?.description || '';
}

// Validation utilities
export function validatePaymentMethodEligibility(
  method: PaymentMethodType, 
  shipmentTotal: MonetaryAmount,
  customerType: string = 'business'
): { eligible: boolean; reasons: string[] } {
  console.log('Validating payment method eligibility:', { method, shipmentTotal, customerType });
  
  const config = getPaymentMethodConfig().find(c => c.method === method);
  if (!config) {
    return { eligible: false, reasons: ['Payment method not found'] };
  }
  
  const reasons: string[] = [];
  
  if (!config.isEnabled) {
    reasons.push('Payment method currently unavailable');
  }
  
  if (!config.eligibilityCriteria.allowedCustomerTypes.includes(customerType)) {
    reasons.push(`Not available for ${customerType} customers`);
  }
  
  if (config.eligibilityCriteria.minimumShipmentValue) {
    if (shipmentTotal.amount < config.eligibilityCriteria.minimumShipmentValue.amount) {
      reasons.push(`Minimum shipment value: ${formatCurrency(config.eligibilityCriteria.minimumShipmentValue)}`);
    }
  }
  
  return {
    eligible: reasons.length === 0,
    reasons
  };
}

// Error handling utilities
export function createPaymentError(code: PaymentErrorCode, message: string, field?: string, context?: any): PaymentError {
  console.log('Creating payment error:', { code, message, field, context });
  
  const error = new Error(message) as PaymentError;
  error.code = code;
  error.field = field;
  error.context = context;
  error.name = 'PaymentError';
  
  return error;
}

export function formatPaymentValidationErrors(errors: PaymentValidationError[]): string {
  if (errors.length === 0) return '';
  
  const errorsByField = errors.reduce((acc, error) => {
    if (!acc[error.field]) acc[error.field] = [];
    acc[error.field].push(error.message);
    return acc;
  }, {} as Record<string, string[]>);
  
  return Object.entries(errorsByField)
    .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
    .join('; ');
}

// Payment method completion checking
export function isPaymentMethodComplete(method: PaymentMethodType, data: EnhancedPaymentInfo): boolean {
  console.log('Checking payment method completion:', { method, data });
  
  if (!data.method || data.method !== method) {
    return false;
  }
  
  switch (method) {
    case 'po':
      return !!(data.purchaseOrder?.poNumber && 
                data.purchaseOrder?.poAmount && 
                data.purchaseOrder?.expirationDate &&
                data.purchaseOrder?.approvalContact);
    
    case 'bol':
      return !!(data.billOfLading?.bolNumber && 
                data.billOfLading?.bolDate && 
                data.billOfLading?.shipperReference &&
                data.billOfLading?.freightTerms);
    
    case 'thirdparty':
      return !!(data.thirdPartyBilling?.accountNumber && 
                data.thirdPartyBilling?.companyName && 
                data.thirdPartyBilling?.contactInfo);
    
    case 'net':
      return !!(data.netTerms?.period && 
                data.netTerms?.tradeReferences?.length >= 3 &&
                data.netTerms?.annualRevenue);
    
    case 'corporate':
      return !!(data.corporateAccount?.accountNumber && 
                data.corporateAccount?.accountPin && 
                data.corporateAccount?.billingContact);
    
    default:
      return false;
  }
}

// File upload utilities
export function validateFileUpload(file: File): { valid: boolean; errors: string[] } {
  console.log('Validating file upload:', file);
  
  const errors: string[] = [];
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (file.size > maxSize) {
    errors.push('File size must be under 5MB');
  }
  
  if (!allowedTypes.includes(file.type)) {
    errors.push('Only PDF and Word documents are allowed');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Date formatting utilities
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function isValidFutureDate(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  return date > now;
}

export function isValidPastOrTodayDate(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  now.setHours(23, 59, 59, 999); // End of today
  return date <= now;
}

// Local storage utilities for payment data
export function savePaymentToStorage(paymentInfo: EnhancedPaymentInfo): void {
  console.log('Saving payment info to storage:', paymentInfo);
  
  try {
    const storageKey = 'currentShippingTransaction';
    const existingData = localStorage.getItem(storageKey);
    let transaction = existingData ? JSON.parse(existingData) : {};
    
    transaction.paymentInfo = paymentInfo;
    transaction.status = 'payment';
    transaction.lastUpdated = new Date().toISOString();
    
    localStorage.setItem(storageKey, JSON.stringify(transaction));
  } catch (error) {
    console.error('Failed to save payment info to storage:', error);
    throw createPaymentError('UNKNOWN_ERROR', 'Failed to save payment information');
  }
}

export function loadPaymentFromStorage(): EnhancedPaymentInfo | null {
  console.log('Loading payment info from storage');
  
  try {
    const storageKey = 'currentShippingTransaction';
    const data = localStorage.getItem(storageKey);
    
    if (!data) return null;
    
    const transaction = JSON.parse(data);
    return transaction.paymentInfo || null;
  } catch (error) {
    console.error('Failed to load payment info from storage:', error);
    return null;
  }
}