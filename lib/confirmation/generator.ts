import type { ShippingTransaction } from '@/lib/types';
import type { PaymentAuthorizationResult } from '@/lib/payment/authorization';
import type { PickupConfirmationResult } from '@/lib/scheduling/confirmation';
import type { DeliveryEstimation } from '@/lib/delivery/estimation';

export interface ConfirmationDetails {
  confirmationNumber: string;
  trackingNumber: string;
  carrierInfo: {
    name: string;
    logo?: string;
    trackingUrl: string;
    contactPhone: string;
    contactEmail: string;
  };
  references: {
    customerReference?: string;
    internalReference: string;
    pickupConfirmation: string;
    paymentReference: string;
  };
  timestamps: {
    submittedAt: string;
    processedAt: string;
    estimatedPickup: string;
    estimatedDelivery: string;
  };
  costs: {
    finalTotal: number;
    breakdown: {
      baseRate: number;
      fuelSurcharge: number;
      insurance: number;
      specialHandling: number;
      taxes: number;
      additionalFees: number;
    };
    currency: string;
  };
  metadata: {
    serviceLevel: string;
    transitDays: number;
    specialInstructions?: string[];
    complianceNotes?: string[];
  };
}

/**
 * Generate comprehensive confirmation details for successful shipment submission
 */
export async function generateConfirmationDetails(
  transaction: ShippingTransaction,
  paymentAuth: PaymentAuthorizationResult,
  pickupConfirmation: PickupConfirmationResult,
  deliveryEstimate: DeliveryEstimation
): Promise<ConfirmationDetails> {
  console.log('📄 [CONFIRMATION] Generating confirmation details for transaction:', transaction.id);
  
  try {
    // Generate confirmation number
    const confirmationNumber = generateConfirmationNumber();
    console.log('🔢 [CONFIRMATION] Generated confirmation number:', confirmationNumber);
    
    // Generate tracking number
    const trackingNumber = generateTrackingNumber(transaction.selectedOption!.carrier);
    console.log('📦 [CONFIRMATION] Generated tracking number:', trackingNumber);
    
    // Get carrier information
    const carrierInfo = getCarrierInfo(transaction.selectedOption!.carrier, trackingNumber);
    console.log('🚛 [CONFIRMATION] Carrier info:', carrierInfo.name);
    
    // Generate references
    const references = generateReferences(transaction, paymentAuth, pickupConfirmation);
    console.log('📋 [CONFIRMATION] Generated references:', references);
    
    // Generate timestamps
    const timestamps = generateTimestamps(transaction, deliveryEstimate);
    console.log('⏰ [CONFIRMATION] Generated timestamps:', timestamps);
    
    // Calculate final costs
    const costs = calculateFinalCosts(transaction);
    console.log('💰 [CONFIRMATION] Final costs calculated:', costs.finalTotal);
    
    // Generate metadata
    const metadata = generateMetadata(transaction, deliveryEstimate);
    console.log('📊 [CONFIRMATION] Generated metadata');
    
    const confirmationDetails: ConfirmationDetails = {
      confirmationNumber,
      trackingNumber,
      carrierInfo,
      references,
      timestamps,
      costs,
      metadata
    };
    
    console.log('✅ [CONFIRMATION] Confirmation details generated successfully:', {
      confirmationNumber,
      trackingNumber,
      carrier: carrierInfo.name,
      finalTotal: costs.finalTotal
    });
    
    return confirmationDetails;
    
  } catch (error: any) {
    console.error('💥 [CONFIRMATION] Failed to generate confirmation details:', error.message);
    throw new Error(`Confirmation generation failed: ${error.message}`);
  }
}

/**
 * Generate unique confirmation number in format "SHP-2025-XXXXXX"
 */
function generateConfirmationNumber(): string {
  const year = new Date().getFullYear();
  const sequence = generateSequentialNumber();
  return `SHP-${year}-${sequence}`;
}

/**
 * Generate sequential 6-digit number for confirmation
 */
function generateSequentialNumber(): string {
  // Simulate sequential numbering (in real implementation, this would come from database)
  const baseNumber = Math.floor(Math.random() * 900000) + 100000; // 6-digit number
  const timestamp = Date.now().toString().slice(-3); // Last 3 digits of timestamp
  const combined = parseInt(timestamp + baseNumber.toString().slice(-3));
  return (combined % 1000000).toString().padStart(6, '0');
}

/**
 * Generate carrier-specific tracking number
 */
function generateTrackingNumber(carrier: string): string {
  console.log('📦 [CONFIRMATION] Generating tracking number for carrier:', carrier);
  
  switch (carrier.toUpperCase()) {
    case 'UPS':
      return generateUPSTrackingNumber();
    case 'FEDEX':
      return generateFedExTrackingNumber();
    case 'DHL':
      return generateDHLTrackingNumber();
    case 'USPS':
      return generateUSPSTrackingNumber();
    default:
      return generateGenericTrackingNumber(carrier);
  }
}

/**
 * Generate UPS-style tracking number (1Z + 6 char shipper + 8 char sequence + 1 check digit)
 */
