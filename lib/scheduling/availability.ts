/**
 * Pickup Availability Engine
 * Intelligent scheduling system for package pickup availability
 */

import { TraceLogger } from '@/lib/api/utils/trace-logger';
import { 
  TimeSlot, 
  AvailableDate, 
  ServiceRestriction, 
  PremiumOptions,
  determineServiceArea 
} from '@/lib/api/schemas/pickup-schemas';
import { 
  isBusinessDay, 
  isWeekend, 
  isFederalHoliday, 
  addBusinessDays, 
  getDayOfWeekName, 
  isCarrierBlackout, 
  getHolidayName,
  isPastCutoffTime
} from './holidays';

// Configuration constants
const MINIMUM_LEAD_TIME_DAYS = 3;
const DEFAULT_AVAILABILITY_WEEKS = 3;
const CUTOFF_TIME = '15:00'; // 3:00 PM
const WEEKEND_PREMIUM_FEE = 50;
const EVENING_PREMIUM_FEE = 25;

// Standard time slots
const TIME_SLOTS = [
  {
    id: 'morning',
    label: 'Morning Pickup',
    startTime: '08:00',
    endTime: '12:00',
    additionalFee: 0,
    description: 'Standard morning pickup window'
  },
  {
    id: 'afternoon',
    label: 'Afternoon Pickup',
    startTime: '12:00',
    endTime: '17:00',
    additionalFee: 0,
    description: 'Standard afternoon pickup window'
  },
  {
    id: 'evening',
    label: 'Evening Pickup',
    startTime: '17:00',
    endTime: '19:00',
    additionalFee: EVENING_PREMIUM_FEE,
    description: 'Premium evening pickup with additional fee'
  }
];

/**
 * Availability calculation configuration based on ZIP code
 */
interface AvailabilityConfig {
  baseAvailability: number; // 0-100 percentage
  demandVariation: number; // variance in demand
  seasonalFactor: number; // seasonal adjustment
  capacityLimits: {
    morning: number;
    afternoon: number;
    evening: number;
  };
}

/**
 * Get availability configuration based on service area
 */
function getAvailabilityConfig(zip: string): AvailabilityConfig {
  const serviceArea = determineServiceArea(zip);
  
  switch (serviceArea.coverage) {
    case 'full':
      return {
        baseAvailability: 85,
        demandVariation: 15,
        seasonalFactor: 1.0,
        capacityLimits: { morning: 90, afternoon: 95, evening: 75 }
      };
    case 'limited':
      return {
        baseAvailability: 55, // Reduced from 65 for more variation
        demandVariation: 30,   // Increased from 25
        seasonalFactor: 0.7,   // Reduced from 0.8
        capacityLimits: { morning: 60, afternoon: 70, evening: 40 } // Reduced from higher values
      };
    case 'remote':
      return {
        baseAvailability: 35,  // Reduced from 45 for more variation
        demandVariation: 40,   // Increased from 35
        seasonalFactor: 0.5,   // Reduced from 0.6
        capacityLimits: { morning: 40, afternoon: 50, evening: 25 } // Reduced from higher values
      };
    default:
      return {
        baseAvailability: 75,
        demandVariation: 20,
        seasonalFactor: 0.9,
        capacityLimits: { morning: 80, afternoon: 85, evening: 60 }
      };
  }
}

/**
 * Generate deterministic pseudo-random number based on date and ZIP
 */
function getDeterministicRandom(date: Date, zip: string, factor: string = ''): number {
  const dateStr = date.toISOString().split('T')[0];
  const seed = `${zip}-${dateStr}-${factor}`;
  
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to 0-1 range
  return Math.abs(hash % 1000) / 1000;
}

/**
 * Calculate availability for a specific time slot
 */
function calculateTimeSlotAvailability(
  date: Date,
  slotId: string,
  zip: string,
  config: AvailabilityConfig,
  logger?: TraceLogger
): 'available' | 'limited' | 'unavailable' {
  // Check for blackouts first
  const blackout = isCarrierBlackout(date);
  if (blackout.isBlackout) {
    logger?.log('debug', 'time_slot_blackout', { date: date.toISOString(), reason: blackout.reason });
    return 'unavailable';
  }
  
  // Get deterministic random factors
  const demandFactor = getDeterministicRandom(date, zip, slotId);
  const capacityFactor = getDeterministicRandom(date, zip, `capacity-${slotId}`);
  
  // Calculate base availability
  const slotCapacity = config.capacityLimits[slotId as keyof typeof config.capacityLimits] || 70;
  const demandAdjustment = (demandFactor - 0.5) * config.demandVariation;
  const finalAvailability = Math.min(100, Math.max(0, 
    config.baseAvailability * config.seasonalFactor + demandAdjustment
  ));
  
  // Apply day-of-week patterns
  const dayOfWeek = date.getDay();
  let dayFactor = 1.0;
  
  // Monday/Friday typically busier
  if (dayOfWeek === 1) dayFactor = 0.8; // Monday
  if (dayOfWeek === 5) dayFactor = 0.85; // Friday
  if (dayOfWeek === 3) dayFactor = 1.1; // Wednesday (less busy)
  
  const adjustedAvailability = finalAvailability * dayFactor;
  
  logger?.log('debug', 'time_slot_availability_calculated', {
    date: date.toISOString(),
    slotId,
    baseAvailability: config.baseAvailability,
    demandAdjustment,
    dayFactor,
    finalAvailability: adjustedAvailability
  });
  
  // Determine availability level
  if (adjustedAvailability >= 70) return 'available';
  if (adjustedAvailability >= 40) return 'limited';
  return 'unavailable';
}

