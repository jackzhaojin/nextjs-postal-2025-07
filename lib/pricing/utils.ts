/**
 * Pricing Utilities for Shipping Calculations
 * Shared utility functions for pricing calculations and validations
 */

import { PackageInfo, Dimensions, Weight, SpecialHandlingType } from '@/lib/types';
import { TraceLogger } from '@/lib/api/utils/trace-logger';

/**
 * Calculate dimensional weight using standard 166 divisor
 */
export function calculateDimensionalWeight(dimensions: Dimensions): number {
  // Convert dimensions to inches if needed
  let length = dimensions.length;
  let width = dimensions.width;
  let height = dimensions.height;
  
  if (dimensions.unit === 'cm') {
    length = length / 2.54;
    width = width / 2.54;
    height = height / 2.54;
  }
  
  // Calculate cubic inches
  const cubicInches = length * width * height;
  
  // Standard dimensional weight divisor for domestic shipping
  const dimensionalWeight = cubicInches / 166;
  
  return Math.ceil(dimensionalWeight);
}

/**
 * Get billable weight (higher of actual weight vs dimensional weight)
 */
export function getBillableWeight(packageInfo: PackageInfo, logger?: TraceLogger): number {
  let actualWeight = packageInfo.weight.value;
  
  // Convert to pounds if needed
  if (packageInfo.weight.unit === 'kg') {
    actualWeight = actualWeight * 2.20462;
  }
  
  const dimensionalWeight = calculateDimensionalWeight(packageInfo.dimensions);
  const billableWeight = Math.max(actualWeight, dimensionalWeight);
  
  logger?.log('debug', 'billable_weight_calculated', {
    actualWeight,
    dimensionalWeight,
    billableWeight,
    unit: 'lbs'
  });
  
  return billableWeight;
}

/**
 * Calculate package type multiplier based on handling complexity
 */
export function getPackageTypeMultiplier(packageType: string): number {
  const multipliers: Record<string, number> = {
    'envelope': 0.8,     // Easiest to handle
    'small': 1.0,        // Standard baseline
    'medium': 1.1,       // Slightly more complex
    'large': 1.2,        // Requires more careful handling
    'pallet': 1.4,       // Requires special equipment
    'crate': 1.5,        // Heavy/bulky handling
    'multiple': 1.3      // Multiple piece coordination
  };
  
  return multipliers[packageType] || 1.0;
}

/**
 * Calculate location type surcharge
 */
export function getLocationSurcharge(
  isOriginResidential: boolean,
  isDestinationResidential: boolean,
  baseRate: number
): number {
  let surcharge = 0;
  
  // Residential pickup surcharge
  if (isOriginResidential) {
    surcharge += Math.max(baseRate * 0.08, 12); // 8% or $12 minimum
  }
  
  // Residential delivery surcharge
  if (isDestinationResidential) {
    surcharge += Math.max(baseRate * 0.08, 12); // 8% or $12 minimum
  }
  
  return surcharge;
}

/**
 * Calculate special handling fees
 */
export function calculateSpecialHandlingFees(
  specialHandling: SpecialHandlingType[],
  packageValue: number,
  baseRate: number,
  logger?: TraceLogger
): number {
  const fees: Record<SpecialHandlingType, (value: number, rate: number) => number> = {
    'fragile': () => 15,
    'this-side-up': () => 5,
    'temperature-controlled': (value, rate) => Math.max(75, rate * 0.15),
    'hazmat': (value, rate) => Math.max(50, rate * 0.12),
    'white-glove': (value, rate) => Math.max(125, rate * 0.25),
    'inside-delivery': () => 45,
    'liftgate-pickup': () => 35,
    'liftgate-delivery': () => 35
  };
  
  let totalFees = 0;
  
  for (const handling of specialHandling) {
    const fee = fees[handling]?.(packageValue, baseRate) || 0;
    totalFees += fee;
    
    logger?.log('debug', 'special_handling_fee', {
      type: handling,
      fee,
      packageValue,
      baseRate
    });
  }
  
  logger?.log('debug', 'total_special_handling_fees', {
    totalFees,
    handlingTypes: specialHandling
  });
  
  return totalFees;
}

/**
 * Calculate insurance fee based on declared value
 */
export function calculateInsuranceFee(declaredValue: number, logger?: TraceLogger): {
  fee: number;
  percentage: number;
} {
  let percentage: number;
  
  // Tiered insurance rates based on value
  if (declaredValue <= 100) {
    percentage = 0; // Free up to $100
  } else if (declaredValue <= 1000) {
    percentage = 0.5; // 0.5% for $100-$1000
  } else if (declaredValue <= 5000) {
    percentage = 0.75; // 0.75% for $1000-$5000
  } else if (declaredValue <= 25000) {
    percentage = 1.0; // 1.0% for $5000-$25000
  } else {
    percentage = 1.5; // 1.5% for over $25000
  }
  
  const fee = Math.max((declaredValue * percentage) / 100, declaredValue > 100 ? 5 : 0);
  
  logger?.log('debug', 'insurance_calculated', {
    declaredValue,
    percentage,
    fee
  });
  
  return { fee, percentage };
}

/**
 * Calculate fuel surcharge
 */
export function calculateFuelSurcharge(
  baseRate: number,
  fuelSurchargePercentage: number,
  logger?: TraceLogger
): number {
  const fuelSurcharge = baseRate * (fuelSurchargePercentage / 100);
  
  logger?.log('debug', 'fuel_surcharge_calculated', {
    baseRate,
    fuelSurchargePercentage,
    fuelSurcharge
  });
  
  return fuelSurcharge;
}

/**
 * Calculate delivery confirmation fees
 */
