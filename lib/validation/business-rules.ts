import type { ShippingTransaction, ValidationResult, ValidationError } from '@/lib/types';

/**
 * Comprehensive business rule validation for shipping transactions
 */
export async function validateBusinessRules(transaction: ShippingTransaction): Promise<ValidationResult> {
  console.log('🔍 [BUSINESS-RULES] Starting business rules validation for transaction:', transaction.id);
  
  const errors: ValidationError[] = [];
  
  try {
    // Validate origin and destination cannot be identical
    await validateOriginDestination(transaction, errors);
    
    // Validate quote expiration
    await validateQuoteExpiration(transaction, errors);
    
    // Validate pickup slot timing
    await validatePickupTiming(transaction, errors);
    
    // Validate weight and package constraints
    await validatePackageConstraints(transaction, errors);
    
    // Validate geographic service coverage
    await validateServiceCoverage(transaction, errors);
    
    // Validate payment method compatibility
    await validatePaymentCompatibility(transaction, errors);
    
    // Validate special handling requirements
    await validateSpecialHandling(transaction, errors);
    
    // Validate declared value constraints
    await validateDeclaredValue(transaction, errors);
    
    const isValid = errors.length === 0;
    
    console.log('📊 [BUSINESS-RULES] Validation completed:', {
      isValid,
      errorCount: errors.length,
      errors: errors.map(e => ({ field: e.field, code: e.code }))
    });
    
    return {
      isValid,
      errors
    };
    
  } catch (error: any) {
    console.error('💥 [BUSINESS-RULES] Validation error:', error.message);
    errors.push({
      field: 'validation',
      message: 'Business rule validation failed',
      code: 'VALIDATION_ERROR'
    });
    
    return {
      isValid: false,
      errors
    };
  }
}

/**
 * Validate origin and destination addresses are different
 */
async function validateOriginDestination(transaction: ShippingTransaction, errors: ValidationError[]): Promise<void> {
  console.log('📍 [BUSINESS-RULES] Validating origin/destination...');
  
  const { origin, destination } = transaction.shipmentDetails;
  
  // Check if addresses are identical
  const isSameAddress = (
    origin.address.toLowerCase() === destination.address.toLowerCase() &&
    origin.city.toLowerCase() === destination.city.toLowerCase() &&
    origin.state.toLowerCase() === destination.state.toLowerCase() &&
    origin.zip === destination.zip &&
    origin.country.toLowerCase() === destination.country.toLowerCase()
  );
  
  if (isSameAddress) {
    errors.push({
      field: 'destination',
      message: 'Origin and destination addresses cannot be identical',
      code: 'IDENTICAL_ADDRESSES'
    });
    console.log('❌ [BUSINESS-RULES] Identical addresses detected');
  } else {
    console.log('✅ [BUSINESS-RULES] Origin/destination validation passed');
  }
}

/**
 * Validate pricing quote is still within valid timeframe (30 minutes)
 */
async function validateQuoteExpiration(transaction: ShippingTransaction, errors: ValidationError[]): Promise<void> {
  console.log('⏰ [BUSINESS-RULES] Validating quote expiration...');
  
  if (!transaction.selectedOption) {
    errors.push({
      field: 'selectedOption',
      message: 'No pricing option selected',
      code: 'MISSING_PRICING_OPTION'
    });
    return;
  }
  
  // Simulate quote timestamp (in real implementation, this would come from the quote)
  const quoteTimestamp = new Date(transaction.timestamp).getTime();
  const currentTime = Date.now();
  const quoteAge = currentTime - quoteTimestamp;
  const maxQuoteAge = 30 * 60 * 1000; // 30 minutes in milliseconds
  
  if (quoteAge > maxQuoteAge) {
    const ageMinutes = Math.round(quoteAge / (60 * 1000));
    errors.push({
      field: 'selectedOption',
      message: `Pricing quote has expired (${ageMinutes} minutes old, max 30 minutes)`,
      code: 'QUOTE_EXPIRED'
    });
    console.log('❌ [BUSINESS-RULES] Quote expired:', { ageMinutes, maxMinutes: 30 });
  } else {
    const ageMinutes = Math.round(quoteAge / (60 * 1000));
    console.log('✅ [BUSINESS-RULES] Quote still valid:', { ageMinutes, maxMinutes: 30 });
  }
}

/**
 * Validate pickup timing is appropriate (not in the past, proper lead time)
 */
