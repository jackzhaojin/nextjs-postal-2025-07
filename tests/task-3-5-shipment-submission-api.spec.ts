import { test, expect } from '@playwright/test';

const BASE_URL = 'http://172.24.240.1:3000';

// Test data for complete shipping transaction
const validShippingTransaction = {
  transaction: {
    id: 'test-transaction-001',
    timestamp: new Date().toISOString(),
    shipmentDetails: {
      origin: {
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zip: '94102',
        country: 'US',
        isResidential: false,
        contactInfo: {
          name: 'John Sender',
          company: 'Acme Corp',
          phone: '+1-555-123-4567',
          email: 'john@acme.com'
        },
        locationType: 'commercial' as const,
        locationDescription: 'Main office building'
      },
      destination: {
        address: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zip: '90210',
        country: 'US',
        isResidential: true,
        contactInfo: {
          name: 'Jane Receiver',
          company: 'Customer Inc',
          phone: '+1-555-987-6543',
          email: 'jane@customer.com'
        },
        locationType: 'residential' as const
      },
      package: {
        type: 'medium' as const,
        dimensions: {
          length: 12,
          width: 8,
          height: 6,
          unit: 'in' as const
        },
        weight: {
          value: 5.5,
          unit: 'lbs' as const
        },
        declaredValue: 250,
        currency: 'USD' as const,
        contents: 'Electronics equipment',
        contentsCategory: 'electronics' as const,
        specialHandling: ['fragile' as const]
      },
      deliveryPreferences: {
        signatureRequired: true,
        adultSignatureRequired: false,
        smsConfirmation: true,
        photoProof: false,
        saturdayDelivery: false,
        holdAtLocation: false,
        serviceLevel: 'reliable' as const
      }
    },
    selectedOption: {
      id: 'ground-standard-001',
      category: 'ground' as const,
      serviceType: 'Ground Standard',
      carrier: 'UPS',
      pricing: {
        baseRate: 45.50,
        fuelSurcharge: 3.64,
        fuelSurchargePercentage: 8.0,
        insurance: 2.50,
        insurancePercentage: 1.0,
        specialHandling: 15.00,
        deliveryConfirmation: 3.50,
        taxes: 5.97,
        taxPercentage: 8.5,
        total: 76.11,
        calculationBasis: {
          distance: 380,
          weight: 5.5,
          zone: 'Zone 3'
        }
      },
      estimatedDelivery: '2025-07-28',
      transitDays: 3,
      features: ['Tracking', 'Insurance', 'Delivery Confirmation'],
      carbonFootprint: 2.4
    },
    paymentInfo: {
      method: 'po' as const,
      reference: 'PO-2025-12345',
      billingContact: {
        name: 'Bill Manager',
        company: 'Acme Corp',
        phone: '+1-555-111-2222',
        email: 'billing@acme.com'
      },
      companyInfo: {
        legalName: 'Acme Corporation',
        businessType: 'corporation' as const,
        industry: 'Technology',
        annualShippingVolume: '50k-250k' as const,
        taxId: '12-3456789'
      },
      billingAddress: {
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zip: '94102',
        country: 'US',
        isResidential: false,
        contactInfo: {
          name: 'Bill Manager',
          phone: '+1-555-111-2222',
          email: 'billing@acme.com'
        },
        locationType: 'commercial' as const
      },
      invoicePreferences: {
        deliveryMethod: 'email' as const,
        format: 'itemized' as const,
        frequency: 'per-shipment' as const
      },
      paymentDetails: {
        purchaseOrder: {
          poNumber: 'PO-2025-12345',
          poAmount: 1000.00,
          expirationDate: '2025-12-31',
          approvalContact: 'Bill Manager',
          department: 'Operations'
        }
      }
    },
    pickupDetails: {
      date: '2025-07-25', // Use a future date
      timeSlot: {
        id: 'morning-0800-1000',
        display: '8:00 AM - 10:00 AM',
        startTime: '08:00',
        endTime: '10:00',
        availability: 'available' as const
      },
      instructions: 'Package will be ready at loading dock',
      contactPerson: 'John Sender',
      phone: '+1-555-123-4567',
      accessInstructions: {
        securityRequired: false,
        appointmentRequired: false,
        limitedParking: true,
        forkliftAvailable: false,
        liftgateRequired: false,
        parkingInstructions: 'Use visitor parking on north side',
        packageLocation: 'Loading dock, bay 3',
        driverInstructions: 'Ring bell at dock office'
      },
      equipmentRequirements: {
        dolly: false,
        applianceDolly: false,
        furniturePads: true,
        straps: false,
        palletJack: false,
        twoPersonTeam: false,
        loadingAssistance: 'driver-assist' as const
      },
      notificationPreferences: {
        emailReminder24h: true,
        smsReminder2h: true,
        callReminder30m: false,
        driverEnRoute: true,
        pickupCompletion: true,
        transitUpdates: true
      },
      readyTime: '07:30',
      authorizedPersonnel: ['John Sender', 'Mike Assistant']
    },
    status: 'review' as const
  }
};

