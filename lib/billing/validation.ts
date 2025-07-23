// Billing Validation Schemas and Rules
// Task 6.2: Billing Information Form - Comprehensive Zod validation for B2B billing data

import { z } from 'zod';
import type { 
  BillingInfo, BillingAddress, AccountsPayableContact, CompanyInformation, 
  InvoicePreferences, TaxIdInfo, BusinessType, IndustryType, 
  ShippingVolumeRange, InvoiceDeliveryMethod, InvoiceFormat, InvoiceFrequency,
  BillingValidationError, BillingSectionType
} from './types';

// Base validation utilities

const phoneRegex = /^\+?[\d\s\-\(\)\.]{10,}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const businessEmailDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
const zipCodeRegex = {
  US: /^\d{5}(-\d{4})?$/,
  CA: /^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/,
  MX: /^\d{5}$/
};

// Tax ID validation patterns
const taxIdPatterns = {
  ein: /^\d{2}-?\d{7}$/,  // US EIN: XX-XXXXXXX
  ssn: /^\d{3}-?\d{2}-?\d{4}$/, // US SSN: XXX-XX-XXXX
  itin: /^9\d{2}-?\d{2}-?\d{4}$/, // US ITIN: 9XX-XX-XXXX
  gstin: /^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z\d]$/, // India GSTIN
  vat: /^[A-Z]{2}[\dA-Z]{8,12}$/, // EU VAT
  abn: /^\d{11}$/, // Australian ABN
  other: /^[\w\-]{5,20}$/
};

// Custom validation functions

const isBusinessEmail = (email: string): boolean => {
  console.log('Validating business email:', email);
  const domain = email.split('@')[1]?.toLowerCase();
  return domain ? !businessEmailDomains.includes(domain) : false;
};

const isCommercialAddress = (address: string): boolean => {
  console.log('Checking if address is commercial:', address);
  const commercialKeywords = ['suite', 'floor', 'building', 'office', 'plaza', 'center', 'tower', 'complex'];
  const lowerAddress = address.toLowerCase();
  return commercialKeywords.some(keyword => lowerAddress.includes(keyword));
};

const validateTaxId = (taxId: string, type: string, country: string): boolean => {
  console.log('Validating tax ID:', { taxId, type, country });
  
  if (country !== 'US' && type === 'other') {
    return taxId.length >= 5 && taxId.length <= 20;
  }
  
  const pattern = taxIdPatterns[type as keyof typeof taxIdPatterns];
  return pattern ? pattern.test(taxId) : false;
};

const isValidPostalCode = (postalCode: string, country: string): boolean => {
  console.log('Validating postal code:', { postalCode, country });
  const pattern = zipCodeRegex[country as keyof typeof zipCodeRegex];
  return pattern ? pattern.test(postalCode) : postalCode.length >= 3;
};

// Zod Schemas

