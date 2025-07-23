// Billing Utility Functions
// Task 6.2: Billing Information Form - Utility functions for formatting, validation, and processing

import type { 
  BillingInfo, BillingAddress, AccountsPayableContact, CompanyInformation, 
  InvoicePreferences, TaxIdInfo, BusinessType, IndustryType, 
  ShippingVolumeRange, InvoiceDeliveryMethod, SmartDefaults,
  SmartDefaultsConfidence, BillingValidationError, BillingSectionType,
  BUSINESS_TYPE_LABELS, INDUSTRY_LABELS, SHIPPING_VOLUME_LABELS
} from './types';

// Address formatting utilities

export const formatAddress = (address: BillingAddress): string => {
  console.log('Formatting address:', address);
  
  const parts = [
    address.streetAddress,
    address.suite ? `Suite ${address.suite}` : '',
    `${address.city}, ${address.state} ${address.postalCode}`,
    address.country !== 'US' ? address.country : ''
  ].filter(Boolean);
  
  return parts.join('\n');
};

export const formatAddressOneLine = (address: BillingAddress): string => {
  console.log('Formatting address (one line):', address);
  
  const parts = [
    address.streetAddress,
    address.suite ? `Suite ${address.suite}` : '',
    address.city,
    address.state,
    address.postalCode,
    address.country !== 'US' ? address.country : ''
  ].filter(Boolean);
  
  return parts.join(', ');
};

export const standardizeAddress = (address: Partial<BillingAddress>): Partial<BillingAddress> => {
  console.log('Standardizing address:', address);
  
  return {
    ...address,
    streetAddress: address.streetAddress?.trim().replace(/\s+/g, ' '),
    suite: address.suite?.trim(),
    city: address.city?.trim().replace(/\b\w/g, l => l.toUpperCase()),
    state: address.state?.trim().toUpperCase(),
    postalCode: address.postalCode?.trim().replace(/\s/g, ''),
    country: address.country?.trim().toUpperCase()
  };
};

// Phone number formatting utilities

export const formatPhoneNumber = (phone: string): string => {
  console.log('Formatting phone number:', phone);
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone; // Return original if can't format
};

export const parsePhoneNumber = (phone: string): { 
  countryCode?: string; 
  areaCode?: string; 
  number: string; 
  extension?: string; 
} => {
  console.log('Parsing phone number:', phone);
  
  const parts = phone.split(/ext\.?|x/i);
  const mainNumber = parts[0].replace(/\D/g, '');
  const extension = parts[1]?.replace(/\D/g, '');
  
  if (mainNumber.length === 10) {
    return {
      areaCode: mainNumber.slice(0, 3),
      number: mainNumber.slice(3),
      extension
    };
  } else if (mainNumber.length === 11 && mainNumber[0] === '1') {
    return {
      countryCode: '1',
      areaCode: mainNumber.slice(1, 4),
      number: mainNumber.slice(4),
      extension
    };
  }
  
  return { number: mainNumber, extension };
};

// Tax ID formatting utilities

export const formatTaxId = (taxId: string, type: string): string => {
  console.log('Formatting tax ID:', { taxId, type });
  
  const cleaned = taxId.replace(/\D/g, '');
  
  switch (type) {
    case 'ein':
      if (cleaned.length === 9) {
        return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
      }
      break;
    case 'ssn':
      if (cleaned.length === 9) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
      }
      break;
    case 'itin':
      if (cleaned.length === 9) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
      }
      break;
    default:
      return taxId;
  }
  
  return taxId;
};

export const validateTaxIdFormat = (taxId: string, type: string, country: string): boolean => {
  console.log('Validating tax ID format:', { taxId, type, country });
  
  const patterns = {
    ein: /^\d{2}-?\d{7}$/,
    ssn: /^\d{3}-?\d{2}-?\d{4}$/,
    itin: /^9\d{2}-?\d{2}-?\d{4}$/,
    gstin: /^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z\d]$/,
    vat: /^[A-Z]{2}[\dA-Z]{8,12}$/,
    abn: /^\d{11}$/,
    other: /^[\w\-]{5,20}$/
  };
  
  const pattern = patterns[type as keyof typeof patterns];
  return pattern ? pattern.test(taxId) : false;
};

