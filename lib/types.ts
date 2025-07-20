// Core TypeScript interfaces for B2B Shipping Transport System
// Based on specifications in TECHNICAL_HIGH_LEVEL.md and prd.md

export interface ShippingTransaction {
  id: string;
  timestamp: Date;
  shipmentDetails: ShipmentDetails;
  selectedOption?: PricingOption;
  paymentInfo?: PaymentInfo;
  pickupDetails?: PickupDetails;
  confirmationNumber?: string;
  status: 'draft' | 'pricing' | 'payment' | 'pickup' | 'review' | 'confirmed';
}

export interface ShipmentDetails {
  origin: Address;
  destination: Address;
  package: PackageInfo;
  deliveryPreferences: DeliveryPreferences;
}

export interface Address {
  address: string;
  suite?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isResidential: boolean;
  contactInfo: ContactInfo;
  locationType: 'commercial' | 'residential' | 'industrial' | 'warehouse' | 'storage' | 'construction' | 'other';
  locationDescription?: string;
}

export interface ContactInfo {
  name: string;
  company?: string;
  phone: string;
  email: string;
  extension?: string;
}

export interface PackageInfo {
  type: 'envelope' | 'small' | 'medium' | 'large' | 'pallet' | 'crate' | 'multiple';
  dimensions: Dimensions;
  weight: Weight;
  declaredValue: number;
  currency: 'USD' | 'CAD' | 'MXN';
  contents: string;
  contentsCategory: PackageContentsCategory;
  specialHandling: SpecialHandling[];
  multiplePackages?: MultiplePackageDetails;
}

export interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: 'in' | 'cm';
}

export interface Weight {
  value: number;
  unit: 'lbs' | 'kg';
}

export type PackageContentsCategory = 
  | 'electronics'
  | 'automotive'
  | 'industrial'
  | 'documents'
  | 'clothing'
  | 'food'
  | 'medical'
  | 'furniture'
  | 'raw-materials'
  | 'other';

export interface SpecialHandling {
  type: 'fragile' | 'this-side-up' | 'temperature-controlled' | 'hazardous' | 'white-glove' | 'inside-delivery' | 'liftgate-pickup' | 'liftgate-delivery';
  details?: string;
  fee: number;
}

export interface MultiplePackageDetails {
  numberOfPieces: number;
  pieces: PackagePiece[];
  totalWeight: number;
  totalDeclaredValue: number;
}

export interface PackagePiece {
  id: string;
  type: PackageInfo['type'];
  dimensions: Dimensions;
  weight: Weight;
  description: string;
  declaredValue: number;
}

export interface DeliveryPreferences {
  signatureRequired: boolean;
  adultSignatureRequired: boolean;
  smsConfirmation: boolean;
  photoProof: boolean;
  saturdayDelivery: boolean;
  holdAtLocation: boolean;
  serviceLevel: 'economical' | 'fastest' | 'reliable' | 'carbon-neutral';
}

export interface HazmatDetails {
  unNumber: string;
  properShippingName: string;
  hazardClass: '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
  packingGroup: 'I' | 'II' | 'III';
  totalQuantity: number;
  quantityUnit: string;
  emergencyContact: string;
}

export interface PricingOption {
  id: string;
  category: 'ground' | 'air' | 'freight';
  serviceType: string;
  carrier: string;
  pricing: PricingBreakdown;
  estimatedDelivery: string;
  transitDays: number;
  features: string[];
  carbonFootprint?: number;
}

export interface PricingBreakdown {
  baseRate: number;
  fuelSurcharge: number;
  fuelSurchargePercentage: number;
  insurance: number;
  insurancePercentage: number;
  specialHandling: number;
  deliveryConfirmation: number;
  taxes: number;
  taxPercentage: number;
  total: number;
  calculationBasis: {
    distance: number;
    weight: number;
    dimensionalWeight?: number;
    zone?: string;
  };
}

export interface PaymentInfo {
  method: 'po' | 'bol' | 'thirdparty' | 'net' | 'corporate';
  reference: string;
  billingContact: ContactInfo;
  companyInfo: CompanyInfo;
  billingAddress: Address;
  invoicePreferences: InvoicePreferences;
  paymentDetails: PaymentMethodDetails;
}

export interface CompanyInfo {
  legalName: string;
  dbaName?: string;
  businessType: 'corporation' | 'llc' | 'partnership' | 'sole-proprietorship' | 'government' | 'non-profit';
  industry: string;
  annualShippingVolume: '<10k' | '10k-50k' | '50k-250k' | '250k-1m' | '>1m';
  taxId: string;
  glCode?: string;
}

export interface InvoicePreferences {
  deliveryMethod: 'email' | 'mail' | 'edi' | 'portal';
  format: 'standard' | 'itemized' | 'summary' | 'custom';
  frequency: 'per-shipment' | 'weekly' | 'monthly';
}

export interface PaymentMethodDetails {
  purchaseOrder?: {
    poNumber: string;
    poAmount: number;
    expirationDate: string;
    approvalContact: string;
    department: string;
  };
  billOfLading?: {
    bolNumber: string;
    bolDate: string;
    shipperReference: string;
    freightTerms: 'prepaid' | 'collect' | 'prepaid-add';
  };
  thirdParty?: {
    accountNumber: string;
    companyName: string;
    contactInfo: ContactInfo;
    authorizationCode?: string;
  };
  netTerms?: {
    period: 15 | 30 | 45 | 60;
    creditApplication?: File;
    tradeReferences: TradeReference[];
    annualRevenue: string;
  };
  corporate?: {
    accountNumber: string;
    accountPin: string;
    billingContact: ContactInfo;
  };
}

