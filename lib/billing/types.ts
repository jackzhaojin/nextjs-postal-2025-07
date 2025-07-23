// Billing Information TypeScript Interfaces
// Task 6.2: Billing Information Form - Complete type definitions for B2B billing data

export interface BillingInfo {
  billingAddress: BillingAddress;
  sameAsOriginAddress: boolean;
  accountsPayableContact: AccountsPayableContact;
  billingDepartment?: string;
  glCode?: string;
  taxId: TaxIdInfo;
  companyInformation: CompanyInformation;
  invoicePreferences: InvoicePreferences;
  validationStatus: BillingValidationStatus;
  lastUpdated: string;
}

export interface BillingAddress {
  streetAddress: string;
  suite?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isCommercial: boolean;
  isValidated: boolean;
  validationSource?: 'user' | 'api' | 'geocoding';
  addressType: 'commercial' | 'residential' | 'po-box' | 'mixed-use';
  deliverabilityScore?: number;
}

export interface AccountsPayableContact {
  fullName: string;
  title: string;
  department: string;
  phone: string;
  phoneExtension?: string;
  email: string;
  alternateEmail?: string;
  preferredContactMethod: 'email' | 'phone';
  businessHours: BusinessHours;
  isAuthorizedSigner: boolean;
  purchaseOrderLimit?: number;
}

