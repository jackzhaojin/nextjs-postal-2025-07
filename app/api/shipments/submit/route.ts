// Shipment submission API endpoint
// Handles final validation and shipment submission processing

import { NextRequest, NextResponse } from 'next/server';
import { FinalSubmissionRequest, SubmissionResponse, ShippingTransaction } from '@/lib/types';
import { SubmissionValidator } from '@/lib/validation/submissionValidation';

export async function POST(request: NextRequest) {
  console.log('Submission API - POST request received');

  try {
    const body: FinalSubmissionRequest = await request.json();
    console.log('Submission API - Request body:', {
      transactionId: body.transaction?.id,
      hasTermsAcknowledgment: !!body.termsAcknowledgment,
      submissionTimestamp: body.submissionTimestamp
    });

    // Validate request structure
    if (!body.transaction || !body.termsAcknowledgment) {
      console.log('Submission API - Invalid request structure');
      return NextResponse.json(
        { 
          error: 'Invalid request', 
          message: 'Transaction and terms acknowledgment are required' 
        },
        { status: 400 }
      );
    }

    // Perform comprehensive validation
    const validationResult = SubmissionValidator.validateSubmission(
      body.transaction,
      body.termsAcknowledgment
    );

    console.log('Submission API - Validation result:', {
      isValid: validationResult.isValid,
      errorCount: validationResult.errors.length,
      warningCount: validationResult.warnings.length
    });

    // Return validation errors if submission is not valid
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Shipment data failed validation checks',
          validationResult
        },
        { status: 400 }
      );
    }

    // Generate confirmation number
    const confirmationNumber = generateConfirmationNumber();
    console.log('Submission API - Generated confirmation number:', confirmationNumber);

    // Simulate processing delay (remove in production)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Create submission response
    const response: SubmissionResponse = {
      confirmationNumber,
      estimatedDelivery: body.transaction.selectedOption?.estimatedDelivery || calculateEstimatedDelivery(body.transaction),
      trackingNumber: generateTrackingNumber(confirmationNumber),
      status: 'confirmed',
      timestamp: new Date().toISOString(),
      carrierInfo: {
        name: body.transaction.selectedOption?.carrier || 'Global Express',
        logo: '/carriers/global-express-logo.png',
        trackingUrl: `https://tracking.example.com/${generateTrackingNumber(confirmationNumber)}`
      },
      totalCost: body.transaction.selectedOption?.pricing?.total || 0
    };

    console.log('Submission API - Response created:', {
      confirmationNumber: response.confirmationNumber,
      trackingNumber: response.trackingNumber,
      totalCost: response.totalCost
    });

    // In a real implementation, this would:
    // 1. Store the transaction in the database
    // 2. Send requests to carrier APIs
    // 3. Process payment authorization
    // 4. Schedule pickup notifications
    // 5. Generate shipping labels
    // 6. Send confirmation emails

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Submission API - Error processing submission:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: 'Failed to process shipment submission' 
      },
      { status: 500 }
    );
  }
}

/**
 * Generates a unique confirmation number
 */
function generateConfirmationNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const year = new Date().getFullYear();
  
  return `SHP-${year}-${timestamp.toString().slice(-6)}${random}`;
}

/**
 * Generates a tracking number based on confirmation number
 */
function generateTrackingNumber(confirmationNumber: string): string {
  const suffix = confirmationNumber.split('-').pop() || '000000';
  return `1Z999AA1${suffix}`;
}

/**
 * Calculates estimated delivery date based on service type and pickup date
 */
function calculateEstimatedDelivery(transaction: ShippingTransaction): string {
  const pickupDate = new Date(transaction.pickupDetails?.date || Date.now());
  const transitDays = transaction.selectedOption?.transitDays || 3;
  
  // Add business days (skip weekends)
  let deliveryDate = new Date(pickupDate);
  let daysAdded = 0;
  
  while (daysAdded < transitDays) {
    deliveryDate.setDate(deliveryDate.getDate() + 1);
    const dayOfWeek = deliveryDate.getDay();
    
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      daysAdded++;
    }
  }
  
  return deliveryDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
