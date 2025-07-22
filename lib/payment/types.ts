import { z } from 'zod';
import { BillingInfo } from '@/lib/payment/billingTypes';

export type PaymentMethodType =
  | 'po'
  | 'bol'
  | 'thirdparty'
  | 'net'
  | 'corporate';

export const purchaseOrderSchema = z.object({
  poNumber: z.string().min(4).max(50, 'PO Number must be between 4 and 50 characters.').regex(/^[a-zA-Z0-9]+$/, 'PO Number must be alphanumeric.').nonempty('PO Number is required.'),
  poAmount: z.number().min(0.01, 'PO Amount must be greater than 0.').nonnegative('PO Amount cannot be negative.').finite('Invalid PO Amount.'),
  poExpiration: z.string().refine((date) => new Date(date) > new Date(), 'PO Expiration must be a future date.').nonempty('PO Expiration is required.'),
  approvalContactName: z.string().min(2, 'Approval Contact Name is required.').nonempty('Approval Contact Name is required.'),
  approvalContactEmail: z.string().email('Invalid email format.').nonempty('Approval Contact Email is required.').regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email format.').refine(email => !/personal|gmail|yahoo|hotmail|outlook/i.test(email), 'Personal email domains are not allowed.'),
  approvalContactPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format.').nonempty('Approval Contact Phone is required.'),
  department: z.string().max(50, 'Department cannot exceed 50 characters.').optional(),
  costCenter: z.string().max(50, 'Cost Center cannot exceed 50 characters.').optional(),
});

export type PurchaseOrderInfo = z.infer<typeof purchaseOrderSchema>;

export const billOfLadingSchema = z.object({
  bolNumber: z.string().regex(/^BOL-\d{4}-\d{6}$/, 'BOL Number must be in format BOL-YYYY-XXXXXX.').nonempty('BOL Number is required.'),
  bolDate: z.string().refine((date) => new Date(date) <= new Date(), 'BOL Date cannot be a future date.').nonempty('BOL Date is required.'),
  shipperReference: z.string().max(20, 'Shipper Reference cannot exceed 20 characters.').optional(),
  freightTerms: z.enum(['Prepaid', 'Collect', 'ThirdParty'], { required_error: 'Freight Terms is required.' }),
});

export type BillOfLadingInfo = z.infer<typeof billOfLadingSchema>;

export const thirdPartyBillingSchema = z.object({
  accountNumber: z.string().min(8).max(15).regex(/^\d+$/, 'Account Number must be numeric.').nonempty('Account Number is required.'),
  companyName: z.string().min(2).max(100).nonempty('Company Name is required.'),
  contactName: z.string().min(2).nonempty('Contact Name is required.'),
  contactEmail: z.string().email('Invalid email format.').nonempty('Contact Email is required.').regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email format.').refine(email => !/personal|gmail|yahoo|hotmail|outlook/i.test(email), 'Personal email domains are not allowed.'),
  contactPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format.').nonempty('Contact Phone is required.'),
  authorizationCode: z.string().max(10).optional(),
});

export type ThirdPartyBillingInfo = z.infer<typeof thirdPartyBillingSchema>;

export const netTermsSchema = z.object({
  netTermsPeriod: z.enum(['Net 15', 'Net 30', 'Net 45', 'Net 60'], { required_error: 'Net Terms Period is required.' }),
  creditApplication: z.any().refine((file) => file instanceof File && file.size > 0, 'Credit Application file is required.').refine((file) => file instanceof File && ['application/pdf', 'application/msword'].includes(file.type), 'Only PDF and DOC files are allowed.').refine((file) => file instanceof File && file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB.'),
  tradeReference1Name: z.string().min(2).nonempty('Trade Reference 1 Name is required.'),
  tradeReference1Contact: z.string().min(2).nonempty('Trade Reference 1 Contact is required.'),
  tradeReference1Phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format.').nonempty('Trade Reference 1 Phone is required.'),
  tradeReference2Name: z.string().min(2).nonempty('Trade Reference 2 Name is required.'),
  tradeReference2Contact: z.string().min(2).nonempty('Trade Reference 2 Contact is required.'),
  tradeReference2Phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format.').nonempty('Trade Reference 2 Phone is required.'),
  tradeReference3Name: z.string().min(2).nonempty('Trade Reference 3 Name is required.'),
  tradeReference3Contact: z.string().min(2).nonempty('Trade Reference 3 Contact is required.'),
  tradeReference3Phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format.').nonempty('Trade Reference 3 Phone is required.'),
  annualRevenue: z.enum(['< $1M', '$1M - $5M', '$5M - $25M', '> $25M'], { required_error: 'Annual Revenue is required.' }),
});

export type NetTermsInfo = z.infer<typeof netTermsSchema>;

export const corporateAccountSchema = z.object({
  accountNumber: z.string().min(1).nonempty('Account Number is required.'),
  accountPin: z.string().length(4, 'PIN must be 4 digits.').regex(/^\d{4}$/, 'PIN must be numeric.').nonempty('Account PIN is required.'),
  billingContactName: z.string().min(2).nonempty('Billing Contact Name is required.'),
  billingContactEmail: z.string().email('Invalid email format.').nonempty('Billing Contact Email is required.').regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email format.').refine(email => !/personal|gmail|yahoo|hotmail|outlook/i.test(email), 'Personal email domains are not allowed.'),
  billingContactPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format.').nonempty('Billing Contact Phone is required.'),
});

export type CorporateAccountInfo = z.infer<typeof corporateAccountSchema>;

export type PaymentInfo = {
  method: PaymentMethodType;
  reference?: string; // Added reference property
  purchaseOrder?: PurchaseOrderInfo;
  billOfLading?: BillOfLadingInfo;
  thirdPartyBilling?: ThirdPartyBillingInfo;
  netTerms?: NetTermsInfo;
  corporateAccount?: CorporateAccountInfo;
  totalWithPaymentFees?: number;
  validationStatus: 'incomplete' | 'complete';
  lastUpdated: string;
  billingInformation?: BillingInfo;
  paymentDetails: {
    purchaseOrder?: PurchaseOrderInfo;
    billOfLading?: BillOfLadingInfo;
    thirdParty?: ThirdPartyBillingInfo;
    netTerms?: NetTermsInfo;
    corporate?: CorporateAccountInfo;
  };
};

export type MonetaryAmount = {
  value: number;
  currency: string;
};

export type ValidationErrors<T = any> = { [key: string]: string | ValidationErrors<T> };
