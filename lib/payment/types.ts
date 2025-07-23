// Payment Method TypeScript interfaces for B2B Shipping Transport System
// Task 6.1: Payment Method Selection - Enhanced TypeScript definitions

import { ContactInfo, Address } from '../types';

export type PaymentMethodType = 'po' | 'bol' | 'thirdparty' | 'net' | 'corporate';

export interface MonetaryAmount {
  amount: number;
  currency: 'USD' | 'CAD' | 'MXN';
}

export interface PaymentValidationStatus {
  isValid: boolean;
  isComplete: boolean;
  isVerified: boolean;
  errors: PaymentValidationError[];
  lastValidated: string;
}

export interface PaymentValidationError {
  field: string;
  code: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

// Core Payment Info extending existing interface
export interface EnhancedPaymentInfo {
  method: PaymentMethodType;
  purchaseOrder?: PurchaseOrderInfo;
  billOfLading?: BillOfLadingInfo;
  thirdPartyBilling?: ThirdPartyBillingInfo;
  netTerms?: NetTermsInfo;
  corporateAccount?: CorporateAccountInfo;
  totalWithPaymentFees?: MonetaryAmount;
  validationStatus: PaymentValidationStatus;
  lastUpdated: string;
  paymentMethodFees?: PaymentMethodFee[];
}

export interface PaymentMethodFee {
  type: 'processing' | 'transaction' | 'convenience' | 'service';
  description: string;
  amount: MonetaryAmount;
  percentage?: number;
}

// Purchase Order Payment Method
export interface PurchaseOrderInfo {
  poNumber: string;
  poAmount: MonetaryAmount;
  expirationDate: string;
  approvalContact: ContactInfo;
  department?: string;
  costCenter?: string;
  projectCode?: string;
  glCode?: string;
  approvalChain: ApprovalContact[];
  terms: POTerms;
  isPreApproved: boolean;
  authorizationNumber?: string;
}

export interface ApprovalContact {
  name: string;
  title: string;
  email: string;
  phone: string;
  approvalLevel: number;
  maxApprovalAmount: MonetaryAmount;
}

export interface POTerms {
  paymentTerms: string;
  deliveryTerms: string;
  warrantyTerms?: string;
  specialConditions?: string[];
}

// Bill of Lading Payment Method
export interface BillOfLadingInfo {
  bolNumber: string;
  bolDate: string;
  shipperReference: string;
  consigneeReference?: string;
  freightTerms: 'prepaid' | 'collect' | 'prepaid-add' | 'third-party';
  commodity: CommodityInfo;
  carrierInfo: CarrierInfo;
  specialInstructions?: string;
  hazmatDeclaration: boolean;
  declaredValue: MonetaryAmount;
}

export interface CommodityInfo {
  description: string;
  nmfcClass?: string;
  weight: number;
  pieces: number;
  packageType: string;
  hazardousClass?: string;
}

export interface CarrierInfo {
  scac?: string;
  dotNumber?: string;
  mcNumber?: string;
  insuranceCoverage: MonetaryAmount;
}

// Third-Party Billing Payment Method
export interface ThirdPartyBillingInfo {
  accountNumber: string;
  companyName: string;
  contactInfo: ContactInfo;
  billingAddress: Address;
  authorizationCode?: string;
  relationshipType: 'parent-company' | 'subsidiary' | 'partner' | 'vendor' | 'customer' | 'other';
  authorizationDocument?: FileUpload;
  billingInstructions?: string;
  creditLimit?: MonetaryAmount;
  isVerified: boolean;
  verificationDate?: string;
}

// Net Terms Payment Method
export interface NetTermsInfo {
  period: 15 | 30 | 45 | 60 | 90;
  creditApplication?: FileUpload;
  tradeReferences: TradeReference[];
  annualRevenue: RevenueRange;
  yearsInBusiness: number;
  bankReferences: BankReference[];
  financialStatements?: FileUpload[];
  creditScore?: CreditScoreInfo;
  requestedCreditLimit: MonetaryAmount;
  businessType: 'corporation' | 'llc' | 'partnership' | 'sole-proprietorship' | 'government' | 'non-profit';
  taxIdNumber: string;
  dunsNumber?: string;
}

export type RevenueRange = 
  | 'under-100k'
  | '100k-500k'
  | '500k-1m'
  | '1m-5m'
  | '5m-25m'
  | '25m-100m'
  | 'over-100m';

export interface TradeReference {
  companyName: string;
  contactName: string;
  contactTitle: string;
  phone: string;
  email: string;
  relationship: string;
  accountOpenDate: string;
  creditLimit: MonetaryAmount;
  currentBalance: MonetaryAmount;
  paymentHistory: 'excellent' | 'good' | 'fair' | 'poor';
  averagePaymentDays: number;
}

export interface BankReference {
  bankName: string;
  contactName: string;
  phone: string;
  accountType: 'checking' | 'savings' | 'line-of-credit' | 'loan';
  accountOpenDate: string;
  averageBalance: MonetaryAmount;
  relationship: string;
}

export interface CreditScoreInfo {
  score: number;
  bureau: 'experian' | 'equifax' | 'dun-bradstreet';
  scoreDate: string;
  riskLevel: 'low' | 'medium' | 'high';
}

// Corporate Account Payment Method
export interface CorporateAccountInfo {
  accountNumber: string;
  accountPin: string;
  billingContact: ContactInfo;
  accountStatus: 'active' | 'suspended' | 'pending' | 'closed';
  creditLimit: MonetaryAmount;
  availableCredit: MonetaryAmount;
  currentBalance: MonetaryAmount;
  lastPaymentDate?: string;
  lastPaymentAmount?: MonetaryAmount;
  paymentHistory: PaymentHistoryRecord[];
  accountManagerContact?: ContactInfo;
  contractStartDate: string;
  contractEndDate?: string;
  billingCycle: 'monthly' | 'bi-weekly' | 'weekly';
  autoPayEnabled: boolean;
}

export interface PaymentHistoryRecord {
  date: string;
  amount: MonetaryAmount;
  status: 'paid' | 'pending' | 'overdue' | 'partial';
  invoiceNumber: string;
  daysOverdue?: number;
}

// File Upload Interface
export interface FileUpload {
  file: File;
  name: string;
  size: number;
  type: string;
  uploadDate: string;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  url?: string;
  checksum?: string;
}

// Payment Method Configuration
export interface PaymentMethodConfig {
  method: PaymentMethodType;
  isEnabled: boolean;
  displayName: string;
  description: string;
  icon: string;
  fees: PaymentMethodFee[];
  requirements: PaymentMethodRequirement[];
  validationRules: PaymentValidationRule[];
  eligibilityCriteria: EligibilityCriteria;
}

export interface PaymentMethodRequirement {
  field: string;
  required: boolean;
  description: string;
  format?: string;
  example?: string;
}

export interface PaymentValidationRule {
  field: string;
  type: 'required' | 'format' | 'range' | 'custom' | 'async';
  rule: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface EligibilityCriteria {
  minimumShipmentValue?: MonetaryAmount;
  allowedCustomerTypes: string[];
  regionRestrictions?: string[];
  volumeRequirements?: {
    minimumMonthlyShipments?: number;
    minimumAnnualVolume?: MonetaryAmount;
  };
}

// Form State Management Types
export interface PaymentFormState {
  selectedMethod: PaymentMethodType | null;
  formData: Partial<EnhancedPaymentInfo>;
  validationErrors: Record<string, PaymentValidationError[]>;
  isSubmitting: boolean;
  isValidating: boolean;
  isDirty: boolean;
  completedSections: string[];
}

export interface PaymentFormAction {
  type: 'SELECT_METHOD' | 'UPDATE_FIELD' | 'SET_ERRORS' | 'VALIDATE_START' | 'VALIDATE_END' | 'SUBMIT_START' | 'SUBMIT_END' | 'RESET';
  payload?: any;
}

// API Integration Types
export interface PaymentMethodValidationRequest {
  method: PaymentMethodType;
  data: Partial<EnhancedPaymentInfo>;
  shipmentTotal: MonetaryAmount;
  customerContext?: CustomerContext;
}

export interface PaymentMethodValidationResponse {
  isValid: boolean;
  errors: PaymentValidationError[];
  warnings: PaymentValidationError[];
  estimatedFees: PaymentMethodFee[];
  totalWithFees: MonetaryAmount;
  approvalRequired: boolean;
  approvalTimeframe?: string;
}

export interface CustomerContext {
  customerId?: string;
  customerType: 'new' | 'existing' | 'preferred';
  accountHistory?: {
    averageMonthlyVolume: MonetaryAmount;
    paymentHistory: 'excellent' | 'good' | 'fair' | 'poor';
    accountAge: number;
  };
}

// Error Handling Types
export interface PaymentError extends Error {
  code: PaymentErrorCode;
  field?: string;
  context?: any;
}

export type PaymentErrorCode = 
  | 'INVALID_PO_NUMBER'
  | 'PO_AMOUNT_INSUFFICIENT'
  | 'PO_EXPIRED'
  | 'INVALID_BOL_FORMAT'
  | 'BOL_DATE_INVALID'
  | 'ACCOUNT_NOT_FOUND'
  | 'INVALID_PIN'
  | 'CREDIT_LIMIT_EXCEEDED'
  | 'ACCOUNT_SUSPENDED'
  | 'FILE_TOO_LARGE'
  | 'INVALID_FILE_TYPE'
  | 'NETWORK_ERROR'
  | 'VALIDATION_FAILED'
  | 'UNAUTHORIZED'
  | 'UNKNOWN_ERROR';

// Component Props Types
export interface PaymentMethodCardProps {
  method: PaymentMethodConfig;
  isSelected: boolean;
  onSelect: (method: PaymentMethodType) => void;
  showFees?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface PaymentFormProps {
  method: PaymentMethodType;
  data?: Partial<EnhancedPaymentInfo>;
  onChange: (data: Partial<EnhancedPaymentInfo>) => void;
  onValidate?: (data: Partial<EnhancedPaymentInfo>) => Promise<PaymentValidationError[]>;
  errors?: PaymentValidationError[];
  isSubmitting?: boolean;
  shipmentTotal: MonetaryAmount;
  className?: string;
}

// Utility Types for Payment Processing
export interface PaymentCalculationResult {
  subtotal: MonetaryAmount;
  fees: PaymentMethodFee[];
  total: MonetaryAmount;
  savings?: MonetaryAmount;
  breakdown: {
    baseAmount: MonetaryAmount;
    processingFees: MonetaryAmount;
    serviceFees: MonetaryAmount;
    taxes: MonetaryAmount;
  };
}

export interface PaymentMethodComparison {
  method: PaymentMethodType;
  total: MonetaryAmount;
  fees: PaymentMethodFee[];
  processingTime: string;
  advantages: string[];
  disadvantages: string[];
  eligibility: 'eligible' | 'conditional' | 'ineligible';
  recommendationScore: number;
}