// Business information utilities

export const getBusinessTypeLabel = (businessType: BusinessType): string => {
  const labels = {
    'corporation': 'Corporation (C-Corp)',
    'llc': 'Limited Liability Company (LLC)',
    'partnership': 'Partnership',
    'sole-proprietorship': 'Sole Proprietorship',
    'government': 'Government Entity',
    'non-profit': 'Non-Profit Organization',
    'cooperative': 'Cooperative',
    'trust': 'Trust',
    'limited-partnership': 'Limited Partnership',
    'professional-corporation': 'Professional Corporation',
    'other': 'Other'
  };
  
  return labels[businessType] || businessType;
};

export const getIndustryLabel = (industry: IndustryType): string => {
  const labels = {
    'manufacturing': 'Manufacturing',
    'retail-ecommerce': 'Retail & E-commerce',
    'healthcare-medical': 'Healthcare & Medical',
    'technology-software': 'Technology & Software',
    'automotive': 'Automotive',
    'aerospace-defense': 'Aerospace & Defense',
    'energy-utilities': 'Energy & Utilities',
    'financial-services': 'Financial Services',
    'real-estate': 'Real Estate',
    'construction': 'Construction',
    'agriculture': 'Agriculture',
    'food-beverage': 'Food & Beverage',
    'textiles-apparel': 'Textiles & Apparel',
    'chemicals-pharmaceuticals': 'Chemicals & Pharmaceuticals',
    'metals-mining': 'Metals & Mining',
    'transportation-logistics': 'Transportation & Logistics',
    'telecommunications': 'Telecommunications',
    'media-entertainment': 'Media & Entertainment',
    'education': 'Education',
    'professional-services': 'Professional Services',
    'hospitality-tourism': 'Hospitality & Tourism',
    'sports-recreation': 'Sports & Recreation',
    'environmental-services': 'Environmental Services',
    'government-public': 'Government & Public Sector',
    'non-profit-charitable': 'Non-Profit & Charitable',
    'other': 'Other'
  };
  
  return labels[industry] || industry;
};

export const getShippingVolumeLabel = (volume: ShippingVolumeRange): string => {
  const labels = {
    'under-10k': 'Under $10,000',
    '10k-50k': '$10,000 - $50,000',
    '50k-250k': '$50,000 - $250,000',
    '250k-1m': '$250,000 - $1,000,000',
    '1m-5m': '$1,000,000 - $5,000,000',
    '5m-25m': '$5,000,000 - $25,000,000',
    '25m-100m': '$25,000,000 - $100,000,000',
    'over-100m': 'Over $100,000,000'
  };
  
  return labels[volume] || volume;
};

// Smart defaults utilities

export const generateAddressDefaults = (originAddress?: any): Partial<BillingAddress> => {
  console.log('Generating address defaults from origin:', originAddress);
  
  if (!originAddress) {
    return {};
  }
  
  return {
    streetAddress: originAddress.address || '',
    suite: originAddress.suite || '',
    city: originAddress.city || '',
    state: originAddress.state || '',
    postalCode: originAddress.zip || '',
    country: originAddress.country || 'US',
    isCommercial: originAddress.locationType === 'commercial' || false,
    addressType: originAddress.locationType || 'commercial',
    isValidated: false
  };
};

