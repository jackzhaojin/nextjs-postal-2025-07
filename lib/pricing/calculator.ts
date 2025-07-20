/**
 * Pricing Calculator Engine
 * Core mathematical pricing logic for shipping quotes
 */

import { ShipmentDetails, PricingOption, PricingBreakdown } from '@/lib/types';
import { TraceLogger } from '@/lib/api/utils/trace-logger';
import { calculateDistance, getShippingZone, getZoneMultiplier } from './geography';
import { getAvailableServices, CarrierInfo, CarrierService } from './carriers';
import {
  getBillableWeight,
  calculateBaseRate,
  calculateSpecialHandlingFees,
  calculateInsuranceFee,
  calculateFuelSurcharge,
  calculateDeliveryConfirmationFee,
  calculateTax,
  calculateCarbonFootprint,
  getDailyFuelSurcharge,
  getLocationSurcharge,
  roundCurrency,
  validatePackageConsistency
} from './utils';

export interface QuoteCalculationInput {
  shipmentDetails: ShipmentDetails;
  requestId: string;
}

export interface QuoteCalculationResult {
  quotes: {
    ground: PricingOption[];
    air: PricingOption[];
    freight: PricingOption[];
  };
  calculationMetrics: {
    distance: number;
    zone: number;
    billableWeight: number;
    baseCalculationTime: number;
    totalCalculationTime: number;
    quotesGenerated: number;
  };
  warnings: string[];
}

/**
 * Main pricing calculation engine
 */
export class PricingCalculator {
  private logger: TraceLogger;
  
  constructor(logger: TraceLogger) {
    this.logger = logger;
  }
  
