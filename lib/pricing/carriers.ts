/**
 * Mock Carrier System for Pricing Calculations
 * Simulates multiple carriers with distinct characteristics and pricing models
 */

import { TraceLogger } from '@/lib/api/utils/trace-logger';

export interface CarrierInfo {
  id: string;
  name: string;
  code: string;
  logo?: string;
  description: string;
  website: string;
  
  // Pricing characteristics
  basePriceMultiplier: number; // 0.85 - 1.25 range
  fuelSurchargeRange: { min: number; max: number }; // Percentage
  
  // Service capabilities
  serviceTypes: CarrierService[];
  specialFeatures: string[];
  trackingFeatures: string[];
  
  // Geographic coverage
  maxZone: number;
  internationalService: boolean;
  
  // Business model
  targetMarket: 'premium' | 'value' | 'freight' | 'eco-friendly';
  brandColor: string;
}

export interface CarrierService {
  id: string;
  name: string;
  category: 'ground' | 'air' | 'freight';
  description: string;
  
  // Transit times
  minTransitDays: number;
  maxTransitDays: number;
  
  // Service characteristics
  guaranteedDelivery: boolean;
  signatureRequired: boolean;
  trackingIncluded: boolean;
  insuranceIncluded: boolean;
  
  // Pricing modifiers
  speedMultiplier: number; // Faster = higher multiplier
  reliabilityBonus: number; // Premium for guaranteed service
  
  // Availability constraints
  maxWeight?: number; // In pounds
  minWeight?: number;
  maxZone?: number;
  weekendDelivery?: boolean;
  
  // Special features
  features: string[];
  
  // Environmental impact
  carbonFootprintMultiplier: number; // Lower = more eco-friendly
}

/**
 * Mock carrier definitions
 */
