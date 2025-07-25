// Final submission validation for B2B shipping workflow
// Implements comprehensive validation for terms, acknowledgments, and data integrity

import { 
  ShippingTransaction, 
  TermsAcknowledgment, 
  SubmissionValidationError, 
  SubmissionValidationResult,
  PaymentInfo,
  PickupDetails
} from '@/lib/types';

export class SubmissionValidator {
  
  /**
   * Performs comprehensive validation before final shipment submission
   */
  static validateSubmission(
    transaction: ShippingTransaction,
    termsAcknowledgment: TermsAcknowledgment
  ): SubmissionValidationResult {
    console.log('SubmissionValidator.validateSubmission - Starting validation', {
      transactionId: transaction.id,
      status: transaction.status,
      hasShipmentDetails: !!transaction.shipmentDetails,
      hasSelectedOption: !!transaction.selectedOption,
      hasPaymentInfo: !!transaction.paymentInfo,
      hasPickupDetails: !!transaction.pickupDetails,
      termsAcknowledgment
    });

    const errors: SubmissionValidationError[] = [];
    const warnings: SubmissionValidationError[] = [];
    const missingAcknowledgments: string[] = [];
    const conflictingRequirements: string[] = [];

    // Step 1: Validate required acknowledgments
    this.validateRequiredAcknowledgments(termsAcknowledgment, transaction, missingAcknowledgments, errors);

    // Step 2: Validate transaction completeness
    this.validateTransactionCompleteness(transaction, errors);

    // Step 3: Validate payment authorization
    this.validatePaymentAuthorization(transaction, errors, warnings);

    // Step 4: Validate pickup feasibility
    this.validatePickupFeasibility(transaction, errors, warnings);

    // Step 5: Validate business rule compliance
    this.validateBusinessRules(transaction, errors, warnings, conflictingRequirements);

    // Step 6: Validate cost consistency
    this.validateCostConsistency(transaction, errors, warnings);

    const isValid = errors.length === 0 && missingAcknowledgments.length === 0;

    console.log('SubmissionValidator.validateSubmission - Validation completed', {
      isValid,
      errorCount: errors.length,
      warningCount: warnings.length,
      missingAcknowledgments: missingAcknowledgments.length,
      conflictingRequirements: conflictingRequirements.length
    });

    return {
      isValid,
      errors,
      warnings,
      missingAcknowledgments,
      conflictingRequirements
    };
  }

  /**
   * Validates that all required terms acknowledgments are checked
   */
  private static validateRequiredAcknowledgments(
    acknowledgment: TermsAcknowledgment,
    transaction: ShippingTransaction,
    missingAcknowledgments: string[],
    errors: SubmissionValidationError[]
  ): void {
    console.log('SubmissionValidator.validateRequiredAcknowledgments - Checking acknowledgments', acknowledgment);

    // Required for all shipments
    const requiredAcknowledgments = [
      { key: 'declaredValueAccuracy', label: 'Declared Value Accuracy' },
      { key: 'insuranceRequirements', label: 'Insurance Requirements Understanding' },
      { key: 'packageContentsCompliance', label: 'Package Contents Compliance' },
      { key: 'carrierAuthorization', label: 'Carrier Authorization' }
    ];

    for (const req of requiredAcknowledgments) {
      if (!acknowledgment[req.key as keyof TermsAcknowledgment]) {
        missingAcknowledgments.push(req.label);
        errors.push({
          field: `acknowledgment.${req.key}`,
          message: `${req.label} acknowledgment is required`,
          severity: 'error',
          resolutionHint: 'Please check the required acknowledgment to proceed'
        });
      }
    }

    // Conditional acknowledgments
    const hasHazmat = transaction.shipmentDetails?.package?.specialHandling?.includes('hazmat');
    if (hasHazmat && !acknowledgment.hazmatCertification) {
      missingAcknowledgments.push('Hazmat Certification');
      errors.push({
        field: 'acknowledgment.hazmatCertification',
        message: 'Hazmat certification acknowledgment is required for hazardous materials',
        severity: 'error',
        navigationPath: '/shipping',
        resolutionHint: 'Hazmat shipments require additional certification acknowledgment'
      });
    }

    // International shipments
    const isInternational = transaction.shipmentDetails?.destination?.country !== 'US';
    if (isInternational) {
      if (!acknowledgment.internationalCompliance) {
        missingAcknowledgments.push('International Compliance');
        errors.push({
          field: 'acknowledgment.internationalCompliance',
          message: 'International shipping compliance acknowledgment is required',
          severity: 'error',
          resolutionHint: 'International shipments require customs compliance acknowledgment'
        });
      }

      if (!acknowledgment.customsDocumentation) {
        missingAcknowledgments.push('Customs Documentation');
        errors.push({
          field: 'acknowledgment.customsDocumentation',
          message: 'Customs documentation acknowledgment is required for international shipments',
          severity: 'error',
          resolutionHint: 'Please acknowledge understanding of customs documentation requirements'
        });
      }
    }
  }

