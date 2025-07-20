import type { ShippingTransaction, SubmissionResponse } from '@/lib/types';
import { authorizePayment } from '@/lib/payment/authorization';
import { confirmPickupSlot } from '@/lib/scheduling/confirmation';
import { estimateDelivery } from '@/lib/delivery/estimation';
import { generateConfirmationDetails } from '@/lib/confirmation/generator';
import { validateBusinessRules } from '@/lib/validation/business-rules';

/**
 * Main shipment submission processing function
 * Orchestrates validation, authorization, and confirmation generation
 */
export async function submitShipment(transaction: ShippingTransaction): Promise<SubmissionResponse> {
  console.log('🚀 [SUBMISSION] Starting shipment submission process for transaction:', transaction.id);
  const startTime = Date.now();

  try {
    // Step 1: Validate business rules and constraints
    console.log('📋 [SUBMISSION] Step 1: Validating business rules...');
    const businessValidation = await validateBusinessRules(transaction);
    if (!businessValidation.isValid) {
      console.error('❌ [SUBMISSION] Business validation failed:', businessValidation.errors);
      throw new Error(`Business validation failed: ${businessValidation.errors.map(e => e.message).join(', ')}`);
    }
    console.log('✅ [SUBMISSION] Business rules validation successful');

    // Step 2: Authorize payment method
    console.log('💳 [SUBMISSION] Step 2: Authorizing payment...');
    const paymentAuth = await authorizePayment(transaction.paymentInfo!);
    if (!paymentAuth.authorized) {
      console.error('❌ [SUBMISSION] Payment authorization failed:', paymentAuth.reason);
      const error = new Error('Payment authorization failed');
      (error as any).code = 'PAYMENT_DECLINED';
      (error as any).reason = paymentAuth.reason;
      throw error;
    }
    console.log('✅ [SUBMISSION] Payment authorized:', {
      method: transaction.paymentInfo!.method,
      reference: paymentAuth.authorizationCode,
      amount: transaction.selectedOption!.pricing.total
    });

    // Step 3: Confirm pickup slot availability
    console.log('📅 [SUBMISSION] Step 3: Confirming pickup slot...');
    const pickupConfirmation = await confirmPickupSlot(transaction.pickupDetails!);
    if (!pickupConfirmation.confirmed) {
      console.error('❌ [SUBMISSION] Pickup slot confirmation failed:', pickupConfirmation.reason);
      const error = new Error('Pickup slot no longer available');
      (error as any).code = 'PICKUP_UNAVAILABLE';
      (error as any).reason = pickupConfirmation.reason;
      throw error;
    }
    console.log('✅ [SUBMISSION] Pickup slot confirmed:', {
      date: transaction.pickupDetails!.date,
      timeSlot: transaction.pickupDetails!.timeSlot.display,
      confirmationId: pickupConfirmation.confirmationId
    });

    // Step 4: Estimate delivery date
    console.log('🚚 [SUBMISSION] Step 4: Calculating delivery estimation...');
    const deliveryEstimate = await estimateDelivery(
      transaction.pickupDetails!,
      transaction.selectedOption!,
      transaction.shipmentDetails.destination
    );
    console.log('✅ [SUBMISSION] Delivery estimated:', {
      estimatedDate: deliveryEstimate.estimatedDate,
      transitDays: deliveryEstimate.transitDays,
      businessDaysOnly: deliveryEstimate.businessDaysOnly
    });

    // Step 5: Generate confirmation details
    console.log('📄 [SUBMISSION] Step 5: Generating confirmation details...');
    const confirmationDetails = await generateConfirmationDetails(
      transaction,
      paymentAuth,
      pickupConfirmation,
      deliveryEstimate
    );
    console.log('✅ [SUBMISSION] Confirmation details generated:', {
      confirmationNumber: confirmationDetails.confirmationNumber,
      trackingNumber: confirmationDetails.trackingNumber,
      carrier: confirmationDetails.carrierInfo.name
    });

    // Step 6: Simulate realistic processing delay
    const processingDelay = calculateProcessingDelay(transaction);
    if (processingDelay > 0) {
      console.log(`⏳ [SUBMISSION] Simulating processing delay: ${processingDelay}ms`);
      await new Promise(resolve => setTimeout(resolve, processingDelay));
    }

    const totalProcessingTime = Date.now() - startTime;
    console.log('🎉 [SUBMISSION] Shipment submission completed successfully:', {
      confirmationNumber: confirmationDetails.confirmationNumber,
      totalProcessingTime: `${totalProcessingTime}ms`,
      transactionId: transaction.id
    });

    // Return final submission response
    const response: SubmissionResponse = {
      confirmationNumber: confirmationDetails.confirmationNumber,
      estimatedDelivery: deliveryEstimate.estimatedDate,
      trackingNumber: confirmationDetails.trackingNumber,
      status: 'confirmed' as const,
      timestamp: new Date().toISOString(),
      carrierInfo: confirmationDetails.carrierInfo,
      totalCost: transaction.selectedOption!.pricing.total
    };

    return response;

  } catch (error: any) {
    const totalProcessingTime = Date.now() - startTime;
    console.error('💥 [SUBMISSION] Shipment submission failed:', {
      error: error.message,
      code: error.code,
      totalProcessingTime: `${totalProcessingTime}ms`,
      transactionId: transaction.id
    });
    throw error;
  }
}

/**
 * Calculate realistic processing delay based on transaction complexity
 */
function calculateProcessingDelay(transaction: ShippingTransaction): number {
  console.log('⏱️ [SUBMISSION] Calculating processing delay...');
  
  let baseDelay = 1000; // 1 second base
  
  // Add delay based on payment method complexity
  switch (transaction.paymentInfo!.method) {
    case 'po':
      baseDelay += 500; // Purchase orders need verification
      break;
    case 'net':
      baseDelay += 1500; // Net terms need credit check
      break;
    case 'thirdparty':
      baseDelay += 1000; // Third party needs authorization
      break;
    case 'bol':
      baseDelay += 300; // BOL is relatively fast
      break;
    case 'corporate':
      baseDelay += 200; // Corporate accounts are fastest
      break;
  }
  
  // Add delay for special handling requirements
  const specialHandlingCount = transaction.shipmentDetails.package.specialHandling.length;
  baseDelay += specialHandlingCount * 200;
  
  // Add delay for multiple packages
  if (transaction.shipmentDetails.package.type === 'multiple') {
    const pieceCount = transaction.shipmentDetails.package.multiplePackages?.numberOfPieces || 1;
    baseDelay += Math.min(pieceCount * 100, 800); // Cap at 800ms
  }
  
  // Add random variation (±200ms)
  const variation = Math.random() * 400 - 200;
  const totalDelay = Math.max(500, baseDelay + variation); // Minimum 500ms
  
  console.log('⏱️ [SUBMISSION] Processing delay calculated:', {
    baseDelay,
    specialHandlingDelay: specialHandlingCount * 200,
    paymentMethodDelay: baseDelay - 1000,
    variation: Math.round(variation),
    totalDelay: Math.round(totalDelay)
  });
  
  return Math.round(totalDelay);
}