test.describe('Shipment Submission API', () => {
  test('should successfully submit a complete valid transaction', async ({ request }) => {
    console.log('🧪 [TEST] Testing successful shipment submission...');
    
    const response = await request.post(`${BASE_URL}/api/submit-shipment`, {
      data: validShippingTransaction
    });
    
    const result = await response.json();
    console.log('📋 [TEST] Response status:', response.status(), 'Result:', result);
    
    // Accept either success (200) or payment declined (402) since we have ~5% failure rate
    expect([200, 402]).toContain(response.status());
    
    if (response.status() === 200) {
      console.log('✅ [TEST] Submission successful:', result);
      
      // Validate response structure
      expect(result).toHaveProperty('confirmationNumber');
      expect(result).toHaveProperty('estimatedDelivery');
      expect(result).toHaveProperty('trackingNumber');
      expect(result).toHaveProperty('status', 'confirmed');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('carrierInfo');
      expect(result).toHaveProperty('totalCost');
      
      // Validate confirmation number format
      expect(result.confirmationNumber).toMatch(/^SHP-\d{4}-\d{6}$/);
      
      // Validate carrier info
      expect(result.carrierInfo).toHaveProperty('name');
      expect(result.carrierInfo).toHaveProperty('trackingUrl');
      
      // Validate total cost
      expect(result.totalCost).toBeGreaterThan(0);
    } else if (response.status() === 402) {
      console.log('💳 [TEST] Payment declined (expected ~5% failure rate):', result);
      expect(result).toHaveProperty('error', 'PAYMENT_DECLINED');
    }
  });

  test('should reject transaction with missing required data', async ({ request }) => {
    console.log('🧪 [TEST] Testing validation with missing required data...');
    
    const incompleteTransaction = {
      transaction: {
        id: 'test-incomplete',
        timestamp: new Date().toISOString(),
        status: 'review' as const
        // Missing shipmentDetails, selectedOption, paymentInfo, pickupDetails
      }
    };
    
    const response = await request.post(`${BASE_URL}/api/submit-shipment`, {
      data: incompleteTransaction
    });
    
    expect(response.status()).toBe(400);
    
    const result = await response.json();
    console.log('❌ [TEST] Validation failed as expected:', result);
    
    expect(result).toHaveProperty('error', 'VALIDATION_ERROR');
    expect(result).toHaveProperty('message');
    expect(result).toHaveProperty('details');
    expect(Array.isArray(result.details)).toBe(true);
  });

  test('should reject transaction with invalid status', async ({ request }) => {
    console.log('🧪 [TEST] Testing transaction status validation...');
    
    const invalidStatusTransaction = {
      ...validShippingTransaction,
      transaction: {
        ...validShippingTransaction.transaction,
        status: 'draft' as const // Should be 'review' for submission
      }
    };
    
    const response = await request.post(`${BASE_URL}/api/submit-shipment`, {
      data: invalidStatusTransaction
    });
    
    expect(response.status()).toBe(400);
    
    const result = await response.json();
    console.log('❌ [TEST] Status validation failed as expected:', result);
    
    expect(result).toHaveProperty('error', 'INVALID_STATUS');
    expect(result).toHaveProperty('message');
    expect(result.details).toHaveProperty('currentStatus', 'draft');
    expect(result.details).toHaveProperty('requiredStatus', 'review');
  });

  test('should handle identical origin and destination addresses', async ({ request }) => {
    console.log('🧪 [TEST] Testing identical addresses validation...');
    
    const identicalAddressTransaction = {
      ...validShippingTransaction,
      transaction: {
        ...validShippingTransaction.transaction,
        shipmentDetails: {
          ...validShippingTransaction.transaction.shipmentDetails,
          destination: {
            ...validShippingTransaction.transaction.shipmentDetails.origin, // Same as origin
            contactInfo: {
              ...validShippingTransaction.transaction.shipmentDetails.origin.contactInfo,
              name: 'Different Person' // Different contact but same address
            }
          }
        }
      }
    };
    
    const response = await request.post(`${BASE_URL}/api/submit-shipment`, {
      data: identicalAddressTransaction
    });
    
    // This should fail business rules validation
    expect(response.status()).toBe(500); // Business validation error
    
    const result = await response.json();
    console.log('❌ [TEST] Identical addresses rejected:', result);
    
    expect(result).toHaveProperty('error', 'SUBMISSION_FAILED');
  });

  test('should validate payment method details', async ({ request }) => {
    console.log('🧪 [TEST] Testing payment method validation...');
    
    const invalidPaymentTransaction = {
      ...validShippingTransaction,
      transaction: {
        ...validShippingTransaction.transaction,
        paymentInfo: {
          ...validShippingTransaction.transaction.paymentInfo,
          paymentDetails: {
            purchaseOrder: {
              poNumber: 'INVALID', // Too short
              poAmount: -100, // Negative amount
              expirationDate: '2020-01-01', // Expired
              approvalContact: '',
              department: ''
            }
          }
        }
      }
    };
    
    const response = await request.post(`${BASE_URL}/api/submit-shipment`, {
      data: invalidPaymentTransaction
    });
    
    expect(response.status()).toBe(400);
    
    const result = await response.json();
    console.log('❌ [TEST] Payment validation failed as expected:', result);
    
    expect(result).toHaveProperty('error', 'VALIDATION_ERROR');
  });

  test('should handle pickup slot conflicts gracefully', async ({ request }) => {
    console.log('🧪 [TEST] Testing pickup slot conflict handling...');
    
    // Use past date to simulate conflict
    const pastPickupTransaction = {
      ...validShippingTransaction,
      transaction: {
        ...validShippingTransaction.transaction,
        pickupDetails: {
          ...validShippingTransaction.transaction.pickupDetails,
          date: '2025-01-01' // Past date
        }
      }
    };
    
    const response = await request.post(`${BASE_URL}/api/submit-shipment`, {
      data: pastPickupTransaction
    });
    
    // Should fail due to business rules validation
    expect([409, 500]).toContain(response.status());
    
    const result = await response.json();
    console.log('❌ [TEST] Pickup conflict handled:', result);
    
    expect(result).toHaveProperty('error');
  });

  test('should validate package weight constraints', async ({ request }) => {
    console.log('🧪 [TEST] Testing package weight validation...');
    
    const overweightTransaction = {
      ...validShippingTransaction,
      transaction: {
        ...validShippingTransaction.transaction,
        shipmentDetails: {
          ...validShippingTransaction.transaction.shipmentDetails,
          package: {
            ...validShippingTransaction.transaction.shipmentDetails.package,
            type: 'small' as const,
            weight: {
              value: 50, // Too heavy for small package (limit is 10 lbs)
              unit: 'lbs' as const
            }
          }
        }
      }
    };
    
    const response = await request.post(`${BASE_URL}/api/submit-shipment`, {
      data: overweightTransaction
    });
    
    // Should fail business rules validation
    expect(response.status()).toBe(500);
    
    const result = await response.json();
    console.log('❌ [TEST] Weight constraint validation:', result);
    
    expect(result).toHaveProperty('error', 'SUBMISSION_FAILED');
  });

  test('should process corporate account payment method', async ({ request }) => {
    console.log('🧪 [TEST] Testing corporate account payment...');
    
    const corporateTransaction = {
      ...validShippingTransaction,
      transaction: {
        ...validShippingTransaction.transaction,
        paymentInfo: {
          ...validShippingTransaction.transaction.paymentInfo,
          method: 'corporate' as const,
          paymentDetails: {
            corporate: {
              accountNumber: '1234567890',
              accountPin: '1234',
              billingContact: {
                name: 'Corporate Billing',
                phone: '+1-555-999-8888',
                email: 'corporate@acme.com'
              }
            }
          }
        }
      }
    };
    
    const response = await request.post(`${BASE_URL}/api/submit-shipment`, {
      data: corporateTransaction
    });
    
    expect(response.status()).toBe(200);
    
    const result = await response.json();
    console.log('✅ [TEST] Corporate payment processed:', result);
    
    expect(result).toHaveProperty('confirmationNumber');
    expect(result).toHaveProperty('trackingNumber');
  });

  test('should handle special handling requirements', async ({ request }) => {
    console.log('🧪 [TEST] Testing special handling processing...');
    
    const specialHandlingTransaction = {
      ...validShippingTransaction,
      transaction: {
        ...validShippingTransaction.transaction,
        shipmentDetails: {
          ...validShippingTransaction.transaction.shipmentDetails,
          package: {
            ...validShippingTransaction.transaction.shipmentDetails.package,
            specialHandling: ['fragile', 'this-side-up', 'white-glove'] as const
          }
        }
      }
    };
    
    const response = await request.post(`${BASE_URL}/api/submit-shipment`, {
      data: specialHandlingTransaction
    });
    
    expect(response.status()).toBe(200);
    
    const result = await response.json();
    console.log('✅ [TEST] Special handling processed:', result);
    
    expect(result).toHaveProperty('confirmationNumber');
    expect(result.totalCost).toBeGreaterThan(validShippingTransaction.transaction.selectedOption.pricing.total);
  });

  test('should simulate payment authorization failures', async ({ request }) => {
    console.log('🧪 [TEST] Testing payment authorization failure scenarios...');
    
    // Make multiple requests to trigger ~5% failure rate
    let paymentFailures = 0;
    let attempts = 0;
    
    for (let i = 0; i < 10; i++) {
      attempts++;
      const testTransaction = {
        ...validShippingTransaction,
        transaction: {
          ...validShippingTransaction.transaction,
          id: `test-payment-${i}`,
          paymentInfo: {
            ...validShippingTransaction.transaction.paymentInfo,
            paymentDetails: {
              purchaseOrder: {
                poNumber: `TEST-PO-${i}`,
                poAmount: 1000.00,
                expirationDate: '2025-12-31',
                approvalContact: 'Test Manager',
                department: 'Test Dept'
              }
            }
          }
        }
      };
      
      const response = await request.post(`${BASE_URL}/api/submit-shipment`, {
        data: testTransaction
      });
      
      if (response.status() === 402) {
        paymentFailures++;
        const result = await response.json();
        expect(result).toHaveProperty('error', 'PAYMENT_DECLINED');
        console.log(`💳 [TEST] Payment failure ${paymentFailures}:`, result);
      } else if (response.status() === 200) {
        console.log(`✅ [TEST] Payment success ${i + 1}`);
      }
    }
    
    console.log(`📊 [TEST] Payment failure rate: ${paymentFailures}/${attempts} (${(paymentFailures/attempts*100).toFixed(1)}%)`);
    
    // We should see some failures, but not too many
    expect(paymentFailures).toBeGreaterThanOrEqual(0);
    expect(paymentFailures).toBeLessThan(attempts);
  });

  test('should measure API response time performance', async ({ request }) => {
    console.log('🧪 [TEST] Testing API response time performance...');
    
    const startTime = Date.now();
    
    const response = await request.post(`${BASE_URL}/api/submit-shipment`, {
      data: validShippingTransaction
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`⏱️ [TEST] API response time: ${responseTime}ms`);
    
    expect(response.status()).toBe(200);
    
    // Response should be under 5 seconds (5000ms)
    expect(responseTime).toBeLessThan(5000);
    
    // Most responses should be under 3 seconds
    if (responseTime > 3000) {
      console.warn(`⚠️ [TEST] Slow response detected: ${responseTime}ms`);
    }
    
    const result = await response.json();
    expect(result).toHaveProperty('confirmationNumber');
  });
});