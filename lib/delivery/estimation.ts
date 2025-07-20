import type { PickupDetails, PricingOption, Address } from '@/lib/types';

export interface DeliveryEstimation {
  estimatedDate: string;
  estimatedTime?: string;
  transitDays: number;
  businessDaysOnly: boolean;
  deliveryWindow: {
    earliest: string;
    latest: string;
  };
  factors: {
    pickupDate: string;
    serviceTransitDays: number;
    businessDayAdjustment: number;
    holidayAdjustment: number;
    weekendAdjustment: number;
    zoneFactor: number;
  };
  confidence: 'high' | 'medium' | 'low';
  notes?: string[];
}

/**
 * Calculate realistic delivery estimation based on pickup, service, and destination
 */
export async function estimateDelivery(
  pickupDetails: PickupDetails,
  selectedOption: PricingOption,
  destination: Address
): Promise<DeliveryEstimation> {
  console.log('🚚 [DELIVERY-EST] Starting delivery estimation:', {
    pickupDate: pickupDetails.date,
    service: selectedOption.serviceType,
    carrier: selectedOption.carrier,
    transitDays: selectedOption.transitDays
  });
  
  try {
    // Parse pickup date
    const pickupDate = new Date(pickupDetails.date);
    console.log('📅 [DELIVERY-EST] Pickup date parsed:', pickupDate.toISOString());
    
    // Calculate base delivery date
    const baseDelivery = await calculateBaseDeliveryDate(pickupDate, selectedOption);
    console.log('📊 [DELIVERY-EST] Base delivery calculated:', baseDelivery);
    
    // Apply business day adjustments
    const businessDayAdjustment = await applyBusinessDayLogic(baseDelivery, selectedOption);
    console.log('🏢 [DELIVERY-EST] Business day adjustment:', businessDayAdjustment);
    
    // Apply holiday adjustments
    const holidayAdjustment = await applyHolidayAdjustments(businessDayAdjustment.adjustedDate, selectedOption);
    console.log('🎄 [DELIVERY-EST] Holiday adjustment:', holidayAdjustment);
    
    // Apply geographic and zone factors
    const zoneAdjustment = await applyZoneFactors(holidayAdjustment.adjustedDate, selectedOption, destination);
    console.log('🌍 [DELIVERY-EST] Zone adjustment:', zoneAdjustment);
    
    // Calculate delivery window
    const deliveryWindow = calculateDeliveryWindow(zoneAdjustment.adjustedDate, selectedOption);
    console.log('⏰ [DELIVERY-EST] Delivery window:', deliveryWindow);
    
    // Determine confidence level
    const confidence = calculateConfidenceLevel(selectedOption, destination);
    console.log('📈 [DELIVERY-EST] Confidence level:', confidence);
    
    // Generate notes
    const notes = generateDeliveryNotes(selectedOption, destination, {
      businessDayAdjustment,
      holidayAdjustment,
      zoneAdjustment
    });
    
    const finalEstimation: DeliveryEstimation = {
      estimatedDate: zoneAdjustment.adjustedDate.toISOString().split('T')[0],
      estimatedTime: getEstimatedDeliveryTime(selectedOption),
      transitDays: calculateActualTransitDays(pickupDate, zoneAdjustment.adjustedDate),
      businessDaysOnly: isBusinessDaysOnlyService(selectedOption),
      deliveryWindow,
      factors: {
        pickupDate: pickupDate.toISOString().split('T')[0],
        serviceTransitDays: selectedOption.transitDays,
        businessDayAdjustment: businessDayAdjustment.daysAdded,
        holidayAdjustment: holidayAdjustment.daysAdded,
        weekendAdjustment: 0, // Included in business day adjustment
        zoneFactor: zoneAdjustment.daysAdded
      },
      confidence,
      notes
    };
    
    console.log('✅ [DELIVERY-EST] Delivery estimation completed:', {
      estimatedDate: finalEstimation.estimatedDate,
      transitDays: finalEstimation.transitDays,
      confidence: finalEstimation.confidence
    });
    
    return finalEstimation;
    
  } catch (error: any) {
    console.error('💥 [DELIVERY-EST] Delivery estimation failed:', error.message);
    
    // Fallback estimation
    const fallbackDate = new Date(pickupDetails.date);
    fallbackDate.setDate(fallbackDate.getDate() + selectedOption.transitDays);
    
    return {
      estimatedDate: fallbackDate.toISOString().split('T')[0],
      transitDays: selectedOption.transitDays,
      businessDaysOnly: true,
      deliveryWindow: {
        earliest: '09:00',
        latest: '17:00'
      },
      factors: {
        pickupDate: pickupDetails.date,
        serviceTransitDays: selectedOption.transitDays,
        businessDayAdjustment: 0,
        holidayAdjustment: 0,
        weekendAdjustment: 0,
        zoneFactor: 0
      },
      confidence: 'low',
      notes: ['Estimation based on fallback calculation due to processing error']
    };
  }
}

