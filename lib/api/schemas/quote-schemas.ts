/**
 * Zod schemas for Pricing Quote API endpoints
 * Comprehensive validation for quote requests and responses
 */

import { z } from 'zod';

// Address validation schema
const AddressSchema = z.object({
  address: z.string().min(5, 'Address must be at least 5 characters').max(100),
  suite: z.string().optional(),
  city: z.string().min(2, 'City must be at least 2 characters').max(50),
  state: z.string().min(2, 'State code required').max(3),
  zip: z.string().min(5, 'ZIP code must be at least 5 characters').max(10),
  country: z.enum(['US', 'CA', 'MX'], { message: 'Country must be US, CA, or MX' }),
  isResidential: z.boolean(),
  contactInfo: z.object({
    name: z.string().min(2, 'Contact name required').max(50),
    company: z.string().max(100).optional(),
    phone: z.string().min(10, 'Valid phone number required').max(20),
    email: z.string().email('Valid email required').max(100),
    extension: z.string().max(10).optional()
  }),
  locationType: z.enum([
    'commercial', 'residential', 'industrial', 'warehouse', 
    'storage', 'construction', 'other'
  ]),
  locationDescription: z.string().max(200).optional()
});

// Package dimensions schema
const DimensionsSchema = z.object({
  length: z.number().min(0.1, 'Length must be positive').max(200),
  width: z.number().min(0.1, 'Width must be positive').max(200),
  height: z.number().min(0.1, 'Height must be positive').max(200),
  unit: z.enum(['in', 'cm'])
});

// Package weight schema
const WeightSchema = z.object({
  value: z.number().min(0.1, 'Weight must be positive').max(50000),
  unit: z.enum(['lbs', 'kg'])
});

// Special handling schema
const SpecialHandlingSchema = z.array(z.enum([
  'fragile',
  'this-side-up',
  'temperature-controlled',
  'hazmat',
  'white-glove',
  'inside-delivery',
  'liftgate-pickup',
  'liftgate-delivery'
])).default([]);

// Package info schema
const PackageInfoSchema = z.object({
  type: z.enum([
    'envelope', 'small', 'medium', 'large', 'pallet', 'crate', 'multiple'
  ]),
  dimensions: DimensionsSchema,
  weight: WeightSchema,
  declaredValue: z.number().min(0.01, 'Declared value must be positive').max(1000000),
  currency: z.enum(['USD', 'CAD', 'MXN']).default('USD'),
  contents: z.string().min(2, 'Package contents description required').max(200),
  contentsCategory: z.enum([
    'electronics', 'automotive', 'industrial', 'documents', 'clothing',
    'food', 'medical', 'furniture', 'raw-materials', 'other'
  ]),
  specialHandling: SpecialHandlingSchema,
  multiplePackages: z.object({
    numberOfPieces: z.number().min(2).max(100),
    pieces: z.array(z.object({
      id: z.string(),
      type: z.enum(['envelope', 'small', 'medium', 'large', 'pallet', 'crate']),
      dimensions: DimensionsSchema,
      weight: WeightSchema,
      description: z.string().max(100),
      declaredValue: z.number().min(0.01)
    })),
    totalWeight: z.number().min(0.1),
    totalDeclaredValue: z.number().min(0.01)
  }).optional()
}).refine((data) => {
  // Validate that multiple packages data is provided when type is 'multiple'
  if (data.type === 'multiple' && !data.multiplePackages) {
    return false;
  }
  return true;
}, {
  message: 'Multiple packages details required when package type is multiple',
  path: ['multiplePackages']
});

// Delivery preferences schema
const DeliveryPreferencesSchema = z.object({
  signatureRequired: z.boolean().default(false),
  adultSignatureRequired: z.boolean().default(false),
  smsConfirmation: z.boolean().default(false),
  photoProof: z.boolean().default(false),
  saturdayDelivery: z.boolean().default(false),
  holdAtLocation: z.boolean().default(false),
  serviceLevel: z.enum(['economical', 'fastest', 'reliable', 'carbon-neutral']).default('reliable')
});

// Shipment details schema
const ShipmentDetailsSchema = z.object({
  origin: AddressSchema,
  destination: AddressSchema,
  package: PackageInfoSchema,
  deliveryPreferences: DeliveryPreferencesSchema
}).refine((data) => {
  // Validate that origin and destination are different
  const originKey = `${data.origin.address}-${data.origin.city}-${data.origin.zip}`;
  const destinationKey = `${data.destination.address}-${data.destination.city}-${data.destination.zip}`;
  
  return originKey !== destinationKey;
}, {
  message: 'Origin and destination cannot be the same',
  path: ['destination']
});

// Quote request schema
export const QuoteRequestSchema = z.object({
  shipmentDetails: ShipmentDetailsSchema
});

// Pricing breakdown schema for response validation
const PricingBreakdownSchema = z.object({
  baseRate: z.number().min(0),
  fuelSurcharge: z.number().min(0),
  fuelSurchargePercentage: z.number().min(0).max(50),
  insurance: z.number().min(0),
  insurancePercentage: z.number().min(0).max(10),
  specialHandling: z.number().min(0),
  deliveryConfirmation: z.number().min(0),
  taxes: z.number().min(0),
  taxPercentage: z.number().min(0).max(20),
  total: z.number().min(0),
  calculationBasis: z.object({
    distance: z.number().min(0),
    weight: z.number().min(0),
    dimensionalWeight: z.number().min(0).optional(),
    zone: z.string()
  })
});