export interface BusinessHours {
  timezone: string;
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

export interface DayHours {
  isWorkday: boolean;
  startTime?: string; // HH:mm format
  endTime?: string; // HH:mm format
}

export interface TaxIdInfo {
  taxIdNumber: string;
  taxIdType: TaxIdType;
  country: string;
  isValidated: boolean;
  validationSource?: 'manual' | 'api' | 'irs';
  registrationState?: string;
}

export type TaxIdType = 
  | 'ein' // US Employer Identification Number
  | 'ssn' // US Social Security Number
  | 'itin' // US Individual Taxpayer Identification Number
  | 'gstin' // India Goods and Services Tax Identification Number
  | 'vat' // European Value Added Tax number
  | 'abn' // Australian Business Number
  | 'other';

export interface CompanyInformation {
  legalName: string;
  dbaName?: string;
  businessType: BusinessType;
  industry: IndustryType;
  annualShippingVolume: ShippingVolumeRange;
  businessDescription?: string;
  yearsInBusiness?: number;
  numberOfEmployees?: EmployeeRange;
  businessLicense?: BusinessLicense;
  corporateStructure?: CorporateStructure;
  ownershipType: OwnershipType;
  isPubliclyTraded: boolean;
  stockSymbol?: string;
  parentCompany?: string;
  subsidiaries?: string[];
  businessRegistrationNumber?: string;
  dunsNumber?: string;
  naicsCode?: string;
  sicCode?: string;
}

export type BusinessType = 
  | 'corporation'
  | 'llc'
  | 'partnership'
  | 'sole-proprietorship'
  | 'government'
  | 'non-profit'
  | 'cooperative'
  | 'trust'
  | 'limited-partnership'
  | 'professional-corporation'
  | 'other';

export type IndustryType = 
  | 'manufacturing'
  | 'retail-ecommerce'
  | 'healthcare-medical'
  | 'technology-software'
  | 'automotive'
  | 'aerospace-defense'
  | 'energy-utilities'
  | 'financial-services'
  | 'real-estate'
  | 'construction'
  | 'agriculture'
  | 'food-beverage'
  | 'textiles-apparel'
  | 'chemicals-pharmaceuticals'
  | 'metals-mining'
  | 'transportation-logistics'
  | 'telecommunications'
  | 'media-entertainment'
  | 'education'
  | 'professional-services'
  | 'hospitality-tourism'
  | 'sports-recreation'
  | 'environmental-services'
  | 'government-public'
  | 'non-profit-charitable'
  | 'other';

export type ShippingVolumeRange = 
  | 'under-10k'
  | '10k-50k'
  | '50k-250k'
  | '250k-1m'
  | '1m-5m'
  | '5m-25m'
  | '25m-100m'
  | 'over-100m';

export type EmployeeRange = 
  | '1'
  | '2-10'
  | '11-50'
  | '51-200'
  | '201-500'
  | '501-1000'
  | '1001-5000'
  | 'over-5000';

export interface BusinessLicense {
  licenseNumber: string;
  issuingAuthority: string;
  licenseType: string;
  issueDate: string;
  expirationDate: string;
  isActive: boolean;
  jurisdiction: string;
}

export interface CorporateStructure {
  incorporationState: string;
  incorporationDate: string;
  boardOfDirectors?: BoardMember[];
  officers?: CompanyOfficer[];
  registeredAgent?: RegisteredAgent;
}

export interface BoardMember {
  name: string;
  title: string;
  appointmentDate: string;
  isChairman: boolean;
}

export interface CompanyOfficer {
  name: string;
  title: string;
  appointmentDate: string;
  isSignatory: boolean;
  signatureAuthority?: string;
}

export interface RegisteredAgent {
  name: string;
  address: BillingAddress;
  phone: string;
  email: string;
}

export type OwnershipType = 
  | 'private'
  | 'public'
  | 'government'
  | 'cooperative'
  | 'employee-owned'
  | 'family-owned'
  | 'foreign-owned'
  | 'joint-venture'
  | 'franchise'
  | 'other';

export interface InvoicePreferences {
  deliveryMethod: InvoiceDeliveryMethod;
  format: InvoiceFormat;
  frequency: InvoiceFrequency;
  language: InvoiceLanguage;
  currency: CurrencyPreference;
  emailSettings?: EmailInvoiceSettings;
  mailSettings?: MailInvoiceSettings;
  ediSettings?: EdiInvoiceSettings;
  portalSettings?: PortalInvoiceSettings;
  customRequirements?: string;
  purchaseOrderRequired: boolean;
  approvalWorkflow?: ApprovalWorkflow;
  paymentTerms: PaymentTerms;
  earlyPaymentDiscounts?: EarlyPaymentDiscount[];
  lateFees?: LateFeeStructure;
}

export type InvoiceDeliveryMethod = 
  | 'email'
  | 'mail'
  | 'edi'
  | 'portal'
  | 'fax'
  | 'multiple';

export type InvoiceFormat = 
  | 'standard'
  | 'itemized'
  | 'summary'
  | 'custom'
  | 'pdf'
  | 'xml'
  | 'csv'
  | 'edi-850'
  | 'edi-810';

export type InvoiceFrequency = 
  | 'per-shipment'
  | 'daily'
  | 'weekly'
  | 'bi-weekly'
  | 'monthly'
  | 'quarterly'
  | 'custom';

export type InvoiceLanguage = 
  | 'english'
  | 'spanish'
  | 'french'
  | 'german'
  | 'chinese'
  | 'japanese'
  | 'portuguese'
  | 'other';

export type CurrencyPreference = 
  | 'usd'
  | 'cad'
  | 'eur'
  | 'gbp'
  | 'jpy'
  | 'cny'
  | 'mxn'
  | 'aud'
  | 'other';

export interface EmailInvoiceSettings {
  primaryEmail: string;
  ccEmails?: string[];
  bccEmails?: string[];
  subjectLineFormat: string;
  bodyTemplate?: string;
  attachmentFormat: 'pdf' | 'xml' | 'both';
  encryptionRequired: boolean;
  digitalSignatureRequired: boolean;
  deliveryConfirmationRequired: boolean;
  readReceiptRequired: boolean;
}

export interface MailInvoiceSettings {
  mailingAddress: BillingAddress;
  attentionLine?: string;
  mailingClass: 'first-class' | 'priority' | 'express' | 'certified';
  requireSignature: boolean;
  returnReceiptRequested: boolean;
  envelopeFormat: 'standard' | 'windowed' | 'catalog';
}

export interface EdiInvoiceSettings {
  ediProvider: string;
  isaQualifier: string;
  isaId: string;
  gsQualifier: string;
  gsId: string;
  tradingPartnerAgreement: string;
  transactionSets: string[];
  acknowledgmentRequired: boolean;
  testMode: boolean;
  productionCutoverDate?: string;
}

export interface PortalInvoiceSettings {
  portalUrl: string;
  userAccount: string;
  accessLevel: 'view' | 'download' | 'approve' | 'admin';
  singleSignOnEnabled: boolean;
  mobileAccessEnabled: boolean;
  notificationPreferences: PortalNotificationSettings;
}

export interface PortalNotificationSettings {
  newInvoiceNotification: boolean;
  overdueNotification: boolean;
  paymentConfirmation: boolean;
  accountUpdates: boolean;
  systemMaintenance: boolean;
}

export interface ApprovalWorkflow {
  requiresApproval: boolean;
  approvalThreshold?: number;
  approvers: ApprovalContact[];
  approvalSequence: 'parallel' | 'sequential' | 'any-one';
  autoApprovalRules?: AutoApprovalRule[];
  escalationRules?: EscalationRule[];
}

export interface ApprovalContact {
  name: string;
  email: string;
  phone?: string;
  title: string;
  approvalLimit?: number;
  isRequired: boolean;
  backupApprover?: string;
}

export interface AutoApprovalRule {
  condition: string;
  threshold: number;
  applicableCategories?: string[];
  timeLimit?: number; // hours
}

export interface EscalationRule {
  triggerCondition: string;
  escalationDelay: number; // hours
  escalateTo: string;
  notificationMethod: 'email' | 'phone' | 'both';
}

export interface PaymentTerms {
  netDays: number;
  discountDays?: number;
  discountPercentage?: number;
  lateFeePercentage?: number;
  lateFeeFlatAmount?: number;
  lateGracePeriod?: number; // days
  creditLimit?: number;
  creditCheckRequired: boolean;
  personalGuaranteeRequired: boolean;
  collateralRequired: boolean;
}

export interface EarlyPaymentDiscount {
  discountPercentage: number;
  daysEarly: number;
  minimumAmount?: number;
  maximumAmount?: number;
  applicableCategories?: string[];
}

export interface LateFeeStructure {
  feeType: 'percentage' | 'flat' | 'tiered';
  feeAmount: number;
  gracePeriodDays: number;
  maximumFee?: number;
  compoundingAllowed: boolean;
  applicationFrequency: 'daily' | 'weekly' | 'monthly';
}

export interface BillingValidationStatus {
  isValid: boolean;
  completionPercentage: number;
  sectionsComplete: BillingSectionStatus;
  validationErrors: BillingValidationError[];
  lastValidated: string;
  requiresReview: boolean;
  reviewComments?: string[];
}

export interface BillingSectionStatus {
  billingAddress: SectionValidationStatus;
  accountsPayableContact: SectionValidationStatus;
  companyInformation: SectionValidationStatus;
  invoicePreferences: SectionValidationStatus;
}

export interface SectionValidationStatus {
  isComplete: boolean;
  isValid: boolean;
  completionPercentage: number;
  requiredFieldsComplete: boolean;
  hasErrors: boolean;
  hasWarnings: boolean;
  lastUpdated: string;
}

export interface BillingValidationError {
  field: string;
  section: BillingSectionType;
  errorCode: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  suggestedFix?: string;
  isBlocking: boolean;
}

export type BillingSectionType = 
  | 'billing-address'
  | 'accounts-payable-contact'
  | 'company-information'
  | 'invoice-preferences';

// Form Props and Component Interfaces

export interface BillingSectionProps {
  billingInfo: BillingInfo;
  onBillingInfoChange: (info: Partial<BillingInfo>) => void;
  validationErrors: BillingValidationError[];
  isSubmitting: boolean;
  showOptionalFields?: boolean;
  onSectionComplete?: (section: BillingSectionType) => void;
  className?: string;
}

export interface BillingAddressSectionProps extends BillingSectionProps {
  originAddress?: any; // From existing transaction
  enableSmartDefaults: boolean;
  onAddressValidation?: (address: BillingAddress, isValid: boolean) => void;
}

export interface AccountsPayableContactSectionProps extends BillingSectionProps {
  originContact?: any; // From existing transaction
  suggestedDepartments: string[];
  onContactValidation?: (contact: AccountsPayableContact, isValid: boolean) => void;
}

export interface CompanyInformationSectionProps extends BillingSectionProps {
  businessTypeOptions: BusinessTypeOption[];
  industryOptions: IndustryOption[];
  onBusinessVerification?: (company: CompanyInformation, isVerified: boolean) => void;
}

export interface InvoicePreferencesSectionProps extends BillingSectionProps {
  supportedDeliveryMethods: InvoiceDeliveryMethodOption[];
  onPreferencesValidation?: (preferences: InvoicePreferences, isValid: boolean) => void;
}

// Configuration and Options Types

export interface BusinessTypeOption {
  value: BusinessType;
  label: string;
  description: string;
  taxIdRequired: boolean;
  registrationRequired: boolean;
  commonIndustries: IndustryType[];
}

export interface IndustryOption {
  value: IndustryType;
  label: string;
  description: string;
  parentCategory?: string;
  complianceRequirements: string[];
  commonBusinessTypes: BusinessType[];
  naicsCode?: string;
  sicCode?: string;
}

export interface InvoiceDeliveryMethodOption {
  value: InvoiceDeliveryMethod;
  label: string;
  description: string;
  isAvailable: boolean;
  setupRequired: boolean;
  additionalFee?: number;
  supportedFormats: InvoiceFormat[];
  businessRequirements: string[];
}

// Smart Defaults and Auto-fill Types

export interface SmartDefaults {
  billingAddress?: Partial<BillingAddress>;
  accountsPayableContact?: Partial<AccountsPayableContact>;
  companyInformation?: Partial<CompanyInformation>;
  confidence: SmartDefaultsConfidence;
  source: SmartDefaultsSource;
  appliedAt: string;
}

export interface SmartDefaultsConfidence {
  overall: number; // 0-1
  billingAddress: number;
  accountsPayableContact: number;
  companyInformation: number;
}

export type SmartDefaultsSource = 
  | 'origin-address'
  | 'existing-transaction'
  | 'user-profile'
  | 'business-directory'
  | 'previous-shipment'
  | 'manual';

// API Integration Types

export interface AddressValidationRequest {
  address: Partial<BillingAddress>;
  validateCommercial?: boolean;
  includeAlternatives?: boolean;
}

export interface AddressValidationResponse {
  isValid: boolean;
  standardizedAddress?: BillingAddress;
  alternatives?: BillingAddress[];
  validationDetails: AddressValidationDetails;
  confidence: number;
}

export interface AddressValidationDetails {
  streetAddressValid: boolean;
  cityValid: boolean;
  stateValid: boolean;
  postalCodeValid: boolean;
  isCommercial: boolean;
  isDeliverable: boolean;
  carrierRoute?: string;
  congressionalDistrict?: string;
  timeZone?: string;
}

export interface BusinessVerificationRequest {
  companyInformation: Partial<CompanyInformation>;
  taxId?: TaxIdInfo;
  verificationLevel: 'basic' | 'standard' | 'enhanced';
}

export interface BusinessVerificationResponse {
  isVerified: boolean;
  verificationLevel: string;
  businessDetails: VerifiedBusinessDetails;
  riskScore: number;
  complianceStatus: ComplianceStatus;
  lastUpdated: string;
}

export interface VerifiedBusinessDetails {
  legalName: string;
  businessType: BusinessType;
  industry: IndustryType;
  incorporationDate?: string;
  incorporationState?: string;
  businessStatus: 'active' | 'inactive' | 'suspended' | 'dissolved';
  businessLicenses: BusinessLicense[];
  creditRating?: CreditRating;
  financialMetrics?: FinancialMetrics;
}

export interface ComplianceStatus {
  taxCompliance: boolean;
  businessLicenseCompliance: boolean;
  industryCompliance: boolean;
  sanctionsCheckPass: boolean;
  amlCheckPass: boolean;
  complianceNotes?: string[];
}

export interface CreditRating {
  score: number;
  agency: string;
  lastUpdated: string;
  outlook: 'positive' | 'stable' | 'negative';
  riskLevel: 'low' | 'medium' | 'high';
}

export interface FinancialMetrics {
  annualRevenue?: number;
  numberOfEmployees?: number;
  yearsInBusiness: number;
  creditLimit?: number;
  paymentHistory?: PaymentHistoryMetrics;
}

export interface PaymentHistoryMetrics {
  averagePaymentDays: number;
  latePaymentPercentage: number;
  defaultRate: number;
  creditUtilization: number;
}

// Hook Return Types

export interface UseBillingInformationReturn {
  billingInfo: BillingInfo;
  updateBillingInfo: (updates: Partial<BillingInfo>) => void;
  resetBillingInfo: () => void;
  validateSection: (section: BillingSectionType) => Promise<SectionValidationStatus>;
  validateAllSections: () => Promise<BillingValidationStatus>;
  applySmartDefaults: () => Promise<void>;
  isLoading: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  validationStatus: BillingValidationStatus;
  saveProgress: () => Promise<void>;
}

export interface UseSmartDefaultsReturn {
  getAddressDefaults: () => Partial<BillingAddress>;
  getContactDefaults: () => Partial<AccountsPayableContact>;
  getCompanyDefaults: () => Partial<CompanyInformation>;
  applySmartDefaults: (section: BillingSectionType) => void;
  applyAllDefaults: () => void;
  getDefaultsConfidence: () => SmartDefaultsConfidence;
  isLoadingDefaults: boolean;
}

export interface UseBillingValidationReturn {
  validateField: (field: string, value: any) => BillingValidationError[];
  validateSection: (section: BillingSectionType, data: any) => Promise<SectionValidationStatus>;
  validateCrossSection: () => Promise<BillingValidationError[]>;
  getFieldErrors: (field: string) => BillingValidationError[];
  getSectionErrors: (section: BillingSectionType) => BillingValidationError[];
  clearErrors: (field?: string) => void;
  isValidating: boolean;
}

export interface UseAddressValidationReturn {
  validateAddress: (address: Partial<BillingAddress>) => Promise<AddressValidationResponse>;
  standardizeAddress: (address: Partial<BillingAddress>) => Promise<BillingAddress>;
  isValidatingAddress: boolean;
  lastValidationResult?: AddressValidationResponse;
}

// Error and Utility Types

export interface BillingFormError {
  field: string;
  message: string;
  code: string;
  section: BillingSectionType;
  severity: 'error' | 'warning';
}

export interface BillingFormState {
  currentSection: BillingSectionType;
  sectionsCompleted: BillingSectionType[];
  hasUnsavedChanges: boolean;
  isSubmitting: boolean;
  lastSaved?: string;
}

// Constants and Enums Export

export const BILLING_SECTION_ORDER: BillingSectionType[] = [
  'billing-address',
  'accounts-payable-contact', 
  'company-information',
  'invoice-preferences'
];

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
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

export const INDUSTRY_LABELS: Record<IndustryType, string> = {
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

export const SHIPPING_VOLUME_LABELS: Record<ShippingVolumeRange, string> = {
  'under-10k': 'Under $10,000',
  '10k-50k': '$10,000 - $50,000',
  '50k-250k': '$50,000 - $250,000',
  '250k-1m': '$250,000 - $1,000,000',
  '1m-5m': '$1,000,000 - $5,000,000',
  '5m-25m': '$5,000,000 - $25,000,000',
  '25m-100m': '$25,000,000 - $100,000,000',
  'over-100m': 'Over $100,000,000'
};