/**
 * Calculate base delivery date from pickup date and service transit time
 */
async function calculateBaseDeliveryDate(
  pickupDate: Date,
  selectedOption: PricingOption
): Promise<{ baseDate: Date; calculationMethod: string }> {
  console.log('📊 [DELIVERY-EST] Calculating base delivery date...');
  
  const baseDate = new Date(pickupDate);
  
  // For same-day pickup, delivery calculation starts next day
  if (isSameDayPickup(pickupDate)) {
    baseDate.setDate(baseDate.getDate() + 1);
    console.log('⚡ [DELIVERY-EST] Same-day pickup detected, starting calculation from next day');
  }
  
  // Add service transit days
  baseDate.setDate(baseDate.getDate() + selectedOption.transitDays);
  
  return {
    baseDate,
    calculationMethod: 'pickup_date_plus_transit_days'
  };
}

/**
 * Apply business day logic (skip weekends for most services)
 */
async function applyBusinessDayLogic(
  baseDelivery: { baseDate: Date; calculationMethod: string },
  selectedOption: PricingOption
): Promise<{ adjustedDate: Date; daysAdded: number; adjustmentReason: string }> {
  console.log('🏢 [DELIVERY-EST] Applying business day logic...');
  
  const adjustedDate = new Date(baseDelivery.baseDate);
  let daysAdded = 0;
  let adjustmentReason = 'no_adjustment';
  
  // Most services only deliver on business days
  if (isBusinessDaysOnlyService(selectedOption)) {
    // If delivery falls on weekend, move to Monday
    while (adjustedDate.getDay() === 0 || adjustedDate.getDay() === 6) {
      adjustedDate.setDate(adjustedDate.getDate() + 1);
      daysAdded++;
      adjustmentReason = 'weekend_skip';
    }
    
    if (daysAdded > 0) {
      console.log(`📅 [DELIVERY-EST] Moved delivery ${daysAdded} days to skip weekend`);
    }
  }
  
  return {
    adjustedDate,
    daysAdded,
    adjustmentReason
  };
}

/**
 * Apply holiday adjustments
 */
async function applyHolidayAdjustments(
  businessDate: Date,
  selectedOption: PricingOption
): Promise<{ adjustedDate: Date; daysAdded: number; holidaysSkipped: string[] }> {
  console.log('🎄 [DELIVERY-EST] Checking for holiday adjustments...');
  
  const adjustedDate = new Date(businessDate);
  let daysAdded = 0;
  const holidaysSkipped: string[] = [];
  
  // Get holidays for the year
  const holidays = getHolidays(adjustedDate.getFullYear());
  
  // Check if delivery date falls on a holiday
  for (const holiday of holidays) {
    if (isSameDate(adjustedDate, holiday.date)) {
      // Move delivery to next business day
      adjustedDate.setDate(adjustedDate.getDate() + 1);
      daysAdded++;
      holidaysSkipped.push(holiday.name);
      
      // If moved to weekend, move to Monday
      while (adjustedDate.getDay() === 0 || adjustedDate.getDay() === 6) {
        adjustedDate.setDate(adjustedDate.getDate() + 1);
        daysAdded++;
      }
      
      console.log(`🎄 [DELIVERY-EST] Moved delivery due to holiday: ${holiday.name}`);
    }
  }
  
  return {
    adjustedDate,
    daysAdded,
    holidaysSkipped
  };
}

/**
 * Apply geographic zone factors
 */
