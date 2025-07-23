// Payment Method Validation Schemas using Zod
// Task 6.1: Payment Method Selection - Comprehensive validation rules

import { z } from 'zod';
import type { PaymentMethodType, MonetaryAmount } from './types';

// Base validation patterns
const BUSINESS_EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@(?!gmail\.com|yahoo\.com|hotmail\.com|outlook\.com|aol\.com)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_PATTERN = /^\+?[\d\s\-\(\)]{10,15}$/;
const PO_NUMBER_PATTERN = /^[A-Z0-9]{4,50}$/i;
const BOL_NUMBER_PATTERN = /^BOL-\d{4}-\d{6}$/;
const ACCOUNT_NUMBER_PATTERN = /^\d{8,15}$/;
const PIN_PATTERN = /^\d{4,6}$/;
const TAX_ID_PATTERN = /^\d{2}-?\d{7}$/;
const DUNS_PATTERN = /^\d{9}$/;

// Common validation utilities
const businessEmailValidation = z.string()
  .email('Invalid email format')
  .regex(BUSINESS_EMAIL_PATTERN, 'Business email required (no personal email domains)');

const phoneValidation = z.string()
  .regex(PHONE_PATTERN, 'Invalid phone number format');

const monetaryAmountSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.enum(['USD', 'CAD', 'MXN'])
});

const contactInfoSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  company: z.string().min(2, 'Company name required').max(100, 'Company name too long').optional(),
  phone: phoneValidation,
  email: businessEmailValidation,
  extension: z.string().max(10, 'Extension too long').optional()
});

const addressSchema = z.object({
  address: z.string().min(5, 'Address must be at least 5 characters').max(200, 'Address too long'),
  suite: z.string().max(50, 'Suite too long').optional(),
  city: z.string().min(2, 'City must be at least 2 characters').max(100, 'City too long'),
  state: z.string().min(2, 'State required').max(50, 'State too long'),
  zip: z.string().min(5, 'ZIP code must be at least 5 characters').max(10, 'ZIP code too long'),
  country: z.string().min(2, 'Country required').max(50, 'Country too long'),
  isResidential: z.boolean(),
  contactInfo: contactInfoSchema,
  locationType: z.enum(['commercial', 'residential', 'industrial', 'warehouse', 'storage', 'construction', 'other']),
  locationDescription: z.string().max(500, 'Description too long').optional()
});

// File upload validation
const fileUploadSchema = z.object({
  name: z.string().min(1, 'Filename required'),
  size: z.number().max(5 * 1024 * 1024, 'File size must be under 5MB'),
  type: z.string().refine(
    (type) => ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(type),
    'Only PDF and Word documents allowed'
  ),
  uploadDate: z.string(),
  status: z.enum(['pending', 'uploading', 'completed', 'failed']),
  url: z.string().url().optional(),
  checksum: z.string().optional()
});

// Purchase Order Validation Schema
export const purchaseOrderSchema = z.object({
  poNumber: z.string()
    .min(4, 'PO number must be at least 4 characters')
    .max(50, 'PO number too long')
    .regex(PO_NUMBER_PATTERN, 'PO number must be alphanumeric'),
  
  poAmount: monetaryAmountSchema.refine(
    (amount) => amount.amount >= 0.01,
    'PO amount must be at least $0.01'
  ),
  
  expirationDate: z.string()
    .datetime()
    .refine(
      (date) => new Date(date) > new Date(),
      'PO expiration date must be in the future'
    ),
  
  approvalContact: contactInfoSchema,
  
  department: z.string().max(50, 'Department name too long').optional(),
  costCenter: z.string().max(50, 'Cost center too long').optional(),
  projectCode: z.string().max(50, 'Project code too long').optional(),
  glCode: z.string().max(50, 'GL code too long').optional(),
  
  approvalChain: z.array(z.object({
    name: z.string().min(2, 'Name required').max(100, 'Name too long'),
    title: z.string().min(2, 'Title required').max(100, 'Title too long'),
    email: businessEmailValidation,
    phone: phoneValidation,
    approvalLevel: z.number().int().min(1).max(10),
    maxApprovalAmount: monetaryAmountSchema
  })).min(1, 'At least one approval contact required'),
  
  terms: z.object({
    paymentTerms: z.string().min(5, 'Payment terms required').max(500, 'Payment terms too long'),
    deliveryTerms: z.string().min(5, 'Delivery terms required').max(500, 'Delivery terms too long'),
    warrantyTerms: z.string().max(500, 'Warranty terms too long').optional(),
    specialConditions: z.array(z.string().max(200, 'Condition too long')).optional()
  }),
  
  isPreApproved: z.boolean(),
  authorizationNumber: z.string().max(50, 'Authorization number too long').optional()
});

