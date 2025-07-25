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
  notificationPreferences: PickupNotificationPreferences;
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

export interface PickupNotificationPreferences {
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

// Task 9.2: Tracking-specific notification preferences (separate from pickup preferences)
export interface TrackingNotificationPreferences {
  readonly email: EmailNotificationPrefs;
  readonly sms: SMSNotificationPrefs;
  readonly push: PushNotificationPrefs;
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

// Task 9.1: Confirmation Page Types

export interface ConfirmationPageData {
  readonly confirmationNumber: string;
  readonly bookingTimestamp: Date;
  readonly transaction: ShippingTransaction;
  readonly carrierInfo: CarrierAssignment;
  readonly pickupConfirmation: PickupConfirmationDetails;
  readonly deliveryEstimate: DeliveryEstimateDetails;
  readonly references: ShipmentReferences;
}

export interface CarrierAssignment {
  readonly carrierId: string;
  readonly carrierName: string;
  readonly carrierLogo: string;
  readonly serviceLevel: string;
  readonly trackingUrlTemplate: string;
}

export interface PickupConfirmationDetails {
  readonly confirmedDate: Date;
  readonly timeWindow: TimeWindow;
  readonly status: 'confirmed' | 'pending' | 'error';
  readonly instructionsSent: NotificationStatus;
  readonly contactNotified: NotificationStatus;
  readonly calendarInvite: NotificationStatus;
}

export interface DeliveryEstimateDetails {
  readonly estimatedDate: Date;
  readonly timeCommitment: string;
  readonly deliveryStatus: 'on-schedule' | 'delayed' | 'at-risk';
  readonly deliveryAddress: Address;
  readonly contactPerson: ContactInfo;
  readonly specialInstructions: ReadonlyArray<string>;
}

export interface ShipmentReferences {
  readonly customerReference?: string;
  readonly internalReference: string;
  readonly carrierReference?: string;
  readonly poNumber?: string;
  readonly bolNumber?: string;
}

export interface TimeWindow {
  readonly startTime: string;
  readonly endTime: string;
  readonly timezone: string;
}

export interface NotificationStatus {
  readonly sent: boolean;
  readonly timestamp?: Date;
  readonly method: 'email' | 'sms' | 'phone' | 'system';
  readonly recipient: string;
}

export type DeliveryStatus = 'on-schedule' | 'delayed' | 'at-risk';

// Task 9.2: Tracking and Support Information Interfaces
export interface TrackingInformation {
  readonly trackingNumber: string | null;
  readonly estimatedAvailability: Date;
  readonly carrierTrackingUrl: string | null;
  readonly trackingStatus: TrackingStatus;
  readonly milestones: ReadonlyArray<TrackingMilestone>;
  readonly notificationPreferences: TrackingNotificationPreferences;
}

export interface TrackingStatus {
  readonly currentStatus: 'pending' | 'in-transit' | 'out-for-delivery' | 'delivered' | 'exception';
  readonly statusDescription: string;
  readonly lastUpdated: Date;
  readonly nextUpdate: Date | null;
  readonly deliveryConfirmation: DeliveryConfirmation | null;
}

export interface TrackingMilestone {
  readonly id: string;
  readonly status: string;
  readonly description: string;
  readonly timestamp: Date;
  readonly location: string;
  readonly facility?: string;
}

export interface DeliveryConfirmation {
  readonly deliveredAt: Date;
  readonly deliveredTo: string;
  readonly signatureName?: string;
  readonly signatureUrl?: string;
  readonly photoUrl?: string;
}

export interface TrackingNotificationPreferences {
  readonly email: EmailNotificationPrefs;
  readonly sms: SMSNotificationPrefs;
  readonly push: PushNotificationPrefs;
}

export interface EmailNotificationPrefs {
  readonly enabled: boolean;
  readonly address: string;
  readonly milestones: ReadonlyArray<string>;
  readonly frequency: 'all' | 'major' | 'delivery-only';
}

export interface SMSNotificationPrefs {
  readonly enabled: boolean;
  readonly phoneNumber: string;
  readonly milestones: ReadonlyArray<string>;
}

export interface PushNotificationPrefs {
  readonly enabled: boolean;
  readonly milestones: ReadonlyArray<string>;
}

export interface PackageDocumentation {
  readonly shippingLabel: LabelInformation;
  readonly requiredDocuments: ReadonlyArray<RequiredDocument>;
  readonly complianceDocuments: ReadonlyArray<ComplianceDocument>;
  readonly customsDocuments: ReadonlyArray<CustomsDocument>;
}

export interface LabelInformation {
  readonly labelType: 'driver-provided' | 'pre-print' | 'mobile-display';
  readonly format: 'thermal' | 'laser' | 'mobile';
  readonly labelUrl?: string;
  readonly printInstructions?: string;
  readonly qrCodeUrl?: string;
  readonly status?: 'pending' | 'generated' | 'printed';
}

export interface RequiredDocument {
  readonly id: string;
  readonly type: 'commercial-invoice' | 'packing-list' | 'bill-of-lading' | 'certificate-of-origin';
  readonly name: string;
  readonly description: string;
  readonly required: boolean;
  readonly downloadUrl?: string;
  readonly status: 'pending' | 'generated' | 'completed';
}

export interface ComplianceDocument {
  readonly id: string;
  readonly type: 'hazmat-declaration' | 'export-license' | 'import-permit' | 'insurance-certificate';
  readonly name: string;
  readonly description: string;
  readonly regulatoryBody: string;
  readonly downloadUrl?: string;
  readonly expirationDate?: Date;
}

export interface CustomsDocument {
  readonly id: string;
  readonly type: 'customs-declaration' | 'commercial-invoice' | 'certificate-of-origin' | 'nafta-certificate';
  readonly name: string;
  readonly description: string;
  readonly country: string;
  readonly downloadUrl?: string;
  readonly formNumber?: string;
}

export interface CustomerSupportInfo {
  readonly primarySupport: SupportChannel;
  readonly accountManager: AccountManagerInfo | null;
  readonly specializedSupport: ReadonlyArray<SpecializedSupportChannel>;
  readonly selfServiceResources: SelfServiceResources;
}

export interface SupportChannel {
  readonly type: 'phone' | 'email' | 'chat' | 'portal';
  readonly contact: string;
  readonly availability: AvailabilitySchedule;
  readonly responseTime: ResponseTimeCommitment;
  readonly escalationPath: EscalationInfo;
}

export interface AccountManagerInfo {
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly extension?: string;
  readonly availability: AvailabilitySchedule;
  readonly territory: string;
}

export interface SpecializedSupportChannel {
  readonly type: 'claims' | 'compliance' | 'billing' | 'technical';
  readonly name: string;
  readonly contact: string;
  readonly description: string;
  readonly availability: AvailabilitySchedule;
}

export interface SelfServiceResources {
  readonly knowledgeBaseUrl: string;
  readonly faqUrl: string;
  readonly trackingPortalUrl: string;
  readonly communityForumUrl?: string;
}

export interface AvailabilitySchedule {
  readonly timezone: string;
  readonly hours: ReadonlyArray<SupportBusinessHours>;
  readonly holidays: ReadonlyArray<Date>;
  readonly emergencyContact?: string;
}

export interface SupportBusinessHours {
  readonly dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  readonly startTime: string; // HH:MM format
  readonly endTime: string;   // HH:MM format
}

export interface ResponseTimeCommitment {
  readonly initial: string; // e.g., "2 hours", "24 hours"
  readonly resolution: string; // e.g., "1 business day", "48 hours"
  readonly sla: string; // Service Level Agreement description
}

export interface EscalationInfo {
  readonly level1: string;
  readonly level2?: string;
  readonly level3?: string;
  readonly automaticEscalation: boolean;
  readonly escalationTriggers: ReadonlyArray<string>;
}

// Task 9.3: Next Steps and Additional Services Interfaces

export interface NextStepsConfiguration {
  readonly prePickupChecklist: ReadonlyArray<ChecklistItem>;
  readonly postPickupProcess: ProcessMilestone[];
  readonly timelineEstimates: ProcessTimeline;
  readonly emergencyContacts: EmergencyContactInfo;
}

export interface ChecklistItem {
  readonly id: string;
  readonly category: ChecklistCategory;
  readonly title: string;
  readonly description: string;
  readonly completed: boolean;
  readonly required: boolean;
  readonly dependencies: ReadonlyArray<string>;
  readonly estimatedTime: number;
  readonly helpResources: ReadonlyArray<HelpResource>;
}

export type ChecklistCategory = 
  | 'package-preparation'
  | 'documentation'
  | 'authorization'
  | 'access-coordination'
  | 'final-verification';

export interface ProcessMilestone {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly estimatedCompletion: Date;
  readonly status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  readonly dependencies: ReadonlyArray<string>;
  readonly notifications: ReadonlyArray<NotificationEvent>;
}

export interface ProcessTimeline {
  readonly trackingNumberAvailability: number; // hours after pickup
  readonly deliveryConfirmationProcess: string;
  readonly invoiceProcessingTimeline: number; // hours
  readonly followUpCommunicationSchedule: ReadonlyArray<CommunicationSchedule>;
}

export interface NotificationEvent {
  readonly type: 'email' | 'sms' | 'push' | 'phone';
  readonly timing: number; // hours relative to milestone
  readonly template: string;
  readonly recipient: string;
}

export interface CommunicationSchedule {
  readonly milestone: string;
  readonly timing: number; // hours from booking
  readonly channels: ReadonlyArray<CommunicationChannel>;
  readonly content: string;
}

export interface EmergencyContactInfo {
  readonly support24x7: ContactInfo;
  readonly claimsDepartment: ContactInfo;
  readonly regulatoryCompliance: ContactInfo;
  readonly legalInsurance: ContactInfo;
}

export interface HelpResource {
  readonly type: 'article' | 'video' | 'checklist' | 'contact';
  readonly title: string;
  readonly url: string;
  readonly description: string;
  readonly estimatedTime?: number;
}

export interface AdditionalServicesPortfolio {
  readonly availableServices: ReadonlyArray<AdditionalService>;
  readonly recommendations: ReadonlyArray<ServiceRecommendation>;
  readonly bundleOffers: ReadonlyArray<ServiceBundle>;
  readonly limitations: ServiceLimitations;
}

export interface AdditionalService {
  readonly serviceId: string;
  readonly serviceName: string;
  readonly category: ServiceCategory;
  readonly description: string;
  readonly pricing: ServicePricing;
  readonly availability: ServiceAvailability;
  readonly requirements: ReadonlyArray<ServiceRequirement>;
  readonly benefits: ReadonlyArray<string>;
}

export type ServiceCategory = 
  | 'insurance-enhancement'
  | 'delivery-modification'
  | 'convenience-services'
  | 'value-added-services'
  | 'emergency-services';

export interface ServicePricing {
  readonly basePrice: number;
  readonly currency: string;
  readonly discounts: ReadonlyArray<ServiceDiscount>;
  readonly calculationMethod: 'fixed' | 'percentage' | 'tiered' | 'custom';
  readonly priceBreakdown: ReadonlyArray<PriceComponent>;
}

export interface ServiceDiscount {
  readonly type: 'volume' | 'loyalty' | 'promotional' | 'bundle';
  readonly amount: number;
  readonly conditions: ReadonlyArray<string>;
  readonly validUntil?: Date;
}

export interface PriceComponent {
  readonly label: string;
  readonly amount: number;
  readonly type: 'base' | 'fee' | 'tax' | 'discount';
}

export interface ServiceAvailability {
  readonly available: boolean;
  readonly timeConstraints: TimeConstraints;
  readonly locationConstraints: ReadonlyArray<string>;
  readonly capacityLimits: CapacityLimits;
  readonly seasonalAvailability: ReadonlyArray<SeasonalPeriod>;
}

export interface TimeConstraints {
  readonly cutoffTime: string; // hours after booking
  readonly businessHoursOnly: boolean;
  readonly excludedDays: ReadonlyArray<string>;
  readonly processingTime: number; // hours
}

export interface CapacityLimits {
  readonly dailyLimit: number;
  readonly currentBookings: number;
  readonly nextAvailableSlot: Date;
  readonly waitlistAvailable: boolean;
}

export interface SeasonalPeriod {
  readonly startDate: Date;
  readonly endDate: Date;
  readonly availability: 'available' | 'limited' | 'unavailable';
  readonly specialConditions: ReadonlyArray<string>;
}

export interface ServiceRequirement {
  readonly type: 'shipment' | 'customer' | 'geographic' | 'timing';
  readonly condition: string;
  readonly value: string | number | boolean;
  readonly operator: 'equals' | 'greater' | 'less' | 'contains' | 'matches';
}

export interface ServiceRecommendation {
  readonly serviceId: string;
  readonly recommendationScore: number;
  readonly reasonCode: RecommendationReason;
  readonly personalizedMessage: string;
  readonly urgency: 'low' | 'medium' | 'high' | 'critical';
}

export type RecommendationReason = 
  | 'shipping-history'
  | 'geographic-risk'
  | 'value-optimization'
  | 'compliance-requirement'
  | 'seasonal-promotion';

export interface ServiceBundle {
  readonly bundleId: string;
  readonly bundleName: string;
  readonly services: ReadonlyArray<string>; // service IDs
  readonly totalPrice: number;
  readonly savings: number;
  readonly description: string;
  readonly benefits: ReadonlyArray<string>;
  readonly limitations: ReadonlyArray<string>;
}

export interface ServiceLimitations {
  readonly geographicRestrictions: ReadonlyArray<string>;
  readonly shipmentTypeRestrictions: ReadonlyArray<string>;
  readonly customerTypeRestrictions: ReadonlyArray<string>;
  readonly timeRestrictions: ReadonlyArray<TimeRestriction>;
}

export interface TimeRestriction {
  readonly type: 'booking-window' | 'service-window' | 'blackout-period';
  readonly startTime?: string;
  readonly endTime?: string;
  readonly description: string;
}

export interface RecordKeepingOptions {
  readonly documentFormats: ReadonlyArray<DocumentFormat>;
  readonly exportOptions: ReadonlyArray<ExportOption>;
  readonly storageOptions: ReadonlyArray<StorageOption>;
  readonly integrationOptions: ReadonlyArray<IntegrationOption>;
}

export interface DocumentFormat {
  readonly format: 'pdf' | 'csv' | 'json' | 'xml' | 'ics';
  readonly displayName: string;
  readonly description: string;
  readonly useCase: string;
  readonly customizationOptions: ReadonlyArray<CustomizationOption>;
}

export interface CustomizationOption {
  readonly type: 'branding' | 'layout' | 'content' | 'language';
  readonly options: ReadonlyArray<string>;
  readonly defaultValue: string;
  readonly premium: boolean;
}

export interface ExportOption {
  readonly exportId: string;
  readonly name: string;
  readonly description: string;
  readonly formats: ReadonlyArray<string>;
  readonly dataInclusion: DataInclusion;
  readonly schedulingOptions: SchedulingOptions;
}

export interface DataInclusion {
  readonly shipmentDetails: boolean;
  readonly pricingBreakdown: boolean;
  readonly trackingInformation: boolean;
  readonly documentation: boolean;
  readonly customFields: ReadonlyArray<string>;
}

export interface SchedulingOptions {
  readonly immediate: boolean;
  readonly scheduled: boolean;
  readonly recurring: boolean;
  readonly triggers: ReadonlyArray<ExportTrigger>;
}

export interface ExportTrigger {
  readonly event: 'pickup-completion' | 'delivery-completion' | 'milestone-reached' | 'time-based';
  readonly conditions: ReadonlyArray<string>;
  readonly delay: number; // minutes
}

export interface StorageOption {
  readonly storageId: string;
  readonly provider: string;
  readonly type: 'cloud' | 'local' | 'hybrid';
  readonly capacity: string;
  readonly retention: RetentionPolicy;
  readonly security: SecurityFeatures;
}

export interface RetentionPolicy {
  readonly period: number; // days
  readonly archival: boolean;
  readonly automaticDeletion: boolean;
  readonly complianceRequirements: ReadonlyArray<string>;
}

export interface SecurityFeatures {
  readonly encryption: boolean;
  readonly accessControl: boolean;
  readonly auditLogging: boolean;
  readonly backupPolicy: BackupPolicy;
}

export interface BackupPolicy {
  readonly frequency: 'daily' | 'weekly' | 'monthly';
  readonly retention: number; // days
  readonly geographicDistribution: boolean;
  readonly verificationSchedule: string;
}

export interface IntegrationOption {
  readonly integrationId: string;
  readonly name: string;
  readonly type: 'api' | 'webhook' | 'file-transfer' | 'direct-connection';
  readonly description: string;
  readonly supportedFormats: ReadonlyArray<string>;
  readonly authenticationMethods: ReadonlyArray<AuthMethod>;
  readonly rateLimits: RateLimits;
}

export interface AuthMethod {
  readonly method: 'api-key' | 'oauth' | 'basic-auth' | 'certificate';
  readonly description: string;
  readonly securityLevel: 'basic' | 'standard' | 'enhanced' | 'enterprise';
}

export interface RateLimits {
  readonly requestsPerMinute: number;
  readonly requestsPerHour: number;
  readonly dataLimitMB: number;
  readonly concurrentConnections: number;
}

export interface FutureShippingTools {
  readonly shipmentTemplates: ReadonlyArray<ShipmentTemplate>;
  readonly savedAddresses: ReadonlyArray<SavedAddress>;
  readonly quickReorderOptions: ReadonlyArray<ReorderOption>;
  readonly preferenceSettings: UserPreferences;
}

export interface ShipmentTemplate {
  readonly templateId: string;
  readonly templateName: string;
  readonly description: string;
  readonly shipmentDetails: Partial<ShipmentDetails>;
  readonly defaultServices: ReadonlyArray<string>;
  readonly usageCount: number;
  readonly lastUsed: Date;
  readonly createdDate: Date;
  readonly tags: ReadonlyArray<string>;
}

export interface SavedAddress {
  readonly addressId: string;
  readonly nickname: string;
  readonly address: Address;
  readonly usageFrequency: number;
  readonly lastUsed: Date;
  readonly verified: boolean;
  readonly addressType: 'origin' | 'destination' | 'both';
  readonly defaultForType: boolean;
}

export interface ReorderOption {
  readonly reorderId: string;
  readonly baseShipment: ShippingTransaction;
  readonly modifications: ReadonlyArray<ReorderModification>;
  readonly estimatedPrice: number;
  readonly availability: ServiceAvailability;
  readonly quickOrderEnabled: boolean;
}

export interface ReorderModification {
  readonly field: string;
  readonly originalValue: any;
  readonly suggestedValue: any;
  readonly reason: string;
  readonly required: boolean;
}

export interface UserPreferences {
  readonly defaultOrigin: string; // address ID
  readonly defaultPackageType: string;
  readonly preferredServiceLevel: string;
  readonly communicationChannels: ReadonlyArray<CommunicationChannel>;
  readonly notificationSettings: NotificationSettings;
  readonly displayPreferences: DisplayPreferences;
  readonly privacySettings: PrivacySettings;
}

export interface NotificationSettings {
  readonly emailEnabled: boolean;
  readonly smsEnabled: boolean;
  readonly pushEnabled: boolean;
  readonly frequency: 'all' | 'important' | 'minimal';
  readonly businessHoursOnly: boolean;
  readonly languagePreference: string;
}

export interface DisplayPreferences {
  readonly theme: 'light' | 'dark' | 'auto';
  readonly density: 'compact' | 'comfortable' | 'spacious';
  readonly units: 'imperial' | 'metric';
  readonly currency: string;
  readonly timezone: string;
}

export interface PrivacySettings {
  readonly dataCollection: 'essential' | 'functional' | 'all';
  readonly analyticsOptIn: boolean;
  readonly marketingOptIn: boolean;
  readonly thirdPartySharing: boolean;
  readonly dataRetentionPeriod: number; // days
}

export interface CustomerEngagementData {
  readonly feedbackCollection: FeedbackCollection;
  readonly loyaltyProgram: LoyaltyProgram;
  readonly recommendationEngine: RecommendationEngine;
  readonly communicationHistory: ReadonlyArray<CommunicationRecord>;
}

export interface FeedbackCollection {
  readonly overallRating: number;
  readonly serviceQuality: number;
  readonly deliveryPerformance: number;
  readonly customerSatisfaction: number;
  readonly detailedFeedback: ReadonlyArray<FeedbackItem>;
  readonly improvementSuggestions: ReadonlyArray<string>;
  readonly submissionDate: Date;
}

export interface FeedbackItem {
  readonly category: FeedbackCategory;
  readonly rating: number;
  readonly comment: string;
  readonly severity: 'positive' | 'neutral' | 'negative' | 'critical';
}

export type FeedbackCategory = 
  | 'booking-experience'
  | 'pickup-service'
  | 'tracking-communication'
  | 'delivery-service'
  | 'customer-support'
  | 'pricing-value';

export interface LoyaltyProgram {
  readonly programId: string;
  readonly membershipLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  readonly pointsBalance: number;
  readonly pointsEarned: number;
  readonly pointsRedeemed: number;
  readonly tierProgress: TierProgress;
  readonly availableRewards: ReadonlyArray<LoyaltyReward>;
  readonly memberBenefits: ReadonlyArray<MemberBenefit>;
}

export interface TierProgress {
  readonly currentTier: string;
  readonly nextTier: string;
  readonly progressPercentage: number;
  readonly requirementsRemaining: ReadonlyArray<TierRequirement>;
}

export interface TierRequirement {
  readonly type: 'shipping-volume' | 'spending-amount' | 'frequency' | 'referrals';
  readonly target: number;
  readonly current: number;
  readonly timeframe: string;
}

export interface LoyaltyReward {
  readonly rewardId: string;
  readonly name: string;
  readonly description: string;
  readonly pointCost: number;
  readonly category: 'shipping-discount' | 'service-upgrade' | 'merchandise' | 'experience';
  readonly availability: ServiceAvailability;
  readonly terms: ReadonlyArray<string>;
}

export interface MemberBenefit {
  readonly benefitId: string;
  readonly name: string;
  readonly description: string;
  readonly type: 'discount' | 'priority' | 'exclusive-access' | 'waived-fee';
  readonly value: string;
  readonly applicability: ReadonlyArray<string>;
}

export interface RecommendationEngine {
  readonly personalizedServices: ReadonlyArray<ServiceRecommendation>;
  readonly shippingOptimizations: ReadonlyArray<OptimizationSuggestion>;
  readonly costSavingOpportunities: ReadonlyArray<CostSavingOption>;
  readonly trendAnalysis: TrendAnalysis;
}

export interface OptimizationSuggestion {
  readonly suggestionId: string;
  readonly type: 'service-level' | 'packaging' | 'timing' | 'routing';
  readonly description: string;
  readonly potentialSavings: number;
  readonly implementationEffort: 'low' | 'medium' | 'high';
  readonly confidence: number;
}

export interface CostSavingOption {
  readonly optionId: string;
  readonly description: string;
  readonly annualSavings: number;
  readonly requirements: ReadonlyArray<string>;
  readonly implementation: ImplementationPlan;
}

export interface ImplementationPlan {
  readonly steps: ReadonlyArray<ImplementationStep>;
  readonly timeline: string;
  readonly resources: ReadonlyArray<string>;
  readonly supportRequired: boolean;
}

export interface ImplementationStep {
  readonly stepId: string;
  readonly description: string;
  readonly estimatedTime: string;
  readonly dependencies: ReadonlyArray<string>;
  readonly responsible: string;
}

export interface TrendAnalysis {
  readonly shippingPatterns: ReadonlyArray<ShippingPattern>;
  readonly seasonalTrends: ReadonlyArray<SeasonalTrend>;
  readonly performanceMetrics: PerformanceMetrics;
  readonly benchmarking: BenchmarkData;
}

export interface ShippingPattern {
  readonly patternType: 'volume' | 'destination' | 'service-level' | 'timing';
  readonly trend: 'increasing' | 'decreasing' | 'stable' | 'seasonal';
  readonly confidence: number;
  readonly recommendation: string;
}

export interface SeasonalTrend {
  readonly season: string;
  readonly volumeChange: number;
  readonly costImpact: number;
  readonly servicePreferences: ReadonlyArray<string>;
  readonly recommendations: ReadonlyArray<string>;
}

export interface PerformanceMetrics {
  readonly onTimeDelivery: number;
  readonly costPerShipment: number;
  readonly customerSatisfaction: number;
  readonly claimRate: number;
  readonly benchmarkComparison: BenchmarkComparison;
}

export interface BenchmarkData {
  readonly industryAverage: PerformanceMetrics;
  readonly peerComparison: PerformanceMetrics;
  readonly topPerformers: PerformanceMetrics;
  readonly improvementOpportunities: ReadonlyArray<string>;
}

export interface BenchmarkComparison {
  readonly betterThanIndustry: ReadonlyArray<string>;
  readonly worseThanIndustry: ReadonlyArray<string>;
  readonly improvementTargets: ReadonlyArray<ImprovementTarget>;
}

export interface ImprovementTarget {
  readonly metric: string;
  readonly currentValue: number;
  readonly targetValue: number;
  readonly timeframe: string;
  readonly actionItems: ReadonlyArray<string>;
}

export interface CommunicationRecord {
  readonly recordId: string;
  readonly timestamp: Date;
  readonly channel: CommunicationChannel;
  readonly type: 'inbound' | 'outbound';
  readonly subject: string;
  readonly summary: string;
  readonly category: 'support' | 'sales' | 'billing' | 'notification';
  readonly resolution: CommunicationResolution;
}

export interface CommunicationResolution {
  readonly status: 'resolved' | 'pending' | 'escalated' | 'closed';
  readonly resolutionTime: number; // minutes
  readonly satisfactionRating?: number;
  readonly followUpRequired: boolean;
  readonly nextAction?: string;
}