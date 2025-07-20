import type { PickupDetails, TimeSlot } from '@/lib/types';

export interface PickupConfirmationResult {
  confirmed: boolean;
  confirmationId?: string;
  reservationCode?: string;
  reason?: string;
  processingTime: number;
  alternativeSlots?: TimeSlot[];
}

/**
 * Confirm pickup slot availability and reserve the time slot
 */
export async function confirmPickupSlot(pickupDetails: PickupDetails): Promise<PickupConfirmationResult> {
  console.log('📅 [PICKUP-CONFIRM] Starting pickup slot confirmation for:', {
    date: pickupDetails.date,
    timeSlot: pickupDetails.timeSlot.display,
    slotId: pickupDetails.timeSlot.id
  });
  
  const startTime = Date.now();
  
  try {
    // Simulate processing delay
    const processingDelay = getPickupProcessingDelay(pickupDetails);
    await new Promise(resolve => setTimeout(resolve, processingDelay));
    
    // Validate pickup slot availability
    const availability = await validateSlotAvailability(pickupDetails);
    
    if (availability.available) {
      // Reserve the slot
      const reservation = await reservePickupSlot(pickupDetails);
      
      const processingTime = Date.now() - startTime;
      console.log('✅ [PICKUP-CONFIRM] Pickup slot confirmed:', {
        confirmationId: reservation.confirmationId,
        reservationCode: reservation.reservationCode,
        processingTime: `${processingTime}ms`
      });
      
      return {
        confirmed: true,
        confirmationId: reservation.confirmationId,
        reservationCode: reservation.reservationCode,
        processingTime
      };
      
    } else {
      const processingTime = Date.now() - startTime;
      console.log('❌ [PICKUP-CONFIRM] Pickup slot unavailable:', {
        reason: availability.reason,
        processingTime: `${processingTime}ms`
      });
      
      // Get alternative slots if available
      const alternatives = await getAlternativeSlots(pickupDetails);
      
      return {
        confirmed: false,
        reason: availability.reason,
        processingTime,
        alternativeSlots: alternatives
      };
    }
    
  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error('💥 [PICKUP-CONFIRM] Pickup confirmation failed:', {
      error: error.message,
      processingTime: `${processingTime}ms`
    });
    
    return {
      confirmed: false,
      reason: error.message || 'Pickup slot confirmation failed',
      processingTime
    };
  }
}

/**
 * Validate if the requested pickup slot is still available
 */
async function validateSlotAvailability(pickupDetails: PickupDetails): Promise<{ available: boolean; reason?: string }> {
  console.log('🔍 [PICKUP-CONFIRM] Validating slot availability...');
  
  const { timeSlot, date, accessInstructions, equipmentRequirements } = pickupDetails;
  
  // Check basic slot availability (98% success rate for simulation)
  if (Math.random() < 0.02) {
    return {
      available: false,
      reason: 'Time slot has been reserved by another customer'
    };
  }
  
  // Check if pickup date is still valid (not in the past)
  const pickupDate = new Date(date);
  const currentDate = new Date();
  if (pickupDate < currentDate) {
    return {
      available: false,
      reason: 'Pickup date is in the past'
    };
  }
  
  // Check lead time requirements
  const timeDiff = pickupDate.getTime() - currentDate.getTime();
  const hoursUntilPickup = timeDiff / (1000 * 60 * 60);
  
  if (hoursUntilPickup < 12) {
    return {
      available: false,
      reason: 'Insufficient lead time for pickup scheduling'
    };
  }
  
  // Validate equipment availability
  if (equipmentRequirements.twoPersonTeam && Math.random() < 0.05) {
    return {
      available: false,
      reason: 'Two-person team not available for requested time slot'
    };
  }
  
  if (equipmentRequirements.palletJack && Math.random() < 0.03) {
    return {
      available: false,
      reason: 'Pallet jack equipment not available for requested time slot'
    };
  }
  
  // Check for special access requirements
  if (accessInstructions.appointmentRequired && Math.random() < 0.02) {
    return {
      available: false,
      reason: 'Cannot schedule appointment for requested time'
    };
  }
  
  // Check capacity constraints based on time slot
  const capacityCheck = checkTimeSlotCapacity(timeSlot, date);
  if (!capacityCheck.available) {
    return {
      available: false,
      reason: capacityCheck.reason
    };
  }
  
  console.log('✅ [PICKUP-CONFIRM] Slot availability validated');
  return { available: true };
}

/**
 * Check capacity constraints for specific time slot
 */
function checkTimeSlotCapacity(timeSlot: TimeSlot, date: string): { available: boolean; reason?: string } {
  // Simulate capacity constraints based on time of day and day of week
  const pickupDate = new Date(date);
  const dayOfWeek = pickupDate.getDay();
  const hour = parseInt(timeSlot.startTime.split(':')[0]);
  
  // Monday mornings are busier (95% capacity)
  if (dayOfWeek === 1 && hour >= 8 && hour <= 10 && Math.random() < 0.05) {
    return {
      available: false,
      reason: 'High pickup volume on Monday mornings - slot at capacity'
    };
  }
  
  // Friday afternoons are busier (93% capacity)
  if (dayOfWeek === 5 && hour >= 14 && hour <= 17 && Math.random() < 0.07) {
    return {
      available: false,
      reason: 'High pickup volume on Friday afternoons - slot at capacity'
    };
  }
  
  // Early morning slots have limited availability (90% capacity)
  if (hour <= 7 && Math.random() < 0.10) {
    return {
      available: false,
      reason: 'Limited early morning pickup capacity'
    };
  }
  
  // Late evening slots have limited availability (85% capacity)
  if (hour >= 18 && Math.random() < 0.15) {
    return {
      available: false,
      reason: 'Limited evening pickup capacity'
    };
  }
  
  return { available: true };
}