// Bill of Lading Validation Schema
export const billOfLadingSchema = z.object({
  bolNumber: z.string()
    .regex(BOL_NUMBER_PATTERN, 'BOL number must follow format: BOL-YYYY-XXXXXX'),
  
  bolDate: z.string()
    .datetime()
    .refine(
      (date) => new Date(date) <= new Date(),
      'BOL date cannot be in the future'
    ),
  
  shipperReference: z.string()
    .min(1, 'Shipper reference required')
    .max(20, 'Shipper reference too long')
    .regex(/^[A-Z0-9-]+$/i, 'Shipper reference must be alphanumeric'),
  
  consigneeReference: z.string()
    .max(20, 'Consignee reference too long')
    .regex(/^[A-Z0-9-]*$/i, 'Consignee reference must be alphanumeric')
    .optional(),
  
  freightTerms: z.enum(['prepaid', 'collect', 'prepaid-add', 'third-party']),
  
  commodity: z.object({
    description: z.string().min(5, 'Commodity description required').max(200, 'Description too long'),
    nmfcClass: z.string().max(10, 'NMFC class too long').optional(),
    weight: z.number().positive('Weight must be positive'),
    pieces: z.number().int().positive('Number of pieces must be positive'),
    packageType: z.string().min(1, 'Package type required').max(50, 'Package type too long'),
    hazardousClass: z.string().max(10, 'Hazardous class too long').optional()
  }),
  
  carrierInfo: z.object({
    scac: z.string().length(4, 'SCAC must be 4 characters').optional(),
    dotNumber: z.string().max(10, 'DOT number too long').optional(),
    mcNumber: z.string().max(10, 'MC number too long').optional(),
    insuranceCoverage: monetaryAmountSchema
  }),
  
  specialInstructions: z.string().max(1000, 'Special instructions too long').optional(),
  hazmatDeclaration: z.boolean(),
  declaredValue: monetaryAmountSchema
});

// Third Party Billing Validation Schema
export const thirdPartyBillingSchema = z.object({
  accountNumber: z.string()
    .regex(ACCOUNT_NUMBER_PATTERN, 'Account number must be 8-15 digits'),
  
  companyName: z.string()
    .min(2, 'Company name required')
    .max(100, 'Company name too long'),
  
  contactInfo: contactInfoSchema,
  billingAddress: addressSchema,
  
  authorizationCode: z.string()
    .max(10, 'Authorization code too long')
    .regex(/^[A-Z0-9]*$/i, 'Authorization code must be alphanumeric')
    .optional(),
  
  relationshipType: z.enum([
    'parent-company', 'subsidiary', 'partner', 'vendor', 'customer', 'other'
  ]),
  
  authorizationDocument: fileUploadSchema.optional(),
  billingInstructions: z.string().max(500, 'Billing instructions too long').optional(),
  creditLimit: monetaryAmountSchema.optional(),
  isVerified: z.boolean(),
  verificationDate: z.string().datetime().optional()
});