export const generateContactDefaults = (originContact?: any): Partial<AccountsPayableContact> => {
  console.log('Generating contact defaults from origin:', originContact);
  
  if (!originContact) {
    return {
      preferredContactMethod: 'email',
      isAuthorizedSigner: false,
      businessHours: {
        timezone: 'America/New_York',
        monday: { isWorkday: true, startTime: '09:00', endTime: '17:00' },
        tuesday: { isWorkday: true, startTime: '09:00', endTime: '17:00' },
        wednesday: { isWorkday: true, startTime: '09:00', endTime: '17:00' },
        thursday: { isWorkday: true, startTime: '09:00', endTime: '17:00' },
        friday: { isWorkday: true, startTime: '09:00', endTime: '17:00' },
        saturday: { isWorkday: false },
        sunday: { isWorkday: false }
      }
    };
  }
  
  return {
    fullName: originContact.name || '',
    title: 'Accounts Payable Manager',
    department: 'Accounting',
    phone: originContact.phone || '',
    phoneExtension: originContact.extension || '',
    email: originContact.email || '',
    preferredContactMethod: 'email',
    isAuthorizedSigner: false,
    businessHours: {
      timezone: 'America/New_York',
      monday: { isWorkday: true, startTime: '09:00', endTime: '17:00' },
      tuesday: { isWorkday: true, startTime: '09:00', endTime: '17:00' },
      wednesday: { isWorkday: true, startTime: '09:00', endTime: '17:00' },
      thursday: { isWorkday: true, startTime: '09:00', endTime: '17:00' },
      friday: { isWorkday: true, startTime: '09:00', endTime: '17:00' },
      saturday: { isWorkday: false },
      sunday: { isWorkday: false }
    }
  };
};

export const generateCompanyDefaults = (
  originCompany?: string,
  packageContents?: string
): Partial<CompanyInformation> => {
  console.log('Generating company defaults:', { originCompany, packageContents });
  
  // Infer industry from package contents
  let suggestedIndustry: IndustryType = 'other';
  
  if (packageContents) {
    const contents = packageContents.toLowerCase();
    if (contents.includes('electronic') || contents.includes('computer')) {
      suggestedIndustry = 'technology-software';
    } else if (contents.includes('medical') || contents.includes('pharmaceutical')) {
      suggestedIndustry = 'healthcare-medical';
    } else if (contents.includes('automotive') || contents.includes('car') || contents.includes('vehicle')) {
      suggestedIndustry = 'automotive';
    } else if (contents.includes('manufacturing') || contents.includes('machinery')) {
      suggestedIndustry = 'manufacturing';
    } else if (contents.includes('food') || contents.includes('beverage')) {
      suggestedIndustry = 'food-beverage';
    }
  }
  
  return {
    legalName: originCompany || '',
    businessType: 'corporation',
    industry: suggestedIndustry,
    annualShippingVolume: '50k-250k',
    ownershipType: 'private',
    isPubliclyTraded: false
  };
};

export const calculateDefaultsConfidence = (
  originAddress?: any,
  originContact?: any,
  originCompany?: string
): SmartDefaultsConfidence => {
  console.log('Calculating defaults confidence');
  
  let addressConfidence = 0;
  let contactConfidence = 0;
  let companyConfidence = 0;
  
  if (originAddress) {
    addressConfidence = 0.8;
    if (originAddress.locationType === 'commercial') addressConfidence = 0.9;
  }
  
  if (originContact) {
    contactConfidence = 0.7;
    if (originContact.email && originContact.phone) contactConfidence = 0.85;
  }
  
  if (originCompany) {
    companyConfidence = 0.6;
  }
  
  const overall = (addressConfidence + contactConfidence + companyConfidence) / 3;
  
  return {
    overall,
    billingAddress: addressConfidence,
    accountsPayableContact: contactConfidence,
    companyInformation: companyConfidence
  };
};

// Invoice preferences utilities

export const getInvoiceDeliveryMethodLabel = (method: InvoiceDeliveryMethod): string => {
  const labels = {
    'email': 'Email',
    'mail': 'Postal Mail',
    'edi': 'Electronic Data Interchange (EDI)',
    'portal': 'Customer Portal',
    'fax': 'Fax',
    'multiple': 'Multiple Methods'
  };
  
  return labels[method] || method;
};