/**
 * Reserve the pickup slot
 */
async function reservePickupSlot(pickupDetails: PickupDetails): Promise<{ confirmationId: string; reservationCode: string }> {
  console.log('🔒 [PICKUP-CONFIRM] Reserving pickup slot...');
  
  // Generate confirmation ID
  const confirmationId = generateConfirmationId();
  
  // Generate reservation code for driver reference
  const reservationCode = generateReservationCode(pickupDetails);
  
  // Simulate reservation processing
  await new Promise(resolve => setTimeout(resolve, 200));
  
  console.log('✅ [PICKUP-CONFIRM] Slot reserved:', {
    confirmationId,
    reservationCode,
    date: pickupDetails.date,
    timeSlot: pickupDetails.timeSlot.display
  });
  
  return {
    confirmationId,
    reservationCode
  };
}

/**
 * Get alternative pickup slots if the requested slot is unavailable
 */
async function getAlternativeSlots(pickupDetails: PickupDetails): Promise<TimeSlot[]> {
  console.log('🔄 [PICKUP-CONFIRM] Finding alternative pickup slots...');
  
  const requestedDate = new Date(pickupDetails.date);
  const alternatives: TimeSlot[] = [];
  
  // Generate alternative slots for the same day
  const sameDay = generateAlternativeSlots(requestedDate, 'same-day');
  alternatives.push(...sameDay);
  
  // Generate alternative slots for next day
  const nextDay = new Date(requestedDate);
  nextDay.setDate(nextDay.getDate() + 1);
  const nextDaySlots = generateAlternativeSlots(nextDay, 'next-day');
  alternatives.push(...nextDaySlots);
  
  // Generate alternative slots for day after
  const dayAfter = new Date(requestedDate);
  dayAfter.setDate(dayAfter.getDate() + 2);
  const dayAfterSlots = generateAlternativeSlots(dayAfter, 'day-after');
  alternatives.push(...dayAfterSlots);
  
  console.log('📋 [PICKUP-CONFIRM] Found alternative slots:', {
    count: alternatives.length,
    sameDayOptions: sameDay.length,
    nextDayOptions: nextDaySlots.length
  });
  
  return alternatives.slice(0, 8); // Return up to 8 alternatives
}

/**
 * Generate alternative time slots for a given date
 */
function generateAlternativeSlots(date: Date, context: string): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const dateStr = date.toISOString().split('T')[0];
  
  // Define available time slots
  const timeSlots = [
    { start: '08:00', end: '10:00', display: '8:00 AM - 10:00 AM' },
    { start: '10:00', end: '12:00', display: '10:00 AM - 12:00 PM' },
    { start: '12:00', end: '14:00', display: '12:00 PM - 2:00 PM' },
    { start: '14:00', end: '16:00', display: '2:00 PM - 4:00 PM' },
    { start: '16:00', end: '18:00', display: '4:00 PM - 6:00 PM' }
  ];
  
  // Randomly select 2-3 available slots
  const availableCount = Math.floor(Math.random() * 2) + 2; // 2-3 slots
  const shuffled = timeSlots.sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < Math.min(availableCount, shuffled.length); i++) {
    const slot = shuffled[i];
    slots.push({
      id: `alt-${context}-${dateStr}-${slot.start.replace(':', '')}`,
      display: slot.display,
      startTime: slot.start,
      endTime: slot.end,
      availability: 'available' as const,
      additionalFee: context === 'same-day' ? 0 : (context === 'next-day' ? 10 : 15)
    });
  }
  
  return slots;
}

/**
 * Get processing delay based on pickup complexity
 */
function getPickupProcessingDelay(pickupDetails: PickupDetails): number {
  let baseDelay = 300; // 300ms base
  
  // Add delay for equipment requirements
  if (pickupDetails.equipmentRequirements.twoPersonTeam) baseDelay += 200;
  if (pickupDetails.equipmentRequirements.palletJack) baseDelay += 150;
  if (pickupDetails.equipmentRequirements.applianceDolly) baseDelay += 100;
  
  // Add delay for access requirements
  if (pickupDetails.accessInstructions.appointmentRequired) baseDelay += 250;
  if (pickupDetails.accessInstructions.securityRequired) baseDelay += 200;
  if (pickupDetails.accessInstructions.gateCode) baseDelay += 100;
  
  // Add delay for special authorization
  if (pickupDetails.specialAuthorization?.idVerificationRequired) baseDelay += 300;
  if (pickupDetails.specialAuthorization?.photoIdMatching) baseDelay += 200;
  
  // Add random variation (±100ms)
  const variation = Math.random() * 200 - 100;
  return Math.max(200, baseDelay + variation);
}

/**
 * Generate unique confirmation ID
 */
function generateConfirmationId(): string {
  const prefix = 'PCK';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Generate reservation code for driver reference
 */
function generateReservationCode(pickupDetails: PickupDetails): string {
  const date = new Date(pickupDetails.date);
  const dateStr = date.getFullYear().toString().slice(-2) + 
                  (date.getMonth() + 1).toString().padStart(2, '0') + 
                  date.getDate().toString().padStart(2, '0');
  const timeStr = pickupDetails.timeSlot.startTime.replace(':', '');
  const random = Math.random().toString(36).substr(2, 3).toUpperCase();
  
  return `${dateStr}${timeStr}${random}`;
}