// Pricing option schema for response validation
const PricingOptionSchema = z.object({
  id: z.string(),
  category: z.enum(['ground', 'air', 'freight']),
  serviceType: z.string(),
  carrier: z.string(),
  pricing: PricingBreakdownSchema,
  estimatedDelivery: z.string(),
  transitDays: z.number().min(1).max(30),
  features: z.array(z.string()),
  carbonFootprint: z.number().min(0).optional()
});

// Quote response schema
export const QuoteResponseSchema = z.object({
  quotes: z.object({
    ground: z.array(PricingOptionSchema),
    air: z.array(PricingOptionSchema),
    freight: z.array(PricingOptionSchema)
  }),
  requestId: z.string(),
  expiresAt: z.string().datetime(),
  calculatedAt: z.string().datetime()
});

// Export types inferred from schemas
export type QuoteRequest = z.infer<typeof QuoteRequestSchema>;
export type QuoteResponse = z.infer<typeof QuoteResponseSchema>;
export type PricingBreakdown = z.infer<typeof PricingBreakdownSchema>;
export type PricingOption = z.infer<typeof PricingOptionSchema>;

// Custom validation functions
export function validateZipCodeForCountry(zip: string, country: string): boolean {
  const cleanZip = zip.replace(/[\s-]/g, '');
  
  switch (country.toUpperCase()) {
    case 'US':
      return /^\d{5}(\d{4})?$/.test(cleanZip);
    case 'CA':
      return /^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(cleanZip.toUpperCase());
    case 'MX':
      return /^\d{5}$/.test(cleanZip);
    default:
      return false;
  }
}

export function validateStateForCountry(state: string, country: string): boolean {
  const usStates = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
  ];
  
  const caProvinces = [
    'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'ON', 'PE', 'QC', 'SK', 'NT', 'NU', 'YT'
  ];
  
  const mxStates = [
    'AG', 'BC', 'BS', 'CM', 'CS', 'CH', 'CO', 'CL', 'DF', 'DG',
    'GT', 'GR', 'HG', 'JA', 'EM', 'MI', 'MO', 'NA', 'NL', 'OA',
    'PU', 'QT', 'QR', 'SL', 'SI', 'SO', 'TB', 'TM', 'TL', 'VE', 'YU', 'ZA'
  ];
  
  switch (country.toUpperCase()) {
    case 'US':
      return usStates.includes(state.toUpperCase());
    case 'CA':
      return caProvinces.includes(state.toUpperCase());
    case 'MX':
      return mxStates.includes(state.toUpperCase());
    default:
      return false;
  }
}

export function validatePackageConstraints(packageInfo: z.infer<typeof PackageInfoSchema>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  let isValid = true;
  
  // Package type constraints
  const constraints: Record<string, { maxWeight: number; maxVolume?: number }> = {
    'envelope': { maxWeight: 1, maxVolume: 100 },
    'small': { maxWeight: 50, maxVolume: 5000 },
    'medium': { maxWeight: 150, maxVolume: 15000 },
    'large': { maxWeight: 500, maxVolume: 50000 },
    'pallet': { maxWeight: 2500 },
    'crate': { maxWeight: 5000 },
    'multiple': { maxWeight: 10000 }
  };
  
  const constraint = constraints[packageInfo.type];
  if (constraint) {
    // Convert weight to pounds if needed
    let weightInPounds = packageInfo.weight.value;
    if (packageInfo.weight.unit === 'kg') {
      weightInPounds = weightInPounds * 2.20462;
    }
    
    if (weightInPounds > constraint.maxWeight) {
      errors.push(`Weight ${weightInPounds} lbs exceeds maximum for ${packageInfo.type} (${constraint.maxWeight} lbs)`);
      isValid = false;
    }
    
    // Check volume constraints if specified
    if (constraint.maxVolume) {
      let volume = packageInfo.dimensions.length * packageInfo.dimensions.width * packageInfo.dimensions.height;
      
      // Convert to cubic inches if needed
      if (packageInfo.dimensions.unit === 'cm') {
        volume = volume / (2.54 ** 3);
      }
      
      if (volume > constraint.maxVolume) {
        errors.push(`Volume ${volume.toFixed(0)} cubic inches exceeds maximum for ${packageInfo.type} (${constraint.maxVolume} cubic inches)`);
        isValid = false;
      }
    }
  }
  
  // Declared value reasonableness
  if (packageInfo.declaredValue < 1) {
    errors.push('Declared value must be at least $1.00');
    isValid = false;
  }
  
  if (packageInfo.declaredValue > 100000) {
    errors.push('Declared value cannot exceed $100,000 for standard shipping');
    isValid = false;
  }
  
  return { isValid, errors };
}

// Error response schema
export const QuoteErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.string(), z.any()).optional(),
    validationErrors: z.array(z.object({
      field: z.string(),
      message: z.string(),
      code: z.string()
    })).optional()
  }),
  timestamp: z.string().datetime(),
  requestId: z.string()
});

export type QuoteErrorResponse = z.infer<typeof QuoteErrorResponseSchema>;