async function validatePickupTiming(transaction: ShippingTransaction, errors: ValidationError[]): Promise<void> {
  console.log('📅 [BUSINESS-RULES] Validating pickup timing...');
  
  if (!transaction.pickupDetails) {
    errors.push({
      field: 'pickupDetails',
      message: 'Pickup details are required',
      code: 'MISSING_PICKUP_DETAILS'
    });
    return;
  }
  
  const pickupDate = new Date(transaction.pickupDetails.date);
  const currentDate = new Date();
  const timeDiff = pickupDate.getTime() - currentDate.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  
  // Check if pickup is in the past
  if (timeDiff < 0) {
    errors.push({
      field: 'pickupDetails.date',
      message: 'Pickup date cannot be in the past',
      code: 'PAST_PICKUP_DATE'
    });
    console.log('❌ [BUSINESS-RULES] Past pickup date:', { pickupDate: pickupDate.toISOString() });
    return;
  }
  
  // Check minimum lead time (24 hours for most services)
  const minLeadTimeHours = getMinimumLeadTime(transaction);
  const leadTimeHours = timeDiff / (1000 * 60 * 60);
  
  if (leadTimeHours < minLeadTimeHours) {
    errors.push({
      field: 'pickupDetails.date',
      message: `Pickup requires at least ${minLeadTimeHours} hours lead time`,
      code: 'INSUFFICIENT_LEAD_TIME'
    });
    console.log('❌ [BUSINESS-RULES] Insufficient lead time:', { 
      leadTimeHours: Math.round(leadTimeHours), 
      requiredHours: minLeadTimeHours 
    });
  } else {
    console.log('✅ [BUSINESS-RULES] Pickup timing valid:', { 
      daysDiff, 
      leadTimeHours: Math.round(leadTimeHours),
      requiredHours: minLeadTimeHours
    });
  }
}

/**
 * Get minimum lead time based on service type and special handling
 */
function getMinimumLeadTime(transaction: ShippingTransaction): number {
  let baseLeadTime = 24; // 24 hours default
  
  // Adjust for service type
  if (transaction.selectedOption?.category === 'air') {
    baseLeadTime = Math.max(baseLeadTime, 12); // Air services can be faster
  } else if (transaction.selectedOption?.category === 'freight') {
    baseLeadTime = Math.max(baseLeadTime, 48); // Freight needs more time
  }
  
  // Adjust for special handling
  const specialHandling = transaction.shipmentDetails.package.specialHandling;
  if (specialHandling.includes('hazmat')) {
    baseLeadTime = Math.max(baseLeadTime, 72); // Hazmat needs extra time
  }
  if (specialHandling.includes('white-glove')) {
    baseLeadTime = Math.max(baseLeadTime, 48); // White glove needs coordination
  }
  if (specialHandling.includes('temperature-controlled')) {
    baseLeadTime = Math.max(baseLeadTime, 36); // Temperature control needs prep
  }
  
  return baseLeadTime;
}

/**
 * Validate package weight and dimensions against type constraints
 */
async function validatePackageConstraints(transaction: ShippingTransaction, errors: ValidationError[]): Promise<void> {
  console.log('📦 [BUSINESS-RULES] Validating package constraints...');
  
  const { package: pkg } = transaction.shipmentDetails;
  
  // Define weight limits by package type (in pounds)
  const weightLimits: Record<string, number> = {
    'envelope': 1,
    'small': 10,
    'medium': 50,
    'large': 150,
    'pallet': 2500,
    'crate': 5000,
    'multiple': 10000
  };
  
  // Convert weight to pounds for validation
  let weightInPounds = pkg.weight.value;
  if (pkg.weight.unit === 'kg') {
    weightInPounds = pkg.weight.value * 2.20462;
  }
  
  const maxWeight = weightLimits[pkg.type];
  if (weightInPounds > maxWeight) {
    errors.push({
      field: 'package.weight',
      message: `Weight ${Math.round(weightInPounds)}lbs exceeds limit for ${pkg.type} packages (${maxWeight}lbs)`,
      code: 'WEIGHT_LIMIT_EXCEEDED'
    });
    console.log('❌ [BUSINESS-RULES] Weight limit exceeded:', { 
      weight: Math.round(weightInPounds), 
      limit: maxWeight, 
      type: pkg.type 
    });
  }
  
  // Validate dimensional weight for air shipments
  if (transaction.selectedOption?.category === 'air') {
    const dimensionalWeight = calculateDimensionalWeight(pkg.dimensions);
    if (dimensionalWeight > weightInPounds && dimensionalWeight > 50) {
      console.log('⚠️ [BUSINESS-RULES] Dimensional weight applies:', { 
        actualWeight: Math.round(weightInPounds), 
        dimensionalWeight: Math.round(dimensionalWeight) 
      });
    }
  }
  
  // Validate multiple packages
  if (pkg.type === 'multiple' && pkg.multiplePackages) {
    if (pkg.multiplePackages.numberOfPieces !== pkg.multiplePackages.pieces.length) {
      errors.push({
        field: 'package.multiplePackages',
        message: 'Number of pieces does not match piece count',
        code: 'PIECE_COUNT_MISMATCH'
      });
    }
  }
  
  if (errors.length === 0) {
    console.log('✅ [BUSINESS-RULES] Package constraints validation passed');
  }
}

