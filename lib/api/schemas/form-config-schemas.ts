import { z } from 'zod';

// Package Type Schema
export const PackageTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  weight: z.object({
    min: z.number(),
    max: z.number(),
    unit: z.string()
  }),
  dimensions: z.object({
    maxLength: z.number(),
    maxWidth: z.number(),
    maxHeight: z.number(),
    unit: z.string()
  }),
  pricing: z.object({
    baseMultiplier: z.number(),
    handlingFee: z.number()
  }),
  restrictions: z.array(z.string()),
  examples: z.array(z.string())
});

// Special Handling Option Schema
export const SpecialHandlingOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  fee: z.number(),
  currency: z.string(),
  requirements: z.array(z.string()),
  incompatibleWith: z.array(z.string()),
  triggersForm: z.boolean().optional()
});

// Geographic Location Schema
export const LocationSchema = z.object({
  code: z.string(),
  name: z.string(),
  fullName: z.string().optional(),
  zipPattern: z.string(),
  timeZone: z.string().optional()
});

export const CountrySchema = z.object({
  code: z.string(),
  name: z.string(),
  currency: z.string(),
  zipPattern: z.string(),
  zipLabel: z.string(),
  phonePattern: z.string(),
  states: z.array(LocationSchema).optional(),
  provinces: z.array(LocationSchema).optional()
});

// Industry Classification Schema
export const IndustrySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  specialRequirements: z.array(z.string()),
  riskLevel: z.enum(['low', 'medium', 'high'])
});

// Validation Rules Schema
export const ValidationRuleSchema = z.object({
  field: z.string(),
  type: z.enum(['required', 'pattern', 'range', 'custom']),
  message: z.string(),
  value: z.any().optional(),
  condition: z.string().optional()
});

export const ValidationSectionSchema = z.object({
  section: z.string(),
  rules: z.array(ValidationRuleSchema)
});

// Delivery Preferences Schema
export const DeliveryPreferenceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  fee: z.number(),
  category: z.enum(['signature', 'notification', 'timing', 'location'])
});

// Service Level Preferences Schema
export const ServiceLevelPreferenceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  impact: z.string()
});

// Payment Method Configuration Schema
export const PaymentMethodSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  fields: z.array(z.object({
    name: z.string(),
    type: z.string(),
    required: z.boolean(),
    validation: z.string().optional(),
    placeholder: z.string().optional()
  })),
  requirements: z.array(z.string())
});

// Currency Configuration Schema
export const CurrencySchema = z.object({
  code: z.string(),
  name: z.string(),
  symbol: z.string(),
  format: z.string(),
  exchangeRate: z.number().optional()
});

// Main Form Configuration Schema
export const FormConfigSchema = z.object({
  packageTypes: z.array(PackageTypeSchema),
  specialHandling: z.array(SpecialHandlingOptionSchema),
  countries: z.array(CountrySchema),
  industries: z.array(IndustrySchema),
  validation: z.array(ValidationSectionSchema),
  deliveryPreferences: z.array(DeliveryPreferenceSchema),
  serviceLevelPreferences: z.array(ServiceLevelPreferenceSchema),
  paymentMethods: z.array(PaymentMethodSchema),
  currencies: z.array(CurrencySchema),
  metadata: z.object({
    version: z.string(),
    lastUpdated: z.string(),
    cacheExpiry: z.number(),
    dataSource: z.string()
  })
});

// Form Configuration Request Schema
export const FormConfigRequestSchema = z.object({
  sections: z.array(z.string()).optional(),
  locale: z.string().optional().default('en-US'),
  version: z.string().optional()
});

// Response Schema
export const FormConfigResponseSchema = z.object({
  success: z.boolean(),
  data: FormConfigSchema,
  meta: z.object({
    requestId: z.string(),
    timestamp: z.string(),
    processingTime: z.number(),
    cached: z.boolean(),
    version: z.string()
  })
});

// Type exports
export type PackageType = z.infer<typeof PackageTypeSchema>;
export type SpecialHandlingOption = z.infer<typeof SpecialHandlingOptionSchema>;
export type Location = z.infer<typeof LocationSchema>;
export type Country = z.infer<typeof CountrySchema>;
export type Industry = z.infer<typeof IndustrySchema>;
export type ValidationRule = z.infer<typeof ValidationRuleSchema>;
export type ValidationSection = z.infer<typeof ValidationSectionSchema>;
export type DeliveryPreference = z.infer<typeof DeliveryPreferenceSchema>;
export type ServiceLevelPreference = z.infer<typeof ServiceLevelPreferenceSchema>;
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type Currency = z.infer<typeof CurrencySchema>;
export type FormConfig = z.infer<typeof FormConfigSchema>;
export type FormConfigRequest = z.infer<typeof FormConfigRequestSchema>;
export type FormConfigResponse = z.infer<typeof FormConfigResponseSchema>;