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
  pickupDetails?: PickupDetails;
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

export type SpecialHandlingType = 
  | 'fragile' 
  | 'this-side-up' 
  | 'temperature-controlled' 
  | 'hazmat' 
  | 'white-glove' 
  | 'inside-delivery' 
  | 'liftgate-pickup' 
  | 'liftgate-delivery';

export interface PackageInfo {
  type: 'envelope' | 'small' | 'medium' | 'large' | 'pallet' | 'crate' | 'multiple';
  dimensions: Dimensions;
  weight: Weight;
  declaredValue: number;
  currency: 'USD' | 'CAD' | 'MXN';
  contents?: string;
  contentsCategory?: PackageContentsCategory;
  specialHandling: SpecialHandlingType[];
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
  reference?: string;
  billingContact?: ContactInfo;
  companyInfo?: CompanyInfo;
  billingAddress?: Address;
  invoicePreferences?: InvoicePreferences;
  paymentDetails?: PaymentMethodDetails;
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

// Task 7.2: Pickup Location and Requirements Types

export type LocationType = 
  | 'loading-dock' 
  | 'ground-level' 
  | 'residential' 
  | 'storage-facility' 
  | 'construction-site' 
  | 'other';

export interface LocationTypeOption {
  value: LocationType;
  label: string;
  description: string;
  icon?: string;
  requiresDockNumber?: boolean;
  pricingImpact?: 'none' | 'residential-surcharge' | 'special-handling';
}

export interface AccessRequirement {
  id: string;
  type: 'security' | 'equipment' | 'special' | 'timing';
  label: string;
  description: string;
  additionalFee?: number;
  conflictsWith?: string[];
  requiresFields?: string[];
}

// Task 7.3: Pickup Contact and Instructions Types

export interface PickupContactInfo {
  name: string;
  jobTitle?: string;
  mobilePhone: string;
  alternativePhone?: string;
  email: string;
  workingHours?: BusinessHours;
  preferredContactMethod: 'phone' | 'email' | 'text';
  authorizationLevel: 'full' | 'limited' | 'notification-only';
}

export interface PickupInstructionSet {
  gateAccess?: string;
  parkingLoading?: string;
  packageLocation?: string;
  driverInstructions?: string;
  specialConsiderations?: string;
  safetyRequirements?: string[];
}

export interface InstructionTemplate {
  id: string;
  name: string;
  category: 'access' | 'parking' | 'location' | 'driver' | 'safety';
  locationType: LocationType[];
  template: string;
  variables?: string[];
}

export interface EquipmentRequirementOption {
  id: string;
  type: EquipmentType;
  required: boolean;
  additionalFee?: number;
  description: string;
  compatibility: string[];
  recommendedFor?: ('heavy' | 'fragile' | 'large' | 'multiple')[];
}

export interface BusinessHours {
  monday: { open: string; close: string; closed?: boolean };
  tuesday: { open: string; close: string; closed?: boolean };
  wednesday: { open: string; close: string; closed?: boolean };
  thursday: { open: string; close: string; closed?: boolean };
  friday: { open: string; close: string; closed?: boolean };
  saturday: { open: string; close: string; closed?: boolean };
  sunday: { open: string; close: string; closed?: boolean };
}

export interface LocationInfo {
  type: LocationType;
  dockNumber?: string;
  accessRequirements: string[]; // Array of AccessRequirement IDs
  gateCode?: string;
  securityContact?: ContactInfo;
  specialInstructions?: string;
  availableEquipment: string[]; // Array of EquipmentType IDs
  operatingHours?: BusinessHours;
  description?: string; // For 'other' location type
}

export interface FeeCalculation {
  id: string;
  label: string;
  amount: number;
  reason: string;
}

export type EquipmentType = 
  | 'standard-dolly' 
  | 'appliance-dolly' 
  | 'furniture-pads' 
  | 'straps' 
  | 'pallet-jack' 
  | 'two-person-team';

export interface EquipmentOption {
  id: EquipmentType;
  label: string;
  description: string;
  additionalFee?: number;
  requiresCompatibilityCheck?: boolean;
}

export interface AccessRequirementOption {
  id: string;
  label: string;
  description: string;
  type: 'security' | 'equipment' | 'special' | 'timing';
  additionalFee?: number;
  conflictsWith?: string[];
  requiresFields?: ('gateCode' | 'securityContact' | 'specialInstructions')[];
}

export interface PickupDetails {
  date: string;
  timeSlot: TimeSlot;
  instructions: string;
  // Task 7.3: Enhanced contact information
  primaryContact: PickupContactInfo;
  backupContact?: PickupContactInfo;
  // Task 7.3: Structured instruction set
  instructionSet?: PickupInstructionSet;
  locationInfo?: LocationInfo;
  accessInstructions: PickupAccessInstructions;
  equipmentRequirements: EquipmentRequirements;
  notificationPreferences: NotificationPreferences;
  readyTime: string;
  authorizedPersonnel: string[];
  specialAuthorization?: SpecialAuthorization;
  // Task 7.4: Enhanced notification and authorization
  packageReadiness?: PackageReadinessSettings;
  authorizationSettings?: AuthorizationSettings;
  premiumServices?: PremiumServiceOptions;
  // Legacy fields for backward compatibility
  contactPerson?: string;
  phone?: string;
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
  // Extended preferences for Task 7.4
  pickupReminders: ReminderSettings[];
  realTimeUpdates: UpdateSettings[];
  communicationChannels: ChannelPreference[];
  escalationProcedures: EscalationSetting[];
  businessHoursOnly: boolean;
}

export interface ReminderSettings {
  type: 'pickup-24h' | 'pickup-2h' | 'pickup-30m' | 'preparation';
  enabled: boolean;
  timing: number; // minutes before pickup
  channels: CommunicationChannel[];
  customMessage?: string;
}

export interface UpdateSettings {
  type: 'driver-enroute' | 'pickup-completion' | 'package-transit' | 'delivery-confirmation';
  enabled: boolean;
  channels: CommunicationChannel[];
  frequency?: 'immediate' | 'periodic' | 'milestone';
}

export interface ChannelPreference {
  channel: CommunicationChannel;
  primary: boolean;
  businessHoursOnly: boolean;
  contactInfo: string; // phone number or email
  fallbackOrder: number;
}

export interface EscalationSetting {
  trigger: 'failed-delivery' | 'no-response' | 'emergency';
  escalationContacts: ContactInfo[];
  timeoutMinutes: number;
  channels: CommunicationChannel[];
}

export type CommunicationChannel = 'email' | 'sms' | 'phone' | 'push';

export interface PackageReadinessSettings {
  readyTime: string; // ISO time string
  preparationTime: number; // minutes needed for preparation
  preparationChecklist: PreparationItem[];
  lastMinuteAdjustmentAllowed: boolean;
  emergencyContactProtocol: EmergencyContactProtocol;
}

export interface PreparationItem {
  id: string;
  label: string;
  description: string;
  required: boolean;
  completed: boolean;
  category: 'labeling' | 'documentation' | 'access' | 'packaging';
}

export interface EmergencyContactProtocol {
  enabled: boolean;
  contacts: ContactInfo[];
  escalationTimeMinutes: number;
  autoReschedule: boolean;
}

export interface AuthorizationSettings {
  primaryAuthorization: PersonnelAuthorization;
  additionalPersonnel: PersonnelAuthorization[];
  universalAuthorization: UniversalAuthSettings;
  securityRequirements: SecurityProtocol[];
  emergencyContacts: EmergencyContact[];
}

export interface PersonnelAuthorization {
  contactInfo: ContactInfo;
  authorizationLevel: 'full' | 'limited' | 'witness-only';
  idVerificationRequired: boolean;
  signatureAuthority: boolean;
  relationship: string; // supervisor, assistant, colleague, etc.
  authorizationScope: string[]; // array of permitted actions
  timeBasedAuthorization?: TimeBasedAuth;
}

export interface UniversalAuthSettings {
  anyoneAtLocation: boolean;
  departmentLevel: boolean;
  department?: string;
  roleBasedAuth: boolean;
  allowedRoles: string[];
  timeRestrictions?: BusinessHours;
}

export interface SecurityProtocol {
  type: 'high-value' | 'sensitive' | 'standard' | 'enhanced';
  idVerificationRequired: boolean;
  photoIdMatching: boolean;
  dualAuthorization: boolean;
  insuranceRequired: boolean;
  auditTrailRequired: boolean;
  customRequirements: string[];
}

export interface EmergencyContact {
  contactInfo: ContactInfo;
  relationship: string;
  availabilityHours: BusinessHours;
  escalationPriority: number;
  communicationChannels: CommunicationChannel[];
}

export interface TimeBasedAuth {
  validFrom: string; // ISO time
  validUntil: string; // ISO time
  daysOfWeek: number[]; // 0-6, Sunday=0
  timeRanges: { start: string; end: string; }[];
}

export interface PremiumServiceOptions {
  weekendPickup: PremiumService;
  holidayPickup: PremiumService;
  afterHoursPickup: PremiumService;
  specialArrangements: CustomService[];
}

export interface PremiumService {
  available: boolean;
  additionalFee: number;
  conditions: string[];
  timeSlots: TimeSlot[];
  advanceBookingRequired: number; // hours
  serviceArea: 'full' | 'limited' | 'major-cities';
}

export interface CustomService {
  id: string;
  description: string;
  available: boolean;
  estimatedFee: number;
  requiresApproval: boolean;
  contactRequired: boolean;
  specialConditions: string[];
}

export interface SpecialAuthorization {
  idVerificationRequired: boolean;
  signatureAuthorization: boolean;
  photoIdMatching: boolean;
  // Extended for Task 7.4
  authorizationSettings?: AuthorizationSettings;
  highValueProtocol?: SecurityProtocol;
  complianceRequirements?: ComplianceRequirement[];
}

export interface ComplianceRequirement {
  type: 'regulatory' | 'insurance' | 'security' | 'audit';
  description: string;
  required: boolean;
  documentation: string[];
  verificationRequired: boolean;
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
    isBusinessDay: boolean;
    timeSlots: TimeSlot[];
    notes?: string[];
    restrictions?: string[];
  }>;
  restrictions: Array<{
    type: 'weather' | 'capacity' | 'equipment' | 'geographic' | 'seasonal';
    message: string;
    affectedDates?: string[];
    severity: 'info' | 'warning' | 'error';
  }>;
  cutoffTime: string;
  serviceArea: {
    zone: string;
    coverage: 'full' | 'limited' | 'remote';
    description: string;
  };
  weekendOptions?: {
    available: boolean;
    additionalFee: number;
    conditions?: string[];
    timeSlots?: TimeSlot[];
  };
  holidayOptions?: {
    available: boolean;
    additionalFee: number;
    conditions?: string[];
    timeSlots?: TimeSlot[];
  };
  metadata: {
    generatedAt: string;
    validUntil: string;
    minimumLeadTime: number;
    maxAdvanceBooking: number;
  };
}