function generateUPSTrackingNumber(): string {
  const prefix = '1Z';
  const shipperCode = generateAlphaNumeric(6).toUpperCase();
  const sequence = generateNumeric(8);
  const checkDigit = calculateUPSCheckDigit(shipperCode + sequence);
  return `${prefix}${shipperCode}${sequence}${checkDigit}`;
}

/**
 * Generate FedEx-style tracking number (12 digits)
 */
function generateFedExTrackingNumber(): string {
  const baseNumber = generateNumeric(11);
  const checkDigit = calculateFedExCheckDigit(baseNumber);
  return baseNumber + checkDigit;
}

/**
 * Generate DHL-style tracking number (10 digits)
 */
function generateDHLTrackingNumber(): string {
  return generateNumeric(10);
}

/**
 * Generate USPS-style tracking number (20-22 digits with prefix/suffix)
 */
function generateUSPSTrackingNumber(): string {
  const prefix = '9400';
  const sequence = generateNumeric(16);
  const suffix = '92';
  return prefix + sequence + suffix;
}

/**
 * Generate generic tracking number for other carriers
 */
function generateGenericTrackingNumber(carrier: string): string {
  const prefix = carrier.substring(0, 3).toUpperCase();
  const sequence = generateNumeric(12);
  return prefix + sequence;
}

/**
 * Get carrier-specific information
 */
function getCarrierInfo(carrier: string, trackingNumber: string): ConfirmationDetails['carrierInfo'] {
  const carrierData: Record<string, ConfirmationDetails['carrierInfo']> = {
    'UPS': {
      name: 'United Parcel Service',
      logo: '/carriers/ups-logo.png',
      trackingUrl: `https://www.ups.com/track?tracknum=${trackingNumber}`,
      contactPhone: '1-800-PICK-UPS',
      contactEmail: 'support@ups.com'
    },
    'FEDEX': {
      name: 'Federal Express',
      logo: '/carriers/fedex-logo.png',
      trackingUrl: `https://www.fedex.com/fedextrack/?tracknum=${trackingNumber}`,
      contactPhone: '1-800-GO-FEDEX',
      contactEmail: 'support@fedex.com'
    },
    'DHL': {
      name: 'DHL Express',
      logo: '/carriers/dhl-logo.png',
      trackingUrl: `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`,
      contactPhone: '1-800-CALL-DHL',
      contactEmail: 'support@dhl.com'
    },
    'USPS': {
      name: 'United States Postal Service',
      logo: '/carriers/usps-logo.png',
      trackingUrl: `https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=${trackingNumber}`,
      contactPhone: '1-800-ASK-USPS',
      contactEmail: 'support@usps.gov'
    }
  };
  
  const info = carrierData[carrier.toUpperCase()];
  if (info) {
    return info;
  }
  
  // Default carrier info for unknown carriers
  return {
    name: carrier,
    trackingUrl: `https://tracking.example.com/${trackingNumber}`,
    contactPhone: '1-800-SHIPPING',
    contactEmail: 'support@shipping.com'
  };
}

/**
 * Generate reference numbers and IDs
 */
