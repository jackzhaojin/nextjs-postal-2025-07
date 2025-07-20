/**
 * Zod schemas for Pickup Availability API endpoints
 * Comprehensive validation for pickup availability requests and responses
 */

import { z } from 'zod';

// Time slot schema
export const TimeSlotSchema = z.object({
  id: z.string(),
  label: z.string(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  availability: z.enum(['available', 'limited', 'unavailable']),
  additionalFee: z.number().min(0).default(0),
  capacity: z.number().min(0).max(100).optional(),
  description: z.string().optional()
});

// Available date schema
export const AvailableDateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  dayOfWeek: z.string(),
  isBusinessDay: z.boolean(),
  timeSlots: z.array(TimeSlotSchema),
  notes: z.array(z.string()).optional(),
  restrictions: z.array(z.string()).optional()
});

// Service restriction schema
export const ServiceRestrictionSchema = z.object({
  type: z.enum(['weather', 'capacity', 'equipment', 'geographic', 'seasonal']),
  message: z.string(),
  affectedDates: z.array(z.string()).optional(),
  severity: z.enum(['info', 'warning', 'error']).default('info')
});

// Weekend/holiday options schema
export const PremiumOptionsSchema = z.object({
  available: z.boolean(),
  additionalFee: z.number().min(0),
  conditions: z.array(z.string()).optional(),
  timeSlots: z.array(TimeSlotSchema).optional()
});

// Pickup availability request schema
export const PickupAvailabilityRequestSchema = z.object({
  zip: z.string()
    .min(5, 'ZIP code must be at least 5 characters')
    .max(10, 'ZIP code cannot exceed 10 characters')
    .regex(/^\d{5}(-\d{4})?$/, 'ZIP code must be in 12345 or 12345-6789 format')
    .refine((zip) => !zip.startsWith('09'), 'Military ZIP codes (APO/FPO) are not supported'),
  serviceArea: z.string().optional(),
  numberOfWeeks: z.number().min(1).max(4).default(3),
  includeWeekends: z.boolean().default(false),
  includeHolidays: z.boolean().default(false)
});

// Pickup availability response schema
export const PickupAvailabilityResponseSchema = z.object({
  availableDates: z.array(AvailableDateSchema),
  restrictions: z.array(ServiceRestrictionSchema),
  cutoffTime: z.string().regex(/^\d{2}:\d{2}$/, 'Cutoff time must be in HH:MM format'),
  serviceArea: z.object({
    zone: z.string(),
    coverage: z.enum(['full', 'limited', 'remote']),
    description: z.string()
  }),
  weekendOptions: PremiumOptionsSchema.optional(),
  holidayOptions: PremiumOptionsSchema.optional(),
  metadata: z.object({
    generatedAt: z.string().datetime(),
    validUntil: z.string().datetime(),
    minimumLeadTime: z.number().min(1),
    maxAdvanceBooking: z.number().min(1)
  })
});

// Error response schemas
export const PickupAvailabilityErrorSchema = z.object({
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

// Export types inferred from schemas
export type TimeSlot = z.infer<typeof TimeSlotSchema>;
export type AvailableDate = z.infer<typeof AvailableDateSchema>;
export type ServiceRestriction = z.infer<typeof ServiceRestrictionSchema>;
export type PremiumOptions = z.infer<typeof PremiumOptionsSchema>;
export type PickupAvailabilityRequest = z.infer<typeof PickupAvailabilityRequestSchema>;
export type PickupAvailabilityResponse = z.infer<typeof PickupAvailabilityResponseSchema>;
export type PickupAvailabilityError = z.infer<typeof PickupAvailabilityErrorSchema>;

// ZIP code validation utility
export function validateUSZipCode(zip: string): boolean {
  return /^\d{5}(-\d{4})?$/.test(zip);
}

// Service area determination utility
export function determineServiceArea(zip: string): { zone: string; coverage: 'full' | 'limited' | 'remote'; description: string } {
  const zipNum = parseInt(zip.substring(0, 5));
  
  // Metropolitan zones (major cities)
  const metroZones = [
    { range: [10000, 14999], zone: 'METRO-NYC', coverage: 'full' as const, description: 'New York Metro Area' },
    { range: [20000, 20799], zone: 'METRO-DC', coverage: 'full' as const, description: 'Washington DC Metro Area' },
    { range: [30000, 31999], zone: 'METRO-ATL', coverage: 'full' as const, description: 'Atlanta Metro Area' },
    { range: [60000, 60999], zone: 'METRO-CHI', coverage: 'full' as const, description: 'Chicago Metro Area' },
    { range: [75000, 75999], zone: 'METRO-DAL', coverage: 'full' as const, description: 'Dallas Metro Area' },
    { range: [90000, 96999], zone: 'METRO-LA', coverage: 'full' as const, description: 'Los Angeles Metro Area' }
  ];
  
  // Check metro zones first
  for (const metro of metroZones) {
    if (zipNum >= metro.range[0] && zipNum <= metro.range[1]) {
      return metro;
    }
  }
  
  // Remote/rural zones
  const remoteZones = [
    { range: [99000, 99999], zone: 'REMOTE-AK', coverage: 'remote' as const, description: 'Alaska Remote Area' },
    { range: [96700, 96899], zone: 'REMOTE-HI', coverage: 'limited' as const, description: 'Hawaii Limited Service' },
    { range: [59000, 59999], zone: 'REMOTE-MT', coverage: 'remote' as const, description: 'Montana Remote Area' },
    { range: [82000, 83999], zone: 'REMOTE-WY', coverage: 'remote' as const, description: 'Wyoming Remote Area' }
  ];
  
  for (const remote of remoteZones) {
    if (zipNum >= remote.range[0] && zipNum <= remote.range[1]) {
      return remote;
    }
  }
  
  // Standard coverage for most areas
  const firstDigit = Math.floor(zipNum / 10000);
  return {
    zone: `STANDARD-${firstDigit}`,
    coverage: 'full' as const,
    description: `Standard Service Area Zone ${firstDigit}`
  };
}