export interface AvailableDate {
  date: string;
  dayOfWeek: string;
  isBusinessDay: boolean;
  timeSlots: TimeSlot[];
  notes?: string[];
  restrictions?: string[];
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

// Package Type Limits and Special Handling Fees
// These constants are used by PackageInput component for validation and pricing

export const PACKAGE_TYPE_LIMITS: Record<string, { maxWeight: number; maxVolume: number }> = {
  'envelope': { maxWeight: 1, maxVolume: 100 },
  'small': { maxWeight: 10, maxVolume: 1000 },
  'medium': { maxWeight: 50, maxVolume: 5000 },
  'large': { maxWeight: 150, maxVolume: 15000 },
  'pallet': { maxWeight: 2500, maxVolume: 100000 },
  'crate': { maxWeight: 5000, maxVolume: 200000 },
  'multiple': { maxWeight: 10000, maxVolume: 500000 }
};

export const SPECIAL_HANDLING_FEES: Record<string, number> = {
  'fragile': 15,
  'this-side-up': 5,
  'temperature-controlled': 75,
  'hazmat': 50,
  'white-glove': 125,
  'inside-delivery': 45,
  'liftgate-pickup': 35,
  'liftgate-delivery': 35
};

// Terms and Submission Interfaces

export interface TermsAcknowledgment {
  declaredValueAccuracy: boolean;
  insuranceRequirements: boolean;
  packageContentsCompliance: boolean;
  carrierAuthorization: boolean;
  hazmatCertification?: boolean; // Only required for hazmat shipments
  internationalCompliance?: boolean; // Only required for international shipments
  customsDocumentation?: boolean; // Only required for international shipments
}

export interface SubmissionValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  navigationPath?: string;
  resolutionHint?: string;
}

export interface SubmissionValidationResult {
  isValid: boolean;
  errors: SubmissionValidationError[];
  warnings: SubmissionValidationError[];
  missingAcknowledgments: string[];
  conflictingRequirements: string[];
}

export interface FinalSubmissionRequest {
  transaction: ShippingTransaction;
  termsAcknowledgment: TermsAcknowledgment;
  submissionTimestamp: string;
  clientId: string;
  userAgent: string;
}

export interface TermsOfService {
  standardLiability: {
    coverage: string;
    limits: string;
    exclusions: string[];
  };
  maximumLiability: {
    amount: number;
    currency: string;
    conditions: string[];
  };
  claimsProcess: {
    timeLimit: string;
    requiredDocumentation: string[];
    contactInfo: string;
  };
  serviceConditions: {
    deliveryAttempts: number;
    weatherDelays: string;
    forceMAjeure: string[];
  };
}