async function applyZoneFactors(
  holidayDate: Date,
  selectedOption: PricingOption,
  destination: Address
): Promise<{ adjustedDate: Date; daysAdded: number; zoneFactor: string }> {
  console.log('🌍 [DELIVERY-EST] Applying zone factors...');
  
  const adjustedDate = new Date(holidayDate);
  let daysAdded = 0;
  let zoneFactor = 'standard';
  
  // Apply zone-based adjustments
  const zoneInfo = getDeliveryZoneInfo(destination);
  
  switch (zoneInfo.zone) {
    case 'remote':
      // Remote areas may take 1-2 extra days
      if (selectedOption.category !== 'air') {
        daysAdded = 1;
        adjustedDate.setDate(adjustedDate.getDate() + daysAdded);
        zoneFactor = 'remote_area';
        console.log('🏔️ [DELIVERY-EST] Added 1 day for remote area delivery');
      }
      break;
      
    case 'metropolitan':
      // Metropolitan areas may be faster but no adjustment needed for estimation
      zoneFactor = 'metropolitan';
      console.log('🏙️ [DELIVERY-EST] Metropolitan area - standard timing');
      break;
      
    case 'rural':
      // Rural areas may take extra time for ground services
      if (selectedOption.category === 'ground') {
        // 20% chance of adding 1 extra day for rural ground delivery
        if (Math.random() < 0.2) {
          daysAdded = 1;
          adjustedDate.setDate(adjustedDate.getDate() + daysAdded);
          zoneFactor = 'rural_delay';
          console.log('🌾 [DELIVERY-EST] Added 1 day for rural area delivery');
        }
      }
      break;
  }
  
  // Skip weekends if moved to weekend
  if (isBusinessDaysOnlyService(selectedOption)) {
    while (adjustedDate.getDay() === 0 || adjustedDate.getDay() === 6) {
      adjustedDate.setDate(adjustedDate.getDate() + 1);
      daysAdded++;
    }
  }
  
  return {
    adjustedDate,
    daysAdded,
    zoneFactor
  };
}

/**
 * Calculate delivery time window
 */
function calculateDeliveryWindow(deliveryDate: Date, selectedOption: PricingOption): { earliest: string; latest: string } {
  console.log('⏰ [DELIVERY-EST] Calculating delivery window...');
  
  // Default business hours
  let earliest = '09:00';
  let latest = '17:00';
  
  // Adjust based on service type
  if (selectedOption.serviceType.toLowerCase().includes('express')) {
    earliest = '08:00';
    latest = '12:00';
  } else if (selectedOption.serviceType.toLowerCase().includes('priority')) {
    earliest = '09:00';
    latest = '15:00';
  } else if (selectedOption.serviceType.toLowerCase().includes('overnight')) {
    earliest = '08:00';
    latest = '10:30';
  } else if (selectedOption.serviceType.toLowerCase().includes('economy')) {
    earliest = '10:00';
    latest = '18:00';
  }
  
  // Weekend deliveries typically have different hours
  if (deliveryDate.getDay() === 6) { // Saturday
    earliest = '09:00';
    latest = '14:00';
  }
  
  console.log(`⏰ [DELIVERY-EST] Delivery window: ${earliest} - ${latest}`);
  
  return { earliest, latest };
}

/**
 * Get estimated delivery time for specific services
 */
function getEstimatedDeliveryTime(selectedOption: PricingOption): string | undefined {
  if (selectedOption.serviceType.toLowerCase().includes('10:30')) {
    return '10:30';
  } else if (selectedOption.serviceType.toLowerCase().includes('12:00')) {
    return '12:00';
  } else if (selectedOption.serviceType.toLowerCase().includes('end of day')) {
    return '17:00';
  }
  
  return undefined; // Return undefined for services without specific time commitments
}

/**
 * Calculate confidence level based on service and destination
 */
function calculateConfidenceLevel(selectedOption: PricingOption, destination: Address): 'high' | 'medium' | 'low' {
  let confidenceScore = 0.8; // Start with 80% confidence
  
  // Adjust based on service category
  if (selectedOption.category === 'air') {
    confidenceScore += 0.1; // Air services are more predictable
  } else if (selectedOption.category === 'freight') {
    confidenceScore -= 0.1; // Freight is less predictable
  }
  
  // Adjust based on destination type
  const zoneInfo = getDeliveryZoneInfo(destination);
  if (zoneInfo.zone === 'remote') {
    confidenceScore -= 0.2;
  } else if (zoneInfo.zone === 'metropolitan') {
    confidenceScore += 0.1;
  }
  
  // Adjust based on carrier reliability (simulated)
  const carrierReliability = getCarrierReliability(selectedOption.carrier);
  confidenceScore += (carrierReliability - 0.5) * 0.2;
  
  if (confidenceScore >= 0.85) return 'high';
  if (confidenceScore >= 0.7) return 'medium';
  return 'low';
}

/**
 * Generate helpful delivery notes
 */
