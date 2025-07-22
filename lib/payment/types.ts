import { MonetaryAmount } from "@/lib/types";

export type PaymentMethodType =
  | "purchaseOrder"
  | "billOfLading"
  | "thirdPartyBilling"
  | "netTerms"
  | "corporateAccount";

export interface PurchaseOrderInfo {
  poNumber: string;
  poAmount: MonetaryAmount;
  poExpiration: string; // Date string
  approvalContact: string; // Email
  departmentCostCenter?: string;
}

export interface BillOfLadingInfo {
  bolNumber: string;
  bolDate: string; // Date string
  shipperReference?: string;
  freightTerms: string;
}

export interface ThirdPartyBillingInfo {
  accountNumber: string;
  companyName: string;
  contactInfo: string; // Email or Phone
  authorizationCode?: string;
}

export interface NetTermsInfo {
  netTermsPeriod: string;
  creditApplication: string; // File path or URL
  tradeReferences: { name: string; contact: string }[];
  annualRevenue: string; // Range selection
}

export interface CorporateAccountInfo {
  accountNumber: string;
  accountPin: string;
  billingContact: string; // Email or Phone
}

export type PaymentValidationStatus =
  | "notStarted"
  | "inProgress"
  | "completed"
  | "failed";

export interface PaymentInfo {
  method: PaymentMethodType;
  purchaseOrder?: PurchaseOrderInfo;
  billOfLading?: BillOfLadingInfo;
  thirdPartyBilling?: ThirdPartyBillingInfo;
  netTerms?: NetTermsInfo;
  corporateAccount?: CorporateAccountInfo;
  totalWithPaymentFees?: MonetaryAmount;
  validationStatus: PaymentValidationStatus;
  lastUpdated: string; // ISO date string
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}