export const MOCK_CARRIERS: CarrierInfo[] = [
  {
    id: 'premium-express',
    name: 'Premium Express',
    code: 'PEX',
    description: 'Premium carrier with fastest delivery times and comprehensive tracking',
    website: 'https://premiumexpress.example.com',
    basePriceMultiplier: 1.15,
    fuelSurchargeRange: { min: 12, max: 18 },
    serviceTypes: [
      {
        id: 'pex-overnight',
        name: 'Overnight Express',
        category: 'air',
        description: 'Next business day delivery by 10:30 AM',
        minTransitDays: 1,
        maxTransitDays: 1,
        guaranteedDelivery: true,
        signatureRequired: true,
        trackingIncluded: true,
        insuranceIncluded: true,
        speedMultiplier: 2.8,
        reliabilityBonus: 0.15,
        maxWeight: 150,
        maxZone: 6,
        weekendDelivery: false,
        features: ['10:30 AM delivery', 'Money-back guarantee', 'Real-time tracking', 'Signature confirmation'],
        carbonFootprintMultiplier: 1.8
      },
      {
        id: 'pex-sameday',
        name: 'Same Day',
        category: 'air',
        description: 'Same-day delivery for urgent shipments',
        minTransitDays: 1,
        maxTransitDays: 1,
        guaranteedDelivery: true,
        signatureRequired: true,
        trackingIncluded: true,
        insuranceIncluded: true,
        speedMultiplier: 3.5,
        reliabilityBonus: 0.20,
        maxWeight: 50,
        maxZone: 2,
        weekendDelivery: true,
        features: ['Same-day delivery', 'Premium service', 'Real-time tracking', 'Guaranteed'],
        carbonFootprintMultiplier: 2.2
      },
      {
        id: 'pex-2day',
        name: '2-Day Express',
        category: 'air',
        description: 'Guaranteed 2 business day delivery',
        minTransitDays: 2,
        maxTransitDays: 2,
        guaranteedDelivery: true,
        signatureRequired: false,
        trackingIncluded: true,
        insuranceIncluded: true,
        speedMultiplier: 1.8,
        reliabilityBonus: 0.10,
        maxWeight: 500,
        maxZone: 8,
        weekendDelivery: false,
        features: ['Guaranteed delivery', 'Real-time tracking', 'Free insurance up to $100'],
        carbonFootprintMultiplier: 1.4
      },
      {
        id: 'pex-ground',
        name: 'Premium Ground',
        category: 'ground',
        description: 'Premium ground service with enhanced tracking',
        minTransitDays: 1,
        maxTransitDays: 5,
        guaranteedDelivery: false,
        signatureRequired: false,
        trackingIncluded: true,
        insuranceIncluded: false,
        speedMultiplier: 1.2,
        reliabilityBonus: 0.05,
        maxWeight: 2000,
        maxZone: 8,
        weekendDelivery: true,
        features: ['Enhanced tracking', 'Saturday delivery', 'Delivery notifications'],
        carbonFootprintMultiplier: 1.0
      }
    ],
    specialFeatures: ['Premium customer service', 'Money-back guarantee', 'Advanced tracking'],
    trackingFeatures: ['Real-time GPS', 'Delivery photos', 'SMS notifications'],
    maxZone: 8,
    internationalService: true,
    targetMarket: 'premium',
    brandColor: '#1a365d'
  },
  
  {
    id: 'value-logistics',
    name: 'Value Logistics',
    code: 'VLG',
    description: 'Competitive pricing with reliable service for cost-conscious businesses',
    website: 'https://valuelogistics.example.com',
    basePriceMultiplier: 0.88,
    fuelSurchargeRange: { min: 8, max: 14 },
    serviceTypes: [
      {
        id: 'vlg-express',
        name: 'Express Saver',
        category: 'air',
        description: 'Fast delivery at competitive rates',
        minTransitDays: 1,
        maxTransitDays: 3,
        guaranteedDelivery: false,
        signatureRequired: false,
        trackingIncluded: true,
        insuranceIncluded: false,
        speedMultiplier: 1.5,
        reliabilityBonus: 0.03,
        maxWeight: 300,
        maxZone: 7,
        weekendDelivery: false,
        features: ['Competitive pricing', 'Basic tracking', 'Business delivery'],
        carbonFootprintMultiplier: 1.3
      },
      {
        id: 'vlg-2day',
        name: '2-Day Select',
        category: 'air',
        description: '2-day air service at value pricing',
        minTransitDays: 2,
        maxTransitDays: 2,
        guaranteedDelivery: false,
        signatureRequired: false,
        trackingIncluded: true,
        insuranceIncluded: false,
        speedMultiplier: 1.7,
        reliabilityBonus: 0.04,
        maxWeight: 250,
        maxZone: 8,
        weekendDelivery: false,
        features: ['2-day delivery', 'Value pricing', 'Basic tracking'],
        carbonFootprintMultiplier: 1.4
      },
      {
        id: 'vlg-ground',
        name: 'Ground Standard',
        category: 'ground',
        description: 'Reliable ground shipping at great value',
        minTransitDays: 2,
        maxTransitDays: 7,
        guaranteedDelivery: false,
        signatureRequired: false,
        trackingIncluded: true,
        insuranceIncluded: false,
        speedMultiplier: 1.0,
        reliabilityBonus: 0.02,
        maxWeight: 1500,
        maxZone: 8,
        weekendDelivery: false,
        features: ['Low cost', 'Reliable delivery', 'Basic tracking'],
        carbonFootprintMultiplier: 0.9
      },
      {
        id: 'vlg-economy',
        name: 'Economy Ground',
        category: 'ground',
        description: 'Most affordable shipping option',
        minTransitDays: 3,
        maxTransitDays: 8,
        guaranteedDelivery: false,
        signatureRequired: false,
        trackingIncluded: true,
        insuranceIncluded: false,
        speedMultiplier: 0.8,
        reliabilityBonus: 0.00,
        maxWeight: 1000,
        maxZone: 8,
        weekendDelivery: false,
        features: ['Lowest cost', 'Extended transit', 'Basic tracking'],
        carbonFootprintMultiplier: 0.8
      }
    ],
    specialFeatures: ['Bulk discounts', 'Extended delivery windows', 'Cost optimization'],
    trackingFeatures: ['Basic tracking', 'Delivery confirmation'],
    maxZone: 8,
    internationalService: false,
    targetMarket: 'value',
    brandColor: '#2d3748'
  },
  
  {
    id: 'freight-specialists',
    name: 'Freight Specialists',
    code: 'FSP',
    description: 'Specialized in large shipments and freight logistics',
    website: 'https://freightspecialists.example.com',
    basePriceMultiplier: 0.92,
    fuelSurchargeRange: { min: 10, max: 16 },
    serviceTypes: [
      {
        id: 'fsp-ltl-standard',
        name: 'LTL Standard',
        category: 'freight',
        description: 'Less-than-truckload standard service',
        minTransitDays: 3,
        maxTransitDays: 7,
        guaranteedDelivery: false,
        signatureRequired: true,
        trackingIncluded: true,
        insuranceIncluded: true,
        speedMultiplier: 1.1,
        reliabilityBonus: 0.05,
        minWeight: 150,
        maxWeight: 10000,
        maxZone: 8,
        weekendDelivery: false,
        features: ['Freight expertise', 'Liftgate service', 'Inside delivery options'],
        carbonFootprintMultiplier: 0.7
      },
      {
        id: 'fsp-ltl-expedited',
        name: 'LTL Expedited',
        category: 'freight',
        description: 'Faster freight service for urgent shipments',
        minTransitDays: 1,
        maxTransitDays: 4,
        guaranteedDelivery: true,
        signatureRequired: true,
        trackingIncluded: true,
        insuranceIncluded: true,
        speedMultiplier: 1.6,
        reliabilityBonus: 0.08,
        minWeight: 150,
        maxWeight: 8000,
        maxZone: 6,
        weekendDelivery: false,
        features: ['Expedited delivery', 'Guaranteed service', 'White glove available'],
        carbonFootprintMultiplier: 1.1
      },
      {
        id: 'fsp-ftl',
        name: 'Full Truckload',
        category: 'freight',
        description: 'Dedicated truck for large shipments',
        minTransitDays: 1,
        maxTransitDays: 3,
        guaranteedDelivery: true,
        signatureRequired: true,
        trackingIncluded: true,
        insuranceIncluded: true,
        speedMultiplier: 1.4,
        reliabilityBonus: 0.10,
        minWeight: 5000,
        maxWeight: 40000,
        maxZone: 8,
        weekendDelivery: true,
        features: ['Dedicated truck', 'Fastest freight', 'Premium service'],
        carbonFootprintMultiplier: 0.9
      }
    ],
    specialFeatures: ['Freight expertise', 'Equipment availability', 'White glove service'],
    trackingFeatures: ['Real-time tracking', 'GPS monitoring', 'Driver communication'],
    maxZone: 8,
    internationalService: true,
    targetMarket: 'freight',
    brandColor: '#742a2a'
  },
  
  {
    id: 'eco-transport',
    name: 'EcoTransport',
    code: 'ECO',
    description: 'Carbon-neutral shipping with sustainability focus',
    website: 'https://ecotransport.example.com',
    basePriceMultiplier: 1.05,
    fuelSurchargeRange: { min: 6, max: 12 },
    serviceTypes: [
      {
        id: 'eco-green-ground',
        name: 'Green Ground',
        category: 'ground',
        description: 'Carbon-neutral ground shipping',
        minTransitDays: 2,
        maxTransitDays: 6,
        guaranteedDelivery: false,
        signatureRequired: false,
        trackingIncluded: true,
        insuranceIncluded: false,
        speedMultiplier: 1.0,
        reliabilityBonus: 0.03,
        maxWeight: 1200,
        maxZone: 8,
        weekendDelivery: false,
        features: ['Carbon neutral', 'Sustainable packaging', 'Tree planting program'],
        carbonFootprintMultiplier: 0.0
      },
      {
        id: 'eco-hybrid-express',
        name: 'Hybrid Express',
        category: 'air',
        description: 'Fast delivery with reduced emissions',
        minTransitDays: 1,
        maxTransitDays: 3,
        guaranteedDelivery: false,
        signatureRequired: false,
        trackingIncluded: true,
        insuranceIncluded: false,
        speedMultiplier: 1.6,
        reliabilityBonus: 0.05,
        maxWeight: 200,
        maxZone: 6,
        weekendDelivery: false,
        features: ['Reduced emissions', 'Sustainable fuel', 'Carbon offsetting'],
        carbonFootprintMultiplier: 0.5
      },
      {
        id: 'eco-freight',
        name: 'Eco Freight',
        category: 'freight',
        description: 'Carbon-neutral freight service for larger shipments',
        minTransitDays: 2,
        maxTransitDays: 5,
        guaranteedDelivery: false,
        signatureRequired: true,
        trackingIncluded: true,
        insuranceIncluded: false,
        speedMultiplier: 1.2,
        reliabilityBonus: 0.04,
        minWeight: 100,
        maxWeight: 3000,
        maxZone: 8,
        weekendDelivery: false,
        features: ['Carbon neutral', 'Eco-friendly freight', 'Green transportation'],
        carbonFootprintMultiplier: 0.3
      }
    ],
    specialFeatures: ['Carbon offsetting', 'Sustainable packaging', 'Environmental reporting'],
    trackingFeatures: ['Eco-impact tracking', 'Carbon footprint reports'],
    maxZone: 8,
    internationalService: false,
    targetMarket: 'eco-friendly',
    brandColor: '#276749'
  }
];

