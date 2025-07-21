import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { submitShipment } from '@/lib/shipment/submission';
import type { ShippingTransaction, SubmissionResponse } from '@/lib/types';

// Enhanced validation schema for complete shipping transaction
const SubmissionRequestSchema = z.object({
  transaction: z.object({
    id: z.string().min(1, 'Transaction ID is required'),
    timestamp: z.string().datetime('Invalid timestamp format'),
    shipmentDetails: z.object({
      origin: z.object({
        address: z.string().min(1, 'Origin address is required'),
        suite: z.string().optional(),
        city: z.string().min(1, 'Origin city is required'),
        state: z.string().min(2, 'Origin state is required'),
        zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format'),
        country: z.string().min(2, 'Origin country is required'),
        isResidential: z.boolean(),
        contactInfo: z.object({
          name: z.string().min(1, 'Origin contact name is required'),
          company: z.string().optional(),
          phone: z.string().regex(/^\+?[\d\s\-\(\)\.]+$/, 'Invalid phone format'),
          email: z.string().email('Invalid email format'),
          extension: z.string().optional()
        }),
        locationType: z.enum(['commercial', 'residential', 'industrial', 'warehouse', 'storage', 'construction', 'other']),
        locationDescription: z.string().optional()
      }),
      destination: z.object({
        address: z.string().min(1, 'Destination address is required'),
        suite: z.string().optional(),
        city: z.string().min(1, 'Destination city is required'),
        state: z.string().min(2, 'Destination state is required'),
        zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format'),
        country: z.string().min(2, 'Destination country is required'),
        isResidential: z.boolean(),
        contactInfo: z.object({
          name: z.string().min(1, 'Destination contact name is required'),
          company: z.string().optional(),
          phone: z.string().regex(/^\+?[\d\s\-\(\)\.]+$/, 'Invalid phone format'),
          email: z.string().email('Invalid email format'),
          extension: z.string().optional()
        }),
        locationType: z.enum(['commercial', 'residential', 'industrial', 'warehouse', 'storage', 'construction', 'other']),
        locationDescription: z.string().optional()
      }),
      package: z.object({
        type: z.enum(['envelope', 'small', 'medium', 'large', 'pallet', 'crate', 'multiple']),
        dimensions: z.object({
          length: z.number().positive('Length must be positive'),
          width: z.number().positive('Width must be positive'),
          height: z.number().positive('Height must be positive'),
          unit: z.enum(['in', 'cm'])
        }),
        weight: z.object({
          value: z.number().positive('Weight must be positive'),
          unit: z.enum(['lbs', 'kg'])
        }),
        declaredValue: z.number().min(0, 'Declared value cannot be negative'),
        currency: z.enum(['USD', 'CAD', 'MXN']),
        contents: z.string().min(1, 'Package contents description is required'),
        contentsCategory: z.enum(['electronics', 'automotive', 'industrial', 'documents', 'clothing', 'food', 'medical', 'furniture', 'raw-materials', 'other']),
        specialHandling: z.array(z.enum(['fragile', 'this-side-up', 'temperature-controlled', 'hazmat', 'white-glove', 'inside-delivery', 'liftgate-pickup', 'liftgate-delivery'])),
        multiplePackages: z.object({
          numberOfPieces: z.number().min(1),
          pieces: z.array(z.object({
            id: z.string(),
            type: z.enum(['envelope', 'small', 'medium', 'large', 'pallet', 'crate', 'multiple']),
            dimensions: z.object({
              length: z.number().positive(),
              width: z.number().positive(),
              height: z.number().positive(),
              unit: z.enum(['in', 'cm'])
            }),
            weight: z.object({
              value: z.number().positive(),
              unit: z.enum(['lbs', 'kg'])
            }),
            description: z.string().min(1),
            declaredValue: z.number().min(0)
          })),
          totalWeight: z.number().positive(),
          totalDeclaredValue: z.number().min(0)
        }).optional()
      }),
      deliveryPreferences: z.object({
        signatureRequired: z.boolean(),
        adultSignatureRequired: z.boolean(),
        smsConfirmation: z.boolean(),
        photoProof: z.boolean(),
        saturdayDelivery: z.boolean(),
        holdAtLocation: z.boolean(),
        serviceLevel: z.enum(['economical', 'fastest', 'reliable', 'carbon-neutral'])
      })
    }),
    selectedOption: z.object({
      id: z.string().min(1, 'Pricing option ID is required'),
      category: z.enum(['ground', 'air', 'freight']),
      serviceType: z.string().min(1, 'Service type is required'),
      carrier: z.string().min(1, 'Carrier is required'),
      pricing: z.object({
        baseRate: z.number().min(0),
        fuelSurcharge: z.number().min(0),
        fuelSurchargePercentage: z.number().min(0),
        insurance: z.number().min(0),
        insurancePercentage: z.number().min(0),
        specialHandling: z.number().min(0),
        deliveryConfirmation: z.number().min(0),
        taxes: z.number().min(0),
        taxPercentage: z.number().min(0),
        total: z.number().positive('Total cost must be positive'),
        calculationBasis: z.object({
          distance: z.number().positive(),
          weight: z.number().positive(),
          dimensionalWeight: z.number().optional(),
          zone: z.string().optional()
        })
      }),
      estimatedDelivery: z.string().min(1),
      transitDays: z.number().min(1),
      features: z.array(z.string()),
      carbonFootprint: z.number().optional()
    }),
    paymentInfo: z.object({
      method: z.enum(['po', 'bol', 'thirdparty', 'net', 'corporate']),
      reference: z.string().min(1, 'Payment reference is required'),
      billingContact: z.object({
        name: z.string().min(1, 'Billing contact name is required'),
        company: z.string().optional(),
        phone: z.string().regex(/^\+?[\d\s\-\(\)\.]+$/, 'Invalid phone format'),
        email: z.string().email('Invalid email format'),
        extension: z.string().optional()
      }),
      companyInfo: z.object({
        legalName: z.string().min(1, 'Company legal name is required'),
        dbaName: z.string().optional(),
        businessType: z.enum(['corporation', 'llc', 'partnership', 'sole-proprietorship', 'government', 'non-profit']),
        industry: z.string().min(1, 'Industry is required'),
        annualShippingVolume: z.enum(['<10k', '10k-50k', '50k-250k', '250k-1m', '>1m']),
        taxId: z.string().min(1, 'Tax ID is required'),
        glCode: z.string().optional()
      }),
      billingAddress: z.object({
        address: z.string().min(1, 'Billing address is required'),
        suite: z.string().optional(),
        city: z.string().min(1, 'Billing city is required'),
        state: z.string().min(2, 'Billing state is required'),
        zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format'),
        country: z.string().min(2, 'Billing country is required'),
        isResidential: z.boolean(),
        contactInfo: z.object({
          name: z.string().min(1),
          company: z.string().optional(),
          phone: z.string().regex(/^\+?[\d\s\-\(\)\.]+$/),
          email: z.string().email(),
          extension: z.string().optional()
        }),
        locationType: z.enum(['commercial', 'residential', 'industrial', 'warehouse', 'storage', 'construction', 'other']),
        locationDescription: z.string().optional()
      }),
      invoicePreferences: z.object({
        deliveryMethod: z.enum(['email', 'mail', 'edi', 'portal']),
        format: z.enum(['standard', 'itemized', 'summary', 'custom']),
        frequency: z.enum(['per-shipment', 'weekly', 'monthly'])
      }),
      paymentDetails: z.object({
        purchaseOrder: z.object({
          poNumber: z.string().min(1),
          poAmount: z.number().positive(),
          expirationDate: z.string(),
          approvalContact: z.string().min(1),
          department: z.string().min(1)
        }).optional(),
        billOfLading: z.object({
          bolNumber: z.string().min(1),
          bolDate: z.string(),
          shipperReference: z.string().min(1),
          freightTerms: z.enum(['prepaid', 'collect', 'prepaid-add'])
        }).optional(),
        thirdParty: z.object({
          accountNumber: z.string().min(1),
          companyName: z.string().min(1),
          contactInfo: z.object({
            name: z.string().min(1),
            company: z.string().optional(),
            phone: z.string().regex(/^\+?[\d\s\-\(\)\.]+$/),
            email: z.string().email(),
            extension: z.string().optional()
          }),
          authorizationCode: z.string().optional()
        }).optional(),
        netTerms: z.object({
          period: z.enum(['15', '30', '45', '60']),
          tradeReferences: z.array(z.object({
            companyName: z.string().min(1),
            contactName: z.string().min(1),
            phone: z.string().regex(/^\+?[\d\s\-\(\)\.]+$/),
            email: z.string().email(),
            relationship: z.string().min(1)
          })),
          annualRevenue: z.string().min(1)
        }).optional(),
        corporate: z.object({
          accountNumber: z.string().min(1),
          accountPin: z.string().min(4),
          billingContact: z.object({
            name: z.string().min(1),
            company: z.string().optional(),
            phone: z.string().regex(/^\+?[\d\s\-\(\)\.]+$/),
            email: z.string().email(),
            extension: z.string().optional()
          })
        }).optional()
      })
    }),
    pickupDetails: z.object({
      date: z.string().min(1, 'Pickup date is required'),
      timeSlot: z.object({
        id: z.string().min(1, 'Time slot ID is required'),
        display: z.string().min(1),
        startTime: z.string().min(1),
        endTime: z.string().min(1),
        availability: z.enum(['available', 'limited', 'unavailable']),
        additionalFee: z.number().optional()
      }),
      instructions: z.string(),
      contactPerson: z.string().min(1, 'Pickup contact person is required'),
      phone: z.string().regex(/^\+?[\d\s\-\(\)\.]+$/, 'Invalid phone format'),
      backupContact: z.object({
        name: z.string().min(1),
        phone: z.string().regex(/^\+?[\d\s\-\(\)\.]+$/)
      }).optional(),
      accessInstructions: z.object({
        gateCode: z.string().optional(),
        securityRequired: z.boolean(),
        appointmentRequired: z.boolean(),
        limitedParking: z.boolean(),
        forkliftAvailable: z.boolean(),
        liftgateRequired: z.boolean(),
        dockNumber: z.string().optional(),
        parkingInstructions: z.string(),
        packageLocation: z.string().min(1),
        driverInstructions: z.string()
      }),
      equipmentRequirements: z.object({
        dolly: z.boolean(),
        applianceDolly: z.boolean(),
        furniturePads: z.boolean(),
        straps: z.boolean(),
        palletJack: z.boolean(),
        twoPersonTeam: z.boolean(),
        loadingAssistance: z.enum(['customer', 'driver-assist', 'full-service'])
      }),
      notificationPreferences: z.object({
        emailReminder24h: z.boolean(),
        smsReminder2h: z.boolean(),
        callReminder30m: z.boolean(),
        driverEnRoute: z.boolean(),
        pickupCompletion: z.boolean(),
        transitUpdates: z.boolean()
      }),
      readyTime: z.string().min(1),
      authorizedPersonnel: z.array(z.string().min(1)),
      specialAuthorization: z.object({
        idVerificationRequired: z.boolean(),
        signatureAuthorization: z.boolean(),
        photoIdMatching: z.boolean()
      }).optional()
    }),
    status: z.enum(['draft', 'pricing', 'payment', 'pickup', 'review', 'confirmed'])
  })
});