// Net Terms Validation Schema
export const netTermsSchema = z.object({
  period: z.union([
    z.literal(15),
    z.literal(30),
    z.literal(45),
    z.literal(60),
    z.literal(90)
  ]),
  
  creditApplication: fileUploadSchema.optional(),
  
  tradeReferences: z.array(z.object({
    companyName: z.string().min(2, 'Company name required').max(100, 'Company name too long'),
    contactName: z.string().min(2, 'Contact name required').max(100, 'Contact name too long'),
    contactTitle: z.string().min(2, 'Contact title required').max(100, 'Contact title too long'),
    phone: phoneValidation,
    email: businessEmailValidation,
    relationship: z.string().min(5, 'Relationship description required').max(200, 'Relationship description too long'),
    accountOpenDate: z.string().datetime(),
    creditLimit: monetaryAmountSchema,
    currentBalance: monetaryAmountSchema,
    paymentHistory: z.enum(['excellent', 'good', 'fair', 'poor']),
    averagePaymentDays: z.number().int().min(0).max(365)
  })).min(3, 'At least 3 trade references required').max(5, 'Maximum 5 trade references allowed'),
  
  annualRevenue: z.enum([
    'under-100k', '100k-500k', '500k-1m', '1m-5m', '5m-25m', '25m-100m', 'over-100m'
  ]),
  
  yearsInBusiness: z.number().int().min(0).max(200),
  
  bankReferences: z.array(z.object({
    bankName: z.string().min(2, 'Bank name required').max(100, 'Bank name too long'),
    contactName: z.string().min(2, 'Contact name required').max(100, 'Contact name too long'),
    phone: phoneValidation,
    accountType: z.enum(['checking', 'savings', 'line-of-credit', 'loan']),
    accountOpenDate: z.string().datetime(),
    averageBalance: monetaryAmountSchema,
    relationship: z.string().min(5, 'Relationship description required').max(200, 'Relationship description too long')
  })).min(1, 'At least 1 bank reference required').max(3, 'Maximum 3 bank references allowed'),
  
  financialStatements: z.array(fileUploadSchema).max(5, 'Maximum 5 financial statements allowed').optional(),
  
  creditScore: z.object({
    score: z.number().int().min(300).max(850),
    bureau: z.enum(['experian', 'equifax', 'dun-bradstreet']),
    scoreDate: z.string().datetime(),
    riskLevel: z.enum(['low', 'medium', 'high'])
  }).optional(),
  
  requestedCreditLimit: monetaryAmountSchema,
  
  businessType: z.enum([
    'corporation', 'llc', 'partnership', 'sole-proprietorship', 'government', 'non-profit'
  ]),
  
  taxIdNumber: z.string()
    .regex(TAX_ID_PATTERN, 'Tax ID must be in format XX-XXXXXXX'),
  
  dunsNumber: z.string()
    .regex(DUNS_PATTERN, 'DUNS number must be 9 digits')
    .optional()
});

// Corporate Account Validation Schema
export const corporateAccountSchema = z.object({
  accountNumber: z.string()
    .regex(ACCOUNT_NUMBER_PATTERN, 'Account number must be 8-15 digits'),
  
  accountPin: z.string()
    .regex(PIN_PATTERN, 'PIN must be 4-6 digits'),
  
  billingContact: contactInfoSchema,
  
  accountStatus: z.enum(['active', 'suspended', 'pending', 'closed']),
  creditLimit: monetaryAmountSchema,
  availableCredit: monetaryAmountSchema,
  currentBalance: monetaryAmountSchema,
  
  lastPaymentDate: z.string().datetime().optional(),
  lastPaymentAmount: monetaryAmountSchema.optional(),
  
  paymentHistory: z.array(z.object({
    date: z.string().datetime(),
    amount: monetaryAmountSchema,
    status: z.enum(['paid', 'pending', 'overdue', 'partial']),
    invoiceNumber: z.string().min(1, 'Invoice number required').max(50, 'Invoice number too long'),
    daysOverdue: z.number().int().min(0).optional()
  })).optional(),
  
  accountManagerContact: contactInfoSchema.optional(),
  contractStartDate: z.string().datetime(),
  contractEndDate: z.string().datetime().optional(),
  billingCycle: z.enum(['monthly', 'bi-weekly', 'weekly']),
  autoPayEnabled: z.boolean()
});