/**
 * Get carrier by ID
 */
export function getCarrierById(carrierId: string): CarrierInfo | undefined {
  return MOCK_CARRIERS.find(carrier => carrier.id === carrierId);
}

/**
 * Get all available carriers
 */
export function getAllCarriers(): CarrierInfo[] {
  return MOCK_CARRIERS;
}

/**
 * Get carriers by target market
 */
export function getCarriersByMarket(market: CarrierInfo['targetMarket']): CarrierInfo[] {
  return MOCK_CARRIERS.filter(carrier => carrier.targetMarket === market);
}

/**
 * Get service by carrier and service ID
 */
export function getCarrierService(carrierId: string, serviceId: string): CarrierService | undefined {
  const carrier = getCarrierById(carrierId);
  return carrier?.serviceTypes.find(service => service.id === serviceId);
}

/**
 * Check if carrier serves a specific zone
 */
export function isCarrierAvailableForZone(carrierId: string, zone: number): boolean {
  const carrier = getCarrierById(carrierId);
  return carrier ? zone <= carrier.maxZone : false;
}

/**
 * Check if service is available for given parameters
 */
export function isServiceAvailable(
  carrierId: string,
  serviceId: string,
  weight: number,
  zone: number,
  logger?: TraceLogger
): boolean {
  logger?.log('debug', 'checking_service_availability', { carrierId, serviceId, weight, zone });
  
  const carrier = getCarrierById(carrierId);
  if (!carrier) {
    logger?.log('warn', 'carrier_not_found', { carrierId });
    return false;
  }
  
  if (zone > carrier.maxZone) {
    logger?.log('debug', 'zone_not_served', { carrierId, zone, maxZone: carrier.maxZone });
    return false;
  }
  
  const service = getCarrierService(carrierId, serviceId);
  if (!service) {
    logger?.log('warn', 'service_not_found', { carrierId, serviceId });
    return false;
  }
  
  // Check weight constraints
  if (service.minWeight && weight < service.minWeight) {
    logger?.log('debug', 'weight_below_minimum', { weight, minWeight: service.minWeight });
    return false;
  }
  
  if (service.maxWeight && weight > service.maxWeight) {
    logger?.log('debug', 'weight_above_maximum', { weight, maxWeight: service.maxWeight });
    return false;
  }
  
  // Check zone constraints
  if (service.maxZone && zone > service.maxZone) {
    logger?.log('debug', 'service_zone_not_available', { zone, maxZone: service.maxZone });
    return false;
  }
  
  logger?.log('debug', 'service_available', { carrierId, serviceId, weight, zone });
  return true;
}

/**
 * Get available services for given parameters
 */
export function getAvailableServices(
  weight: number,
  zone: number,
  category?: 'ground' | 'air' | 'freight',
  logger?: TraceLogger
): Array<{ carrier: CarrierInfo; service: CarrierService }> {
  const availableServices: Array<{ carrier: CarrierInfo; service: CarrierService }> = [];
  
  for (const carrier of MOCK_CARRIERS) {
    if (zone > carrier.maxZone) continue;
    
    for (const service of carrier.serviceTypes) {
      if (category && service.category !== category) continue;
      
      if (isServiceAvailable(carrier.id, service.id, weight, zone, logger)) {
        availableServices.push({ carrier, service });
      }
    }
  }
  
  logger?.log('debug', 'available_services_found', { 
    count: availableServices.length, 
    weight, 
    zone, 
    category 
  });
  
  return availableServices;
}