export function calculateDeliveryConfirmationFee(
  signatureRequired: boolean,
  adultSignatureRequired: boolean,
  serviceLevel: string,
  logger?: TraceLogger
): number {
  let fee = 0;
  
  if (adultSignatureRequired) {
    fee = 15; // Adult signature is premium
  } else if (signatureRequired) {
    fee = 8; // Standard signature
  } else if (serviceLevel === 'premium') {
    fee = 5; // Delivery confirmation for premium services
  }
  
  logger?.log('debug', 'delivery_confirmation_fee', {
    signatureRequired,
    adultSignatureRequired,
    serviceLevel,
    fee
  });
  
  return fee;
}

/**
 * Calculate tax amount
 */
export function calculateTax(
  subtotal: number,
  taxPercentage: number = 8.5,
  logger?: TraceLogger
): number {
  const tax = subtotal * (taxPercentage / 100);
  
  logger?.log('debug', 'tax_calculated', {
    subtotal,
    taxPercentage,
    tax
  });
  
  return tax;
}

/**
 * Generate realistic base rate using zone and weight factors
 */
export function calculateBaseRate(
  weight: number,
  distance: number,
  zone: number,
  packageType: string,
  logger?: TraceLogger
): number {
  // Base rate factors
  const baseRatePerPound = 0.85;
  const baseRatePerMile = 0.012;
  const zoneMultiplier = 1 + (zone - 1) * 0.15; // Increases with zone
  const packageMultiplier = getPackageTypeMultiplier(packageType);
  
  // Calculate base components
  const weightComponent = weight * baseRatePerPound;
  const distanceComponent = distance * baseRatePerMile;
  const minimumRate = 8.50; // Minimum shipping rate
  
  // Combine factors
  let baseRate = (weightComponent + distanceComponent) * zoneMultiplier * packageMultiplier;
  baseRate = Math.max(baseRate, minimumRate);
  
  // Add some realistic variance (±5%)
  const variance = (Math.random() - 0.5) * 0.1;
  baseRate = baseRate * (1 + variance);
  
  logger?.log('debug', 'base_rate_calculated', {
    weight,
    distance,
    zone,
    packageType,
    weightComponent,
    distanceComponent,
    zoneMultiplier,
    packageMultiplier,
    baseRate: Math.round(baseRate * 100) / 100
  });
  
  return Math.round(baseRate * 100) / 100;
}

/**
 * Calculate carbon footprint in kg CO2
 */
export function calculateCarbonFootprint(
  weight: number,
  distance: number,
  serviceType: string,
  carbonMultiplier: number = 1.0,
  logger?: TraceLogger
): number {
  // Base emissions factors (kg CO2 per pound per mile)
  const emissionFactors: Record<string, number> = {
    'ground': 0.0002,    // Most efficient
    'air': 0.0008,       // Higher due to air transport
    'freight': 0.0001,   // Efficient for large shipments
    'overnight': 0.0012, // Highest due to expedited air
  };
  
  const category = serviceType.includes('overnight') ? 'overnight' :
                  serviceType.includes('air') || serviceType.includes('express') ? 'air' :
                  serviceType.includes('freight') || serviceType.includes('ltl') ? 'freight' : 'ground';
  
  const baseFactor = emissionFactors[category] || emissionFactors.ground;
  const carbonFootprint = weight * distance * baseFactor * carbonMultiplier;
  
  logger?.log('debug', 'carbon_footprint_calculated', {
    weight,
    distance,
    serviceType,
    category,
    baseFactor,
    carbonMultiplier,
    carbonFootprint
  });
  
  return Math.round(carbonFootprint * 100) / 100;
}

/**
 * Get daily fuel surcharge percentage (simulates market volatility)
 */
export function getDailyFuelSurcharge(baseMin: number, baseMax: number): number {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  
  // Use day of year as seed for consistent daily rates
  const seedValue = (dayOfYear * 9301 + 49297) % 233280;
  const randomValue = seedValue / 233280;
  
  // Generate percentage within range
  const percentage = baseMin + (randomValue * (baseMax - baseMin));
  
  return Math.round(percentage * 10) / 10; // Round to 1 decimal
}

/**
 * Validate package dimensions and weight consistency
 */
export function validatePackageConsistency(packageInfo: PackageInfo): {
  isValid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  let isValid = true;
  
  const billableWeight = getBillableWeight(packageInfo);
  const actualWeight = packageInfo.weight.unit === 'kg' 
    ? packageInfo.weight.value * 2.20462 
    : packageInfo.weight.value;
  
  // Check if dimensional weight is significantly higher than actual weight
  if (billableWeight > actualWeight * 1.5) {
    warnings.push('Package may be oversized for its weight. Consider optimizing packaging.');
  }
  
  // Check package type vs dimensions
  const volume = packageInfo.dimensions.length * packageInfo.dimensions.width * packageInfo.dimensions.height;
  const maxDimension = Math.max(packageInfo.dimensions.length, packageInfo.dimensions.width, packageInfo.dimensions.height);
  
  if (packageInfo.type === 'envelope' && (maxDimension > 12 || volume > 100)) {
    warnings.push('Package dimensions exceed envelope limits.');
    isValid = false;
  }
  
  if (packageInfo.type === 'small' && volume > 5000) {
    warnings.push('Package dimensions may exceed small package limits.');
  }
  
  // Check declared value reasonableness
  if (packageInfo.declaredValue < 1) {
    warnings.push('Declared value seems unusually low.');
  }
  
  if (packageInfo.declaredValue > actualWeight * 1000) {
    warnings.push('Declared value seems unusually high for package weight.');
  }
  
  return { isValid, warnings };
}

/**
 * Round currency amounts to appropriate precision
 */
export function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return formatter.format(amount);
}