  /**
   * Validates that the transaction has all required data for submission
   */
  private static validateTransactionCompleteness(
    transaction: ShippingTransaction,
    errors: SubmissionValidationError[]
  ): void {
    console.log('SubmissionValidator.validateTransactionCompleteness - Checking completeness');

    if (!transaction.shipmentDetails) {
      errors.push({
        field: 'shipmentDetails',
        message: 'Shipment details are required',
        severity: 'error',
        navigationPath: '/shipping',
        resolutionHint: 'Please complete the shipment details form'
      });
      return;
    }

    if (!transaction.selectedOption) {
      errors.push({
        field: 'selectedOption',
        message: 'Shipping service selection is required',
        severity: 'error',
        navigationPath: '/shipping/pricing',
        resolutionHint: 'Please select a shipping service and pricing option'
      });
    }

    if (!transaction.paymentInfo) {
      errors.push({
        field: 'paymentInfo',
        message: 'Payment information is required',
        severity: 'error',
        navigationPath: '/shipping/payment',
        resolutionHint: 'Please complete payment information'
      });
    }

    if (!transaction.pickupDetails) {
      errors.push({
        field: 'pickupDetails',
        message: 'Pickup scheduling is required',
        severity: 'error',
        navigationPath: '/shipping/pickup',
        resolutionHint: 'Please schedule pickup details'
      });
    }
  }

  /**
   * Validates payment method authorization and amounts
   */
  private static validatePaymentAuthorization(
    transaction: ShippingTransaction,
    errors: SubmissionValidationError[],
    warnings: SubmissionValidationError[]
  ): void {
    console.log('SubmissionValidator.validatePaymentAuthorization - Checking payment authorization');

    const paymentInfo = transaction.paymentInfo;
    const selectedOption = transaction.selectedOption;

    if (!paymentInfo || !selectedOption) return;

    // Validate purchase order amounts
    if (paymentInfo.method === 'po' && paymentInfo.paymentDetails?.purchaseOrder) {
      const poAmount = paymentInfo.paymentDetails.purchaseOrder.poAmount;
      const totalCost = selectedOption.pricing.total;

      if (poAmount < totalCost) {
        errors.push({
          field: 'paymentInfo.purchaseOrder.poAmount',
          message: `Purchase order amount ($${poAmount.toFixed(2)}) is insufficient for total cost ($${totalCost.toFixed(2)})`,
          severity: 'error',
          navigationPath: '/shipping/payment',
          resolutionHint: 'Please update the purchase order amount or select a different payment method'
        });
      } else if (poAmount > totalCost * 1.2) {
        warnings.push({
          field: 'paymentInfo.purchaseOrder.poAmount',
          message: `Purchase order amount ($${poAmount.toFixed(2)}) is significantly higher than total cost ($${totalCost.toFixed(2)})`,
          severity: 'warning',
          resolutionHint: 'Consider adjusting the purchase order amount to match the actual cost'
        });
      }

      // Check PO expiration
      const expirationDate = new Date(paymentInfo.paymentDetails.purchaseOrder.expirationDate);
      const today = new Date();
      if (expirationDate <= today) {
        errors.push({
          field: 'paymentInfo.purchaseOrder.expirationDate',
          message: 'Purchase order has expired',
          severity: 'error',
          navigationPath: '/shipping/payment',
          resolutionHint: 'Please provide a valid purchase order with a future expiration date'
        });
      }
    }

    // Validate billing contact completeness
    if (!paymentInfo.billingContact?.name || !paymentInfo.billingContact?.email || !paymentInfo.billingContact?.phone) {
      errors.push({
        field: 'paymentInfo.billingContact',
        message: 'Complete billing contact information is required',
        severity: 'error',
        navigationPath: '/shipping/payment',
        resolutionHint: 'Please provide complete billing contact details including name, email, and phone'
      });
    }
  }