/**
 * Calculate dimensional weight for air shipments
 */
function calculateDimensionalWeight(dimensions: any): number {
  // Convert to inches if needed
  let length = dimensions.length;
  let width = dimensions.width;
  let height = dimensions.height;
  
  if (dimensions.unit === 'cm') {
    length = length / 2.54;
    width = width / 2.54;
    height = height / 2.54;
  }
  
  // Air freight dimensional weight formula: L × W × H / 166
  return (length * width * height) / 166;
}

/**
 * Validate service coverage for origin/destination combination
 */
async function validateServiceCoverage(transaction: ShippingTransaction, errors: ValidationError[]): Promise<void> {
  console.log('🌍 [BUSINESS-RULES] Validating service coverage...');
  
  const { origin, destination } = transaction.shipmentDetails;
  
  // Define supported countries
  const supportedCountries = ['US', 'USA', 'CA', 'CANADA', 'MX', 'MEXICO'];
  
  if (!supportedCountries.includes(origin.country.toUpperCase())) {
    errors.push({
      field: 'shipmentDetails.origin.country',
      message: `Service not available from ${origin.country}`,
      code: 'UNSUPPORTED_ORIGIN_COUNTRY'
    });
  }
  
  if (!supportedCountries.includes(destination.country.toUpperCase())) {
    errors.push({
      field: 'shipmentDetails.destination.country',
      message: `Service not available to ${destination.country}`,
      code: 'UNSUPPORTED_DESTINATION_COUNTRY'
    });
  }
  
  // Validate specific service restrictions
  if (transaction.selectedOption?.category === 'ground') {
    // Ground services may have geographic restrictions
    const isInternational = origin.country !== destination.country;
    if (isInternational) {
      // Some ground services don't cross borders
      console.log('⚠️ [BUSINESS-RULES] International ground shipment detected');
    }
  }
  
  if (errors.length === 0) {
    console.log('✅ [BUSINESS-RULES] Service coverage validation passed');
  }
}

/**
 * Validate payment method compatibility with shipment
 */
async function validatePaymentCompatibility(transaction: ShippingTransaction, errors: ValidationError[]): Promise<void> {
  console.log('💳 [BUSINESS-RULES] Validating payment compatibility...');
  
  if (!transaction.paymentInfo) {
    errors.push({
      field: 'paymentInfo',
      message: 'Payment information is required',
      code: 'MISSING_PAYMENT_INFO'
    });
    return;
  }
  
  const { method } = transaction.paymentInfo;
  const shipmentTotal = transaction.selectedOption?.pricing.total || 0;
  
  // Validate payment method specific rules
  switch (method) {
    case 'po':
      if (transaction.paymentInfo.paymentDetails.purchaseOrder) {
        const poAmount = transaction.paymentInfo.paymentDetails.purchaseOrder.poAmount;
        if (shipmentTotal > poAmount) {
          errors.push({
            field: 'paymentInfo.paymentDetails.purchaseOrder.poAmount',
            message: `Shipment cost $${shipmentTotal.toFixed(2)} exceeds PO amount $${poAmount.toFixed(2)}`,
            code: 'PO_AMOUNT_EXCEEDED'
          });
        }
        
        // Check PO expiration
        const expirationDate = new Date(transaction.paymentInfo.paymentDetails.purchaseOrder.expirationDate);
        if (expirationDate < new Date()) {
          errors.push({
            field: 'paymentInfo.paymentDetails.purchaseOrder.expirationDate',
            message: 'Purchase order has expired',
            code: 'PO_EXPIRED'
          });
        }
      }
      break;
      
    case 'net':
      // Net terms typically have credit limits
      if (shipmentTotal > 50000) {
        console.log('⚠️ [BUSINESS-RULES] Large net terms shipment detected:', { amount: shipmentTotal });
      }
      break;
      
    case 'thirdparty':
      // Third party billing requires authorization
      if (!transaction.paymentInfo.paymentDetails.thirdParty?.authorizationCode) {
        console.log('⚠️ [BUSINESS-RULES] Third party billing without authorization code');
      }
      break;
  }
  
  if (errors.length === 0) {
    console.log('✅ [BUSINESS-RULES] Payment compatibility validation passed');
  }
}