function generateDeliveryNotes(
  selectedOption: PricingOption,
  destination: Address,
  adjustments: any
): string[] {
  const notes: string[] = [];
  
  // Service-specific notes
  if (selectedOption.serviceType.toLowerCase().includes('overnight')) {
    notes.push('Next business day delivery by 10:30 AM to most areas');
  } else if (selectedOption.serviceType.toLowerCase().includes('express')) {
    notes.push('Express delivery service with guaranteed time commitment');
  }
  
  // Destination-specific notes
  const zoneInfo = getDeliveryZoneInfo(destination);
  if (zoneInfo.zone === 'remote') {
    notes.push('Remote area - delivery may require additional time');
  } else if (zoneInfo.zone === 'rural') {
    notes.push('Rural delivery area - driver will attempt delivery during business hours');
  }
  
  // Adjustment notes
  if (adjustments.holidayAdjustment.holidaysSkipped.length > 0) {
    notes.push(`Delivery adjusted due to holiday: ${adjustments.holidayAdjustment.holidaysSkipped.join(', ')}`);
  }
  
  if (adjustments.businessDayAdjustment.adjustmentReason === 'weekend_skip') {
    notes.push('Delivery moved to next business day (weekends excluded)');
  }
  
  // Residential delivery notes
  if (destination.isResidential) {
    notes.push('Residential delivery - signature required, package left with neighbor if no one available');
  }
  
  return notes;
}

/**
 * Utility functions
 */

function isSameDayPickup(pickupDate: Date): boolean {
  const today = new Date();
  return pickupDate.toDateString() === today.toDateString();
}

function isBusinessDaysOnlyService(selectedOption: PricingOption): boolean {
  // Most services only deliver on business days, except special Saturday delivery
  return !selectedOption.features?.includes('Saturday Delivery');
}

function isSameDate(date1: Date, date2: Date): boolean {
  return date1.toDateString() === date2.toDateString();
}

function calculateActualTransitDays(pickupDate: Date, deliveryDate: Date): number {
  const timeDiff = deliveryDate.getTime() - pickupDate.getTime();
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
}

function getDeliveryZoneInfo(destination: Address): { zone: 'metropolitan' | 'rural' | 'remote'; description: string } {
  // Simulate zone classification based on destination
  const state = destination.state.toUpperCase();
  const city = destination.city.toLowerCase();
  
  // Major metropolitan areas
  const metroAreas = ['new york', 'los angeles', 'chicago', 'houston', 'phoenix', 'philadelphia', 'san antonio', 'san diego', 'dallas', 'san jose'];
  if (metroAreas.some(metro => city.includes(metro))) {
    return { zone: 'metropolitan', description: 'Major metropolitan area' };
  }
  
  // Remote states/areas
  const remoteStates = ['AK', 'HI', 'MT', 'WY', 'ND', 'SD'];
  if (remoteStates.includes(state)) {
    return { zone: 'remote', description: 'Remote geographic area' };
  }
  
  // Default to rural for other areas
  return { zone: 'rural', description: 'Rural or suburban area' };
}

function getCarrierReliability(carrier: string): number {
  // Simulate carrier reliability scores
  const reliabilityScores: Record<string, number> = {
    'UPS': 0.92,
    'FedEx': 0.90,
    'DHL': 0.88,
    'USPS': 0.85,
    'OnTrac': 0.82,
    'LaserShip': 0.80
  };
  
  return reliabilityScores[carrier] || 0.85;
}

function getHolidays(year: number): Array<{ name: string; date: Date }> {
  // Major US holidays that affect shipping
  return [
    { name: 'New Year\'s Day', date: new Date(year, 0, 1) },
    { name: 'Memorial Day', date: getMemorialDay(year) },
    { name: 'Independence Day', date: new Date(year, 6, 4) },
    { name: 'Labor Day', date: getLaborDay(year) },
    { name: 'Thanksgiving', date: getThanksgiving(year) },
    { name: 'Christmas Day', date: new Date(year, 11, 25) }
  ];
}

function getMemorialDay(year: number): Date {
  // Last Monday in May
  const date = new Date(year, 4, 31);
  while (date.getDay() !== 1) {
    date.setDate(date.getDate() - 1);
  }
  return date;
}

function getLaborDay(year: number): Date {
  // First Monday in September
  const date = new Date(year, 8, 1);
  while (date.getDay() !== 1) {
    date.setDate(date.getDate() + 1);
  }
  return date;
}

function getThanksgiving(year: number): Date {
  // Fourth Thursday in November
  const date = new Date(year, 10, 1);
  while (date.getDay() !== 4) {
    date.setDate(date.getDate() + 1);
  }
  date.setDate(date.getDate() + 21); // Add 3 weeks
  return date;
}