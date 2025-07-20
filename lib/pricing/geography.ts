/**
 * Geographic Utilities for Pricing Calculations
 * Provides distance calculation and zone mapping for shipping quotes
 */

import { TraceLogger } from '@/lib/api/utils/trace-logger';

/**
 * ZIP code coordinate data for distance calculations
 * In production, this would be a comprehensive database
 */
const ZIP_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // Major US Cities
  '10001': { lat: 40.7489, lng: -73.9972 }, // New York, NY
  '90210': { lat: 34.0901, lng: -118.4065 }, // Beverly Hills, CA
  '60601': { lat: 41.8825, lng: -87.6441 }, // Chicago, IL
  '30301': { lat: 33.7537, lng: -84.3863 }, // Atlanta, GA
  '75201': { lat: 32.7767, lng: -96.7970 }, // Dallas, TX
  '98101': { lat: 47.6097, lng: -122.3331 }, // Seattle, WA
  '33101': { lat: 25.7743, lng: -80.1937 }, // Miami, FL
  '80201': { lat: 39.7392, lng: -104.9903 }, // Denver, CO
  '02101': { lat: 42.3601, lng: -71.0589 }, // Boston, MA
  '19101': { lat: 39.9526, lng: -75.1652 }, // Philadelphia, PA
  '48201': { lat: 42.3314, lng: -83.0458 }, // Detroit, MI
  '55401': { lat: 44.9778, lng: -93.2650 }, // Minneapolis, MN
  '77001': { lat: 29.7604, lng: -95.3698 }, // Houston, TX
  '85001': { lat: 33.4484, lng: -112.0740 }, // Phoenix, AZ
  '94101': { lat: 37.7749, lng: -122.4194 }, // San Francisco, CA
  '20001': { lat: 38.9072, lng: -77.0369 }, // Washington, DC
  '89101': { lat: 36.1699, lng: -115.1398 }, // Las Vegas, NV
  '97201': { lat: 45.5152, lng: -122.6784 }, // Portland, OR
  '63101': { lat: 38.6270, lng: -90.1994 }, // St. Louis, MO
  '28201': { lat: 35.2271, lng: -80.8431 }, // Charlotte, NC
  
  // Canadian Cities
  'M5H 2N2': { lat: 43.6532, lng: -79.3832 }, // Toronto, ON
  'H2Y 1C6': { lat: 45.5017, lng: -73.5673 }, // Montreal, QC
  'V6B 1A1': { lat: 49.2827, lng: -123.1207 }, // Vancouver, BC
  'T2P 1J9': { lat: 51.0447, lng: -114.0719 }, // Calgary, AB
  'S7K 0J5': { lat: 52.1332, lng: -106.6700 }, // Saskatoon, SK
  'R3C 0V8': { lat: 49.8951, lng: -97.1384 }, // Winnipeg, MB
  'K1A 0A6': { lat: 45.4215, lng: -75.6972 }, // Ottawa, ON
  'G1R 2J6': { lat: 46.8139, lng: -71.2080 }, // Quebec City, QC
  'B3H 3C3': { lat: 44.6488, lng: -63.5752 }, // Halifax, NS
  'A1B 3X2': { lat: 47.5615, lng: -52.7126 }, // St. John's, NL
  
  // Mexican Cities
  '06000': { lat: 19.4326, lng: -99.1332 }, // Mexico City
  '44100': { lat: 20.6597, lng: -103.3496 }, // Guadalajara
  '64000': { lat: 25.6866, lng: -100.3161 }, // Monterrey
  '21000': { lat: 32.5027, lng: -117.0037 }, // Tijuana
  '22000': { lat: 32.5027, lng: -117.0037 }, // Tijuana
  '80000': { lat: 25.7923, lng: -108.9857 }, // Culiacán
  '20000': { lat: 20.9674, lng: -89.5926 }, // Mérida
  '97000': { lat: 20.9674, lng: -89.5926 }, // Mérida
};

/**
 * Shipping zones based on distance ranges
 * Used for zone-based pricing calculations
 */
export const SHIPPING_ZONES = {
  1: { minMiles: 0, maxMiles: 150, multiplier: 1.0 },
  2: { minMiles: 151, maxMiles: 300, multiplier: 1.2 },
  3: { minMiles: 301, maxMiles: 600, multiplier: 1.4 },
  4: { minMiles: 601, maxMiles: 1000, multiplier: 1.6 },
  5: { minMiles: 1001, maxMiles: 1400, multiplier: 1.8 },
  6: { minMiles: 1401, maxMiles: 1800, multiplier: 2.0 },
  7: { minMiles: 1801, maxMiles: 2400, multiplier: 2.3 },
  8: { minMiles: 2401, maxMiles: 9999, multiplier: 2.6 }
} as const;