/**
 * Validate special handling requirements and restrictions
 */
async function validateSpecialHandling(transaction: ShippingTransaction, errors: ValidationError[]): Promise<void> {
  console.log('🔧 [BUSINESS-RULES] Validating special handling...');
  
  const specialHandling = transaction.shipmentDetails.package.specialHandling;
  
  // Check for conflicting special handling requirements
  const conflicts = [
    { types: ['fragile', 'hazmat'], message: 'Fragile and hazmat handling cannot be combined' },
    { types: ['temperature-controlled', 'hazmat'], message: 'Temperature control and hazmat require separate shipments' }
  ];
  
  for (const conflict of conflicts) {
    const hasConflict = conflict.types.every(type => specialHandling.includes(type as any));
    if (hasConflict) {
      errors.push({
        field: 'package.specialHandling',
        message: conflict.message,
        code: 'CONFLICTING_SPECIAL_HANDLING'
      });
    }
  }
  
  // Validate hazmat requirements
  if (specialHandling.includes('hazmat')) {
    // Hazmat requires additional documentation and restrictions
    if (transaction.selectedOption?.category === 'air') {
      // Some hazmat cannot go by air
      console.log('⚠️ [BUSINESS-RULES] Hazmat air shipment requires additional validation');
    }
  }
  
  if (errors.length === 0) {
    console.log('✅ [BUSINESS-RULES] Special handling validation passed');
  }
}

/**
 * Validate declared value is reasonable for package contents
 */
async function validateDeclaredValue(transaction: ShippingTransaction, errors: ValidationError[]): Promise<void> {
  console.log('💰 [BUSINESS-RULES] Validating declared value...');
  
  const { package: pkg } = transaction.shipmentDetails;
  const declaredValue = pkg.declaredValue;
  
  // Minimum declared value
  if (declaredValue < 1) {
    errors.push({
      field: 'package.declaredValue',
      message: 'Declared value must be at least $1.00',
      code: 'DECLARED_VALUE_TOO_LOW'
    });
  }
  
  // Maximum declared value limits based on package type
  const maxValueLimits: Record<string, number> = {
    'envelope': 5000,
    'small': 25000,
    'medium': 100000,
    'large': 500000,
    'pallet': 1000000,
    'crate': 2000000,
    'multiple': 5000000
  };
  
  const maxValue = maxValueLimits[pkg.type];
  if (declaredValue > maxValue) {
    errors.push({
      field: 'package.declaredValue',
      message: `Declared value $${declaredValue.toLocaleString()} exceeds limit for ${pkg.type} packages ($${maxValue.toLocaleString()})`,
      code: 'DECLARED_VALUE_TOO_HIGH'
    });
  }
  
  // Validate reasonableness based on contents category
  const categoryLimits: Record<string, { min: number; max: number; typical: number }> = {
    'documents': { min: 1, max: 1000, typical: 50 },
    'clothing': { min: 10, max: 10000, typical: 200 },
    'electronics': { min: 50, max: 100000, typical: 1000 },
    'automotive': { min: 25, max: 50000, typical: 500 },
    'medical': { min: 100, max: 500000, typical: 2000 },
    'furniture': { min: 200, max: 100000, typical: 1500 },
    'industrial': { min: 100, max: 1000000, typical: 5000 },
    'food': { min: 5, max: 5000, typical: 100 },
    'raw-materials': { min: 10, max: 100000, typical: 300 },
    'other': { min: 1, max: 100000, typical: 500 }
  };
  
  const categoryLimit = categoryLimits[pkg.contentsCategory];
  if (categoryLimit) {
    if (declaredValue < categoryLimit.min) {
      console.log('⚠️ [BUSINESS-RULES] Declared value seems low for category:', { 
        category: pkg.contentsCategory, 
        value: declaredValue, 
        typical: categoryLimit.typical 
      });
    }
    
    if (declaredValue > categoryLimit.max) {
      errors.push({
        field: 'package.declaredValue',
        message: `Declared value seems unusually high for ${pkg.contentsCategory} category`,
        code: 'DECLARED_VALUE_UNUSUAL'
      });
    }
  }
  
  if (errors.length === 0) {
    console.log('✅ [BUSINESS-RULES] Declared value validation passed');
  }
}