export const getInvoiceFormatLabel = (format: string): string => {
  const labels = {
    'standard': 'Standard Invoice',
    'itemized': 'Itemized Detail',
    'summary': 'Summary Only',
    'custom': 'Custom Format',
    'pdf': 'PDF Document',
    'xml': 'XML Format',
    'csv': 'CSV Spreadsheet',
    'edi-850': 'EDI 850 (Purchase Order)',
    'edi-810': 'EDI 810 (Invoice)'
  };
  
  return labels[format] || format;
};

export const validateInvoiceDeliverySetup = (preferences: InvoicePreferences): BillingValidationError[] => {
  console.log('Validating invoice delivery setup:', preferences.deliveryMethod);
  
  const errors: BillingValidationError[] = [];
  
  switch (preferences.deliveryMethod) {
    case 'email':
      if (!preferences.emailSettings) {
        errors.push({
          field: 'invoicePreferences.emailSettings',
          section: 'invoice-preferences',
          errorCode: 'EMAIL_SETTINGS_REQUIRED',
          message: 'Email settings are required for email delivery',
          severity: 'error',
          isBlocking: true
        });
      }
      break;
      
    case 'mail':
      if (!preferences.mailSettings) {
        errors.push({
          field: 'invoicePreferences.mailSettings',
          section: 'invoice-preferences',
          errorCode: 'MAIL_SETTINGS_REQUIRED',
          message: 'Mail settings are required for postal delivery',
          severity: 'error',
          isBlocking: true
        });
      }
      break;
      
    case 'edi':
      if (!preferences.ediSettings) {
        errors.push({
          field: 'invoicePreferences.ediSettings',
          section: 'invoice-preferences',
          errorCode: 'EDI_SETTINGS_REQUIRED',
          message: 'EDI settings are required for EDI delivery',
          severity: 'error',
          isBlocking: true
        });
      }
      break;
      
    case 'portal':
      if (!preferences.portalSettings) {
        errors.push({
          field: 'invoicePreferences.portalSettings',
          section: 'invoice-preferences',
          errorCode: 'PORTAL_SETTINGS_REQUIRED',
          message: 'Portal settings are required for portal delivery',
          severity: 'error',
          isBlocking: true
        });
      }
      break;
  }
  
  return errors;
};

// Data processing utilities

export const sanitizeBillingInfo = (billingInfo: Partial<BillingInfo>): Partial<BillingInfo> => {
  console.log('Sanitizing billing info');
  
  return {
    ...billingInfo,
    billingAddress: billingInfo.billingAddress ? {
      ...billingInfo.billingAddress,
      streetAddress: billingInfo.billingAddress.streetAddress?.trim(),
      suite: billingInfo.billingAddress.suite?.trim(),
      city: billingInfo.billingAddress.city?.trim(),
      state: billingInfo.billingAddress.state?.trim().toUpperCase(),
      postalCode: billingInfo.billingAddress.postalCode?.replace(/\s/g, ''),
      country: billingInfo.billingAddress.country?.trim().toUpperCase()
    } : undefined,
    accountsPayableContact: billingInfo.accountsPayableContact ? {
      ...billingInfo.accountsPayableContact,
      fullName: billingInfo.accountsPayableContact.fullName?.trim(),
      title: billingInfo.accountsPayableContact.title?.trim(),
      department: billingInfo.accountsPayableContact.department?.trim(),
      phone: billingInfo.accountsPayableContact.phone?.replace(/\D/g, ''),
      email: billingInfo.accountsPayableContact.email?.trim().toLowerCase()
    } : undefined,
    companyInformation: billingInfo.companyInformation ? {
      ...billingInfo.companyInformation,
      legalName: billingInfo.companyInformation.legalName?.trim(),
      dbaName: billingInfo.companyInformation.dbaName?.trim(),
      businessDescription: billingInfo.companyInformation.businessDescription?.trim()
    } : undefined,
    taxId: billingInfo.taxId ? {
      ...billingInfo.taxId,
      taxIdNumber: billingInfo.taxId.taxIdNumber?.replace(/\D/g, '')
    } : undefined
  };
};