/**
 * Generate time slots for a specific date
 */
function generateTimeSlots(
  date: Date,
  zip: string,
  config: AvailabilityConfig,
  logger?: TraceLogger
): TimeSlot[] {
  return TIME_SLOTS.map(slot => {
    const availability = calculateTimeSlotAvailability(date, slot.id, zip, config, logger);
    const capacityFactor = getDeterministicRandom(date, zip, `capacity-${slot.id}`);
    const capacity = Math.round(capacityFactor * 100);
    
    return {
      id: slot.id,
      label: slot.label,
      startTime: slot.startTime,
      endTime: slot.endTime,
      availability,
      additionalFee: slot.additionalFee,
      capacity,
      description: slot.description
    };
  });
}

/**
 * Generate service restrictions based on date and area
 */
function generateServiceRestrictions(
  zip: string,
  startDate: Date,
  endDate: Date,
  logger?: TraceLogger
): ServiceRestriction[] {
  const restrictions: ServiceRestriction[] = [];
  const serviceArea = determineServiceArea(zip);
  
  // Add area-specific restrictions
  if (serviceArea.coverage === 'remote') {
    restrictions.push({
      type: 'geographic',
      message: 'Remote area with limited service frequency',
      severity: 'warning'
    });
  }
  
  if (serviceArea.coverage === 'limited') {
    restrictions.push({
      type: 'capacity',
      message: 'Limited service area with reduced capacity',
      severity: 'info'
    });
  }
  
  // Seasonal restrictions (winter weather for northern states)
  const month = startDate.getMonth() + 1;
  if ((month >= 12 || month <= 2) && serviceArea.zone.includes('REMOTE')) {
    restrictions.push({
      type: 'seasonal',
      message: 'Winter weather may affect service reliability',
      severity: 'warning'
    });
  }
  
  // Equipment restrictions for certain time periods
  const currentDate = new Date(startDate);
  const equipmentRestrictionDates: string[] = [];
  
  while (currentDate <= endDate) {
    const random = getDeterministicRandom(currentDate, zip, 'equipment');
    if (random < 0.05) { // 5% chance of equipment restrictions
      equipmentRestrictionDates.push(currentDate.toISOString().split('T')[0]);
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  if (equipmentRestrictionDates.length > 0) {
    restrictions.push({
      type: 'equipment',
      message: 'Special equipment maintenance may affect availability',
      affectedDates: equipmentRestrictionDates,
      severity: 'info'
    });
  }
  
  logger?.log('debug', 'service_restrictions_generated', {
    zip,
    restrictionCount: restrictions.length,
    serviceArea: serviceArea.zone
  });
  
  return restrictions;
}

/**
 * Generate weekend premium options
 */
function generateWeekendOptions(zip: string): PremiumOptions {
  const serviceArea = determineServiceArea(zip);
  
  // Remote areas may not have weekend service
  if (serviceArea.coverage === 'remote') {
    return {
      available: false,
      additionalFee: 0,
      conditions: ['Weekend service not available in remote areas']
    };
  }
  
  // Limited areas have restricted weekend service
  if (serviceArea.coverage === 'limited') {
    return {
      available: true,
      additionalFee: WEEKEND_PREMIUM_FEE + 25, // Higher fee for limited areas
      conditions: [
        'Saturday pickup only (no Sunday service)',
        'Limited time windows: 10:00 AM - 2:00 PM',
        'Subject to driver availability'
      ],
      timeSlots: [
        {
          id: 'saturday-morning',
          label: 'Saturday Morning',
          startTime: '10:00',
          endTime: '14:00',
          availability: 'limited' as const,
          additionalFee: WEEKEND_PREMIUM_FEE + 25,
          capacity: 50,
          description: 'Limited Saturday pickup service'
        }
      ]
    };
  }
  
  // Full service areas
  return {
    available: true,
    additionalFee: WEEKEND_PREMIUM_FEE,
    conditions: [
      'Saturday pickup available',
      'Sunday pickup on request',
      'Additional fees apply'
    ],
    timeSlots: [
      {
        id: 'saturday-morning',
        label: 'Saturday Morning',
        startTime: '09:00',
        endTime: '13:00',
        availability: 'available' as const,
        additionalFee: WEEKEND_PREMIUM_FEE,
        capacity: 75,
        description: 'Saturday morning pickup service'
      },
      {
        id: 'saturday-afternoon',
        label: 'Saturday Afternoon',
        startTime: '13:00',
        endTime: '17:00',
        availability: 'limited' as const,
        additionalFee: WEEKEND_PREMIUM_FEE + 15,
        capacity: 60,
        description: 'Saturday afternoon pickup service'
      }
    ]
  };
}

/**
 * Main availability generator class
 */
export class PickupAvailabilityGenerator {
  constructor(private logger?: TraceLogger) {}
  
  /**
   * Generate pickup availability for a ZIP code
   */
  generateAvailability(
    zip: string,
    numberOfWeeks: number = DEFAULT_AVAILABILITY_WEEKS,
    includeWeekends: boolean = false,
    includeHolidays: boolean = false
  ) {
    this.logger?.log('info', 'generating_pickup_availability', {
      zip,
      numberOfWeeks,
      includeWeekends,
      includeHolidays
    });
    
    const serviceArea = determineServiceArea(zip);
    const config = getAvailabilityConfig(zip);
    
    // Calculate start date (minimum lead time)
    const today = new Date();
    const isPastCutoff = isPastCutoffTime();
    const additionalDay = isPastCutoff ? 1 : 0;
    
    let startDate = addBusinessDays(today, MINIMUM_LEAD_TIME_DAYS + additionalDay);
    
    this.logger?.log('debug', 'calculated_start_date', {
      today: today.toISOString(),
      isPastCutoff,
      additionalDay,
      startDate: startDate.toISOString()
    });
    
    // Calculate end date
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (numberOfWeeks * 7));
    
    // Generate available dates
    const availableDates: AvailableDate[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const shouldInclude = this.shouldIncludeDate(currentDate, includeWeekends, includeHolidays);
      
      if (shouldInclude) {
        const timeSlots = generateTimeSlots(currentDate, zip, config, this.logger);
        const dayOfWeek = getDayOfWeekName(currentDate);
        const isHoliday = isFederalHoliday(currentDate);
        const holidayName = getHolidayName(currentDate);
        
        const notes: string[] = [];
        const restrictions: string[] = [];
        
        if (isHoliday && holidayName) {
          notes.push(`Holiday: ${holidayName}`);
        }
        
        if (isWeekend(currentDate)) {
          notes.push('Weekend service with premium fees');
          restrictions.push('Limited time windows available');
        }
        
        availableDates.push({
          date: currentDate.toISOString().split('T')[0],
          dayOfWeek,
          isBusinessDay: isBusinessDay(currentDate),
          timeSlots,
          notes: notes.length > 0 ? notes : undefined,
          restrictions: restrictions.length > 0 ? restrictions : undefined
        });
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Generate restrictions
    const restrictions = generateServiceRestrictions(zip, startDate, endDate, this.logger);
    
    // Generate premium options
    const weekendOptions = generateWeekendOptions(zip);
    const holidayOptions: PremiumOptions = {
      available: serviceArea.coverage === 'full',
      additionalFee: 75,
      conditions: [
        'Holiday pickup subject to availability',
        'Limited time windows',
        'Premium rates apply'
      ]
    };
    
    const generatedAt = new Date();
    const validUntil = new Date(generatedAt.getTime() + (60 * 60 * 1000)); // 1 hour cache
    
    this.logger?.log('info', 'pickup_availability_generated', {
      zip,
      serviceArea: serviceArea.zone,
      availableDatesCount: availableDates.length,
      restrictionsCount: restrictions.length,
      weekendsIncluded: includeWeekends,
      holidaysIncluded: includeHolidays
    });
    
    return {
      availableDates,
      restrictions,
      cutoffTime: CUTOFF_TIME,
      serviceArea,
      weekendOptions: includeWeekends ? weekendOptions : undefined,
      holidayOptions: includeHolidays ? holidayOptions : undefined,
      metadata: {
        generatedAt: generatedAt.toISOString(),
        validUntil: validUntil.toISOString(),
        minimumLeadTime: MINIMUM_LEAD_TIME_DAYS,
        maxAdvanceBooking: numberOfWeeks * 7
      }
    };
  }
  
  /**
   * Determine if a date should be included in availability
   */
  private shouldIncludeDate(
    date: Date,
    includeWeekends: boolean,
    includeHolidays: boolean
  ): boolean {
    const isHoliday = isFederalHoliday(date);
    const isWeekendDay = isWeekend(date);
    
    // Always include business days
    if (isBusinessDay(date)) {
      return true;
    }
    
    // Include holidays if requested
    if (isHoliday && includeHolidays) {
      return true;
    }
    
    // Include weekends if requested
    if (isWeekendDay && includeWeekends) {
      return true;
    }
    
    return false;
  }
}

/**
 * Create and configure pickup availability generator
 */
export function createPickupAvailabilityGenerator(logger?: TraceLogger): PickupAvailabilityGenerator {
  return new PickupAvailabilityGenerator(logger);
}