export async function POST(request: NextRequest) {
  console.log('🚀 [SUBMIT-SHIPMENT] Processing shipment submission request');
  
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    console.log('📋 [SUBMIT-SHIPMENT] Request body received:', {
      transactionId: body.transaction?.id,
      status: body.transaction?.status,
      carrier: body.transaction?.selectedOption?.carrier,
      paymentMethod: body.transaction?.paymentInfo?.method
    });

    // Validate request structure
    const validationResult = SubmissionRequestSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('❌ [SUBMIT-SHIPMENT] Validation failed:', validationResult.error.issues);
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'Invalid submission data',
          details: validationResult.error.issues?.map((err: any) => ({
            field: err.path?.join('.') || 'unknown',
            message: err.message || 'Validation error',
            code: err.code || 'VALIDATION_ERROR'
          })) || []
        },
        { status: 400 }
      );
    }

    const transactionData = validationResult.data.transaction;
    
    // Create the transaction with proper type conversion
    const transaction: ShippingTransaction = {
      ...transactionData,
      timestamp: new Date(transactionData.timestamp)
    } as ShippingTransaction; // Type assertion to handle complex type conversions
    
    console.log('✅ [SUBMIT-SHIPMENT] Transaction validation successful');

    // Validate transaction status
    if (transaction.status !== 'review') {
      console.error('❌ [SUBMIT-SHIPMENT] Invalid transaction status:', transaction.status);
      return NextResponse.json(
        {
          error: 'INVALID_STATUS',
          message: 'Transaction must be in review status for submission',
          details: { currentStatus: transaction.status, requiredStatus: 'review' }
        },
        { status: 400 }
      );
    }

    // Validate required components
    if (!transaction.selectedOption) {
      console.error('❌ [SUBMIT-SHIPMENT] Missing pricing selection');
      return NextResponse.json(
        {
          error: 'MISSING_PRICING',
          message: 'No pricing option selected',
          details: { required: 'selectedOption' }
        },
        { status: 400 }
      );
    }

    if (!transaction.paymentInfo) {
      console.error('❌ [SUBMIT-SHIPMENT] Missing payment information');
      return NextResponse.json(
        {
          error: 'MISSING_PAYMENT',
          message: 'Payment information is required',
          details: { required: 'paymentInfo' }
        },
        { status: 400 }
      );
    }

    if (!transaction.pickupDetails) {
      console.error('❌ [SUBMIT-SHIPMENT] Missing pickup details');
      return NextResponse.json(
        {
          error: 'MISSING_PICKUP',
          message: 'Pickup details are required',
          details: { required: 'pickupDetails' }
        },
        { status: 400 }
      );
    }

    console.log('🔄 [SUBMIT-SHIPMENT] Processing shipment submission...');

    try {
      // Process shipment submission
      const submission = await submitShipment(transaction);
      
      const processingTime = Date.now() - startTime;
      console.log('✅ [SUBMIT-SHIPMENT] Submission successful:', {
        confirmationNumber: submission.confirmationNumber,
        trackingNumber: submission.trackingNumber,
        processingTime: `${processingTime}ms`,
        carrier: submission.carrierInfo.name
      });

      return NextResponse.json(submission, { status: 200 });

    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      console.error('💥 [SUBMIT-SHIPMENT] Submission failed:', {
        error: error.message,
        processingTime: `${processingTime}ms`,
        transactionId: transaction.id
      });

      if (error.code === 'PAYMENT_DECLINED') {
        return NextResponse.json(
          {
            error: 'PAYMENT_DECLINED',
            message: 'Payment authorization failed',
            details: {
              paymentMethod: transaction.paymentInfo.method,
              reason: error.reason || 'Authorization declined',
              retryable: true
            }
          },
          { status: 402 }
        );
      }

      if (error.code === 'PICKUP_UNAVAILABLE') {
        return NextResponse.json(
          {
            error: 'PICKUP_UNAVAILABLE',
            message: 'Selected pickup slot is no longer available',
            details: {
              requestedDate: transaction.pickupDetails.date,
              requestedTime: transaction.pickupDetails.timeSlot.display,
              reason: error.reason || 'Slot conflict detected',
              retryable: true
            }
          },
          { status: 409 }
        );
      }

      if (error.code === 'QUOTE_EXPIRED') {
        return NextResponse.json(
          {
            error: 'QUOTE_EXPIRED',
            message: 'Pricing quote has expired',
            details: {
              quoteId: transaction.selectedOption.id,
              reason: 'Quote validity period exceeded',
              retryable: true,
              action: 'Please request new pricing quotes'
            }
          },
          { status: 410 }
        );
      }

      // Generic error handling
      return NextResponse.json(
        {
          error: 'SUBMISSION_FAILED',
          message: 'Shipment submission failed',
          details: {
            reason: error.message || 'Unknown error',
            retryable: true,
            transactionId: transaction.id
          }
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error('💥 [SUBMIT-SHIPMENT] Unexpected error:', {
      error: error.message,
      processingTime: `${processingTime}ms`
    });

    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}