export const calculateBillingCompleteness = (billingInfo: Partial<BillingInfo>): number => {
  console.log('Calculating billing completeness');
  
  let totalFields = 0;
  let completedFields = 0;
  
  // Billing Address (8 required fields)
  const requiredAddressFields = ['streetAddress', 'city', 'state', 'postalCode', 'country'];
  totalFields += requiredAddressFields.length;
  if (billingInfo.billingAddress) {
    completedFields += requiredAddressFields.filter(field => 
      billingInfo.billingAddress![field as keyof BillingAddress]
    ).length;
  }
  
  // Accounts Payable Contact (6 required fields)
  const requiredContactFields = ['fullName', 'title', 'department', 'phone', 'email'];
  totalFields += requiredContactFields.length;
  if (billingInfo.accountsPayableContact) {
    completedFields += requiredContactFields.filter(field => 
      billingInfo.accountsPayableContact![field as keyof AccountsPayableContact]
    ).length;
  }
  
  // Tax ID (3 required fields)
  const requiredTaxFields = ['taxIdNumber', 'taxIdType', 'country'];
  totalFields += requiredTaxFields.length;
  if (billingInfo.taxId) {
    completedFields += requiredTaxFields.filter(field => 
      billingInfo.taxId![field as keyof TaxIdInfo]
    ).length;
  }
  
  // Company Information (5 required fields)
  const requiredCompanyFields = ['legalName', 'businessType', 'industry', 'annualShippingVolume', 'ownershipType'];
  totalFields += requiredCompanyFields.length;
  if (billingInfo.companyInformation) {
    completedFields += requiredCompanyFields.filter(field => 
      billingInfo.companyInformation![field as keyof CompanyInformation]
    ).length;
  }
  
  // Invoice Preferences (5 required fields)
  const requiredInvoiceFields = ['deliveryMethod', 'format', 'frequency', 'language', 'currency'];
  totalFields += requiredInvoiceFields.length;
  if (billingInfo.invoicePreferences) {
    completedFields += requiredInvoiceFields.filter(field => 
      billingInfo.invoicePreferences![field as keyof InvoicePreferences]
    ).length;
  }
  
  return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
};

// localStorage utilities

export const saveBillingInfoToLocalStorage = (billingInfo: Partial<BillingInfo>): void => {
  console.log('Saving billing info to localStorage');
  
  try {
    const sanitized = sanitizeBillingInfo(billingInfo);
    const billingData = {
      ...sanitized,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('currentBillingInfo', JSON.stringify(billingData));
  } catch (error) {
    console.error('Failed to save billing info to localStorage:', error);
  }
};

export const loadBillingInfoFromLocalStorage = (): Partial<BillingInfo> | null => {
  console.log('Loading billing info from localStorage');
  
  try {
    const data = localStorage.getItem('currentBillingInfo');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load billing info from localStorage:', error);
    return null;
  }
};

export const clearBillingInfoFromLocalStorage = (): void => {
  console.log('Clearing billing info from localStorage');
  
  try {
    localStorage.removeItem('currentBillingInfo');
  } catch (error) {
    console.error('Failed to clear billing info from localStorage:', error);
  }
};

// Export utilities for external use
export const billingUtils = {
  // Address utilities
  formatAddress,
  formatAddressOneLine,
  standardizeAddress,
  
  // Phone utilities
  formatPhoneNumber,
  parsePhoneNumber,
  
  // Tax ID utilities
  formatTaxId,
  validateTaxIdFormat,
  
  // Business utilities
  getBusinessTypeLabel,
  getIndustryLabel,
  getShippingVolumeLabel,
  
  // Smart defaults
  generateAddressDefaults,
  generateContactDefaults,
  generateCompanyDefaults,
  calculateDefaultsConfidence,
  
  // Invoice utilities
  getInvoiceDeliveryMethodLabel,
  getInvoiceFormatLabel,
  validateInvoiceDeliverySetup,
  
  // Data processing
  sanitizeBillingInfo,
  calculateBillingCompleteness,
  
  // Storage utilities
  saveBillingInfoToLocalStorage,
  loadBillingInfoFromLocalStorage,
  clearBillingInfoFromLocalStorage
};