function generateReferences(
  transaction: ShippingTransaction,
  paymentAuth: PaymentAuthorizationResult,
  pickupConfirmation: PickupConfirmationResult
): ConfirmationDetails['references'] {
  const internalReference = `INT-${Date.now().toString().slice(-8)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  
  let customerReference: string | undefined;
  if (transaction.paymentInfo) {
    switch (transaction.paymentInfo.method) {
      case 'po':
        customerReference = transaction.paymentInfo.purchaseOrder?.poNumber;
        break;
      case 'bol':
        customerReference = transaction.paymentInfo.billOfLading?.bolNumber;
        break;
      case 'thirdparty':
        customerReference = transaction.paymentInfo.thirdPartyBilling?.accountNumber;
        break;
      case 'net':
        customerReference = transaction.paymentInfo.netTerms?.netTermsPeriod;
        break;
      case 'corporate':
        customerReference = transaction.paymentInfo.corporateAccount?.accountNumber;
        break;
      default:
        customerReference = undefined;
    }
  }

  return {
    customerReference,
    internalReference,
    pickupConfirmation: pickupConfirmation.confirmationId!,
    paymentReference: paymentAuth.authorizationCode!
  };
}

/**
 * Generate timestamps for key events
 */
function generateTimestamps(
  transaction: ShippingTransaction,
  deliveryEstimate: DeliveryEstimation
): ConfirmationDetails['timestamps'] {
  const now = new Date();
  const processedAt = new Date(now.getTime() + 1000); // 1 second later
  
  // Pickup timestamp
  const pickupDate = new Date(transaction.pickupDetails!.date);
  const pickupTime = transaction.pickupDetails!.timeSlot.startTime;
  const [hours, minutes] = pickupTime.split(':').map(Number);
  pickupDate.setHours(hours, minutes, 0, 0);
  
  // Delivery timestamp
  const deliveryDate = new Date(deliveryEstimate.estimatedDate);
  if (deliveryEstimate.estimatedTime) {
    const [delHours, delMinutes] = deliveryEstimate.estimatedTime.split(':').map(Number);
    deliveryDate.setHours(delHours, delMinutes, 0, 0);
  } else {
    deliveryDate.setHours(12, 0, 0, 0); // Default to noon
  }
  
  return {
    submittedAt: now.toISOString(),
    processedAt: processedAt.toISOString(),
    estimatedPickup: pickupDate.toISOString(),
    estimatedDelivery: deliveryDate.toISOString()
  };
}

/**
 * Calculate final costs with any last-minute adjustments
 */
function calculateFinalCosts(transaction: ShippingTransaction): ConfirmationDetails['costs'] {
  const pricing = transaction.selectedOption!.pricing;
  
  // Calculate additional fees (weekend pickup, special handling, etc.)
  let additionalFees = 0;
  
  // Weekend pickup fee
  const pickupDate = new Date(transaction.pickupDetails!.date);
  if (pickupDate.getDay() === 6) { // Saturday
    additionalFees += 25;
  }
  
  // Time slot fee
  if (transaction.pickupDetails!.timeSlot.additionalFee) {
    additionalFees += transaction.pickupDetails!.timeSlot.additionalFee;
  }
  
  // Special authorization fee
  if (transaction.pickupDetails!.specialAuthorization?.idVerificationRequired) {
    additionalFees += 15;
  }
  
  const finalTotal = pricing.total + additionalFees;
  
  return {
    finalTotal,
    breakdown: {
      baseRate: pricing.baseRate,
      fuelSurcharge: pricing.fuelSurcharge,
      insurance: pricing.insurance,
      specialHandling: pricing.specialHandling,
      taxes: pricing.taxes,
      additionalFees
    },
    currency: transaction.shipmentDetails.package.currency
  };
}

/**
 * Generate metadata and special instructions
 */
function generateMetadata(
  transaction: ShippingTransaction,
  deliveryEstimate: DeliveryEstimation
): ConfirmationDetails['metadata'] {
  const specialInstructions: string[] = [];
  const complianceNotes: string[] = [];
  
  // Delivery preferences
  if (transaction.shipmentDetails.deliveryPreferences.signatureRequired) {
    specialInstructions.push('Signature required for delivery');
  }
  
  if (transaction.shipmentDetails.deliveryPreferences.adultSignatureRequired) {
    specialInstructions.push('Adult signature required (21+ with ID)');
  }
  
  if (transaction.shipmentDetails.deliveryPreferences.holdAtLocation) {
    specialInstructions.push('Hold at carrier location for customer pickup');
  }
  
  // Special handling
  const specialHandling = transaction.shipmentDetails.package.specialHandling;
  if (specialHandling.includes('fragile')) {
    specialInstructions.push('Handle with care - fragile contents');
  }
  
  if (specialHandling.includes('this-side-up')) {
    specialInstructions.push('This side up orientation required');
  }
  
  if (specialHandling.includes('temperature-controlled')) {
    specialInstructions.push('Temperature-controlled transport required');
    complianceNotes.push('Cold chain documentation maintained');
  }
  
  if (specialHandling.includes('hazmat')) {
    specialInstructions.push('Hazardous materials - special handling required');
    complianceNotes.push('DOT hazmat regulations compliance verified');
  }
  
  // Pickup instructions
  if (transaction.pickupDetails!.accessInstructions.securityRequired) {
    specialInstructions.push('Security clearance required for pickup location');
  }
  
  if (transaction.pickupDetails!.accessInstructions.appointmentRequired) {
    specialInstructions.push('Pickup appointment scheduled and confirmed');
  }
  
  // Delivery confidence notes
  if (deliveryEstimate.confidence === 'low') {
    complianceNotes.push('Delivery estimate subject to weather and operational conditions');
  }
  
  return {
    serviceLevel: transaction.selectedOption!.serviceType,
    transitDays: deliveryEstimate.transitDays,
    specialInstructions: specialInstructions.length > 0 ? specialInstructions : undefined,
    complianceNotes: complianceNotes.length > 0 ? complianceNotes : undefined
  };
}

/**
 * Utility functions for generating numbers and codes
 */

function generateAlphaNumeric(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateNumeric(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
}

/**
 * Check digit calculations for carrier tracking numbers
 */

function calculateUPSCheckDigit(baseNumber: string): string {
  // Simplified UPS check digit calculation
  let sum = 0;
  for (let i = 0; i < baseNumber.length; i++) {
    const char = baseNumber[i];
    const value = isNaN(parseInt(char)) ? char.charCodeAt(0) - 55 : parseInt(char);
    sum += value * (i % 2 === 0 ? 2 : 1);
  }
  return (sum % 10).toString();
}

function calculateFedExCheckDigit(baseNumber: string): string {
  // Simplified FedEx check digit calculation
  let sum = 0;
  const weights = [1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3];
  
  for (let i = 0; i < baseNumber.length && i < weights.length; i++) {
    sum += parseInt(baseNumber[i]) * weights[i];
  }
  
  const remainder = sum % 11;
  return remainder === 10 ? '0' : remainder.toString();
}