  /**
   * Validates pickup scheduling and timing feasibility
   */
  private static validatePickupFeasibility(
    transaction: ShippingTransaction,
    errors: SubmissionValidationError[],
    warnings: SubmissionValidationError[]
  ): void {
    console.log('SubmissionValidator.validatePickupFeasibility - Checking pickup feasibility');

    const pickupDetails = transaction.pickupDetails;
    if (!pickupDetails) return;

    // Validate pickup date is in the future
    const pickupDate = new Date(pickupDetails.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (pickupDate < today) {
      errors.push({
        field: 'pickupDetails.date',
        message: 'Pickup date must be in the future',
        severity: 'error',
        navigationPath: '/shipping/pickup',
        resolutionHint: 'Please select a future pickup date'
      });
    }

    // Validate ready time allows sufficient preparation
    if (pickupDetails.readyTime && pickupDetails.timeSlot) {
      const readyTime = this.parseTimeString(pickupDetails.readyTime);
      const pickupStartTime = this.parseTimeString(pickupDetails.timeSlot.startTime);

      if (readyTime > pickupStartTime) {
        warnings.push({
          field: 'pickupDetails.readyTime',
          message: 'Package ready time is after pickup window start time',
          severity: 'warning',
          navigationPath: '/shipping/pickup',
          resolutionHint: 'Consider adjusting ready time to be before the pickup window'
        });
      }

      const timeDifference = (pickupStartTime - readyTime) / (1000 * 60); // minutes
      if (timeDifference < 30) {
        warnings.push({
          field: 'pickupDetails.readyTime',
          message: 'Less than 30 minutes between ready time and pickup window may cause delays',
          severity: 'warning',
          resolutionHint: 'Consider allowing more preparation time before pickup'
        });
      }
    }

    // Validate contact information completeness
    if (!pickupDetails.primaryContact?.name || !pickupDetails.primaryContact?.mobilePhone) {
      errors.push({
        field: 'pickupDetails.primaryContact',
        message: 'Complete primary contact information is required for pickup',
        severity: 'error',
        navigationPath: '/shipping/pickup',
        resolutionHint: 'Please provide complete primary contact details including name and mobile phone'
      });
    }

    // Check for authorized personnel if required
    if (pickupDetails.specialAuthorization?.idVerificationRequired && (!pickupDetails.authorizedPersonnel || pickupDetails.authorizedPersonnel.length === 0)) {
      errors.push({
        field: 'pickupDetails.authorizedPersonnel',
        message: 'Authorized personnel must be specified for this pickup location',
        severity: 'error',
        navigationPath: '/shipping/pickup',
        resolutionHint: 'Please specify authorized personnel for package release'
      });
    }
  }

  /**
   * Validates business rules and detects conflicting requirements
   */
  private static validateBusinessRules(
    transaction: ShippingTransaction,
    errors: SubmissionValidationError[],
    warnings: SubmissionValidationError[],
    conflictingRequirements: string[]
  ): void {
    console.log('SubmissionValidator.validateBusinessRules - Checking business rules');

    const shipmentDetails = transaction.shipmentDetails;
    if (!shipmentDetails) return;

    // Check for conflicting special handling requirements
    const specialHandling = shipmentDetails.package?.specialHandling || [];
    
    // Temperature controlled conflicts with other requirements
    if (specialHandling.includes('temperature-controlled')) {
      if (specialHandling.includes('hazmat')) {
        conflictingRequirements.push('Temperature-controlled and hazmat handling cannot be combined');
        errors.push({
          field: 'shipmentDetails.package.specialHandling',
          message: 'Temperature-controlled and hazmat handling are not compatible',
          severity: 'error',
          navigationPath: '/shipping',
          resolutionHint: 'Please select either temperature-controlled or hazmat handling, not both'
        });
      }
    }

    // Validate package dimensions vs. service type
    const selectedService = transaction.selectedOption?.serviceType.toLowerCase();
    const packageDimensions = shipmentDetails.package?.dimensions;
    
    if (selectedService?.includes('envelope') && packageDimensions) {
      const maxDimension = Math.max(packageDimensions.length, packageDimensions.width, packageDimensions.height);
      if (maxDimension > 12) {
        warnings.push({
          field: 'selectedOption.serviceType',
          message: 'Package dimensions may exceed envelope service limits',
          severity: 'warning',
          navigationPath: '/shipping/pricing',
          resolutionHint: 'Consider selecting a package service instead of envelope service'
        });
      }
    }

    // Validate declared value vs. insurance
    const declaredValue = shipmentDetails.package?.declaredValue || 0;
    const deliveryPreferences = shipmentDetails.deliveryPreferences;
    
    if (declaredValue > 1000 && !deliveryPreferences?.signatureRequired) {
      warnings.push({
        field: 'shipmentDetails.deliveryPreferences.signatureRequired',
        message: 'High-value packages should require signature confirmation',
        severity: 'warning',
        navigationPath: '/shipping',
        resolutionHint: 'Consider enabling signature required for packages over $1000'
      });
    }

    // Saturday delivery compatibility
    if (deliveryPreferences?.saturdayDelivery && selectedService?.includes('ground')) {
      const pickupDate = new Date(transaction.pickupDetails?.date || '');
      const dayOfWeek = pickupDate.getDay();
      
      if (dayOfWeek >= 3) { // Wednesday or later
        warnings.push({
          field: 'deliveryPreferences.saturdayDelivery',
          message: 'Saturday delivery may not be available for packages picked up late in the week',
          severity: 'warning',
          resolutionHint: 'Consider scheduling pickup earlier in the week for Saturday delivery'
        });
      }
    }
  }

  /**
   * Validates cost consistency between pricing and payment authorization
   */
  private static validateCostConsistency(
    transaction: ShippingTransaction,
    errors: SubmissionValidationError[],
    warnings: SubmissionValidationError[]
  ): void {
    console.log('SubmissionValidator.validateCostConsistency - Checking cost consistency');

    const selectedOption = transaction.selectedOption;
    const paymentInfo = transaction.paymentInfo;

    if (!selectedOption || !paymentInfo) return;

    const totalCost = selectedOption.pricing.total;

    // Validate that costs are reasonable
    if (totalCost <= 0) {
      errors.push({
        field: 'selectedOption.pricing.total',
        message: 'Invalid pricing calculation detected',
        severity: 'error',
        navigationPath: '/shipping/pricing',
        resolutionHint: 'Please recalculate shipping pricing'
      });
    }

    // Check for suspiciously high costs
    const packageWeight = transaction.shipmentDetails?.package?.weight?.value || 0;
    const costPerPound = totalCost / Math.max(packageWeight, 1);
    
    if (costPerPound > 50) {
      warnings.push({
        field: 'selectedOption.pricing.total',
        message: `Shipping cost per pound ($${costPerPound.toFixed(2)}) is unusually high`,
        severity: 'warning',
        navigationPath: '/shipping/pricing',
        resolutionHint: 'Please verify the shipping option and package details are correct'
      });
    }

    // Validate pricing breakdown consistency
    const pricing = selectedOption.pricing;
    const calculatedTotal = (pricing.baseRate || 0) + 
                           (pricing.fuelSurcharge || 0) + 
                           (pricing.insurance || 0) + 
                           (pricing.specialHandling || 0) + 
                           (pricing.deliveryConfirmation || 0) + 
                           (pricing.taxes || 0);

    const totalDifference = Math.abs(calculatedTotal - totalCost);
    if (totalDifference > 0.01) {
      errors.push({
        field: 'selectedOption.pricing',
        message: 'Pricing breakdown does not match total cost',
        severity: 'error',
        navigationPath: '/shipping/pricing',
        resolutionHint: 'Please recalculate shipping pricing to ensure accuracy'
      });
    }
  }

  /**
   * Utility function to parse time strings
   */
  private static parseTimeString(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes; // Return minutes since midnight
  }

  /**
   * Gets user-friendly error summary for display
   */
  static getErrorSummary(validationResult: SubmissionValidationResult): string {
    const { errors, warnings, missingAcknowledgments, conflictingRequirements } = validationResult;
    
    const issues: string[] = [];
    
    if (errors.length > 0) {
      issues.push(`${errors.length} critical error${errors.length > 1 ? 's' : ''}`);
    }
    
    if (missingAcknowledgments.length > 0) {
      issues.push(`${missingAcknowledgments.length} missing acknowledgment${missingAcknowledgments.length > 1 ? 's' : ''}`);
    }
    
    if (conflictingRequirements.length > 0) {
      issues.push(`${conflictingRequirements.length} conflicting requirement${conflictingRequirements.length > 1 ? 's' : ''}`);
    }
    
    if (warnings.length > 0) {
      issues.push(`${warnings.length} warning${warnings.length > 1 ? 's' : ''}`);
    }
    
    if (issues.length === 0) {
      return 'All validation checks passed';
    }
    
    return `Found: ${issues.join(', ')}`;
  }
}