export interface TradeReference {
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  relationship: string;
}

export interface PickupDetails {
  date: string;
  timeSlot: TimeSlot;
  instructions: string;
  contactPerson: string;
  phone: string;
  backupContact?: {
    name: string;
    phone: string;
  };
  accessInstructions: PickupAccessInstructions;
  equipmentRequirements: EquipmentRequirements;
  notificationPreferences: NotificationPreferences;
  readyTime: string;
  authorizedPersonnel: string[];
  specialAuthorization?: SpecialAuthorization;
}

export interface TimeSlot {
  id: string;
  display: string;
  startTime: string;
  endTime: string;
  availability: 'available' | 'limited' | 'unavailable';
  additionalFee?: number;
}

export interface PickupAccessInstructions {
  gateCode?: string;
  securityRequired: boolean;
  appointmentRequired: boolean;
  limitedParking: boolean;
  forkliftAvailable: boolean;
  liftgateRequired: boolean;
  dockNumber?: string;
  parkingInstructions: string;
  packageLocation: string;
  driverInstructions: string;
}

export interface EquipmentRequirements {
  dolly: boolean;
  applianceDolly: boolean;
  furniturePads: boolean;
  straps: boolean;
  palletJack: boolean;
  twoPersonTeam: boolean;
  loadingAssistance: 'customer' | 'driver-assist' | 'full-service';
}

export interface NotificationPreferences {
  emailReminder24h: boolean;
  smsReminder2h: boolean;
  callReminder30m: boolean;
  driverEnRoute: boolean;
  pickupCompletion: boolean;
  transitUpdates: boolean;
}

export interface SpecialAuthorization {
  idVerificationRequired: boolean;
  signatureAuthorization: boolean;
  photoIdMatching: boolean;
}

// API Request/Response Types

export interface FormConfig {
  packageTypes: Array<{
    value: string;
    label: string;
    weightLimit: number;
    dimensionLimits?: {
      maxLength: number;
      maxWidth: number;
      maxHeight: number;
    };
  }>;
  specialHandling: Array<{
    value: string;
    label: string;
    description: string;
    additionalFee: number;
  }>;
  countries: Array<{
    code: string;
    name: string;
    states?: Array<{ code: string; name: string; }>;
  }>;
  industries: Array<{
    value: string;
    label: string;
  }>;
  weightLimits: {
    min: number;
    max: number;
    unit: string;
  };
  dimensionLimits: {
    maxLength: number;
    maxWidth: number;
    maxHeight: number;
    unit: string;
  };
  currencyOptions: Array<{
    code: string;
    symbol: string;
    name: string;
  }>;
}

export interface QuoteRequest {
  shipmentDetails: ShipmentDetails;
}

export interface QuoteResponse {
  quotes: {
    ground: PricingOption[];
    air: PricingOption[];
    freight: PricingOption[];
  };
  requestId: string;
  expiresAt: string;
  calculatedAt: string;
}

export interface PickupAvailability {
  availableDates: Array<{
    date: string;
    dayOfWeek: string;
    timeSlots: TimeSlot[];
  }>;
  restrictions: string[];
  cutoffTime: string;
  weekendOptions?: {
    available: boolean;
    additionalFee: number;
  };
  holidayOptions?: {
    available: boolean;
    additionalFee: number;
  };
}

export interface SubmissionResponse {
  confirmationNumber: string;
  estimatedDelivery: string;
  trackingNumber?: string;
  status: 'confirmed';
  timestamp: string;
  carrierInfo: {
    name: string;
    logo?: string;
    trackingUrl?: string;
  };
  totalCost: number;
}

// Validation Schema Types

export interface ValidationRule<T = any> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: T) => string | null;
}

export type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule<T[K]>;
};

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Utility Types

export type StepStatus = 'not-started' | 'in-progress' | 'completed' | 'error';

export interface Step {
  id: number;
  title: string;
  description: string;
  path: string;
  status: StepStatus;
  completed: boolean;
}

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
  details?: any;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

// localStorage Utility Types

export interface StorageError {
  code: 'QUOTA_EXCEEDED' | 'NOT_AVAILABLE' | 'PARSE_ERROR' | 'UNKNOWN';
  message: string;
  originalError?: Error;
}

export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: StorageError;
}

// Form State Types

export interface FormState<T> {
  data: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
}

export interface FormAction<T> {
  type: 'SET_FIELD' | 'SET_ERRORS' | 'SET_TOUCHED' | 'RESET' | 'SUBMIT_START' | 'SUBMIT_END';
  payload?: Partial<T> | Record<string, string> | Record<string, boolean> | boolean;
}

// Component Props Types

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface FormFieldProps extends BaseComponentProps {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  description?: string;
  disabled?: boolean;
}

export interface PricingCardProps {
  option: PricingOption;
  isSelected: boolean;
  onSelect: () => void;
  showBreakdown?: boolean;
  className?: string;
}

export interface StepIndicatorProps {
  currentStep: number;
  steps: Step[];
  className?: string;
}

export interface AddressInputProps {
  value: Address;
  onChange: (address: Address) => void;
  label: string;
  errors?: Record<string, string>;
  required?: boolean;
  showContactInfo?: boolean;
}