  /**
   * Calculate shipping quotes for all available services
   */
  async calculateQuotes(input: QuoteCalculationInput): Promise<QuoteCalculationResult> {
    const startTime = performance.now();
    const spanId = this.logger.startSpan('calculate_quotes', {
      requestId: input.requestId,
      origin: input.shipmentDetails.origin.zip,
      destination: input.shipmentDetails.destination.zip
    });
    
    try {
      // Validate package consistency
      const validation = validatePackageConsistency(input.shipmentDetails.package);
      const warnings = validation.warnings;
      
      if (!validation.isValid) {
        throw new Error(`Package validation failed: ${warnings.join(', ')}`);
      }
      
      // Calculate core metrics
      const distance = calculateDistance(
        input.shipmentDetails.origin.zip,
        input.shipmentDetails.destination.zip,
        this.logger
      );
      
      const zone = getShippingZone(distance);
      const billableWeight = getBillableWeight(input.shipmentDetails.package, this.logger);
      
      this.logger.log('info', 'core_metrics_calculated', {
        distance,
        zone,
        billableWeight,
        originZip: input.shipmentDetails.origin.zip,
        destinationZip: input.shipmentDetails.destination.zip
      });
      
      // Get available services
      const availableServices = getAvailableServices(billableWeight, zone, undefined, this.logger);
      
      if (availableServices.length === 0) {
        this.logger.log('warn', 'no_services_available', { billableWeight, zone });
        throw new Error('No shipping services available for this route and package size');
      }
      
      // Calculate quotes for each service
      const allQuotes: PricingOption[] = [];
      
      for (const { carrier, service } of availableServices) {
        try {
          const quote = await this.calculateServiceQuote(
            input.shipmentDetails,
            carrier,
            service,
            distance,
            zone,
            billableWeight
          );
          
          if (quote) {
            allQuotes.push(quote);
          }
        } catch (error) {
          this.logger.log('warn', 'service_quote_failed', {
            carrierId: carrier.id,
            serviceId: service.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
      
      // Categorize quotes
      const categorizedQuotes = this.categorizeQuotes(allQuotes);
      
      const endTime = performance.now();
      const totalCalculationTime = endTime - startTime;
      
      this.logger.log('info', 'quotes_calculated', {
        totalQuotes: allQuotes.length,
        ground: categorizedQuotes.ground.length,
        air: categorizedQuotes.air.length,
        freight: categorizedQuotes.freight.length,
        calculationTime: totalCalculationTime
      });
      
      return {
        quotes: categorizedQuotes,
        calculationMetrics: {
          distance,
          zone,
          billableWeight,
          baseCalculationTime: totalCalculationTime,
          totalCalculationTime,
          quotesGenerated: allQuotes.length
        },
        warnings
      };
      
    } catch (error) {
      this.logger.log('error', 'quote_calculation_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId: input.requestId
      });
      throw error;
    } finally {
      this.logger.endSpan(spanId);
    }
  }
  
  /**
   * Calculate quote for a specific service
   */
  private async calculateServiceQuote(
    shipmentDetails: ShipmentDetails,
    carrier: CarrierInfo,
    service: CarrierService,
    distance: number,
    zone: number,
    billableWeight: number
  ): Promise<PricingOption | null> {
    const quoteSpanId = this.logger.startSpan('calculate_service_quote', {
      carrierId: carrier.id,
      serviceId: service.id
    });
    
    try {
      // Calculate base rate
      const baseRate = calculateBaseRate(
        billableWeight,
        distance,
        zone,
        shipmentDetails.package.type,
        this.logger
      );
      
      // Apply carrier and service multipliers
      const carrierAdjustedRate = baseRate * carrier.basePriceMultiplier;
      const serviceAdjustedRate = carrierAdjustedRate * service.speedMultiplier;
      const reliabilityAdjustment = serviceAdjustedRate * service.reliabilityBonus;
      const adjustedBaseRate = serviceAdjustedRate + reliabilityAdjustment;
      
      // Calculate fuel surcharge
      const dailyFuelSurcharge = getDailyFuelSurcharge(
        carrier.fuelSurchargeRange.min,
        carrier.fuelSurchargeRange.max
      );
      const fuelSurcharge = calculateFuelSurcharge(adjustedBaseRate, dailyFuelSurcharge, this.logger);
      
      // Calculate insurance
      const insuranceCalc = calculateInsuranceFee(shipmentDetails.package.declaredValue, this.logger);
      
      // Calculate special handling fees
      const specialHandlingFees = calculateSpecialHandlingFees(
        shipmentDetails.package.specialHandling,
        shipmentDetails.package.declaredValue,
        adjustedBaseRate,
        this.logger
      );
      
      // Calculate delivery confirmation
      const deliveryConfirmationFee = calculateDeliveryConfirmationFee(
        shipmentDetails.deliveryPreferences.signatureRequired,
        shipmentDetails.deliveryPreferences.adultSignatureRequired,
        service.guaranteedDelivery ? 'premium' : 'standard',
        this.logger
      );
      
      // Calculate location surcharges
      const locationSurcharge = getLocationSurcharge(
        shipmentDetails.origin.isResidential,
        shipmentDetails.destination.isResidential,
        adjustedBaseRate
      );
      
      // Calculate subtotal and taxes
      const subtotal = adjustedBaseRate + fuelSurcharge + locationSurcharge;
      const taxes = calculateTax(subtotal, 8.5, this.logger);
      
      // Calculate total
      const total = subtotal + insuranceCalc.fee + specialHandlingFees + deliveryConfirmationFee + taxes;
      
      // Calculate carbon footprint
      const carbonFootprint = calculateCarbonFootprint(
        billableWeight,
        distance,
        service.id,
        service.carbonFootprintMultiplier,
        this.logger
      );
      
      // Generate estimated delivery date
      const estimatedDelivery = this.calculateEstimatedDelivery(service.minTransitDays, service.maxTransitDays);
      
      // Build pricing breakdown
      const pricingBreakdown: PricingBreakdown = {
        baseRate: roundCurrency(adjustedBaseRate),
        fuelSurcharge: roundCurrency(fuelSurcharge),
        fuelSurchargePercentage: dailyFuelSurcharge,
        insurance: roundCurrency(insuranceCalc.fee),
        insurancePercentage: insuranceCalc.percentage,
        specialHandling: roundCurrency(specialHandlingFees + locationSurcharge),
        deliveryConfirmation: roundCurrency(deliveryConfirmationFee),
        taxes: roundCurrency(taxes),
        taxPercentage: 8.5,
        total: roundCurrency(total),
        calculationBasis: {
          distance,
          weight: billableWeight,
          dimensionalWeight: getBillableWeight(shipmentDetails.package),
          zone: zone.toString()
        }
      };
      
      // Build pricing option
      const pricingOption: PricingOption = {
        id: `${carrier.id}-${service.id}-${Date.now()}`,
        category: service.category,
        serviceType: service.name,
        carrier: carrier.name,
        pricing: pricingBreakdown,
        estimatedDelivery,
        transitDays: service.maxTransitDays,
        features: [
          ...service.features,
          ...(service.guaranteedDelivery ? ['Money-back guarantee'] : []),
          ...(service.trackingIncluded ? ['Package tracking'] : []),
          ...(service.insuranceIncluded ? ['Free insurance'] : [])
        ],
        carbonFootprint: carbonFootprint > 0 ? carbonFootprint : undefined
      };
      
      this.logger.log('debug', 'service_quote_calculated', {
        carrierId: carrier.id,
        serviceId: service.id,
        total: pricingOption.pricing.total,
        transitDays: service.maxTransitDays
      });
      
      return pricingOption;
      
    } catch (error) {
      this.logger.log('error', 'service_quote_calculation_failed', {
        carrierId: carrier.id,
        serviceId: service.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    } finally {
      this.logger.endSpan(quoteSpanId);
    }
  }
  
  /**
   * Categorize quotes by service type
   */
  private categorizeQuotes(quotes: PricingOption[]): {
    ground: PricingOption[];
    air: PricingOption[];
    freight: PricingOption[];
  } {
    const categorized = {
      ground: quotes.filter(q => q.category === 'ground'),
      air: quotes.filter(q => q.category === 'air'),
      freight: quotes.filter(q => q.category === 'freight')
    };
    
    // Sort each category by price
    categorized.ground.sort((a, b) => a.pricing.total - b.pricing.total);
    categorized.air.sort((a, b) => a.pricing.total - b.pricing.total);
    categorized.freight.sort((a, b) => a.pricing.total - b.pricing.total);
    
    return categorized;
  }
  
  /**
   * Calculate estimated delivery date
   */
  private calculateEstimatedDelivery(minDays: number, maxDays: number): string {
    const today = new Date();
    const businessDaysToAdd = maxDays;
    
    let deliveryDate = new Date(today);
    let daysAdded = 0;
    
    while (daysAdded < businessDaysToAdd) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
      
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (deliveryDate.getDay() !== 0 && deliveryDate.getDay() !== 6) {
        daysAdded++;
      }
    }
    
    // Format as readable date
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    const dateString = deliveryDate.toLocaleDateString('en-US', options);
    
    if (minDays === maxDays) {
      return `${dateString} (${maxDays} business day${maxDays === 1 ? '' : 's'})`;
    } else {
      return `${dateString} (${minDays}-${maxDays} business days)`;
    }
  }
}

/**
 * Simulate realistic processing delay
 */
export async function simulateProcessingDelay(): Promise<void> {
  // Simulate realistic API processing time (500-1500ms)
  const delay = 500 + Math.random() * 1000;
  await new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Create pricing calculator instance
 */
export function createPricingCalculator(logger: TraceLogger): PricingCalculator {
  return new PricingCalculator(logger);
}