/**
 * Calculate distance between two ZIP codes using Haversine formula
 */
export function calculateDistance(originZip: string, destinationZip: string, logger?: TraceLogger): number {
  logger?.log('debug', 'calculating_distance', { originZip, destinationZip });
  
  try {
    const origin = getCoordinates(originZip);
    const destination = getCoordinates(destinationZip);
    
    if (!origin || !destination) {
      logger?.log('warn', 'missing_coordinates', { originZip, destinationZip });
      // Fallback to approximate distance based on ZIP code difference
      return estimateDistanceFromZipDifference(originZip, destinationZip);
    }
    
    const distance = haversineDistance(origin, destination);
    logger?.log('debug', 'distance_calculated', { distance });
    
    return Math.round(distance);
  } catch (error) {
    logger?.log('error', 'distance_calculation_failed', { error, originZip, destinationZip });
    // Return reasonable fallback distance
    return 500;
  }
}

/**
 * Get coordinates for a ZIP code
 */
function getCoordinates(zip: string): { lat: number; lng: number } | null {
  // Clean ZIP code (remove spaces, hyphens)
  const cleanZip = zip.replace(/[\s-]/g, '');
  
  // Check exact match first
  if (ZIP_COORDINATES[cleanZip]) {
    return ZIP_COORDINATES[cleanZip];
  }
  
  // For US ZIP codes, try 5-digit version
  if (cleanZip.length > 5 && /^\d+$/.test(cleanZip)) {
    const fiveDigit = cleanZip.substring(0, 5);
    if (ZIP_COORDINATES[fiveDigit]) {
      return ZIP_COORDINATES[fiveDigit];
    }
  }
  
  return null;
}

/**
 * Calculate distance using Haversine formula
 */
function haversineDistance(coord1: { lat: number; lng: number }, coord2: { lat: number; lng: number }): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(coord2.lat - coord1.lat);
  const dLng = toRadians(coord2.lng - coord1.lng);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.lat)) * Math.cos(toRadians(coord2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Fallback distance estimation based on ZIP code numerical difference
 */
function estimateDistanceFromZipDifference(zip1: string, zip2: string): number {
  // Extract numeric parts
  const num1 = parseInt(zip1.replace(/\D/g, ''), 10) || 0;
  const num2 = parseInt(zip2.replace(/\D/g, ''), 10) || 0;
  
  const difference = Math.abs(num1 - num2);
  
  // Rough estimation: each 1000 ZIP difference ≈ 100 miles
  const estimatedDistance = Math.min(difference / 10, 3000);
  
  return Math.max(estimatedDistance, 50); // Minimum 50 miles
}

/**
 * Determine shipping zone based on distance
 */
export function getShippingZone(distance: number): number {
  for (const [zone, range] of Object.entries(SHIPPING_ZONES)) {
    if (distance >= range.minMiles && distance <= range.maxMiles) {
      return parseInt(zone);
    }
  }
  return 8; // Default to highest zone
}

/**
 * Get zone multiplier for pricing calculations
 */
export function getZoneMultiplier(zone: number): number {
  return SHIPPING_ZONES[zone as keyof typeof SHIPPING_ZONES]?.multiplier || 2.6;
}

/**
 * Validate ZIP code format
 */
export function validateZipCode(zip: string, country: string): boolean {
  const cleanZip = zip.replace(/[\s-]/g, '');
  
  switch (country.toUpperCase()) {
    case 'US':
      return /^\d{5}(\d{4})?$/.test(cleanZip);
    case 'CA':
      return /^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(cleanZip.toUpperCase());
    case 'MX':
      return /^\d{5}$/.test(cleanZip);
    default:
      return cleanZip.length >= 3 && cleanZip.length <= 10;
  }
}

/**
 * Check if shipping zone is valid for service type
 */
export function isZoneValidForService(zone: number, serviceType: string): boolean {
  // Some services may have zone restrictions
  switch (serviceType) {
    case 'overnight':
      return zone <= 6; // Overnight not available for zones 7-8
    case 'same-day':
      return zone <= 2; // Same-day only for local zones
    default:
      return true;
  }
}
