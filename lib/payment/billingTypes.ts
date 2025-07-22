import { z } from "zod";
import { Address, ContactInfo } from "@/lib/types";

export type BillingValidationStatus = 'incomplete' | 'complete';

export const taxIdSchema = z.object({
  value: z.string().regex(/^[0-9]{2}-[0-9]{7}$/, 'Invalid Tax ID format (XX-XXXXXXX).').nonempty('Tax ID is required.'),
  countryCode: z.string().length(2).nonempty('Country code is required.'),
});

export type TaxIdInfo = z.infer<typeof taxIdSchema>;

export const businessTypeSchema = z.enum([
  'Corporation',
  'LLC',
  'Partnership',
  'Sole Proprietorship',
  'Government Entity',
  'Non-Profit Organization',
  'Other',
]);

export type BusinessType = z.infer<typeof businessTypeSchema>;

export const industryTypeSchema = z.enum([
  'Manufacturing',
  'Retail/E-commerce',
  'Healthcare',
  'Technology',
  'Automotive',
  'Aerospace',
  'Agriculture',
  'Construction',
  'Education',
  'Energy',
  'Finance',
  'Food & Beverage',
  'Hospitality',
  'Logistics',
  'Media & Entertainment',
  'Mining',
  'Pharmaceuticals',
  'Real Estate',
  'Telecommunications',
  'Transportation',
  'Utilities',
  'Wholesale',
  'Other',
]);

export type IndustryType = z.infer<typeof industryTypeSchema>;

export const annualShippingVolumeSchema = z.enum([
  '< $10K',
  '$10K - $50K',
  '$50K - $250K',
  '$250K - $1M',
  '> $1M',
]);

export type ShippingVolumeRange = z.infer<typeof annualShippingVolumeSchema>;

export const companyInfoSchema = z.object({
  legalName: z.string().min(2, 'Legal Company Name is required.').max(100, 'Legal Company Name cannot exceed 100 characters.'),
  dbaName: z.string().max(100, 'DBA/Trade Name cannot exceed 100 characters.').optional(),
  businessType: businessTypeSchema,
  industry: industryTypeSchema,
  annualShippingVolume: annualShippingVolumeSchema,
  businessDescription: z.string().max(500, 'Business description cannot exceed 500 characters.').optional(),
});

export type CompanyInfo = z.infer<typeof companyInfoSchema>;

export const invoiceDeliveryMethodSchema = z.enum([
  'Email',
  'Mail',
  'EDI',
  'Portal',
]);

export type InvoiceDeliveryMethod = z.infer<typeof invoiceDeliveryMethodSchema>;

export const invoiceFormatSchema = z.enum([
  'Standard',
  'Itemized',
  'Summary',
  'Custom',
]);

export type InvoiceFormat = z.infer<typeof invoiceFormatSchema>;

export const invoiceFrequencySchema = z.enum([
  'Per shipment',
  'Weekly',
  'Monthly',
]);

export type InvoiceFrequency = z.infer<typeof invoiceFrequencySchema>;

export const invoicePreferencesSchema = z.object({
  deliveryMethod: invoiceDeliveryMethodSchema,
  format: invoiceFormatSchema,
  frequency: invoiceFrequencySchema,
  customRequirements: z.string().max(500, 'Custom requirements cannot exceed 500 characters.').optional(),
});

export type InvoicePreferences = z.infer<typeof invoicePreferencesSchema>;

export const billingAddressSchema = z.object({
  address: z.string().min(5, 'Street address is required.').max(100, 'Street address cannot exceed 100 characters.'),
  suite: z.string().max(50, 'Suite/Apt cannot exceed 50 characters.').optional(),
  city: z.string().min(2, 'City is required.').max(50, 'City cannot exceed 50 characters.'),
  state: z.string().min(2, 'State is required.').max(50, 'State cannot exceed 50 characters.'),
  zip: z.string().min(5, 'ZIP code is required.').max(10, 'ZIP code cannot exceed 10 characters.'),
  country: z.string().min(2, 'Country is required.').max(50, 'Country cannot exceed 50 characters.'),
  isResidential: z.boolean(),
  contactInfo: z.object({
    name: z.string().min(2, 'Contact Name is required.').max(100, 'Contact Name cannot exceed 100 characters.'),
    company: z.string().max(100, 'Company Name cannot exceed 100 characters.').optional(),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format.').nonempty('Phone number is required.'),
    email: z.string().email('Invalid email format.').nonempty('Email is required.').regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email format.').refine(email => !/personal|gmail|yahoo|hotmail|outlook/i.test(email), 'Personal email domains are not allowed.'),
    extension: z.string().max(10).optional(),
  }),
  locationType: z.enum(['commercial', 'residential', 'industrial', 'warehouse', 'storage', 'construction', 'other']),
  locationDescription: z.string().max(200).optional(),
});

export type BillingAddressInfo = z.infer<typeof billingAddressSchema>;

export const accountsPayableContactSchema = z.object({
  name: z.string().min(2, 'Full Name is required.').max(100, 'Full Name cannot exceed 100 characters.'),
  title: z.string().max(100, 'Title cannot exceed 100 characters.').optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format.').nonempty('Phone number is required.'),
  email: z.string().email('Invalid email format.').nonempty('Email is required.').regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email format.').refine(email => !/personal|gmail|yahoo|hotmail|outlook/i.test(email), 'Personal email domains are not allowed.'),
  extension: z.string().max(10).optional(),
});

export type AccountsPayableContact = z.infer<typeof accountsPayableContactSchema>;

export const billingInfoSchema = z.object({
  billingAddress: billingAddressSchema,
  sameAsOriginAddress: z.boolean(),
  accountsPayableContact: accountsPayableContactSchema,
  billingDepartment: z.string().max(100, 'Billing Department cannot exceed 100 characters.').optional(),
  glCode: z.string().max(50, 'GL Code cannot exceed 50 characters.').optional(),
  taxId: taxIdSchema,
  companyInformation: companyInfoSchema,
  invoicePreferences: invoicePreferencesSchema,
  validationStatus: z.enum(['incomplete', 'complete']), // Assuming this is managed by the form logic
  lastUpdated: z.string(),
});

export type BillingInfo = z.infer<typeof billingInfoSchema>;