// Business Hours Schema
const DayHoursSchema = z.object({
  isWorkday: z.boolean(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional()
}).refine(data => {
  if (data.isWorkday) {
    return data.startTime && data.endTime;
  }
  return true;
}, {
  message: "Start time and end time are required for work days"
});

const BusinessHoursSchema = z.object({
  timezone: z.string().min(1, "Timezone is required"),
  monday: DayHoursSchema,
  tuesday: DayHoursSchema,
  wednesday: DayHoursSchema,
  thursday: DayHoursSchema,
  friday: DayHoursSchema,
  saturday: DayHoursSchema.optional(),
  sunday: DayHoursSchema.optional()
});

// Billing Address Schema
export const BillingAddressSchema = z.object({
  streetAddress: z.string()
    .min(5, "Street address must be at least 5 characters")
    .max(100, "Street address must not exceed 100 characters")
    .refine(addr => !/^\d+$/.test(addr), "Street address must include street name"),
  
  suite: z.string()
    .max(20, "Suite/Unit must not exceed 20 characters")
    .optional(),
  
  city: z.string()
    .min(2, "City must be at least 2 characters")
    .max(50, "City must not exceed 50 characters")
    .regex(/^[a-zA-Z\s\-'.]+$/, "City must contain only letters, spaces, hyphens, apostrophes, and periods"),
  
  state: z.string()
    .min(2, "State/Province is required")
    .max(50, "State/Province must not exceed 50 characters"),
  
  postalCode: z.string()
    .min(3, "Postal code must be at least 3 characters")
    .max(10, "Postal code must not exceed 10 characters"),
  
  country: z.string()
    .length(2, "Country must be a 2-letter code"),
  
  isCommercial: z.boolean(),
  isValidated: z.boolean(),
  validationSource: z.enum(['user', 'api', 'geocoding']).optional(),
  addressType: z.enum(['commercial', 'residential', 'po-box', 'mixed-use']),
  deliverabilityScore: z.number().min(0).max(1).optional()
}).refine(data => {
  return isValidPostalCode(data.postalCode, data.country);
}, {
  message: "Invalid postal code format for selected country",
  path: ["postalCode"]
});

// Tax ID Schema
export const TaxIdSchema = z.object({
  taxIdNumber: z.string()
    .min(5, "Tax ID must be at least 5 characters")
    .max(20, "Tax ID must not exceed 20 characters"),
  
  taxIdType: z.enum(['ein', 'ssn', 'itin', 'gstin', 'vat', 'abn', 'other']),
  
  country: z.string()
    .length(2, "Country must be a 2-letter code"),
  
  isValidated: z.boolean(),
  validationSource: z.enum(['manual', 'api', 'irs']).optional(),
  registrationState: z.string().max(50).optional()
}).refine(data => {
  return validateTaxId(data.taxIdNumber, data.taxIdType, data.country);
}, {
  message: "Invalid tax ID format for selected type",
  path: ["taxIdNumber"]
});

// Accounts Payable Contact Schema
export const AccountsPayableContactSchema = z.object({
  fullName: z.string()
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Full name must not exceed 50 characters")
    .regex(/^[a-zA-Z\s\-'.]+$/, "Name must contain only letters, spaces, hyphens, apostrophes, and periods"),
  
  title: z.string()
    .min(2, "Title must be at least 2 characters")
    .max(50, "Title must not exceed 50 characters"),
  
  department: z.string()
    .min(2, "Department must be at least 2 characters")
    .max(50, "Department must not exceed 50 characters"),
  
  phone: z.string()
    .regex(phoneRegex, "Invalid phone number format")
    .min(10, "Phone number must be at least 10 digits"),
  
  phoneExtension: z.string()
    .max(10, "Extension must not exceed 10 characters")
    .regex(/^\d+$/, "Extension must contain only numbers")
    .optional(),
  
  email: z.string()
    .email("Invalid email format")
    .max(100, "Email must not exceed 100 characters")
    .refine(isBusinessEmail, "Business email address is recommended"),
  
  alternateEmail: z.string()
    .email("Invalid alternate email format")
    .max(100, "Alternate email must not exceed 100 characters")
    .optional(),
  
  preferredContactMethod: z.enum(['email', 'phone']),
  
  businessHours: BusinessHoursSchema,
  
  isAuthorizedSigner: z.boolean(),
  
  purchaseOrderLimit: z.number()
    .min(0, "Purchase order limit must be non-negative")
    .max(10000000, "Purchase order limit seems unusually high")
    .optional()
});

// Company Information Schema
export const CompanyInformationSchema = z.object({
  legalName: z.string()
    .min(2, "Legal company name must be at least 2 characters")
    .max(100, "Legal company name must not exceed 100 characters")
    .regex(/^[a-zA-Z0-9\s\-'.&,()]+$/, "Legal name contains invalid characters"),
  
  dbaName: z.string()
    .min(2, "DBA name must be at least 2 characters")
    .max(100, "DBA name must not exceed 100 characters")
    .regex(/^[a-zA-Z0-9\s\-'.&,()]+$/, "DBA name contains invalid characters")
    .optional(),
  
  businessType: z.enum([
    'corporation', 'llc', 'partnership', 'sole-proprietorship', 
    'government', 'non-profit', 'cooperative', 'trust', 
    'limited-partnership', 'professional-corporation', 'other'
  ]),
  
  industry: z.enum([
    'manufacturing', 'retail-ecommerce', 'healthcare-medical', 
    'technology-software', 'automotive', 'aerospace-defense',
    'energy-utilities', 'financial-services', 'real-estate', 
    'construction', 'agriculture', 'food-beverage', 
    'textiles-apparel', 'chemicals-pharmaceuticals', 'metals-mining',
    'transportation-logistics', 'telecommunications', 'media-entertainment',
    'education', 'professional-services', 'hospitality-tourism',
    'sports-recreation', 'environmental-services', 'government-public',
    'non-profit-charitable', 'other'
  ]),
  
  annualShippingVolume: z.enum([
    'under-10k', '10k-50k', '50k-250k', '250k-1m', 
    '1m-5m', '5m-25m', '25m-100m', 'over-100m'
  ]),
  
  businessDescription: z.string()
    .max(500, "Business description must not exceed 500 characters")
    .optional(),
  
  yearsInBusiness: z.number()
    .min(0, "Years in business must be non-negative")
    .max(200, "Years in business seems unusually high")
    .optional(),
  
  numberOfEmployees: z.enum([
    '1', '2-10', '11-50', '51-200', '201-500', 
    '501-1000', '1001-5000', 'over-5000'
  ]).optional(),
  
  businessLicense: z.object({
    licenseNumber: z.string().min(1).max(50),
    issuingAuthority: z.string().min(1).max(100),
    licenseType: z.string().min(1).max(50),
    issueDate: z.string(),
    expirationDate: z.string(),
    isActive: z.boolean(),
    jurisdiction: z.string().min(1).max(50)
  }).optional(),
  
  ownershipType: z.enum([
    'private', 'public', 'government', 'cooperative',
    'employee-owned', 'family-owned', 'foreign-owned',
    'joint-venture', 'franchise', 'other'
  ]),
  
  isPubliclyTraded: z.boolean(),
  stockSymbol: z.string().max(10).optional(),
  parentCompany: z.string().max(100).optional(),
  subsidiaries: z.array(z.string().max(100)).optional(),
  businessRegistrationNumber: z.string().max(50).optional(),
  dunsNumber: z.string().regex(/^\d{9}$/, "DUNS number must be 9 digits").optional(),
  naicsCode: z.string().regex(/^\d{6}$/, "NAICS code must be 6 digits").optional(),
  sicCode: z.string().regex(/^\d{4}$/, "SIC code must be 4 digits").optional()
}).refine(data => {
  if (data.dbaName && data.dbaName === data.legalName) {
    return false;
  }
  return true;
}, {
  message: "DBA name must be different from legal name",
  path: ["dbaName"]
}).refine(data => {
  if (data.isPubliclyTraded && !data.stockSymbol) {
    return false;
  }
  return true;
}, {
  message: "Stock symbol is required for publicly traded companies",
  path: ["stockSymbol"]
});

// Invoice Preferences Schema
export const InvoicePreferencesSchema = z.object({
  deliveryMethod: z.enum(['email', 'mail', 'edi', 'portal', 'fax', 'multiple']),
  
  format: z.enum([
    'standard', 'itemized', 'summary', 'custom',
    'pdf', 'xml', 'csv', 'edi-850', 'edi-810'
  ]),
  
  frequency: z.enum([
    'per-shipment', 'daily', 'weekly', 'bi-weekly',
    'monthly', 'quarterly', 'custom'
  ]),
  
  language: z.enum([
    'english', 'spanish', 'french', 'german', 
    'chinese', 'japanese', 'portuguese', 'other'
  ]),
  
  currency: z.enum([
    'usd', 'cad', 'eur', 'gbp', 'jpy', 'cny', 'mxn', 'aud', 'other'
  ]),
  
  emailSettings: z.object({
    primaryEmail: z.string().email("Invalid primary email"),
    ccEmails: z.array(z.string().email()).optional(),
    bccEmails: z.array(z.string().email()).optional(),
    subjectLineFormat: z.string().min(1).max(100),
    bodyTemplate: z.string().max(1000).optional(),
    attachmentFormat: z.enum(['pdf', 'xml', 'both']),
    encryptionRequired: z.boolean(),
    digitalSignatureRequired: z.boolean(),
    deliveryConfirmationRequired: z.boolean(),
    readReceiptRequired: z.boolean()
  }).optional(),
  
  mailSettings: z.object({
    mailingAddress: BillingAddressSchema,
    attentionLine: z.string().max(50).optional(),
    mailingClass: z.enum(['first-class', 'priority', 'express', 'certified']),
    requireSignature: z.boolean(),
    returnReceiptRequested: z.boolean(),
    envelopeFormat: z.enum(['standard', 'windowed', 'catalog'])
  }).optional(),
  
  ediSettings: z.object({
    ediProvider: z.string().min(1).max(50),
    isaQualifier: z.string().length(2),
    isaId: z.string().min(1).max(15),
    gsQualifier: z.string().length(2),
    gsId: z.string().min(1).max(15),
    tradingPartnerAgreement: z.string().min(1).max(100),
    transactionSets: z.array(z.string()),
    acknowledgmentRequired: z.boolean(),
    testMode: z.boolean(),
    productionCutoverDate: z.string().optional()
  }).optional(),
  
  portalSettings: z.object({
    portalUrl: z.string().url("Invalid portal URL"),
    userAccount: z.string().min(1).max(50),
    accessLevel: z.enum(['view', 'download', 'approve', 'admin']),
    singleSignOnEnabled: z.boolean(),
    mobileAccessEnabled: z.boolean(),
    notificationPreferences: z.object({
      newInvoiceNotification: z.boolean(),
      overdueNotification: z.boolean(),
      paymentConfirmation: z.boolean(),
      accountUpdates: z.boolean(),
      systemMaintenance: z.boolean()
    })
  }).optional(),
  
  customRequirements: z.string().max(500).optional(),
  purchaseOrderRequired: z.boolean(),
  
  paymentTerms: z.object({
    netDays: z.number().min(0).max(365),
    discountDays: z.number().min(0).max(365).optional(),
    discountPercentage: z.number().min(0).max(50).optional(),
    lateFeePercentage: z.number().min(0).max(25).optional(),
    lateFeeFlatAmount: z.number().min(0).max(1000).optional(),
    lateGracePeriod: z.number().min(0).max(90).optional(),
    creditLimit: z.number().min(0).max(10000000).optional(),
    creditCheckRequired: z.boolean(),
    personalGuaranteeRequired: z.boolean(),
    collateralRequired: z.boolean()
  })
}).refine(data => {
  // Validate delivery method specific settings
  if (data.deliveryMethod === 'email' && !data.emailSettings) {
    return false;
  }
  if (data.deliveryMethod === 'mail' && !data.mailSettings) {
    return false;
  }
  if (data.deliveryMethod === 'edi' && !data.ediSettings) {
    return false;
  }
  if (data.deliveryMethod === 'portal' && !data.portalSettings) {
    return false;
  }
  return true;
}, {
  message: "Delivery method settings are required for selected method"
});

// Main Billing Information Schema
export const BillingInfoSchema = z.object({
  billingAddress: BillingAddressSchema,
  sameAsOriginAddress: z.boolean(),
  accountsPayableContact: AccountsPayableContactSchema,
  billingDepartment: z.string().max(50).optional(),
  glCode: z.string().max(20).optional(),
  taxId: TaxIdSchema,
  companyInformation: CompanyInformationSchema,
  invoicePreferences: InvoicePreferencesSchema,
  lastUpdated: z.string()
}).refine(data => {
  // Cross-validation: if same as origin address, billing address should match
  console.log('Cross-validating billing info:', { sameAsOrigin: data.sameAsOriginAddress });
  return true; // Will be implemented with actual address comparison
}, {
  message: "Billing address must match origin address when selected"
});

// Business Rule Validation Functions

export const validateBusinessEntity = (
  businessType: BusinessType, 
  taxId: TaxIdInfo, 
  companyInfo: CompanyInformation
): BillingValidationError[] => {
  console.log('Validating business entity:', { businessType, taxId: taxId.taxIdType, company: companyInfo.legalName });
  
  const errors: BillingValidationError[] = [];
  
  // Validate business type requirements
  if (['corporation', 'llc'].includes(businessType) && !companyInfo.businessRegistrationNumber) {
    errors.push({
      field: 'companyInformation.businessRegistrationNumber',
      section: 'company-information',
      errorCode: 'BUSINESS_REGISTRATION_REQUIRED',
      message: 'Business registration number is required for corporations and LLCs',
      severity: 'error',
      isBlocking: true,
      suggestedFix: 'Provide the state business registration number'
    });
  }
  
  // Validate tax ID requirements
  if (businessType === 'sole-proprietorship' && taxId.taxIdType === 'ein') {
    errors.push({
      field: 'taxId.taxIdType',
      section: 'company-information',
      errorCode: 'TAX_ID_MISMATCH',
      message: 'Sole proprietorships typically use SSN or ITIN, not EIN',
      severity: 'warning',
      isBlocking: false,
      suggestedFix: 'Consider using SSN or ITIN for sole proprietorship'
    });
  }
  
  // Validate public company requirements
  if (companyInfo.isPubliclyTraded && !companyInfo.stockSymbol) {
    errors.push({
      field: 'companyInformation.stockSymbol',
      section: 'company-information',
      errorCode: 'STOCK_SYMBOL_REQUIRED',
      message: 'Stock symbol is required for publicly traded companies',
      severity: 'error',
      isBlocking: true,
      suggestedFix: 'Provide the stock ticker symbol'
    });
  }
  
  return errors;
};

export const validateInvoiceCompatibility = (
  deliveryMethod: InvoiceDeliveryMethod,
  format: InvoiceFormat,
  businessType: BusinessType
): BillingValidationError[] => {
  console.log('Validating invoice compatibility:', { deliveryMethod, format, businessType });
  
  const errors: BillingValidationError[] = [];
  
  // EDI format compatibility
  if (deliveryMethod === 'edi' && !['edi-850', 'edi-810', 'xml'].includes(format)) {
    errors.push({
      field: 'invoicePreferences.format',
      section: 'invoice-preferences',
      errorCode: 'EDI_FORMAT_INCOMPATIBLE',
      message: 'EDI delivery requires EDI or XML format',
      severity: 'error',
      isBlocking: true,
      suggestedFix: 'Select EDI-850, EDI-810, or XML format for EDI delivery'
    });
  }
  
  // Government entity restrictions
  if (businessType === 'government' && deliveryMethod === 'edi' && format !== 'edi-850') {
    errors.push({
      field: 'invoicePreferences.format',
      section: 'invoice-preferences',
      errorCode: 'GOVERNMENT_EDI_REQUIREMENT',
      message: 'Government entities typically require EDI-850 format',
      severity: 'warning',
      isBlocking: false,
      suggestedFix: 'Consider using EDI-850 format for government billing'
    });
  }
  
  return errors;
};

export const validateCrossSection = (billingInfo: BillingInfo): BillingValidationError[] => {
  console.log('Performing cross-section validation');
  
  const errors: BillingValidationError[] = [];
  
  // Validate business entity consistency
  errors.push(...validateBusinessEntity(
    billingInfo.companyInformation.businessType,
    billingInfo.taxId,
    billingInfo.companyInformation
  ));
  
  // Validate invoice compatibility
  errors.push(...validateInvoiceCompatibility(
    billingInfo.invoicePreferences.deliveryMethod,
    billingInfo.invoicePreferences.format,
    billingInfo.companyInformation.businessType
  ));
  
  // Validate contact information consistency
  if (billingInfo.accountsPayableContact.email && billingInfo.invoicePreferences.emailSettings?.primaryEmail) {
    const apEmail = billingInfo.accountsPayableContact.email.toLowerCase();
    const invoiceEmail = billingInfo.invoicePreferences.emailSettings.primaryEmail.toLowerCase();
    
    if (apEmail !== invoiceEmail) {
      errors.push({
        field: 'invoicePreferences.emailSettings.primaryEmail',
        section: 'invoice-preferences',
        errorCode: 'EMAIL_MISMATCH',
        message: 'Invoice email should match AP contact email or be explicitly different',
        severity: 'warning',
        isBlocking: false,
        suggestedFix: 'Use same email or confirm different email is intentional'
      });
    }
  }
  
  // Validate address consistency for mail delivery
  if (billingInfo.invoicePreferences.deliveryMethod === 'mail' && 
      billingInfo.invoicePreferences.mailSettings?.mailingAddress &&
      billingInfo.billingAddress) {
    
    const billingAddr = billingInfo.billingAddress;
    const mailingAddr = billingInfo.invoicePreferences.mailSettings.mailingAddress;
    
    if (billingAddr.streetAddress !== mailingAddr.streetAddress ||
        billingAddr.city !== mailingAddr.city ||
        billingAddr.state !== mailingAddr.state ||
        billingAddr.postalCode !== mailingAddr.postalCode) {
      
      errors.push({
        field: 'invoicePreferences.mailSettings.mailingAddress',
        section: 'invoice-preferences',
        errorCode: 'ADDRESS_MISMATCH',
        message: 'Mailing address differs from billing address',
        severity: 'info',
        isBlocking: false,
        suggestedFix: 'Confirm mailing address is correct or use billing address'
      });
    }
  }
  
  return errors;
};

// Field-level validation utilities

export const validateField = (
  field: string, 
  value: any, 
  section: BillingSectionType,
  fullData?: Partial<BillingInfo>
): BillingValidationError[] => {
  console.log('Validating field:', { field, value, section });
  
  const errors: BillingValidationError[] = [];
  
  try {
    switch (section) {
      case 'billing-address':
        if (field.startsWith('billingAddress.')) {
          const fieldName = field.replace('billingAddress.', '');
          const schema = BillingAddressSchema.pick({ [fieldName]: true } as any);
          schema.parse({ [fieldName]: value });
        }
        break;
        
      case 'accounts-payable-contact':
        if (field.startsWith('accountsPayableContact.')) {
          const fieldName = field.replace('accountsPayableContact.', '');
          const schema = AccountsPayableContactSchema.pick({ [fieldName]: true } as any);
          schema.parse({ [fieldName]: value });
        }
        break;
        
      case 'company-information':
        if (field.startsWith('companyInformation.') || field.startsWith('taxId.')) {
          const isCompanyField = field.startsWith('companyInformation.');
          const fieldName = field.replace(isCompanyField ? 'companyInformation.' : 'taxId.', '');
          const schema = isCompanyField ? CompanyInformationSchema : TaxIdSchema;
          schema.pick({ [fieldName]: true } as any).parse({ [fieldName]: value });
        }
        break;
        
      case 'invoice-preferences':
        if (field.startsWith('invoicePreferences.')) {
          const fieldName = field.replace('invoicePreferences.', '');
          const schema = InvoicePreferencesSchema.pick({ [fieldName]: true } as any);
          schema.parse({ [fieldName]: value });
        }
        break;
    }
  } catch (error: any) {
    if (error.errors) {
      error.errors.forEach((zodError: any) => {
        errors.push({
          field,
          section,
          errorCode: zodError.code || 'VALIDATION_ERROR',
          message: zodError.message,
          severity: 'error',
          isBlocking: true
        });
      });
    }
  }
  
  return errors;
};

// Section validation utilities

export const validateSection = async (
  section: BillingSectionType,
  data: any
): Promise<{ isValid: boolean; errors: BillingValidationError[] }> => {
  console.log('Validating section:', section);
  
  const errors: BillingValidationError[] = [];
  
  try {
    switch (section) {
      case 'billing-address':
        BillingAddressSchema.parse(data);
        break;
      case 'accounts-payable-contact':
        AccountsPayableContactSchema.parse(data);
        break;
      case 'company-information':
        CompanyInformationSchema.parse(data.companyInformation);
        TaxIdSchema.parse(data.taxId);
        break;
      case 'invoice-preferences':
        InvoicePreferencesSchema.parse(data);
        break;
    }
  } catch (error: any) {
    if (error.errors) {
      error.errors.forEach((zodError: any) => {
        errors.push({
          field: `${section}.${zodError.path.join('.')}`,
          section,
          errorCode: zodError.code || 'VALIDATION_ERROR',
          message: zodError.message,
          severity: 'error',
          isBlocking: true
        });
      });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Full billing information validation

export const validateBillingInfo = async (
  billingInfo: BillingInfo
): Promise<{ isValid: boolean; errors: BillingValidationError[] }> => {
  console.log('Performing full billing info validation');
  
  let allErrors: BillingValidationError[] = [];
  
  try {
    // Schema validation
    BillingInfoSchema.parse(billingInfo);
  } catch (error: any) {
    if (error.errors) {
      error.errors.forEach((zodError: any) => {
        allErrors.push({
          field: zodError.path.join('.'),
          section: 'billing-address', // Default section, will be corrected
          errorCode: zodError.code || 'VALIDATION_ERROR',
          message: zodError.message,
          severity: 'error',
          isBlocking: true
        });
      });
    }
  }
  
  // Cross-section validation
  const crossSectionErrors = validateCrossSection(billingInfo);
  allErrors.push(...crossSectionErrors);
  
  // Remove duplicates
  const uniqueErrors = allErrors.filter((error, index, self) => 
    index === self.findIndex(e => e.field === error.field && e.errorCode === error.errorCode)
  );
  
  return {
    isValid: uniqueErrors.length === 0,
    errors: uniqueErrors
  };
};

// Export validation utilities
export {
  isBusinessEmail,
  isCommercialAddress,
  validateTaxId,
  isValidPostalCode,
  phoneRegex,
  emailRegex,
  businessEmailDomains,
  zipCodeRegex,
  taxIdPatterns
};