// Main payment info validation schema
export const paymentInfoSchema = z.object({
  method: z.enum(['po', 'bol', 'thirdparty', 'net', 'corporate'] as const),
  purchaseOrder: purchaseOrderSchema.optional(),
  billOfLading: billOfLadingSchema.optional(),
  thirdPartyBilling: thirdPartyBillingSchema.optional(),
  netTerms: netTermsSchema.optional(),
  corporateAccount: corporateAccountSchema.optional(),
  totalWithPaymentFees: monetaryAmountSchema.optional(),
  validationStatus: z.object({
    isValid: z.boolean(),
    isComplete: z.boolean(),
    isVerified: z.boolean(),
    errors: z.array(z.object({
      field: z.string(),
      code: z.string(),
      message: z.string(),
      severity: z.enum(['error', 'warning', 'info'])
    })),
    lastValidated: z.string().datetime()
  }),
  lastUpdated: z.string().datetime(),
  paymentMethodFees: z.array(z.object({
    type: z.enum(['processing', 'transaction', 'convenience', 'service']),
    description: z.string(),
    amount: monetaryAmountSchema,
    percentage: z.number().min(0).max(100).optional()
  })).optional()
});

// Business rule validation functions
export function validatePOAmount(poAmount: MonetaryAmount, shipmentTotal: MonetaryAmount): boolean {
  console.log('Validating PO amount:', { poAmount, shipmentTotal });
  return poAmount.amount >= shipmentTotal.amount && poAmount.currency === shipmentTotal.currency;
}

export function validateBOLNumber(bolNumber: string): boolean {
  console.log('Validating BOL number:', bolNumber);
  return BOL_NUMBER_PATTERN.test(bolNumber);
}

export function validateAccountLuhn(accountNumber: string): boolean {
  console.log('Validating account number with Luhn algorithm:', accountNumber);
  // Simplified Luhn algorithm simulation for demo
  const digits = accountNumber.split('').map(Number);
  let sum = 0;
  let isEven = false;
  
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits[i];
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

export function validatePaymentMethodByType(method: PaymentMethodType, data: any, shipmentTotal: MonetaryAmount) {
  console.log('Validating payment method:', { method, data, shipmentTotal });
  
  switch (method) {
    case 'po':
      const poResult = purchaseOrderSchema.safeParse(data.purchaseOrder);
      if (!poResult.success) return { isValid: false, errors: poResult.error.issues };
      
      if (!validatePOAmount(data.purchaseOrder.poAmount, shipmentTotal)) {
        return {
          isValid: false,
          errors: [{
            path: ['purchaseOrder', 'poAmount'],
            message: 'PO amount must be greater than or equal to shipment total',
            code: 'PO_AMOUNT_INSUFFICIENT'
          }]
        };
      }
      break;
      
    case 'bol':
      const bolResult = billOfLadingSchema.safeParse(data.billOfLading);
      if (!bolResult.success) return { isValid: false, errors: bolResult.error.issues };
      break;
      
    case 'thirdparty':
      const thirdPartyResult = thirdPartyBillingSchema.safeParse(data.thirdPartyBilling);
      if (!thirdPartyResult.success) return { isValid: false, errors: thirdPartyResult.error.issues };
      
      if (!validateAccountLuhn(data.thirdPartyBilling.accountNumber)) {
        return {
          isValid: false,
          errors: [{
            path: ['thirdPartyBilling', 'accountNumber'],
            message: 'Invalid account number format',
            code: 'INVALID_ACCOUNT_NUMBER'
          }]
        };
      }
      break;
      
    case 'net':
      const netResult = netTermsSchema.safeParse(data.netTerms);
      if (!netResult.success) return { isValid: false, errors: netResult.error.issues };
      break;
      
    case 'corporate':
      const corporateResult = corporateAccountSchema.safeParse(data.corporateAccount);
      if (!corporateResult.success) return { isValid: false, errors: corporateResult.error.issues };
      break;
      
    default:
      return {
        isValid: false,
        errors: [{
          path: ['method'],
          message: 'Invalid payment method',
          code: 'INVALID_PAYMENT_METHOD'
        }]
      };
  }
  
  return { isValid: true, errors: [] };
}

// Export schema map for dynamic validation
export const paymentMethodSchemas = {
  po: purchaseOrderSchema,
  bol: billOfLadingSchema,
  thirdparty: thirdPartyBillingSchema,
  net: netTermsSchema,
  corporate: corporateAccountSchema
} as const;